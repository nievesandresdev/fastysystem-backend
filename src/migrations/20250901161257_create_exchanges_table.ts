// src/migrations/20250901161257_create_exchanges_table.ts
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('exchanges', (table) => {
    table.increments('id').primary();
    table.boolean('active').notNullable().defaultTo(true);
    table.decimal('exchange', 12, 2).notNullable();
    table.integer('coinId').unsigned().notNullable();
    table.timestamps(true, true);

    table.foreign('coinId').references('id').inTable('coins');
  });
  
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('exchanges');
}
