"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const events = require("events");
const models = require("../models");
class ProfileService extends events.EventEmitter {
    constructor(logpath) {
        super();
        this.logpath = logpath;
        this.lastProgress = 0;
    }
    run() {
        return new Promise((resolve) => {
            new models.ApexLog(this.logpath)
                .on("progress", (value) => {
                this.reportProgress(value);
            })
                .on("debug", (value) => {
                this.debug(value);
            })
                .processLog()
                .then((metadata) => {
                resolve(this.buildProfile(metadata));
            });
        });
    }
    removeBacklistItems(children, blacklist) {
        blacklist.forEach((value, index) => {
            var childIndex = children.indexOf(value);
            if (childIndex > -1) {
                children.splice(childIndex, 1);
            }
        });
    }
    buildProfile(metadata) {
        const profile = {};
        const blacklist = [];
        const lines = [];
        Object.keys(metadata.lines).forEach((index) => {
            const node = metadata.lines[index];
            if (node.totalTime < 1) {
                blacklist.push(node.index);
            }
        });
        Object.keys(metadata.lines).forEach((index) => {
            const node = metadata.lines[index];
            this.removeBacklistItems(node.children, blacklist);
            if (blacklist.indexOf(node.index) === -1) {
                lines.push(node);
            }
        });
        profile["executionTree"] = this.renderExecutionTree(lines);
        profile["executedUnits"] = this.renderExecutedUnits(lines);
        profile["limits"] = this.renderLimits(metadata.limits);
        return profile;
    }
    renderLimits(limits) {
        const limitsOutput = {};
        Object.keys(limits).forEach((limitType) => {
            limitsOutput[limitType] = {};
            limitsOutput[limitType]["max"] = limits[limitType][0]["limitMax"];
            limitsOutput[limitType]["items"] = [];
            limits[limitType].forEach((limitElement) => {
                limitsOutput[limitType]["items"].push({
                    x: limitElement.time,
                    y: limitElement.limitCurrent,
                });
            });
        });
        this.debug(limitsOutput);
        return limitsOutput;
    }
    renderExecutionTree(lines) {
        const groups = [];
        const items = [];
        lines.forEach((node) => {
            const showNested = node.treeLevel < 2 ? true : false;
            if (node.children.length == 0) {
                groups.push({
                    id: node.index,
                    content: node.detail,
                    treeLevel: node.treeLevel,
                });
            }
            else {
                groups.push({
                    id: node.index,
                    content: node.detail,
                    treeLevel: node.treeLevel,
                    nestedGroups: node.children,
                    showNested: showNested,
                });
            }
            if (node.startTime != null && node.endTime != null) {
                items.push({
                    id: node.index,
                    group: node.index,
                    content: node.totalTime + "ms",
                    start: node.startTime,
                    end: node.endTime,
                    type: "range",
                    title: node.detail + " <br> " + node.totalTime + "ms",
                });
                if (node.event === "CODE_UNIT_STARTED") {
                    items.push({
                        start: node.startTime,
                        end: node.endTime,
                        type: "background",
                        title: node.detail + " <br> " + node.totalTime + "ms",
                    });
                }
            }
        });
        return {
            groups: groups,
            items: items,
        };
    }
    renderExecutedUnits(lines) {
        const apexChildren = [];
        const workflowChildren = [];
        const dmlChildren = [];
        const soqlChildren = [];
        const otherChildren = [];
        const groupMap = {};
        const groups = [];
        const items = [];
        lines.forEach((node) => {
            if (typeof groupMap[node.detail] === "undefined") {
                let index = node.index + 10;
                switch (node.type) {
                    case "apex":
                        apexChildren.push(index);
                        break;
                    case "workflow":
                        workflowChildren.push(index);
                        break;
                    case "dml":
                        dmlChildren.push(index);
                        break;
                    case "soql":
                        soqlChildren.push(index);
                        break;
                    default:
                        otherChildren.push(index);
                }
                groups.push({
                    id: index,
                    content: node.detail,
                    treeLevel: 2,
                });
                groupMap[node.detail] = {
                    id: index,
                    content: node.detail,
                };
            }
            let groupId = groupMap[node.detail].id;
            let parentIndex;
            switch (node.type) {
                case "apex":
                    parentIndex = 1;
                    break;
                case "workflow":
                    parentIndex = 2;
                    break;
                case "dml":
                    parentIndex = 3;
                    break;
                case "soql":
                    parentIndex = 4;
                    break;
                default:
                    parentIndex = 5;
            }
            if (node.startTime != null && node.endTime != null) {
                items.push({
                    group: groupId,
                    content: node.totalTime + "ms",
                    start: node.startTime,
                    end: node.endTime,
                    type: "range",
                    title: node.detail + " <br> " + node.totalTime + "ms",
                });
                items.push({
                    group: parentIndex,
                    content: node.totalTime + "ms",
                    start: node.startTime,
                    end: node.endTime,
                    type: "range",
                    title: node.detail + " <br> " + node.totalTime + "ms",
                });
                if (node.event === "CODE_UNIT_STARTED") {
                    items.push({
                        start: node.startTime,
                        end: node.endTime,
                        type: "background",
                        title: node.detail + " <br> " + node.totalTime + "ms",
                    });
                }
            }
        });
        groups.push({
            id: 1,
            content: "Apex",
            nestedGroups: apexChildren,
            treeLevel: 1,
            showNested: false,
        });
        groups.push({
            id: 2,
            content: "Workflow",
            nestedGroups: workflowChildren,
            treeLevel: 1,
            showNested: false,
        });
        groups.push({
            id: 3,
            content: "DML",
            nestedGroups: dmlChildren,
            treeLevel: 1,
            showNested: false,
        });
        groups.push({
            id: 4,
            content: "SOQL",
            nestedGroups: soqlChildren,
            treeLevel: 1,
            showNested: false,
        });
        groups.push({
            id: 5,
            content: "Other",
            nestedGroups: otherChildren,
            treeLevel: 1,
            showNested: false,
        });
        return {
            groups: groups,
            items: items,
        };
    }
    reportProgress(progress) {
        if (this.lastProgress !== progress) {
            this.emit("progress", progress - this.lastProgress);
        }
        this.lastProgress = progress;
    }
    debug(value) {
        this.emit("debug", value);
    }
}
exports.ProfileService = ProfileService;
//# sourceMappingURL=service.js.map