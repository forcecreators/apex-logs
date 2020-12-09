import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as apexlog from "./apexlog";

export function activate(context: vscode.ExtensionContext) {
    apexlog.editor.ApexLogEditorProvider.register(context);
    apexlog.config.setup(context);
    apexlog.registerCommands(context);
    apexlog.explorer.remotelogs.RemoteLogsProvider.register(context);
    apexlog.explorer.controlpanel.ControlPanelProvider.register(context);
}

export function deactivate() {}
