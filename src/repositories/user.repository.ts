// src/repositories/user.repository.ts
import type { Knex } from 'knex';
import type { User } from '@models/user.model';

export class UserRepository {
  constructor(private db: Knex) {}

  findByUsername(username: string) {
    try{
      return this.db<User>('users')
            .where('username', username)
            .first()
    }catch(e:any){
      console.error('error UserRepository.findByUsername',e);
    }
    
  }


}
