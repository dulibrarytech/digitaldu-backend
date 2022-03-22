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

const statsModule = (function () {

    'use strict';

    const api = configModule.getApi();
    const endpoints = apiModule.endpoints();
    let obj = {};

    /**
     * Renders repository stats on home page
     * @param data
     */
    const renderStats = function (data) {

        // create line chart
        let line_chart_data = data.total_yearly_ingests;

        let labels = [];
        let totals = [];

        for (let i=0;i<line_chart_data.length;i++) {
            labels.push(line_chart_data[i].year);
            totals.push(line_chart_data[i].total);
        }

        const DATA = {
            labels: labels,
            datasets: [{
                label: 'Ingests Per Year',
                backgroundColor: '#bab8b9',
                borderColor: '#7f202e',
                data: totals,
            }]
        };

        const CONFIG = {
            type: 'line',
            data: DATA,
            options: {}
        };

        const line_chart = new Chart(
            document.querySelector('#ingests-per-year'),
            CONFIG
        );

        let total_duracloud_usage = (data.dip_storage_usage + data.aip_storage_usage);

        domModule.html('#total-published-collections', DOMPurify.sanitize(data.total_published_collections.toLocaleString('en')));
        domModule.html('#total-collections', DOMPurify.sanitize(data.total_collections.toLocaleString('en')));
        domModule.html('#total-published-objects', DOMPurify.sanitize(data.total_published_objects.toLocaleString('en')));
        domModule.html('#total-objects', DOMPurify.sanitize(data.total_objects.toLocaleString('en')));
        domModule.html('#total-images', DOMPurify.sanitize(data.total_images.toLocaleString('en')));
        domModule.html('#total-pdfs', DOMPurify.sanitize(data.total_pdfs.toLocaleString('en')));
        domModule.html('#total-audio', DOMPurify.sanitize(data.total_audio.toLocaleString('en')));
        domModule.html('#total-video', DOMPurify.sanitize(data.total_video.toLocaleString('en')));
        domModule.html('#total-dip-usage', DOMPurify.sanitize(helperModule.format_package_size(data.dip_storage_usage)));
        domModule.html('#total-aip-usage', DOMPurify.sanitize(helperModule.format_package_size(data.aip_storage_usage)));
        domModule.html('#total-dc-usage', DOMPurify.sanitize(helperModule.format_package_size(total_duracloud_usage)));
        domModule.html('#total-daily-ingests', DOMPurify.sanitize(data.total_daily_ingests.toLocaleString('en')));

        // clear loading... messages
        domModule.html('#loading-published-collection-total', null);
        domModule.html('#loading-total-collections', null);
        domModule.html('#loading-published-object-total', null);
        domModule.html('#loading-total-objects', null);
        domModule.html('#loading-total-images', null);
        domModule.html('#loading-total-pdfs', null);
        domModule.html('#loading-total-audio', null);
        domModule.html('#loading-total-video', null);
        domModule.html('#loading-dip-usage', null);
        domModule.html('#loading-aip-usage', null);
        domModule.html('#loading-dc-usage', null);
        domModule.html('#loading-ingests-per-year', null);
        domModule.html('#loading-ingests-per-day', null);
    };

    /**
     * Gets stats from repository
     */
    obj.getStats = function () {

        let token = userModule.getUserToken();
        let url = api + endpoints.stats,
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
                        domModule.html('#message', '<div class="alert alert-info"><i class="fa fa-exclamation-circle"></i> No records found.</div>');
                    } else {
                        renderStats(data);
                    }
                });

            } else if (response.status === 401) {

                helperModule.renderError('Error: (HTTP status ' + response.status + '). Your session has expired.  You will be redirected to the login page momentarily.');

                setTimeout(function () {
                    window.location.replace('/login');
                }, 4000);

            } else {
                helperModule.renderError('Error: (HTTP status ' + response.status + '). Unable to retrieve repository statistics.');
            }
        };

        httpModule.req(request, callback);
    };

    obj.init = function () {
        obj.getStats();
    };

    return obj;

}());

statsModule.init();