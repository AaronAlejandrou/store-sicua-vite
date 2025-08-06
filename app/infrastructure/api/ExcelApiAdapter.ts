import { HttpClient } from '../http/HttpClient';
import type { ExcelService, ExcelImportResponse } from '../../domain/services/ExcelService';

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
      const blob = await this.httpClient.getBlob('/products/excel/template');
      this.downloadFile(blob, 'plantilla_productos.xlsx');
    } catch (error) {
      console.error('Error downloading Excel template:', error);
      throw new Error('Error descargando plantilla de Excel');
    }
  }

  async exportInventory(): Promise<void> {
    try {
      const blob = await this.httpClient.getBlob('/products/excel/export');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `inventario_${timestamp}.xlsx`;
      this.downloadFile(blob, filename);
    } catch (error) {
      console.error('Error exporting inventory:', error);
      throw new Error('Error exportando inventario');
    }
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
