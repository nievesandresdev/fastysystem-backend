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

  async getSalesStats(startDate: string, endDate: string) {
    // Convertir las fechas para incluir todo el día
    const startDateTime = `${startDate} 00:00:00`;
    const endDateTime = `${endDate} 23:59:59`;
    
    return this.db<Sale>(SaleRepository.TABLE)
      .select('*')
      .whereBetween('created_at', [startDateTime, endDateTime])
      .orderBy('created_at', 'desc');
  }

  async getMonthlyStats(startDate: string, endDate: string) {
    const startDateTime = `${startDate} 00:00:00`;
    const endDateTime = `${endDate} 23:59:59`;
    
    // Obtener ganancias por mes (sumando totalProfitExchange de cada venta)
    // Solo consultamos ventas, no calculamos nada, solo sumamos lo que ya está guardado
    const monthlySales = await this.db(SaleRepository.TABLE)
      .select(
        this.db.raw("strftime('%Y-%m', created_at) as month"),
        this.db.raw("SUM(CAST(totalProfitExchange AS REAL)) as totalProfit")
      )
      .whereBetween('created_at', [startDateTime, endDateTime])
      .groupBy(this.db.raw("strftime('%Y-%m', created_at)"))
      .orderBy('month', 'asc');

    // Obtener cantidad total de productos vendidos por mes
    // Sumamos la cantidad (qty) de todos los items relacionados a las ventas del período
    const monthlyProducts = await this.db(SaleRepository.SALEITEMS_TABLE)
      .join(SaleRepository.TABLE, 'sale_items.saleId', '=', 'sales.id')
      .select(
        this.db.raw("strftime('%Y-%m', sales.created_at) as month"),
        this.db.raw("SUM(sale_items.qty) as totalProducts")
      )
      .whereBetween('sales.created_at', [startDateTime, endDateTime])
      .groupBy(this.db.raw("strftime('%Y-%m', sales.created_at)"))
      .orderBy('month', 'asc');

    // Crear mapas para combinar los datos
    const salesMap = new Map(monthlySales.map((s: any) => [s.month, parseFloat(s.totalProfit) || 0]));
    const productsMap = new Map(monthlyProducts.map((p: any) => [p.month, Math.round(parseFloat(p.totalProducts) || 0)]));

    // Obtener todos los meses únicos de ambas consultas
    const allMonths = new Set([
      ...monthlySales.map((s: any) => s.month),
      ...monthlyProducts.map((p: any) => p.month)
    ]);

    // Combinar los datos por mes
    return Array.from(allMonths)
      .sort()
      .map(month => ({
        month,
        totalProfit: salesMap.get(month) || 0,
        totalProducts: productsMap.get(month) || 0
      }));
  }

  async getCurrentPeriodStats() {
    // Obtener la venta más antigua sin closureId
    const oldestSale = await this.db<Sale>(SaleRepository.TABLE)
      .select('created_at')
      .whereNull('closureId')
      .orderBy('created_at', 'asc')
      .first();

    // Si no hay ventas sin closureId, usar la fecha actual a las 00:00:00
    const now = new Date();
    const startDate = oldestSale 
      ? new Date(oldestSale.created_at)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    
    const endDate = now;

    // Obtener estadísticas de ventas sin closureId en una sola consulta
    const statsResult = await this.db<Sale>(SaleRepository.TABLE)
      .whereNull('closureId')
      .select(
        this.db.raw('COUNT(*) as transactionCount'),
        this.db.raw('COALESCE(SUM(CAST(totalLocal AS REAL)), 0) as totalLocal'),
        this.db.raw('COALESCE(SUM(CAST(totalExchange AS REAL)), 0) as totalExchange')
      )
      .first() as any;

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      transactionCount: parseInt(statsResult?.transactionCount) || 0,
      totalLocal: parseFloat(statsResult?.totalLocal) || 0,
      totalExchange: parseFloat(statsResult?.totalExchange) || 0
    };
  }

  async getTopProductsAndLowStock() {
    // Obtener los 10 productos más vendidos
    const topProducts = await this.db(SaleRepository.SALEITEMS_TABLE)
      .join('products', 'sale_items.productId', '=', 'products.id')
      .select(
        'products.id',
        'products.name',
        'products.codigo',
        this.db.raw('SUM(sale_items.qty) as totalSold')
      )
      .where('products.active', 1)
      .where('products.del', 0)
      .groupBy('products.id', 'products.name', 'products.codigo')
      .orderBy('totalSold', 'desc')
      .limit(10);

    // Obtener productos con stock bajo (stock <= minStock)
    const lowStockProducts = await this.db('products')
      .select('id', 'name', 'codigo', 'stock', 'minStock')
      .where('active', 1)
      .where('del', 0)
      .whereRaw('stock <= minStock')
      .orderBy('stock', 'asc');

    return {
      topProducts: topProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        codigo: p.codigo,
        totalSold: parseInt(p.totalSold) || 0
      })),
      lowStockProducts: lowStockProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        codigo: p.codigo,
        stock: parseFloat(p.stock) || 0,
        minStock: parseFloat(p.minStock) || 0
      }))
    };
  }
}
