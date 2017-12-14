var config = require('../config/config'),
    db = require('knex')({
    client: 'mysql',
    connection: {
        host     : config.dbHost,
        user     : config.dbUser,
        password : config.dbPassword,
        database : config.dbName
    },
        pool: {
            min: 1,
            max: 5
        }
});

module.exports = function () {
  return db;
};