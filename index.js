require("dotenv").config();
require("make-promises-safe");

const Fastify = require("fastify");
const _ = require("lodash");
const run = require("./src");

_.templateSettings.interpolate = /\{\{([\s\S]+?)\}\}/g;

const { PORT = 3000 } = process.env;

const server = Fastify({
  logger: true
});

run(server, PORT);
