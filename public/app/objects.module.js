const objectsModule = (function () {

    'use strict';

    let obj = {};

    let renderError = function () {
        $('#objects').html('Error: Unable to retrieve objects');
    };

    let api = configModule.getApi();

    // TODO: DEPRECATE
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

    /**
     *
     */
    obj.getObjects = function () {

        let pid = helperModule.getParameterByName('pid'); // TODO: sanitize

        collectionsModule.getCollectionName(pid);
        userModule.setHeaderUserToken();

        if (pid === null) {
            pid = 'codu:root';
        }

        $.ajax(api + '/api/admin/v1/repo/objects?pid=' + pid)
            .done(function (data) {
                objectsModule.renderDisplayRecords(data);
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

    /**
     *
     * @param pid
     */
    obj.publishObject = function (pid, type) {

        // TODO: flag collection pid too
        window.scrollTo({ top: 0, behavior: 'smooth' });

        let obj = {
            pid: pid,
            type: type
        };

        let message = '<div class="alert alert-info"><i class="fa fa-check-circle"></i> Publishing...</div>';
        $('#message').html(message);

        let url = api + '/api/admin/v1/repo/publish',
            request = new Request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': userModule.getUserToken()
                },
                body: JSON.stringify(obj),
                mode: 'cors'
            });

        const callback = function (response) {

            if (response.status === 201) {

                response.json().then(function (response) {

                    let message = '<div class="alert alert-success"><i class="fa fa-check-circle"></i> Published</div>';
                    $('#message').html(message);

                    setTimeout(function () {
                        $('#message').html('');
                        objectsModule.getObjects();
                    }, 4000);

                });

            } else if (response.status === 401) {

                response.json().then(function (response) {

                    let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Unable to publish object(s)</div>';
                    renderError(message);
                });

            } else {
                document.getElementById('login-button').disabled = false;
                let message = '<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> Error: (HTTP status ' + response.status + '. Unable to import MODS.</div>';
                renderError(message);
            }
        };

        http.req(request, callback);
    };

    /**
     * Renders object metadata
     * @param data
     * @returns {boolean}
     */
    obj.renderDisplayRecords = function (data) {

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
                $('#message').html('<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i>&nbsp; Some display records are not available.  Review incomplete records.</div>');
                continue;
            }

            let record = JSON.parse(data[i].display_record),
                tn = helperModule.getTn(data[i].thumbnail, data[i].mime_type, data[i].pid);

            html += '<div class="row">';
            html += '<div class="col-md-3"><img style="max-height: 250px; max-width: 250px;" display: block; padding: 5px;" src="' + tn + '" alt="image" /></div>';
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

                html += '</ul>';
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

            if (data[i].object_type === 'collection' && record.abstract !== undefined) {
                html += '<p style="min-height: 75px">' + record.abstract + '</p>';
            }

            html += '</div>';
            html += '<div class="col-md-3" style="padding: 5px">';

            if (data[i].object_type === 'collection') {

                html += '<p><small style="background: skyblue; padding: 3px; color: white">Collection</small></p>';

                if (data[i].is_published === 1) {
                    html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                    html += '<p><a href="#"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
                } else {
                    html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                    html += '<p><a href="#" onclick="objectsModule.publishObject(\'' + data[i].pid + '\', \'collection\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
                }

                html += '<p><a href="' + api + '/dashboard/object/edit?pid=' + data[i].pid + '"><i class="fa fa-edit"></i>&nbsp;Update collection</a></p>';

            } else if (data[i].object_type === 'object') {

                html += '<p><small style="background: cadetblue; padding: 3px; color: white">Object</small></p>';

                if (data[i].is_published === 1) {
                    html += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                    html += '<p><a href="#"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
                } else {
                    html += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                    html += '<p><a href="#" onclick="objectsModule.publishObject(\'' + data[i].pid + '\', \'object\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
                }

                html += '<p><a href="' + api + '/dashboard/object/download?pid=' + data[i].pid + '"><i class="fa fa-download"></i>&nbsp;Download AIP</a></p>';
                // html += '<p><a href="' + api + '/dashboard/object/download?pid=' + data[i].pid + '&type=tn"><i class="fa fa-code"></i>&nbsp;Technical Metadata</a></p>';
                // html += '<p><a href="' + api + '/dashboard/object/download?pid=' + data[i].pid + '&type=mods"><i class="fa fa-code"></i>&nbsp;MODS</a></p>';
            }

            html += '</div>';
            html += '</div>';
            html += '<hr>';
        }

        // TODO: implement pagination
        $('#objects').html(html);
        $('a').tooltip();
    };

    obj.init = function () {
        objectsModule.getObjects();
        helperModule.ping();
    };

    return obj;

}());