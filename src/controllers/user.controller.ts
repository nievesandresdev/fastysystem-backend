// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '@services/user.service';
import { respond } from "@common/response";
import { EnumResponse } from "@common/EnumResponse";
import { serializeError } from "@common/helpers";
import { UserValidator } from '../validators/user.validator';

export class UserController {
  private userValidator: UserValidator;

  constructor(private userService: UserService) {
    this.userValidator = new UserValidator(userService);
  }

  async create(req: Request, res: Response) {
    try {
      const request = req.body;
      const { name, username, password, confirmPassword, email, lastname, roles } = request;

      // Validar datos del usuario
      const validation = await this.userValidator.validateUserCreation({
        name,
        lastname,
        username,
        email,
        password,
        confirmPassword,
        roles
      });

      if (!validation.isValid) {
        return respond(res, EnumResponse.BAD_REQUEST, { error: validation.errors[0] }, 'Error de validación');
      }

      // Crear usuario
      const userData = {
        name: name.trim(),
        lastname: lastname?.trim() || null,
        username: username.trim(),
        email: email?.trim() || null,
        password: password,
        roles: roles.map((roleId: string) => parseInt(roleId))
      };

      const user = await this.userService.create(userData);
      return respond(res, EnumResponse.SUCCESS, user, 'Usuario creado exitosamente');
    } catch (error: any) {
      return respond(res, EnumResponse.INTERNAL_SERVER_ERROR, { error: serializeError(error) }, 'Error al crear usuario');
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const users = await this.userService.findAllWithRoles();
      return respond(res, EnumResponse.SUCCESS, users, 'Usuarios obtenidos exitosamente');
    } catch (error: any) {
      return respond(res, EnumResponse.INTERNAL_SERVER_ERROR, { error: serializeError(error) }, 'Error al obtener usuarios');
    }
  }


  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        return respond(res, EnumResponse.BAD_REQUEST, { error: 'ID de usuario inválido' }, 'ID de usuario inválido');
      }

      // Validaciones
      const request = req.body;
      const { name, username, email, lastname, roles } = request;

      // Validar datos del usuario
      const validation = await this.userValidator.validateUserUpdate({
        name,
        lastname,
        username,
        email,
        roles
      }, userId);

      if (!validation.isValid) {
        return respond(res, EnumResponse.BAD_REQUEST, { error: validation.errors[0] }, 'Error de validación');
      }

      // Actualizar usuario
      const userData = {
        name: name.trim(),
        lastname: lastname?.trim() || null,
        username: username.trim(),
        email: email?.trim() || null,
        roles: roles.map((roleId: string) => parseInt(roleId))
      };

      const user = await this.userService.update(userId, userData);
      return respond(res, EnumResponse.SUCCESS, user, 'Usuario actualizado exitosamente');
    } catch (error: any) {
      return respond(res, EnumResponse.INTERNAL_SERVER_ERROR, { error: serializeError(error) }, 'Error al actualizar usuario');
    }
  }
}
