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

const metadataModule = (function () {

    'use strict';

    const app_path = configModule.get_app_path();
    const api = configModule.getApi();
    const endpoints = apiModule.endpoints();
    let obj = {};

    /**
     * Constructs metadata display
     * @param record
     * @returns {string}
     */
    obj.createDisplay = function(record) {

        let display = '';
        display += createTitle(record);
        display += createHandle(record);
        display += createPid(record);
        display += createUri(record);
        display += createDates(record);
        display += createExtents(record);
        display += createIdentifiers(record);
        display += createLanguage(record);
        display += createNames(record);
        display += createParts(record);
        display += createSubjects(record);
        display += createAbstract(record);
        return display;
    };

    /**
     * Creates thumbnail link fragment
     * @param record
     */
    obj.createThumbnailLink = function (record) {

        let tn = '';
        let token = userModule.getUserToken();

        if (record.object_type === 'collection') {

            if (record.thumbnail === undefined || record.thumbnail === null) {
                tn = api + endpoints.repo_object_tn + '?uuid=' + DOMPurify.sanitize(record.pid) + '&type=' + DOMPurify.sanitize(record.mime_type) + '&t=' + token;
            } else if (record.thumbnail.indexOf('http://') === 0 || record.thumbnail.indexOf('https://') === 0) {
                tn = DOMPurify.sanitize(record.thumbnail); // .replace('http://', 'https://')
            } else {
                tn = api + endpoints.repo_object_tn + '?uuid=' + DOMPurify.sanitize(record.thumbnail) + '&type=' + DOMPurify.sanitize(record.mime_type) + '&t=' + token;
            }

        } else if(record.object_type === 'object' && tn.length !== 0) {
            tn = api + endpoints.repo_object_tn + '?uuid=' + DOMPurify.sanitize(record.pid) + '&type=' + DOMPurify.sanitize(record.mime_type) + '&t=' + token;
        }

        return tn;
    };

    /**
     * Creates thumbnail display fragment
     * @param record
     * @param tn
     * @returns {string}
     */
    obj.createThumbnailDisplay = function(record, tn) {

        let tnDisplay = '';
        let token = userModule.getUserToken();

        if (record.object_type === 'object') {

            tnDisplay += '<a href="' + api + endpoints.repo_object_viewer + '?uuid=' + DOMPurify.sanitize(record.pid) + '&t=' + token + '" target="_blank">';
            tnDisplay += '<img style="max-height: 200px; max-width: 200px;" display: block; padding: 5px;" src="' + api + endpoints.repo_object_tn + '?uuid=' + DOMPurify.sanitize(record.pid) + '&t=' + token + '" alt="' + record.pid + '" />';
            tnDisplay += '</a>';

        } else {
            tnDisplay += '<img style="max-height: 200px; max-width: 200px;" display: block; padding: 5px;" src="' + tn + '" alt="' + record.pid + '" />';
        }

        return tnDisplay;
    };

    /**
     * Creates collection menu fragment
     * @param record
     * @returns {string}
     */
    obj.createCollectionMenu = function(record) {

        let menu = '';
        let is_published = parseInt(record.is_published);

        if (record.object_type === 'collection') {

            menu += '<p><small style="background: skyblue; padding: 3px; color: white">Collection</small></p>';

            if (is_published === 1) {
                menu += '<div id="status-published-' + record.pid + '">';
                menu += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                menu += '<p><a id="unpublish-' + record.pid + '" href="#' + record.pid + '" onclick="objectsModule.unpublishObject(\'' + DOMPurify.sanitize(record.pid) + '\', \'collection\'); return false;"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
                menu += '</div>';
            } else if (is_published === 0) {
                menu += '<div id="status-unpublished-' + record.pid + '">';
                menu += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                menu += '<p><a id="publish-' + record.pid + '" href="#' + record.pid + '" onclick="objectsModule.publishObject(\'' + DOMPurify.sanitize(record.pid) + '\', \'collection\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
                menu += '</div>';
            }

            // menu += '<p><a href="' + api + '/dashboard/objects/unpublished?pid=' + DOMPurify.sanitize(record.pid) + '&unpublished"><i class="fa fa-info-circle"></i>&nbsp;Unpublished objects</a></p>';
            menu += '<p><a href="' + api + app_path + '/dashboard/object/thumbnail?pid=' + DOMPurify.sanitize(record.pid) + '"><i class="fa fa-edit"></i>&nbsp;Change Thumbnail</a></p>';
            menu += '<p><a id="update-' + record.pid + '" title="Updates all records in this collection" href="#' + record.pid + '" onclick="collectionsModule.updateCollectionMetadata(\'' + DOMPurify.sanitize(record.pid) + '\', \'collection\'); return false;"><i class="fa fa-code"></i>&nbsp;Update Metadata</a></p>';
        }

        return menu;
    };

    /**
     * Creates object menu fragment
     * @param record
     * @returns {string}
     */
    obj.createObjectMenu = function(record) {

        let menu = '';
        let is_published = parseInt(record.is_published);
        let is_compound = parseInt(record.is_compound);

        if (record.object_type === 'object') {

            if (is_compound === 1) {
                menu += '<p><small style="background: cadetblue; padding: 3px; color: white">Compound Object</small></p>';
            } else {
                menu += '<p><small style="background: cadetblue; padding: 3px; color: white">Object</small></p>';
            }

            if (is_published === 1) {
                menu += '<div id="status-published-' + record.pid + '">';
                menu += '<p><small style="background: green; padding: 3px; color: white">Published</small></p>';
                menu += '<p><a id="unpublish-' + record.pid + '" href="#' + record.pid + '" onclick="objectsModule.unpublishObject(\'' + DOMPurify.sanitize(record.pid) + '\', \'object\'); return false;"><i class="fa fa-cloud-download"></i>&nbsp;Unpublish</a></p>';
                menu += '</div>';
            } else if (is_published === 0) {
                menu += '<div id="status-unpublished-' + record.pid + '">';
                menu += '<p><small style="background: red; padding: 3px; color: white">Not published</small></p>';
                menu += '<p><a id="publish-' + record.pid + '" href="#' + record.pid + '" onclick="objectsModule.publishObject(\'' + DOMPurify.sanitize(record.pid) + '\', \'object\'); return false;"><i class="fa fa-cloud-upload"></i>&nbsp;Publish</a></p>';
                menu += '<p><a href="' + app_path + '/dashboard/object/delete?pid=' +  DOMPurify.sanitize(record.pid) + '"><i class="fa fa-trash"></i>&nbsp;Delete</a></p>';
                menu += '</div>';
            }

            menu += '<p><a id="update-' + record.pid + '" href="#' + record.pid + '" onclick="objectsModule.updateMetadata(\'' + DOMPurify.sanitize(record.pid) + '\', \'object\'); return false;"><i class="fa fa-code"></i>&nbsp;Update Metadata</a></p>';

            if (record.transcript_search !== undefined) {
                menu += '<p><a id="transcript-' + record.pid + '" href="' + app_path + '/dashboard/transcript?mode=view&sip_uuid=' + DOMPurify.sanitize(record.pid) + '"><i class="fa fa-file-o"></i>&nbsp;View Transcript</a></p>';
            } else {
                // menu += '<p><a id="transcript-' + record.pid + '" href="/dashboard/transcript?mode=add&sip_uuid=' + DOMPurify.sanitize(record.pid) + '"><i class="fa fa-file-o"></i>&nbsp;Add Transcript</a></p>';
            }
        }

        return menu;
    };

    /**
     * Creates title fragment
     * @param record
     * @returns {string}
     */
    function createTitle(record) {

        let title = '';

        if (record.display_record.title !== undefined && record.object_type === 'collection') {
            title += '<h4><a href="' + api + app_path + '/dashboard/objects/?pid=' + DOMPurify.sanitize(record.pid) + '">' + DOMPurify.sanitize(record.display_record.title) + '</a></h4>';
        } else if (record.object_type === 'object') {
            title += '<h4>' + DOMPurify.sanitize(record.display_record.title) + '</h4>';
        } else {
            title += '<h4>No Title</h4>';
        }

        return title;
    }

    /**
     * Creates handle fragment
     * @param record
     * @returns {*}
     */
    function createHandle(record) {

        let handle = '';

        if (record.display_record.handle !== undefined) { // object  &nbsp;&nbsp;<i class="fa fa-copy"></i>
            handle += '<ul><li><strong>Handle:</strong>&nbsp;' + DOMPurify.sanitize(record.display_record.handle) + '</li></ul>';
        } else if (record.handle !== undefined) { // collection
            handle += '<ul><li><strong>Handle:</strong>&nbsp;' + DOMPurify.sanitize(record.handle) + '</li></ul>';
        }

        return handle;
    }

    /**
     * Creates pid fragment
     * @param record
     * @returns {string}
     */
    function createPid(record) {

        let pid = '';
        pid += '<ul>';

        if (record.is_published === 0) {
            pid += '<li><strong>Pid:</strong>&nbsp;' + DOMPurify.sanitize(record.pid) + '&nbsp;&nbsp;<i class="fa fa-external-link"></i></li>';
        } else {
            pid += '<li><strong>Pid:</strong>&nbsp;<a target="_blank" href="' + DOMPurify.sanitize(record.handle) + '">' + DOMPurify.sanitize(record.pid) + '</a>&nbsp;&nbsp;<i class="fa fa-external-link"></i></li>';
        }

        pid += '</ul>';

        return pid;
    }

    /**
     * Creates uri fragment
     * @param record
     * @returns {string}
     */
    function createUri(record) {

        let uri = '';

        if (record.display_record.uri !== undefined) { // object
            uri += '<ul><li><strong>Uri:</strong>&nbsp;<a href="' + configModule.getASpace() + DOMPurify.sanitize(record.display_record.uri) + '" target="_blank">' + DOMPurify.sanitize(record.display_record.uri) + '</a>&nbsp;&nbsp;<i class="fa fa-external-link"></i></li></ul>';
        } else if (record.uri !== undefined) { // collection
            uri += '<ul><li><strong>Uri:</strong>&nbsp;<a href="' + configModule.getASpace() + DOMPurify.sanitize(record.uri) + '" target="_blank">' + DOMPurify.sanitize(record.uri) + '</a>&nbsp;&nbsp;<i class="fa fa-external-link"></i></li></ul>';
        }

        return uri;
    }

    /**
     * Creates dates fragment
     * @param record
     * @returns {string}
     */
    function createDates(record) {

        let dates = '';

        if (record.display_record.dates !== undefined && record.display_record.dates.length !== 0) {

            dates += '<ul>';
            dates += '<li><strong>Dates:</strong></li>';
            dates += '<ul>';

            for (let j = 0; j < record.display_record.dates.length; j++) {

                if (record.object_type === 'collection') {
                    dates += '<li>' + DOMPurify.sanitize(record.display_record.dates[j].expression) + ' ( ' + DOMPurify.sanitize(record.display_record.dates[j].date_type) + '</a> )</li>';
                } else {
                    dates += '<li>' + DOMPurify.sanitize(record.display_record.dates[j].expression) + ' ( ' + DOMPurify.sanitize(record.display_record.dates[j].type) + '</a> )</li>';
                }
            }

            dates += '</ul></ul>';
        }

        return dates;
    }

    /**
     * Creates extents fragment
     * @param record
     * @returns {string}
     */
    function createExtents(record) {

        let extents = '';

        if (record.display_record.extents !== undefined && record.display_record.extents.length !== 0) {

            extents += '<ul>';
            extents += '<li><strong>Extents:</strong></li>';
            extents += '<ul>';

            for (let i = 0; i < record.display_record.extents.length; i++) {

                // collection object
                if (typeof record.display_record.extents[i] === 'object') {

                    for (let prop in record.display_record.extents[i]) {

                        if (prop === 'number') {
                            extents += '<li>number: ' + DOMPurify.sanitize(record.display_record.extents[i][prop]) + '</li>';
                        } else if (prop === 'container_summary') {
                            extents += '<li>container summary: ' + DOMPurify.sanitize(record.display_record.extents[i][prop]) + '</li>';
                        } else if (prop === 'created_by') {
                            extents += '<li>created by: ' + DOMPurify.sanitize(record.display_record.extents[i][prop]) + '</li>';
                        } else if (prop === 'last_modified_by') {
                            extents += '<li>last modified by: ' + DOMPurify.sanitize(record.display_record.extents[i][prop]) + '</li>';
                        } else if (prop === 'portion') {
                            extents += '<li>portion: ' + DOMPurify.sanitize(record.display_record.extents[i][prop]) + '</li>';
                        } else if (prop ==='extent_type') {
                            extents += '<li>extent type: ' + DOMPurify.sanitize(record.display_record.extents[i][prop]) + '</li>';
                        }
                    }

                } else {
                    extents += '<li>' + DOMPurify.sanitize(record.display_record.extents[i]) + '</li>';
                }
            }

            extents += '</ul></ul>';
        }

        return extents;
    }

    /**
     * Creates identifiers fragment
     * @param record
     * @returns {string}
     */
    function createIdentifiers(record) {

        let identifiers = '';

        if (record.display_record.identifiers !== undefined && record.display_record.identifiers.length !== 0) {

            identifiers += '<ul>';
            identifiers += '<li><strong>Identifiers:</strong></li>';
            identifiers += '<ul>';

            for (let i = 0; i < record.display_record.identifiers.length; i++) {
                identifiers += '<li>' + DOMPurify.sanitize(record.display_record.identifiers[i].identifier) + ' ( ' + DOMPurify.sanitize(record.display_record.identifiers[i].type) + ' )</li>';
            }

            identifiers += '</ul></ul>';
        }

        return identifiers;
    }

    /**
     * Creates language fragment
     * @param record
     * @returns {string}
     */
    function createLanguage(record) {

        let language = '';

        if (record.display_record.language !== undefined && record.display_record.language.length !== 0) {

            if (typeof record.display_record.language === 'object') {

                language += '<ul>';

                for (let i = 0; i < record.display_record.language.length; i++) {
                    language += '<li><strong>Language:</strong> ' + DOMPurify.sanitize(record.display_record.language[i].text) + ' ( ' + DOMPurify.sanitize(record.display_record.language[i].authority) + ' )</li>';
                }

                language += '</ul>';

            } else {
                language += '<ul><li><strong>Language:</strong> ' + DOMPurify.sanitize(record.display_record.language) + '</li></ul>';
            }
        }

        return language;
    }

    /**
     * Creates names fragment
     * @param record
     */
    function createNames(record) {

        let names = '';

        if (record.display_record.names !== undefined && record.display_record.names.length !== 0) {

            names += '<ul>';
            names += '<li><strong>Names:</strong></li>';
            names += '<ul>';

            for (let i = 0; i < record.display_record.names.length; i++) {
                names += '<li>' + DOMPurify.sanitize(record.display_record.names[i].title) + ' ( ' + DOMPurify.sanitize(record.display_record.names[i].source) + ' )</li>';
            }

            names += '</ul></ul>';
        }

        return names;
    }

    /**
     * Creates parts fragment
     * @param record
     */
    function createParts(record) {

        let parts = '';

        if (record.display_record.parts !== undefined && record.display_record.parts.length !== 1) {

            parts += '<ul>';
            parts += '<li><strong>Parts:</strong></li>';
            parts += '<ul>';

            for (let i = 0; i < record.display_record.parts.length; i++) {

                if (i === 10) {
                    parts += '<li><strong>Only showing ' + i + ' out of ' + DOMPurify.sanitize(record.display_record.parts.length) + ' parts.</strong></li>';
                    break;
                } else {
                    parts += '<li>' + DOMPurify.sanitize(record.display_record.parts[i].title) + ' ( ' + DOMPurify.sanitize(record.display_record.parts[i].type) + ' ) order: ' + DOMPurify.sanitize(record.display_record.parts[i].order);
                    let tn = helperModule.getTn(DOMPurify.sanitize(record.display_record.parts[i].thumbnail), '');
                    parts += '<br><img src="' + tn + '" width="100px" height="100px"></li>';
                }
            }

            parts += '</ul></ul>';
        }

        return parts;
    }

    /**
     * Creates subjects fragment
     * @param record
     */
    function createSubjects(record) {

        let subjects = '';

        if (record.object_type !== 'collection' && record.display_record.subjects !== undefined && record.display_record.subjects.length !== 0) {

            subjects += '<ul>';
            subjects += '<li><strong>Subjects:</strong></li>';
            subjects += '<ul>';

            for (let i = 0; i < record.display_record.subjects.length; i++) {
                if (record.display_record.subjects[i].authority_id !== undefined) {
                    subjects += '<li>' + DOMPurify.sanitize(record.display_record.subjects[i].title) + ' ( <a target="_blank" href="' + DOMPurify.sanitize(record.display_record.subjects[i].authority_id) + '">' + DOMPurify.sanitize(record.display_record.subjects[i].authority) + '</a> )</li>';
                } else {
                    subjects += '<li>' + DOMPurify.sanitize(record.display_record.subjects[i].title) + ' ( ' + DOMPurify.sanitize(record.display_record.subjects[i].authority) + ' )</li>';
                }
            }

            subjects += '</ul></ul>';
        }

        return subjects;
    }

    /**
     * Creates abstract fragment
     * @param record
     * @returns {string}
     */
    function createAbstract(record) {

        let abstract = '';

        if (record.abstract !== undefined) {
            abstract += '<ul>';
            abstract += '<li><strong>Abstract:</strong></li>';
            abstract += '<ul>';
            abstract += '<li style="min-height: 75px">' + DOMPurify.sanitize(record.abstract) + '</li>';
            abstract += '</ul></ul>';
        }

        return abstract;
    }

    return obj;

}());
