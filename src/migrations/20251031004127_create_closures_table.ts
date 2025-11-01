import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('closures', (table) => {
    table.increments('id').primary();
    table.decimal('totalLocal', 12, 2).notNullable();
    table.decimal('totalExchange', 12, 2).notNullable();
    table.integer('totalProductsSold').notNullable().defaultTo(0);
    table.dateTime('closedAt').notNullable();
    table.json('paymentBreakdown').notNullable(); // JSON con desglose de pagos
    table.timestamps(true, true);
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('closures');
}

