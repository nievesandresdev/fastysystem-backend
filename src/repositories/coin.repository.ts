// src/repositories/product.repository.ts
import type { Knex } from 'knex';
import type { Coin } from '@models/coin.model';

export class CoinRepository {

  private static readonly TABLE = 'coins';
  constructor(private db: Knex) {}

  async getAll() {
    try {
          return this.db<Coin>(CoinRepository.TABLE).select('*');
    } catch (e: any) {
      console.error('Error CoinRepository.getAll', e);
      throw e;
    }
  }
}