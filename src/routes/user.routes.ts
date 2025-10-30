// src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '@controllers/user.controller';
import { UserService } from '@services/user.service';
import { UserRepository } from '@repositories/user.repository';
import { db } from '@db';
import { requireAdmin } from '@middleware/role.middleware';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();

// Inyección de dependencias
const userRepository = new UserRepository(db);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Rutas
router.post('/', authMiddleware, requireAdmin, userController.create.bind(userController));
router.get('/', authMiddleware, userController.findAll.bind(userController));
router.put('/:id', authMiddleware, requireAdmin, userController.update.bind(userController));

export default router;
