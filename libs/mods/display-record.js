const config = require('../../config/config'),
    parseString = require('xml2js').parseString,
    knex = require('knex')({
        client: 'mysql2',
        connection: {
            host: config.dbHost,
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbName
        }
    }),
    REPO_OBJECTS = 'tbl_objects',
    TIMER = 550;

/**
 *
 * @param obj
 */
exports.create_display_record = function (obj, callback) {

    'use strict';

    let mods = obj.mods;
    let record = {};
    record.pid = obj.pid;
    record.is_member_of_collection = obj.is_member_of_collection;
    record.object_type = 'object';
    record.handle = obj.handle;
    record.thumbnail = obj.thumbnail;
    record.object = obj.file_name;
    record.mime_type = obj.mime_type;

    var metadata = JSON.parse(mods);

    if (metadata.title !== undefined) {
        record.title = metadata.title;
    }

    if (metadata.creator !== undefined) {
        record.creator = metadata.creator;
    }

    if (metadata.subjects !== undefined) {
        var subjectsArr = [];
        for (var i=0;i<metadata.subjects.length;i++) {
            subjectsArr.push(metadata.subjects[i].title);
        }

        record.f_subjects = subjectsArr;
    }

    if (metadata.abstract !== undefined) {
        record.abstract = metadata.abstract;
    }

    if (metadata.type !== undefined) {
        record.type = metadata.type;
    }

    record.display_record = JSON.parse(obj.mods);

    callback(JSON.stringify(record));
};

/**
 * Creates display records
 * @param pid
 */
exports.create_display_record_old = function (pid) {

    'use strict';

    knex.select('is_member_of_collection', 'pid', 'mods', 'mime_type', 'object_type', 'handle', 'thumbnail', 'file_name')
        .from(REPO_OBJECTS)
        .where({
            pid: pid
        })
        .then(function (data) {

            if (data.length === 0) {
                console.log('no data.');
                return false;
            }

            let timer0 = setInterval(function () {

                if (data.length === 0) {
                    clearInterval(timer0);
                    return false;
                }

                let xml = data.pop();

                if (xml.pid === null) {
                    return false;
                }

                parseString(xml.mods, function (error, result) {

                    if (error) {
                        console.log(error);
                        throw error;
                    }

                    if (result.mods === undefined) {
                        console.log(result);
                        throw 'MODS not found.';
                    }

                    let doc = modsToJson(result, xml);

                    if (doc === undefined) {
                        console.log('Unable to create doc.');
                        throw 'Unable to create doc.';
                    }

                    saveDisplayRecord(doc, xml);
                });

            }, TIMER);
        })
        .catch(function (error) {
            console.error(error);
            throw error;
        });
};

/** TODO: figure if this is still needed.
 * Creates display records for all repo objects
 */
exports.create_display_records = function () {

    'use strict';

    let timer0 = setInterval(function () {

        knex.select('pid')
            .from(REPO_OBJECTS)
            .where({
                q_status: 0
            })
            .limit(1)
            .then(function (data) {

                if (data.length === 0) {

                    clearInterval(timer0);

                    // reset
                    knex(REPO_OBJECTS)
                        .update({
                            q_status: 0
                        })
                        .then(function (data) {
                            console.log(data);
                        })
                        .catch(function (error) {
                            console.error(error);
                            throw error;
                        });

                    return false;
                }

                let record = data.pop();

                console.log(record.pid);
                exports.create_display_record(record.pid);

                knex(REPO_OBJECTS)
                    .where({
                        pid: record.pid
                    })
                    .update({
                        q_status: 1
                    })
                    .then(function (data) {
                        if (data !== 1) {
                            // TODO: log update error
                            console.log(data);
                            throw 'Database display record queue error';
                        }
                    })
                    .catch(function (error) {
                        console.error(error);
                        throw error;
                    });

                return null;

            })
            .catch(function (error) {
                console.log(error);
                throw error;
            });

    }, TIMER);
};

/**
 * Saves display record to repo db
 * @param doc
 * @param xml
 */
var saveDisplayRecord = function (doc, xml) {

    'use strict';

    knex(REPO_OBJECTS)
        .where({
            pid: xml.pid
        })
        .update({
            display_record: JSON.stringify(doc)  // display_record
        })
        .then(function (data) {
            if (data !== 1) {
                // TODO: log update error
                console.log(data);
                throw 'Database display record error';
            }
        })
        .catch(function (error) {
            console.error(error);
            throw error;
        });
};

