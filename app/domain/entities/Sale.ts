export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  clientDni: string;
  clientName: string;
  date: string;
  items: SaleItem[];
  total: number;
  invoiced: boolean;
} 