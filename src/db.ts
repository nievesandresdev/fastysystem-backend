import knex, { type Knex } from 'knex';
import knexfile from './knexfile.js'; // o .ts si así lo cargas con tsx

export const db: Knex = knex(knexfile.development);
