﻿
document.addEventListener("load", DocumentLoaded());

//The ID's of the currently selected layouts in the selector.
var headerId, bodyId, footerId;

//Hooks up all the click events for the selectors for a different layout.
function DocumentLoaded() {
    var headerClassLookup = $(".selector-headers");
    var headerSelector = headerClassLookup[0];
    var option = headerSelector.options[headerSelector.selectedIndex];
    if (option) {
        headerId = option.value;
        headerSelector.addEventListener("click", function (event) {
            LayoutSelectorChanged({
                Type: "Header",
                ChangeID: function () {
                    var option = headerSelector.options[headerSelector.selectedIndex];
                    headerId = option.value;
                }
            });
        });
        headerClassLookup.trigger('click');
    }

    var bodyClassLookup = $(".selector-bodies");
    var bodySelector = bodyClassLookup[0];
    var option = bodySelector.options[bodySelector.selectedIndex];
    if (option) {
        bodyId = option.value;
        bodySelector.addEventListener("click", function (event) {
            LayoutSelectorChanged({
                Type: "Body",
                ChangeID: function (id) {

                    bodyId = bodySelector.options[bodySelector.selectedIndex].value;
                }
            });
        });
        bodyClassLookup.trigger('click');
    }

    var footerClassLookup = $(".selector-footers")
    var footerSelector = footerClassLookup[0];
    var option = footerSelector.options[footerSelector.selectedIndex];
    if (option) {
        footerId = option.value;
        footerSelector.addEventListener("change", function (event) {
            LayoutSelectorChanged({
                Type: "Footer",
                ChangeID: function () {
                    footerId = footerSelector.options[footerSelector.selectedIndex].value;
                }
            });
        });
        footerClassLookup.trigger('click');
    }
};


//Performs ajax request for the new layouts. Updates to the live preview area occur on received response.
function LayoutSelectorChanged(IdChanger) {
    IdChanger.ChangeID();
    //Perform ajax request for new layout
    switch (IdChanger.Type) {
        case "Header":
            $.getJSON("GetNewLayout/" + headerId).done(ReceiveNewLayout);
            break;
        case "Body":
            $.getJSON("GetNewLayout/" + bodyId).done(ReceiveNewLayout);
            break;
        case "Footer":
            $.getJSON("GetNewLayout/" + footerId).done(ReceiveNewLayout);
            break;
        default:
            return;
    }

    //Update the page creation options for a layout.
}

//Responds to json received from server when new layouts are requested.
function ReceiveNewLayout(json) {
    switch (json.Type) {
        case "Header":
            ChangeHeader(json.Content, json.CSS);
            break;
        case "Body":
            ChangeBody(json.Content, json.CSS);
            break;
        case "Footer":
            ChangeFooter(json.Content, json.CSS);
            break;
        default:
            break;
    }
}


