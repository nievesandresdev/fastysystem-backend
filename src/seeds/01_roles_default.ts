// src/seeds/01_roles_default.ts
import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const roles = ['admin', 'facturador'];

  for (const role of roles) {
    const exists = await knex('roles').where({ name: role }).first();
    if (!exists) {
      await knex('roles').insert({
        name: role,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      });
      console.log(`✅ Rol creado: ${role}`);
    } else {
      console.log(`ℹ️ Rol ya existe: ${role}`);
    }
  }
}
