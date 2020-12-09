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
exports.ControlPanelProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
const apexlog = require("../apexlog");
class ControlPanelProvider {
    constructor(context) {
        this.context = context;
    }
    static register(context) {
        const provider = new ControlPanelProvider(context);
        return context.subscriptions.push(vscode.window.registerWebviewViewProvider(ControlPanelProvider.viewType, provider, {
            webviewOptions: {
                retainContextWhenHidden: true,
            },
        }));
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri],
        };
        webviewView.webview.html = apexlog.ui.getWebviewContent("control-panel", webviewView.webview, this.context);
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
    getLogUsage() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const logUsage = yield apexlog.explorer.getLogUsage();
            (_a = this._view) === null || _a === void 0 ? void 0 : _a.webview.postMessage({
                type: "logUsage",
                data: logUsage,
            });
            setTimeout(this.getLogUsage, 30000);
        });
    }
}
exports.ControlPanelProvider = ControlPanelProvider;
ControlPanelProvider.viewType = "forcecreators.apexlogs.explorer.controlpanel";
//# sourceMappingURL=controlpanel.js.map