require("dotenv").config();
require("make-promises-safe");

const Fastify = require("fastify");
const run = require("./src");

const { PORT = 3000 } = process.env;

const server = Fastify({
  logger: true
});

run(server, PORT);
