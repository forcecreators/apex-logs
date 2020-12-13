import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as cp from "child_process";
import * as apexlog from "./apexlog";

export const CONFIG_NAME = "config.json";

export function get(context: vscode.ExtensionContext) {
    const configPath = path.join(context.extensionPath, CONFIG_NAME);
    let config = new ExtensionConfig();
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(config));
        return config;
    }
    const savedConfig = fs.readFileSync(configPath);
    config = Object.assign(config, JSON.parse(savedConfig.toString()));
    return config;
}

export function save(newConfig: ExtensionConfig, context: vscode.ExtensionContext) {
    const configPath = path.join(context.extensionPath, CONFIG_NAME);
    let config = new ExtensionConfig();
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(config));
        return config;
    }
    config = Object.assign(config, newConfig);
    fs.writeFileSync(configPath, JSON.stringify(config));
}

export async function setup(context: vscode.ExtensionContext) {
    const config = get(context);
    const defaultOrg = getDefaultOrg();
    if (
        !config.orgs ||
        !config.defaultOrg ||
        !config.orgs[defaultOrg] ||
        config.defaultOrg !== defaultOrg
    ) {
        config.defaultOrg = defaultOrg;
        await updateOrgs(config, context);
        config.defaultUser.username = config.orgs[getDefaultOrg()].username;
        await getUserId(config, context);
    }
    const traceFlag: any = await apexlog.explorer.getActiveTraceFlag(context);
    if (traceFlag) {
        config.traceFlagId = traceFlag.Id;
        config.endTime = new Date(traceFlag.ExpirationDate).getTime();
    } else {
        config.traceFlagId = null;
        config.endTime = null;
    }
    save(config, context);
    fs.watchFile(path.join(getWorkspaceFolder(), ".sfdx", "sfdx-config.json"), () => {
        setup(context);
    });
}

export function getPath(context: vscode.ExtensionContext) {
    return path.join(context.extensionPath, CONFIG_NAME);
}

export function getWorkspaceFolder() {
    let folder = "";
    if (typeof vscode.workspace.workspaceFolders !== "undefined") {
        folder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    return folder;
}

function updateOrgs(config: ExtensionConfig, context: vscode.ExtensionContext) {
    return new Promise((resolve: any) => {
        let ls = cp.spawn("sfdx", ["auth:list", "--json"], {
            cwd: getWorkspaceFolder(),
        });
        ls.stdout.on("data", function (data) {
            console.log("response", data);
            const response = JSON.parse(data.toString());
            const orgs = response.result;
            orgs.forEach((org: any) => {
                config.orgs[org.alias] = org;
            });
            resolve();
        });
    });
}

function getUserId(config: ExtensionConfig, context: vscode.ExtensionContext) {
    return new Promise((resolve: any) => {
        const query = "SELECT Id FROM User WHERE Username = '" + config.defaultUser.username + "'";
        let ls = cp.spawn("sfdx", ["force:data:soql:query", "--query", query, "--json"], {
            cwd: getWorkspaceFolder(),
        });
        ls.stdout.on("data", function (data) {
            console.log("response", data);
            const response = JSON.parse(data.toString());
            config.defaultUser.id = response.result.records[0]?.Id;
            resolve();
        });
    });
}

function getDefaultOrg() {
    const sfdxConfigJson = fs.readFileSync(
        path.join(getWorkspaceFolder(), ".sfdx", "sfdx-config.json")
    );
    const sfdxConfig = JSON.parse(sfdxConfigJson.toString());
    return sfdxConfig.defaultusername;
}

export class ExtensionConfig {
    public refreshIntervalSeconds: number = 3;
    public maxTimeMin: number = 60;
    public traceFlagId: string | null = null;
    public endTime: number | null = null;
    public apex: string = "FINEST";
    public profiling: string = "FINEST";
    public callout: string = "FINEST";
    public database: string = "FINEST";
    public system: string = "FINEST";
    public validation: string = "FINEST";
    public visualforce: string = "FINEST";
    public workflow: string = "FINEST";
    public orgs: any | null = {};
    public defaultOrg: string | null = null;
    public defaultUser: any = {};
}

class User {
    public id: string | null = null;
    public username: string | null = null;
}

class Org {
    public alias: string | null = null;
    public username: string | null = null;
    public orgId: string | null = null;
    public instanceUrl: string | null = null;
    public users: User[] | null = null;
}
