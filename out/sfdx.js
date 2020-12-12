"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const cp = require("child_process");
const apexlog = require("./apexlog");
function command(command, args) {
    return new Promise((resolve, reject) => {
        args.unshift(command);
        args.push("--json");
        let ls = cp.spawn("sfdx", args, {
            cwd: apexlog.config.getWorkspaceFolder(),
        });
        ls.stdout.on("data", function (data) {
            let response;
            try {
                response = JSON.parse(data.toString());
            }
            catch (e) {
                reject(e.message);
            }
            if (response.status === 0) {
                resolve(response);
            }
            else {
                reject(response);
            }
        });
    });
}
exports.command = command;
//# sourceMappingURL=sfdx.js.map