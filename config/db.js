const config = require('../config/config'),
    db = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbHost,
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbName
        }
});

module.exports = function () {
  return db;
};