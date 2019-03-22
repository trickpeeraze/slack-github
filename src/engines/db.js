const Low = require('lowdb');
const lodashId = require('lodash-id');
const FileAsync = require('lowdb/adapters/FileAsync');

let _db;

exports.load = async function() {
  return (
    _db ||
    Low(
      new FileAsync('db.json', {
        defaultValue: {
          users: [],
        },
      })
    ).then(db => {
      _db = db;
      _db._.mixin(lodashId);
      return _db;
    })
  );
};
