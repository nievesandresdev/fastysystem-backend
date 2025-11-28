// src/services/role.service.ts
import type { Role } from '@models/role.model';
import { RoleRepository } from '@repositories/role.repository';

export class RoleService {
  constructor(private repo: RoleRepository) {}

  async getAll(): Promise<Role[]> {
    return await this.repo.findAll();
  }

  async getRoleNamesByUserId(userId: number): Promise<string[]> {
    return await this.repo.findNamesByUserId(userId);
  }
}
