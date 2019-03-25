module.exports = async function(server, port) {
  server.log.info('Loading database..');
  server.log.info('Server starting..');

  try {
    await server.listen(port, '0.0.0.0');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
