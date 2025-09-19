import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("coins").del();

    // Inserts seed entries
    await knex("coins").insert([
        { id: 1, name: "Dolar" , abbreviation: "USD", symbol: "$" },
        { id: 2, name: "Euro" , abbreviation: "EUR", symbol: "€" }
    ]);
};
