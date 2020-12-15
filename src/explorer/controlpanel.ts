import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as apexlog from "../apexlog";

export class ControlPanelProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "forcecreators.apexlogs.explorer.controlpanel";
    private _view?: vscode.WebviewView;

    constructor(private readonly context: vscode.ExtensionContext) {}

    public static register(context: vscode.ExtensionContext) {
        const provider = new ControlPanelProvider(context);
        return context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(ControlPanelProvider.viewType, provider, {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
            })
        );
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri],
        };

        webviewView.webview.html = apexlog.ui.getWebviewContent(
            "control-panel",
            webviewView.webview,
            this.context
        );
        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.type) {
                case "startLogging": {
                    vscode.commands.executeCommand("forcecreators.apexlogs.explorer.startlogging");
                    break;
                }
                case "stopLogging": {
                    apexlog.explorer.stopLogging(this.context);
                    break;
                }
                case "config": {
                    apexlog.config.save(message.data, this.context);
                    break;
                }
                case "deleteLogs": {
                    apexlog.explorer.deleteLogs();
                    break;
                }
            }
        });
        const config = apexlog.config.get(this.context);
        webviewView.webview.postMessage({ type: "config", data: config });
        fs.watchFile(apexlog.config.getPath(this.context), () => {
            const config = apexlog.config.get(this.context);
            webviewView.webview.postMessage({ type: "config", data: config });
        });
        this.getLogUsage();
    }

    private async getLogUsage() {
        const logUsage = await apexlog.explorer.getLogUsage();
        this._view?.webview.postMessage({
            type: "logUsage",
            data: logUsage,
        });
        setTimeout(this.getLogUsage, 30000);
    }
}
