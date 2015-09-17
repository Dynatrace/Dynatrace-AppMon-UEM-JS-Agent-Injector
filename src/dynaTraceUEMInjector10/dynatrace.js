//IF SWITCH ISN'T SET, SET THE SWITCH TO 0
chrome.storage.local.get('dynaTraceUEMSwitch', function(result) {
    if (result.dynaTraceUEMSwitch == null) {
        chrome.storage.local.set({
            'dynaTraceUEMSwitch': 0
        });
    };
});

//IF SWITCH IS SET, INJECT THE UEM JS AGENT
chrome.storage.local.get('dynaTraceUEMSwitch', function(result) {
    if (result.dynaTraceUEMSwitch == 1) {

        //CREATE ELEMENT
        var dynaTrace = document.createElement("script");
        dynaTrace.setAttribute("type", "text/javascript");

        //AGENT LOCATION VALUE
        chrome.storage.local.get('agentLocation', function(result) {
            dynaTrace.setAttribute("src", result.agentLocation);
        });

        //DATA-DTCONFIG VALUE
        chrome.storage.local.get('dtConfig', function(result) {
            dynaTrace.setAttribute("data-dtconfig", result.dtConfig);
        });

        //APPEND ELEMENT
        document.head.appendChild(dynaTrace);

    };
});

//ON MESSAGE, TAG VISIT
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        chrome.storage.local.get('visitTag', function(result) {
            var elem = document.createElement("script");
            elem.type = "text/javascript";
            elem.innerHTML = 'dT_.rs("dt_visittag", "' + result.visitTag + '");';
            document.head.appendChild(elem);
        });

        chrome.storage.local.set({
            'visitTag': null
        });
    });