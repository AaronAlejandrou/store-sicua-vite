import type { StoreConfig } from '../entities/StoreConfig';

export interface StoreConfigRepository {
  get(): Promise<StoreConfig | null>;
  set(config: StoreConfig): Promise<string>;
} 