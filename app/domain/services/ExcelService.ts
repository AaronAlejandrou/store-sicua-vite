export interface ExcelImportResponse {
  totalProcessed: number;
  successfulImports: number;
  categoriesCreated: number;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface SalesExportRequest {
  dateFilterType: 'all' | 'dateRange' | 'month';
  startDate?: string;
  endDate?: string;
  selectedMonth?: string;
  statusFilter: 'todas' | 'porFacturar' | 'facturadas';
}

export interface ExcelService {
  importProducts(file: File): Promise<ExcelImportResponse>;
  downloadTemplate(): Promise<void>;
  exportInventory(): Promise<void>;
  exportFilteredSales(filters: SalesExportRequest): Promise<void>;
}
