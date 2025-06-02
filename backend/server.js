require('dotenv').config();
const Hapi = require('@hapi/hapi');
const pool = require('./postgres/pool'); 
const paletteRoutes = require('./routes/paletteRoutes');

const createServer = async () => {
  // Test DB connection at startup
  try {
    await pool.connect();
    console.log('✅ Connected to database');
  } catch (err) {
    console.error('❌ DB connection error:', err);
  }

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: 'localhost',
  });

  // Register your API routes
  server.route(paletteRoutes);

  // Health check endpoint
  server.route({
    method: 'GET',
    path: '/health',
    handler: () => ({ status: 'ok' }),
  });

  return server;
};

if (require.main === module) {
  createServer()
    .then(server => server.start())
    .then(() => console.log(`🚀 Server running on port ${process.env.PORT || 3000}`))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = createServer;
