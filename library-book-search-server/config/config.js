require('dotenv').config();

const development = {
  username: process.env.MYSQL_DEVELOPMENT_USERNAME,
  password: process.env.MYSQL_DEVELOPMENT_PASSWORD,
  database: process.env.MYSQL_DEVELOPMENT_DATABASE,
  host: process.env.MYSQL_DEVELOPMENT_HOST,
  dialect: "mysql",
};

const test = {
  username: process.env.MYSQL_TEST_USERNAME,
  password: process.env.MYSQL_TEST_PASSWORD,
  database: process.env.MYSQL_TEST_DATABASE,
  host: process.env.MYSQL_TEST_HOST,
  dialect: "mysql"
};

const production = {
  username: process.env.MYSQL_PRODUCTION_USERNAME,
  password: process.env.MYSQL_PRODUCTION_PASSWORD,
  database: process.env.MYSQL_PRODUCTION_DATABASE,
  host: process.env.MYSQL_PRODUCTION_HOST,
  dialect: "mysql"
};

module.exports = { development, test, production };
