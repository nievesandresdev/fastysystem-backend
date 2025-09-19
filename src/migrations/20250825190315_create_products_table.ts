// src/migrations/20250825190314_create_products_table.ts
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('codigo').notNullable().unique();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.decimal('priceCExchange', 12, 2).notNullable();
    table.decimal('priceRExchange', 12, 2).notNullable();
    table.decimal('priceCLocal', 12, 2).notNullable();
    table.decimal('priceRLocal', 12, 2).notNullable();
    table.decimal('markup', 12, 2).notNullable();
    table.integer('typeStockId').unsigned().notNullable();
    table.decimal('stock', 12, 4).notNullable(); // 4 decimales para precisión
    table.decimal('minStock', 12, 4).notNullable();
    table.timestamps(true, true);

    table.foreign('typeStockId').references('id').inTable('measurement_units');
  });
  
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('products');
}
