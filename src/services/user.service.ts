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

  async create(userData: {
    name: string;
    lastname?: string | null;
    username: string;
    email?: string | null;
    password: string;
    roles?: number[];
  }) {
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await this.repo.create({
      ...userData,
      password: hashedPassword
    });

    // Crear relaciones con roles si se proporcionan
    if (userData.roles && userData.roles.length > 0 && user.id) {
      for (const roleId of userData.roles) {
        await this.repo.assignRole(user.id, roleId);
      }
    }

    // Omitir password del resultado
    const { password: _omit, ...safeUser } = user as User & { password: string };
    return safeUser;
  }

  async findByUsername(username: string) {
    return await this.repo.findByUsername(username);
  }

  async findByEmail(email: string) {
    return await this.repo.findByEmail(email);
  }

  async findAllWithRoles() {
    return await this.repo.findAllWithRoles();
  }


  async update(id: number, userData: {
    name: string;
    lastname?: string | null;
    username: string;
    email?: string | null;
    roles?: number[];
  }) {
    // Actualizar datos del usuario
    const user = await this.repo.update(id, {
      name: userData.name,
      lastname: userData.lastname,
      username: userData.username,
      email: userData.email
    });

    // Actualizar roles si se proporcionan
    if (userData.roles && userData.roles.length > 0) {
      // Eliminar roles actuales
      await this.repo.removeUserRoles(id);
      
      // Asignar nuevos roles
      for (const roleId of userData.roles) {
        await this.repo.assignRole(id, roleId);
      }
    }

    // Omitir password del resultado
    const { password: _omit, ...safeUser } = user as User & { password: string };
    return safeUser;
  }
}
