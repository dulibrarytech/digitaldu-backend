'use strict';

module.exports = {
    host: process.env.HOST,
    ldap: process.env.LDAP_URL,
    tokenSecret: process.env.TOKEN_SECRET,
    tokenAlgo: process.env.TOKEN_ALGO,
    tokenExpires: process.env.TOKEN_EXPIRES,
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    elasticSearch: process.env.ELASTIC_SEARCH,
    elasticSearchIndex: process.env.ELASTIC_SEARCH_INDEX,
    communityTnPath: process.env.COMMUNITY_TN_PATH,
    collectionTnPath: process.env.COLLECTION_TN_PATH,
    objectPath: process.env.OBJECT_PATH,
    errorTn: process.env.ERROR_TN,
    smtp: process.env.SMTP,
    fromEmail: process.env.FROM_EMAIL,
    emailSubject: process.env.SUBJECT
};