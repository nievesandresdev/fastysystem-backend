// src/repositories/product.repository.ts
import type { Knex } from 'knex';
import type { Product, ProductWithUnit, ProductListFilters } from '@models/product.model';

export class ProductRepository {
  constructor(private db: Knex) {}
  private static readonly TABLE = 'products';

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const [created] = await this.db<Product>(ProductRepository.TABLE)
        .insert(product)
        .returning('*');
      return created;
    } catch (e: any) {
      console.error('Error ProductRepository.create', e);
      throw e;
    }
  }

  async update(product: Omit<Product, 'created_at' | 'updated_at'>) {
    try {
      const productId = product.id;
      const { id, ...updateData } = product;
      await this.db<Product>(ProductRepository.TABLE)
        .where({ id: productId})
         .update({
            ...updateData,
            updated_at: this.db.fn.now()
          });
      return this.getOne({ id: productId });
    } catch (e: any) {
      console.error('Error ProductRepository.update', e);
      throw e;
    }
  }

  async getAll(filters: ProductListFilters) {
    const page = parseInt(filters.page) ?? 1;
    const pageSize = parseInt(filters.perPage) ?? 10;
    const onlyActive = filters.onlyActive === "true";
    const lowStock = filters.lowStock === "true";
    const latest = filters.latest === "true";
    const search = filters.search ?? null;

    try {
      const baseQuery = this.db<ProductWithUnit>(ProductRepository.TABLE)
        .select(
          ProductRepository.TABLE+'.*',
          'units.name as unitName',
          'units.abbreviation as unitAbbreviation'
        )
        .join('measurement_units as units', ProductRepository.TABLE+'.typeStockId', 'units.id');

      // aplicar filtros
      const query = this.applyProductFilters(
        baseQuery.clone(),
        { onlyActive, lowStock, latest, search }
      ).limit(pageSize).offset((page - 1) * pageSize);

      const countQuery = this.applyProductFilters(
        this.db(ProductRepository.TABLE)
          .count<{ count: string }[]>('* as count')
          .join('measurement_units as units', ProductRepository.TABLE+'.typeStockId', 'units.id'),
        { onlyActive, lowStock, latest, search }
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
      console.error('Error ProductRepository.getAll', e);
      throw e;
    }
  }

  private applyProductFilters(qb: Knex.QueryBuilder,{ onlyActive, lowStock, latest, search }: {
      onlyActive: boolean,
      lowStock: boolean,
      latest: boolean,
      search: string | null
    }
  ) {
    qb.where(ProductRepository.TABLE+'.del', 0);

    if (onlyActive) qb.andWhere(ProductRepository.TABLE+'.active', 1);

    if (search) {
      qb.andWhere((sub) => {
        sub.whereLike(ProductRepository.TABLE+'.name', `%${search}%`)
          .orWhereLike(ProductRepository.TABLE+'.codigo', `%${search}%`)
          .orWhereLike(ProductRepository.TABLE+'.description', `%${search}%`);
      });
    }

    if (lowStock) qb.orderBy(ProductRepository.TABLE+'.stock', 'asc');
    if (latest) qb.orderBy(ProductRepository.TABLE+'.id', 'desc');

    return qb;
  }

  async getOne(params: { id?: number; codigo?: string }) {
    try {
      const query = this.db<ProductWithUnit>(ProductRepository.TABLE)
        .select(
          ProductRepository.TABLE+'.*',
          'units.name as unitName',
          'units.abbreviation as unitAbbreviation'
        )
        .join('measurement_units as units', ProductRepository.TABLE+'.typeStockId', 'units.id');

      if (params.id) query.where(ProductRepository.TABLE+'.id', params.id);
      else if (params.codigo) query.where(ProductRepository.TABLE+'.codigo', params.codigo);
      else throw new Error('Debe proveer id o codigo');

      return await query.first();
    } catch (e: any) {
      console.error('Error ProductRepository.getOne', e);
      throw e;
    }
  }

  async delete(productId: number) {
    try {
      await this.db<Product>(ProductRepository.TABLE)
        .where({ id: productId })
        .update({
          del: 1,                 
          updated_at: this.db.fn.now()
        });

      return this.getOne({ id: productId });
    } catch (e: any) {
      console.error('Error ProductRepository.delete', e);
      throw e;
    }
  }

  async searchProduct(search: string) {
  
    try {
      if(!search) return [];
      return this.db<ProductWithUnit>(ProductRepository.TABLE)
        .select(
          ProductRepository.TABLE+'.id',
          ProductRepository.TABLE+'.codigo',
          ProductRepository.TABLE+'.name',
          ProductRepository.TABLE+'.priceRExchange',
          ProductRepository.TABLE+'.stock',
          ProductRepository.TABLE+'.minStock',
          ProductRepository.TABLE+'.active',
          ProductRepository.TABLE+'.del',
          'units.name as unitName',
          'units.abbreviation as unitAbbreviation'
        )
        .join('measurement_units as units', ProductRepository.TABLE+'.typeStockId', 'units.id')
        .where(ProductRepository.TABLE+'.del', 0)
        .where(ProductRepository.TABLE+'.stock','>', 0)
        .andWhere(ProductRepository.TABLE+'.active', 1)
        .andWhere((sub) => {
          sub.whereLike(ProductRepository.TABLE+'.name', `%${search}%`)
            .orWhereLike(ProductRepository.TABLE+'.codigo', `%${search}%`)
        })
        .limit(8).offset(0);
    } catch (e: any) {
      console.error('Error ProductRepository.searchProduct', e);
      throw e;
    }
  }

  async decrementStock(productId: number, qty: number) {
    try {
      await this.db<Product>(ProductRepository.TABLE)
        .where({ id: productId })
        .decrement('stock', qty)
        .update({ updated_at: this.db.fn.now() });

      return this.getOne({ id: productId });
    } catch (e: any) {
      console.error('Error ProductRepository.decrementStock', e);
      throw e;
    }
  }

}
