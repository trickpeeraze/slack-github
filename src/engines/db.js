const Low = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");

exports.load = async function() {
  return Low(
    new FileAsync("db.json", {
      defaultValue: {
        users: []
      }
    })
  );
};
