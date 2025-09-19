export interface Exchange {
  id: number;
  active:boolean;   
  exchange:number;   
  coinId:number; 
  created_at: string;
  updated_at: string;
}

export interface ExchangeWithCoin extends Exchange {
  coinName: string;     
  coinAbbreviation: string;
  coinSymbol: string;
}