import type { Knex } from "knex";
import type { Closure, PaymentBreakdown, PaymentMethodBreakdown } from "@models/closure.model";
import type { SaleItem, Payment, Change } from "@models/sale.model";

// Helper function to ensure numeric fields in PaymentMethodBreakdown are numbers
function parsePaymentMethodBreakdown(data: any): PaymentMethodBreakdown {
  if (!data) {
    return { debit: 0, cash: 0, exchange: 0, transfer: 0, other: 0 };
  }
  return {
    debit: parseFloat(data.debit || '0') || 0,
    cash: parseFloat(data.cash || '0') || 0,
    exchange: parseFloat(data.exchange || '0') || 0,
    transfer: parseFloat(data.transfer || '0') || 0,
    other: parseFloat(data.other || '0') || 0,
  };
}

// Helper function to ensure numeric fields in PaymentBreakdown are numbers
function parseClosurePaymentBreakdown(paymentBreakdown: any): PaymentBreakdown {
  if (!paymentBreakdown) {
    return {
      payments: { debit: 0, cash: 0, exchange: 0, transfer: 0, other: 0 },
      changes: { debit: 0, cash: 0, exchange: 0, transfer: 0, other: 0 },
      extraBalance: 0,
    };
  }

  return {
    payments: parsePaymentMethodBreakdown(paymentBreakdown.payments || {}),
    changes: parsePaymentMethodBreakdown(paymentBreakdown.changes || {}),
    extraBalance: parseFloat(paymentBreakdown.extraBalance || '0') || 0,
  };
}

export class ClosureRepository {
  constructor(private db: Knex) {}
  private static readonly TABLE = "closures";

  async create(closure: Omit<Closure, "id" | "created_at" | "updated_at">) {
    const [created] = await this.db<Closure>(ClosureRepository.TABLE)
      .insert(closure)
      .returning("*");
    
    // SQLite retorna JSON como string, necesitamos parsearlo y asegurar que los números sean números
    if (created) {
      if (typeof created.paymentBreakdown === 'string') {
        created.paymentBreakdown = JSON.parse(created.paymentBreakdown);
      }
      created.paymentBreakdown = parseClosurePaymentBreakdown(created.paymentBreakdown);
    }
    
    return created;
  }

  async getSalesWithoutClosureWithRelations() {
    // Obtener todas las ventas sin cierre con todos sus datos relacionados usando subconsultas escalares
    // para evitar duplicados por producto cartesiano en múltiples JOINs
    const rawData = await this.db("sales")
      .select([
        "sales.*",
        // Subconsulta para items usando json_group_array
        this.db.raw(`(
          SELECT json_group_array(json_object('id', id, 'saleId', saleId, 'productId', productId, 'qty', qty, 'priceLocal', priceLocal, 'priceExchange', priceExchange, 'priceCExchange', priceCExchange))
          FROM sale_items
          WHERE saleId = sales.id
        ) as items`),
        // Subconsulta para payments usando json_group_array
        this.db.raw(`(
          SELECT json_group_array(json_object('id', id, 'saleId', saleId, 'method', method, 'amount', amount, 'reference', reference, 'concept', concept))
          FROM sale_payments
          WHERE saleId = sales.id
        ) as payments`),
        // Subconsulta para changes usando json_group_array
        this.db.raw(`(
          SELECT json_group_array(json_object('id', id, 'saleId', saleId, 'method', method, 'amount', amount, 'reference', reference, 'concept', concept))
          FROM sale_changes
          WHERE saleId = sales.id
        ) as changes`)
      ])
      .whereNull("sales.closureId")
      .orderBy("sales.created_at", "asc");

    // Procesar los datos para parsear los JSONs y manejar casos donde no hay relaciones
    return rawData.map((row: any) => {
      // Parsear los JSONs, filtrando nulls, eliminando duplicados por id y convirtiendo a objetos
      const items = row.items && row.items[0] !== null 
        ? JSON.parse(row.items)
            .filter((item: any) => item.id !== null)
            // Eliminar duplicados por id usando Map
            .filter((item: any, index: number, self: any[]) => 
              index === self.findIndex((i: any) => i.id === item.id)
            )
        : [];
      
      const payments = row.payments && row.payments[0] !== null
        ? JSON.parse(row.payments)
            .filter((payment: any) => payment.id !== null)
            // Eliminar duplicados por id usando Map
            .filter((payment: any, index: number, self: any[]) => 
              index === self.findIndex((p: any) => p.id === payment.id)
            )
        : [];
      
      const changes = row.changes && row.changes[0] !== null
        ? JSON.parse(row.changes)
            .filter((change: any) => change.id !== null)
            // Eliminar duplicados por id usando Map
            .filter((change: any, index: number, self: any[]) => 
              index === self.findIndex((c: any) => c.id === change.id)
            )
            .map((change: any) => ({
              ...change,
              amount: typeof change.amount === 'number' ? change.amount : parseFloat(change.amount || '0') || 0
            }))
        : [];

      return {
        id: row.id,
        userId: row.userId,
        clientId: row.clientId,
        exchangeId: row.exchangeId,
        closureId: row.closureId,
        totalLocal: row.totalLocal,
        totalExchange: row.totalExchange,
        totalProfitLocal: row.totalProfitLocal,
        totalProfitExchange: row.totalProfitExchange,
        created_at: row.created_at,
        updated_at: row.updated_at,
        items,
        payments,
        changes,
      };
    });
  }

