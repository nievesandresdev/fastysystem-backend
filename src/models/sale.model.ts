export interface Sale {
  id: number;
  userId: number;
  clientId: number | null;
  exchangeId: number;
  closureId: number | null;
  totalLocal: string;
  totalExchange: string;
  totalProfitLocal: string;
  totalProfitExchange: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  qty: number;
  priceLocal: string;
  priceExchange: string;
  priceCExchange: string;
}

export interface Payment {
  id: number;
  saleId: number;
  method: string;
  amount: string;
  reference?: string;
  concept?: string;
}

export interface Change {
  id: number;
  saleId: number;
  method: string;
  amount: number;
  reference?: string;
  concept?: string;
}

export interface SaveSaleRequest {
  userId: number;
  clientId: number | null;
  exchangeId: number;
  itemslist: SaleItem[];
  payments: Record<string, { amount: string; reference?: string; concept?: string }>;
  change: Record<string, { amount: string; reference?: string; concept?: string }>;
  totalLocal: string;
  totalExchange: string;
}

