//TOGGLE THE INJECTION SWITCH
function toggleSwitch() {

    //SET VARIABLE FROM TEXTBOXES
    var agentLocation = document.getElementById("agentLocation").value;
    var dataDtConfig = document.getElementById("dataDtConfig").value;

    //CHECK THE VALUE OF THE SWITCH
    chrome.storage.local.get('dynaTraceUEMSwitch', function(result) {
        //IF SWITCH IS NOT SET OR OFF
        if (result.dynaTraceUEMSwitch == 0 || result.dynaTraceUEMSwitch == null) {

            //SET SWITCH ON
            chrome.storage.local.set({
                'dynaTraceUEMSwitch': 1
            });

            //SET AGENT LOCATION VALUE FROM VARIABLE
            chrome.storage.local.set({
                'agentLocation': agentLocation
            });

            //SET DATA-DTCONFIG VALUE FROM VARIABLE
            chrome.storage.local.set({
                'dtConfig': dataDtConfig
            });

            //CHANGE STATUS MESSAGE
            document.getElementById("status").innerHTML = "Injection On";
            document.getElementById("status").style.color = "green";
        }

        //IF SWITCH IS ON
        else {
            //SET SWITCH OFF
            chrome.storage.local.set({
                'dynaTraceUEMSwitch': 0
            });

            //CHANGE STATUS MESSAGE
            document.getElementById("status").innerHTML = "Injection Off";
            document.getElementById("status").style.color = "red";

        }
    });
}

//SET STATUS
chrome.storage.local.get('dynaTraceUEMSwitch', function(result) {
    //IF SWITCH IS NOT SET OR OFF
    if (result.dynaTraceUEMSwitch == 0 || result.dynaTraceUEMSwitch == null) {
        //CHANGE STATUS MESSAGE
        document.getElementById("status").innerHTML = "Injection Off";
        document.getElementById("status").style.color = "red";
    }
    //IF SWITCH IS ON
    else {
        //CHANGE STATUS MESSAGE
        document.getElementById("status").innerHTML = "Injection On";
        document.getElementById("status").style.color = "green";
    }
});

//UPDATE TEXTBOX
function setTextBoxDefaults() {
    chrome.storage.local.get('agentLocation', function(result) {
        if (result.agentLocation == null) {
            document.getElementById("agentLocation").value = "Not Set";
            document.getElementById("agentLocationForm").value = "Not Set";
        } else {
            document.getElementById("agentLocation").value = result.agentLocation;
            document.getElementById("agentLocationForm").value = result.agentLocation;
        }
    });

    chrome.storage.local.get('dtConfig', function(result) {
        if (result.dtConfig == null) {
            document.getElementById("dataDtConfig").value = "Not Set";
            document.getElementById("dataDtConfigForm").value = "Not Set";
        } else {
            document.getElementById("dataDtConfig").value = result.dtConfig;
            document.getElementById("dataDtConfigForm").value = result.dtConfig;
        }
    });
}

//ADD ONCLICK LISTENERS
document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('agentLocationForm');
    toggleButton.addEventListener('click', function() {
        document.getElementById("agentLocationForm").select();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('dataDtConfigForm');
    toggleButton.addEventListener('click', function() {
        document.getElementById("dataDtConfigForm").select();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('fullDtConfig');
    toggleButton.addEventListener('click', function() {
        document.getElementById("fullDtConfig").select();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('htmlHostname');
    toggleButton.addEventListener('click', function() {
        document.getElementById("htmlHostname").select();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('bootstrapHostname');
    toggleButton.addEventListener('click', function() {
        document.getElementById("bootstrapHostname").select();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('bootstrapApplication');
    toggleButton.addEventListener('click', function() {
        document.getElementById("bootstrapApplication").select();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('visitTag');
    toggleButton.addEventListener('click', function() {
        document.getElementById("visitTag").select();
    });
});

//ON CLICK OF TOGGLE BUTTON
document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('toggle');
    toggleButton.addEventListener('click', function() {
        toggleSwitch();
    });
});

//ON CLICK OF TAG VISIT BUTTON
document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('tagVisit');
    toggleButton.addEventListener('click', function() {
        var visitTag = document.getElementById('visitTag').value;
        chrome.storage.local.set({
            'visitTag': visitTag
        });

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                tagVisit: true
            }, function(response) {

            });
        });
    });
});

//CONFIGURE MANUALLY
document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('saveManually');
    toggleButton.addEventListener('click', function() {
        var dataDtConfigForm = document.getElementById("dataDtConfigForm").value;
        chrome.storage.local.set({
            'dtConfig': dataDtConfigForm
        });

        var agentLocationForm = document.getElementById("agentLocationForm").value;
        chrome.storage.local.set({
            'agentLocation': agentLocationForm
        });

        setTextBoxDefaults();

        $("#accordion").accordion("option", "active", 0);
    });
});

