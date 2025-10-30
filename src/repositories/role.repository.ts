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
}
