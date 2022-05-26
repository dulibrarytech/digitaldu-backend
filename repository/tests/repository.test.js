import {it, expect, assert, beforeAll} from 'vitest';

const // DBM = require('../libs/db-migrations'),
    DB = require('../../test/db')(),
    ARCHIVESSPACE_CONFIG = require('../../test/archivesspace_config'),
    COLLECTION_TASKS = require('../tasks/create_collection_tasks'),
    ARCHIVESSPACE_LIB = require('../../libs/archivesspace'),
    TEST_RECORDS = require('../../test/test_records')(),
    REPO_OBJECTS = 'tbl_objects_test';

// --globals
// TODO: DB and Index should be available at this point

it('Create collection DB record', async function () {
    let record = TEST_RECORDS.collection_record;
    const TASK = new COLLECTION_TASKS(DB, REPO_OBJECTS);
    await expect(TASK.save_record(record)).resolves.toBeTruthy();

});

it('Check DB URI', async function () {
    let uri = '/repositories/2/resources/1234';
    const TASK = new COLLECTION_TASKS(DB, REPO_OBJECTS);
    await expect(TASK.check_uri(uri)).resolves.toBeFalsy();
});

/**
 * Mocha
 */
/*
describe('Repository Module Tests', function () {

    // 1.) Create repository collection record
    describe('Collection Tasks Tests', function () {

        // TODO: save child records here

        it('Create collection DB record', function () {

            let record = TEST_RECORDS.collection_record;

            (async () => {
                try {
                    const TASK = new COLLECTION_TASKS(DB, REPO_OBJECTS);
                    let result = await TASK.save_record(record);
                    EXPECT(result).to.equal(true);
                } catch (error) {
                    console.log(error);
                }
            })();
        });

        it('Check DB URI', async function () {

            let uri = '/repositories/2/resources/496';

            // (async () => {
                try {
                    const TASK = new COLLECTION_TASKS(DB, REPO_OBJECTS);
                    let is_duplicate = await TASK.check_uri(uri);
                    EXPECT(is_duplicate).to.equal(false);
                } catch (error) {
                    console.log(error);
                }
            // })();
        });
    });
});

 */
