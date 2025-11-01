import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sales', (table) => {
    table.integer('userId').unsigned().notNullable().after('id');
    table.foreign('userId').references('id').inTable('users');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sales', (table) => {
    table.dropForeign(['userId']);
    table.dropColumn('userId');
  });
}

