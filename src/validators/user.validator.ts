// src/validators/user.validator.ts
import { Request, Response } from 'express';
import { BaseValidator, ValidationResult } from './base.validator';
import { UserService } from '@services/user.service';

export interface UserValidationData {
  name: string;
  lastname?: string;
  username: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  roles: string[];
}

export class UserValidator extends BaseValidator {
  constructor(private userService: UserService) {
    super();
  }

  async validateUserCreation(data: UserValidationData): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validar campos requeridos
    const requiredValidation = this.validateRequired(
      data,
      ['name', 'username', 'password', 'roles'],
      { 
        name: 'Nombre', 
        username: 'Nombre de usuario', 
        password: 'Contraseña', 
        roles: 'Roles' 
      }
    );
    errors.push(...requiredValidation.errors);

    // Validar longitud mínima de username
    if (data.username) {
      const usernameValidation = this.validateMinLength(data.username, 8, 'El nombre de usuario');
      errors.push(...usernameValidation.errors);
    }

    // Validar longitud mínima de password
    if (data.password) {
      const passwordValidation = this.validateMinLength(data.password, 8, 'La contraseña');
      errors.push(...passwordValidation.errors);
    }

    // Validar que las contraseñas coincidan
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }

    // Validar email
    if (data.email) {
      const emailValidation = this.validateEmail(data.email);
      errors.push(...emailValidation.errors);
    }

    // Validar roles
    const rolesValidation = this.validateArrayNotEmpty(data.roles, 'rol');
    errors.push(...rolesValidation.errors);

    if (rolesValidation.isValid) {
      const rolesFormatValidation = this.validateArrayElements(
        data.roles,
        (roleId: string) => roleId && !isNaN(parseInt(roleId)),
        'roles'
      );
      errors.push(...rolesFormatValidation.errors);
    }

    // Validar username único
    if (data.username) {
      const existingUser = await this.userService.findByUsername(data.username.trim());
      if (existingUser) {
        errors.push('El nombre de usuario ya existe');
      }
    }

    // Validar email único
    if (data.email && data.email.trim()) {
      const existingEmail = await this.userService.findByEmail(data.email.trim());
      if (existingEmail) {
        errors.push('El email ya está registrado');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async validateUserUpdate(data: UserValidationData, userId: number): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validar campos requeridos
    const requiredValidation = this.validateRequired(
      data,
      ['name', 'username', 'roles'],
      { 
        name: 'Nombre', 
        username: 'Nombre de usuario', 
        roles: 'Roles' 
      }
    );
    errors.push(...requiredValidation.errors);

    // Validar longitud mínima de username
    if (data.username) {
      const usernameValidation = this.validateMinLength(data.username, 8, 'El nombre de usuario');
      errors.push(...usernameValidation.errors);
    }

    // Validar email
    if (data.email) {
      const emailValidation = this.validateEmail(data.email);
      errors.push(...emailValidation.errors);
    }

    // Validar roles
    const rolesValidation = this.validateArrayNotEmpty(data.roles, 'rol');
    errors.push(...rolesValidation.errors);

    if (rolesValidation.isValid) {
      const rolesFormatValidation = this.validateArrayElements(
        data.roles,
        (roleId: string) => roleId && !isNaN(parseInt(roleId)),
        'roles'
      );
      errors.push(...rolesFormatValidation.errors);
    }

    // Validar username único (excluyendo el usuario actual)
    if (data.username) {
      const userWithSameUsername = await this.userService.findByUsername(data.username.trim());
      if (userWithSameUsername && userWithSameUsername.id !== userId) {
        errors.push('El nombre de usuario ya existe');
      }
    }

    // Validar email único (excluyendo el usuario actual)
    if (data.email && data.email.trim()) {
      const userWithSameEmail = await this.userService.findByEmail(data.email.trim());
      if (userWithSameEmail && userWithSameEmail.id !== userId) {
        errors.push('El email ya está registrado');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
