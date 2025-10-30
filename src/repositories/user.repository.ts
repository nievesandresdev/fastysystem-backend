// src/repositories/user.repository.ts
import type { Knex } from 'knex';
import type { User } from '@models/user.model';

export class UserRepository {
  constructor(private db: Knex) {}

  async findByUsername(username: string) {
    try{
      const user = await this.db<User>('users')
            .where('username', username)
            .first();
      
      if (!user) return null;

      // Obtener roles del usuario
      const roles = await this.db('role_user')
        .join('roles', 'role_user.role_id', 'roles.id')
        .where('role_user.user_id', user.id)
        .select('roles.id', 'roles.name');
      
      return {
        ...user,
        roles: roles.map(role => ({ id: role.id, name: role.name }))
      };
    }catch(e:any){
      console.error('error UserRepository.findByUsername',e);
      throw e;
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.db<User>('users')
        .where('email', email)
        .first();
    } catch (e: any) {
      console.error('error UserRepository.findByEmail', e);
      throw e;
    }
  }

  async create(userData: {
    name: string;
    lastname?: string | null;
    username: string;
    email?: string | null;
    password: string;
  }) {
    try {
      const [user] = await this.db<User>('users')
        .insert({
          name: userData.name,
          lastname: userData.lastname || undefined,
          username: userData.username,
          email: userData.email || undefined,
          password: userData.password,
          created_at: this.db.fn.now(),
          updated_at: this.db.fn.now()
        })
        .returning('*');
      return user;
    } catch (e: any) {
      console.error('error UserRepository.create', e);
      throw e;
    }
  }





  async assignRole(userId: number, roleId: number) {
    try {
      await this.db('role_user')
        .insert({
          user_id: userId,
          role_id: roleId
        });
      return true;
    } catch (e: any) {
      console.error('error UserRepository.assignRole', e);
      throw e;
    }
  }

  async findAllWithRoles() {
    try {
      const users = await this.db('users')
        .select('users.*')
        .where('users.username', '!=', 'superadmin')
        .orderBy('users.created_at', 'desc');

      // Obtener roles para cada usuario
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          const roles = await this.db('role_user')
            .join('roles', 'role_user.role_id', 'roles.id')
            .where('role_user.user_id', user.id)
            .select('roles.name');
          
          return {
            ...user,
            roles: roles.map(role => role.name)
          };
        })
      );

      return usersWithRoles;
    } catch (e: any) {
      console.error('error UserRepository.findAllWithRoles', e);
      throw e;
    }
  }



  async update(id: number, userData: {
    name: string;
    lastname?: string | null;
    username: string;
    email?: string | null;
  }) {
    try {
      const [user] = await this.db('users')
        .where('id', id)
        .update({
          name: userData.name,
          lastname: userData.lastname || undefined,
          username: userData.username,
          email: userData.email || undefined,
          updated_at: this.db.fn.now()
        })
        .returning('*');
      return user;
    } catch (e: any) {
      console.error('error UserRepository.update', e);
      throw e;
    }
  }

  async removeUserRoles(userId: number) {
    try {
      await this.db('role_user')
        .where('user_id', userId)
        .del();
      return true;
    } catch (e: any) {
      console.error('error UserRepository.removeUserRoles', e);
      throw e;
    }
  }
}
