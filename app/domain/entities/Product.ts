export interface Product {
  productId: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  productId: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  quantity: number;
}

export interface UpdateProductRequest {
  name: string;
  brand: string;
  category: string;
  price: number;
  quantity: number;
} 