// src/migrations/20250731190314_create_role_user_table.ts
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('role_user', (table) => {
    table.increments('id').primary();

    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE'); // Si borras usuario, borra relación

    table
      .integer('role_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('roles')
      .onDelete('CASCADE'); // Si borras rol, borra relación

    table.unique(['user_id', 'role_id']); // Evita duplicados
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('role_user');
}
