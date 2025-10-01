import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sale_items', (table) => {
    table.increments('id').primary();

    table.integer('saleId').unsigned().notNullable();
    table.foreign('saleId').references('id').inTable('sales');

    table.integer('productId').unsigned().notNullable();
    table.foreign('productId').references('id').inTable('products');

    table.integer('qty').notNullable();
    table.string('priceLocal').notNullable(); 
    table.string('priceExchange').notNullable(); 
    table.timestamps(true, true);
  });
  
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('sale_items');
}
