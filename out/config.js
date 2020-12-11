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
exports.ExtensionConfig = exports.getWorkspaceFolder = exports.getPath = exports.setup = exports.save = exports.get = exports.CONFIG_NAME = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const cp = require("child_process");
exports.CONFIG_NAME = "config.json";
function get(context) {
    const configPath = path.join(context.extensionPath, exports.CONFIG_NAME);
    let config = new ExtensionConfig();
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(config));
        return config;
    }
    const savedConfig = fs.readFileSync(configPath);
    config = Object.assign(config, JSON.parse(savedConfig.toString()));
    return config;
}
exports.get = get;
function save(newConfig, context) {
    const configPath = path.join(context.extensionPath, exports.CONFIG_NAME);
    let config = new ExtensionConfig();
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(config));
        return config;
    }
    config = Object.assign(config, newConfig);
    fs.writeFileSync(configPath, JSON.stringify(config));
}
exports.save = save;
function setup(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = get(context);
        const defaultOrg = getDefaultOrg();
        if (!config.orgs ||
            !config.defaultOrg ||
            !config.orgs[defaultOrg] ||
            config.defaultOrg !== defaultOrg) {
            //todo: stop debugging
            config.defaultOrg = defaultOrg;
            yield updateOrgs(config, context);
            config.defaultUser.username = config.orgs[getDefaultOrg()].username;
            yield getUserId(config, context);
            save(config, context);
        }
        fs.watchFile(path.join(getWorkspaceFolder(), ".sfdx", "sfdx-config.json"), () => {
            setup(context);
        });
    });
}
exports.setup = setup;
function getPath(context) {
    return path.join(context.extensionPath, exports.CONFIG_NAME);
}
exports.getPath = getPath;
function getWorkspaceFolder() {
    let folder = "";
    if (typeof vscode.workspace.workspaceFolders !== "undefined") {
        folder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    return folder;
}
exports.getWorkspaceFolder = getWorkspaceFolder;
function updateOrgs(config, context) {
    return new Promise((resolve) => {
        let ls = cp.spawn("sfdx", ["auth:list", "--json"], {
            cwd: getWorkspaceFolder(),
        });
        ls.stdout.on("data", function (data) {
            console.log("response", data);
            const response = JSON.parse(data.toString());
            const orgs = response.result;
            orgs.forEach((org) => {
                config.orgs[org.alias] = org;
            });
            resolve();
        });
    });
}
function getUserId(config, context) {
    return new Promise((resolve) => {
        const query = "SELECT Id FROM User WHERE Username = '" + config.defaultUser.username + "'";
        let ls = cp.spawn("sfdx", ["force:data:soql:query", "--query", query, "--json"], {
            cwd: getWorkspaceFolder(),
        });
        ls.stdout.on("data", function (data) {
            var _a;
            console.log("response", data);
            const response = JSON.parse(data.toString());
            config.defaultUser.id = (_a = response.result.records[0]) === null || _a === void 0 ? void 0 : _a.Id;
            resolve();
        });
    });
}
function getDefaultOrg() {
    const sfdxConfigJson = fs.readFileSync(path.join(getWorkspaceFolder(), ".sfdx", "sfdx-config.json"));
    const sfdxConfig = JSON.parse(sfdxConfigJson.toString());
    return sfdxConfig.defaultusername;
}
class ExtensionConfig {
    constructor() {
        this.refreshIntervalSeconds = 3;
        this.maxTimeMin = 60;
        this.traceFlagId = null;
        this.endTime = null;
        this.apex = "FINEST";
        this.profiling = "FINEST";
        this.callout = "FINEST";
        this.database = "FINEST";
        this.system = "FINEST";
        this.validation = "FINEST";
        this.visualforce = "FINEST";
        this.workflow = "FINEST";
        this.orgs = {};
        this.defaultOrg = null;
        this.defaultUser = {};
    }
}
exports.ExtensionConfig = ExtensionConfig;
class User {
    constructor() {
        this.id = null;
        this.username = null;
    }
}
class Org {
    constructor() {
        this.alias = null;
        this.username = null;
        this.orgId = null;
        this.instanceUrl = null;
        this.users = null;
    }
}
//# sourceMappingURL=config.js.map