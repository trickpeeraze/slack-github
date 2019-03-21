const qs = require('querystring');
const axios = require('axios');

const {
  BASE_URI,
  SLACK_CLIENT_ID,
  AUTH_COOKIE_NAME,
  SLACK_CLIENT_SECRET,
} = process.env;

exports.authorize = (req, reply) => {
  const api = 'https://slack.com/oauth/authorize';
  const state = 'grant';

  const params = qs.stringify({
    state,
    client_id: SLACK_CLIENT_ID,
    scope: 'identity.basic identity.avatar',
    redirect_uri: BASE_URI + '/authorized',
  });
  const url = `${api}?${params}`;

  reply.redirect(url);
};

exports.authorized = async (req, reply) => {
  if (req.query.error) {
    return req.query.error;
  }

  req.log.info(req.headers);

  if (req.query.state === 'grant' && req.query.code) {
    const api = 'https://slack.com/api/oauth.access';
    const code = req.query.code;

    try {
      const { data } = await axios.post(
        api,
        qs.stringify({
          code,
          client_id: SLACK_CLIENT_ID,
          client_secret: SLACK_CLIENT_SECRET,
          redirect_uri: BASE_URI + '/authorized',
        })
      );

      req.log.info(data);

      if (data.ok) {
        // still not implement token rotation
        // https://api.slack.com/docs/rotating-and-refreshing-credentials
        const user = req.users.getById(data.user.id);

        if (!user) {
          const newUser = {
            user_id: data.user.id,
            user_name: data.user.name,
            team_id: data.team.id,
            token: data.access_token,
          };

          req.users.addUser(newUser);
        }
        reply.setCookie(AUTH_COOKIE_NAME, data.access_token);

        return { ok: true, message: 'authorized' };
      } else {
        throw data;
      }
    } catch (err) {
      req.log.error(err);
      reply.code(403);

      return { ok: false, message: 'authorize failed' };
    }
  }
};