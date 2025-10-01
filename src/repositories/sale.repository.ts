import type { Knex } from "knex";
import type { Sale, SaleItem, Payment, Change } from "@models/sale.model";

export class SaleRepository {
  constructor(private db: Knex) {}
  private static readonly TABLE = "sales";
  private static readonly SALEITEMS_TABLE = "sale_items";
  private static readonly SALEPAYMENTS_TABLE = "sale_payments";
  private static readonly SALECHANGES_TABLE = "sale_changes";

  async createSale(sale: Omit<Sale, "id" | "created_at" | "updated_at">) {
    const [created] = await this.db<Sale>(SaleRepository.TABLE)
      .insert(sale)
      .returning("*");
    return created;
  }

  async createItems(items: Omit<SaleItem, "id">[]) {
    return this.db<SaleItem>(SaleRepository.SALEITEMS_TABLE).insert(items);
  }

  async createPayments(payments: Omit<Payment, "id">[]) {
    return this.db<Payment>(SaleRepository.SALEPAYMENTS_TABLE).insert(payments);
  }

  async createChanges(changes: Omit<Change, "id">[]) {
    return this.db<Change>(SaleRepository.SALECHANGES_TABLE).insert(changes);
  }
}
