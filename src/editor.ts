import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { Worker } from "worker_threads";
import * as apexlog from "./apexlog";
import { ProfileService } from "./profiler/service";

export class ApexLogEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(
        context: vscode.ExtensionContext,
        diagnosticCollection: vscode.DiagnosticCollection
    ): vscode.Disposable {
        const provider = new ApexLogEditorProvider(context, diagnosticCollection);
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
    private webviewPanel: vscode.WebviewPanel | undefined;
    private document: vscode.TextDocument | undefined;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly diagnosticCollection: vscode.DiagnosticCollection
    ) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        this.webviewPanel = webviewPanel;
        this.document = document;

        this.webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, "ui"))],
        };

        this.webviewPanel.webview.html = apexlog.ui.getWebviewContent(
            "apex-log-editor",
            this.webviewPanel.webview,
            this.context
        );

        this.webviewPanel.onDidDispose(() => {
            this.diagnosticCollection.delete(document.uri);
            changeDocumentSubscription.dispose();
        });

        this.webviewPanel.webview.onDidReceiveMessage((e) => {
            switch (e.type) {
                case "debug":
                    vscode.commands.executeCommand(
                        "sfdx.launch.replay.debugger.logfile",
                        document.uri
                    );
                    return;
            }
        });

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.toString() === document.uri.toString()) {
                this.updateWebview(document);
            }
        });

        this.updateWebview(document);
    }

    public updateWebview(document: vscode.TextDocument) {
        this.webviewPanel?.webview.postMessage({
            type: "update",
            value: document.getText(),
        });
        const config = apexlog.config.get(this.context);
        apexlog.profiler.runProfiler(document.uri.fsPath, config).then((metadata: any) => {
            if (document) {
                this.diagnosticCollection.set(
                    document.uri,
                    this.buildDiagnostics(metadata.diagnostics)
                );
            }
            setTimeout(() => {
                this.webviewPanel?.webview.postMessage({
                    type: "profile",
                    value: metadata,
                });
            }, 0);
        });
    }

    public buildDiagnostics(diagnostics: any) {
        const results: any = [];
        diagnostics.forEach((diagnosticItem: any) => {
            results.push(
                new vscode.Diagnostic(
                    new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
                    diagnosticItem.message,
                    diagnosticItem.severity
                )
            );
        });
        return results;
    }
}
