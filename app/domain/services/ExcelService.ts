export interface ExcelImportResponse {
  totalProcessed: number;
  successfulImports: number;
  categoriesCreated: number;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface ExcelService {
  importProducts(file: File): Promise<ExcelImportResponse>;
  downloadTemplate(): Promise<void>;
  exportInventory(): Promise<void>;
}
