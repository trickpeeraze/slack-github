const isEmpty = require('lodash/isEmpty');
const axios = require('axios');
const slack = require('../slack');

module.exports = async (req, reply) => {
  const payload = req.body;
  const channelId = req.params.channelId;

  if (isEmpty(payload.sender)) return new Error('Could not find the sender.');

  const slackUser = req.users.getByGithubId(payload.sender.login);

  if (!slackUser) return new Error("Could not find the slack's user.");

  const event = req.headers['x-github-event'];

  if (!slack[event])
    return new Error(`Event "${event}" doesn't currently support.`);

  const blocks = slack[event](payload, req.users);

  if (!blocks)
    return new Error(
      `Event action "${payload.action}" doesn't currently support.`
    );

  try {
    const res = await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: channelId,
        text: 'do something',
        blocks,
        mrkdwn: true,
      },
      {
        headers: {
          Authorization: `Bearer ${slackUser.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    req.log.info(res.data);
    reply.code(204);

    return;
  } catch (err) {
    req.log.error(err);
    reply.code(500);

    return err;
  }
};
