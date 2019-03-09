module.exports = class Users {
  constructor(db) {
    this.collection = "users";
    this.db = db;
  }

  _get() {
    return this.db.get(this.collection);
  }

  find(predicate) {
    return this._get()
      .find(predicate)
      .value();
  }

  getAll() {
    return this._get().value();
  }

  getById(id) {
    return this.find({ user_id: id });
  }

  getByGithubId(id) {
    return this.find({ github_id: id });
  }

  addUser(user) {
    return this._get()
      .push(user)
      .write();
  }

  update(id, field, value) {
    this.getById(id)
      .set(field, value)
      .write();
  }
};
