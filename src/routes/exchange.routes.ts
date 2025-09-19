import { Router } from 'express';
import { db } from '@db';
//
import { ExchangeController } from '@controllers/exchange.controller';
import { ExchangeService } from '@services/exchange.service';
import { ExchangeRepository } from '@repositories/exchange.repository';
//measurement
import { CoinController } from '@controllers/coin.controller';
import { CoinService } from '@services/coin.service';
import { CoinRepository } from '@repositories/coin.repository';


const repo = new ExchangeRepository(db);
const service = new ExchangeService(repo);
const controller = new ExchangeController(service);
//
const coinRepo = new CoinRepository(db);
const coinService = new CoinService(coinRepo);
const coinController = new CoinController(coinService);
//



const router = Router();

router.get('/getCoins', coinController.getAll);
router.post('/create', controller.create);
router.get('/findActive', controller.findActive);

export default router;