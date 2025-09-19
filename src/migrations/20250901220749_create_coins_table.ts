// src/migrations/20250901161257_create_exchanges_table.ts
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('coins', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('abbreviation').notNullable();
    table.string('symbol').notNullable();
    table.timestamps(true, true);
  });
  
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('coins');
}
