// src/validators/base.validator.ts
import { Request, Response } from 'express';
import { respond } from '@common/response';
import { EnumResponse } from '@common/EnumResponse';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export abstract class BaseValidator {
  protected validateRequired(
    data: any,
    requiredFields: string[],
    fieldLabels: Record<string, string>
  ): ValidationResult {
    const errors: string[] = [];
    
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        const label = fieldLabels[field] || field;
        errors.push(`${label} es requerido`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  protected validateMinLength(
    value: string,
    minLength: number,
    fieldName: string
  ): ValidationResult {
    if (value.trim().length < minLength) {
      return {
        isValid: false,
        errors: [`${fieldName} debe tener al menos ${minLength} caracteres`]
      };
    }
    
    return { isValid: true, errors: [] };
  }

  protected validateEmail(email: string): ValidationResult {
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          isValid: false,
          errors: ['El formato del email no es válido']
        };
      }
    }
    
    return { isValid: true, errors: [] };
  }

  protected validateArrayNotEmpty(
    array: any[],
    fieldName: string
  ): ValidationResult {
    if (!array || !Array.isArray(array) || array.length === 0) {
      return {
        isValid: false,
        errors: [`Debe seleccionar al menos un ${fieldName}`]
      };
    }
    
    return { isValid: true, errors: [] };
  }

  protected validateArrayElements(
    array: any[],
    validator: (item: any) => boolean,
    fieldName: string
  ): ValidationResult {
    const invalidItems = array.filter(item => !validator(item));
    if (invalidItems.length > 0) {
      return {
        isValid: false,
        errors: [`Debe seleccionar ${fieldName} válidos`]
      };
    }
    
    return { isValid: true, errors: [] };
  }

  protected sendValidationError(res: Response, errors: string[]): boolean {
    if (errors.length > 0) {
      respond(res, EnumResponse.BAD_REQUEST, { error: errors[0] }, 'Error de validación');
      return true;
    }
    return false;
  }
}
