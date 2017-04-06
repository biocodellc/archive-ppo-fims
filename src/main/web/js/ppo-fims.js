/* ====== General Utility Functions ======= */
var appRoot = "/";
var biocodeFimsRestRoot = "/rest/v1/";

$.ajaxSetup({
    beforeSend: function (jqxhr, config) {
        jqxhr.config = config;
        var ppoSessionStorage = JSON.parse(window.sessionStorage.ppo);
        var accessToken = ppoSessionStorage.accessToken;
        if (accessToken && config.url.indexOf("access_token") == -1) {
            if (config.url.indexOf('?') > -1) {
                config.url += "&access_token=" + accessToken;
            } else {
                config.url += "?access_token=" + accessToken;
            }
        }
    }
});

$.ajaxPrefilter(function (opts, originalOpts, jqXHR) {
    // you could pass this option in on a "retry" so that it doesn't
    // get all recursive on you.
    if (opts.refreshRequest) {
        return;
    }

    if (opts.url.indexOf('/validate') > -1) {
        return;
    }

    if (typeof(originalOpts) != "object") {
        originalOpts = opts;
    }

    // our own deferred object to handle done/fail callbacks
    var dfd = $.Deferred();

    // if the request works, return normally
    jqXHR.done(dfd.resolve);

    // if the request fails, do something else
    // yet still resolve
    jqXHR.fail(function () {
        var args = Array.prototype.slice.call(arguments);
        var ppoSessionStorage = JSON.parse(window.sessionStorage.ppo);
        var refreshToken = ppoSessionStorage.refreshToken;
        if ((jqXHR.status === 401 || (jqXHR.status === 400 && jqXHR.responseJSON.usrMessage == "invalid_grant"))
            && !isTokenExpired() && refreshToken) {
            $.ajax({
                url: biocodeFimsRestRoot + 'authenticationService/oauth/refresh',
                method: 'POST',
                refreshRequest: true,
                data: $.param({
                    client_id: client_id,
                    refresh_token: refreshToken
                }),
                error: function () {
                    window.sessionStorage.ppo = JSON.stringify({});

                    // reject with the original 401 data
                    dfd.rejectWith(jqXHR, args);

                    if (!window.location.pathname == appRoot)
                        window.location = appRoot + "login";
                },
                success: function (data) {
                    var ppoSessionStorage = {
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token,
                        oAuthTimestamp: new Date().getTime()
                    };

                    window.sessionStorage.ppo = JSON.stringify(ppoSessionStorage);

                    // retry with a copied originalOpts with refreshRequest.
                    var newOpts = $.extend({}, originalOpts, {
                        refreshRequest: true,
                        url: originalOpts.url.replace(/access_token=.{20}/, "access_token=" + data.access_token)
                    });
                    // pass this one on to our deferred pass or fail.
                    $.ajax(newOpts).then(dfd.resolve, dfd.reject);
                }
            });

        } else {
            dfd.rejectWith(jqXHR, args);
        }
    });

    // NOW override the jqXHR's promise functions with our deferred
    return dfd.promise(jqXHR);
});

function isTokenExpired() {
    var ppoSessionStorage = JSON.parse(window.sessionStorage.ppo);
    var oAuthTimestamp = ppoSessionStorage.oAuthTimestamp;
    var now = new Date().getTime();

    if (now - oAuthTimestamp > 1000 * 60 * 60 * 4)
        return true;

    return false;
}

// function for displaying a loading dialog while waiting for a response from the server
function loadingDialog(promise) {
    var dialogContainer = $("#dialogContainer");
    var msg = "Loading ...";
    dialog(msg, "", null);

    // close the dialog when the ajax call has returned only if the html is the same
    promise.always(function () {
        if (dialogContainer.html() == msg) {
            dialogContainer.dialog("close");
        }
    });
}

