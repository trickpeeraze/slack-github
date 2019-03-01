require('make-promises-safe');

const qs = require('querystring');
const fastify = require('fastify')({
  logger: true,
});
const axios = require('axios');

const CHANNEL     = '#test_github';
const GITHUB_USER = 'trickpeeraze';
const client_id = '3469903797.556486638037';
const client_secret = 'a68722491ae8d9dc26098d9eabb80db7';
const scope = 'chat:write:user';
const redirect_uri = 'https://c3618dd9.ngrok.io/authorized';

const userGitMapWithSlack = {
  trickpeeraze: {
    username: 'trickpeeraze',
    token: '',
  },
};

fastify.get('/', (_, reply) => {
  reply.send('Home page')
});

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

    fastify.log.info(res.data);
  } catch(err) {
    fastify.log.error(err);
  }

  fastify.log.info(request.body);

  reply.code(204).send();
});

fastify.get('/authorize', (_, reply) => {
  const api = 'https://slack.com/oauth/authorize';
  const state = 'grant';
  // const team = '';

  const url = `${api}?client_id=${client_id}&scope=${scope}&state=${state}&redirect_uri=${redirect_uri}`;

  reply.redirect(url);
});

fastify.get('/authorized', async (req, reply) => {
  fastify.log.info('TCL: req.params', req.query.code);

  if (req.query.error) {
    reply.redirect('/');
  }

  if (req.query.state === 'grant' && req.query.code) {
    const api  = 'https://slack.com/api/oauth.access';
    const code = req.query.code;

    try {
      const res = await axios.post(api, qs.stringify({
        client_id,
        client_secret,
        code,
        redirect_uri,
      }));

      fastify.log.info(res.data);
    } catch (err) {
      fastify.log.error(err);
    } finally {
      reply.redirect('/');
    }
  }
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
