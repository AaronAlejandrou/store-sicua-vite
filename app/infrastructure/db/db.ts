import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Product } from '../../domain/entities/Product';
import type { Sale } from '../../domain/entities/Sale';
import type { StoreConfig } from '../../domain/entities/StoreConfig';

export class StoreDatabase extends Dexie {
  productos!: Table<Product, string>;
  ventas!: Table<Sale, string>;
  configuracion!: Table<StoreConfig, string>;

  constructor() {
    super('StoreSicuaDB');
    this.version(1).stores({
      productos: 'productId, name, brand, category, size, price, quantity',
      ventas: 'id, clientDni, clientName, date, total, invoiced',
      configuracion: 'name, address, email, phone'
    });
  }
}

export const db = new StoreDatabase();