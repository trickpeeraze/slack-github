const axios = require('axios');
const slack = require('../../slack');

module.exports = async (req, reply) => {
  if (isPing(req)) {
    reply.code(204);
    return;
  }
  throwifEventNotsupport(req);

  const payload = getPayload(req);
  const channel = req.params.channelId;
  const ikameshiEndpoint = `http://ikameshi.linecorp.com/webhook/${channel}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const res = await axios.post(ikameshiEndpoint, payload, { headers });

    req.log.info(res.data);
    reply.code(204);

    return;
  } catch (err) {
    req.log.error(err);
    reply.code(500);

    return err;
  }
};

function isPing(req) {
  return req.headers['x-github-event'] === 'ping';
}

function throwifEventNotsupport(req) {
  const event = req.headers['x-github-event'];

  if (!slack[event])
    throw new Error(`Event "${event}" doesn't currently support.`);
}

function getPayload(req) {
  const event = req.headers['x-github-event'];
  const payload = slack[event](req.body, { mode: process.env.SLACK_MODE });

  if (!payload)
    throw new Error(
      `Event action "${req.body.action}" doesn't currently support.`
    );

  return payload;
}
