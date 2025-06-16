require('dotenv').config();
const pool = require('./pool'); // uses DATABASE_URL internally

console.log("Connecting to DB...");

const createTables = async () => {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS palettes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        hex_codes TEXT[] NOT NULL,
        created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
      );
    `);

    await pool.query(`
      ALTER TABLE palettes
        ADD COLUMN IF NOT EXISTS paints TEXT[],
        ADD COLUMN IF NOT EXISTS notes TEXT,
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
    `);

    console.log('✅ palettes table created or updated!');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY,
        username TEXT NOT NULL,
        password VARCHAR(200) NOT NULL,
        email TEXT NOT NULL
      );
    `);

    console.log('✅ users table created!');
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  } finally {
    await pool.end();
  }
};

createTables();
