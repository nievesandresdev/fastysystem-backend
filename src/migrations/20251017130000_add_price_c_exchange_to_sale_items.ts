import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sale_items', (table) => {
    table.decimal('priceCExchange', 12, 2).notNullable().defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sale_items', (table) => {
    table.dropColumn('priceCExchange');
  });
}
