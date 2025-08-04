export interface Product {
  productId: string;
  name: string;
  brand: string;
  categoryNumber: number | null;
  size: string | null;
  price: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  productId: string;
  name: string;
  brand: string;
  categoryNumber: number | null;
  size: string | null;
  price: number;
  quantity: number;
}

export interface UpdateProductRequest {
  name: string;
  brand: string;
  categoryNumber: number | null;
  size: string | null;
  price: number;
  quantity: number;
} 