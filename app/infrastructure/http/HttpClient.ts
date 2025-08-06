import { config } from '../../config/environment';

/**
 * HTTP Client for API communication
 */
export class HttpClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.apiBaseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`HttpClient: Making ${options.method || 'GET'} request to:`, url);
    console.log('Current cookies:', document.cookie);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session management
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
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
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`HttpClient: Making POST FormData request to:`, url);
    
    const config: RequestInit = {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies for session management
    };

    try {
      const response = await fetch(url, config);
      
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

  async getBlob(endpoint: string): Promise<Blob> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`HttpClient: Making GET Blob request to:`, url);
    
    const config: RequestInit = {
      method: 'GET',
      credentials: 'include', // Include cookies for session management
    };

    try {
      const response = await fetch(url, config);
      
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
}

export const httpClient = new HttpClient();
