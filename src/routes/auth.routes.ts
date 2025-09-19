import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';
import { UserService } from '@services/user.service';
import { UserRepository } from '@repositories/user.repository';
import { db } from '@db';

const repo = new UserRepository(db);
const service = new UserService(repo);
const authController = new AuthController(service);


const router = Router();

router.post('/login', authController.login);
// router.post('/register', authController.register);

export default router;