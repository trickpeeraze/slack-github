require('dotenv').config();
require('make-promises-safe');

const Fastify      = require('fastify');
const cookiePlugin = require('fastify-cookie');
const axios        = require('axios');
const qs           = require('querystring');
const Low          = require('lowdb')
const FileAsync    = require('lowdb/adapters/FileAsync')

const CHANNEL     = '#test_github';
const GITHUB_USER = 'trickpeeraze';
const COOKIE_NAME = 'auth';

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

server.register(cookiePlugin);

let db;

async function getDB() {
  db = await Low(new FileAsync('db.json', {
    defaultValue: {
      users: []
    },
  }));
}

server.get('/', (req, reply) => {
  const token = req.cookies[COOKIE_NAME];

  reply.send({
    message: 'home page',
    token,
  });
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

server.get('/authorize', (req, reply) => {
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
  if (req.query.error) {
    reply.send(req.query.error);
  }

  server.log.info(req.headers);

  if (req.query.state === 'grant' && req.query.code) {
    const api  = 'https://slack.com/api/oauth.access';
    const code = req.query.code;
    const pickFromResponse = ['access_token', 'scope', 'user_id', 'team_name', 'team_id'];

    try {
      const { data } = await axios.post(api, qs.stringify({
        code,
        client_id:     SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        redirect_uri:  SLACK_REDIRECT_URI,
      }));

      server.log.info(data);

      if (data.ok) {
        // still not implement token rotation
        // https://api.slack.com/docs/rotating-and-refreshing-credentials
        const user = db
          .get('users')
          .find({ 'user_id': data.user_id })
          .value();

        if (!user) {
          db
            .get('users')
            .push(db._.pick(data, pickFromResponse))
            .write();
        }
        reply
          .setCookie(COOKIE_NAME, data.access_token)
          .send('authorized');
      } else {
        throw data;
      }
    } catch (err) {
      server.log.error(err);
      reply.send('authorize failed');
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

getDB();
start();
