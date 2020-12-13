let profile;
let executionStackTimeline;
let executedUnitsTimeline;
let limitsSoqlGraph;
let limitsSoqlRowsGraph;
let limitsAggsGraph;
let limitsDmlGraph;
let limitsDmlRowsGraph;
let limitsQueueablesGraph;
let limitsFutureGraph;
let limitsMaxAsyncGraph;
let limitsFieldDescribeGraph;
let limitsRecordTypeDescribeGraph;

let currentTab;

const timelineOptions = {
    horizontalScroll: false,
    zoomKey: "ctrlKey",
    orientation: "both",
    showMajorLabels: false,
    showMinorLabels: false,
};

window.addEventListener("message", (event) => {
    switch (event.data.type) {
        case "update":
            $(document).ready(function () {
                console.log("loaded frame");
                const cm = CodeMirror(document.getElementById("file-editor"), {
                    lineNumbers: true,
                    tabSize: 2,
                    value: event.data.value,
                });
                cm.setSize("100%", $(".main").height());
            });
            return;
        case "profile":
            $(document).ready(function () {
                $(".rendering").fadeOut();
                profile = event.data.value;
                if (currentTab) renderTab(currentTab);
            });
            return;
    }
});

$("#nav-tab a").on("click", function (e) {
    e.preventDefault();
    currentTab = $(this).attr("id");
    if (profile) renderTab(currentTab);
});

function renderTab(tabName) {
    switch (tabName) {
        case "execution-tree-tab":
            if (typeof executionStackTimeline === "undefined") renderExecutionTree();
            break;
        case "executed-units-tab":
            if (typeof executedUnitsTimeline === "undefined") renderExecutedUnits();
            break;
        case "limits-soql-tab":
            console.log("limits tabs");
            if (typeof limitsSoqlGraph === "undefined") renderSoqlLimits();
            break;
        case "limits-soql-rows-tab":
            if (typeof limitsSoqlRowsGraph === "undefined") renderSoqlRowsLimits();
            break;
        case "limits-dml-tab":
            if (typeof limitsDmlGraph === "undefined") renderDmlLimits();
            break;
        case "limits-dml-rows-tab":
            if (typeof limitsDmlRowsGraph === "undefined") renderDmlRowsLimits();
            break;
        case "limits-aggs-tab":
            if (typeof limitsAggsGraph === "undefined") renderAggsLimits();
            break;
        case "limits-queueables-tab":
            if (typeof limitsQueueablesGraph === "undefined") renderQueueablesLimits();
            break;
        case "limits-future-tab":
            if (typeof limitsFutureGraph === "undefined") renderFutureLimits();
            break;
        case "limits-max-async-tab":
            if (typeof limitsMaxAsyncGraph === "undefined") renderMaxAsyncLimits();
            break;
        case "limits-field-describe-tab":
            if (typeof limitsFieldDescribeGraph === "undefined") renderFieldDescribeLimits();
            break;
        case "limits-record-type-describe-tab":
            if (typeof limitsRecordTypeDescribeGraph === "undefined")
                renderRecordTypeDescribeLimits();
            break;
        default:
        // code block
    }
}

function getGraphOptions(limit) {
    return {
        sort: false,
        showMajorLabels: false,
        height: $(".main").height() + "px",
        dataAxis: {
            left: {
                range: {
                    max: profile.limits[limit].max,
                },
            },
        },
    };
}

function updateChartOnResize(chart) {
    $(window).on("resize", function () {
        chart.setOptions({
            // width: (window.innerWidth - 100) + "px",
            height: $(".main").height() + "px",
        });
    });
}

function renderExecutionTree() {
    $("#execution-tree").append('<div id="execution-tree-container"></div>');
    startTime = new Date().getTime();

    const groups = profile.executionTree.groups;
    const items = profile.executionTree.items;
    let startDay = moment().startOf("month").startOf("week").isoWeekday(1);
    var container = document.getElementById("execution-tree-container");
    setTimeout(function () {
        executionStackTimeline = new vis.Timeline(
            container,
            new vis.DataSet(items),
            new vis.DataSet(groups),
            timelineOptions
        );
        executionStackTimeline.fit();
    }, 0);
}

