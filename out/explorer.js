"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadLog = exports.stopLogging = exports.startLoopingRefresh = exports.startLogging = exports.refreshLogs = exports.getLogUsage = exports.remotelogs = exports.controlpanel = void 0;
const _controlpanel = require("./explorer/controlpanel");
const _remotelogs = require("./explorer/remotelogs");
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const apexlog = require("./apexlog");
exports.controlpanel = _controlpanel;
exports.remotelogs = _remotelogs;
function getLogUsage() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            apexlog.sfdx
                .command("force:data:soql:query", ["-q", "SELECT sum(LogLength) FROM ApexLog"])
                .then((response) => {
                resolve(response.result.records[0].expr0);
            });
        });
    });
}
exports.getLogUsage = getLogUsage;
function refreshLogs(context) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise((resolve) => {
            apexlog.sfdx.command("force:apex:log:list", []).then((response) => {
                fs.writeFileSync(context.extensionPath + "\\remotelogs.json", JSON.stringify(response.result));
                resolve();
            });
        });
    });
}
exports.refreshLogs = refreshLogs;
function startLogging(context) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Starting Logging Session",
            cancellable: true,
        }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const config = apexlog.config.get(context);
                const endtime = new Date().getTime() + 60000 * config.maxTimeMin;
                const debugLevelId = yield getDebugLevelId(config, context);
                const traceFlagId = yield createTraceFlag(debugLevelId, new Date().getTime(), endtime, config, context);
                config.endTime = endtime;
                config.traceFlagId = traceFlagId;
                apexlog.config.save(config, context);
                startLoopingRefresh(context);
                resolve();
            }));
        }));
    });
}
exports.startLogging = startLogging;
function startLoopingRefresh(context) {
    return __awaiter(this, void 0, void 0, function* () {
        do {
            const config = apexlog.config.get(context);
            yield refreshLogs(context);
            yield sleep(config.refreshIntervalSeconds * 1000);
            if (!config.endTime || new Date(config.endTime) < new Date())
                break;
        } while (true);
    });
}
exports.startLoopingRefresh = startLoopingRefresh;
function stopLogging(context) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Stopping Logging Session",
        cancellable: false,
    }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
        return yield deleteTraceFlag(context);
    }));
}
exports.stopLogging = stopLogging;
function downloadLog(logId, context) {
    const config = apexlog.config.get(context);
    const logDirectory = path.join(apexlog.config.getWorkspaceFolder(), ".sfdx", "tools", "debug", "logs");
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Opening Log: " + logId,
        cancellable: true,
    }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            apexlog.sfdx
                .command("force:apex:log:get", ["-i", logId, "-d", logDirectory])
                .then((response) => {
                vscode.commands.executeCommand("vscode.openWith", vscode.Uri.file(response.result[0]), "forcecreators.apexlogs.editor");
                vscode.Uri.file(response.result[0]);
                resolve();
            });
        });
    }));
}
exports.downloadLog = downloadLog;
function deleteTraceFlag(context) {
    return new Promise((resolve, reject) => {
        const config = apexlog.config.get(context);
        apexlog.sfdx
            .command("force:data:record:delete", [
            "-t",
            "-s",
            "TraceFlag",
            "-i",
            config.traceFlagId,
        ])
            .then(() => {
            config.endTime = null;
            config.traceFlagId = null;
            apexlog.config.save(config, context);
            resolve();
        });
    });
}
function createTraceFlag(debugLevelId, startDate, expirationDate, config, context) {
    return new Promise((resolve) => {
        const values = "LogType='DEVELOPER_LOG' " +
            "DebugLevelId='" +
            debugLevelId +
            "' " +
            "StartDate='" +
            new Date(startDate).toISOString() +
            "' " +
            "ExpirationDate='" +
            new Date(expirationDate).toISOString() +
            "' " +
            "TracedEntityId='" +
            config.defaultUser.id +
            "' ";
        apexlog.sfdx
            .command("force:data:record:create", ["-t", "-s", "TraceFlag", "-v", values])
            .then((response) => {
            resolve(response.result.id);
        });
    });
}
function getDebugLevelId(config, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const debugLevels = yield queryDebugLevel(config, context);
        const values = buildValuesFromConfig(config);
        const commandValues = ["-t", "-s", "DebugLevel", "-v", values];
        let command;
        if (debugLevels.length > 0) {
            command = "force:data:record:update";
            commandValues.push("-i");
            commandValues.push(debugLevels[0].Id);
        }
        else {
            command = "force:data:record:create";
        }
        return new Promise((resolve) => {
            apexlog.sfdx.command(command, commandValues).then((response) => {
                resolve(response.result.id);
            });
        });
    });
}
function queryDebugLevel(config, context) {
    return new Promise((resolve) => {
        const config = apexlog.config.get(context);
        apexlog.sfdx
            .command("force:data:soql:query", [
            "-t",
            "-q",
            "SELECT Id, DeveloperName FROM DebugLevel WHERE DeveloperName='" +
                config.defaultUser.username.replace(/[&\/\\#,+()$~%.'":@*?<>{}]/g, "_") +
                "'",
        ])
            .then((response) => {
            resolve(response.result.records);
        });
    });
}
function buildValuesFromConfig(config) {
    return ("ApexCode='" +
        config.apex +
        "' " +
        "ApexProfiling='" +
        config.profiling +
        "' " +
        "Callout='" +
        config.callout +
        "' " +
        "Database='" +
        config.database +
        "' " +
        "System='" +
        config.system +
        "' " +
        "Validation='" +
        config.validation +
        "' " +
        "Visualforce='" +
        config.visualforce +
        "' " +
        "Workflow='" +
        config.workflow +
        "' " +
        "DeveloperName='" +
        config.defaultUser.username.replace(/[&\/\\#,+()$~%.'":@*?<>{}]/g, "_") +
        "' " +
        "MasterLabel='" +
        config.defaultUser.username.replace(/[&\/\\#,+()$~%.'":*?@<>{}]/g, "_") +
        "' ");
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
//# sourceMappingURL=explorer.js.map