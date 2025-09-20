// src/services/product.service.ts
import type { Product, ProductListFilters } from '@models/product.model';
import { ProductRepository } from '@repositories/product.repository';
import { ExchangeService } from '@services/exchange.service';

export class ProductService {
  constructor(private repo: ProductRepository, private exchangeService: ExchangeService) {}

  async create(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    try{
        //validate
        const existing = await this.repo.getOne({ codigo: productData.codigo });
        if (existing) {
          throw new Error(`Ya existe un producto con el código ${productData.codigo}`);
        }
        //
        return this.repo.create(productData);
    }catch(e: any){
        console.log('error ProductService.create',e);
        throw new Error(e);        
    }
  }

  async update(productData: Omit<Product, 'created_at' | 'updated_at'>) {
    try{
        //validate
        const existing = await this.repo.getOne({ codigo: productData.codigo });
        if (existing && productData.codigo !== existing.codigo) {
          throw new Error(`Ya existe un producto con el código ${productData.codigo}`);
        }
        //
        return this.repo.update(productData);
    }catch(e: any){
        console.log('error ProductService.update',e);
        throw new Error(e);        
    }
  }

  async getAll(filters :ProductListFilters) {
    try{
        const currExchange = await this.exchangeService.findActive();
        const products = await this.repo.getAll(filters);
        return products;
        const exchange = Number(currExchange.exchange).toFixed(2);
        const dataMap = products.data.map(p=>{
            return {
              ...p,
              priceCLocal: (priceCExchange * exchange).toFixed(2),
              priceRLocal:  (priceRExchange * exchange).toFixed(2),
            }          
        })
        return { ...products, data: dataMap };
    }catch(e: any){
        console.log('error ProductService.get',e);
        throw new Error('error ProductService.get');        
    }
  }

  async delete(productId: number) {
    try{
        return this.repo.delete(productId);
    }catch(e: any){
        console.log('error ProductService.delete',e);
        throw new Error(e);        
    }
  }

  async searchProduct(search: string) {
    try{
        const currExchange = await this.exchangeService.findActive();
        const products = await this.repo.searchProduct(search);
        if(products.length == 0) return products;
        const exchange = parseFloat(currExchange.exchange).toFixed(2);
        console.log('test exchange',exchange)
        const dataMap = products.map(p=>{
          const priceRExchange = parseFloat(p.priceRExchange).toFixed(2);
            return {
              ...p,
              priceRExchange,
              priceRLocal:  (priceRExchange * exchange).toFixed(2),
            }          
        })
        return dataMap;
    }catch(e: any){
        console.log('error ProductService.searchProduct',e);
        throw new Error('error ProductService.searchProduct');        
    }
  }
}