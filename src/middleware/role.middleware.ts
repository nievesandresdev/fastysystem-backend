// src/middleware/role.middleware.ts
import { Response, NextFunction } from 'express';
import { respond } from '@common/response';
import { EnumResponse } from '@common/EnumResponse';
import { db } from '@db';
import { RoleRepository } from '@repositories/role.repository';
import { RoleService } from '@services/role.service';
import { AuthRequest } from './auth.middleware';

const roleRepository = new RoleRepository(db);
const roleService = new RoleService(roleRepository);

export function requireRoles(allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userIdHeader = req.headers['x-user-id'] as string | undefined;
      const tokenUserId = req.user?.sub as string | number | undefined;
      const rawUserId = userIdHeader ?? tokenUserId;

      if (!rawUserId) {
        return respond(
          res,
          EnumResponse.UNAUTHORIZED,
          { error: 'Usuario no autenticado' },
          'Acceso denegado'
        );
      }

      const userId = Number(rawUserId);

      if (!Number.isInteger(userId)) {
        return respond(
          res,
          EnumResponse.BAD_REQUEST,
          { error: 'Identificador de usuario inválido' },
          'Acceso denegado'
        );
      }

      const userRoles = await roleService.getRoleNamesByUserId(userId);

      if (!userRoles || userRoles.length === 0) {
        return respond(
          res,
          EnumResponse.FORBIDDEN,
          { error: 'Roles de usuario no encontrados' },
          'Acceso denegado'
        );
      }

      const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return respond(res, EnumResponse.FORBIDDEN, { 
          error: `No tienes permisos para esta acción. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}` 
        }, 'Acceso denegado por permisos');
      }

      return next();
    } catch (error: any) {
      return respond(
        res,
        EnumResponse.INTERNAL_SERVER_ERROR,
        { error: 'Error al verificar permisos' },
        'Error interno'
      );
    }
  };
}

// Middleware específico para admin
export const requireAdmin = requireRoles(['admin']);
