$('#nav-tab a').on('click', function (e) {
    e.preventDefault()
    console.log($(this).attr('id'));
    switch($(this).attr('id')) {
        case 'execution-tree-tab':
            if(typeof executionStackTimeline === 'undefined') renderExecutionTree();
            break;
        case 'executed-units-tab':
            if(typeof executedUnitsTimeline === 'undefined') renderExecutedUnits();
        break;
        case 'limits-soql-tab':
            console.log('limits tabs');
            if(typeof limitsSoqlGraph === 'undefined') renderSoqlLimits();
            break;
        case 'limits-soql-rows-tab':
            if(typeof limitsSoqlRowsGraph === 'undefined') renderSoqlRowsLimits();
            break;
        case 'limits-dml-tab':
            if(typeof limitsDmlGraph === 'undefined') renderDmlLimits();
            break;
        case 'limits-dml-rows-tab':
            if(typeof limitsDmlRowsGraph === 'undefined') renderDmlRowsLimits();
            break;
        case 'limits-aggs-tab':
            if(typeof limitsAggsGraph === 'undefined') renderAggsLimits();
            break;
        case 'limits-queueables-tab':
            if(typeof limitsQueueablesGraph === 'undefined') renderQueueablesLimits();
            break;
        case 'limits-future-tab':
            if(typeof limitsFutureGraph === 'undefined') renderFutureLimits();
            break;
        case 'limits-max-async-tab':
            if(typeof limitsMaxAsyncGraph === 'undefined') renderMaxAsyncLimits();
            break;
        case 'limits-field-describe-tab':
            if(typeof limitsFieldDescribeGraph === 'undefined') renderFieldDescribeLimits();
            break;
        case 'limits-record-type-describe-tab':
            if(typeof limitsRecordTypeDescribeGraph === 'undefined') renderRecordTypeDescribeLimits();
            break;
        default:
        // code block
    }
})



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

const timelineOptions = {
    horizontalScroll: false,
    zoomKey: 'ctrlKey',
    orientation: 'both',
    showMajorLabels: false,
    showMinorLabels: false
};

function getGraphOptions(limit) {
    return {
        sort: false,
        showMajorLabels: false,
        height: $('.main').height() + 'px',
        dataAxis: {
            left: {
                range: {
                    max: profile.limits[limit].max
                }
            }
        }
    };
}

window.addEventListener('message', event => {
    console.log('starting viewer');
    console.log('got metadata', event.data);
    switch (event.data.type) {
        case 'update':
            $( document ).ready(function() {
                console.log('loaded frame');
                const cm = CodeMirror(document.getElementById('file-editor'), {
                    lineNumbers: true,
                    tabSize: 2,
                    value: event.data.value
                });
                cm.setSize('100%', $('.main').height());
            });
            return;
        case 'profile':
            $( document ).ready(function() {
                profile = event.data.value;
                renderExecutionTree();
            });
            return;
    }
    
})

function updateChartOnResize(chart) {
    $(window).on('resize', function(){
        chart.setOptions({
            // width: (window.innerWidth - 100) + "px",
            height: $('.main').height() + 'px',
        });
    });
}

function renderExecutionTree() {
    $('#execution-tree').append('<div id="execution-tree-container"></div>');
    startTime = new Date().getTime();

    const groups = profile.executionTree.groups;
    const items = profile.executionTree.items;
    let startDay = moment().startOf("month").startOf("week").isoWeekday(1);
    var container = document.getElementById('execution-tree-container');
    setTimeout(function () {
        executionStackTimeline = new vis.Timeline(container, new vis.DataSet(items), new vis.DataSet(groups), timelineOptions);
        executionStackTimeline.fit();
    }, 0);
}

function renderExecutedUnits() {
    $('#executed-units').append('<div id="executed-units-container"></div>');
    startTime = new Date().getTime();

    const groups = profile.executedUnits.groups;
    const items = profile.executedUnits.items;
    let startDay = moment().startOf("month").startOf("week").isoWeekday(1);
    var container = document.getElementById('executed-units-container');
    setTimeout(function () {
        executedUnitsTimeline = new vis.Timeline(container, new vis.DataSet(items), new vis.DataSet(groups), timelineOptions);
        executedUnitsTimeline.fit();
        executedUnitsTimeline.setOptions({
            stack:false
        });
    }, 0);
}

