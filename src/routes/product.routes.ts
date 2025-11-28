import { Router } from 'express';
import { db } from '@db';
//
import { ProductController } from '@controllers/product.controller';
import { ProductService } from '@services/product.service';
import { ProductRepository } from '@repositories/product.repository';
//measurement
import { MeasurementUnitService } from '@services/measurementUnit.service';
import { MeasurementUnitRepository } from '@repositories/measurementUnit.repository';
//exchange
import { ExchangeService } from '@services/exchange.service';
import { ExchangeRepository } from '@repositories/exchange.repository';
//middleware
import { requireAdmin } from '@middleware/role.middleware';
//
const measurementUnitRepo = new MeasurementUnitRepository(db);
const measurementUnitService = new MeasurementUnitService(measurementUnitRepo);
//
const exchangeRepo = new ExchangeRepository(db);
const exchangeService = new ExchangeService(exchangeRepo);
//
const repo = new ProductRepository(db);
const service = new ProductService(repo, exchangeService);

const controller = new ProductController( service, measurementUnitService );


const router = Router();

router.post('/', requireAdmin, controller.save);
router.get('/', controller.getAll);
router.delete('/delete/:id', requireAdmin, controller.delete);
router.get('/searchProduct', controller.searchProduct);

router.get('/getMeasurementUnits', controller.getMeasurementUnits);


export default router;