// function to retrieve a user's projects and populate the page
function listProjects(username, url, expedition) {
    var jqxhr = $.getJSON(url
    ).done(function (data) {
        if (!expedition) {
            var html = '<h1>Project Manager (' + username + ')</h2>\n';
        } else {
            var html = '<h1>Expedition Manager (' + username + ')</h2>\n';
        }
        var expandTemplate = '<br>\n<a class="expand-content" id="{project}-{section}" href="javascript:void(0);">\n'
            + '\t <img src="' + appRoot + 'images/right-arrow.png" id="arrow" class="img-arrow">{text}'
            + '</a>\n';
        $.each(data, function (index, element) {
            key = element.projectId;
            val = element.projectTitle;
            var project = val.replace(new RegExp('[#. ()]', 'g'), '_') + '_' + key;

            html += expandTemplate.replace('{text}', element.projectTitle).replace('-{section}', '');
            html += '<div id="{project}" class="toggle-content">';
            if (!expedition) {
                html += expandTemplate.replace('{text}', 'Project Metadata').replace('{section}', 'metadata').replace('<br>\n', '');
                html += '<div id="{project}-metadata" class="toggle-content">Loading Project Metadata...</div>';
                html += expandTemplate.replace('{text}', 'Project Expeditions').replace('{section}', 'expeditions');
                html += '<div id="{project}-expeditions" class="toggle-content">Loading Project Expeditions...</div>';
                html += expandTemplate.replace('{text}', 'Project Users').replace('{section}', 'users');
                html += '<div id="{project}-users" class="toggle-content">Loading Project Users...</div>';
            } else {
                html += 'Loading...';
            }
            html += '</div>\n';

            // add current project to element id
            html = html.replace(new RegExp('{project}', 'g'), project);
        });
        if (html.indexOf("expand-content") == -1) {
            if (!expedition) {
                html += 'You are not an admin for any project.';
            } else {
                html += 'You do not belong to any projects.'
            }
        }
        $(".sectioncontent").html(html);

        // store project id with element, so we don't have to retrieve project id later with an ajax call
        $.each(data, function (index, element) {
            key = element.projectId;
            val = element.projectTitle;
            var project = val.replace(new RegExp('[#. ()]', 'g'), '_') + '_' + key;

            if (!expedition) {
                $('div#' + project + '-metadata').data('projectId', key);
                $('div#' + project + '-users').data('projectId', key);
                $('div#' + project + '-expeditions').data('projectId', key);
            } else {
                $('div#' + project).data('projectId', key);
            }
        });
    }).fail(function (jqxhr) {
        $(".sectioncontent").html(jqxhr.responseText);
    });
    return jqxhr;

}

function getQueryParam(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            if (sParam == "return_to") {
                // if we want the return_to query param, we need to return everything after "return_to="
                // this is assuming that "return_to" is the last query param, which it should be
                return decodeURIComponent(sPageURL.slice(sPageURL.indexOf(sParameterName[1])));
            } else {
                return decodeURIComponent(sParameterName[1]);
            }
        }
    }
}

// Populate Div element from a REST service with HTML
function populateDivFromService(url, elementID, failMessage) {
    if (elementID.indexOf('#') == -1) {
        elementID = '#' + elementID
    }
    return jqxhr = $.ajax(url, function () {
    })
        .done(function (data) {
            $(elementID).html(data);
        })
        .fail(function () {
            $(elementID).html(failMessage);
        });
}

function populateProjects() {
    theUrl = biocodeFimsRestRoot + "projects?includePublic=true";
    var jqxhr = $.getJSON(theUrl, function (data) {
        var listItems = "";
        listItems += "<option value='0'>Select a project ...</option>";
        $.each(data, function (index, project) {
            listItems += "<option value='" + project.projectId + "'>" + project.projectTitle + "</option>";
        });
        $("#projects").html(listItems);
        // Set to the first value in the list which should be "select one..."
        $("#projects").val($("#projects option:first").val());

    }).fail(function (jqXHR, textStatus) {
        if (textStatus == "timeout") {
            showMessage("Timed out waiting for response! Try again later or reduce the number of graphs you are querying. If the problem persists, contact the System Administrator.");
        } else {
            showMessage("Error completing request!");
        }
    });
    return jqxhr;
}

function failError(jqxhr) {
    var buttons = {
        "OK": function () {
            $("#dialogContainer").removeClass("error");
            $(this).dialog("close");
        }
    }
    $("#dialogContainer").addClass("error");

    var message;
    if (jqxhr.responseJSON) {
        message = jqxhr.responseJSON.usrMessage;
    } else {
        message = "Server Error!";
    }
    dialog(message, "Error", buttons);
}

// function to open a new or update an already open jquery ui dialog box
function dialog(msg, title, buttons) {
    var dialogContainer = $("#dialogContainer");
    if (dialogContainer.html() != msg) {
        dialogContainer.html(msg);
    }

    if (!$(".ui-dialog").is(":visible") || (dialogContainer.dialog("option", "title") != title ||
        dialogContainer.dialog("option", "buttons") != buttons)) {
        dialogContainer.dialog({
            modal: true,
            autoOpen: true,
            title: title,
            resizable: false,
            width: 'auto',
            draggable: false,
            buttons: buttons,
            position: {my: "center top", at: "top", of: window}
        });
    }

    return;
}

