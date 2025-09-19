// src/repositories/product.repository.ts
import type { Knex } from 'knex';
import type { MeasurementUnit } from '@models/measurementUnit.model';

export class MeasurementUnitRepository {
  constructor(private db: Knex) {}

  async getAll() {
    try {
          return this.db<MeasurementUnit>('measurement_units').select('*');
    } catch (e: any) {
      console.error('Error MeasurementUnitRepository.getAll', e);
      throw e;
    }
  }
}