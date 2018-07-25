var groupsModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function () {
        $('#objects').html('Error: Unable to retrieve data');
    };

    var api = configModule.getApi();

    var getParameterByName = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    var renderGroups = function (data) {

        var html = '';

        for (var i=0;i<data.length;i++) {

            html += '<tr>';
            html += '<td style="width: 15%">' + data[i].group_name + '</td>';
            html += '<td>' + data[i].group_description + '</td>';
            html += '<td>' + data[i].permissions + '</td>';
            html += '<td>' + data[i].resources + '</td>';
            html += '<td><a href="/dashboard/groups/users?id=' + data[i].id + '"><i class="fa fa-users"></i>&nbsp;</a></td>';
            html += '<td><a href="#" title="Edit Group"><i class="fa fa-edit"></i></a></td>';
            html += '</tr>';
        }

        $('#groups').html(html);
        $('.loading').html('');
    };

    obj.getGroups = function () {

        $.ajax(api + '/api/admin/v1/groups')
            .done(function(data) {
                renderGroups(data);
            })
            .fail(function() {
                renderError();
            });
    };

    obj.getGroupUsers = function () {

        var id = getParameterByName('id');

        $.ajax(api + '/api/admin/v1/groups/users?id=' + id)
            .done(function(data) {
                console.log(data);
                $('#group').html('Group: ' + data[0].group_name);
                userModule.renderUsers(data);
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