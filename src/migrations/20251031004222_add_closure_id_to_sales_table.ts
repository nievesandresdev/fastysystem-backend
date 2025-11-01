import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sales', (table) => {
    table.integer('closureId').unsigned().nullable();
    table.foreign('closureId').references('id').inTable('closures');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sales', (table) => {
    table.dropForeign(['closureId']);
    table.dropColumn('closureId');
  });
}

