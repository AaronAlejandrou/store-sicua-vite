import { db } from './db';
import type { StoreConfigRepository } from '../../domain/repositories/StoreConfigRepository';
import type { StoreConfig } from '../../domain/entities/StoreConfig';

export class StoreConfigDbAdapter implements StoreConfigRepository {
  async get(): Promise<StoreConfig | null> {
    const configs = await db.configuracion.toArray();
    return configs[0] || null;
  }
  
  async set(config: StoreConfig): Promise<string> {
    await db.configuracion.clear();
    return await db.configuracion.add(config);
  }
} 