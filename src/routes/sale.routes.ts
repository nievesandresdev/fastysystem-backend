import { Router } from 'express';
import { db } from '@db';
//
import { SaleController } from '@controllers/sale.controller';
import { SaleService } from '@services/sale.service';
import { SaleRepository } from '@repositories/sale.repository';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireAdmin } from '@middleware/role.middleware';
//

const repo = new SaleRepository(db);
const service = new SaleService(repo);

const controller = new SaleController( service );


const router = Router();

router.post('/save', controller.save);
router.get('/stats', requireAdmin, controller.getStats);
router.get('/monthly-report', requireAdmin, controller.getMonthlyReport);
router.get('/current-period', requireAdmin, controller.getCurrentPeriodStats);
router.get('/top-products-low-stock', requireAdmin, controller.getTopProductsAndLowStock);

export default router;