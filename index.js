require('make-promises-safe');

const fastify = require('fastify')({
  logger: true,
});
const axios = require('axios');
const CHANNEL     = '#test_github';
const GITHUB_USER = 'trickpeeraze';

const userGitMapWithSlack = {
  trickpeeraze: {
    username: 'trickpeeraze',
    token: '',
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

fastify.get('/authorize', async (request, reply) => {
  const api = 'https://slack.com/oauth/authorize';
  const client_id = '3469903797.556486638037';
  const scope = 'chat:write:user';
  const redirect_uri = '';
  const state = 'grant';
  // const team = '';

  const url = `${api}?client_id=${client_id}&scope=${scope}&state=${state}&redirect_uri=${redirect_uri}`

  reply.redirect(url)
  return { hello: 'world' }
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
