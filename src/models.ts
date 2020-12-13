import * as fs from "fs";
import { resolve } from "dns";
const events = require("events");

/* nodes */
const blackList = /FLOW_START_INTERVIEW_LIMIT_USAGE/;
const whiteList = /LIMIT_USAGE|SOQL_EXECUTE_BEGIN|SOQL_EXECUTE_END|DML_BEGIN|DML_END|USER_INFO|EXECUTION_STARTED|CODE_UNIT_STARTED|METHOD_ENTRY|CODE_UNIT_FINISHED|METHOD_EXIT|FLOW_START_INTERVIEW_BEGIN|FLOW_START_INTERVIEW_END|WF_CRITERIA_BEGIN|WF_CRITERIA_END|WF_RULE_EVAL_BEGIN|WF_RULE_EVAL_END|WF_RULE_NOT_EVALUATED|FLOW_CREATE_INTERVIEW_END|FLOW_INTERVIEW_FINISHED/;
const startTagsWhitelist = /SOQL_EXECUTE_BEGIN|DML_BEGIN|CODE_UNIT_STARTED|METHOD_ENTRY|FLOW_START_INTERVIEW_BEGIN|WF_CRITERIA_BEGIN|WF_RULE_EVAL_BEGIN|FLOW_CREATE_INTERVIEW_END/;
const endTagsWhitelist = /SOQL_EXECUTE_END|DML_END|CODE_UNIT_FINISHED|METHOD_EXIT|FLOW_START_INTERVIEW_END|WF_CRITERIA_END|WF_RULE_EVAL_END|WF_RULE_NOT_EVALUATED|\|FLOW_INTERVIEW_FINISHED\|/;

/* types */
const apexTags = /METHOD_ENTRY|METHOD_EXIT/;
const workflowKeywords = /Workflow:/;
const workflowTags = /WF_CRITERIA_BEGIN|WF_CRITERIA_END|FLOW_START_INTERVIEW_BEGIN|FLOW_START_INTERVIEW_END|WF_RULE_EVAL_BEGIN|WF_RULE_EVAL_END|WF_RULE_NOT_EVALUATED|FLOW_CREATE_INTERVIEW_END|\|FLOW_INTERVIEW_FINISHED\|/;
const dmlTags = /DML_BEGIN|DML_END/;
const soqlTags = /SOQL_EXECUTE_BEGIN|SOQL_EXECUTE_END/;
const limitTags = /LIMIT_USAGE/;

export declare interface ApexLogMetadta {
    on(event: "progress", listener: (value: number) => void): this;
    on(event: "debug", listener: (value: any) => void): this;
    on(event: string, listener: Function): this;
}

function nanoToMili(nanoSeconds: number): number {
    return Math.floor(nanoSeconds / 1000000);
}

export class ApexLog extends events.EventEmitter {
    public logpath: string;
    public startTime: number | null;
    public lines: any;
    public limits: any;
    public diagnostics: any = [];

    private totalLines: number;
    private currentIndex: number;
    private lastProgress: number;
    public parents: Array<ApexLogLine>;

    constructor(logpath: string) {
        super();
        this.logpath = logpath;
        this.startTime = null;
        this.currentIndex = 0;
        this.lastProgress = 0;
        this.totalLines = 0;
        this.parents = [];
        this.lines = {};
        this.limits = {};
    }

    public processLog() {
        return new Promise<ApexLog>((resolve) => {
            this.debug("starting metadata parsing");

            const logfile = fs.readFileSync(this.logpath, "utf8");
            const loglines = logfile.split("\n");
            this.totalLines = loglines.length;

            for (let i = 0; i < loglines.length; i++) {
                this.currentIndex = i;
                const line = this.getLogLine(loglines[i]);
                if (line === null) {
                    continue;
                }
                this.processLine(line);
                this.reportProgess();
            }
            this.buildLimitsDiagnostics();
            console.log("metadata", this);
            resolve(this);
        });
    }

    public processLine(line: ApexLogLine) {
        if (
            line.line ===
            "13:43:57.966 (10837885900)|METHOD_EXIT|[260]|01p0z000000NAAW|AsyncWork.ItemService.cache(System.Type, Set<Id>)"
        ) {
            this.debug("found the line");
            this.debug(line);
            this.debug(this.parents);
        }
        if (line.type === "limit") {
            if (line.limitName == null) return;
            if (typeof this.limits[line.limitName] === "undefined")
                this.limits[line.limitName] = [];
            this.limits[line.limitName].push(line);
            this.debug("limit");
            this.debug(line);
        } else if (line.event === "USER_INFO" && this.startTime === null) {
            this.startTime = line.time.getTime() - nanoToMili(line.nano);
        } else if (endTagsWhitelist.test(line.line)) {
            this.parents[0].setEndOfParent(line, this);
            this.lines[this.parents[0].index] = this.parents[0];
            this.parents.splice(0, 1);
        } else if (startTagsWhitelist.test(line.line)) {
            if (this.parents.length > 0) {
                this.parents[0].children.push(line.index);
            }
            this.parents.unshift(line);
            this.lines[line.index] = line;
        }
    }

