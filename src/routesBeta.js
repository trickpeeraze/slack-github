const channelHandler = require('./handlers/beta/channel');

module.exports = function(server, opts, next) {
  server.get('/', (req, reply) => {
    reply.send('ok');
  });

  server.post('/channel/:channelId', channelHandler);

  server.get('/health', (req, reply) => {
    reply.send('ok');
  });

  next();
};
