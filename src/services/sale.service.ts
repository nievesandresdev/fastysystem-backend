import type { SaveSaleRequest } from '@models/sale.model';
import { SaleRepository } from "@repositories/sale.repository";
import { ProductRepository } from "@repositories/product.repository";

export class SaleService {
  constructor(private repo: SaleRepository) {}

  async save(req: SaveSaleRequest) {
    return this.repo["db"].transaction(async (trx) => {
      const saleRepo = new SaleRepository(trx);
      console.log('req',req)
      const sale = await saleRepo.createSale({
        clientId: req.clientId,
        totalLocal: req.totalLocal,
        totalExchange: req.totalExchange,
        // created_at: new Date().toISOString(),
        // updated_at: new Date().toISOString(),
      });

      await saleRepo.createItems(
        req.itemslist.map((i) => ({
          saleId: sale.id,
          productId: i.id,
          qty: i.qty,
          priceLocal: i.priceRLocal,
          priceExchange: i.priceRExchange,
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
}