  async updateSalesClosureId(saleIds: number[], closureId: number) {
    return this.db("sales")
      .whereIn("id", saleIds)
      .update({ closureId, updated_at: this.db.fn.now() });
  }

  async getAll(filters: { startDate?: string; endDate?: string; page: number; perPage: number }) {
    const page = filters.page ?? 1;
    const pageSize = filters.perPage ?? 10;

    try {
      let query = this.db("closures")
        .select("closures.*")
        .orderBy("closures.closedAt", "desc");

      // Aplicar filtros de fecha si existen
      if (filters.startDate) {
        query = query.where("closures.closedAt", ">=", `${filters.startDate} 00:00:00`);
      }
      if (filters.endDate) {
        query = query.where("closures.closedAt", "<=", `${filters.endDate} 23:59:59`);
      }

      // Query para obtener el total
      let countQuery = this.db("closures");
      if (filters.startDate) {
        countQuery = countQuery.where("closures.closedAt", ">=", `${filters.startDate} 00:00:00`);
      }
      if (filters.endDate) {
        countQuery = countQuery.where("closures.closedAt", "<=", `${filters.endDate} 23:59:59`);
      }

      // Obtener datos paginados y total
      const [data, [{ count }]] = await Promise.all([
        query.clone().limit(pageSize).offset((page - 1) * pageSize),
        countQuery.count<{ count: string }[]>("* as count"),
      ]);

      // Parsear JSON en los datos y asegurar que los números sean números
      const parsedData = data.map((row: any) => {
        if (row.paymentBreakdown && typeof row.paymentBreakdown === 'string') {
          row.paymentBreakdown = JSON.parse(row.paymentBreakdown);
        }
        row.paymentBreakdown = parseClosurePaymentBreakdown(row.paymentBreakdown);
        return row;
      });

      return {
        data: parsedData,
        total: Number(count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(count) / pageSize),
      };
    } catch (e: any) {
      console.error("Error ClosureRepository.getAll", e);
      throw e;
    }
  }

  async getSalesCountByClosure(closureIds: number[]) {
    const results = await this.db("sales")
      .select("closureId")
      .count("* as count")
      .whereIn("closureId", closureIds)
      .groupBy("closureId");

    // Convertir a un mapa para acceso rápido
    const countMap = results.reduce((acc, row) => {
      acc[row.closureId] = Number(row.count);
      return acc;
    }, {} as Record<number, number>);

    return countMap;
  }
}

