/**

 Copyright 2019 University of Denver

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 */

const importModule = (function () {

    'use strict';

    const api = configModule.getApi();
    const endpoints = apiModule.endpoints();
    let obj = {};

    /**
     * Gets completed records after an ingest/import
     * @param data
     */
    const renderCompleteRecords = function (data) {

        let html = '',
            alignTd = 'style="text-align: center; vertical-align: middle"';

        for (let i = 0; i < data.length; i++) {

            if (data[i].mods === null) {
                continue;
            }

            let id = data[i].id;
            let mods = JSON.parse(data[i].mods);
            let title = mods.title;
            let identifier = mods.identifiers[0].identifier;
            let display_record = JSON.parse(data[i].display_record);
            let token = userModule.getUserToken();

            html += '<td width="10%" ' + alignTd + '>' + id + '</td>';

            if (data[i].sip_uuid !== null) {

                let compound = '';

                if (display_record.is_compound === 1) {
                    compound = '&nbsp;&nbsp;<i class="fa fa-cubes"></i>';
                }

                html += '<td ' + alignTd + '><a href="' + api + endpoints.repo_object_viewer + '?uuid=' + DOMPurify.sanitize(data[i].sip_uuid) + '&t=' + token + '" target="_blank">' + DOMPurify.sanitize(title) + compound + '</a></td>';
            }

            if (data[i].mods_id !== null) {
                html += '<td width="15%" ' + alignTd + '><a href="' + configModule.getASpace() + configModule.getUriPath() + DOMPurify.sanitize(data[i].mods_id) + '" target="_blank">' + identifier + '</a></i></td>';
            }

            html += '<td width="15%" ' + alignTd + '>' + DOMPurify.sanitize(moment(data[i].created).tz('America/Denver').format('MM-DD-YYYY, h:mm:ss a')) + '</td>';

            if (data[i].is_published === 0) {
                html += '<td id="publish-import-' + data[i].pid + '" width="15%" ' + alignTd + '><a href="#" onclick="objectsModule.publishObject(\'' + DOMPurify.sanitize(data[i].sip_uuid) + '\', \'object\'); return false;" title="Publish record"><i class="fa fa-cloud-upload"></i><br><small>Unpublished</small></a></td>';
                html += '<td width="15%"' + alignTd + '><a href="/dashboard/object/delete?pid=' +  DOMPurify.sanitize(data[i].pid) + '"><i class="fa fa-trash"></i><br>Delete</a></td>';
            } else if (data[i].is_published === 1) {
                html += '<td id="publish-import-' + data[i].pid + '" width="5%" ' + alignTd + ' title="Published"><i class="fa fa-cloud"></i><br><small>Published</small></td>';
                html += '<td width="15%"' + alignTd + '><i class="fa fa-trash"></i><br><em>Delete</em></td>';
            }

            html += '</tr>';
        }

        domModule.html('#complete-records', html);
        domModule.html('#message', null);
        domModule.html('.loading', null);

        $('#completed-imports-table').DataTable({
            'pageLength': 25,
            'order': [[ 0, 'desc' ]]
        });

        document.querySelector('#completed-imports-table-th-head').style.visibility = 'visible';
    };

    /**
     * Gets completed import records for current day
     */
    obj.getCompleteImportRecords = function () {

        let url = api + endpoints.repo_ingests,
            token = userModule.getUserToken(),
            request = new Request(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                }
            });

        const callback = function (response) {

            if (response.status === 200) {

                response.json().then(function (data) {

                    if (data.length === 0) {

                        domModule.empty('#completed-imports-table');
                        domModule.html('#responses', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No imports have been processed today.</div>');
                        domModule.html('.loading', null);

                    } else {
                        renderCompleteRecords(data);
                    }
                });

            } else if (response.status === 401) {

                helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                setTimeout(function () {
                    window.location.replace('/login');
                }, 4000);

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to get complete records.');
            }
        };

        httpModule.req(request, callback);
    };

    obj.init = function () {};

    return obj;

}());

importModule.init();