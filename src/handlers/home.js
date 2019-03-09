const _template = require("lodash/template");
const fs = require("fs");
const axios = require("axios");

const COOKIE_NAME = "auth";

module.exports = async (req, reply) => {
  const token = req.cookies[COOKIE_NAME];

  if (token) {
    // TODO: this should be cache
    const view = fs.readFileSync("./views/index.html");
    const render = _template(view);
    const { data = {} } = await axios.get(
      "https://slack.com/api/users.identity",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    data.user.github_id = req.db
      .get("users")
      .find({ user_id: data.user.id })
      .get("github_id")
      .value();

    reply.type("text/html");

    return render(data);
  }

  return {
    message: "home page",
    token
  };
};
