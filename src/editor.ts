import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { Worker } from "worker_threads";
import * as apexlog from "./apexlog";
import { ProfileService } from "./profiler/service";

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
    private diagnosticCollection: vscode.DiagnosticCollection | undefined;
    private webviewPanel: vscode.WebviewPanel | undefined;
    private document: vscode.TextDocument | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        this.webviewPanel = webviewPanel;
        this.document = document;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection("ApexLog");

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
            changeDocumentSubscription.dispose();
            this.diagnosticCollection?.clear();
        });

        this.webviewPanel.webview.onDidReceiveMessage((e) => {
            switch (e.type) {
                case "debug":
                    //todo: wire up button to apex replay debugger
                    return;
            }
        });

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.toString() === document.uri.toString()) {
                this.updateWebview();
            }
        });

        this.updateWebview();
    }

    public async updateWebview(): void {
        this.webviewPanel?.webview.postMessage({
            type: "update",
            value: this.document?.getText(),
        });
        if (!this.document) return;
        const config = apexlog.config.get(this.context);
        new ProfileService(this.document.uri.fsPath, config)
            .on("progress", (value) => {
                //progress
            })
            .on("debug", (value) => {
                //debug
            })
            .run()
            .then((metadata: any) => {
                if (this.document) {
                    this.diagnosticCollection?.set(
                        this.document.uri,
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
