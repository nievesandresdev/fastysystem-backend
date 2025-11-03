import { ClosureRepository } from "@repositories/closure.repository";
import { SaleRepository } from "@repositories/sale.repository";
import { ExchangeRepository } from "@repositories/exchange.repository";
import type { Closure, PaymentBreakdown, PaymentMethodBreakdown } from "@models/closure.model";

interface SaleWithRelations {
  id: number;
  exchangeId: number;
  totalLocal: string;
  totalExchange: string;
  created_at: string;
  items: Array<{ qty: number }>;
  payments: Array<{ method: string; amount: string }>;
  changes: Array<{ method: string; amount: number }>;
}

interface ClosureCalculation {
  totalLocal: string;
  totalExchange: string;
  openAt: string;
  closedAt: string;
  totalProductsSold: number;
  paymentBreakdown: PaymentBreakdown;
}

export class ClosureService {
  constructor(
    private repo: ClosureRepository,
    private saleRepo: SaleRepository,
    private exchangeRepo: ExchangeRepository
  ) {}

  async createClosure() {
    return this.saleRepo["db"].transaction(async (trx) => {
      const closureRepo = new ClosureRepository(trx);
      const exchangeRepo = new ExchangeRepository(trx);

      // Obtener todas las ventas sin cierre con sus relaciones en una sola consulta optimizada
      const salesWithRelations = await closureRepo.getSalesWithoutClosureWithRelations();
      
      if (salesWithRelations.length === 0) {
        throw new Error("No hay ventas para cerrar");
      }

      // Obtener todas las tasas de cambio únicas que se usaron en las ventas
      const uniqueExchangeIds = [...new Set(salesWithRelations.map((s) => s.exchangeId))];
      const exchangeRates = new Map<number, number>();
      for (const exchangeId of uniqueExchangeIds) {
        const exchange = await exchangeRepo.findById(exchangeId);
        if (exchange) {
          exchangeRates.set(exchangeId, exchange.exchange);
        }
      }

      // Calcular los datos del cierre
      const calculation = await this.calculateClosure(salesWithRelations, exchangeRates);
      // Crear el cierre
      const closure = await closureRepo.create({
        totalLocal: calculation.totalLocal,
        totalExchange: calculation.totalExchange,
        totalProductsSold: calculation.totalProductsSold,
        openAt: calculation.openAt,
        closedAt: calculation.closedAt,
        paymentBreakdown: calculation.paymentBreakdown,
      });

      // Actualizar las ventas con el closureId
      const saleIds = salesWithRelations.map((s) => s.id);
      await closureRepo.updateSalesClosureId(saleIds, closure.id);

      return {
        closure,
        salesCount: salesWithRelations.length,
      };
    });
  }

  async getAllClosures(filters: { startDate?: string; endDate?: string; page: number; perPage: number }) {
    const result = await this.repo.getAll(filters);
    return result;
  }

