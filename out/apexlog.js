"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = exports.sfdx = exports.ui = exports.config = exports.profiler = exports.models = exports.explorer = exports.editor = void 0;
const vscode = require("vscode");
const _editor = require("./editor");
const _explorer = require("./explorer");
const _models = require("./models");
const _profiler = require("./profiler");
const _config = require("./config");
const _ui = require("./ui");
const _sfdx = require("./sfdx");
exports.editor = _editor;
exports.explorer = _explorer;
exports.models = _models;
exports.profiler = _profiler;
exports.config = _config;
exports.ui = _ui;
exports.sfdx = _sfdx;
function registerCommands(context) {
    context.subscriptions.push(vscode.commands.registerCommand("forcecreators.apexlogs.explorer.openlog", (item) => {
        console.log(item.label);
        exports.explorer.downloadLog(item.id, context);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("forcecreators.apexlogs.explorer.startlogging", () => exports.explorer.startLogging(context)));
}
exports.registerCommands = registerCommands;
//# sourceMappingURL=apexlog.js.map