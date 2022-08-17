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

const HTTP = require('axios'),
    LOGGER = require('../libs/log4'),
    TIMEOUT = 35000,
    HEADER = {
        'Content-Type': 'application/json'
    };

const Duracloud_lib = class {

    constructor(DURACLOUD_CONFIG, CONVERT_SERVICE_CONFIG) {
        this.DURACLOUD = DURACLOUD_CONFIG;
        this.CONVERT_SERVICE = CONVERT_SERVICE_CONFIG;
    }

    /**
     * Pings duracloud service to check availability
     */
    ping = () => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    let endpoint = 'https://' + this.DURACLOUD.duracloud_user;
                    endpoint += ':';
                    endpoint += this.DURACLOUD.duracloud_password;
                    endpoint += '@';
                    endpoint += this.DURACLOUD.duracloud_api;

                    let response = await HTTP.get(endpoint, {
                        timeout: TIMEOUT,
                        headers: HEADER
                    });

                    if (response.status === 200) {
                        resolve(true);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/libs/duracloud lib (ping)] unable to ping duracloud ' + error);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Gets METS file
     * @param uuid
     * @param dip_path
     */
    get_mets = (uuid, dip_path) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    let mets = 'METS.' + uuid + '.xml';
                    let endpoint = 'https://' + this.DURACLOUD.duracloud_user;
                    endpoint += ':';
                    endpoint += this.DURACLOUD.duracloud_password;
                    endpoint += '@' + this.DURACLOUD.duracloud_api;
                    endpoint += 'dip-store/';
                    endpoint +=  dip_path + '/' + mets;

                    let response = await HTTP.get(endpoint, {
                        timeout: TIMEOUT,
                        headers: HEADER
                    });

                    if (response.status === 200) {
                        resolve({
                            mets: response.data,
                            uuid: uuid
                        });
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/libs/duracloud lib (get_mets)] Unable to get METS ' + error);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Gets objects/header info
     * @param uuid
     * @param dip_path
     * @param file
     * @returns {boolean}
     */
    get_object_info = (uuid, dip_path, file) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    let endpoint = 'https://' + this.DURACLOUD.duracloud_user;
                    endpoint += ':';
                    endpoint += this.DURACLOUD.duracloud_password;
                    endpoint += '@';
                    endpoint += this.DURACLOUD.duracloud_api;
                    endpoint += 'dip-store/';
                    endpoint += dip_path;
                    endpoint += '/objects/';
                    endpoint += uuid + '-' + file;

                    let response = await HTTP.head(endpoint, {
                        timeout: TIMEOUT
                    });

                    if (response.status === 200) {
                        resolve({
                            headers: response.headers,
                            file: file
                        });
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/libs/duracloud lib (get_object_info)] Unable to get duracloud object ' + error.message);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Used for archivesspace uri.txt retrieval
     * @param uuid
     * @param dip_path
     * @param file
     */
    get_uri = (uuid, dip_path, file) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    let endpoint = 'https://' + this.DURACLOUD.duracloud_user;
                    endpoint += ':';
                    endpoint += this.DURACLOUD.duracloud_password;
                    endpoint += '@';
                    endpoint += this.DURACLOUD.duracloud_api;
                    endpoint += 'dip-store/';
                    endpoint += dip_path;
                    endpoint += '/objects/';
                    endpoint += uuid + '-' + file;

                    let response = await HTTP.get(endpoint, {
                        timeout: TIMEOUT,
                        headers: HEADER
                    });

                    if (response.status === 200) {
                        resolve(response.data);
                    }

                    return false;

                } catch (error) {
                    LOGGER.module().error('ERROR: [/libs/duracloud lib (get_uri)] Unable to get duracloud uri object ' + error);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Gets manifest for chunked files
     * @param uuid
     * @param dip_path
     * @param file
     */
    get_object_manifest = (uuid, dip_path, file) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    let endpoint = 'https://' + this.DURACLOUD.duracloud_user;
                    endpoint += ':';
                    endpoint += this.DURACLOUD.duracloud_password;
                    endpoint += '@';
                    endpoint += this.DURACLOUD.duracloud_api;
                    endpoint += 'dip-store/';
                    endpoint += dip_path;
                    endpoint += '/objects/';
                    endpoint += uuid + '-' + file + '.dura-manifest';


                    let response = await HTTP.get(endpoint, {
                        timeout: TIMEOUT,
                        headers: HEADER
                    });

                    if (response.status === 200) {
                        resolve(response.data);
                    }

                } catch (error) {
                    LOGGER.module().warn('WARN: [/libs/duracloud lib (get_object_manifest)] Unable to get duracloud manifest.  Objects under 1GB do not have a manifest. ' + error);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Gets thumbnail and renders it for client to consume
     * @param tn
     */
    get_thumbnail = (tn) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    let endpoint = 'https://' + this.DURACLOUD.duracloud_user;
                        endpoint += ':';
                        endpoint += this.DURACLOUD.duracloud_password;
                        endpoint += '@';
                        endpoint += this.DURACLOUD.duracloud_api;
                        endpoint += 'dip-store/';
                        endpoint += tn;

                    let response = await HTTP.get(endpoint, {
                        timeout: TIMEOUT,
                        responseType: 'arraybuffer'
                    });

                    if (response.status === 200) {
                        resolve(response.data);
                    }

                } catch (error) {
                    LOGGER.module().error('ERROR: [/libs/duracloud lib (get_thumbnail)] Unable to get duracloud thumbnail ' + error.message);
                    // TODO: move missing_tn
                    /*
                    let missing_tn = '/images/image-tn.png';
                    resolve({
                        data: missing_tn
                    });
                     */
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };

    /**
     * Sends object data to convert service
     * @param data
     */
    convert_service = (data) => {

        let promise = new Promise((resolve, reject) => {

            (async () => {

                try {

                    let service = this.CONVERT_SERVICE.convert_service_endpoint;
                    let service_api_key = this.CONVERT_SERVICE.convert_service_api_key;
                    let endpoint;

                    if (data.mime_type === 'image/tiff') {
                        endpoint = '/api/v1/convert/tiff';
                    }

                    if (endpoint === undefined) {
                        LOGGER.module().info('INFO: [/duracloud/lib (convert_service)] Conversion not required.');
                        resolve(true);
                    }

                    let url = service + endpoint + '?api_key=' + service_api_key;
                    let response = await HTTP.post(url, data, {
                        timeout: '60000',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 201) {
                        LOGGER.module().info('INFO: [/duracloud/lib (convert_service)] ' + response.data.data);
                        resolve(true);
                    }

                    return false;

                } catch (error) {
                    LOGGER.module().error('ERROR: [/duracloud/lib (convert_service)] convert failed. Request failed: ' + error);
                    reject(false);
                }

            })();
        });

        return promise.then((response) => {
            return response;
        }).catch((error) => {
            return error;
        });
    };
};

module.exports = Duracloud_lib;