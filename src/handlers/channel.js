const isEmpty = require("lodash/isEmpty");
const axios = require("axios");

module.exports = async (req, reply) => {
  const payload = req.body;
  const channelId = req.params.channelId;

  if (isEmpty(payload.sender)) return new Error("Could not find the sender.");

  const github_id = payload.sender.login;
  const slackUser = req.db
    .get("users")
    .find({ github_id })
    .value();

  if (!slackUser) return new Error("Could not find the slack's user.");

  try {
    const res = await axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: channelId,
        text: "do something",
        // blocks: [],
        mrkdwn: true
      },
      {
        headers: {
          Authorization: `Bearer ${slackUser.token}`,
          "Content-Type": "application/json"
        }
      }
    );

    req.log.info(res.data);
    reply.code(204);

    return;
  } catch (err) {
    req.log.error(err);

    return err;
  }
};
