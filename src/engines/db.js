const Low = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");

let _db;

exports.load = async function() {
  return (
    _db ||
    Low(
      new FileAsync("db.json", {
        defaultValue: {
          users: []
        }
      })
    ).then(db => (_db = db))
  );
};
