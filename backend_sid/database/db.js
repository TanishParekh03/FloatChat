const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL is missing in .env file.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  }
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
