import { Router } from 'express';
import { db } from '@db';
//
import { ExpenseController } from '@controllers/expense.controller';
import { ExpenseService } from '@services/expense.service';
import { ExpenseRepository } from '@repositories/expense.repository';

//
const repo = new ExpenseRepository(db);
const service = new ExpenseService(repo);

const controller = new ExpenseController(service);


const router = Router();

router.post('/', controller.save);
router.get('/with-effect', controller.getAllWithEffect);
router.get('/', controller.getAll);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.put('/:id/toggle-status', controller.toggleStatus);
router.put('/:id/complete', controller.completeExpense);

export default router;

