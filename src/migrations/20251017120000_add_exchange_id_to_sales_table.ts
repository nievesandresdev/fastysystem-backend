import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sales', (table) => {
    table.integer('exchangeId').unsigned().notNullable();
    table.foreign('exchangeId').references('id').inTable('exchanges');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sales', (table) => {
    table.dropForeign(['exchangeId']);
    table.dropColumn('exchangeId');
  });
}
