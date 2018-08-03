var objectsModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function () {
        $('#objects').html('Error: Unable to retrieve objects');
    };

    // TODO: move to lib...
    var getParameterByName = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    var api = configModule.getApi();

    obj.editObject = function () {

        var pid = getParameterByName('pid');

        // TODO: construct form on server...
        $.ajax(api + '/api/admin/v1/object?pid=' + pid)
            .done(function(data) {
                // renderRootCollections(data);
                console.log(data);
                var modsXml = $.parseXML(data[0].mods);
                console.log(modsXml);
                var xml = $(modsXml);
                console.log(xml.find('mods > titleInfo > title'));
                // renderObjectEditForm();
            })
            .fail(function() {
                renderError();
            });

    };

    var renderObjects = function (data) {

        var is_member_of_collection = getParameterByName('pid'),
            html = '';

        $('#current-collection').prop('href', '/dashboard/collections/add?is_member_of_collection=' + is_member_of_collection);

        if (data.length === 0) {
            html = '<div class="alert alert-info"><strong><i class="fa fa-info-circle"></i>&nbsp;There are no objects in this collection.</strong></div>';
            $('#objects').html(html);
            return false;
        }

        for (var i=0;i<data.length;i++) {

            var record = JSON.parse(data[i].display_record);
            var tn = 'http://librepo01-vlp.du.edu:8080/fedora/objects/' + data[i].pid + '/datastreams/TN/content';

            html += '<div class="row">';
            html += '<div class="col-md-3"><img style="width: 40%; display: block; padding: 5px;" src="' + tn +'" alt="image" /></div>';
            html += '<div class="col-md-6" style="padding: 5px">';

            if (record.title !== undefined) {

                if (data[i].object_type === 'collection') {
                    html += '<h4><a href="' + api + '/dashboard/objects/?pid=' + data[i].pid + '">' + record.title[0] + '</a></h4>';
                } else if (data[i].object_type === 'object') {
                    html += '<h4><a href="' + api + '/dashboard/object/?pid=' + data[i].pid + '">' + record.title[0] + '</a></h4>';
                }

            } else {
                html += '<h4>No Title</h4>';
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

        // TODO: implement pagination
        $('#objects').html(html);
        $('a').tooltip();
    };

    var renderObjectDetail = function (data) {

        var html = '';

        for (var i=0;i<data.length;i++) {

            collectionsModule.getCollectionName(data[i].pid);
            var record = JSON.parse(data[i].display_record);
            // TODO: place domain in config
            var tn = 'http://librepo01-vlp.du.edu:8080/fedora/objects/' + data[i].pid + '/datastreams/TN/content';

            html += '<div class="row">';
            // TODO: check mime type here
            html += '<div class="col-md-4"><img style="width: 70%; display: block; padding: 5px;" src="' + tn + '" alt="image" /></div>';
            html += '<div class="col-md-5" style="padding: 5px">';

            if (record.title !== undefined) {

                if (data[i].object_type === 'object') {
                    // html += '<h3>' + record.title[0] + '</h3>';
                    $('#object-title').html(record.title[0]);
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


            var obj = {};
            obj.host = 'librepo01-vlp.du.edu:8080/fedora/';

            var datastream = 'OBJ';
            var pid = 'codu:38487';

            var url = 'http://' + obj.host + 'objects/' + pid + '/datastreams/' + datastream + '/content';
            $("#pdfContainer").html('<embed src="' + url + '" type="application/pdf" />');
        }

        // TODO: implement pagination
        $('#object-detail').html(html);
        $('a').tooltip();

        /*
         Dev note: object viewer / player here <br>
         <!--
         <audio autoplay="autoplay" controls="controls">
         <source src="music.mp3" />
         </audio>
         -->
         */
    };

    obj.getObjects = function () {

        var pid = getParameterByName('pid'); // TODO: sanitize

        collectionsModule.getCollectionName(pid);

        $.ajax(api + '/api/admin/v1/objects?pid=' + pid)
            .done(function(data) {
                renderObjects(data);
            })
            .fail(function() {
                renderError();
            });
    };

    obj.getObjectDetail = function () {

        var pid = getParameterByName('pid');

        $.ajax(api + '/api/admin/v1/object?pid=' + pid)
            .done(function(data) {
                renderObjectDetail(data);
            })
            .fail(function() {
                renderError();
            });
    };

    obj.init = function () {
        userModule.renderUserName();
    };

    return obj;

}());