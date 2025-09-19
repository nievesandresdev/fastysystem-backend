import path from 'node:path';
import { fileURLToPath } from 'node:url';

// __dirname equivalente en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');              // -> backend/
const DB_FILE = path.join(ROOT, 'database.sqlite');      // -> backend/database.sqlite

export default {
  development: {
    client: 'sqlite3',
    connection: { filename: DB_FILE },
    useNullAsDefault: true,
    pool: {
      min: 1,
      max: 1,
      afterCreate: (conn: any, done: any) => {
        conn.run('PRAGMA foreign_keys = ON');
        conn.run('PRAGMA journal_mode = WAL');
        conn.run('PRAGMA busy_timeout = 3000');
        done(null, conn);
      }
    },
    migrations: {
      directory: path.resolve('./migrations'),
      extension: 'ts',
      loadExtensions: ['.ts']
    },
    seeds: {
      directory: path.resolve('./seeds'),
      extension: 'ts',
      loadExtensions: ['.ts']
    }
  }
};
