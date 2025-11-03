// src/models/closure.model.ts

export interface PaymentMethodBreakdown {
  debit: number;
  cash: number;
  exchange: number;
  transfer: number;
  other: number;
}

export interface PaymentBreakdown {
  payments: PaymentMethodBreakdown; // Desglose de pagos recibidos (sale_payments)
  changes: PaymentMethodBreakdown; // Desglose de cambios devueltos (sale_changes)
  extraBalance: number;
}

export interface Closure {
  id: number;
  totalLocal: string;
  totalExchange: string;
  totalProductsSold: number;
  openAt: string;
  closedAt: string;
  paymentBreakdown: PaymentBreakdown;
  created_at: string;
  updated_at: string;
}

