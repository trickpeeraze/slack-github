require('dotenv').config();
require('make-promises-safe');

const Fastify      = require('fastify');
const cookiePlugin = require('fastify-cookie');
const axios        = require('axios');
const fs           = require('fs');
const _            = require('lodash');
const qs           = require('querystring');
const Low          = require('lowdb');
const FileAsync    = require('lowdb/adapters/FileAsync');

const CHANNEL     = '#test_github';
const GITHUB_USER = 'trickpeeraze';
const COOKIE_NAME = 'auth';

_.templateSettings.interpolate = /\{\{([\s\S]+?)\}\}/g;

const {
  PORT = 3000,
  SLACK_CLIENT_ID,
  SLACK_CLIENT_SECRET,
  SLACK_SCOPE,
  SLACK_REDIRECT_URI,
} = process.env;

const server = Fastify({
  logger: true,
});

server.register(cookiePlugin);

let db;

async function getDB() {
  db = await Low(new FileAsync('db.json', {
    defaultValue: {
      users: [],
    },
  }));
}

server.get('/', async (req, reply) => {
  const token = req.cookies[COOKIE_NAME];

  if (token) {
    // TODO: this should be cache
    const view = fs.readFileSync('./views/index.html');
    const render = _.template(view);
    const { data = {} } = await axios.get('https://slack.com/api/users.identity', {
      headers: { Authorization: `Bearer ${token}` }
    });

    data.user.github_id = db
      .get('users')
      .find({ 'user_id': data.user.id })
      .get('github_id')
      .value();
    
    reply
      .type('text/html')
      .send(render(data));
  } else {
    reply.send({
      message: 'home page',
      token,
    });
  }
});

server.post('/update-info', async (req, reply) => {
  const { github_id, user_id } = req.body;

  db
    .get('users')
    .find({ 'user_id': user_id })
    .set('github_id', github_id)
    .write();

  reply.send({
    ok: true
  });
});

// TODO: this shoud add some nonce to the url for some security.
server.post('/channel/:channelId', async (req, reply) => {
  const payload   = req.body;
  const channelId = req.params.channelId;

  if (_.isEmpty(payload.sender)) return new Error('Could not find the sender.');

  const github_id = payload.sender.login;
  const slackUser = db
    .get('users')
    .find({ github_id })
    .value();
  
  if (!slackUser) return new Error('Could not find the slack\'s user.');

  try {
    const res = await axios.post('https://slack.com/api/chat.postMessage', {
      channel: channelId,
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
    reply.code(204);

    return;
  } catch(err) {
    server.log.error(err);
    
    return err;
  }
});

server.get('/authorize', (req, reply) => {
  const api   = 'https://slack.com/oauth/authorize';
  const state = 'grant';

  const params = qs.stringify({
    state,
    client_id:    SLACK_CLIENT_ID,
    scope:        'identity.basic identity.avatar',
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
    const pickFromResponse = ['access_token', 'user', 'team_name', 'team_id'];

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
            .push({
              user_id: data.user.id,
              team_id: data.team.id,
              token:   data.access_token,
            })
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
