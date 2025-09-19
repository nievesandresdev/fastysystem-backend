import { Response } from 'express';
import { EnumResponse } from './EnumResponse';
import { HttpStatus } from './HttpStatus';

const statusMap: Record<EnumResponse, HttpStatus> = {
  [EnumResponse.SUCCESS]: HttpStatus.OK,
  [EnumResponse.SUCCESS_OK]: HttpStatus.OK,
  [EnumResponse.CREATE_SUCCESS]: HttpStatus.CREATED,
  [EnumResponse.ACCEPTED]: HttpStatus.ACCEPTED,
  [EnumResponse.NO_CONTENT]: HttpStatus.NO_CONTENT,
  [EnumResponse.BAD_REQUEST]: HttpStatus.BAD_REQUEST,
  [EnumResponse.DUPLICATE_ENTRY]: HttpStatus.BAD_REQUEST,
  [EnumResponse.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [EnumResponse.FORBIDDEN]: HttpStatus.FORBIDDEN,
  [EnumResponse.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [EnumResponse.UNPROCESSABLE_ENTITY]: HttpStatus.UNPROCESSABLE_ENTITY,
  [EnumResponse.INTERNAL_SERVER_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [EnumResponse.NOT_IMPLEMENTED]: HttpStatus.NOT_IMPLEMENTED,
  [EnumResponse.SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [EnumResponse.ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
};

export function respond(
  res: Response,
  code: EnumResponse,
  data?: unknown,
  message?: string
) {
  const status = statusMap[code];
  const ok = [HttpStatus.OK, HttpStatus.CREATED, HttpStatus.ACCEPTED, HttpStatus.NO_CONTENT].includes(status);

  // puedes personalizar titles/messages luego; dejo algo genérico
  const payload: Record<string, unknown> = {
    ok,
    status,
    code,
    message: message ?? (ok ? 'Success' : 'Error'),
  };
  if (data !== undefined && status !== HttpStatus.NO_CONTENT) payload.data = data;

  return res.status(status).json(payload);
}
