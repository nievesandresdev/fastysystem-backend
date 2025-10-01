export interface Sale {
  id: number;
  clientId: number | null;
  totalLocal: number;
  totalExchange: number;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  qty: number;
  priceLocal: number;
  priceExchange: number;
}

export interface Payment {
  id: number;
  saleId: number;
  method: string;
  amount: number;
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
  clientId: number | null;
  items: SaleItem[];
  payments: Record<string, { amount: string; reference?: string; concept?: string }>;
  change: Record<string, { amount: string; reference?: string; concept?: string }>;
  totalLocal: string;
  totalExchange: string;
}