function renderExecutedUnits() {
    $("#executed-units").append('<div id="executed-units-container"></div>');
    startTime = new Date().getTime();

    const groups = profile.executedUnits.groups;
    const items = profile.executedUnits.items;
    let startDay = moment().startOf("month").startOf("week").isoWeekday(1);
    var container = document.getElementById("executed-units-container");
    setTimeout(function () {
        executedUnitsTimeline = new vis.Timeline(
            container,
            new vis.DataSet(items),
            new vis.DataSet(groups),
            timelineOptions
        );
        executedUnitsTimeline.fit();
        executedUnitsTimeline.setOptions({
            stack: false,
        });
    }, 0);
}

function renderSoqlLimits() {
    if (!profile.limits["SOQL"]) {
        $("#limits-soql").append(
            '<h3 class="no-data">No data is available to render this chart, check your logging levels</h3>'
        );
        limitsSoqlGraph = null;
        return;
    }
    $("#limits-soql").append('<div id="limits-soql-container"></div>');
    var container = document.getElementById("limits-soql-container");
    var items = profile.limits["SOQL"].items;
    var dataset = new vis.DataSet(items);
    var options = getGraphOptions("SOQL");
    setTimeout(function () {
        limitsSoqlGraph = new vis.Graph2d(container, dataset, options);
        limitsSoqlGraph.fit();
        updateChartOnResize(limitsSoqlGraph);
    }, 0);
}

function renderSoqlRowsLimits() {
    if (!profile.limits["SOQL_ROWS"]) {
        $("#limits-soql-rows").append(
            '<h3 class="no-data">No data is available to render this chart, check your logging levels</h3>'
        );
        limitsSoqlRowsGraph = null;
        return;
    }
    $("#limits-soql-rows").append('<div id="limits-soql-rows-container"></div>');
    var container = document.getElementById("limits-soql-rows-container");
    var items = profile.limits["SOQL_ROWS"].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions("SOQL_ROWS");
    setTimeout(function () {
        limitsSoqlRowsGraph = new vis.Graph2d(container, dataset, options);
        limitsSoqlRowsGraph.fit();
    }, 0);
}

function renderDmlLimits() {
    if (!profile.limits["DML"]) {
        $("#limits-dml").append(
            '<h3 class="no-data">No data is available to render this chart, check your logging levels</h3>'
        );
        limitsDmlGraph = null;
        return;
    }
    $("#limits-dml").append('<div id="limits-dml-container"></div>');
    var container = document.getElementById("limits-dml-container");
    var items = profile.limits["DML"].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions("DML");
    setTimeout(function () {
        limitsDmlGraph = new vis.Graph2d(container, dataset, options);
        limitsDmlGraph.fit();
    }, 0);
}

function renderDmlRowsLimits() {
    if (!profile.limits["DML_ROWS"]) {
        $("#limits-dml-rows").append(
            '<h3 class="no-data">No data is available to render this chart, check your logging levels</h3>'
        );
        limitsDmlRowsGraph = null;
        return;
    }
    $("#limits-dml-rows").append('<div id="limits-dml-rows-container"></div>');
    var container = document.getElementById("limits-dml-rows-container");
    var items = profile.limits["DML_ROWS"].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions("DML_ROWS");
    setTimeout(function () {
        limitsDmlRowsGraph = new vis.Graph2d(container, dataset, options);
        limitsDmlRowsGraph.fit();
    }, 0);
}

