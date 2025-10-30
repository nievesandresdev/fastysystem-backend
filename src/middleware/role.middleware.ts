// src/middleware/role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { respond } from '@common/response';
import { EnumResponse } from '@common/EnumResponse';

export function requireRoles(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Obtener roles del header
      const userRolesHeader = req.headers['x-user-roles'] as string;
      
      if (!userRolesHeader) {
        return respond(res, EnumResponse.FORBIDDEN, { 
          error: 'Roles de usuario no encontrados' 
        }, 'Acceso denegado');
      }

      const userRoles = userRolesHeader.split(',').map(role => role.trim());
      const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return respond(res, EnumResponse.FORBIDDEN, { 
          error: `No tienes permisos para esta acción. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}` 
        }, 'Acceso denegado por permisos');
      }

      next();
    } catch (error: any) {
      return respond(res, EnumResponse.INTERNAL_SERVER_ERROR, { error: 'Error al verificar permisos' }, 'Error interno');
    }
  };
}

// Middleware específico para admin
export const requireAdmin = requireRoles(['admin']);