  private async calculateClosure(
    sales: SaleWithRelations[],
    exchangeRates: Map<number, number>
  ): Promise<ClosureCalculation> {
    let totalLocal = 0;
    let totalExchange = 0;
    let totalProductsSold = 0;

    const paymentsBreakdown: PaymentMethodBreakdown = {
      debit: 0,
      cash: 0,
      exchange: 0,
      transfer: 0,
      other: 0,
    };

    const changesBreakdown: PaymentMethodBreakdown = {
      debit: 0,
      cash: 0,
      exchange: 0,
      transfer: 0,
      other: 0,
    };

    let totalBalance = 0; // Acumulador para el balance total

    // Calcular totales de ventas y desglose de pagos/cambios
    for (const sale of sales) {
      totalLocal += parseFloat(sale.totalLocal);
      totalExchange += parseFloat(sale.totalExchange);

      // Contar productos vendidos
      sale.items.forEach((item) => {
        totalProductsSold += item.qty;
      });

      const exchangeRate = exchangeRates.get(sale.exchangeId) || 1;
      let salePaidTotal = 0; // Total pagado en esta venta (en Bs)
      let saleChangeTotal = 0; // Total de cambio dado en esta venta (en Bs)

      // Sumar métodos de pago recibidos
      // IMPORTANTE: Los montos en sale_payments están guardados tal como se ingresaron:
      // - Si method='debit', 'cash', 'transfer': el amount está en Bs
      // - Si method='exchange', 'other': el amount está en divisas
      sale.payments.forEach((payment) => {
        // Asegurar que amount sea número válido
        const amountStr = String(payment.amount || '0').trim();
        const amount = parseFloat(amountStr) || 0;
        if (isNaN(amount) || amount < 0) {
          console.warn(`Invalid payment amount for sale ${sale.id}, method ${payment.method}, amount: ${payment.amount}`);
          return; // Saltar este pago si es inválido
        }
        switch (payment.method) {
          case "debit":
            paymentsBreakdown.debit += amount; // Suma directa en Bs
            salePaidTotal += amount; // Ya está en Bs
            break;
          case "cash":
            paymentsBreakdown.cash += amount; // Suma directa en Bs
            salePaidTotal += amount; // Ya está en Bs
            break;
          case "exchange":
            paymentsBreakdown.exchange += amount; // Suma directa en divisas (sin convertir)
            // Convertir a Bs usando la tasa de cambio de la venta para el balance
            salePaidTotal += amount * exchangeRate;
            break;
          case "transfer":
            paymentsBreakdown.transfer += amount; // Suma directa en Bs
            salePaidTotal += amount; // Ya está en Bs
            break;
          case "other":
            paymentsBreakdown.other += amount; // Suma directa (puede estar en divisas)
            // Asumimos que "other" también puede necesitar conversión, pero por ahora lo tratamos como local
            salePaidTotal += amount;
            break;
        }
      });

      // Sumar métodos de cambio devueltos
      // IMPORTANTE: Los montos en sale_changes están guardados tal como se ingresaron:
      // - Si method='debit', 'cash', 'transfer': el amount está en Bs
      // - Si method='exchange', 'other': el amount está en divisas
      sale.changes.forEach((change) => {
        // Asegurar que amount sea número válido
        const amount = typeof change.amount === 'number' 
          ? change.amount 
          : (parseFloat(String(change.amount || '0')) || 0);
        if (isNaN(amount) || amount < 0) {
          console.warn(`Invalid change amount for sale ${sale.id}, method ${change.method}, amount: ${change.amount}`);
          return; // Saltar este cambio si es inválido
        }
        switch (change.method) {
          case "debit":
            changesBreakdown.debit += amount; // Suma directa en Bs
            saleChangeTotal += amount; // Ya está en Bs
            break;
          case "cash":
            changesBreakdown.cash += amount; // Suma directa en Bs
            saleChangeTotal += amount; // Ya está en Bs
            break;
          case "exchange":
            changesBreakdown.exchange += amount; // Suma directa en divisas (sin convertir)
            // Convertir a Bs usando la tasa de cambio de la venta para el balance
            saleChangeTotal += amount * exchangeRate;
            break;
          case "transfer":
            changesBreakdown.transfer += amount; // Suma directa en Bs
            saleChangeTotal += amount; // Ya está en Bs
            break;
          case "other":
            changesBreakdown.other += amount; // Suma directa
            saleChangeTotal += amount; // Ya está en Bs
            break;
        }
      });

      // Calcular balance de esta venta: (Total pagado - Total venta) - Cambio entregado
      const saleTotal = parseFloat(sale.totalLocal);
      const expectedChange = salePaidTotal - saleTotal;
      const saleBalance = expectedChange - saleChangeTotal;
      totalBalance += saleBalance;
    }

    const paymentBreakdown: PaymentBreakdown = {
      payments: paymentsBreakdown,
      changes: changesBreakdown,
      extraBalance: totalBalance,
    };

    // Obtener fecha de la venta más antigua
    const oldestSale = sales[0];
    const openAt = oldestSale.created_at;

    // Fecha actual
    const closedAt = new Date().toISOString();

    return {
      totalLocal: totalLocal.toFixed(2),
      totalExchange: totalExchange.toFixed(2),
      openAt,
      closedAt,
      totalProductsSold,
      paymentBreakdown,
    };
  }
}

