/**

 Copyright 2019 University of Denver

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 */

'use strict';

module.exports = {
    host: process.env.HOST,
    ldap: process.env.LDAP_URL,
    tokenSecret: process.env.TOKEN_SECRET,
    tokenAlgo: process.env.TOKEN_ALGO,
    tokenExpires: process.env.TOKEN_EXPIRES,
    tokenIssuer: process.env.TOKEN_ISSUER,
    apiKey: process.env.API_KEY,
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dbQueueHost: process.env.DB_QUEUE_HOST,
    dbQueueUser: process.env.DB_QUEUE_USER,
    dbQueuePassword: process.env.DB_QUEUE_PASSWORD,
    dbQueueName: process.env.DB_QUEUE_NAME,
    elasticSearch: process.env.ELASTIC_SEARCH,
    elasticSearchFrontIndex: process.env.ELASTIC_SEARCH_FRONT_INDEX,
    elasticSearchBackIndex: process.env.ELASTIC_SEARCH_BACK_INDEX,
    elasticSearchShards: process.env.ELASTIC_SEARCH_SHARDS,
    elasticSearchReplicas: process.env.ELASTIC_SEARCH_REPLICAS,
    indexTimer: process.env.INDEX_TIMER,
    apiUrl: process.env.API_URL,
    uuidDomain: process.env.UUID_DOMAIN,
    namespace: process.env.REPO_NAMESPACE,
    sftpHost: process.env.SFTP_HOST,
    sftpId: process.env.SFTP_ID,
    sftpPwd: process.env.SFTP_PWD,
    sftpRemotePath: process.env.SFTP_REMOTE_PATH,
    archivematicaApi: process.env.ARCHIVEMATICA_API,
    archivematicaUsername: process.env.ARCHIVEMATICA_USERNAME,
    archivematicaPassword: process.env.ARCHIVEMATICA_PASSWORD,
    archivematicaApiKey: process.env.ARCHIVEMATICA_API_KEY,
    archivematicaTransferSource: process.env.ARCHIVEMATICA_TRANSFER_SOURCE,
    archivematicaStorageApi: process.env.ARCHIVEMATICA_STORAGE_API,
    archivematicaStorageUsername: process.env.ARCHIVEMATICA_STORAGE_USERNAME,
    archivematicaStorageApiKey: process.env.ARCHIVEMATICA_STORAGE_API_KEY,
    archivespaceHost: process.env.ARCHIVESPACE_HOST,
    archivespaceRepositoryid: process.env.ARCHIVESPACE_REPOSITORY_ID,
    archivespaceUser: process.env.ARCHIVESPACE_USER,
    archivespacePassword: process.env.ARCHIVESPACE_PASSWORD,
    duraCloudApi: process.env.DURACLOUD_API,
    duraCloudUser: process.env.DURACLOUD_USER,
    duraCloudPwd: process.env.DURACLOUD_PWD,
    handleHost: process.env.HANDLE_HOST,
    handlePrefix: process.env.HANDLE_PREFIX,
    handleUsername: process.env.HANDLE_USERNAME,
    handlePwd: process.env.HANDLE_PWD,
    handleTarget: process.env.HANDLE_TARGET,
    handleServer: process.env.HANDLE_SERVER,
    transferTimer: process.env.TRANSFER_TIMER,
    importTimer: process.env.IMPORT_TIMER,
    ingestStatusTimer: process.env.INGEST_STATUS_TIMER,
    transferApprovalTimer: process.env.TRANSFER_APPROVAL_TIMER,
    transferStatusCheckInterval: process.env.TRANSFER_STATUS_CHECK_INTERVAL,
    ingestStatusCheckInterval: process.env.INGEST_STATUS_CHECK_INTERVAL,
    tnService: process.env.TN_SERVICE,
    tnServiceApiKey: process.env.TN_SERVICE_API_KEY,
    tnUploadPath: process.env.TN_UPLOAD_PATH
};