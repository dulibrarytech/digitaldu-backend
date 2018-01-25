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

            var record = JSON.parse(data[i].display_record);
            var title = 'Title not found';

            if ( record.title !== undefined) {
                title = record.title[0].toString();
            }

            html += '<div class="col-md-55">';
            html += '<div class="thumbnail">';
            html += '<div class="image view view-first">';
            html += '<img style="width: 100%; display: block;" src="' + api + '/api/objects/tn?pid=' + data[i].pid + '" alt="image" />';
            html += '<div class="mask">';
            html += '<div class="tools tools-bottom">';
            html += '<a href="/dashboard/object?pid=' + data[i].pid + '" title="View Object Details"><i class="fa fa-link"></i></a>';
            html += '<a href="' + data[i].pid + '" title="Edit Object"><i class="fa fa-pencil"></i></a>';
            html += '</div></div></div>';
            html += '<div class="caption">';
            html += '<p><strong>' + title + '</strong></p>';
            html += '<p>&nbsp;</p></div></div></div>';
        }

        // TODO: implement pagination
        $('#objects').html(html);
    };

    var renderObjectDetail = function (data) {

        var recordTitle = JSON.parse(data[0].display_record);
        $('#object-title').html(recordTitle.title[0]);

        var recordPid = JSON.parse(data[0].display_record);
        var pid = 'codu:' + recordPid.id;

        // TODO: split off into helper
        if (data[0].mime_type === 'image/tiff') {
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
        }

        if (data[0].mime_type === 'image/tif') {
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
        }

        if (data[0].mime_type === 'image/jpeg') {
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
        }

        if (data[0].mime_type === 'image/png') {
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
        }

        if (data[0].mime_type === 'application/pdf') {
            var pdf = '<iframe src="' + api + '/api/object/pdf?pid=' + pid + '" style="width:600px; height:500px;" frameborder="0"></iframe>';
            $("#object-binary").append(pdf);
        }

        if (data[0].mime_type === 'video/mp4') {
            // var video = '<video width="320" height="240"><source type="video/mp4" src="http://localhost:8000/video?pid=' + pid + '" /></video>';
            // $("#object-binary").append(video);
            var video = '<iframe src="' + api + '/api/object/video/mp4?pid=' + pid + '" style="width:320px; height:240px;" frameborder="0"></iframe>';
            $("#object-binary").append(video);
        }

        if (data[0].mime_type === 'video/mov') {
            // var video = '<video width="320" height="240"><source type="video/mp4" src="http://localhost:8000/video?pid=' + pid + '" /></video>';
            // $("#object-binary").append(video);
            var video = '<iframe src="' + api + '/api/object/video/mov?pid=' + pid + '" style="width:320px; height:240px;" frameborder="0"></iframe>';
            $("#object-binary").append(video);
        }

        console.log(data[0].mime_type);

        var html = '';

        html += '<p><strong>Collection(s):</strong> Collection name here</p>';


        for (var i=0;i<data.length;i++) {

            var record = JSON.parse(data[i].display_record);

            console.log(record);

            if (record.title.length > 1) {
                html += '<hr>';
                html += '<p>';
                html += '<strong>Alternative Title:</strong> ' + record.title[1];
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

        var pid = getParameterByName('pid');

        $.ajax(api + '/api/objects?pid=' + pid)
            .done(function(data) {
                renderObjects(data);
            })
            .fail(function() {
                renderError();
            });
    };

    // TODO: get object here...

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
        // TODO: get API URLs from config/helper file
    };

    return obj;

}());