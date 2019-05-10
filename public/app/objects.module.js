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

        for (let i = 0;i<data.length;i++) {

            let display_record = JSON.parse(data[i].display_record);
            let title = '';
            let abstract = '';

            // TODO: refactor after all display records have been standardized
            if (display_record.title !== undefined && display_record.title.length > 0) {
                title = display_record.title[0];
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

    const renderObjects = function (data) {

        let is_member_of_collection = helperModule.getParameterByName('pid'),
            html = '';

        $('#current-collection').prop('href', '/dashboard/collections/add?is_member_of_collection=' + is_member_of_collection);

        if (data.length === 0) {
            html = '<div class="alert alert-info"><strong><i class="fa fa-info-circle"></i>&nbsp; There are no objects in this collection.</strong></div>';
            $('#objects').html(html);
            return false;
        }

        for (let i = 0; i < data.length; i++) {

            if (data.length > 0 && data[i].display_record === null) {
                $('#message').html('<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i>&nbsp; Some display record are not available.  Review incomplete records.</div>');
                continue;
            }

            let record = JSON.parse(data[i].display_record),
                tn = configModule.getTn(data[i].thumbnail, data[i].pid);

            html += '<div class="row">';
            html += '<div class="col-md-3"><img display: block; padding: 5px;" src="' + tn + '" alt="image" /></div>';
            html += '<div class="col-md-6" style="padding: 5px">';

            if (record.display_record.title !== undefined) {

                if (data[i].object_type === 'collection') {
                    html += '<h4><a href="' + api + '/dashboard/objects/?pid=' + data[i].pid + '">' + record.display_record.title + '</a></h4>';
                } else if (data[i].object_type === 'object') {
                    html += '<h4>' + record.display_record.title + '</h4>';
                }

            } else {
                html += '<h4>No Title</h4>';
            }

            if (data[i].object_type === 'object') {

                html += '<ul>';
                html += '<li><strong>Pid:</strong>&nbsp;<a target="_blank" href="' + record.handle + '">' + record.pid + '</a>&nbsp;&nbsp;<i class="fa fa-external-link"></i></li>';
                html += '<li><strong>Uri:</strong>&nbsp;' + record.display_record.uri + '</li>';

                if (record.display_record.dates !== undefined && record.display_record.dates.length !== 0) {

                    html += '<li><strong>Dates:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.display_record.dates.length; i++) {
                        html += '<li>' + record.display_record.dates[i].expression + ' ( ' + record.display_record.dates[i].type + '</a> )</li>';
                    }

                    html += '</ul>';
                }

                if (record.display_record.extents !== undefined && record.display_record.extents.length !== 0) {

                    html += '<li><strong>Extents:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.display_record.extents.length; i++) {
                        html += '<li>' + record.display_record.extents[i] + '</li>';
                    }

                    html += '</ul>';
                }

                if (record.display_record.identifiers !== undefined && record.display_record.identifiers.length !== 0) {

                    html += '<li><strong>Identifiers:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.display_record.identifiers.length; i++) {
                        html += '<li>' + record.display_record.identifiers[i].identifier + ' ( ' + record.display_record.identifiers[i].type + ' )</li>';
                    }

                    html += '</ul>';
                }

                if (record.display_record.language !== undefined && record.display_record.language.length !== 0) {

                    for (let i = 0; i < record.display_record.language.length; i++) {
                        html += '<li><strong>Language:</strong> ' + record.display_record.language[i].text + ' ( ' + record.display_record.language[i].authority + ' )</li>';
                    }
                }

                if (record.display_record.names !== undefined && record.display_record.names.length !== 0) {

                    html += '<li><strong>Names:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.display_record.names.length; i++) {
                        html += '<li>' + record.display_record.names[i].title + ' ( ' + record.display_record.names[i].source + ' )</li>';
                    }

                    html += '</ul>';
                }

                if (record.display_record.notes !== undefined && record.display_record.notes.length !== 0) {

                    html += '<li><strong>Notes:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.display_record.notes.length; i++) {
                        html += '<li>' + record.display_record.notes[i].content + ' ( ' + record.display_record.notes[i].type + ' )</li>';
                    }

                    html += '</ul>';
                }

                if (record.display_record.parts !== undefined && record.display_record.parts.length !== 0) {

                    html += '<li><strong>Parts:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.display_record.parts.length; i++) {
                        html += '<li>' + record.display_record.parts[i].title + ' ( ' + record.display_record.parts[i].type + ' ) order: ' + record.display_record.parts[i].order + '</li>';
                    }
                }

                if (record.display_record.subjects !== undefined && record.display_record.subjects.length !== 0) {

                    html += '<li><strong>Subjects:</strong></li>';
                    html += '<ul>';

                    for (let i = 0; i < record.display_record.subjects.length; i++) {
                        if (record.display_record.subjects[i].authority_id !== undefined) {
                            html += '<li>' + record.display_record.subjects[i].title + ' ( <a target="_blank" href="' + record.display_record.subjects[i].authority_id + '">' + record.display_record.subjects[i].authority + '</a> )</li>';
                        } else {
                            html += '<li>' + record.display_record.subjects[i].title + ' ( ' + record.display_record.subjects[i].authority + ' )</li>';
                        }
                    }

                    html += '</ul>';
                }

                html += '</ul>';
            }

            if (data[i].object_type === 'collection' && record.abstract !== undefined) {
                html += '<p style="min-height: 75px">' + record.abstract + '</p>';
            }

            html += '</div>';
            html += '<div class="col-md-3" style="padding: 5px">';
            html += '<p>' + data[i].pid + '</p>';

            if (data[i].object_type === 'collection') {
                html += '<p><small style="background: skyblue; padding: 3px; color: white">Collection</small></p>';
            } else if (data[i].object_type === 'object') {
                html += '<p><small style="background: cadetblue; padding: 3px; color: white">Object</small></p>';
            }

            if (data[i].is_published === 1) {
                html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                html += '<p><a href="#"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
            } else {
                html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                html += '<p><a href="#"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
            }

            if (data[i].object_type === 'collection') {
                html += '<p><a href="' + api + '/dashboard/object/edit?pid=' + data[i].pid + '"><i class="fa fa-edit"></i>&nbsp;Edit collection</a></p>';
            } else if (data[i].object_type === 'object') {
                // html += '<p><a href="' + api + '/dashboard/object/download?pid=' + data[i].pid + '&type=tn"><i class="fa fa-code"></i>&nbsp;Technical Metadata</a></p>';
                // html += '<p><a href="' + api + '/dashboard/object/download?pid=' + data[i].pid + '&type=mods"><i class="fa fa-code"></i>&nbsp;MODS</a></p>';
            }

            if (data[i].object_type === 'object') {
                html += '<p><a href="' + api + '/dashboard/object/download?pid=' + data[i].pid + '"><i class="fa fa-download"></i>&nbsp;Download AIP</a></p>';
            }

            html += '</div>';
            html += '</div>';
            html += '<hr>';
        }

        // TODO: implement pagination or infinite scroll
        $('#objects').html(html);
        $('a').tooltip();
    };

    obj.getObjects = function () {

        let pid = helperModule.getParameterByName('pid'); // TODO: sanitize

        collectionsModule.getCollectionName(pid);

        userModule.setHeaderUserToken();

        $.ajax(api + '/api/admin/v1/repo/objects?pid=' + pid)
            .done(function (data) {
                renderObjects(data);
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
    };

    return obj;

}());