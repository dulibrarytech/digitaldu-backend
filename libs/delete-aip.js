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

// TODO: remove

'use strict';

const CONFIG = require('../config/config'),
    ASYNC = require('async'),
    NIGHTMAREOBJ = require('nightmare'),
    NIGHTMARE = NIGHTMAREOBJ({show: CONFIG.nightmareStatus}),
    ARCHIVEMATICA = require('../libs/archivematica'),
    LOGGER = require('../libs/log4');

exports.delete_aip = function (obj, callback) {

    function delete_from_dashboard(callback) {

        /*
        const archivematica_dashboard_login = CONFIG.archivematicaDashboardLogin;
        const archivematcia_dashboard_aip = CONFIG.archivematicaDashboardAip + obj.pid + '/';
        const archivematica_dashboard_logout = CONFIG.archivematicaDashboardLogout;
        const archivematica_dashboard_username = CONFIG.archivematicaDashboardUsername;
        const archivematica_dashboard_password = CONFIG.archivematicaDashboardPassword;
        */

        ARCHIVEMATICA.delete_aip_request(obj, function(result) {
            console.log(result.data);
        });

        /*
        NIGHTMARE
            .goto(archivematica_dashboard_login)
            .insert('#id_username', archivematica_dashboard_username)
            .insert('#id_password', archivematica_dashboard_password)
            .click('.btn-primary')
            .wait(20000)
            .goto(archivematcia_dashboard_aip)
            .wait(3000)
            .click('a[href="#tab-delete"]')
            .wait(2000)
            .insert('#id_delete-uuid', obj.pid)
            .insert('#id_delete-reason', obj.delete_reason)
            .click('.btn-danger')
            .wait(7000)
            .goto(archivematica_dashboard_logout)
            .wait(3000)
            .end()
            .then(function() {
                obj.set_delete = true;
                callback(null, obj);
            })
            .catch(function(error)  {
                LOGGER.module().error('ERROR: [/libs/delete_aip lib (delete_from_dashboard)] unable to delete aip ' + error);
                obj.set_delete = false;
                callback(null, obj);
            });
            */
    }

    function delete_from_storage(obj, callback) {

        const archivematica_storage_dashboard_login = CONFIG.archivematicaStorageDashboardLogin;
        const archivematica_storage_dashboard_username = CONFIG.archivematicaStorageDashboardUsername;
        const archivematica_storage_dashboard_password = CONFIG.archivematicaStorageDashboardPassword;
        const archivematcia_storage_dashboard_packages = CONFIG.archivematicaStorageDashboardPackages;
        const archivematica_storage_dashboard_logout = CONFIG.archivematicaStorageDashboardLogout;

        NIGHTMARE
            .goto(archivematica_storage_dashboard_login)
            .insert('#id_username', archivematica_storage_dashboard_username)
            .insert('#id_password', archivematica_storage_dashboard_password)
            .click('.btn-primary')
            .wait(20000)
            .goto(archivematcia_storage_dashboard_packages)
            .wait(3000)
            .insert('#id_delete-reason', obj.delete_reason)
            .click('a[href="#tab-delete"]')
            .wait(2000)
            // .insert('#id_delete-uuid', obj.pid)
            .insert('#id_delete-reason', obj.delete_reason)
            .click('.btn-danger')

            .wait(7000)
            .goto(archivematica_storage_dashboard_logout)
            .wait(3000)
            .end()
            .then(function() {
                obj.set_delete = true;
                callback(null, obj);
            })
            .catch(function(error)  {
                LOGGER.module().error('ERROR: [/libs/delete_aip lib (delete_from_dashboard)] unable to delete aip ' + error);
                obj.set_delete = false;
                callback(null, obj);
            });
        /*
        if (obj.set_delete === true) {

            ARCHIVEMATICA.delete_aip(obj, function(result) {
                callback(null, obj);
            });

        } else {
            callback(null, obj);
        }
        */
    }

    ASYNC.waterfall([
        delete_from_dashboard,
        delete_from_storage
    ], function (error, results) {

        if (error) {
            LOGGER.module().error('ERROR: [/repository/model module (reset_display_record/async.waterfall)] ' + error);
        }

        callback({
            message: 'aip files deleted.',
            data: results
        });

        LOGGER.module().info('INFO: [/repository/model module (delete_object/async.waterfall)] object deleted');
    });
};