// A short message
function showMessage(message) {
    $('#alerts').append(
        '<div class="fims-alert alert-dismissable">' +
        '<button type="button" class="close" data-dismiss="alert">' +
        '&times;</button>' + message + '</div>');
}

// A big message
function showBigMessage(message) {
    $('#alerts').append(
        '<div class="fims-alert" style="height:400px">' +
        '<button type="button" class="close" data-dismiss="alert">' +
        '&times;</button>' + message + '</div>');
}

// Get the projectID
function getProjectID() {
    var e = document.getElementById('projects');
    return e.options[e.selectedIndex].value;
}

/* ====== expeditions.html Functions ======= */

// function to populate the expeditions.html page
function populateExpeditionPage(username) {
    var jqxhr = listProjects(username, biocodeFimsRestRoot + 'projects/user/list', true
    ).done(function () {
        // attach toggle function to each project
        $(".expand-content").click(function () {
            loadExpeditions(this.id)
        });
    }).fail(function (jqxhr) {
        $("#sectioncontent").html(jqxhr.responseText);
    });
}

// function to load the expeditions.html subsections
function loadExpeditions(id) {
    if ($('.toggle-content#' + id).is(':hidden')) {
        $('.img-arrow', '#' + id).attr("src", appRoot + "images/down-arrow.png");
    } else {
        $('.img-arrow', '#' + id).attr("src", appRoot + "images/right-arrow.png");
    }
    // check if we've loaded this section, if not, load from service
    var divId = 'div#' + id
    if ((id.indexOf("resources") != -1 || id.indexOf("datasets") != -1 || id.indexOf("configuration") != -1) &&
        ($(divId).children().length == 0)) {
        populateExpeditionSubsections(divId);
    } else if ($(divId).children().length == 0) {
        listExpeditions(divId);
    }
    $('.toggle-content#' + id).slideToggle('slow');
}

// retrieve the expeditions for a project and display them on the page
function listExpeditions(divId) {
    var projectId = $(divId).data('projectId');
    var jqxhr = $.getJSON(biocodeFimsRestRoot + 'projects/' + projectId + '/expeditions/')
        .done(function (data) {
            var html = '';
            var expandTemplate = '<br>\n<a class="expand-content" id="{expedition}-{section}" href="javascript:void(0);">\n'
                + '\t <img src="' + appRoot + 'images/right-arrow.png" id="arrow" class="img-arrow">{text}'
                + '</a>\n';
            $.each(data, function (index, e) {
                var expedition = e.expeditionTitle.replace(new RegExp('[#. ():]', 'g'), '_') + '_' + e.expeditionId;
                // html id's must start with a letter
                while (!expedition.match(/^[a-zA-Z](.)*$/)) {
                    expedition = expedition.substring(1);
                }

                html += expandTemplate.replace('{text}', e.expeditionTitle).replace('-{section}', '');
                html += '<div id="{expedition}" class="toggle-content">';
                html += expandTemplate.replace('{text}', 'Expedition Metadata').replace('{section}', 'configuration').replace('<br>\n', '');
                html += '<div id="{expedition}-configuration" class="toggle-content">Loading Expedition Metadata...</div>';
                html += expandTemplate.replace('{text}', 'Expedition Resources').replace('{section}', 'resources');
                html += '<div id="{expedition}-resources" class="toggle-content">Loading Expedition Resources...</div>';
                html += expandTemplate.replace('{text}', 'Datasets associated with this expedition').replace('{section}', 'datasets');
                html += '<div id="{expedition}-datasets" class="toggle-content">Loading Datasets associated wih this expedition...</div>';
                html += '</div>\n';

                // add current project to element id
                html = html.replace(new RegExp('{expedition}', 'g'), expedition);
            });
            html = html.replace('<br>\n', '');
            if (html.indexOf("expand-content") == -1) {
                html += 'You have no datasets in this project.';
            }
            $(divId).html(html);
            $.each(data, function (index, e) {
                var expedition = e.expeditionTitle.replace(new RegExp('[#. ():]', 'g'), '_') + '_' + e.expeditionId;
                while (!expedition.match(/^[a-zA-Z](.)*$/)) {
                    expedition = expedition.substring(1);
                }

                $('div#' + expedition + '-configuration').data('expeditionId', e.expeditionId);
                $('div#' + expedition + '-resources').data('expeditionId', e.expeditionId);
                $('div#' + expedition + '-datasets').data('expeditionId', e.expeditionId);
            });

            // remove previous click event and attach toggle function to each project
            $(".expand-content").off("click");
            $(".expand-content").click(function () {
                loadExpeditions(this.id);
            });
        }).fail(function (jqxhr) {
            $(divId).html(jqxhr.responseText);
        });
}

