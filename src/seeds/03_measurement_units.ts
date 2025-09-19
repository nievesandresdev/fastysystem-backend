import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("measurement_units").del();

    // Inserts seed entries
    await knex("measurement_units").insert([
        { id: 1, name: "Metros" , abbreviation: "m" },
        { id: 2, name: "Kilogramos" , abbreviation: "kg" },
        { id: 3, name: "Unidad" , abbreviation: "und" }
    ]);
};
