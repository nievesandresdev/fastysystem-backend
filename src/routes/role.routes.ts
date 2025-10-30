// src/routes/role.routes.ts
import { Router } from 'express';
import { RoleController } from '@controllers/role.controller';
import { RoleService } from '@services/role.service';
import { RoleRepository } from '@repositories/role.repository';
import { db } from '@db';

const router = Router();

// Inyección de dependencias
const roleRepository = new RoleRepository(db);
const roleService = new RoleService(roleRepository);
const roleController = new RoleController(roleService);

// Rutas
router.get('/', roleController.getAll.bind(roleController));

export default router;