// function to populate the expedition resources, datasets, or configuration subsection of expeditions.html
function populateExpeditionSubsections(divId) {
    // load config table from REST service
    var expeditionId = $(divId).data('expeditionId');
    if (divId.indexOf("resources") != -1) {
        var jqxhr = populateDivFromService(
            biocodeFimsRestRoot + 'expeditions/' + expeditionId + '/resourcesAsTable/',
            divId,
            'Unable to load this expedition\'s resources from server.');
    } else if (divId.indexOf("datasets") != -1) {
        var jqxhr = populateDivFromService(
            biocodeFimsRestRoot + 'expeditions/' + expeditionId + '/datasetsAsTable/',
            divId,
            'Unable to load this expedition\'s datasets from server.');
    } else {
        var jqxhr = populateDivFromService(
            biocodeFimsRestRoot + 'expeditions/' + expeditionId + '/metadataAsTable/',
            divId,
            'Unable to load this expedition\'s configuration from server.');
    }
}

// function to edit an expedition
function editExpedition(projectId, expeditionCode, e) {
    var currentPublic;
    var searchId = $(e).closest("div")[0].id.replace("-configuration", "");
    var title = "Editing " + $("a#" + searchId)[0].textContent.trim();

    currentPublic = !!e.parentElement.textContent.startsWith("yes");

    var message = "<table><tr><td>Public:</td><td><input type='checkbox' name='public'";
    if (currentPublic) {
        message += " checked='checked'";
    }
    message += "></td></tr></table>";

    var buttons = {
        "Update": function () {
            var isPublic = $("[name='public']")[0].checked;

            $.get(biocodeFimsRestRoot + "expeditions/updateStatus/" + projectId + "/" + expeditionCode + "/" + isPublic)
                .done(function () {
                    var b = {
                        "Ok": function () {
                            $(this).dialog("close");
                            location.reload();
                        }
                    };
                    dialog("Successfully updated the public status.", "Success!", b);
                }).fail(function (jqXHR) {
                $("#dialogContainer").addClass("error");
                var b = {
                    "Ok": function () {
                        $("#dialogContainer").removeClass("error");
                        $(this).dialog("close");
                    }
                };
                dialog("Error updating expedition's public status!<br><br>" + JSON.stringify($.parseJSON(jqxhr.responseText).usrMessage), "Error!", buttons)
            });
        },
        "Cancel": function () {
            $(this).dialog("close");
        }
    };
    dialog(message, title, buttons);
}
/* ====== profile.jsp Functions ======= */

// function to submit the user's profile editor form
function profileSubmit(divId) {
    if ($("input.pwcheck", divId).val().length > 0 && $(".label", "#pwindicator").text() == "weak") {
        $(".error", divId).html("password too weak");
    } else if ($("input[name='newPassword']").val().length > 0 &&
        ($("input[name='oldPassword']").length > 0 && $("input[name='oldPassword']").val().length == 0)) {
        $(".error", divId).html("Old Password field required to change your Password");
    } else {
        var postURL = biocodeFimsRestRoot + "users/profile/update/";
        var return_to = getQueryParam("return_to");
        if (return_to != null) {
            postURL += "?return_to=" + encodeURIComponent(return_to);
        }
        var jqxhr = $.post(postURL, $("form", divId).serialize(), 'json'
        ).done(function (data) {
            // if adminAccess == true, an admin updated the user's password, so no need to redirect
            if (data.adminAccess == true) {
                populateProjectSubsections(divId);
            } else {
                if (data.returnTo) {
                    $(location).attr("href", data.returnTo);
                } else {
                    var jqxhr2 = populateDivFromService(
                        biocodeFimsRestRoot + "users/profile/listAsTable",
                        "listUserProfile",
                        "Unable to load this user's profile from the Server")
                        .done(function () {
                            $("a", "#profile").click(function () {
                                getProfileEditor();
                            });
                        });
                }
            }
        }).fail(function (jqxhr) {
            var json = $.parseJSON(jqxhr.responseText);
            $(".error", divId).html(json.usrMessage);
        });
    }
}

// get profile editor
function getProfileEditor(username) {
    var jqxhr = populateDivFromService(
        biocodeFimsRestRoot + "users/profile/listEditorAsTable",
        "listUserProfile",
        "Unable to load this user's profile editor from the Server"
    ).done(function () {
        $(".error").text(getQueryParam("error"));
        $("#cancelButton").click(function () {
            var jqxhr2 = populateDivFromService(
                biocodeFimsRestRoot + "users/profile/listAsTable",
                "listUserProfile",
                "Unable to load this user's profile from the Server")
                .done(function () {
                    $("a", "#profile").click(function () {
                        getProfileEditor();
                    });
                });
        });
        $("#profile_submit").click(function () {
            profileSubmit('div#listUserProfile');
        });
    });
}

