module.exports = class Users {
  constructor(db) {
    this.db = db;
    // this.db._.id = 'id';
    this.collectionName = 'users';
    this.collection = db.get(this.collectionName);
  }

  getById(id) {
    return this.collection.getById(id).value();
  }
  insert(document) {
    return this.collection.insert(document).write();
  }
  upsert(document) {
    return this.collection.upsert(document).write();
  }
  updateById(id, attrs) {
    return this.collection.updateById(id, attrs).write();
  }
  updateWhere(whereAttrs, attrs) {
    return this.collection.updateById(whereAttrs, attrs).write();
  }
  replaceById(id, attrs) {
    return this.collection.replaceById(id, attrs).write();
  }
  removeById(id) {
    return this.collection.removeById(id).write();
  }
  removeWhere(whereAttrs) {
    return this.collection.removeWhere(whereAttrs).write();
  }

  find(predicate) {
    return this.collection.find(predicate).value();
  }

  getAll() {
    return this.collection.value();
  }

  getByGithubId(id) {
    return this.find({ github_id: id });
  }
};
