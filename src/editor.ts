import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { Worker } from "worker_threads";
import * as apexlog from "./apexlog";

export class ApexLogEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new ApexLogEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            ApexLogEditorProvider.viewType,
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
            }
        );
        return providerRegistration;
    }

    private static readonly viewType = "forcecreators.apexlogs.editor";

    constructor(private readonly context: vscode.ExtensionContext) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, "ui"))],
        };
        webviewPanel;
        webviewPanel.webview.html = apexlog.ui.getWebviewContent(
            "apex-log-editor",
            webviewPanel.webview,
            this.context
        );

        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: "update",
                value: document.getText(),
            });
            apexlog.profiler.runProfiler(document.uri.fsPath).then((metadata) => {
                console.log("got metadata!!!!");
                console.log(metadata);
                setTimeout(() => {
                    webviewPanel.webview.postMessage({
                        type: "profile",
                        value: metadata,
                    });
                }, 3000);
            });
        }

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        webviewPanel.webview.onDidReceiveMessage((e) => {
            switch (e.type) {
                case "debug":
                    //todo: wire up button to apex replay debugger
                    return;
            }
        });

        updateWebview();
    }
}
