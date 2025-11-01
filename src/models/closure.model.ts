// src/models/closure.model.ts

export interface PaymentBreakdown {
  debit: number;
  cash: number;
  foreignCurrency: number;
  bankTransfer: number;
  other: number;
  extraBalance: number; // positivo o negativo según el cambio
}

export interface Closure {
  id: number;
  totalLocal: string;
  totalExchange: string;
  totalProductsSold: number;
  closedAt: string;
  paymentBreakdown: PaymentBreakdown;
  created_at: string;
  updated_at: string;
}

