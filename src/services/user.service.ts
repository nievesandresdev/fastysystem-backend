import bcrypt from 'bcryptjs';
import type { User } from '@models/user.model';
import { UserRepository } from '@repositories/user.repository';
import AuthError from '@common/errors/AuthError'

export class UserService {
  constructor(private repo: UserRepository) {}

  // Valida credenciales y devuelve el usuario sin password
  async login(username: string, password: string) {
    
    const user = await this.repo.findByUsername(username);
    if (!user) throw new Error(AuthError.CREDENTIALS_INVALID.key);

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error(AuthError.INVALID_PASSWORD.key);

    // Omitir hash antes de devolver
    const { password: _omit, ...safe } = user as User & { password: string };
    return safe;
  }
}
