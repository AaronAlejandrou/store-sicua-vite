import { config } from '../../config/environment';

/**
 * HTTP Client for SICUA Frontend
 * 
 * Centralized HTTP communication layer that handles all API requests
 * to the Spring Boot backend. Provides consistent error handling,
 * authentication, and request/response processing.
 * 
 * Key Features:
 * - Session-based authentication with credentials
 * - Support for JSON, FormData, and Blob responses
 * - Comprehensive error handling and logging
 * - Automatic base URL resolution (dev/prod)
 * - Cookie-based session management
 * 
 * Authentication Flow:
 * 1. Login sets session cookie via Set-Cookie header
 * 2. All subsequent requests include session cookie automatically
 * 3. Backend validates session on each request
 * 4. Session expires based on backend configuration
 * 
 * @see config/environment.ts for API base URL configuration
 * @see CorsConfig.java for backend CORS settings
 * @see SecurityConfig.java for session management
 */
export class HttpClient {
  private baseUrl: string;

  /**
   * Initialize HTTP client with base URL
   * 
   * @param baseUrl - Optional override for the API base URL
   */
  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.apiBaseUrl;
    
    // Log initialization in development
    if (config.isDevelopment) {
      console.log('🔧 HttpClient initialized with base URL:', this.baseUrl);
    }
  }

  /**
   * Core request method that handles all HTTP operations
   * 
   * @param endpoint - API endpoint (e.g., '/products', '/sales')
   * @param options - Fetch API options with default configurations
   * @returns Promise resolving to the parsed response
   * 
   * Features:
   * - Automatic JSON content-type headers
   * - Session cookie inclusion for authentication
   * - Comprehensive error handling and logging
   * - Response type detection (JSON vs text)
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Development logging for request tracking
    console.log(`HttpClient: Making ${options.method || 'GET'} request to:`, url);
    console.log('Current cookies:', document.cookie);
    
    // Configure request with defaults and user options
    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session management
      ...options,
    };

    try {
      // Execute the HTTP request
      const response = await fetch(url, requestConfig);
      
      // Log response status for debugging
      console.log(`HttpClient: Response status for ${url}:`, response.status);
      
      // Handle error responses
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`HttpClient: Error response for ${url}:`, errorData);
        throw new Error(`HTTP Error ${response.status}: ${errorData}`);
      }

      // Parse response based on content type
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      // Fallback to text for non-JSON responses
      return response.text() as T;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  /**
   * GET request method
   * 
   * @param endpoint - API endpoint
   * @returns Promise resolving to the response data
   * 
   * Usage: await client.get<Product[]>('/products')
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request method
   * 
   * @param endpoint - API endpoint
   * @param data - Request body data (will be JSON stringified)
   * @returns Promise resolving to the response data
   * 
   * Usage: await client.post<Product>('/products', newProduct)
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request method
   * 
   * @param endpoint - API endpoint
   * @param data - Request body data (will be JSON stringified)
   * @returns Promise resolving to the response data
   * 
   * Usage: await client.put<Product>('/products/1', updatedProduct)
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request method
   * 
   * @param endpoint - API endpoint
   * @returns Promise resolving to the response data
   * 
   * Usage: await client.delete('/products/1')
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * POST FormData request method
   * 
   * Used for file uploads and multipart form submissions.
   * Does not set Content-Type header to allow browser to set multipart boundary.
   * 
   * @param endpoint - API endpoint
   * @param formData - FormData object containing files and form fields
   * @returns Promise resolving to the response data
   * 
   * Usage: 
   * const formData = new FormData();
   * formData.append('file', fileBlob);
   * await client.postFormData<ImportResult>('/excel/import', formData)
   */
  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`HttpClient: Making POST FormData request to:`, url);
    
    // Note: Don't set Content-Type for FormData - browser sets multipart boundary
    const requestConfig: RequestInit = {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies for session management
    };

    try {
      const response = await fetch(url, requestConfig);
      
      console.log(`HttpClient: Response status for ${url}:`, response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`HttpClient: Error response for ${url}:`, errorData);
        throw new Error(`HTTP Error ${response.status}: ${errorData}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response.text() as T;
    } catch (error) {
      console.error(`API FormData request failed: ${url}`, error);
      throw error;
    }
  }

  /**
   * GET Blob request method
   * 
   * Used for downloading binary files (images, documents, etc.).
   * Returns the raw blob data without headers.
   * 
   * @param endpoint - API endpoint that returns binary data
   * @returns Promise resolving to the blob data
   * 
   * Usage: const blob = await client.getBlob('/files/report.pdf')
   */
  async getBlob(endpoint: string): Promise<Blob> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`HttpClient: Making GET Blob request to:`, url);
    
    const requestConfig: RequestInit = {
      method: 'GET',
      credentials: 'include', // Include cookies for session management
    };

    try {
      const response = await fetch(url, requestConfig);
      
      console.log(`HttpClient: Response status for ${url}:`, response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`HttpClient: Error response for ${url}:`, errorData);
        throw new Error(`HTTP Error ${response.status}: ${errorData}`);
      }

      return await response.blob();
    } catch (error) {
      console.error(`API Blob request failed: ${url}`, error);
      throw error;
    }
  }

  /**
   * GET Blob with Headers request method
   * 
   * Used for downloading files where response headers are needed
   * (e.g., Content-Disposition for filename extraction).
   * Specifically designed for Excel exports and file downloads.
   * 
   * @param endpoint - API endpoint that returns binary data with headers
   * @returns Promise resolving to blob data and response headers
   * 
   * Usage: 
   * const { blob, headers } = await client.getBlobWithHeaders('/excel/export');
   * const filename = extractFilenameFromHeaders(headers);
   * downloadBlob(blob, filename);
   */
  async getBlobWithHeaders(endpoint: string): Promise<{ blob: Blob; headers: Headers }> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`HttpClient: Making GET Blob with headers request to:`, url);
    
    const requestConfig: RequestInit = {
      method: 'GET',
      credentials: 'include', // Include cookies for session management
    };

    try {
      const response = await fetch(url, requestConfig);
      
      console.log(`HttpClient: Response status for ${url}:`, response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`HttpClient: Error response for ${url}:`, errorData);
        throw new Error(`HTTP Error ${response.status}: ${errorData}`);
      }

      const blob = await response.blob();
      return { blob, headers: response.headers };
    } catch (error) {
      console.error(`API Blob with headers request failed: ${url}`, error);
      throw error;
    }
  }
}

/**
 * Default HTTP client instance
 * 
 * Pre-configured client ready for use throughout the application.
 * Uses the environment configuration for base URL determination.
 * 
 * Usage: import { httpClient } from './HttpClient';
 */
export const httpClient = new HttpClient();
