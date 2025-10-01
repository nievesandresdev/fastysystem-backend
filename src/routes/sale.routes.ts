import { Router } from 'express';
import { db } from '@db';
//
import { SaleController } from '@controllers/sale.controller';
import { SaleService } from '@services/sale.service';
import { SaleRepository } from '@repositories/sale.repository';
//

const repo = new SaleRepository(db);
const service = new SaleService(repo);

const controller = new SaleController( service );


const router = Router();

router.post('/save', controller.save);
export default router;