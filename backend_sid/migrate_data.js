const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function migrate() {
  // Local Database Client
  const localClient = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  // Neon Database Client
  const neonClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  });

  try {
    console.log('Connecting to local database...');
    await localClient.connect();
    console.log('Connecting to Neon database...');
    await neonClient.connect();

    console.log('Fetching data from local table t1...');
    const res = await localClient.query('SELECT * FROM t1');
    const rows = res.rows;
    console.log(`Found ${rows.length} rows in local database.`);

    if (rows.length === 0) {
      console.log('No data to transfer.');
      return;
    }

    console.log('Transferring data to Neon database...');
    let inserted = 0;
    
    // Batch size of 1000 to prevent query string from getting too large
    const batchSize = 1000;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      const values = [];
      const queryParams = [];
      let paramIndex = 1;
      
      for (const row of batch) {
        values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        queryParams.push(
          row.id, 
          row.temperature, 
          row.latitude, 
          row.longitude, 
          row.pressure, 
          row.salinity, 
          row.oxygen, 
          row.nitrate, 
          row.depth, 
          row.time_ts, 
          row.created_at
        );
      }
      
      const query = `
        INSERT INTO t1 (id, temperature, latitude, longitude, pressure, salinity, oxygen, nitrate, depth, time_ts, created_at)
        VALUES ${values.join(', ')}
        ON CONFLICT (id) DO NOTHING
      `;
      
      await neonClient.query(query, queryParams);
      inserted += batch.length;
      console.log(`Migrated ${inserted} / ${rows.length} rows...`);
    }

    // Reset sequence so future inserts don't conflict with existing IDs
    const maxIdRes = await neonClient.query('SELECT MAX(id) FROM t1');
    const maxId = maxIdRes.rows[0].max || 0;
    if (maxId > 0) {
      await neonClient.query(`SELECT setval('t1_id_seq', ${maxId})`);
      console.log(`Updated ID sequence to ${maxId}.`);
    }

    console.log('Data transfer complete!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await localClient.end();
    await neonClient.end();
  }
}

migrate();
