'use strict';

var getModsTitleInfo = function (xml) {

    var modsForm = '',
        titleInfo = xml.find('titleInfo'),
        title = xml.find('title'),
        subTitle = xml.find('subTitle'),
        partNumber = xml.find('partNumber'),
        partName = xml.find('partName'),
        nonSort = xml.find('nonSort');

    // check if titleInfo element exist
    if (titleInfo.length !== 0) {

        modsForm += '<fieldset>';
        modsForm += '<legend>TitleInfo</legend>';

        /* titleInfo element attributes */
        var titleInfoIdAttr = titleInfo.attr('ID'),
            titleInfoXlinkAttr = titleInfo.attr('xlink'),
            titleInfoXmlLangAttr = titleInfo.attr('xml:lang'),
            titleInfoScriptAttr = titleInfo.attr('script'),
            titleInfoTransliteration = titleInfo.attr('transliteration'),
            titleInfoLangAttr = title.attr('lang'),
            titleInfoTypeAttr = titleInfo.attr('type'),
            titleInfoOtherTypeAttr = titleInfo.attr('otherType'),
            titleInfoAuthorityAttr = titleInfo.attr('authority'),
            titleInfoDisplayLabelAttr = titleInfo.attr('displayLabel'),
            titleInfoSuppliedAttr = titleInfo.attr('supplied'),
            titleInfoUsageAttr = titleInfo.attr('usage'),
            titleInfoAltRepGroupAttr = titleInfo.attr('altRepGroup'),
            titleInfoNameTitleGroupAttr = titleInfo.attr('nameTitleGroup'),
            titleInfoAltFormatAttr = titleInfo.attr('altFormat'),
            titleInfoAltContentAttr = titleInfo.attr('altContent');

        modsForm += '<p><a id="titleInfoAttrsLink" class="btn btn-xs btn-primary" href="#">Add TitleInfo element attributes</a></p>';

        modsForm += '<div class="row" id="titleInfoAttrs" style="display: none">';
        modsForm += '<div class="col-lg-6">';

        /* id attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_titleInfo_id_attr">Mods > TitleInfo: (ID) attribute</label>';

        if (titleInfoIdAttr !== undefined) {
            modsForm += '<input id="mods_titleInfo_id_attr" class="form-control" name="mods_titleInfo_id_attr" type="text" value="' + titleInfoIdAttr + '">';
        } else {
            modsForm += '<input id="mods_titleInfo_id_attr" class="form-control" name="mods_titleInfo_id_attr" type="text" placeholder="none" value="">';
        }

        modsForm += '</div>';

        /* xlink attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_titleInfo_xlink_attr">Mods > TitleInfo: (XLINK) attribute</label>';

        if (titleInfoXlinkAttr !== undefined) {
            modsForm += '<input id="mods_titleInfo_xlink_attr" class="form-control" name="mods_titleInfo_xlink_attr" type="text" value="' + titleInfoXlinkAttr + '">';
        } else {
            modsForm += '<input id="mods_titleInfo_xlink_attr" class="form-control" name="mods_titleInfo_xlink_attr" type="text" placeholder="none" value="">';
        }

        modsForm += '</div>';

        /* xml:lang attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_titleInfo_xmllang_attr">Mods > TitleInfo: (XML:LANG) attribute</label>';

        if (titleInfoXmlLangAttr !== undefined) {
            modsForm += '<input id="mods_titleInfo_xmllang_attr" class="form-control" name="mods_titleInfo_xmllang_attr" type="text" value="' + titleInfoXmlLangAttr + '">';
        } else {
            modsForm += '<input id="mods_titleInfo_xmllang_attr" class="form-control" name="mods_titleInfo_xmllang_attr" type="text" placeholder="none" value="">';
        }

        modsForm += '</div>';


        /* script attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_titleInfo_script_attr">Mods > TitleInfo: (SCRIPT) attribute</label>';

        if (titleInfoScriptAttr !== undefined) {
            modsForm += '<input id="mods_titleInfo_script_attr" class="form-control" name="mods_titleInfo_script_attr" type="text" value="' + titleInfoScriptAttr + '">';
        } else {
            modsForm += '<input id="mods_titleInfo_script_attr" class="form-control" name="mods_titleInfo_script_attr" type="text" placeholder="none" value="">';
        }

        modsForm += '</div>';

        /* transliteration attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_titleInfo_transliteration_attr">Mods > TitleInfo: (TRANSLITERATION) attribute</label>';

        if (titleInfoTransliteration !== undefined) {
            modsForm += '<input id="mods_titleInfo_transliteration_attr" class="form-control" name="mods_titleInfo_transliteration_attr" type="text" value="' + titleInfoTransliteration + '">';
        } else {
            modsForm += '<input id="mods_titleInfo_transliteration_attr" class="form-control" name="mods_titleInfo_transliteration_attr" type="text" placeholder="none" value="">';
        }

        modsForm += '</div>';

        /* lang attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_titleInfo_lang_attr">Mods > TitleInfo: (LANG) attribute</label>';

        if (titleInfoLangAttr !== undefined) {
            modsForm += '<input id="mods_titleInfo_lang_attr" class="form-control" name="mods_titleInfo_lang_attr" type="text" value="' + titleInfoLangAttr + '">';
        } else {
            modsForm += '<input id="mods_titleInfo_lang_attr" class="form-control" name="mods_titleInfo_lang_attr" type="text" placeholder="none" value="">';
        }

        modsForm += '</div>';

        /* type attr */
        if (titleInfoTypeAttr !== undefined) {

            var typeAttr = ['none',
                'enumerated: abbreviated',
                'translated',
                'alternative',
                'uniform'];

            // render form fragments
            modsForm += '<div class="form-group">';
            modsForm += '<label for="mods_title_info_attr">Mods > TitleInfo: (TYPE) attribute</label>';
            modsForm += '<select id="mods_title_info_attr" class="form-control">';

            // render type attribute values
            for (var i = 0; i < typeAttr.length; i++) {

                if (typeAttr[i] === titleInfoTypeAttr) {
                    modsForm += '<option selected>' + titleInfoTypeAttr + '</option>';
                } else {
                    modsForm += '<option>' + typeAttr[i] + '</option>';
                }
            }

            modsForm += '</select>';
            modsForm += '</div>';
        }

        /* otherType attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_titleInfo_othertype_attr">Mods > TitleInfo: (OTHERTYPE) attribute</label>';

        if (titleInfoOtherTypeAttr !== undefined) {
            modsForm += '<input id="mods_titleInfo_othertype_attr" class="form-control" name="mods_titleInfo_othertype_attr" type="text" value="' + titleInfoOtherTypeAttr + '">';
        } else {
            modsForm += '<input id="mods_titleInfo_othertype_attr" class="form-control" name="mods_titleInfo_othertype_attr" type="text" placeholder="none" value="">';
        }

        modsForm += '</div>';

        // end column
        modsForm += '</div>';

        modsForm += '<div class="col-lg-6">';

        /* displayLabel attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_titleInfo_displaylabel_attr">Mods > TitleInfo: (DISPLAYLABEL) attribute</label>';

        if (titleInfoDisplayLabelAttr !== undefined) {
            modsForm += '<input id="mods_titleInfo_displaylabel_attr" class="form-control" name="mods_titleInfo_displaylabel_attr" type="text" value="' + titleInfoDisplayLabelAttr + '">';
        } else {
            modsForm += '<input id="mods_titleInfo_displaylabel_attr" class="form-control" name="mods_titleInfo_displaylabel_attr" type="text" placeholder="none" value="">';
        }

        modsForm += '</div>';

        /* supplied attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_title_info_supplied_attr">Mods > TitleInfo: (SUPPLIED) attribute</label>';
        modsForm += '<select id="mods_title_info_supplied_attr" class="form-control">';

        if (titleInfoSuppliedAttr !== undefined) {
            modsForm += '<option>none</option>';
            modsForm += '<option selected>' + titleInfoSuppliedAttr + '</option>'; // yes
        } else {
            modsForm += '<option selected>none</option>';
            modsForm += '<option>yes</option>'; // yes
        }

        modsForm += '</select>';
        modsForm += '</div>';

        /* usage attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_title_info_usage_attr">Mods > TitleInfo: (USAGE) attribute</label>';
        modsForm += '<select id="mods_title_info_usage_attr" class="form-control">';

        if (titleInfoUsageAttr !== undefined) {
            modsForm += '<option>none</option>';
            modsForm += '<option selected>' + titleInfoUsageAttr + '</option>'; // primary
        } else {
            modsForm += '<option selected>none</option>';
            modsForm += '<option>primary</option>';
        }

        modsForm += '</select>';
        modsForm += '</div>';

        /* altrepgroup attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_titleInfo_altrepgroup_attr">Mods > TitleInfo: (ALTREPGROUP) attribute</label>';

        if (titleInfoAltRepGroupAttr !== undefined) {
            modsForm += '<input id="mods_titleInfo_altrepgroup_attr" class="form-control" name="mods_titleInfo_altrepgroup_attr" type="text" value="' + titleInfoAltRepGroupAttr + '">';
        } else {
            modsForm += '<input id="mods_titleInfo_altrepgroup_attr" class="form-control" name="mods_titleInfo_altrepgroup_attr" type="text" placeholder="none" value="">';
        }

        modsForm += '</div>';

        /* nametitlegroup attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_titleInfo_nametitlegroup_attr">Mods > TitleInfo: (NAMETITLEGROUP) attribute</label>';

        if (titleInfoNameTitleGroupAttr !== undefined) {
            modsForm += '<input id="mods_titleInfo_nametitlegroup_attr" class="form-control" name="mods_titleInfo_nametitlegroup_attr" type="text" value="' + titleInfoNameTitleGroupAttr + '">';
        } else {
            modsForm += '<input id="mods_titleInfo_nametitlegroup_attr" class="form-control" name="mods_titleInfo_nametitlegroup_attr" type="text" placeholder="none" value="">';
        }

        modsForm += '</div>';

        /* altformat attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_titleInfo_altformat_attr">Mods > TitleInfo: (ALTFORMAT) attribute</label>';

        if (titleInfoAltFormatAttr !== undefined) {
            modsForm += '<input id="mods_titleInfo_altformat_attr" class="form-control" name="mods_titleInfo_altformat_attr" type="text" value="' + titleInfoAltFormatAttr + '">';
        } else {
            modsForm += '<input id="mods_titleInfo_altformat_attr" class="form-control" name="mods_titleInfo_altformat_attr" type="text" placeholder="none" value="">';
        }

        modsForm += '</div>';

        /* altcontent attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_titleInfo_altcontent_attr">Mods > TitleInfo: (ALTCONTENT) attribute</label>';

        if (titleInfoAltContentAttr !== undefined) {
            modsForm += '<input id="mods_titleInfo_altcontent_attr" class="form-control" name="mods_titleInfo_altcontent_attr" type="text" value="' + titleInfoAltContentAttr + '">';
        } else {
            modsForm += '<input id="mods_titleInfo_altcontent_attr" class="form-control" name="mods_titleInfo_altcontent_attr" type="text" placeholder="none" value="">';
        }

        modsForm += '</div>';

        /* authority attr */
        modsForm += '<div class="form-group">';
        modsForm += '<label for="mods_titleInfo_authority_attr">Mods > TitleInfo: (AUTHORITY) attribute</label>';

        /* otherType attr */
        if (titleInfoAuthorityAttr !== undefined) {
            modsForm += '<input id="mods_titleInfo_authority_attr" class="form-control" name="mods_titleInfo_othertype_attr" type="text" value="' + titleInfoAuthorityAttr + '">';
        } else {
            modsForm += '<input id="mods_titleInfo_authority_attr" class="form-control" name="mods_titleInfo_othertype_attr" type="text" placeholder="none" value="">';
        }

        modsForm += '</div>';

        // end column
        modsForm += '</div>';
        modsForm += '</div>';

        if (title.length !== 0) {
            modsForm += '<br>';
            modsForm += '<div class="form-group">';
            modsForm += '<label for="mods_title">* Mods > TitleInfo > TITLE</label>';
            modsForm += '<input id="mods_title" class="form-control" name="mods_title" type="text" value="' + title.text() + '">';
            modsForm += '</div>';

            /* TODO: TITLE element attributes here */
            //lang, xml:lang, script, transliteration
            // nonSort xml:space
        }

        if (subTitle.length !== 0) {
            modsForm += '<div class="form-group">';
            modsForm += '<label for="mods_sub_title">* Mods > TitleInfo > SUBTITLE</label>';
            modsForm += '<input id="mods_sub_title" class="form-control" name="mods_sub_title" type="text" value="' + subTitle.text() + '">';
            modsForm += '</div>';
        }

        if (partNumber.length !== 0) {
            modsForm += '<div class="form-group">';
            modsForm += '<label for="mods_part_number">* Mods > TitleInfo > PARTNUMBER</label>';
            modsForm += '<input id="mods_part_number" class="form-control" name="mods_part_number" type="text" value="' + partNumber.text() + '">';
            modsForm += '</div>';
        }

        if (partName.length !== 0) {
            modsForm += '<div class="form-group">';
            modsForm += '<label for="mods_part_name">* Mods > TitleInfo > PARTNAME</label>';
            modsForm += '<input id="mods_part_name" class="form-control" name="mods_part_name" type="text" value="' + partName.text() + '">';
            modsForm += '</div>';
        }

        if (nonSort.length !== 0) {
            modsForm += '<div class="form-group">';
            modsForm += '<label for="mods_non_sort">* Mods > TitleInfo > NONESORT</label>';
            modsForm += '<input id="mods_non_sort" class="form-control" name="mods_non_sort" type="text" value="' + nonSort.text() + '">';
            modsForm += '</div>';
        }

        modsForm += '</fieldset>';
    }

    return modsForm;
};