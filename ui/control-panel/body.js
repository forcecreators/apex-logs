const vscode = acquireVsCodeApi();
let config;

$(".pendingButton").hide();
$(".stopLoggingButton").hide();

window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
        case "config": {
            config = message.data;
            refreshUI();
            listenForFormChanges();
            console.log(config);
            break;
        }
        case "logUsage": {
            console.log("logUsage", message.data);
            const val = ((parseInt(message.data) / 1000000000) * 100).toFixed(0);
            console.log("logUsage", val);
            $(".progress-bar")
                .css("width", val + "%")
                .attr("aria-valuenow", val)
                .removeClass("progress-bar-striped")
                .removeClass("progress-bar-animated")
                .removeClass("bg-success")
                .removeClass("bg-warning")
                .removeClass("bg-danger");
            if (val < 50) {
                $(".progress-bar").addClass("bg-success");
            } else if (val >= 50 && val <= 80) {
                $(".progress-bar").addClass("bg-warning");
            } else if (val > 80) {
                $(".progress-bar").addClass("bg-danger");
            }
            break;
        }
    }
});

function listenForFormChanges() {
    $(".form-control").change(function () {
        updateConfig();
    });
}

function updateConfig() {
    config.apex = $("#apex").val();
    config.profiling = $("#profiling").val();
    config.callout = $("#callout").val();
    config.database = $("#database").val();
    config.system = $("#system").val();
    config.validation = $("#validation").val();
    config.visualforce = $("#visualforce").val();
    config.workflow = $("#workflow").val();
    config.profileConfig.apexWarn = $("#apexWarn").val();
    config.profileConfig.apexError = $("#apexError").val();
    config.profileConfig.soqlWarn = $("#soqlWarn").val();
    config.profileConfig.soqlError = $("#soqlError").val();
    config.profileConfig.dmlWarn = $("#dmlWarn").val();
    config.profileConfig.dmlError = $("#dmlError").val();
    config.profileConfig.workflowWarn = $("#workflowWarn").val();
    config.profileConfig.workflowError = $("#workflowError").val();
    vscode.postMessage({ type: "config", data: config });
}

function refreshUI() {
    $("#apex").val(config.apex);
    $("#profiling").val(config.profiling);
    $("#callout").val(config.callout);
    $("#database").val(config.database);
    $("#system").val(config.system);
    $("#validation").val(config.validation);
    $("#visualforce").val(config.visualforce);
    $("#workflow").val(config.workflow);
    $("#apexWarn").val(config.profileConfig.apexWarn);
    $("#apexError").val(config.profileConfig.apexError);
    $("#soqlWarn").val(config.profileConfig.soqlWarn);
    $("#soqlError").val(config.profileConfig.soqlError);
    $("#dmlWarn").val(config.profileConfig.dmlWarn);
    $("#dmlError").val(config.profileConfig.dmlError);
    $("#workflowWarn").val(config.profileConfig.workflowWarn);
    $("#workflowError").val(config.profileConfig.workflowError);
    if (config.endTime && new Date(config.endTime) > new Date()) {
        $(".startLoggingButton").hide();
        $(".pendingButton").hide();
        $(".stopLoggingButton").show();
    } else {
        $(".startLoggingButton").show();
        $(".pendingButton").hide();
        $(".stopLoggingButton").hide();
    }
}

function startLogging() {
    $(".startLoggingButton").hide();
    $(".pendingButton").show();
    vscode.postMessage({ type: "startLogging" });
}

function stopLogging() {
    $(".stopLoggingButton").hide();
    $(".pendingButton").show();
    vscode.postMessage({ type: "stopLogging" });
}

function changeTargetUser() {}
