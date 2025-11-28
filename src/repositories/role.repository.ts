// src/repositories/role.repository.ts
import type { Knex } from 'knex';
import type { Role } from '@models/role.model';

export class RoleRepository {
  constructor(private db: Knex) {}

  async findAll(): Promise<Role[]> {
    try {
      return await this.db<Role>('roles')
        .select('*')
        .orderBy('name', 'asc');
    } catch (e: any) {
      console.error('error RoleRepository.findAll', e);
      throw e;
    }
  }

  async findNamesByUserId(userId: number): Promise<string[]> {
    try {
      const roles = await this.db('role_user')
        .join('roles', 'role_user.role_id', 'roles.id')
        .where('role_user.user_id', userId)
        .select('roles.name');

      return roles.map((role: { name: string }) => role.name);
    } catch (e: any) {
      console.error('error RoleRepository.findNamesByUserId', e);
      throw e;
    }
  }
}
