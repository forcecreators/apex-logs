import * as events from "events";
import * as vscode from "vscode";
import * as fs from "fs";
import * as apexlog from "../apexlog";
import * as models from "../models";
//import { DataSet, createNewDataPipeFrom, DataView } from 'vis-data/peer/esm/vis-data.js';

export declare interface ProfileService extends events.EventEmitter {
    on(event: "progress", listener: (value: number) => void): this;
    on(event: "debug", listener: (value: any) => void): this;
    on(event: string, listener: Function): this;
}

export class ProfileService extends events.EventEmitter {
    logpath: string;
    lastProgress: number;
    config: any;

    constructor(logpath: string, config: any) {
        super();
        this.logpath = logpath;
        this.lastProgress = 0;
        this.config = config;
    }

    public run(): Promise<Object> {
        return new Promise<Object>((resolve) => {
            new models.ApexLog(this.logpath, this.config)
                .on("progress", (value: any) => {
                    this.reportProgress(value);
                })
                .on("debug", (value: any) => {
                    this.debug(value);
                })
                .processLog()
                .then((metadata: models.ApexLog) => {
                    resolve(this.buildProfile(metadata));
                });
        });
    }

    public removeBacklistItems(children: Array<number>, blacklist: Array<number>) {
        blacklist.forEach((value, index) => {
            var childIndex = children.indexOf(value);
            if (childIndex > -1) {
                children.splice(childIndex, 1);
            }
        });
    }

    public buildProfile(metadata: models.ApexLog) {
        const profile: any = {};
        const blacklist: Array<number> = [];
        const lines: Array<any> = [];
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
        profile["diagnostics"] = metadata.diagnostics;
        return profile;
    }

    renderLimits(limits: any) {
        const limitsOutput: any = {};
        Object.keys(limits).forEach((limitType: string) => {
            limitsOutput[limitType] = {};
            limitsOutput[limitType]["max"] = limits[limitType][0]["limitMax"];
            limitsOutput[limitType]["items"] = [];
            limits[limitType].forEach((limitElement: any) => {
                limitsOutput[limitType]["items"].push({
                    x: limitElement.time,
                    y: limitElement.limitCurrent,
                });
            });
        });
        this.debug(limitsOutput);
        return limitsOutput;
    }

    public renderExecutionTree(lines: any) {
        const groups: Array<any> = [];
        const items: Array<any> = [];
        lines.forEach((node: any) => {
            const showNested = node.treeLevel < 2 ? true : false;
            if (node.children.length == 0) {
                groups.push({
                    id: node.index,
                    content: node.detail,
                    treeLevel: node.treeLevel,
                });
            } else {
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
                        start: <Date>node.startTime,
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

    public renderExecutedUnits(lines: any) {
        const apexChildren: Array<number> = [];
        const workflowChildren: Array<number> = [];
        const dmlChildren: Array<number> = [];
        const soqlChildren: Array<number> = [];
        const otherChildren: Array<number> = [];
        const groupMap: any = {};
        const groups: Array<any> = [];
        const items: Array<any> = [];
        lines.forEach((node: any) => {
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
                        start: <Date>node.startTime,
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

    private reportProgress(progress: number) {
        if (this.lastProgress !== progress) {
            this.emit("progress", progress - this.lastProgress);
        }
        this.lastProgress = progress;
    }

    private debug(value: any) {
        this.emit("debug", value);
    }
}
