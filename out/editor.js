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
class ApexLogEditorProvider {
    constructor(context) {
        this.context = context;
    }
    static register(context) {
        const provider = new ApexLogEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(ApexLogEditorProvider.viewType, provider, {
            webviewOptions: {
                retainContextWhenHidden: true,
            },
        });
        return providerRegistration;
    }
    resolveCustomTextEditor(document, webviewPanel, _token) {
        return __awaiter(this, void 0, void 0, function* () {
            // Setup initial content for the webview
            webviewPanel.webview.options = {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, "ui"))],
            };
            webviewPanel;
            webviewPanel.webview.html = apexlog.ui.getWebviewContent("apex-log-editor", webviewPanel.webview, this.context);
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
        });
    }
}
exports.ApexLogEditorProvider = ApexLogEditorProvider;
ApexLogEditorProvider.viewType = "forcecreators.apexlogs.editor";
//# sourceMappingURL=editor.js.map