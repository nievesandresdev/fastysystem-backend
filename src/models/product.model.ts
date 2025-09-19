// src/modules/products/ProductModel.ts
export interface Product {
  id: number;
  codigo: string;
  name: string;
  description: string;
  priceCExchange: number;    
  markup:number;    
  priceRExchange: number;    
  priceCLocal: number;    
  priceRLocal: number;    
  typeStockId: number;    // FK a measurement_units
  stock: number;
  minStock: number;
  created_at: string;
  updated_at: string;
  active: boolean;
  del: boolean;
}

export interface ProductWithUnit extends Product {
  unitName: string;       // nombre de la unidad
  unitAbbreviation: string; // abreviatura
}

export interface ProductListFilters {
  perPage: number;
  onlyActive?: boolean;
  lowStock?: boolean;
  latest?: boolean;
  search?: string | null;
}