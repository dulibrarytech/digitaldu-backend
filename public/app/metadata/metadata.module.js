var metadataModule = (function () {

    'use strict';

    var obj = {};

    var renderError = function () {
        $('#message').html('Error: Unable to retrieve metadata');
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

    var renderMetadataForm = function (mods) {

        console.log(mods);
        // TODO: split off into lib
        var html = '';

        if (mods.titleInfo !== undefined) {
            // TODO: check if array

            console.log(mods.titleInfo.isArray);

            if (mods.titleInfo.title !== undefined) {
                html += '<div class="form-group">';
                html += '<label for="title">Title</label>';
                html += '<input type="text" class="form-control" id="title" value="' + mods.titleInfo.title.__text + '" placeholder="Title">';
                html += '</div>';
                html += '<hr>';
            }

        }

        if (mods.relatedItem !== undefined) {

            for (var i = 0; i < mods.relatedItem.length; i++) {

                if (mods.relatedItem[i].hasOwnProperty('titleInfo')) {

                    if (mods.relatedItem[i].titleInfo.title.__text !== undefined) {

                        html += '<div class="form-group">';
                        html += '<label for="title">RelatedItem: Title</label>';
                        html += '<input type="text" class="form-control" id="title" name="" value="' + mods.relatedItem[i].titleInfo.title.__text + '" placeholder="Title">';
                        html += '</div>';

                        html += '<label for="type">Type</label>';
                        html += '<select name="" class="form-control" id="type">';
                        html += '<option>' + mods.relatedItem[i]._type + '</option>';
                        html += '<option>enumerated: preceding</option>';
                        html += '<option>succeeding</option>';
                        html += '<option>original</option>';
                        html += '<option>constituent</option>';
                        html += '<option>series</option>';
                        html += '</select>';

                        html += '<hr>';

                    }
                }

                if (mods.relatedItem[i].hasOwnProperty('part')) {

                    // console.log(mods.relatedItem[i].part.detail.number);

                    if (mods.relatedItem[i].part.detail.number.__text !== undefined) {

                        // html += '<legend style="font-size: 14px;">Part</legend>';
                        html += '<div class="form-group">';
                        html += '<label for="title">RelatedItem:Detail: Number</label>';
                        html += '<input type="text" class="form-control" id="title" name="" value="' + mods.relatedItem[i].part.detail.number.__text + '" placeholder="">';
                        html += '</div>';

                        html += '<label for="type">Type</label>';
                        html += '<select name="" class="form-control" id="type">';
                        // TODO: ....
                        html += '<option>' + mods.relatedItem[i]._type + '</option>';
                        html += '<option>enumerated: preceding</option>';
                        html += '<option>succeeding</option>';
                        html += '<option>original</option>';
                        html += '<option>constituent</option>';
                        html += '<option>series</option>';
                        html += '</select>';

                        html += '<hr>';
                    }
                }

                if (mods.relatedItem[i].hasOwnProperty('name')) {
                    console.log('name');
                }

                if (mods.relatedItem[i].hasOwnProperty('typeOfResource')) {
                    console.log('typeOfResource');
                }

                if (mods.relatedItem[i].hasOwnProperty('genre')) {
                    console.log('genre');
                }

                if (mods.relatedItem[i].hasOwnProperty('originInfo')) {
                    console.log('originInfo');
                }

                if (mods.relatedItem[i].hasOwnProperty('language')) {
                    console.log('language');
                }

                if (mods.relatedItem[i].hasOwnProperty('physicalDescription')) {
                    console.log('physicalDescription');
                }

                if (mods.relatedItem[i].hasOwnProperty('abstract')) {
                    console.log('abstract');
                }

                if (mods.relatedItem[i].hasOwnProperty('tableOfContents')) {
                    console.log('tableOfContents');
                }

                if (mods.relatedItem[i].hasOwnProperty('targetAudience')) {
                    console.log('targetAudience');
                }

                if (mods.relatedItem[i].hasOwnProperty('note')) {
                    console.log('note');
                }

                if (mods.relatedItem[i].hasOwnProperty('subject')) {
                    console.log('subject');
                }

                if (mods.relatedItem[i].hasOwnProperty('classification')) {
                    console.log('classification');
                }

                if (mods.relatedItem[i].hasOwnProperty('relatedItem')) {
                    console.log('relatedItem');
                }

                if (mods.relatedItem[i].hasOwnProperty('identifier')) {
                    console.log('identifier');
                }

                if (mods.relatedItem[i].hasOwnProperty('location')) {
                    console.log('location');
                }

                if (mods.relatedItem[i].hasOwnProperty('accessCondition')) {
                    console.log('accessCondition');
                }

                if (mods.relatedItem[i].hasOwnProperty('extension')) {
                    console.log('extension');
                }

                if (mods.relatedItem[i].hasOwnProperty('recordInfo')) {
                    console.log('recordInfo');
                }

            }
        }

        if (mods.originInfo !== undefined) {

            html += '<fieldset>';
            html += '<legend>Origin Info</legend>';

            for (var i=0;i<=mods.originInfo.length;i++) {
                console.log(mods.originInfo[i]);

                if (mods.originInfo[i] !== undefined && mods.originInfo[i].publisher !== undefined) {
                    html += '<div class="form-group">';
                    html += '<label for="publisher">Publisher</label>';
                    html += '<input type="text" class="form-control" id="publisher" name="" value="' + mods.originInfo[i].publisher.__text + '" placeholder="Publisher">';
                    html += '</div>';
                    html += '<hr>';
                }

                if (mods.originInfo[i] !== undefined && mods.originInfo[i].place !== undefined) {
                    html += '<div class="form-group">';
                    html += '<label for="place">Place</label>';
                    html += '<input type="text" class="form-control" id="place" name="" value="' + mods.originInfo[i].place.placeTerm.__text + '" placeholder="Place Term">';
                    html += '</div>';
                    html += '<hr>';
                }

                if (mods.originInfo[i] !== undefined && mods.originInfo[i].dateCreated !== undefined) {
                    html += '<div class="form-group">';
                    html += '<label for="place">Date Created</label>';
                    html += '<input type="text" class="form-control" id="place" name="" value="' + mods.originInfo[i].dateCreated.__text + '" placeholder="Date Created">';
                    html += '</div>';
                    html += '<hr>';
                }
            }

            html += '</fieldset>';
        }

        if (mods.typeOfResource.__text !== undefined ) {
            html += '<div class="form-group">';
            html += '<label for="typeOfResources">Type of Resource</label>';
            html += '<input type="text" class="form-control" id="typeOfResources" name="" value="' + mods.typeOfResource.__text + '" placeholder="Type of Resource">';
            html += '</div>';
            html += '<hr>';
        }

        if (mods.physicalDescription !== undefined) {

            html += '<fieldset>';
            html += '<legend>Physical Description</legend>';

            if (mods.physicalDescription.digitalOrigin !== undefined) {
                if (mods.physicalDescription.digitalOrigin.__text !== undefined) {
                    html += '<div class="form-group">';
                    html += '<label for="digitalOrigin">Digital Origin</label>';
                    html += '<input type="text" class="form-control" id="digitalOrigin" name="" value="' + mods.physicalDescription.digitalOrigin.__text + '" placeholder="Digital Origin">';
                    html += '</div>';
                    html += '<hr>';
                }
            }

            if (mods.physicalDescription.form !== undefined) {
                if (mods.physicalDescription.form.__text !== undefined) {
                    html += '<div class="form-group">';
                    html += '<label for="form">Form</label>';
                    html += '<input type="text" class="form-control" id="form" name="" value="' + mods.physicalDescription.form.__text + '" placeholder="Form">';
                    html += '</div>';
                    html += '<hr>';
                }
            }

            if (mods.physicalDescription.extent.__text !== undefined) {
                html += '<div class="form-group">';
                html += '<label for="extent">Extent</label>';
                html += '<input type="text" class="form-control" id="extent" name="" value="' + mods.physicalDescription.extent.__text + '" placeholder="Extent">';
                html += '</div>';
                html += '<hr>';
            }

            if (mods.physicalDescription.note.__text !== undefined) {
                html += '<div class="form-group">';
                html += '<label for="note">Note</label>';
                html += '<textarea class="form-control" id="note" name="" placeholder="Note" rows="6">' + mods.physicalDescription.note.__text + '</textarea>';
                html += '</div>';
                html += '<hr>';
            }

            html += '</fieldset';

        }

        if (mods.name !== undefined) {

            console.log(mods.name);
            for (var prop in mods.name) {

                if (prop === 'namePart') {
                    console.log(mods.name.namePart);
                }

                if (prop === 'role') {
                    html += '<div class="form-group">';
                    html += '<label for="roleterm">Name: Role Term</label>';
                    html += '<input type="text" class="form-control" id="roleTerm" name="" value="' + mods.name.role.roleTerm.__text + '" placeholder="Role Term">';
                    html += '</div>';
                    html += '<hr>';
                }
            }
        }

        if (mods.abstract.__text !== undefined) {
            html += '<div class="form-group">';
            html += '<label for="abstract">Abstract</label>';
            html += '<textarea class="form-control" id="abstract" name="" placeholder="Abstract" rows="6">' + mods.abstract.__text + '</textarea>';
            html += '</div>';
            html += '<hr>';
        }

        if (mods.accessCondition !== undefined) {
            html += '<div class="form-group">';
            html += '<label for="accessCondition">Access Condition</label>';
            html += '<input type="text" class="form-control" id="accessCondition" name="" value="' + mods.accessCondition.__text + '" placeholder="Access Condition">';
            html += '</div>';
            html += '<hr>';
        }

        if (mods.identifier !== undefined) {
            for (var i = 0; i < mods.identifier.length; i++) {
                if (mods.identifier[i]._type === 'current') {
                    html += '<div class="form-group">';
                    html += '<label for="accessCondition">Identifier (current)</label>';
                    html += '<input type="text" class="form-control" id="accessCondition" name="" value="' + mods.identifier[i].__text + '" placeholder="Identifier (current)">';
                    html += '</div>';
                    html += '<hr>';
                }
            }
        }

        if (mods.language !== undefined) {
            //console.log(mods.language);
        }

        if (mods.location !== undefined) {
            html += '<div class="form-group">';
            html += '<label for="location">Location: URL</label>';
            html += '<input type="text" class="form-control" id="location" name="" value="' + mods.location.url.__text + '" placeholder="Location">';
            html += '</div>';
            html += '<hr>';
        }

        if (mods.subject !== undefined) {

            html += '<fieldset>';
            html += '<legend>Subjects</legend>';

            for (var i=0;i<mods.subject.length;i++) {

                if (mods.subject[i].name !== undefined) {
                    if (mods.subject[i].name.namePart !== undefined && mods.subject[i].name.namePart.__text !== undefined) {
                        html += '<div class="form-group">';
                        html += '<label for="subject-name">Subject Name</label>';
                        html += '<input type="text" class="form-control" id="subject-name" name="" value="' + mods.subject[i].name.namePart.__text + '" placeholder="Subject Name">';
                        html += '</div>';
                        html += '<hr>';
                    }
                }

                if (mods.subject[i].topic !== undefined) {
                    if (mods.subject[i].topic.__text !== undefined) {
                        html += '<div class="form-group">';
                        html += '<label for="subject-topic">Subject Topic</label>';
                        html += '<input type="text" class="form-control" id="subject-topic" name="" value="' + mods.subject[i].topic.__text + '" placeholder="Subject Topic">';
                        html += '</div>';
                        html += '<hr>';
                    }
                }

                if (mods.subject[i].genre !== undefined) {
                    if (mods.subject[i].genre.__text !== undefined) {
                        html += '<div class="form-group">';
                        html += '<label for="subject-genre">Subject Genre</label>';
                        html += '<input type="text" class="form-control" id="subject-genre" name="" value="' + mods.subject[i].genre.__text + '" placeholder="Subject Genre">';
                        html += '</div>';
                        html += '<hr>';
                    }
                }

                if (mods.subject[i].geographic !== undefined) {
                    if (mods.subject[i].geographic.__text !== undefined) {
                        html += '<div class="form-group">';
                        html += '<label for="subject-geographic">Subject Geographic</label>';
                        html += '<input type="text" class="form-control" id="subject-geographic" name="" value="' + mods.subject[i].geographic.__text + '" placeholder="Subject Geographic">';
                        html += '</div>';
                        html += '<hr>';
                    }
                }

                if (mods.subject[i].occupation !== undefined) {
                    if (mods.subject[i].occupation.__text !== undefined) {
                        html += '<div class="form-group">';
                        html += '<label for="subject-occupation">Subject Occupation</label>';
                        html += '<input type="text" class="form-control" id="subject-occupation" name="" value="' + mods.subject[i].occupation.__text + '" placeholder="Subject Occupation">';
                        html += '</div>';
                        html += '<hr>';
                    }
                }
            }

            html += '</fieldset>';
        }

        $('#metadata-form').html(html);
    };

    obj.getMetadata = function () {
        // https://github.com/abdmob/x2js
        var pid = getParameterByName('pid');

        if (pid !== null) {
            $.ajax(api + '/api/object/mods?pid=' + pid)
                .done(function (data) {
                    console.log(data);
                    var x2js = new X2JS();
                    var metadata = x2js.xml2json(data);
                    renderMetadataForm(metadata.mods);
                })
                .fail(function () {
                    renderError();
                });
        } else {
            console.log('error');
        }
    };

    var updateMetadata = function () {

        var data = {};
        var description;
        var is_active;
        var is_published;

        data.id = $('#id').val();
        data.pid = $('#pid').val();
        data.title = $('#title').val();
        data.description = $('#description').val();

        is_active = $('#is_active').prop('checked');

        if (is_active === false) {
            is_active = 0;
        } else if (is_active === true) {
            is_active = 1;
        }

        is_published = $('#is_published').prop('checked');

        if (is_published === false) {
            is_published = 0;
        } else if (is_published === true) {
            is_published = 1;
        }

        data.is_active = is_active;
        data.is_published = is_published;

        $.ajax({
            url: api + '/api/collection',
            method: 'PUT',
            data: data,
            cache: false
        })
            .done(function (response) {
                if (response.status === 200) {
                    setTimeout(function () {
                        $('#message').html('');
                    }, 3000);

                    $('#message').html('<div class="alert alert-success">' + response.message + '</div>');
                }
            })
            .fail(function () {
                renderError();
            });
    };

    obj.updateMetadataInit = function () {
        $('#metadata-form').validate({
            submitHandler: function () {
                updateMetadata();
            }
        });
    };

    obj.init = function () {
        metadataModule.getMetadata();
        userModule.renderUserName();
    };

    return obj;

}());