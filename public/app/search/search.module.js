var searchModule = (function () {

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

    var renderSearchResults = function (data) {

        if (data.length === 0) {
            $('#message').html('<h4>No results found.</h4>');
            return false;
        }

        var html = '';

        for (var i=0;i<data.length;i++) {

            // console.log(JSON.parse(data[i]._source.display_record));
            var record = JSON.parse(data[i]._source.display_record);
            var title = 'Title not found';

            if ( record.title !== undefined) {
                title = record.title[0].toString();
            }

            var pid = 'codu:' + record.id;

            html += '<div class="col-md-55">';
            html += '<div class="thumbnail">';
            html += '<div class="image view view-first">';
            html += '<img style="width: 100%; display: block;" src="' + api + '/api/object/tn?pid=' + pid + '" alt="image" />';
            html += '<div class="mask">';
            html += '<div class="tools tools-bottom">';
            html += '<a href="/dashboard/object?pid=' + pid + '" title="View Object Details"><i class="fa fa-th-list"></i></a>';
            html += '</div></div></div>';
            html += '<div class="caption">';
            html += '<p><strong>' + title + '</strong></p>';
            html += '<p>&nbsp;</p></div></div></div>';


        }

        // TODO: implement pagination
        $('#objects').html(html);
        $('a').tooltip();

    };

    obj.search = function () {

        var q = getParameterByName('q');

        $.ajax(api + '/api/search?q=' + q)
            .done(function(data) {
                renderSearchResults(data);
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