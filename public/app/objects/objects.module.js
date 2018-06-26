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

    var renderObjects = function (data) {

        var html = '';

        for (var i=0;i<data.length;i++) {

            // console.log(data[i].is_member_of_collection);
            var record = JSON.parse(data[i].display_record);
            // console.log(record);
            // TODO: place domain in config
            var tn = 'http://librepo01-vlp.du.edu:8080/fedora/objects/' + data[i].pid + '/datastreams/TN/content';
            // console.log(tn);

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
                html += '<li><small><strong>TypeOfResource:</strong>&nbsp;' + record.typeOfResource + '</small></li>';
                html += '<li><small><strong>AccessCondition:</strong>&nbsp;' + record.accessCondition + '</small></li>';
                html += '<li><small><strong>Abstract:</strong>&nbsp;' + record.abstract + '</small></li>';
                html += '</ul>';
            }

            if (data[i].object_type === 'collection' && record.abstract !== undefined) {
                html += '<p style="min-height: 75px"><small>' + record.abstract + '</small></p>';
            } else {
                // html += '<p style="min-height: 75px"><small>No description.</small></p>';
            }


            html += '</div>';
            html += '<div class="col-md-3" style="padding: 5px">';

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

            html += '<p><a href="#"><i class="fa fa-edit"></i>&nbsp;Edit Object</a></p>';
            html += '</div>';
            html += '</div>';
            html += '<hr>';
        }

        // TODO: implement pagination
        $('#objects').html(html);
        $('a').tooltip();
    };

    var renderObjectDetail = function (data) {

        var recordTitle = JSON.parse(data[0].display_record);
        $('#object-title').html(recordTitle.title[0]);

        var recordPid = JSON.parse(data[0].display_record);
        var pid = 'codu:' + recordPid.id;
        //var img ='';

        // TODO: split off into helper
        if (data[0].mime_type === 'image/tiff') {

            var img = '<img id="viewer" src="' + api + '/api/object/image/jpg?pid=' + pid + '" data-high-res-src="' + api + '/api/object/image/jpg?pid=' + pid + '" alt="' + pid + '" style="max-width:500px;border:solid 1px black">'; // height:500px;

            $('#object-binary').html(img);
            // $('#viewer').ImageViewer();

            // img = '<img src="' + api + '/api/object/image/jpg?pid=' + pid + '" data-high-res-src="' + api + '/api/object/image/jpg?pid=' + pid + '" alt="' + recordTitle + '">';
            // $("#object-binary").append(img);
            // $('.pannable-image').ImageViewer();

            /*
            var img = $("<img />").attr({
                src: api + '/api/object/image/jpg?pid=' + pid,
                height: '400'
            })
                .on('load', function() {
                    if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
                        $("#object-binary").append('Unable to load object.');
                    } else {
                        $("#object-binary").append(img);
                    }
                });
                */
        }

        if (data[0].mime_type === 'image/tif') {

            var img = '<img id="viewer" src="' + api + '/api/object/image/jpg?pid=' + pid + '" data-high-res-src="' + api + '/api/object/image/jpg?pid=' + pid + '" alt="' + pid + '" style="max-width:500px;border:solid 1px black">'; // height:500px;

            $('#object-binary').html(img);

            /*
            var img = $("<img />").attr({
                src: api + '/api/object/image/tiff?pid=' + pid,
                height: '400'
            })
                .on('load', function() {
                    if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
                        $("#object-binary").append('Unable to load object.');
                    } else {
                        $("#object-binary").append(img);
                    }
                });
            */

            /*
            var img = '<img id="viewer" src="' + api + '/api/object/image/tiff?pid=' + pid + '" data-high-res-src="' + api + '/api/object/image/tiff?pid=' + pid + '" alt="' + pid + '" style="height:400px;max-width:400px;border:solid 1px black">';

            $('#image-viewer').html(img);
            $('#object-binary').ImageViewer();
            */
        }

        if (data[0].mime_type === 'image/jpeg') {


            var img = '<img id="viewer" src="' + api + '/api/object/image/jpg?pid=' + pid + '" data-high-res-src="' + api + '/api/object/image/jpg?pid=' + pid + '" alt="' + pid + '" style="max-width:500px;border:solid 1px black">'; // height:500px;

            $('#object-binary').html(img);

            // img = '<img src="' + api + '/api/object/image/jpg?pid=' + pid + '" data-high-res-src="' + api + '/api/object/image/jpg?pid=' + pid + '" alt="' + recordTitle + '">';
           // $('#object-binary').html(img);

            /*
            var img = '<img id="viewer" src="' + api + '/api/object/image/jpg?pid=' + pid + '" data-high-res-src="' + api + '/api/object/image/jpg?pid=' + pid + '" alt="' + pid + '" style="height:400px;max-width:400px;border:solid 1px black">';

            $('#image-viewer').html(img);
            $('#object-binary').ImageViewer();
            */

            /*
            var img = $("<img>").attr({
                src: api + '/api/object/image/jpg?pid=' + pid,
                height: '400'
            })
                .on('load', function() {
                    if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
                        $("#object-binary").append('Unable to load object.');
                    } else {
                        $("#object-binary").append(img);
                    }
                });
                */
        }

        if (data[0].mime_type === 'image/png') {

            var img = '<img src="' + api + '/api/object/image/png?pid=' + pid + '" data-high-res-src="' + api + '/api/object/image/png?pid=' + pid + '" alt="' + recordTitle + '">';
            $('#object-binary').append(img);

            /*
            var img = $("<img />").attr({
                src: api + '/api/image/png?pid=' + pid,
                height: '400'
            })
                .on('load', function() {
                    if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
                        $("#object-binary").append('Unable to load object.');
                    } else {
                        $("#object-binary").append(img);
                    }
                });
                */
        }

        if (data[0].mime_type === 'application/pdf') {
            var pdf = '<iframe src="' + api + '/api/object/pdf?pid=' + pid + '" style="width:500px;height:600px;" frameborder="0"></iframe>';
            $("#object-binary").append(pdf);
        }

        if (data[0].mime_type === 'video/mp4') {
            // var video = '<video width="320" height="240"><source type="video/mp4" src="http://localhost:8000/video?pid=' + pid + '" /></video>';
            // $("#object-binary").append(video);
            var video = '<iframe src="' + api + '/api/object/video/mp4?pid=' + pid + '" style="width:320px;height:240px;" frameborder="0"></iframe>';
            $("#object-binary").append(video);
        }

        if (data[0].mime_type === 'video/mov') {
            // var video = '<video width="320" height="240"><source type="video/mp4" src="http://localhost:8000/video?pid=' + pid + '" /></video>';
            // $("#object-binary").append(video);
            var video = '<iframe src="' + api + '/api/object/video/mov?pid=' + pid + '" style="width:320px; height:240px;" frameborder="0"></iframe>';
            $("#object-binary").append(video);
        }

        // collectionsModule.getCollectionName(data[0].is_member_of_collection);

        var html = '';

        for (var i=0;i<data.length;i++) {

            var record = JSON.parse(data[i].display_record);

            // console.log(record);

            if (record.title.length > 1) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Alternative Title:</strong> ' + record.title[1];
                html += '</p>';
            }

            if (record.abstract !== undefined) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Abstract:</strong> ' + record.abstract;
                html += '</p>';
            }

            if (record.subjectTopic !== undefined) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Subject Topic:</strong> ';
                html += '<ul>';
                for (var i = 0;i<record.subjectTopic.length;i++) {
                    html += '<li>' + record.subjectTopic[i] + '</li>'
                }
                html += '</ul>';
                html += '</p>';
            }

            if (record.subjectOccupation !== undefined) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Subject Occupation:</strong> ';
                html += '<ul>';
                for (var i = 0;i<record.subjectOccupation.length;i++) {
                    html += '<li>' + record.subjectOccupation[i] + '</li>'
                }
                html += '</ul>';
                html += '</p>';
            }

            if (record.subjectGeographic !== undefined) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Subject Geographic:</strong> ';
                html += '<ul>';
                for (var i = 0;i<record.subjectGeographic.length;i++) {
                    html += '<li>' + record.subjectGeographic[i] + '</li>'
                }
                html += '</ul>';
                html += '</p>';
            }

            if (record.subjectGenre !== undefined) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Subject Genre:</strong> ';
                html += '<ul>';
                for (var i = 0;i<record.subjectGenre.length;i++) {
                    html += '<li>' + record.subjectGenre[i] + '</li>'
                }
                html += '</ul>';
                html += '</p>';
            }

            // TODO: check if value is undefined before rendering
            if (record.publisher !== undefined) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Publisher:</strong> ' + record.publisher;
                html += '</p>';
            }

            if (record.dateCreated !== undefined) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Date Created:</strong> ' + record.dateCreated;
                html += '</p>';
            }

            if (record.typeOfResource !== undefined) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Type of Resources:</strong> ' + record.typeOfResource;
                html += '</p>';
            }

            if (record.extent !== undefined) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Extent:</strong> ' + record.extent;
                html += '</p>';
            }

            if (record.digitalOrigin !== undefined) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Digital Origin:</strong> ' + record.digitalOrigin;
                html += '</p>';
            }

            if (record.dateCreated !== undefined) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Date Created:</strong> ' + record.dateCreated;
                html += '</p>';
            }

            if (record.accessCondition !== undefined) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Access Condition:</strong> ' + record.accessCondition;
                html += '</p>';
            }

            if (record.note !== undefined) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Note:</strong> ' + record.note;
                html += '</p>';
            }

            if (record.url !== undefined) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Handle:</strong> ' + record.url;
                html += '</p>';
            }
        }

        $('#object-detail').html(html);

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

        $.ajax(api + '/api/object/metadata?pid=' + pid)
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