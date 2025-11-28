// src/services/exchange.service.ts
import type { Exchange, ExchangeWithCoin } from '@models/exchange.model';
import { ExchangeRepository } from '@repositories/exchange.repository';

export class ExchangeService {
  constructor(private repo: ExchangeRepository) {}

  async create(exchangeData: Omit<Exchange, 'id' | 'created_at' | 'updated_at'>): Promise<ExchangeWithCoin> {
    try {
      await this.repo.create({ ...exchangeData, active: true });
      const current = await this.repo.findActive();

      if (!current) {
        throw new Error('No se pudo obtener la tasa activa después de crearla');
      }

      return current;
    } catch (e: any) {
      console.log('error ExchangeService.create', e);
      throw new Error(e);
    }
  }

  async replace(
    idCurrentExchange: number,
    exchangeData: Omit<Exchange, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ExchangeWithCoin> {
    try {
      await this.repo.replace(idCurrentExchange, {
        exchange: exchangeData.exchange,
        active: true,
        coinId: exchangeData.coinId,
      });

      const current = await this.repo.findActive();

      if (!current) {
        throw new Error('No se pudo obtener la tasa activa después de actualizarla');
      }

      return current;
    } catch (e: any) {
      console.log('error ExchangeService.replace', e);
      throw new Error(e);
    }
  }

  async findActive() {
    try {
      return this.repo.findActive();
    } catch (e: any) {
      console.log('error ExchangeService.findActive', e);
      throw new Error(e);
    }
  }
}