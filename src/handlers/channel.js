const isEmpty = require('lodash/isEmpty');
const axios = require('axios');
const slack = require('../slack');

module.exports = async (req, reply) => {
  throwifEventNotsupport(req);
  throwifHasNoUser(req);

  const blocks = getBlocks(req);
  const channel = req.params.channelId;
  const postMessageEndpoint = 'https://slack.com/api/chat.postMessage';
  const slackUser = req.users.getByGithubId(req.body.sender.login);
  const headers = {
    Authorization: `Bearer ${slackUser.token}`,
    'Content-Type': 'application/json',
  };

  try {
    const res = await axios.post(
      postMessageEndpoint,
      { blocks, channel },
      { headers }
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

function throwifHasNoUser(req) {
  if (isEmpty(req.body.sender)) throw new Error('Could not find the sender.');

  // TODO: support two mode "user" and "bot" in case that
  //       users don't grant any permissions
  const slackUser = req.users.getByGithubId(req.body.sender.login);
  if (!slackUser) throw new Error("Could not find the slack's user.");
}

function throwifEventNotsupport(req) {
  const event = req.headers['x-github-event'];

  if (!slack[event])
    throw new Error(`Event "${event}" doesn't currently support.`);
}

function getBlocks(req) {
  const event = req.headers['x-github-event'];
  const blocks = slack[event](req.body, req.users);

  if (!blocks)
    throw new Error(
      `Event action "${req.body.action}" doesn't currently support.`
    );

  return blocks;
}
