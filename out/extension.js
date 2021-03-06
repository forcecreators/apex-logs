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
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const apexlog = require("./apexlog");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const configuration = vscode.workspace.getConfiguration("forcecreators.apexlogs");
        if (!configuration.bypassLogExplorer) {
            yield apexlog.config.setup(context);
            apexlog.registerCommands(context);
            apexlog.explorer.remotelogs.RemoteLogsProvider.register(context);
            apexlog.explorer.controlpanel.ControlPanelProvider.register(context);
        }
        const diagnosticCollection = vscode.languages.createDiagnosticCollection("ApexLog");
        apexlog.editor.ApexLogEditorProvider.register(context, diagnosticCollection);
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map