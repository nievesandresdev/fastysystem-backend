// src/repositories/product.repository.ts
import type { Knex } from 'knex';
import type { Exchange, ExchangeWithCoin } from '@models/exchange.model';

export class ExchangeRepository {
    
  private static readonly TABLE = 'exchanges';
  private static readonly COINTABLE = 'coins';

  constructor(private db: Knex) {}

  async create(exchange: Omit<Exchange, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const [created] = await this.db<Exchange>(ExchangeRepository.TABLE)
        .insert(exchange)
        .returning('*');
      return created;
    } catch (e: any) {
      console.error('Error ExchangeRepository.create', e);
      throw e;
    }
  }

 /**
 * Reemplaza una exchange: desactiva la actual y crea una nueva.
 */
  async replace(
    id: number,
    newExchange: Omit<Exchange, 'id' | 'created_at' | 'updated_at'>
  ) {
    return this.db.transaction(async trx => {
      try {
        // 1. Desactivar la actual
        await trx<Exchange>(ExchangeRepository.TABLE)
          .where({ id })
          .update({ active: false });

        // 2. Crear la nueva
        const [created] = await trx<Exchange>(ExchangeRepository.TABLE)
          .insert(newExchange)
          .returning('*');

        return created;
      } catch (e: any) {
        console.error('Error ExchangeRepository.replace', e);
        throw e;
      }
    });
  }

  findActive() {
    try{
      return this.db<ExchangeWithCoin>(ExchangeRepository.TABLE)
        .select(
          ExchangeRepository.TABLE+'.*',
          ExchangeRepository.COINTABLE+'.name as coinName',
          ExchangeRepository.COINTABLE+'.abbreviation as coinAbbreviation',
          ExchangeRepository.COINTABLE+'.symbol as coinSymbol'
        )
        .join(ExchangeRepository.COINTABLE, ExchangeRepository.TABLE+'.coinId', ExchangeRepository.COINTABLE+'.id')
        .where(ExchangeRepository.TABLE+'.active', 1)
        .orderBy(ExchangeRepository.TABLE+'.created_at', 'desc')
        .first()
    }catch(e:any){
      console.error('error ExchangeRepository.findActive',e);
        throw e;
    }
    
  }

  async findById(id: number) {
    try {
      return await this.db<Exchange>(ExchangeRepository.TABLE)
        .where({ id })
        .first();
    } catch (e: any) {
      console.error('Error ExchangeRepository.findById', e);
      throw e;
    }
  }

}