function renderSoqlLimits() {
    $('#limits-soql').append('<div id="limits-soql-container"></div>');
    var container = document.getElementById('limits-soql-container');
    var items = profile.limits['SOQL'].items;
    var dataset = new vis.DataSet(items);
    var options = getGraphOptions('SOQL');
    setTimeout(function () {
        limitsSoqlGraph = new vis.Graph2d(container, dataset, options);
        limitsSoqlGraph.fit();
        updateChartOnResize(limitsSoqlGraph);
    }, 0);
}

function renderSoqlRowsLimits() {
    console.log('rendering soql rows');
    $('#limits-soql-rows').append('<div id="limits-soql-rows-container"></div>');
    var container = document.getElementById('limits-soql-rows-container');
    var items = profile.limits['SOQL_ROWS'].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions('SOQL_ROWS');
    setTimeout(function () {
        limitsSoqlRowsGraph = new vis.Graph2d(container, dataset, options);
        limitsSoqlRowsGraph.fit();
    }, 0);
}

function renderDmlLimits() {
    $('#limits-dml').append('<div id="limits-dml-container"></div>');
    var container = document.getElementById('limits-dml-container');
    var items = profile.limits['DML'].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions('DML');
    setTimeout(function () {
        limitsDmlGraph = new vis.Graph2d(container, dataset, options);
        limitsDmlGraph.fit();
    }, 0);
}

function renderDmlRowsLimits() {
    $('#limits-dml-rows').append('<div id="limits-dml-rows-container"></div>');
    var container = document.getElementById('limits-dml-rows-container');
    var items = profile.limits['DML_ROWS'].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions('DML_ROWS');
    setTimeout(function () {
        limitsDmlRowsGraph = new vis.Graph2d(container, dataset, options);
        limitsDmlRowsGraph.fit();
    }, 0);
}

function renderAggsLimits() {
    $('#limits-aggs').append('<div id="limits-aggs-container"></div>');
    var container = document.getElementById('limits-aggs-container');
    var items = profile.limits['AGGS'].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions('AGGS');
    setTimeout(function () {
        limitsAggsGraph = new vis.Graph2d(container, dataset, options);
        limitsAggsGraph.fit();
    }, 0);
}

function renderQueueablesLimits() {
    console.log('in queueables render');
    $('#limits-queueables').append('<div id="limits-queueables-container"></div>');
    var container = document.getElementById('limits-queueables-container');
    var items = profile.limits['QUEUEABLE'].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions('QUEUEABLE');
    
    setTimeout(function () {
        limitsQueueablesGraph = new vis.Graph2d(container, dataset, options);
        limitsQueueablesGraph.fit();
    }, 0);
}

function renderFutureLimits() {
    $('#limits-future').append('<div id="limits-future-container"></div>');
    var container = document.getElementById('limits-future-container');
    var items = profile.limits['FUTURE'].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions('FUTURE');
    setTimeout(function () {
        limitsFutureGraph = new vis.Graph2d(container, dataset, options);
        limitsFutureGraph.fit();
    }, 0);
}

function renderMaxAsyncLimits() {
    $('#limits-max-async').append('<div id="limits-max-async-container"></div>');
    var container = document.getElementById('limits-max-async-container');
    var items = profile.limits['MAX_ASYNC'].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions('MAX_ASYNC');
    setTimeout(function () {
        limitsMaxAsyncGraph = new vis.Graph2d(container, dataset, options);
        limitsMaxAsyncGraph.fit();
    }, 0);
}

function renderFieldDescribeLimits() {
    $('#limits-field-describe').append('<div id="limits-field-describe-container"></div>');
    var container = document.getElementById('limits-field-describe-container');
    var items = profile.limits['FIELDS_DESCRIBES'].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions('FIELDS_DESCRIBES');
    setTimeout(function () {
        limitsFieldDescribeGraph = new vis.Graph2d(container, dataset, options);
        limitsFieldDescribeGraph.fit();
    }, 0);
}

function renderRecordTypeDescribeLimits() {
    $('#limits-record-type-describe').append('<div id="limits-record-type-describe-container"></div>');
    var container = document.getElementById('limits-record-type-describe-container');
    var items = profile.limits['RECORD_TYPE_DESCRIBES'].items;

    var dataset = new vis.DataSet(items);
    var options = getGraphOptions('RECORD_TYPE_DESCRIBES');
    setTimeout(function () {
        limitsRecordTypeDescribeGraph = new vis.Graph2d(container, dataset, options);
        limitsRecordTypeDescribeGraph.fit();
    }, 0);
}