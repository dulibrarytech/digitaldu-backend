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

        let modsForm = '';
            modsForm += '<p><strong>Handle:</strong> ' + data[0].handle + '</p>';
            modsForm += '<p><strong>Pid:</strong> ' + data[0].pid + '</p>';

        for (let i = 0;i<data.length;i++) {

            let display_record = JSON.parse(data[i].display_record);

            modsForm += '';
            modsForm += '<input name="is_member_of_collection" type="hidden" id="is_member_of_collection" value="' + display_record.is_member_of_collection + '">';
            modsForm += '<input name="pid" type="hidden" id="pid" value="' + display_record.pid + '">';
            modsForm += '<input name="handle" type="hidden" id="handle" value="' + display_record.handle + '">';
            modsForm += '<input name="object_type" type="hidden" id="object-type" value="collection">';
            modsForm += '<div class="form-group">';
            modsForm += '<label for="mods_title">* Title:</label>';
            modsForm += '<input name="title" type="text" class="form-control" id="mods_title" value="' + display_record.display_record.title + '" required>';
            modsForm += '</div>';
            modsForm += '<div class="form-group">';
            modsForm += '<label for="mods_abstract">Abstract:</label>';
            modsForm += '<textarea name="abstract" class="form-control" id="mods_abstract" rows="7">' + display_record.display_record.abstract + '</textarea>';
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
            html = '<div class="alert alert-info"><strong><i class="fa fa-info-circle"></i>&nbsp;There are no objects in this collection.</strong></div>';
            $('#objects').html(html);
            return false;
        }

        for (let i = 0; i < data.length; i++) {

            if (data[i].display_record === null) {
                $('#message').html('<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i>&nbsp; Display record(s) is not available.</div>');
                return false;
            }

            let record = JSON.parse(data[i].display_record);
            let tn = configModule.getTn(data[i].pid);

            html += '<div class="row">';
            html += '<div class="col-md-3"><img style="width: 40%; display: block; padding: 5px;" src="' + tn + '" alt="image" /></div>';
            html += '<div class="col-md-6" style="padding: 5px">';

            if (record.title !== undefined) {

                if (data[i].object_type === 'collection') {
                    html += '<h4><a href="' + api + '/dashboard/objects/?pid=' + data[i].pid + '">' + record.title + '</a></h4>';
                } else if (data[i].object_type === 'object') {
                    html += '<h4><a href="' + api + '/dashboard/object/?pid=' + data[i].pid + '">' + record.title + '</a></h4>';
                }

            } else {
                html += '<h4>No Title</h4>';
            }

            // TODO: display more metadata
            if (data[i].object_type === 'object') {
                // console.log(record);
                // TODO: check if value is defined and if is_array before rendering
                html += '<ul>';
                html += '<li><small><strong>pid:</strong>&nbsp;' + data[i].pid + '</small></li>';

                if (record.identifier !== undefined) {
                    html += '<li><small><strong>Identifier:</strong>&nbsp;' + record.identifier + '</small></li>';
                }

                if (record.typeOfResource !== undefined) {
                    html += '<li><small><strong>TypeOfResource:</strong>&nbsp;' + record.typeOfResource + '</small></li>';
                }

                if (record.language !== undefined) {
                    html += '<li><small><strong>Language:</strong>&nbsp;' + record.language + '</small></li>';
                }

                if (record.accessCondition !== undefined) {
                    html += '<li><small><strong>AccessCondition:</strong>&nbsp;' + record.accessCondition + '</small></li>';
                }

                if (record.abstract !== undefined) {
                    html += '<li><small><strong>Abstract:</strong>&nbsp;' + record.abstract + '</small></li>';
                }

                if (record.location !== undefined) {
                    html += '<li><small><strong>Handle:</strong>&nbsp;' + record.location[0].url + '</small></li>';
                }

                html += '</ul>';
            }

            if (data[i].object_type === 'collection' && record.abstract !== undefined) {
                html += '<p style="min-height: 75px"><small>' + record.abstract + '</small></p>';
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

            if (data[i].object_type === 'object') {
                html += '<p><a href="' + api + '/dashboard/object/download?pid=' + data[i].pid + '"><i class="fa fa-download"></i>&nbsp;Download object</a></p>';
            }

            if (data[i].object_type === 'collection') {
                html += '<p><a href="' + api + '/dashboard/object/edit?pid=' + data[i].pid + '"><i class="fa fa-edit"></i>&nbsp;Edit collection</a></p>';
            } else if (data[i].object_type === 'object') {
                html += '<p><a href="' + api + '/dashboard/object/edit?pid=' + data[i].pid + '"><i class="fa fa-edit"></i>&nbsp;Edit object</a></p>';

            }

            html += '</div>';
            html += '</div>';
            html += '<hr>';
        }

        // TODO: implement pagination or infinite scroll
        $('#objects').html(html);
        $('a').tooltip();
    };

    const renderObjectDetail = function (data) {

        let html = '';

        for (let i = 0; i < data.length; i++) {

            collectionsModule.getCollectionName(data[i].pid);
            let record = JSON.parse(data[i].display_record);
            // TODO: place domain in config
            let tn = 'http://librepo01-vlp.du.edu:8080/fedora/objects/' + data[i].pid + '/datastreams/TN/content';

            html += '<div class="row">';
            // TODO: check mime type here
            html += '<div class="col-md-4"><img style="width: 70%; display: block; padding: 5px;" src="' + tn + '" alt="image" /></div>';
            html += '<div class="col-md-5" style="padding: 5px">';

            if (record.title !== undefined) {

                if (data[i].object_type === 'object') {
                    // html += '<h3>' + record.title[0] + '</h3>';
                    $('#object-title').html(record.title);
                }

            } else {
                // html += '<h4>No Title</h4>';
                $('#object-title').html('No Title');
            }

            // TODO: display more metadata
            if (data[i].object_type === 'object') {
                console.log(record);
                // TODO: check if value is defined and if is_array before rendering
                html += '<ul>';
                html += '<li><small><strong>pid:</strong>&nbsp;' + data[i].pid + '</small></li>';

                if (record.identifier !== undefined) {
                    html += '<li><small><strong>Identifier:</strong>&nbsp;' + record.identifier + '</small></li>';
                }

                if (record.typeOfResource !== undefined) {
                    html += '<li><small><strong>TypeOfResource:</strong>&nbsp;' + record.typeOfResource + '</small></li>';
                }

                if (record.language !== undefined) {
                    html += '<li><small><strong>Language:</strong>&nbsp;' + record.language + '</small></li>';
                }

                if (record.accessCondition !== undefined) {
                    html += '<li><small><strong>AccessCondition:</strong>&nbsp;' + record.accessCondition + '</small></li>';
                }

                if (record.abstract !== undefined) {
                    html += '<li><small><strong>Abstract:</strong>&nbsp;' + record.abstract + '</small></li>';
                }

                html += '</ul>';
            }

            if (data[i].object_type === 'collection' && record.abstract !== undefined) {
                html += '<p style="min-height: 75px"><small>' + record.abstract + '</small></p>';
            } else {
                // html += '<p style="min-height: 75px"><small>No description.</small></p>';
            }


            html += '</div>';
            html += '<div class="col-md-3" style="padding: 5px">';

            if (data[i].is_published === 1) {
                html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                html += '<p><a href="#"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
            } else {
                html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                html += '<p><a href="#"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
            }

            if (data[i].object_type === 'object') {
                html += '<p><a href="' + api + '/dashboard/object/download?pid=' + data[i].pid + '"><i class="fa fa-download"></i>&nbsp;Download Object</a></p>';
            }

            html += '<p><a href="#"><i class="fa fa-edit"></i>&nbsp;Edit Object</a></p>';
            html += '<p><a href="#"><i class="fa fa-code"></i>&nbsp;Technical Metadata</a></p>';
            html += '<p><a href="#"><i class="fa fa-code"></i>&nbsp;MODS</a></p>';
            html += '</div>';
            html += '</div>';
            html += '<hr>';
        }

        // TODO: implement pagination
        $('#object-detail').html(html);
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

    obj.getObjectDetail = function () {

        let pid = helperModule.getParameterByName('pid');

        userModule.setHeaderUserToken();

        $.ajax(api + '/api/admin/v1/repo/object?pid=' + pid)
            .done(function (data) {
                renderObjectDetail(data);
            })
            .fail(function () {
                renderError();
            });
    };

    obj.init = function () {
        userModule.renderUserName();
    };

    return obj;

}());