/**  TODO: remove
 * Converts mods xml to json
 * @param result
 * @param xml
 * @returns {{}}
 */
var modsToJson = function (result, xml) {

    'use strict';

    var mods = {},
        title = [],
        name = [],
        originInfo = [],
        subject = [],
        physicalDescription = [],
        location = [];

    // titleInfo
    if (result.mods.titleInfo !== undefined) {

        for (let i = 0; i < result.mods.titleInfo.length; i++) {
            title.push(result.mods.titleInfo[i].title.toString());
        }

        mods.title = title;
    }

    // name
    if (result.mods.name !== undefined) {

        for (let i = 0; i < result.mods.name.length; i++) {

            let nameObj = {};

            if (result.mods.name[i].namePart !== undefined && result.mods.name[i].namePart[0] !== undefined && result.mods.name[i].namePart[0]._ !== undefined) {

                // console.log(result.mods.name[i].namePart[0]._);
                nameObj.namePart = result.mods.name[i].namePart[0]._.toString();
            } else if (result.mods.name[i].namePart !== undefined && result.mods.name[i].namePart !== undefined) {
                // console.log(result.mods.name[i].namePart[0]);
                nameObj.namePart = result.mods.name[i].namePart.toString();
            }

            if (result.mods.name[i].role !== undefined) {
                nameObj.role = result.mods.name[i].role[0].roleTerm[0]._.toString();
            }

            name.push(nameObj);
            mods.name = name;
        }
    }

    // typeOfResource
    if (result.mods.typeOfResource !== undefined) {
        mods.typeOfResource = result.mods.typeOfResource.toString();
    }

    // genre
    if (result.mods.genre !== undefined) {

        if (result.mods.genre[0]._ !== undefined) {
            mods.genre = result.mods.genre[0]._.toString();
        } else if (result.mods.genre[0] !== undefined) {
            mods.genre = result.mods.genre[0].toString();
        }
    }

    // originInfo
    if (result.mods.originInfo !== undefined) {

        for (let i = 0; i < result.mods.originInfo.length; i++) {

            var originInfoObj = {};

            if (result.mods.originInfo[i].publisher !== undefined) {

                if (result.mods.originInfo[i].publisher !== undefined) {
                    originInfoObj.publisher = result.mods.originInfo[i].publisher.toString();
                } else if (result.mods.originInfo[i].publisher[0]._ !== undefined) {
                    originInfoObj.publisher = result.mods.originInfo[i].publisher[0]._.toString();
                }
            }

            if (result.mods.originInfo[i].place !== undefined) {

                if (result.mods.originInfo[i].place[0].placeTerm[0]._ !== undefined) {
                    originInfoObj.place = result.mods.originInfo[i].place[0].placeTerm[0]._.toString();
                } else if (result.mods.originInfo[i].place[0].placeTerm[0] !== undefined) {
                    originInfoObj.place = result.mods.originInfo[i].place[0].placeTerm[0].toString();
                }
            }

            if (result.mods.originInfo[i].dateCreated !== undefined) {

                // TODO: create dateCreated text mapping console.log(result.mods.originInfo[i].dateCreated);

                // console.log(result.mods.originInfo[i].dateCreated[0]);

                if (result.mods.originInfo[i].dateCreated[0]._ !== undefined) {
                    originInfoObj.d_created = result.mods.originInfo[i].dateCreated[0]._.toString().replace('?', '').trim();
                } else if (result.mods.originInfo[i].dateCreated[0] !== undefined) {
                    originInfoObj.d_created = result.mods.originInfo[i].dateCreated[0].toString().replace('?', '').trim();
                    // console.log(originInfoObj.d_created);
                }
            }

            if (result.mods.originInfo[i].dateIssued !== undefined) {

                if (result.mods.originInfo[i].dateIssued[0]._ !== undefined) {
                    originInfoObj.d_issued = result.mods.originInfo[i].dateIssued[0]._.toString();
                } else if (result.mods.originInfo[i].dateIssued[0] !== undefined) {
                    originInfoObj.d_issued = result.mods.originInfo[i].dateIssued[0].toString();
                }
            }

            if (result.mods.originInfo[i].dateCaptured !== undefined) {

                if (result.mods.originInfo[i].dateCaptured[0]._ !== undefined) {
                    originInfoObj.d_captured = result.mods.originInfo[i].dateCaptured[0]._.toString();
                } else if (result.mods.originInfo[i].dateCaptured[0] !== undefined) {
                    originInfoObj.d_captured = result.mods.originInfo[i].dateCaptured[0].toString();
                }
            }

            if (result.mods.originInfo[i].dateValid !== undefined) {

                if (result.mods.originInfo[i].dateValid[0]._ !== undefined) {
                    originInfoObj.d_valid = result.mods.originInfo[i].dateValid[0]._.toString();
                } else if (result.mods.originInfo[i].dateValid[0] !== undefined) {
                    originInfoObj.d_valid = result.mods.originInfo[i].dateValid[0].toString();
                }
            }

            if (result.mods.originInfo[i].dateModified !== undefined) {

                if (result.mods.originInfo[i].dateModified[0]._ !== undefined) {
                    originInfoObj.d_modified = result.mods.originInfo[i].dateModified[0]._.toString();
                } else if (result.mods.originInfo[i].dateModified[0] !== undefined) {
                    originInfoObj.d_modified = result.mods.originInfo[i].dateModified[0].toString();
                }
            }

            if (result.mods.originInfo[i].copyrightDate !== undefined) {

                if (result.mods.originInfo[i].copyrightDate[0]._ !== undefined) {
                    originInfoObj.copyrightDate = result.mods.originInfo[i].copyrightDate[0]._.toString();
                } else if (result.mods.originInfo[i].copyrightDate[0] !== undefined) {
                    originInfoObj.copyrightDate = result.mods.originInfo[i].copyrightDate[0].toString();
                }
            }

            if (result.mods.originInfo[i].dateOther !== undefined) {

                if (result.mods.originInfo[i].dateOther[0]._ !== undefined) {
                    originInfoObj.d_other = result.mods.originInfo[i].dateOther[0]._.toString();
                } else if (result.mods.originInfo[i].dateOther[0] !== undefined) {
                    originInfoObj.d_other = result.mods.originInfo[i].dateOther[0].toString();
                }
            }

            if (result.mods.originInfo[i].edition !== undefined) {

                if (result.mods.originInfo[i].edition[0]._ !== undefined) {
                    originInfoObj.edition = result.mods.originInfo[i].edition[0]._.toString();
                } else if (result.mods.originInfo[i].edition[0] !== undefined) {
                    originInfoObj.edition = result.mods.originInfo[i].edition[0].toString();
                }
            }

            if (result.mods.originInfo[i].issuance !== undefined) {

                if (result.mods.originInfo[i].issuance[0]._ !== undefined) {
                    originInfoObj.issuance = result.mods.originInfo[i].issuance[0]._.toString();
                } else if (result.mods.originInfo[i].issuance[0] !== undefined) {
                    originInfoObj.issuance = result.mods.originInfo[i].issuance[0].toString();
                }
            }

            if (result.mods.originInfo[i].frequency !== undefined) {

                if (result.mods.originInfo[i].frequency[0]._ !== undefined) {
                    originInfoObj.frequency = result.mods.originInfo[i].frequency[0]._.toString();
                } else if (result.mods.originInfo[i].frequency[0] !== undefined) {
                    originInfoObj.frequency = result.mods.originInfo[i].frequency[0].toString();
                }
            }

            originInfo.push(originInfoObj);
            mods.originInfo = originInfo;
        }
    }

    // language
    if (result.mods.language !== undefined) {

        if (result.mods.language[0].languageTerm !== undefined) {

            if (result.mods.language[0].languageTerm[0]._ !== undefined) {
                // console.log(result.mods.language[0].languageTerm[0]._.toString());
                mods.language = result.mods.language[0].languageTerm[0]._.toString();
            } else if (result.mods.language[0].languageTerm[0] !== undefined) {
                // console.log(result.mods.language[0].languageTerm[0].toString());
                mods.language = result.mods.language[0].languageTerm[0].toString();
            }
        }
    }

    // physicalDescription
    if (result.mods.physicalDescription !== undefined) {

        for (let i = 0; i < result.mods.physicalDescription.length; i++) {

            let physicalDescriptionObj = {};

            if (result.mods.physicalDescription[i].form !== undefined) {

                // TODO: form value not being parsed correctly
                if (result.mods.physicalDescription[i].form !== undefined && result.mods.physicalDescription[i].form[0]._ === undefined) {
                    // console.log(result.mods.physicalDescription[i].form[0]);
                    physicalDescriptionObj.form = result.mods.physicalDescription[i].form[0].toString();
                } else if (result.mods.physicalDescription[i].form[0]._ !== undefined) {
                    // console.log(result.mods.physicalDescription[i].form[0]._);
                    physicalDescriptionObj.form = result.mods.physicalDescription[i].form[0]._.toString();
                }
            }

            if (result.mods.physicalDescription[i].reformattingQuality !== undefined) {

                if (result.mods.physicalDescription[i].reformattingQuality !== undefined) {
                    physicalDescriptionObj.reformattingQuality = result.mods.physicalDescription[i].reformattingQuality.toString();
                } else if (result.mods.physicalDescription[i].reformattingQuality[0]._ !== undefined) {
                    physicalDescriptionObj.reformattingQuality = result.mods.physicalDescription[i].reformattingQuality[0]._.toString();
                }
            }

            if (result.mods.physicalDescription[i].internetMediaType !== undefined) {

                if (result.mods.physicalDescription[i].internetMediaType !== undefined) {
                    physicalDescriptionObj.internetMediaType = result.mods.physicalDescription[i].internetMediaType.toString();
                } else if (result.mods.physicalDescription[i].internetMediaType[0]._ !== undefined) {
                    physicalDescriptionObj.internetMediaType = result.mods.physicalDescription[i].internetMediaType[0]._.toString();
                }
            }

            if (result.mods.physicalDescription[i].extent !== undefined) {

                if (result.mods.physicalDescription[i].extent !== undefined) {
                    physicalDescriptionObj.extent = result.mods.physicalDescription[i].extent.toString();
                } else if (result.mods.physicalDescription[i].extent[0]._ !== undefined) {
                    physicalDescriptionObj.extent = result.mods.physicalDescription[i].extent[0]._.toString();
                }
            }

            if (result.mods.physicalDescription[i].digitalOrigin !== undefined) {

                if (result.mods.physicalDescription[i].digitalOrigin !== undefined) {
                    physicalDescriptionObj.digitalOrigin = result.mods.physicalDescription[i].digitalOrigin.toString();
                } else if (result.mods.physicalDescription[i].digitalOrigin[0]._ !== undefined) {
                    physicalDescriptionObj.digitalOrigin = result.mods.physicalDescription[i].digitalOrigin[0]._.toString();
                }
            }

            // TODO: note field not being parsed correctly
            if (result.mods.physicalDescription[i].note !== undefined) {

                if (result.mods.physicalDescription[i].note !== undefined) {
                    physicalDescriptionObj.note = result.mods.physicalDescription[i].note.toString();
                } else if (result.mods.physicalDescription[i].note[0]._ !== undefined) {
                    physicalDescriptionObj.note = result.mods.physicalDescription[i].note[0]._.toString();
                }
            }

            physicalDescription.push(physicalDescriptionObj);
            mods.physicalDescription = physicalDescription;
        }
    }

    // abstract
    if (result.mods.abstract !== undefined) {

        if (result.mods.abstract[0] !== undefined) {

            if (result.mods.abstract[0]._ !== undefined) {
                mods.abstract = result.mods.abstract[0]._.toString();
            } else if (result.mods.abstract[0] !== undefined) {
                mods.abstract = result.mods.abstract[0].toString();
            }
        }
    }

    // tableOfContents
    if (result.mods.tableOfContents !== undefined) {

        if (result.mods.tableOfContents[0] !== undefined) {

            if (result.mods.tableOfContents[0]._ !== undefined) {
                mods.tableOfContents = result.mods.tableOfContents[0]._.toString();
            } else if (result.mods.tableOfContents[0] !== undefined) {
                mods.tableOfContents = result.mods.tableOfContents[0].toString();
            }
        }
    }

    // targetAudience
    if (result.mods.targetAudience !== undefined) {

        if (result.mods.targetAudience[0] !== undefined) {

            if (result.mods.targetAudience[0]._ !== undefined) {
                mods.targetAudience = result.mods.targetAudience[0]._.toString();
            } else if (result.mods.targetAudience[0] !== undefined) {
                mods.targetAudience = result.mods.targetAudience[0].toString();
            }
        }
    }

    // note
    if (result.mods.note !== undefined) {

        if (result.mods.note[0] !== undefined) {

            if (result.mods.note[0]._ !== undefined) {
                mods.note = result.mods.note[0]._.toString();
            } else if (result.mods.note[0] !== undefined) {
                mods.targetAudience = result.mods.note[0].toString();
            }
        }
    }

    if (result.mods.subject !== undefined) {

        for (let i = 0; i < result.mods.subject.length; i++) {

            if (result.mods.subject[i].name !== undefined) {

                // console.log(result.mods.subject[i].name);

                for (var j = 0; j < result.mods.subject[i].name.length; j++) {

                    var subjectNameObj = {};

                    if (result.mods.subject[i].name[j].namePart !== undefined && result.mods.subject[i].name[j].namePart[0] !== undefined && result.mods.subject[i].name[j].namePart[0]._ !== undefined) {
                        // console.log(result.mods.subject[i].name[j].namePart[0]._);
                        subjectNameObj.namePart = result.mods.subject[i].name[j].namePart[0]._.toString();
                    } else if (result.mods.subject[i].name[j].namePart !== undefined && result.mods.subject[i].name[j].namePart !== undefined) {
                        subjectNameObj.namePart = result.mods.subject[i].name[j].namePart.toString();
                    }

                    if (result.mods.subject[i].name[j].displayForm !== undefined) {
                        subjectNameObj.displayForm = result.mods.subject[i].name[j].displayForm.toString();
                    }

                    if (result.mods.subject[i].name[j].affiliation !== undefined) {
                        subjectNameObj.affiliation = result.mods.subject[i].name[j].affiliation.toString();
                    }

                    if (result.mods.subject[i].name[j].description !== undefined) {
                        subjectNameObj.description = result.mods.subject[i].name[j].description.toString();
                    }

                    if (result.mods.subject[i].name[j].role !== undefined) {

                        if (result.mods.subject[i].name[j].role[0].roleTerm !== undefined && result.mods.subject[i].name[j].role[0].roleTerm[0]._ === undefined) {

                            // console.log(result.mods.subject[i].name[j].role[0].roleTerm[0]);
                            subjectNameObj.role = result.mods.subject[i].name[j].role[0].roleTerm[0].toString();

                        } else if (result.mods.subject[i].name[j].role[0].roleTerm[0]._ !== undefined) {

                            // console.log(result.mods.subject[i].name[j].role[0].roleTerm[0]._);
                            subjectNameObj.role = result.mods.subject[i].name[j].role[0].roleTerm[0]._.toString();

                        }
                    }

                    subject.push(subjectNameObj);
                }
            }

            if (result.mods.subject[i].topic !== undefined) {

                let subjectTopicObj = {};
                subjectTopicObj.topic = result.mods.subject[i].topic.toString();
                subject.push(subjectTopicObj);
            }

            if (result.mods.subject[i].geographic !== undefined) {

                let subjectGeographicObj = {};
                subjectGeographicObj.geographic = result.mods.subject[i].geographic.toString();
                subject.push(subjectGeographicObj);
            }

            if (result.mods.subject[i].temporal !== undefined) {

                let subjectTemporalObj = {};
                subjectTemporalObj.temporal = result.mods.subject[i].temporal.toString();
                subject.push(subjectTemporalObj);
            }

            if (result.mods.subject[i].titleInfo !== undefined) {

                for (let j = 0; j < result.mods.subject[i].titleInfo.length; j++) {

                    let subjectTitleInfoObj = {};

                    if (result.mods.subject[i].titleInfo[j].title !== undefined) {
                        subjectTitleInfoObj.title = result.mods.subject[i].titleInfo[j].title.toString();
                    }

                    if (result.mods.subject[i].titleInfo[j].subTitle !== undefined) {
                        subjectTitleInfoObj.subTitle = result.mods.subject[i].titleInfo[j].subTitle.toString();
                    }

                    if (result.mods.subject[i].titleInfo[j].partNumber !== undefined) {
                        subjectTitleInfoObj.partNumber = result.mods.subject[i].titleInfo[j].partNumber.toString();
                    }

                    if (result.mods.subject[i].titleInfo[j].partName !== undefined) {
                        subjectTitleInfoObj.partName = result.mods.subject[i].titleInfo[j].partName.toString();
                    }

                    if (result.mods.subject[i].titleInfo[j].nonSort !== undefined) {
                        subjectTitleInfoObj.nonSort = result.mods.subject[i].titleInfo[j].nonSort.toString();
                    }

                    // console.log(subjectTitleInfoObj);
                    subject.push(subjectTitleInfoObj);
                }
            }

            if (result.mods.subject[i].cartographics !== undefined) {

                for (let j = 0; j < result.mods.subject[i].cartographics.length; j++) {

                    let subjectCartographicsObj = {};

                    if (result.mods.subject[i].cartographics[j].scale !== undefined) {
                        subjectCartographicsObj.scale = result.mods.subject[i].cartographics[j].scale.toString();
                    }

                    if (result.mods.subject[i].cartographics[j].projection !== undefined) {
                        subjectCartographicsObj.projection = result.mods.subject[i].cartographics[j].projection.toString();
                    }

                    if (result.mods.subject[i].cartographics[j].coordinates !== undefined) {
                        subjectCartographicsObj.coordinates = result.mods.subject[i].cartographics[j].coordinates.toString();
                    }

                    // console.log(subjectCartographicsObj);
                    subject.push(subjectCartographicsObj);
                }
            }

            if (result.mods.subject[i].geographicCode !== undefined) {

                let subjectGeographicCodeObj = {};
                subjectGeographicCodeObj.geographicCode = result.mods.subject[i].geographicCode.toString();
                // console.log(subjectGeographicCodeObj);
                subject.push(subjectGeographicCodeObj);
            }

            if (result.mods.subject[i].genre !== undefined) {

                let subjectGenreObj = {};
                subjectGenreObj.genre = result.mods.subject[i].genre.toString();
                // console.log(subjectGenreObj);
                subject.push(subjectGenreObj);
            }

            if (result.mods.subject[i].occupation !== undefined) {

                // console.log(result.mods.subject[i].occupation.toString());

                let subjectOccupationObj = {};
                subjectOccupationObj.occupation = result.mods.subject[i].occupation.toString();
                // console.log('occupation', subjectOccupationObj);
                subject.push(subjectOccupationObj);
            }

            if (result.mods.subject[i].hierarchicalGeographic !== undefined) {

                for (let j = 0; j < result.mods.subject[i].hierarchicalGeographic.length; j++) {

                    let subjectHierarchicalGeographicObj = {};

                    if (result.mods.subject[i].hierarchicalGeographic[j].continent !== undefined) {
                        subjectHierarchicalGeographicObj.continent = result.mods.subject[i].hierarchicalGeographic[j].continent.toString();
                    }

                    if (result.mods.subject[i].hierarchicalGeographic[j].country !== undefined) {
                        subjectHierarchicalGeographicObj.country = result.mods.subject[i].hierarchicalGeographic[j].country.toString();
                    }

                    if (result.mods.subject[i].hierarchicalGeographic[j].region !== undefined) {
                        subjectHierarchicalGeographicObj.region = result.mods.subject[i].hierarchicalGeographic[j].region.toString();
                    }

                    if (result.mods.subject[i].hierarchicalGeographic[j].state !== undefined) {
                        subjectHierarchicalGeographicObj.state = result.mods.subject[i].hierarchicalGeographic[j].state.toString();
                    }

                    if (result.mods.subject[i].hierarchicalGeographic[j].territory !== undefined) {
                        subjectHierarchicalGeographicObj.territory = result.mods.subject[i].hierarchicalGeographic[j].territory.toString();
                    }

                    if (result.mods.subject[i].hierarchicalGeographic[j].county !== undefined) {
                        subjectHierarchicalGeographicObj.county = result.mods.subject[i].hierarchicalGeographic[j].county.toString();
                    }

                    if (result.mods.subject[i].hierarchicalGeographic[j].city !== undefined) {
                        subjectHierarchicalGeographicObj.city = result.mods.subject[i].hierarchicalGeographic[j].city.toString();
                    }

                    if (result.mods.subject[i].hierarchicalGeographic[j].island !== undefined) {
                        subjectHierarchicalGeographicObj.island = result.mods.subject[i].hierarchicalGeographic[j].island.toString();
                    }

                    if (result.mods.subject[i].hierarchicalGeographic[j].area !== undefined) {
                        subjectHierarchicalGeographicObj.area = result.mods.subject[i].hierarchicalGeographic[j].area.toString();
                    }

                    if (result.mods.subject[i].hierarchicalGeographic[j].extraterrestrialArea !== undefined) {
                        subjectHierarchicalGeographicObj.extraterrestrialArea = result.mods.subject[i].hierarchicalGeographic[j].extraterrestrialArea.toString();
                    }

                    if (result.mods.subject[i].hierarchicalGeographic[j].citySection !== undefined) {
                        subjectHierarchicalGeographicObj.citySection = result.mods.subject[i].hierarchicalGeographic[j].citySection.toString();
                    }

                    // console.log('subjectHierarchicalGeographicObj', subjectHierarchicalGeographicObj);
                    subject.push(subjectHierarchicalGeographicObj);
                }
            }

            // classification
            if (result.mods.classification !== undefined) {

                if (result.mods.classification[0] !== undefined) {

                    if (result.mods.classification[0]._ !== undefined) {
                        mods.classification = result.mods.classification[0]._.toString();
                    } else if (result.mods.classification[0] !== undefined) {
                        mods.classification = result.mods.classification[0].toString();
                    }
                }
            }

            // identifier// TOOD: loop?
            if (result.mods.identifier !== undefined) {

                if (result.mods.identifier[0] !== undefined) {

                    if (result.mods.identifier[0]._ !== undefined) {
                        mods.identifier = result.mods.identifier[0]._.toString();
                    } else if (result.mods.identifier[0] !== undefined) {
                        mods.identifier = result.mods.identifier[0].toString();
                    }
                }
            }

            // accessCondition
            if (result.mods.accessCondition !== undefined) {

                if (result.mods.accessCondition[0] !== undefined) {

                    if (result.mods.accessCondition[0]._ !== undefined) {
                        mods.accessCondition = result.mods.accessCondition[0]._.toString();
                    } else if (result.mods.accessCondition[0] !== undefined) {
                        mods.accessCondition = result.mods.accessCondition[0].toString();
                    }
                }
            }

            mods.subject = subject;
        }
    }

    // location
    if (result.mods.location !== undefined) {

        for (let i = 0; i < result.mods.location.length; i++) {

            let locationObj = {};

            if (result.mods.location[i].url !== undefined) {

                if (result.mods.location[i].url !== undefined && result.mods.location[i].url[0]._ === undefined) {
                    locationObj.url = result.mods.location[i].url[0].toString();
                } else if (result.mods.location[i].url[0]._ !== undefined) {
                    locationObj.url = result.mods.location[i].url[0]._.toString();
                }
            }

            location.push(locationObj);
            mods.location = location;

            /*
             if (result.mods.physicalDescription[i].reformattingQuality !== undefined) {

             if (result.mods.physicalDescription[i].reformattingQuality !== undefined) {
             physicalDescriptionObj.reformattingQuality = result.mods.physicalDescription[i].reformattingQuality.toString();
             } else if (result.mods.physicalDescription[i].reformattingQuality[0]._ !== undefined) {
             physicalDescriptionObj.reformattingQuality = result.mods.physicalDescription[i].reformattingQuality[0]._.toString();
             }
             }
             */

            /*
             if (result.mods.physicalDescription[i].internetMediaType !== undefined) {

             if (result.mods.physicalDescription[i].internetMediaType !== undefined) {
             physicalDescriptionObj.internetMediaType = result.mods.physicalDescription[i].internetMediaType.toString();
             } else if (result.mods.physicalDescription[i].internetMediaType[0]._ !== undefined) {
             physicalDescriptionObj.internetMediaType = result.mods.physicalDescription[i].internetMediaType[0]._.toString();
             }
             }
             */

            /*
             if (result.mods.physicalDescription[i].extent !== undefined) {

             if (result.mods.physicalDescription[i].extent !== undefined) {
             physicalDescriptionObj.extent = result.mods.physicalDescription[i].extent.toString();
             } else if (result.mods.physicalDescription[i].extent[0]._ !== undefined) {
             physicalDescriptionObj.extent = result.mods.physicalDescription[i].extent[0]._.toString();
             }
             }
             */
        }
    }

    let tmp = xml.pid.replace('codu:', ''),
        pid = tmp.replace('cdpsm:', ''),
        mime_type = xml.mime_type,
        object_type = xml.object_type,
        is_member_of_collection = xml.is_member_of_collection,
        handle = xml.handle,
        thumbnail = xml.thumbnail,
        object = xml.file_name;

    // TODO: recordInfo, extension, part, relatedItem
    let doc = {};
    doc.pid = xml.pid;
    doc.mime_type = mime_type;
    doc.is_member_of_collection = is_member_of_collection;
    doc.display_record = mods;
    doc.object_type = object_type;
    doc.handle = handle;
    doc.thumbnail = thumbnail;
    doc.object = object;

    if (mods.title !== undefined) {
        doc.title = mods.title;
    }

    if (mods.subject !== undefined) {

        var subjects = [];

        for (let i = 0; i < mods.subject.length; i++) {

            if (mods.subject[i].namePart !== undefined) {
                subjects.push(mods.subject[i].namePart);
            }

            /*
             if (mods.subject[i].displayForm !== undefined) {
             subject.push(mods.subject[i].displayForm);
             }
             */

            if (mods.subject[i].affiliation !== undefined) {
                subjects.push(mods.subject[i].affiliation);
            }

            /*
             if (mods.subject[i].description !== undefined) {
             subject.push(mods.subject[i].description);
             }
             */

            /*
             if (mods.subject[i].role !== undefined) {
             subject.push(mods.subject[i].role);
             }
             */

            if (mods.subject[i].topic !== undefined) {
                subjects.push(mods.subject[i].topic);
            }

            if (mods.subject[i].genre !== undefined) {
                subjects.push(mods.subject[i].genre);
            }

            if (mods.subject[i].geographic !== undefined) {
                subjects.push(mods.subject[i].geographic);
            }

            if (mods.subject[i].temporal !== undefined) {
                subjects.push(mods.subject[i].temporal);
            }

            if (mods.subject[i].title !== undefined) {
                subjects.push(mods.subject[i].title);
            }

            if (mods.subject[i].subTitle !== undefined) {
                subjects.push(mods.subject[i].subTitle);
            }

            if (mods.subject[i].occupation !== undefined) {
                subjects.push(mods.subject[i].occupation);
            }

            if (mods.subject[i].continent !== undefined) {
                subjects.push(mods.subject[i].continent);
            }

            if (mods.subject[i].country !== undefined) {
                subjects.push(mods.subject[i].country);
            }

            if (mods.subject[i].region !== undefined) {
                subjects.push(mods.subject[i].region);
            }

            if (mods.subject[i].state !== undefined) {
                subjects.push(mods.subject[i].state);
            }

            if (mods.subject[i].territory !== undefined) {
                subjects.push(mods.subject[i].territory);
            }

            if (mods.subject[i].county !== undefined) {
                subjects.push(mods.subject[i].county);
            }

            if (mods.subject[i].city !== undefined) {
                subjects.push(mods.subject[i].city);
            }

            if (mods.subject[i].island !== undefined) {
                subjects.push(mods.subject[i].island);
            }

            if (mods.subject[i].area !== undefined) {
                subjects.push(mods.subject[i].area);
            }

            if (mods.subject[i].extraterrestrialArea !== undefined) {
                subjects.push(mods.subject[i].extraterrestrialArea);
            }

            // console.log(subject);
        }

        if (subjects.length > 0 && subjects !== null) {
            // console.log(subjects);
            doc.subject = subjects;
        }
    }

    if (mods.name !== undefined) {
        // console.log('namePart', mods.name[0].namePart);
        doc.creator = mods.name[0].namePart;
    }

    if (mods.abstract !== undefined) {
        doc.abstract = mods.abstract;
    }

    if (mods.typeOfResource !== undefined) {
        doc.type = mods.typeOfResource;
    }

    return doc;
};