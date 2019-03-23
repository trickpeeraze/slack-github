const cookiePlugin = require('fastify-cookie');
const routes = require('./routes');
const database = require('./engines/db');
const start = require('./engines/start');
const template = require('./engines/template');
const Users = require('./model/user');
const fs = require('fs');
const path = require('path');

module.exports = async (server, PORT) => {
  const db = await database.load();

  server.register(cookiePlugin);
  server.register(routes);

  if (!process.env.CDN_URL) {
    server.register(require('fastify-static'), {
      root: path.resolve(__dirname, '../public'),
    });
  }

  server.decorateRequest('db', db);
  server.decorateRequest('users', new Users(db));
  server.decorateReply('render', function(view, data) {
    // TODO: this should be cache
    // TODO: construct file object
    const content = fs.readFileSync(`./views/${view}.html`);
    const render = template(content);

    return this.send(render(data));
  });

  start(server, PORT);
};
