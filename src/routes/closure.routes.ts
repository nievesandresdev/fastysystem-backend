import { Router } from 'express';
import { db } from '@db';
//
import { ClosureController } from '@controllers/closure.controller';
import { ClosureService } from '@services/closure.service';
import { ClosureRepository } from '@repositories/closure.repository';
import { SaleRepository } from '@repositories/sale.repository';
import { ExchangeRepository } from '@repositories/exchange.repository';
import { requireAdmin } from '@middleware/role.middleware';

const closureRepo = new ClosureRepository(db);
const saleRepo = new SaleRepository(db);
const exchangeRepo = new ExchangeRepository(db);
const service = new ClosureService(closureRepo, saleRepo, exchangeRepo);

const controller = new ClosureController(service);

const router = Router();

router.post('/create', requireAdmin, controller.create);
router.get('/getAll', requireAdmin, controller.getAll);

export default router;

