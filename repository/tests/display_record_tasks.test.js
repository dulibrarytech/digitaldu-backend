import { it, expect, beforeAll } from 'vitest';

const FS = require('fs'),
    DB = require('../../test/db'),
    DBM = require('../../libs/db-migrations'),
    COLLECTION_TASKS = require('../tasks/create_collection_tasks'),
    // DRT = require('../tasks/display_record_tasks'),
    COLLECTION_TEST_RECORD = FS.readFileSync('./test/collection_test_record.json', 'utf8'),
    REPO_OBJECTS = 'tbl_objects_test';

// --globals
// TODO: DB and Index should be available at this point

beforeAll(async () => {
    console.log('Repository Module Unit Tests...');
    console.log('Building TEST DB...');
    DBM.up();
}, 5000);

// TODO: add child record

it('should create a DB collection record', () => {

    let record;
    let metadata;
    let display_record;

    record = JSON.parse(COLLECTION_TEST_RECORD);
    metadata = JSON.stringify(record.metadata);
    record.metadata = metadata;
    display_record = JSON.stringify(record.display_record);
    record.display_record = display_record;
    console.log(record.display_record);

    (async () => {
        const TASK = new COLLECTION_TASKS(DB, REPO_OBJECTS);
        let result = await TASK.save_record(record);
        console.log(result);
        expect(result).toBe([1]);
    })();

});
    /*
    (async () => {
        const uuid = '12345';
        const DR = new DRT(uuid);
        const result = await DR.get_display_record_data();
        console.log(result);
        expect(result).toBe(true);
    })();

     */