/* ====== query.html Functions ======= */

// handle displaying messages/results in the graphs(spreadsheets) select list
function graphsMessage(message) {
    $('#graphs').empty();
    $('#graphs').append('<option data-qrepeat="g data" data-qattr="value g.graph; text g.expeditionTitle"></option>');
    $('#graphs').find('option').first().text(message);
}

// Get the graphs for a given projectId
function populateGraphs(projectId) {
    $("#resultsContainer").hide();
    // Don't let this progress if this is the first option, then reset graphs message
    if ($("#projects").val() == 0) {
        graphsMessage('Choose an project to see loaded spreadsheets');
        return;
    }
    theUrl = biocodeFimsRestRoot + "projects/" + projectId + "/graphs";
    var jqxhr = $.getJSON(theUrl, function (data) {
        // Check for empty object in response
        if (data.length == 0) {
            graphsMessage('No datasets found for this project');
        } else {
            var listItems = "";
            $.each(data, function (index, graph) {
                listItems += "<option value='" + graph.graph + "'>" + graph.expeditionTitle + "</option>";
            });
            $("#graphs").html(listItems);
        }
    }).fail(function (jqXHR, textStatus) {
        if (textStatus == "timeout") {
            showMessage("Timed out waiting for response! Try again later or reduce the number of graphs you are querying. If the problem persists, contact the System Administrator.");
        } else {
            showMessage("Error completing request!");
        }
    });
}

// Get the query graph URIs
function getGraphURIs() {
    var graphs = [];
    $("select#graphs option:selected").each(function () {
        graphs.push($(this).val());
    });
    return graphs;
}

// Get results as Excel
function queryExcel(params) {
    showMessage("Downloading results as an Excel document<br>this will appear in your browsers download folder.");
    download(biocodeFimsRestRoot + "projects/query/excel/", params);
}

// Get results as Excel
function queryKml(params) {
    showMessage("Downloading results as an KML document<br>If Google Earth does not open you can point to it directly");
    download(biocodeFimsRestRoot + "projects/query/kml/", params);
}

// create a form and then submit that form in order to download files
function download(url, data) {
    //url and data options are required
    if (url && data) {
        var form = $('<form />', {action: url, method: 'POST'});
        $.each(data, function (key, value) {
            // if the value is an array, we need to create an input element for each value
            if (value instanceof Array) {
                $.each(value, function (i, v) {
                    var input = $('<input />', {
                        type: 'hidden',
                        name: key,
                        value: v
                    }).appendTo(form);
                });
            } else {
                var input = $('<input />', {
                    type: 'hidden',
                    name: key,
                    value: value
                }).appendTo(form);
            }
        });

        return form.appendTo('body').submit().remove();
    }
    throw new Error("url and data required");
}

// a select element with all of the filterable options. Used to add additional filter statements
var filterSelect = null;

// populate a select with the filter values of a given project
function getFilterOptions(projectId) {
    var jqxhr = $.getJSON(biocodeFimsRestRoot + "projects/" + projectId + "/filterOptions/")
        .done(function (data) {
            filterSelect = "<select id='uri' style='max-width:100px;'>";
            $.each(data, function (k, v) {
                filterSelect += "<option value=" + v.uri + ">" + v.column + "</option>";
            });

            filterSelect += "</select>";
        });
    return jqxhr;
}

// add additional filters to the query
function addFilter() {
    // change the method to post
    $("form").attr("method", "POST");

    var tr = "<tr>\n<td align='right'>AND</td>\n<td>\n";
    tr += filterSelect;
    tr += "<p style='display:inline;'>=</p>\n";
    tr += "<input type='text' name='filter_value' style='width:285px;' />\n";
    tr += "</td>\n";

    // insert another tr after the last filter option, before the submit buttons
    $("#uri").parent().parent().siblings(":last").before(tr);
}

// prepare a json object with the query POST params by combining the text and select inputs for each filter statement
function getQueryPostParams() {
    var params = {
        graphs: getGraphURIs(),
        project_id: getProjectID()
    }

    var filterKeys = $("select[id=uri]");
    var filterValues = $("input[name=filter_value]");

    // parse the filter keys and values and add them to the post params
    $.each(filterKeys, function (index, e) {
        if (filterValues[index].value != "") {
            params[e.value] = filterValues[index].value;
        }
    });

    return params;
}
