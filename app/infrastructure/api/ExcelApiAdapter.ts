import { HttpClient } from '../http/HttpClient';
import type { ExcelService, ExcelImportResponse, SalesExportRequest } from '../../domain/services/ExcelService';

export class ExcelApiAdapter implements ExcelService {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async importProducts(file: File): Promise<ExcelImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.httpClient.postFormData<ExcelImportResponse>('/products/excel/import', formData);
  }

  async downloadTemplate(): Promise<void> {
    try {
      const response = await this.httpClient.getBlobWithHeaders('/products/excel/template');
      const filename = this.extractFilenameFromHeaders(response.headers) || 'plantilla_productos.xlsx';
      this.downloadFile(response.blob, filename);
    } catch (error) {
      console.error('Error downloading Excel template:', error);
      throw new Error('Error descargando plantilla de Excel');
    }
  }

  async exportInventory(): Promise<void> {
    try {
      const response = await this.httpClient.getBlobWithHeaders('/products/excel/export');
      const filename = this.extractFilenameFromHeaders(response.headers) || 'inventario.xlsx';
      this.downloadFile(response.blob, filename);
    } catch (error) {
      console.error('Error exporting inventory:', error);
      throw new Error('Error exportando inventario');
    }
  }

  async exportFilteredSales(filters: SalesExportRequest): Promise<void> {
    try {
      const queryParams = new URLSearchParams();
      
      queryParams.append('dateFilterType', filters.dateFilterType);
      queryParams.append('statusFilter', filters.statusFilter);
      
      if (filters.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        queryParams.append('endDate', filters.endDate);
      }
      if (filters.selectedMonth) {
        queryParams.append('selectedMonth', filters.selectedMonth);
      }

      const url = `/sales/excel/export?${queryParams.toString()}`;
      const response = await this.httpClient.getBlobWithHeaders(url);
      const filename = this.extractFilenameFromHeaders(response.headers) || 'ventas.xlsx';
      
      this.downloadFile(response.blob, filename);
    } catch (error) {
      console.error('Error exporting filtered sales:', error);
      throw new Error('Error exportando ventas filtradas');
    }
  }

  private extractFilenameFromHeaders(headers: Headers): string | null {
    const contentDisposition = headers.get('Content-Disposition');
    if (!contentDisposition) return null;
    
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (!filenameMatch) return null;
    
    let filename = filenameMatch[1];
    // Remove quotes if present
    if (filename.charAt(0) === '"' && filename.charAt(filename.length - 1) === '"') {
      filename = filename.slice(1, -1);
    }
    
    return filename;
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
