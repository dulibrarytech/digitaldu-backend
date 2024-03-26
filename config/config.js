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
    appName: process.env.APP_NAME,
    appHost: process.env.APP_HOST,
    appVersion: process.env.APP_VERSION,
    organization: process.env.ORGANIZATION,
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
    ingestServiceHost: process.env.INGEST_SERVICE_HOST,
    // elasticSearch: process.env.ELASTIC_SEARCH,
    // elasticSearchFrontIndex: process.env.ELASTIC_SEARCH_FRONT_INDEX,
    // elasticSearchBackIndex: process.env.ELASTIC_SEARCH_BACK_INDEX,
    // elasticSearchShards: process.env.ELASTIC_SEARCH_SHARDS,
    // elasticSearchReplicas: process.env.ELASTIC_SEARCH_REPLICAS,
    indexTimer: process.env.INDEX_TIMER,
    archivesSpaceTimer: process.env.METADATA_UPDATE_TIMER,
    apiUrl: process.env.API_URL,
    ssoHost: process.env.SSO_HOST,
    ssoUrl: process.env.SSO_URL,
    ssoResponseUrl: process.env.SSO_RESPONSE_URL,
    ssoLogoutUrl: process.env.SSO_LOGOUT_URL,
    uuidDomain: process.env.UUID_DOMAIN,
    namespace: process.env.REPO_NAMESPACE,
    sftpHost: process.env.SFTP_HOST,
    sftpPort: process.env.SFTP_PORT,
    sftpId: process.env.SFTP_ID,
    sftpPwd: process.env.SFTP_PWD,
    sftpRemotePath: process.env.SFTP_REMOTE_PATH,
    qaApiKey: process.env.QA_API_KEY,
    qaUrl: process.env.QA_URL,
    archivematicaApi: process.env.ARCHIVEMATICA_API,
    archivematicaUsername: process.env.ARCHIVEMATICA_USERNAME,
    archivematicaPassword: process.env.ARCHIVEMATICA_PASSWORD,
    archivematicaApiKey: process.env.ARCHIVEMATICA_API_KEY,
    archivematicaTransferSource: process.env.ARCHIVEMATICA_TRANSFER_SOURCE,
    archivematicaStorageApi: process.env.ARCHIVEMATICA_STORAGE_API,
    archivematicaStorageUsername: process.env.ARCHIVEMATICA_STORAGE_USERNAME,
    archivematicaStorageApiKey: process.env.ARCHIVEMATICA_STORAGE_API_KEY,
    archivematicaPipeline: process.env.ARCHIVEMATICA_PIPELINE,
    archivematicaUserId: process.env.ARCHIVEMATICA_USERID,
    archivematicaUserEmail: process.env.ARCHIVEMATICA_USER_EMAIL,
    archivematicaTransferTimeout: process.env.ARCHIVEMATICA_TRANSFER_TIMEOUT,
    archivematicaDipStorage: process.env.ARCHIVEMATICA_DIP_UUID,
    archivematicaAipStorage: process.env.ARCHIVEMATICA_AIP_UUID,
    archivespaceHost: process.env.ARCHIVESPACE_HOST,
    archivespaceRepositoryid: process.env.ARCHIVESPACE_REPOSITORY_ID,
    archivespaceUser: process.env.ARCHIVESPACE_USER,
    archivespacePassword: process.env.ARCHIVESPACE_PASSWORD,
    duraCloudApi: process.env.DURACLOUD_API,
    duraCloudUser: process.env.DURACLOUD_USER,
    duraCloudPwd: process.env.DURACLOUD_PWD,
    handleService: process.env.HANDLE_SERVICE,
    handleApiKey: process.env.HANDLE_API_KEY,
    handleServer: process.env.HANDLE_SERVER,
    handlePrefix: process.env.HANDLE_PREFIX,
    transferTimer: process.env.TRANSFER_TIMER,
    importTimer: process.env.IMPORT_TIMER,
    ingestStatusTimer: process.env.INGEST_STATUS_TIMER,
    transferApprovalTimer: process.env.TRANSFER_APPROVAL_TIMER,
    transferStatusCheckInterval: process.env.TRANSFER_STATUS_CHECK_INTERVAL,
    ingestStatusCheckInterval: process.env.INGEST_STATUS_CHECK_INTERVAL,
    tnService: process.env.TN_SERVICE,
    tnServiceApiKey: process.env.TN_SERVICE_API_KEY,
    tnUploadPath: process.env.TN_UPLOAD_PATH,
    convertService: process.env.CONVERT_SERVICE,
    convertServiceApiKey: process.env.CONVERT_SERVICE_API_KEY,
    transcriptService: process.env.TRANSCRIPT_SERVICE,
    transcriptServiceApiKey: process.env.TRANSCRIPT_SERVICE_API_KEY,
    handleServiceHost: process.env.HANDLE_SERVICE_HOST,
    handleServiceEndpoint: process.env.HANDLE_SERVICE_ENDPOINT,
    handleServiceApiKey: process.env.HANDLE_SERVICE_API_KEY
};
