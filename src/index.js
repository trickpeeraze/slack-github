const cookiePlugin = require("fastify-cookie");
const routes = require("./routes");
const db = require("./engines/db");
const start = require("./engines/start");

module.exports = (server, PORT) => {
  server.register(cookiePlugin);
  server.register(routes);

  server.decorateRequest("db", async function() {
    this.db = await db.load();
  });

  start(server, PORT);
};
