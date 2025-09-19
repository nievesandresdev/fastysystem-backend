import { Router } from 'express';
import { db } from '@db';
//
import { ClientController } from '@controllers/client.controller';
import { ClientService } from '@services/client.service';
import { ClientRepository } from '@repositories/client.repository';

const repo = new ClientRepository(db);
const service = new ClientService(repo);

const controller = new ClientController( service );


const router = Router();

router.post('/save', controller.save);
router.get('/getClientsByDocument', controller.getClientsByDocument);
router.get('/searchClient', controller.searchClient);
export default router;