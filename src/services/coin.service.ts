// src/services/product.service.ts
import type { Coin } from '@models/coin.model';
import { CoinRepository } from '@repositories/coin.repository';

export class CoinService {
  constructor(private repo: CoinRepository) {}

  async getAll() {
    try{
        return this.repo.getAll();
    }catch(e: any){
        console.log( "error CoinService.getAll", e);
        throw new Error( e );        
    }
  }
}