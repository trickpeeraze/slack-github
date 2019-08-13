const cookiePlugin = require('fastify-cookie');
const routes = require('./routes');
const start = require('./core/start');
const path = require('path');

module.exports = async (server, PORT) => {
  server.register(cookiePlugin);
  server.register(routes);

  if (!process.env.CDN_URL) {
    server.register(require('fastify-static'), {
      root: path.resolve(__dirname, '../public'),
    });
  }

  start(server, PORT);
};
