module.exports = async req => {
  const { github_id, user_id } = req.body;
  req.users.update(user_id, "github_id", github_id);

  return {
    ok: true
  };
};
