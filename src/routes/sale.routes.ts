import { Router } from 'express';
import { db } from '@db';
//
import { SaleController } from '@controllers/sale.controller';
import { SaleService } from '@services/sale.service';
import { SaleRepository } from '@repositories/sale.repository';
import { authMiddleware } from '@middleware/auth.middleware';
//

const repo = new SaleRepository(db);
const service = new SaleService(repo);

const controller = new SaleController( service );


const router = Router();

router.post('/save', authMiddleware, controller.save);
router.get('/stats', controller.getStats);

export default router;