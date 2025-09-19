import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('clients', (table) => {
    table.increments('id').primary();
    table.string('document').notNullable().unique(); 
    table.string('name').notNullable();
    table.string('lastname');
    table.string('phone');
    table.timestamps(true, true);
  });
  
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('clients');
}