//CONFIGURE BY HTML TAG
document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('saveFullDtConfig');
    toggleButton.addEventListener('click', function() {
        var dataDtConfig = document.getElementById("fullDtConfig").value;

        parser = new DOMParser();
        xmlDoc = parser.parseFromString(dataDtConfig, "text/xml");

        var dataDtConfigForm = xmlDoc.children[0].attributes.getNamedItem('data-dtconfig').value;
        var agentLocationForm = $('input[name=htmlProtocol]:checked').val() + "://" + document.getElementById("htmlHostname").value + xmlDoc.children[0].attributes.getNamedItem('src').value;

        chrome.storage.local.set({
            'dtConfig': dataDtConfigForm
        });

        chrome.storage.local.set({
            'agentLocation': agentLocationForm
        });

        setTextBoxDefaults();

        $("#accordion").accordion("option", "active", 0);
    });
});

//CONFIGURE BY AUTOMATIC DETECTION
document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('saveBootstrap');
    toggleButton.addEventListener('click', function() {
        var protocol = $('input[name=bootstrapProtocol]:checked').val();
        var host = document.getElementById('bootstrapHostname').value;
		var applicationName = document.getElementById('bootstrapApplication').value;
		
        var url = protocol + "://" + host + "/" + "/dynaTraceMonitor?app=" + applicationName;

        console.log(url);

        console.log("Step 1");

        var agentLocation = protocol + "://" + host + "/";

        var dataConfig = null;

        var xhr = new XMLHttpRequest();

        xhr.open("GET", url, false);
        xhr.send();

        var result = xhr.responseText;

        var configText = result;

        configText = configText.split("|");

        if (configText[1].indexOf("name=") > -1) {
            agentLocation = agentLocation + configText[1].split("=")[1];
            console.log(agentLocation);
        } else {
            console.log("Not set properly");
            return false;
        }

        console.log("Step 2");

        if (configText[4].indexOf("version=") > -1) {
            agentLocation = agentLocation + configText[4].split("=")[1];
            console.log(agentLocation);
        } else {
            console.log("Not set properly");
            return false;
        }

        console.log("Step 3");

        agentLocation = agentLocation + "_";

        if (configText[3].indexOf("featureHash=") > -1) {
            if (configText[3].split("=")[1] != "") {
                agentLocation = agentLocation + configText[3].split("=")[1];
                console.log(agentLocation);
                agentLocation = agentLocation + "_";
            } else {
                console.log("No features enabled for UEM agent");
            }
        } else {
            console.log("Not set properly");
            return false;
        }

        console.log("Step 4");

        if (configText[5].indexOf("buildNumber=") > -1) {
            agentLocation = agentLocation + configText[5].split("=")[1];
            console.log(agentLocation);
        } else {
            console.log("Not set properly");
            return false;
        }

        console.log("Step 5");

        agentLocation = agentLocation + ".js";

        console.log(agentLocation);

        console.log("Step 6");

        if (configText[2].indexOf("config=") > -1) {
            dataConfig = decodeURIComponent(configText[2].split("=")[1]);
            console.log(dataConfig);
        } else {
            console.log("Not set properly");
            return false;
        }

        chrome.storage.local.set({
            'dtConfig': dataConfig
        });

        chrome.storage.local.set({
            'agentLocation': agentLocation
        });


        /* FOR DEBUGGING ONLY
		//CREATE ELEMENT
        var dynaTrace = document.createElement('script');
        dynaTrace.setAttribute('type', 'text/javascript');

        //AGENT LOCATION VALUE
        dynaTrace.setAttribute('src', agentLocation);

        //DATA-DTCONFIG VALUE
        dynaTrace.setAttribute('data-dtconfig', dataConfig);
		
		//LOG TAG
		console.log(dynaTrace.outerHTML);
		
		console.log(dynaTrace.outerHTML.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;"));
		*/

        setTextBoxDefaults();

        $("#accordion").accordion("option", "active", 0);

    });
});

//SET UI
$(document).ready(function() {
    $("#accordion").accordion({
        collapsible: true,
        heightStyle: "content"
    });

    $(".button").button();
    $("#htmlProtocolSet").buttonset();
    $("#bootstrapProtocolSet").buttonset();

    setTextBoxDefaults();
});