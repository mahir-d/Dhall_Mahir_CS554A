const MongoClient = require("mongodb", { useUnifiedTopology: true }).MongoClient;

const mongoConfig = {
  serverUrl: "mongodb://localhost:27017/",
  database: "Dhall-Mahir-CS554-Lab1"
};

let _connection = undefined;
let _db = undefined;

module.exports = async () => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl, { useUnifiedTopology: true });
    _db = await _connection.db(mongoConfig.database);
  }

  return _db;
};