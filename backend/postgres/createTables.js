require('dotenv').config();
const { Pool } = require('pg');


const pool = new Pool({

    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false},

});

const createTables = async () => {

    try{
        await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

        await pool.query(` 
            CREATE TABLE IF NOT EXISTS palettes(
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
        console.log('palettes table created or updated!')
    } catch (err){
        console.error("Error creating tables:", err)
    } finally {
        await pool.end();
    }
};

createTables();