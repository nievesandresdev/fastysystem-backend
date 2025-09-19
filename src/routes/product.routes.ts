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

router.post('/', controller.save);
router.get('/', controller.getAll);
router.get('/getMeasurementUnits', controller.getMeasurementUnits);
router.delete('/delete/:id', controller.delete);

export default router;