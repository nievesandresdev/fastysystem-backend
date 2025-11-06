import type { SaveSaleRequest } from '@models/sale.model';
import { SaleRepository } from "@repositories/sale.repository";
import { ProductRepository } from "@repositories/product.repository";
import { ExchangeRepository } from "@repositories/exchange.repository";
import { ExpenseRepository } from "@repositories/expense.repository";

export class SaleService {
  constructor(private repo: SaleRepository) {}

  async save(req: SaveSaleRequest) {
    return this.repo["db"].transaction(async (trx) => {
      const saleRepo = new SaleRepository(trx);
      const exchangeRepo = new ExchangeRepository(trx);
      // console.log('req',req)
      
      // Obtener la tasa de cambio actual
      const currentExchange = await exchangeRepo.findById(req.exchangeId);
      if (!currentExchange) {
        throw new Error('Exchange rate not found');
      }
      
      // Calcular ganancias totales
      let totalProfitLocal = 0;
      let totalProfitExchange = 0;
      
      for (const item of req.itemslist) {
        const profitPerUnitExchange = item.priceExchange - item.priceCExchange;
        const profitPerUnitLocal = profitPerUnitExchange * currentExchange.exchange;
        
        totalProfitExchange += profitPerUnitExchange * item.qty;
        totalProfitLocal += profitPerUnitLocal * item.qty;
      }
      
      const sale = await saleRepo.createSale({
        userId: req.userId,
        clientId: req.clientId,
        exchangeId: req.exchangeId,
        totalLocal: req.totalLocal,
        totalExchange: req.totalExchange,
        totalProfitLocal: totalProfitLocal.toFixed(2),
        totalProfitExchange: totalProfitExchange.toFixed(2),
        // created_at: new Date().toISOString(),
        // updated_at: new Date().toISOString(),
      });

      await saleRepo.createItems(
        req.itemslist.map((i) => ({
          saleId: sale.id,
          productId: i.id,
          qty: i.qty,
          priceLocal: i.priceLocal,
          priceExchange: i.priceExchange,
          priceCExchange: i.priceCExchange,
        }))
      );
      //restar stock
      const productRepo = new ProductRepository(trx);
      for (const i of req.itemslist) {
        await productRepo.decrementStock(i.id, i.qty);
      }

      await saleRepo.createPayments(
        Object.entries(req.payments).map(([method, p]) => ({
          saleId: sale.id,
          method,
          amount: p.amount,
          reference: p.reference,
          concept: p.concept,
        }))
      );
      if(Object.keys(req.change).length){
        await saleRepo.createChanges(
          Object.entries(req.change).map(([method, c]) => ({
            saleId: sale.id,
            method,
            amount: parseFloat(c.amount),
            reference: c.reference,
            concept: c.concept,
          }))
        );
      }
      return sale;
    });
  }

  async getSalesStats(startDate: string, endDate: string) {
    const sales = await this.repo.getSalesStats(startDate, endDate);
    
    // Calcular totales
    let totalProfitLocal = 0;
    let totalProfitExchange = 0;
    let totalSalesLocal = 0;
    let totalSalesExchange = 0;

    sales.forEach(sale => {
      totalProfitLocal += parseFloat(sale.totalProfitLocal);
      totalProfitExchange += parseFloat(sale.totalProfitExchange);
      totalSalesLocal += parseFloat(sale.totalLocal);
      totalSalesExchange += parseFloat(sale.totalExchange);
    });

    return {
      sales,
      summary: {
        totalSalesLocal: totalSalesLocal.toFixed(2),
        totalSalesExchange: totalSalesExchange.toFixed(2),
        totalProfitLocal: totalProfitLocal.toFixed(2),
        totalProfitExchange: totalProfitExchange.toFixed(2),
        salesCount: sales.length
      }
    };
  }

  async getMonthlyReport(startDate: string, endDate: string) {
    // Obtener estadísticas mensuales de ventas
    const salesMonthly = await this.repo.getMonthlyStats(startDate, endDate);
    
    // Obtener gastos mensuales
    const expenseRepo = new ExpenseRepository(this.repo["db"]);
    const expensesMonthly = await expenseRepo.getMonthlyExpenses(startDate, endDate);

    // Crear un mapa de meses para combinar datos
    const monthMap = new Map<string, { month: string; totalProducts: number; totalProfit: number; totalExpenses: number }>();

    // Procesar datos de ventas
    salesMonthly.forEach(item => {
      monthMap.set(item.month, {
        month: item.month,
        totalProducts: item.totalProducts,
        totalProfit: item.totalProfit,
        totalExpenses: 0
      });
    });

    // Procesar datos de gastos
    expensesMonthly.forEach(item => {
      const existing = monthMap.get(item.month);
      if (existing) {
        existing.totalExpenses = item.amount;
      } else {
        monthMap.set(item.month, {
          month: item.month,
          totalProducts: 0,
          totalProfit: 0,
          totalExpenses: item.amount
        });
      }
    });

    // Convertir a array y ordenar por mes
    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }

  async getCurrentPeriodStats() {
    return this.repo.getCurrentPeriodStats();
  }

  async getTopProductsAndLowStock() {
    return this.repo.getTopProductsAndLowStock();
  }
}
