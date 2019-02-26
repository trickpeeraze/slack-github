require('make-promises-safe');

const fastify = require('fastify')({
  logger: true,
});
const axios = require('axios');
// const TOKEN = 'xoxp-3469903797-557756360789-558507623280-def517e9d9cbb80b9e2070f8c12768fc' // thick_of_trick
// const TOKEN = 'xoxp-3469903797-3469903803-555598613937-c359a44fa5dc4f6cf822524bb2303936' // trickpeeraze
const CHANNEL     = '#test_github';
const GITHUB_USER = 'trickpeeraze';

const userGitMapWithSlack = {
  trickpeeraze: {
    username: 'trickpeeraze',
    token: 'xoxp-3469903797-3469903803-555598613937-c359a44fa5dc4f6cf822524bb2303936',
  },
};

fastify.post('/', async (request, reply) => {
  const slackUser = userGitMapWithSlack[GITHUB_USER];

  if (!slackUser) return;

  try {
    const res = await axios.post('https://slack.com/api/chat.postMessage', {
      channel: CHANNEL,
      text: 'do something',
      // blocks: [],
      mrkdwn: true,
    }, {
      headers: {
        Authorization: `Bearer ${slackUser.token}`,
        'Content-Type': 'application/json',
      }
    });

    fastify.log.info(res);
  } catch(err) {
    fastify.log.error(err);
  }

  fastify.log.info(request.body);

  reply.code(204).send();
});

async function start() {
  fastify.log.info('Server starting..');

  try {
    await fastify.listen(3000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
