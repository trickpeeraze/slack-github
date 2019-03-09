module.exports = async req => {
  const { github_id, user_id } = req.body;

  req.db
    .get("users")
    .find({ user_id: user_id })
    .set("github_id", github_id)
    .write();

  return {
    ok: true
  };
};
