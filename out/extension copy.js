"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const apexlog = require("./apexlog");
function activate(context) {
    apexlog.editor.ApexLogEditorProvider.register(context);
    apexlog.config.setup(context);
    apexlog.registerCommands(context);
    apexlog.explorer.remotelogs.RemoteLogsProvider.register(context);
    apexlog.explorer.controlpanel.ControlPanelProvider.register(context);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension%20copy.js.map