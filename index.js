require('dotenv').config();
require('make-promises-safe');

const Fastify = require('fastify');
const axios   = require('axios');
const qs      = require('querystring');

const CHANNEL     = '#test_github';
const GITHUB_USER = 'trickpeeraze';
const {
  PORT = 3000,
  SLACK_CLIENT_ID,
  SLACK_CLIENT_SECRET,
  SLACK_SCOPE,
  SLACK_REDIRECT_URI,
} = process.env;

const userGitMapWithSlack = {
  trickpeeraze: {
    username: 'trickpeeraze',
    token: '',
  },
};

const server = Fastify({
  logger: true,
});

server.get('/', (_, reply) => {
  reply.send('Home page')
});

server.post('/', async (request, reply) => {
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

    server.log.info(res.data);
  } catch(err) {
    server.log.error(err);
  }

  server.log.info(request.body);

  reply.code(204).send();
});

server.get('/authorize', (_, reply) => {
  const api   = 'https://slack.com/oauth/authorize';
  const state = 'grant';

  const params = qs.stringify({
    state,
    client_id:    SLACK_CLIENT_ID,
    scope:        SLACK_SCOPE,
    redirect_uri: SLACK_REDIRECT_URI,
  });
  const url = `${api}?${params}`;

  reply.redirect(url);
});

server.get('/authorized', async (req, reply) => {
  server.log.info('TCL: req.params', req.query.code);

  if (req.query.error) {
    reply.send(req.query.error);
  }

  if (req.query.state === 'grant' && req.query.code) {
    const api  = 'https://slack.com/api/oauth.access';
    const code = req.query.code;

    try {
      const res = await axios.post(api, qs.stringify({
        code,
        client_id:     SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        redirect_uri:  SLACK_REDIRECT_URI,
      }));

      server.log.info(res.data);
    } catch (err) {
      server.log.error(err);
    } finally {
      reply.send('authorized');
    }
  }
});

async function start() {
  server.log.info('Server starting..');

  try {
    await server.listen(PORT);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
