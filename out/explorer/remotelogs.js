"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dependency = exports.RemoteLogsProvider = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
class RemoteLogsProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this
            ._onDidChangeTreeData.event;
        if (!fs.existsSync(context.extensionPath + "\\remotelogs.json")) {
            fs.writeFileSync(context.extensionPath + "\\remotelogs.json", "[]");
        }
        fs.watchFile(this.context.extensionPath + "\\remotelogs.json", () => {
            console.log("logs changed");
            this.refresh();
        });
    }
    static register(context) {
        const provider = new RemoteLogsProvider(context);
        return context.subscriptions.push(vscode.window.registerTreeDataProvider(RemoteLogsProvider.viewType, provider));
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return new Promise((resolve) => {
            const _file = fs.readFileSync(this.context.extensionPath + "\\remotelogs.json");
            const logs = JSON.parse(_file.toString());
            const deps = [];
            logs.forEach((log) => {
                console.log(log);
                deps.push(new Dependency(log.Id, log.Operation, log.LogLength, vscode.TreeItemCollapsibleState.None));
            });
            return resolve(deps);
        });
    }
}
exports.RemoteLogsProvider = RemoteLogsProvider;
RemoteLogsProvider.viewType = "forcecreators.apexlogs.explorer.remotelogs";
class Dependency extends vscode.TreeItem {
    constructor(logId, operation, size, collapsibleState, command) {
        super(operation, collapsibleState);
        this.logId = logId;
        this.operation = operation;
        this.size = size;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.iconPath = {
            light: path.join(__filename, "..", "..", "resources", "light", "dependency.svg"),
            dark: path.join(__filename, "..", "..", "resources", "dark", "dependency.svg"),
        };
        this.contextValue = "dependency";
        //this.tooltip = `${log.operation}-${log.duration}`;
        this.description = `${formatBytes(size, 2)}`;
        this.command = {
            command: "forcecreators.apexlogs.explorer.openlog",
            title: "Select Node",
            arguments: [this],
        };
        this.id = logId;
    }
}
exports.Dependency = Dependency;
function formatBytes(bytes, decimals) {
    if (bytes == 0)
        return "0 Bytes";
    var k = 1024, dm = decimals || 2, sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
//# sourceMappingURL=remotelogs.js.map