    public getLogLine(logline: string): ApexLogLine | null {
        return !logline.includes("FLOW_START_INTERVIEW_LIMIT_USAGE") &&
            whiteList.test(logline) &&
            !logline.includes("System.Type.equals")
            ? new ApexLogLine(logline, this)
            : null;
    }
    public getCurrentIndex() {
        return this.currentIndex;
    }
    private buildLimitsDiagnostics() {
        Object.keys(this.limits).forEach((key: string) => {
            const limits = this.limits[key];
            const limit = limits[limits.length - 1];
            const message = `LIMIT ${key}: ${limit.limitCurrent}/${limit.limitMax}`;
            this.diagnostics.push(new DiagnosticItem(2, message, limit));
        });
    }
    private reportProgess() {
        const progress = Math.floor((this.currentIndex / this.totalLines) * 100);
        if (this.lastProgress !== progress) {
            this.emit("progress", progress);
        }
        this.lastProgress = progress;
    }
    private debug(value: any) {
        this.emit("debug", value);
    }
}
export class ApexLogLine {
    index: number;
    line: string;
    time: Date;
    nano: number;
    startTime: Date | null;
    endTime: Date | null;
    totalTime: number | null;
    event: string;
    detail: string;
    type: string;
    treeLevel: number | null;
    parent: number | null;
    children: Array<number>;
    limitCurrent: number | null;
    limitMax: number | null;
    limitName: string | null;

    constructor(logline: string, context: ApexLog) {
        this.limitCurrent = null;
        this.limitMax = null;
        this.limitName = null;

        const splitLine = logline.split("|", 2);
        const time = splitLine[0].split(" ");
        this.index = context.getCurrentIndex();
        this.treeLevel = context.parents.length + 1;
        this.line = logline;
        this.time = new Date("01-01-2020 " + time[0]);
        this.nano = parseInt(time[1].substring(1, time[1].length - 1));
        this.event = splitLine[1];
        if (this.line.includes("__sfdc_trigger")) {
            this.detail = this.line.substring(this.line.lastIndexOf(" ") + 1, this.line.length);
            this.detail = this.detail.replace("__sfdc_trigger", "");
        } else if (this.event === "WF_CRITERIA_BEGIN") {
            this.detail = this.line.split("|")[3];
        } else if (this.event === "DML_BEGIN") {
            const lineDetails = this.line.split("|");
            this.detail = lineDetails[3] + ", " + lineDetails[4] + ", " + lineDetails[5];
        } else {
            this.detail = this.line.substring(this.line.lastIndexOf("|") + 1, this.line.length);
        }

        if (apexTags.test(this.event) || this.line.includes("__sfdc_trigger")) {
            this.type = "apex";
        } else if (workflowKeywords.test(this.detail) || workflowTags.test(this.event)) {
            this.type = "workflow";
        } else if (dmlTags.test(this.event)) {
            this.type = "dml";
        } else if (soqlTags.test(this.event)) {
            this.type = "soql";
        } else if (this.event === "LIMIT_USAGE") {
            this.type = "limit";
            const lineDetails = this.line.split("|");
            this.limitName = lineDetails[3];
            this.limitCurrent = parseInt(lineDetails[4]);
            this.limitMax = parseInt(lineDetails[5]);
        } else {
            this.type = "other";
        }
        this.startTime =
            context.startTime === null ? null : new Date(context.startTime + nanoToMili(this.nano));
        this.parent = context.parents.length > 0 ? context.parents[0].index : null;
        this.endTime = null;
        this.totalTime = null;
        this.treeLevel = context.parents.length + 1;
        this.children = [];
    }

    public setEndOfParent(endline: ApexLogLine, context: ApexLog) {
        if (context.startTime === null) {
            return;
        }
        this.endTime = new Date(context.startTime + nanoToMili(endline.nano));
        this.totalTime = nanoToMili(endline.nano - this.nano);

        if (this.type === "dml" && this.totalTime >= 3000 && this.totalTime < 8000) {
            context.diagnostics.push(
                new DiagnosticItem(
                    1,
                    `Long Running DML (${this.totalTime}ms): ${this.detail}`,
                    this
                )
            );
        } else if (this.type === "dml" && this.totalTime >= 8000) {
            context.diagnostics.push(
                new DiagnosticItem(
                    0,
                    `Long Running DML (${this.totalTime}ms): ${this.detail}`,
                    this
                )
            );
        } else if (this.type === "soql" && this.totalTime >= 1000 && this.totalTime < 8000) {
            context.diagnostics.push(
                new DiagnosticItem(
                    1,
                    `Long Running SOQL (${this.totalTime}ms): ${this.detail}`,
                    this
                )
            );
        } else if (this.type === "soql" && this.totalTime >= 8000) {
            context.diagnostics.push(
                new DiagnosticItem(
                    0,
                    `Long Running SOQL (${this.totalTime}ms): ${this.detail}`,
                    this
                )
            );
        } else if (this.type === "apex" && this.totalTime >= 1000 && this.totalTime < 8000) {
            context.diagnostics.push(
                new DiagnosticItem(
                    1,
                    `Long Running Apex (${this.totalTime}ms): ${this.detail}`,
                    this
                )
            );
        } else if (this.type === "apex" && this.totalTime >= 8000) {
            context.diagnostics.push(
                new DiagnosticItem(
                    0,
                    `Long Running Apex (${this.totalTime}ms): ${this.detail}`,
                    this
                )
            );
        } else if (this.type === "workflow" && this.totalTime >= 1000 && this.totalTime < 8000) {
            context.diagnostics.push(
                new DiagnosticItem(
                    1,
                    `Long Running Workflow (${this.totalTime}ms): ${this.detail}`,
                    this
                )
            );
        } else if (this.type === "workflow" && this.totalTime >= 8000) {
            context.diagnostics.push(
                new DiagnosticItem(
                    0,
                    `Long Running Workflow (${this.totalTime}ms): ${this.detail}`,
                    this
                )
            );
        }
    }
}

class DiagnosticItem {
    public severity: number;
    public message: string;
    public line: ApexLogLine;

    constructor(severity: number, message: string, line: ApexLogLine) {
        this.severity = severity;
        this.message = message;
        this.line = line;
    }
}
