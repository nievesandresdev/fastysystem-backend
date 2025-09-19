// src/seeds/02_users_default.ts
import type { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  const trx = await knex.transaction();

  try {
    // 1) Crear/obtener superadmin
    const superAdmin = await trx('users')
      .where({ username: 'superadmin' })
      .first();

    let superAdminId: number;
    if (!superAdmin) {
      const hash = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 14);
      const ids: number[] = await trx('users').insert({
        name: 'superadmin',
        username: 'superadmin',
        email: 'superadmin@email.com',
        password: hash,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      });
      superAdminId = ids[0];
      console.log('✅ Superusuario creado: superadmin');
    } else {
      superAdminId = superAdmin.id;
      console.log('ℹ️ Superusuario ya existe: superadmin');
    }

    // 2) Roles requeridos
    const adminRole = await trx('roles').where({ name: 'admin' }).first();
    const billerRole = await trx('roles').where({ name: 'facturador' }).first();

    if (!adminRole || !billerRole) {
      throw new Error('Faltan roles base (admin/facturador). Ejecuta 01_roles_default primero.');
    }

    // 3) Asignaciones (evita duplicados)
    const toAssign = [
      { user_id: superAdminId, role_id: adminRole.id },
      { user_id: superAdminId, role_id: billerRole.id },
    ];

    for (const rel of toAssign) {
      const exists = await trx('role_user').where(rel).first();
      if (!exists) {
        await trx('role_user').insert(rel);
        console.log(`✅ Rol asignado: ${rel.role_id} → usuario ${rel.user_id}`);
      } else {
        console.log(`ℹ️ Rol ya asignado: ${rel.role_id} → usuario ${rel.user_id}`);
      }
    }

    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }
}
