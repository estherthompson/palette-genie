const Hapi = require('@hapi/hapi');

const createServer = async () => {
    const server = Hapi.server({

        port: process.env.PORT || 3000,
        host: 'localhost',
    });
    
    server.route({
        method: 'GET',
        path: '/health',
        handler: () => (
            { status: 'ok'}),
 
    });

    await server.initialize();
    return server;
};

if(require.main == module){
    createServer().then(server => server.start());
}

module.exports = createServer; 