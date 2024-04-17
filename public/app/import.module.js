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

        let ingested_to_be_published = [];
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
            let token = userModule.getUserToken();

            html += '<td width="5%" ' + alignTd + '>' + id + '</td>';

            if (data[i].pid !== undefined) {

                let compound = '';

                if (mods.is_compound === true) {
                    compound = '&nbsp;&nbsp;<i class="fa fa-cubes"></i>';
                }

                html += '<td width="25%" ' + alignTd + '>';
                html += '<a href="' + api + endpoints.repo_object_viewer + '?uuid=' + DOMPurify.sanitize(data[i].pid) + '&t=' + token + '" target="_blank">' + DOMPurify.sanitize(title) + compound + '</a>';
                html += '<br><small>' + data[i].collection_title + '</small>';
                html += '</td>';
            }

            if (data[i].uri !== null) {
                html += '<td width="15%" ' + alignTd + '><a href="' + configModule.getASpace() + DOMPurify.sanitize(data[i].uri) + '" target="_blank">' + identifier + '</a></i></td>';
            }

            // html += '<td width="15%" ' + alignTd + '>' + DOMPurify.sanitize(moment(data[i].created).tz('America/Denver').format('MM-DD-YYYY, h:mm:ss a')) + '</td>';

            if (data[i].is_published === 0) {

                html += '<td id="publish-import-' + data[i].pid + '" width="5%" ' + alignTd + ' title="Unpublished"><i style="color: red" class="fa fa-cloud-upload"></i><br><small>Unpublished</small></td>';
                html += '<td id="publish-import-' + data[i].pid + '" width="15%" ' + alignTd + '>';
                html += '<a class="btn btn-primary" role="button" href="#" onclick="objectsModule.publishObject(\'' + DOMPurify.sanitize(data[i].pid) + '\', \'object\'); return false;" title="Publish ingested record"><i class="fa fa-cloud-upload"></i> <small>Publish</small></a>'; // <br><small>Unpublished</small>
                html += '&nbsp;&nbsp;|&nbsp;&nbsp;<a class="btn btn-danger" role="button" title="Delete" href="/dashboard/object/delete?pid=' + DOMPurify.sanitize(data[i].pid) + '"><i class="fa fa-trash"></i></a>'; // <br>Delete
                html += '</td>';

                /*
                let ingested = {};
                ingested.collection = data[i].is_member_of_collection;
                ingested.object = data[i].pid;
                ingested_to_be_published.push(ingested);

                 */

            } else if (data[i].is_published === 1) {
                html += '<td id="publish-import-' + data[i].pid + '" width="5%" ' + alignTd + ' title="Published"><i class="fa fa-cloud"></i><br><small>Published</small></td>';
                html += '<td width="15%"' + alignTd + '><i class="fa fa-check"></i>Complete</td>'; // <br><em>Delete</em>
            }

            html += '</tr>';
        }

        ingested_to_be_published.sort((a, b) => a.collection.localeCompare(b.collection));
        console.log('sorted ', ingested_to_be_published);
        window.localStorage.setItem('ingested_to_be_published', JSON.stringify(ingested_to_be_published));

        domModule.html('#unpublished-records', ingested_to_be_published.length);
        domModule.html('#complete-records', html);

        $('#completed-imports-table').DataTable({
            'pageLength': 25,
            'order': [[0, 'desc']]
        });

        document.querySelector('#message').remove();
        document.querySelector('#recent-ingests').style.visibility = 'visible';
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

                        // domModule.empty('#completed-imports-table');
                        domModule.html('#responses', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No imports have been processed today.</div>');
                        // domModule.html('.loading', null);

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

    obj.init = function () {
    };

    return obj;

}());

importModule.init();