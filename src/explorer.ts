import * as _controlpanel from "./explorer/controlpanel";
import * as _remotelogs from "./explorer/remotelogs";
import * as cp from "child_process";
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as apexlog from "./apexlog";
import { resolve } from "dns";
import { ExtensionConfig } from "./config";
import { trace } from "console";

export const controlpanel = _controlpanel;
export const remotelogs = _remotelogs;

export async function getLogUsage() {
    return new Promise((resolve) => {
        apexlog.sfdx
            .command("force:data:soql:query", ["-q", "SELECT sum(LogLength) FROM ApexLog"])
            .then((response: any) => {
                resolve(response.result.records[0].expr0);
            });
    });
}

export async function refreshLogs(context: vscode.ExtensionContext) {
    return await new Promise((resolve: any) => {
        apexlog.sfdx.command("force:apex:log:list", []).then((response: any) => {
            fs.writeFileSync(
                context.extensionPath + "\\remotelogs.json",
                JSON.stringify(response.result)
            );
            resolve();
        });
    });
}

export async function startLogging(context: vscode.ExtensionContext) {
    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Starting Logging Session",
            cancellable: true,
        },
        async (progress, token) => {
            return new Promise(async (resolve: any, reject) => {
                const config = apexlog.config.get(context);
                const endtime = new Date().getTime() + 60000 * config.maxTimeMin;
                const debugLevelId: any = await getDebugLevelId(config, context);
                const traceFlagId = await createTraceFlag(
                    debugLevelId,
                    new Date().getTime(),
                    endtime,
                    config,
                    context
                );
                config.endTime = endtime;
                config.traceFlagId = traceFlagId;
                apexlog.config.save(config, context);

                startLoopingRefresh(context);
                resolve();
            });
        }
    );
}

export async function startLoopingRefresh(context: vscode.ExtensionContext) {
    do {
        const config = apexlog.config.get(context);
        await refreshLogs(context);
        await sleep(config.refreshIntervalSeconds * 1000);
        if (!config.endTime || new Date(config.endTime) < new Date()) break;
    } while (true);
}

export function stopLogging(context: vscode.ExtensionContext) {
    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Stopping Logging Session",
            cancellable: false,
        },
        async (progress, token) => {
            return await deleteTraceFlag(context);
        }
    );
}

export function downloadLog(logId: any, context: vscode.ExtensionContext) {
    const config: any = apexlog.config.get(context);
    const logDirectory = path.join(
        apexlog.config.getWorkspaceFolder(),
        ".sfdx",
        "tools",
        "debug",
        "logs"
    );
    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Opening Log: " + logId,
            cancellable: true,
        },
        async (progress, token) => {
            return new Promise((resolve: any, reject) => {
                apexlog.sfdx
                    .command("force:apex:log:get", ["-i", logId, "-d", logDirectory])
                    .then((response: any) => {
                        vscode.commands.executeCommand(
                            "vscode.openWith",
                            vscode.Uri.file(response.result[0]),
                            "forcecreators.apexlogs.editor"
                        );
                        vscode.Uri.file(response.result[0]);
                        resolve();
                    });
            });
        }
    );
}

function deleteTraceFlag(context: vscode.ExtensionContext) {
    return new Promise((resolve: any, reject) => {
        const config: any = apexlog.config.get(context);
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

function createTraceFlag(
    debugLevelId: string,
    startDate: number,
    expirationDate: number,
    config: ExtensionConfig,
    context: vscode.ExtensionContext
): any {
    return new Promise((resolve) => {
        const values =
            "LogType='DEVELOPER_LOG' " +
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
            .then((response: any) => {
                resolve(response.result.id);
            });
    });
}

async function getDebugLevelId(config: ExtensionConfig, context: vscode.ExtensionContext) {
    const debugLevels = await queryDebugLevel(config, context);
    const values = buildValuesFromConfig(config);
    const commandValues = ["-t", "-s", "DebugLevel", "-v", values];
    let command: string;
    if (debugLevels.length > 0) {
        command = "force:data:record:update";
        commandValues.push("-i");
        commandValues.push(debugLevels[0].Id);
    } else {
        command = "force:data:record:create";
    }
    return new Promise((resolve) => {
        apexlog.sfdx.command(command, commandValues).then((response: any) => {
            resolve(response.result.id);
        });
    });
}

function queryDebugLevel(config: ExtensionConfig, context: vscode.ExtensionContext): any {
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
            .then((response: any) => {
                resolve(response.result.records);
            });
    });
}

function buildValuesFromConfig(config: ExtensionConfig) {
    return (
        "ApexCode='" +
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
        "' "
    );
}

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
