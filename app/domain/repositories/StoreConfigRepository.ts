import type { StoreConfig } from '../entities/StoreConfig';

export interface UpdateStoreConfigRequest {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface StoreConfigRepository {
  get(): Promise<StoreConfig | null>;
  update(config: UpdateStoreConfigRequest): Promise<void>;
} 