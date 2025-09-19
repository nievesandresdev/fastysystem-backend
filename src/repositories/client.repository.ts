import type { Knex } from 'knex';
import type { ClientData } from '@models/client.model';

export class ClientRepository {
  constructor(private db: Knex) {}
  private static readonly TABLE = 'clients';

  async create(client: Omit<ClientData, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const [created] = await this.db<ClientData>(ClientRepository.TABLE)
        .insert(client)
        .returning('*');
      return created;
    } catch (e: any) {
      console.error('Error ClientRepository.create', e);
      throw e;
    }
  }

  async update(client: Omit<ClientData, 'created_at' | 'updated_at'>) {
    try {
      const { id, ...updateData } = client;
      await this.db<ClientData>(ClientRepository.TABLE)
        .where({ document: updateData.document})
         .update({
            ...updateData,
            updated_at: this.db.fn.now()
          });
      return this.getOne({ document: updateData.document });
    } catch (e: any) {
      console.error('Error ClientRepository.update', e);
      throw e;
    }
  }

  async getOne(params: { id?: number; document?: string }) {
    try {
      const query = this.db<ProductWithUnit>(ClientRepository.TABLE)
        .select('*');

      if (params.id) query.where(ClientRepository.TABLE+'.id', params.id);
      else if (params.document) query.where(ClientRepository.TABLE+'.document', params.document);
      else throw new Error('Debe proveer id o document');

      return await query.first();
    } catch (e: any) {
      console.error('Error ClientRepository.getOne', e);
      throw e;
    }
  }

  async getAll(filters: { search: string}) {
    
    const search = filters.search ?? null;
    const pageSize = 8;
    const page = 1;

    try {
      const baseQuery = this.db<ClientData[]>(ClientRepository.TABLE)
        .select('*');

      // aplicar filtros
      const query = this.applyClientsFilters(
        baseQuery.clone(),
        { search }
      ).limit(pageSize).offset((page - 1) * pageSize);

      const countQuery = this.applyClientsFilters(
        this.db(ClientRepository.TABLE)
          .count<{ count: string }[]>('* as count'),
        { search }
      );

      const [data, [{ count }]] = await Promise.all([query, countQuery]);

      return {
        data,
        total: Number(count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(count) / pageSize),
      };
    } catch (e: any) {
      console.error('Error ClientRepository.getAll', e);
      throw e;
    }
  }

  private applyClientsFilters(qb: Knex.QueryBuilder,{ search }: {
      search: string | null
    }
  ) {
    if (search) {
      qb.andWhere((sub) => {
        sub.whereLike(ClientRepository.TABLE+'.document', `%${search}%`)
          .orWhereLike(ClientRepository.TABLE+'.name', `%${search}%`)
          .orWhereLike(ClientRepository.TABLE+'.lastname', `%${search}%`);
      });
    }
    return qb;
  }


  async searchClient(search: string) {

    try {
      if(!search) return [];
      return this.db<ClientData[]>(ClientRepository.TABLE)
        .select('*')
        .andWhere((sub) => {
          sub.whereLike(ClientRepository.TABLE+'.document', `%${search}%`)
            .orWhereLike(ClientRepository.TABLE+'.name', `%${search}%`)
            .orWhereLike(ClientRepository.TABLE+'.lastname', `%${search}%`);
        })
        .limit(8).offset(0);
    } catch (e: any) {
      console.error('Error ClientRepository.searchClient', e);
      throw e;
    }
  }
}