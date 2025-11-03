import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('closures', (table) => {
    table.dateTime('openAt').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('closures', (table) => {
    table.dropColumn('openAt');
  });
}

