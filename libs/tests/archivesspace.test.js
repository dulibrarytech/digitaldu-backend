import {it, expect} from 'vitest';

const ARCHIVESSPACE_CONFIG = require('../../test/archivesspace_config')(),
    ARCHIVESSPACE_LIB = require('../archivesspace'),
    TEST_RECORDS = require('../../test/test_records')(),
    LIB = new ARCHIVESSPACE_LIB(
    ARCHIVESSPACE_CONFIG.archivesspace_host,
    ARCHIVESSPACE_CONFIG.archivesspace_user,
    ARCHIVESSPACE_CONFIG.archivesspace_password,
    ARCHIVESSPACE_CONFIG.archivesspace_repository_id);

let result = await LIB.get_session_token();
let json = JSON.parse(result.data);
let session = json.session;

it('Archivesspace ping', async function () {
    const response = {
        error: false,
        status: 'up',
        message: 'Archivespace service is available'
    };

    await expect(LIB.ping()).resolves.toMatchObject(response);
}, 10000);

it('Get Archivesspace resource record', async function () {
    let record = TEST_RECORDS.collection_record;
    await expect(LIB.get_resource_record(record.uri, session)).resolves.toBeDefined();
}, 10000);

it('Get Archivesspace archival record', async function () {
    let record = TEST_RECORDS.child_records[1];
    let uri = record.uri;
    await expect(LIB.get_archival_object_record(uri, session)).resolves.toBeDefined();
    console.log(await LIB.destroy_session_token(session));
}, 10000);
