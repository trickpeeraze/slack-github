const axios = require("axios");

const COOKIE_NAME = "auth";

module.exports = async (req, reply) => {
  const token = req.cookies[COOKIE_NAME];

  if (token) {
    const { data = {} } = await axios.get(
      "https://slack.com/api/users.identity",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (data.user) {
      const user = req.users.getById(data.user.id);
      if (!user) {
        // out of sync
        reply.redirect("/authorize");
      }
      data.user.github_id = user.github_id;
      reply.type("text/html");

      reply.render("index", data);
    }
  }

  reply.redirect("/authorize");
};
