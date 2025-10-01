import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sales', (table) => {
    table.increments('id').primary();
    table.integer('clientId').unsigned().notNullable();
    table.string('totalLocal').notNullable(); 
    table.string('totalExchange').notNullable(); 
    table.timestamps(true, true);

    table.foreign('clientId').references('id').inTable('clients');
  });
  
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('sales');
}
