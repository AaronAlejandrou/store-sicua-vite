import { httpClient } from '../http/HttpClient';
import type { StoreConfig } from '../../domain/entities/StoreConfig';
import type { StoreConfigRepository, UpdateStoreConfigRequest } from '../../domain/repositories/StoreConfigRepository';

export class StoreConfigApiAdapter implements StoreConfigRepository {
  async get(): Promise<StoreConfig | null> {
    try {
      console.log('StoreConfigApiAdapter: Making request to /store-config');
      const result = await httpClient.get<StoreConfig>('/store-config');
      console.log('StoreConfigApiAdapter: Got result:', result);
      return result;
    } catch (error) {
      console.error('StoreConfigApiAdapter: Error getting store config:', error);
      return null;
    }
  }

  async update(config: UpdateStoreConfigRequest): Promise<void> {
    await httpClient.put<void>('/store-config', config);
  }
}
