// src/migrations/20250825190314_create_products_table.ts
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('measurement_units', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique(); 
    table.string('abbreviation').notNullable(); 
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('measurement_units');
}
