/**

 Copyright 2021 University of Denver

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

const APP = require('../repo'),
    REQUEST = require('supertest'),
    CONFIG = require('../config/config'),
    DB = require('../config/db')(),
    DBM = require('../libs/db-migrations'),
    CHAI = require('chai'),
    EXPECT = CHAI.expect,
    API_KEY = CONFIG.apiKey;

const USERNAME = process.env.USERNAME,
    EMAIL = process.env.EMAIL,
    FIRST_NAME = 'Tester',
    LAST_NAME = 'Testerson',
    PASSWORD = process.env.PASSWORD,
    TEST_URI = '/repositories/2/resources/496',
    ROOT_PID = 'codu:root';

const USER = {
    du_id: USERNAME,
    email: EMAIL,
    first_name: FIRST_NAME,
    last_name: LAST_NAME,
    is_active: 1
};

const endpoints = {
    users: '/api/admin/v1/users', // POST, GET, PUT, DELETE
    authenticate: '/api/authenticate',
    repo_objects: '/api/admin/v1/repo/objects', // GET
    repo_unpublish: '/api/admin/v1/repo/unpublish', // POST
    repo_object: '/api/admin/v1/repo/object',  // GET, POST, DELETE
    repo_object_thumbnail: '/api/admin/v1/repo/object/thumbnail', // GET, POST
    repo_object_tn: '/api/admin/v1/repo/object/tn', // GET
    repo_object_viewer: '/api/admin/v1/repo/object/viewer', // GET
    repo_publish: '/api/admin/v1/repo/publish', // POST
    import_list: '/api/admin/v1/import/list', // GET
    import_queue_objects: '/api/admin/v1/import/queue_objects' // POST
    // import_start_transfer: '/api/admin/v1/import/start_transfer' // POST -- starts by calling queue_objects
};

DBM.up();

setTimeout(function () {

    describe('DigitalDU-Backend API Integration Tests', function () {

        before(function () {
            // DBM.up();
        });

        after(function () {
            DBM.down();
        });

        // 1.) Create test user
        describe('POST User object: creates new user', function () {

            it('Test endpoint: ' + endpoints.users, function (done) {

                REQUEST(APP)
                    .post(endpoints.users + '?api_key=' + API_KEY)
                    .send(USER)
                    .set('Content-Type', 'application/json')
                    .end(function (error, res) {
                        EXPECT(res.statusCode).to.equal(201);
                        done();
                    });
            });
        });

        // 2.) Get all users
        describe('GET User: Gets all users', function () {
            it('Test endpoint: ' + endpoints.users, function (done) {

                REQUEST(APP)
                    .get(endpoints.users + '?api_key=' + API_KEY)
                    .end(function (error, res) {
                        EXPECT(res.statusCode).to.equal(200);
                        done();
                    });
            });
        });

        // 3.) Get single user
        describe('GET User: Gets single user', function () {
            it('Test endpoint: ' + endpoints.users, function (done) {

                REQUEST(APP)
                    .get(endpoints.users + '?id=1&api_key=' + API_KEY)
                    .end(function (error, res) {
                        EXPECT(res.statusCode).to.equal(200);
                        done();
                    });
            });
        });

        // 4.) Authenticate User
        describe('POST Authenticate user', function () {
            it('Test authentication: ' + endpoints.authenticate, function (done) {

                let user = {
                    username: USERNAME,
                    password: PASSWORD
                };

                REQUEST(APP)
                    .post(endpoints.authenticate)
                    .send(JSON.stringify(user))
                    .set('Content-Type', 'application/json')
                    .end(function (error, res) {
                        EXPECT(res.statusCode).to.equal(200);
                        done();
                    });
            });
        });

        // 5.) Create Collection
        describe('POST Repository object: creates collection object', function () {
            it('Test endpoint: ' + endpoints.repo_object, function (done) {

                let data = {
                    is_member_of_collection: ROOT_PID,
                    uri: TEST_URI
                };

                REQUEST(APP)
                    .post(endpoints.repo_object + '?api_key=' + API_KEY)
                    .send(data)
                    .set('Content-Type', 'application/json')
                    .end(function (error, res) {
                        EXPECT(res.statusCode).to.equal(201);
                        done();
                    });
            });
        });

        // 6.) Publish Collection
        describe('POST Repository collection: publishes collection', function () {
            it('Test endpoint: ' + endpoints.repo_publish, function (done) {

                DB('tbl_objects')
                    .select('sip_uuid')
                    .where({
                        object_type: 'collection',
                        is_active: 1
                    }).limit(1)
                    .then(function(record) {

                        let data = {
                            pid: record[0].sip_uuid,
                            type: 'collection'
                        };

                        REQUEST(APP)
                            .post(endpoints.repo_publish + '?api_key=' + API_KEY)
                            .send(data)
                            .set('Content-Type', 'application/json')
                            .end(function (error, res) {
                                EXPECT(res.statusCode).to.equal(201);
                                done();
                            });
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            });
        });

        // 7.) List import objects
        describe('GET Import package list: Gets list of import packages', function () {
            it('Test endpoint: ' + endpoints.import_list, function (done) {

                DB('tbl_objects')
                    .select('sip_uuid')
                    .where({
                        object_type: 'collection',
                        is_active: 1
                    }).limit(1)
                    .then(function(record) {

                        let package_name = record[0].sip_uuid;

                        REQUEST(APP)
                            .get(endpoints.import_list + '?collection=' + package_name + '&api_key=' + API_KEY)
                            .end(function (error, res) {
                                EXPECT(res.statusCode).to.equal(200);
                                done();
                            });
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            });
        });

        // 8.) Save import queue objects
        describe('POST Queue repository import object', function () {
            it('Test endpoint: ' + endpoints.import_queue_objects, function (done) {

                DB('tbl_objects')
                    .select('sip_uuid')
                    .where({
                        object_type: 'collection',
                        is_active: 1
                    }).limit(1)
                    .then(function(record) {

                        let data = {
                            collection: record[0].sip_uuid
                        };

                        REQUEST(APP)
                            .post(endpoints.import_queue_objects + '?api_key=' + API_KEY)
                            .send(data)
                            .set('Content-Type', 'application/json')
                            .end(function (error, res) {
                                EXPECT(res.statusCode).to.equal(201);
                                done();
                            });
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            });
        });

        /*
        describe('GET Repository objects: Gets all objects', function () {
            it('Test endpoint: ' + endpoints.repo_objects, function (done) {

                REQUEST(APP)
                    .get(endpoints.repo_objects + '?pid=' + ROOT_PID + '&api_key=' + API_KEY)
                    .end(function (error, res) {
                        EXPECT(res.statusCode).to.equal(200);
                        done();
                    });
            });
        });
        */

        /*
        describe('GET Repository object: Gets a single display record from DB', function () {
            it('Test endpoint: ' + endpoints.repo_object, function (done) {

                REQUEST(APP)
                    .get(endpoints.repo_objects + '?pid=' + ROOT_PID + '&api_key=' + API_KEY)
                    .end(function (error, res) {
                        EXPECT(res.statusCode).to.equal(200);
                        done();
                    });
            });
        });
        */

        // TODO: run test towards the end of the tests
        /*
        describe('DELETE Repository object: deletes object from DB', function () {
            it('Test endpoint: ' + endpoints.repo_object, function (done) {

                (async function(){

                    let record = [];
                    record = await get_test_sip_uuid();

                    if (record.length === 0 || record[0].is_published === 1) {
                        record = await get_test_sip_uuid();
                    }

                    if (record.length === 1 && record[0].is_published === 0) {

                        let data = {
                            pid: record[0].sip_uuid,
                            delete_reason: 'Test Object.'
                        };

                        REQUEST(APP)
                            .delete(endpoints.repo_object + '?api_key=' + API_KEY)
                            .send(data)
                            .set('Content-Type', 'application/json')
                            .end(function (error, res) {
                                EXPECT(res.statusCode).to.equal(204);
                                done();
                            });
                    }

                })()
            });
        });
        */

        /*
        describe('GET Repository object thumbnail: Gets object thumbnail (from DuraCloud)', function () {
            it('Test endpoint: ' + endpoints.repo_object_thumbnail, function (done) {

                REQUEST(APP)
                    .get(endpoints.repo_object_thumbnail + '?tn=' + TEST_TN + '&api_key=' + API_KEY)
                    .end(function (error, res) {
                        EXPECT(res.statusCode).to.equal(200);
                        done();
                    });
            });
        });
        */

        /*
        describe('GET Repository object thumbnail: Gets object thumbnail (from local TN service)', function () {
            it('Test endpoint: ' + endpoints.repo_object_tn, function (done) {

                REQUEST(APP)
                    .get(endpoints.repo_object_tn + '?uuid=' + TEST_TN_UUID + '&type=&api_key=' + API_KEY)
                    .end(function (error, res) {
                        EXPECT(res.statusCode).to.equal(200);
                        done();
                    });
            });
        });
        */

        /*
        describe('GET Repository object image viewer: Gets object image viewer (from local TN service)', function () {
            it('Test endpoint: ' + endpoints.repo_object_viewer, function (done) {

                REQUEST(APP)
                    .get(endpoints.repo_object_viewer + '?uuid=' + TEST_TN_UUID + '&api_key=' + API_KEY)
                    .redirects(1) // <-- handles 302 redirect
                    .end(function (error, res) {
                        EXPECT(res.statusCode).to.equal(200);
                        done();
                    });
            });
        });
        */

        /*
        describe('POST Repository object: unpublishes object', function () {
            it('Test endpoint: ' + endpoints.repo_unpublish, function (done) {

                let data = {
                    pid: TEST_PID,
                    type: 'object'
                };

                REQUEST(APP)
                    .post(endpoints.repo_unpublish + '?api_key=' + API_KEY)
                    .send(data)
                    .set('Content-Type', 'application/json')
                    .end(function (error, res) {
                        EXPECT(res.statusCode).to.equal(201);
                        done();
                    });
            });
        });
         */

        /*
        describe('POST Repository object: unpublishes collection', function () {
            it('Test endpoint: ' + endpoints.repo_unpublish, function (done) {

                let data = {
                    pid: TEST_PID,
                    type: 'collection'
                };

                REQUEST(APP)
                    .post(endpoints.repo_unpublish + '?api_key=' + API_KEY)
                    .send(data)
                    .set('Content-Type', 'application/json')
                    .end(function (error, res) {
                        EXPECT(res.statusCode).to.equal(201);
                        done();
                    });
            });
        });

         */
    });

    run();

}, 5000);