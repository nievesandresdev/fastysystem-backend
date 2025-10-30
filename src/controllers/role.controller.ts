// src/controllers/role.controller.ts
import { Request, Response } from 'express';
import { RoleService } from '@services/role.service';
import { respond } from "@common/response";
import { EnumResponse } from "@common/EnumResponse";
import { serializeError } from "@common/helpers";

export class RoleController {
  constructor(private roleService: RoleService) {}

  async getAll(req: Request, res: Response) {
    try {
      const roles = await this.roleService.getAll();
      return respond(res, EnumResponse.SUCCESS, roles, 'Roles obtenidos exitosamente');
    } catch (error: any) {
      return respond(res, EnumResponse.INTERNAL_SERVER_ERROR, { error: serializeError(error) }, 'Error al obtener roles');
    }
  }
}
