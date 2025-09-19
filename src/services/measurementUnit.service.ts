// src/services/product.service.ts
import type { MeasurementUnit } from '@models/measurementUnit.model';
import { MeasurementUnitRepository } from '@repositories/measurementUnit.repository';

export class MeasurementUnitService {
  constructor(private repo: MeasurementUnitRepository) {}

  async getAll() {
    try{
        return this.repo.getAll();
    }catch(e: any){
        const msgError = "error MeasurementUnitService.getAll";
        console.log( msgError, e);
        throw new Error( msgError );        
    }
  }
}