//These Change/Header|Body|Footer/ methods update the live preview area when a click occurs on the selection control.
function ChangeHeader(content, css) {
    var headerPreview = $("#headerPreview")[0];
    if ($('#headerPreviewStyle').length != 0) { $('#headerPreviewStyle').remove(); }
    var cssStyle = document.createElement('style');
    cssStyle.setAttribute('id', 'headerPreviewStyle');
    cssStyle.setAttribute('type', 'text/css');
    for (var i = 0; i < css.length; i++) {
        cssStyle.innerText += ' #headerPreview ' + css[i];
    }
    $('head').append(cssStyle);
    var newHeader = document.createElement("div");
    newHeader.innerHTML = content;
    headerPreview.innerHTML = '';
    while (newHeader.hasChildNodes()) {
        headerPreview.appendChild(newHeader.childNodes[0]);
    }
}
function ChangeBody(content, css) {
    var bodyPreview = $("#bodyPreview")[0];
    if ($('#bodyPreviewStyle').length != 0) { $('#bodyPreviewStyle').remove(); }
    var cssStyle = document.createElement('style');
    cssStyle.setAttribute('id', 'bodyPreviewStyle');
    cssStyle.setAttribute('type', 'text/css');
    for (var i = 0; i < css.length; i++) {
        cssStyle.innerHTML += ' #bodyPreview ' + css[i];
    }
    $('head').append(cssStyle);
    var newBody = document.createElement("div");
    newBody.innerHTML = content;
    bodyPreview.innerHTML = '';
    while (newBody.hasChildNodes()) {
        bodyPreview.appendChild(newBody.childNodes[0]);
    }
}
function ChangeFooter(content, css) {
    var footerPreview = $("#footerPreview")[0];
    if ($('#footerPreviewStyle').length != 0) { $('#footerPreviewStyle').remove(); }
    var cssStyle = document.createElement('style');
    cssStyle.setAttribute('id', 'footerPreviewStyle');
    cssStyle.setAttribute('type', 'text/css');
    for (var i = 0; i < css.length; i++) {
        cssStyle.innerHTML += ' #footerPreview ' + css[i];
    }
    $('head').append(cssStyle);
    var newFooter = document.createElement("div");
    newFooter.innerHTML = content;
    footerPreview.innerHTML = '';
    while (newFooter.hasChildNodes()) {
        footerPreview.appendChild(newFooter.childNodes[0]);
    }
}

//Sends the page to the server to be saved to the database.
function SavePage() {

    //Creates header, body, and footer tags to send to the server.
    var header = document.createElement('header');
    header.innerHTML = $("#headerPreview")[0].innerHTML;
    var body = document.createElement('body');
    body.innerHTML = $("#bodyPreview")[0].innerHTML;
    var footer = document.createElement('footer');
    footer.innerHTML = $("#footerPreview")[0].innerHTML;

    //Finding the style tags of the live preview areas contents.
    var headerCssRules = $("#headerPreviewStyle");
    var bodyCssRules = $("#bodyPreviewStyle");
    var footerCssRules = $("#footerPreviewStyle");

    //An array of the style tags applying to the live preview areas contents
    var cssRulesOfPreviewAreas = [];

    //If these exist on the page they will be added to the array that is used to populate the css field of the page.
    if (headerCssRules.length > 0) { cssRulesOfPreviewAreas.push(headerCssRules[0]); }
    if (bodyCssRules.length > 0) { cssRulesOfPreviewAreas.push(bodyCssRules[0]); }
    if (footerCssRules.length > 0) { cssRulesOfPreviewAreas.push(footerCssRules[0]); }


    var cssRules = ConvertAllRulesToOneString(cssRulesOfPreviewAreas);

    //This objects fields needs to match JSONForSavingWebPage object in the models folder of server.
    var page = {
        Header: header.outerHTML,
        Body: body.outerHTML,
        Footer: footer.outerHTML,
        CSS: cssRules
        //Need ImageURLS
        //Need RouteOfPage
    }

    //Sending page to server as JSON
    $.post("SavePage", page);//Need to react to bad post (i.e. Route is already taken)
}

//Converts all the css in several style tags into one blob of css text.
function ConvertAllRulesToOneString(arrayOfStyles) {
    var cssRulesTogetherAsString = "";
    while (arrayOfStyles.length > 0) {
        var cssRulesAsArray = SeparateCSSRulesIntoArray(arrayOfStyles[0].innerText);
        for (var i = 0; i < cssRulesAsArray.length; i++) {
            cssRulesTogetherAsString += cssRulesAsArray[0].trim() + ' ';
        }
        arrayOfStyles.shift();
    }
    return cssRulesTogetherAsString;
}

//Separates out each css rule of a blob of css into an array.
function SeparateCSSRulesIntoArray(cssText) {
    var matchCssRulesRegex = /[\)\(\]\[:\w," =\-\*^#\.\@>\n\+]+\{\s*[^}{]+\s*\}/;
    return cssText.match(matchCssRulesRegex);
}


//Need function that makes the page creation option for color and sizing etc. appear with appropriate options(TBD)