function renderAggsLimits() {
    if (!profile.limits["AGGS"]) {
        $("#limits-aggs").append(
            '<h3 class="no-data">No data is available to render this chart, check your logging levels</h3>'
        );
        limitsAggsGraph = null;
        return;
    }
    $("#limits-aggs").append('<div id="limits-aggs-container"></div>');
    var container = document.getElementById("limits-aggs-container");
    var items = profile.limits["AGGS"].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions("AGGS");
    setTimeout(function () {
        limitsAggsGraph = new vis.Graph2d(container, dataset, options);
        limitsAggsGraph.fit();
    }, 0);
}

function renderQueueablesLimits() {
    if (!profile.limits["QUEUEABLE"]) {
        $("#limits-queueables").append(
            '<h3 class="no-data">No data is available to render this chart, check your logging levels</h3>'
        );
        limitsQueueablesGraph = null;
        return;
    }
    $("#limits-queueables").append('<div id="limits-queueables-container"></div>');
    var container = document.getElementById("limits-queueables-container");
    var items = profile.limits["QUEUEABLE"].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions("QUEUEABLE");

    setTimeout(function () {
        limitsQueueablesGraph = new vis.Graph2d(container, dataset, options);
        limitsQueueablesGraph.fit();
    }, 0);
}

function renderFutureLimits() {
    if (!profile.limits["FUTURE"]) {
        $("#limits-future").append(
            '<h3 class="no-data">No data is available to render this chart, check your logging levels</h3>'
        );
        limitsFutureGraph = null;
        return;
    }
    $("#limits-future").append('<div id="limits-future-container"></div>');
    var container = document.getElementById("limits-future-container");
    var items = profile.limits["FUTURE"].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions("FUTURE");
    setTimeout(function () {
        limitsFutureGraph = new vis.Graph2d(container, dataset, options);
        limitsFutureGraph.fit();
    }, 0);
}

function renderMaxAsyncLimits() {
    if (!profile.limits["MAX_ASYNC"]) {
        $("#limits-max-async").append(
            '<h3 class="no-data">No data is available to render this chart, check your logging levels</h3>'
        );
        limitsMaxAsyncGraph = null;
        return;
    }
    $("#limits-max-async").append('<div id="limits-max-async-container"></div>');
    var container = document.getElementById("limits-max-async-container");
    var items = profile.limits["MAX_ASYNC"].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions("MAX_ASYNC");
    setTimeout(function () {
        limitsMaxAsyncGraph = new vis.Graph2d(container, dataset, options);
        limitsMaxAsyncGraph.fit();
    }, 0);
}

function renderFieldDescribeLimits() {
    if (!profile.limits["FIELDS_DESCRIBES"]) {
        $("#limits-field-describe").append(
            '<h3 class="no-data">No data is available to render this chart, check your logging levels</h3>'
        );
        limitsFieldDescribeGraph = null;
        return;
    }
    $("#limits-field-describe").append('<div id="limits-field-describe-container"></div>');
    var container = document.getElementById("limits-field-describe-container");
    var items = profile.limits["FIELDS_DESCRIBES"].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions("FIELDS_DESCRIBES");
    setTimeout(function () {
        limitsFieldDescribeGraph = new vis.Graph2d(container, dataset, options);
        limitsFieldDescribeGraph.fit();
    }, 0);
}

function renderRecordTypeDescribeLimits() {
    if (!profile.limits["RECORD_TYPE_DESCRIBES"]) {
        $("#limits-record-type-describe").append(
            '<h3 class="no-data">No data is available to render this chart, check your logging levels</h3>'
        );
        limitsRecordTypeDescribeGraph = null;
        return;
    }
    $("#limits-record-type-describe").append(
        '<div id="limits-record-type-describe-container"></div>'
    );
    var container = document.getElementById("limits-record-type-describe-container");
    var items = profile.limits["RECORD_TYPE_DESCRIBES"].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions("RECORD_TYPE_DESCRIBES");
    setTimeout(function () {
        limitsRecordTypeDescribeGraph = new vis.Graph2d(container, dataset, options);
        limitsRecordTypeDescribeGraph.fit();
    }, 0);
}
