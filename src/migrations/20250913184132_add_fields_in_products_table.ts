// src/migrations/20250913184132_add_fields_in_products_table.ts
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasActive = await knex.schema.hasColumn("products", "active");
  const hasDel = await knex.schema.hasColumn("products", "del");

  await knex.schema.alterTable("products", (table) => {
    if (!hasActive) {
      table.boolean("active").notNullable().defaultTo(true);
    }
    if (!hasDel) {
      table.boolean("del").notNullable().defaultTo(false);
    }
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("products", (table) => {
    table.dropColumn("active");
    table.dropColumn("del");
  });
}
