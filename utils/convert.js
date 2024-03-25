'use strict';

const CONFIG = require('../config/config');
// const HTTP = require('../libs/http');
const HTTP = require('axios');
const DURACLOUD = require('../libs/duracloud');
const LOGGER = require("../libs/log4");
const DB = require('../config/db')();
const DBQ = require('../config/dbqueue')();
const REPO_OBJECTS = 'tbl_objects';
const BROKEN_JPGS = 'tbl_broken_jpgs';
const CONVERT_QUEUE = 'tbl_convert_queue';

async function get_broken_jpg() {

    try {

        // query uuids of broken jpgs -
        let broken_jpg = await DBQ(BROKEN_JPGS)
        .select('uuid')
        .limit(1)
        .where({
            is_queried: 0
        });

        if (broken_jpg.length === 0) {
            return false;
        }

        return broken_jpg[0].uuid;

    } catch (error) {
        console.log(error.message);
    }
}

async function get_repo_record(uuid) {

    try {

        let record = await DB(REPO_OBJECTS)
        .select('*')
        .limit(1)
        .where({
            pid: uuid
        });

        if (record.length === 0) {
            return false;
        }

        return record[0];

    } catch (error) {
        console.log(error.message);
    }
}

async function init() {

    try {

        let data = {};
        let uuid = await get_broken_jpg();

        if (uuid === false) {
            return false;
        }

        let record = await get_repo_record(uuid);

        if (record === false) {
            return false;
        }

        let tmp = record.file_name.split('/');

        data.sip_uuid = record.sip_uuid;
        data.full_path = record.file_name.replace('.jp2', '.tif');
        data.object_name = tmp[tmp.length - 1];

        if (data.object_name.indexOf('.tif') !== -1) {
            data.object_name = data.object_name.replace('.tif', '.jpg');
        } else if (data.object_name.indexOf('.jp2') !== -1) {
            data.object_name = data.object_name.replace('.jp2', '.jpg');
        }

        data.mime_type = record.mime_type;
        DURACLOUD.convert_service(data);
        console.log(data.object_name);

        await DBQ(BROKEN_JPGS)
        .where({
            uuid: data.sip_uuid
        })
        .update({
            object_name: data.object_name,
            is_queried: 1
        });

        setTimeout(async () => {
            await init();
        }, 35000);

    } catch (error) {
        console.log(error.message);
    }
}

exports.convert = function (req, callback) {

    (async function () {
        await init();
    })();

    callback({
        status: 200,
        data: 'Converting...'
    });
};

exports.remove_cached_image = function (req, callback) {

    (async () => {
        await clear_cache_init();
    })();

    callback({
        status: 200,
        data: 'Clearing cache'
    });
}

async function clear_cache_init() {

    let uuid = await get_broken_jpg();
    // await clear_cache(uuid);
    await DBQ(BROKEN_JPGS)
    .where({
        uuid: uuid
    })
    .update({
        url: 'https://specialcollections.du.edu/object/' + uuid,
        is_queried: 1
    });

    setTimeout(async () => {
        await clear_cache_init();
    }, 50);

}

async function clear_cache(uuid) {

    let endpoint = 'https://specialcollections.du.edu/cantaloupe/iiif/2/' + uuid + '/info.json';
    let response = await HTTP.get(endpoint, {
        responseType: 'arraybuffer'
    });

    if (response.status === 200) {
        console.log(uuid + ' cleared.');
    }
}