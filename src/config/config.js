var db = require("mysql");
require("dotenv").config();
const env = process.env;
module.exports = {
  connection: db.createConnection({
    host: env.DB_HOST,
    user: env.DB_USERNAME,
    port: 3306,
    password: env.DB_PASSWORD,
    database: env.DB_INSTANCE,
  }),
};
