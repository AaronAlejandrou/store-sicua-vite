import { httpClient } from '../http/HttpClient';
import type { StoreConfig } from '../../domain/entities/StoreConfig';
import type { StoreConfigRepository, UpdateStoreConfigRequest } from '../../domain/repositories/StoreConfigRepository';

export class StoreConfigApiAdapter implements StoreConfigRepository {
  async get(): Promise<StoreConfig | null> {
    try {
      return await httpClient.get<StoreConfig>('/store-config');
    } catch (error) {
      return null;
    }
  }

  async update(config: UpdateStoreConfigRequest): Promise<void> {
    await httpClient.put<void>('/store-config', config);
  }
}
