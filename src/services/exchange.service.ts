// src/services/exchange.service.ts
import type { Exchange } from '@models/exchange.model';
import { ExchangeRepository } from '@repositories/exchange.repository';

export class ExchangeService {
  constructor(private repo: ExchangeRepository) {}

  async create(ExchangeData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    try{
        return this.repo.create({...ExchangeData, active: true});
    }catch(e: any){
        console.log('error ExchangeService.create',e);
        throw new Error(e);        
    }
  }

  async replace(idCurrentExchange: number, ExchangeData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    try{
        return this.repo.replace(idCurrentExchange, {exchange : ExchangeData.exchange, active: true});
    }catch(e: any){
        console.log('error ExchangeService.replace',e);
        throw new Error(e);        
    }
  }

  async findActive() {
    try{
        return this.repo.findActive();
    }catch(e: any){
        console.log( "error ExchangeService.findActive", e);
        throw new Error( e );        
    }
  }

  
}