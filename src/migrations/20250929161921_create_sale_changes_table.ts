import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sale_changes', (table) => {
    table.increments('id').primary();

    table.integer('saleId').unsigned().notNullable();
    table.foreign('saleId').references('id').inTable('sales');
    
    table.string('method').notNullable();
    table.string('amount ').notNullable(); 
    table.string('reference');
    table.string('concept'); 
    table.timestamps(true, true);
  });
  
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('sale_changes');
}
