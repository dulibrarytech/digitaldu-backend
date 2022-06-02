import {it, expect} from 'vitest';

const DB = require('../../test/db')(),
    REPO_OBJECTS = 'tbl_objects_test',
    DISPLAY_RECORD_LIB = require('../display_record'),
    LIB = new DISPLAY_RECORD_LIB(DB, REPO_OBJECTS),
    TEST_RECORDS = require('../../test/test_records')();

it('Create display record', function () {
    let record = TEST_RECORDS.child_records[1];
    let metadata;
    metadata = JSON.stringify(record.metadata);
    record.metadata = metadata;
    expect(LIB.create_display_record(record)).toBeTypeOf('string');
}, 10000);

it('Update display record', async function () {
    let record = TEST_RECORDS.child_records[1];
    let display_record = JSON.stringify(record.display_record);
    let where_obj = {
        is_member_of_collection: record.is_member_of_collection,
        uuid: record.uuid,
        is_active: 1
    };

    await expect(LIB.update_display_record(where_obj, display_record)).resolves.toBeTruthy();
}, 10000);

it('Get DB display record', function () {
    let record = TEST_RECORDS.child_records[1];
    let uuid = record.uuid;
    expect(LIB.get_db_display_record_data(uuid)).toBeTypeOf('object');
}, 10000);

it('Get index display record', function () {
    let record = TEST_RECORDS.child_records[1];
    let uuid = record.uuid;
    expect(LIB.get_index_display_record_data(uuid)).toBeTypeOf('object');
}, 10000);

it('Get display record data', function () {
    let record = TEST_RECORDS.child_records[1];
    let uuid = record.uuid;
    expect(LIB.get_display_record_data(uuid)).toBeTypeOf('object');
}, 10000);
