const objectsModule = (function () {

    'use strict';

    let obj = {};

    let renderError = function () {
        $('#objects').html('Error: Unable to retrieve objects');
    };

    let api = configModule.getApi();

    obj.editObject = function () {

        let pid = helperModule.getParameterByName('pid');

        userModule.setHeaderUserToken();

        $.ajax(api + '/api/admin/v1/repo/object?pid=' + pid)
            .done(function (data) {
                renderObjectEditForm(data);
            })
            .fail(function () {
                renderError();
            });
    };

    // TODO: DEPRECATE
    // TODO: pull in metadata updates from archivespace
    const renderObjectEditForm = function (data) {

        if (data.length > 1) {
            // TODO: display error
            return false;
        }

        $('#is-member-of-collection').html('<strong>Is member of collection:</strong> ' + data[0].is_member_of_collection);
        $('#object-type').html(data[0].object_type);

        let handle = '';

        if (data[0].handle === null) {
            handle = 'A handle has not been assigned to this object';
        } else {
            handle = data[0].handle;
        }

        let modsForm = '';
        modsForm += '<p><strong>Handle:</strong> ' + handle + '</p>';
        modsForm += '<p><strong>Pid:</strong> ' + data[0].pid + '</p>';

        for (let i = 0; i < data.length; i++) {

            let display_record = JSON.parse(data[i].display_record);
            let title = '';
            let abstract = '';

            // TODO: refactor after all display records have been standardized
            if (display_record.title !== undefined && display_record.title.length > 0) {
                title = display_record.title;
            } else {
                title = display_record.display_record.title;
            }

            if (display_record.abstract !== undefined) {
                abstract = display_record.abstract;
            } else if (display_record.abstract == undefined) {
                abstract = '';
            } else if (display_record.display_record.abstract === undefined) {
                abstract = '';
            } else if (display_record.display_record.abstract !== undefined) {
                abstract = display_record.display_record.abstract;
            }

            modsForm += '';
            modsForm += '<input name="is_member_of_collection" type="hidden" id="is_member_of_collection" value="' + display_record.is_member_of_collection + '">';
            modsForm += '<input name="pid" type="hidden" id="pid" value="' + display_record.pid + '">';
            modsForm += '<input name="handle" type="hidden" id="handle" value="' + display_record.handle + '">';
            modsForm += '<input name="object_type" type="hidden" id="object-type" value="collection">';
            modsForm += '<div class="form-group">';
            modsForm += '<label for="mods_title">* Title:</label>';
            modsForm += '<input name="title" type="text" class="form-control" id="mods_title" value="' + title + '" required>';
            modsForm += '</div>';
            modsForm += '<div class="form-group">';
            modsForm += '<label for="mods_abstract">Abstract:</label>';
            modsForm += '<textarea name="abstract" class="form-control" id="mods_abstract" rows="7">' + abstract + '</textarea>';
            modsForm += '</div>';
            modsForm += '<br>';
            modsForm += '<button type="submit" class="btn btn-primary" id="update-collection-button"><i class="fa fa-save"></i>&nbsp;Save</button>';
            modsForm += '&nbsp;&nbsp;';
            modsForm += '<button type="button" class="btn btn-default"><i class="fa fa-times"></i>&nbsp;Cancel</button>';
        }

        $('#collection-edit-form').html(modsForm);
    };

    obj.getObjects = function () {

        let pid = helperModule.getParameterByName('pid'); // TODO: sanitize

        collectionsModule.getCollectionName(pid);

        userModule.setHeaderUserToken();

        $.ajax(api + '/api/admin/v1/repo/objects?pid=' + pid)
            .done(function (data) {
                helperModule.renderDisplayRecords(api, data);
            })
            .fail(function () {
                renderError();
            });
    };

    obj.downloadObject = function () {
        let pid = helperModule.getParameterByName('pid'); // TODO: sanitize
        window.location.replace(api + '/api/v1/object/download?pid=' + pid);
        return false;
    };

    obj.init = function () {
        userModule.renderUserName();
        helperModule.ping();
    };

    return obj;

}());