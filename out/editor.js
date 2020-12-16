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
exports.ApexLogEditorProvider = void 0;
const vscode = require("vscode");
const path = require("path");
const apexlog = require("./apexlog");
const service_1 = require("./profiler/service");
class ApexLogEditorProvider {
    constructor(context, diagnosticCollection) {
        this.context = context;
        this.diagnosticCollection = diagnosticCollection;
    }
    static register(context, diagnosticCollection) {
        const provider = new ApexLogEditorProvider(context, diagnosticCollection);
        const providerRegistration = vscode.window.registerCustomEditorProvider(ApexLogEditorProvider.viewType, provider, {
            webviewOptions: {
                retainContextWhenHidden: true,
            },
        });
        return providerRegistration;
    }
    resolveCustomTextEditor(document, webviewPanel, _token) {
        return __awaiter(this, void 0, void 0, function* () {
            this.webviewPanel = webviewPanel;
            this.document = document;
            this.webviewPanel.webview.options = {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, "ui"))],
            };
            this.webviewPanel.webview.html = apexlog.ui.getWebviewContent("apex-log-editor", this.webviewPanel.webview, this.context);
            this.webviewPanel.onDidDispose(() => {
                this.diagnosticCollection.delete(document.uri);
                changeDocumentSubscription.dispose();
            });
            this.webviewPanel.webview.onDidReceiveMessage((e) => {
                var _a;
                switch (e.type) {
                    case "debug":
                        vscode.commands.executeCommand("sfdx.launch.replay.debugger.logfile", (_a = this.document) === null || _a === void 0 ? void 0 : _a.uri);
                        return;
                }
            });
            const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
                if (e.document.uri.toString() === document.uri.toString()) {
                    this.updateWebview();
                }
            });
            this.updateWebview();
        });
    }
    updateWebview() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.webviewPanel) === null || _a === void 0 ? void 0 : _a.webview.postMessage({
                type: "update",
                value: (_b = this.document) === null || _b === void 0 ? void 0 : _b.getText(),
            });
            if (!this.document)
                return;
            const config = apexlog.config.get(this.context);
            new service_1.ProfileService(this.document.uri.fsPath, config)
                .on("progress", (value) => {
                //progress
            })
                .on("debug", (value) => {
                //debug
            })
                .run()
                .then((metadata) => {
                if (this.document) {
                    this.diagnosticCollection.set(this.document.uri, this.buildDiagnostics(metadata.diagnostics));
                }
                setTimeout(() => {
                    var _a;
                    (_a = this.webviewPanel) === null || _a === void 0 ? void 0 : _a.webview.postMessage({
                        type: "profile",
                        value: metadata,
                    });
                }, 0);
            });
        });
    }
    buildDiagnostics(diagnostics) {
        const results = [];
        diagnostics.forEach((diagnosticItem) => {
            results.push(new vscode.Diagnostic(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)), diagnosticItem.message, diagnosticItem.severity));
        });
        return results;
    }
}
exports.ApexLogEditorProvider = ApexLogEditorProvider;
ApexLogEditorProvider.viewType = "forcecreators.apexlogs.editor";
//# sourceMappingURL=editor.js.map