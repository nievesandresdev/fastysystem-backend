import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '@services/user.service';
import { respond } from '@common/response';
import { EnumResponse } from '@common/EnumResponse';
import { serializeError } from '@common/helpers';
import AuthError from '@common/errors/AuthError'

export class AuthController {
  constructor(private users: UserService) {}

  // POST /api/auth/login  { username, password }
  login = async (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res.status(EnumResponse.BAD_REQUEST).json({ message: 'username/password requeridos' });
    }

    try {
      const user = await this.users.login(username, password);
      const token = jwt.sign(
        { sub: user.id, email: user.email },
        process.env.AUTH_JWT_SECRET || 'dev-secret',
        { expiresIn: '7d' }
      );
      return respond(res, EnumResponse.SUCCESS, { user, token }, 'Login exitoso!');
    } catch (e: any) {
      console.log('error AuthController.login',e);
      let msgError: string = 'Error interno';
      let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
      if (e?.message === AuthError.CREDENTIALS_INVALID.key) {
        statusError = EnumResponse.UNAUTHORIZED;
        msgError = AuthError.CREDENTIALS_INVALID.msg;
      } else if (e?.message === 'INVALID_PASSWORD') {
        statusError = EnumResponse.UNAUTHORIZED;
        msgError = AuthError.INVALID_PASSWORD.msg;
      }

      // 👉 error detallado va en data; message queda legible
      return respond(res, statusError, { error: serializeError(e) }, msgError);
    }
  };
}

