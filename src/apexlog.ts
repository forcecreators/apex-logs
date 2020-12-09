import * as vscode from "vscode";
import * as _editor from "./editor";
import * as _explorer from "./explorer";
import * as _models from "./models";
import * as _profiler from "./profiler";
import * as _config from "./config";
import * as _ui from "./ui";
import * as _sfdx from "./sfdx";

export const editor = _editor;
export const explorer = _explorer;
export const models = _models;
export const profiler = _profiler;
export const config = _config;
export const ui = _ui;
export const sfdx = _sfdx;

export function registerCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "forcecreators.apexlogs.explorer.openlog",
            (item: vscode.TreeItem) => {
                console.log(item.label);
                explorer.downloadLog(item.id, context);
            }
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("forcecreators.apexlogs.explorer.startlogging", () =>
            explorer.startLogging(context)
        )
    );
}
