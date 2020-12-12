import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as apexlog from "./apexlog";

export async function activate(context: vscode.ExtensionContext) {
    apexlog.editor.ApexLogEditorProvider.register(context);
    await apexlog.config.setup(context);
    apexlog.registerCommands(context);
    apexlog.explorer.remotelogs.RemoteLogsProvider.register(context);
    apexlog.explorer.controlpanel.ControlPanelProvider.register(context);
}

export function deactivate() {}
