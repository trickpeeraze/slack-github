const homeHandler = require("./handlers/home");
const infoHandler = require("./handlers/info");
const channelHandler = require("./handlers/channel");
const authHandler = require("./handlers/auth");

module.exports = function(server, opts, next) {
  server.get("/", homeHandler);

  server.post("/update-info", infoHandler);

  server.post("/channel/:channelId", channelHandler);

  server.get("/authorize", authHandler.authorize);

  server.get("/authorized", authHandler.authorized);

  next();
};
