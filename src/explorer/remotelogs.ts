import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as apexlog from "../apexlog";

export class RemoteLogsProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<
        Dependency | undefined | void
    > = new vscode.EventEmitter<Dependency | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this
        ._onDidChangeTreeData.event;
    public static readonly viewType = "forcecreators.apexlogs.explorer.remotelogs";

    constructor(private context: vscode.ExtensionContext) {
        if (!fs.existsSync(context.extensionPath + "\\remotelogs.json")) {
            fs.writeFileSync(context.extensionPath + "\\remotelogs.json", "[]");
        }
        fs.watchFile(this.context.extensionPath + "\\remotelogs.json", () => {
            console.log("logs changed");
            this.refresh();
        });
    }

    public static register(context: vscode.ExtensionContext) {
        const provider = new RemoteLogsProvider(context);
        return context.subscriptions.push(
            vscode.window.registerTreeDataProvider(RemoteLogsProvider.viewType, provider)
        );
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Dependency): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Dependency): Thenable<Dependency[]> {
        return new Promise((resolve) => {
            const _file = fs.readFileSync(this.context.extensionPath + "\\remotelogs.json");
            const logs = JSON.parse(_file.toString());
            const deps: Dependency[] = [];
            logs.forEach((log: any) => {
                console.log(log);
                deps.push(
                    new Dependency(
                        log.Id,
                        log.Operation,
                        log.LogLength,
                        vscode.TreeItemCollapsibleState.None
                    )
                );
            });
            return resolve(deps);
        });
    }
}

export class Dependency extends vscode.TreeItem {
    constructor(
        private readonly logId: string,
        private readonly operation: string,
        private readonly size: number,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(operation, collapsibleState);

        //this.tooltip = `${log.operation}-${log.duration}`;
        this.description = `${formatBytes(size, 2)}`;
        this.command = {
            command: "forcecreators.apexlogs.explorer.openlog",
            title: "Select Node",
            arguments: [this],
        };
        this.id = logId;
    }

    iconPath = {
        light: path.join(__filename, "..", "..", "resources", "light", "dependency.svg"),
        dark: path.join(__filename, "..", "..", "resources", "dark", "dependency.svg"),
    };

    contextValue = "dependency";
}

function formatBytes(bytes: number, decimals: number) {
    if (bytes == 0) return "0 Bytes";
    var k = 1024,
        dm = decimals || 2,
        sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
