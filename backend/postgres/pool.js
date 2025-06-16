require('dotenv').config();
const { Pool } = require('pg'); // ✅ Add this
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, '../certs/prod-ca-2021.crt')).toString(),
  
  },
});

module.exports = pool;
