import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('expenses', (table) => {
    table.increments('id').primary();
    table.string('concept').notNullable();
    table.string('amount').notNullable(); 
    table.string('type').notNullable(); // fixed, temporary
    table.string('status').notNullable().defaultTo('with-effect'); // with-effect, without-effect
    table.boolean('editable').notNullable().defaultTo(true);
    table.date('startDate').notNullable();
    table.date('endDate'); // nullable - solo requerido para tipo "temporary"
    table.text('description');
    table.timestamps(true, true);
  });
  
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('expenses');
}

