import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sales', (table) => {
    table.decimal('totalProfitLocal', 12, 2).notNullable().defaultTo(0);
    table.decimal('totalProfitExchange', 12, 2).notNullable().defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sales', (table) => {
    table.dropColumn('totalProfitLocal');
    table.dropColumn('totalProfitExchange');
  });
}
