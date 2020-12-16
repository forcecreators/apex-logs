"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const cp = require("child_process");
const apexlog = require("./apexlog");
function command(command, args, json = true) {
    return new Promise((resolve, reject) => {
        args.unshift(command);
        if (json)
            args.push("--json");
        let ls = cp.spawn("sfdx", args, {
            cwd: apexlog.config.getWorkspaceFolder(),
        });
        let raw = "";
        ls.stdout.on("data", function (data) {
            raw += data;
        });
        ls.stdout.on("close", () => {
            let response = raw;
            try {
                if (json) {
                    response = JSON.parse(raw.toString());
                }
                else {
                    response = raw.toString();
                    resolve(response);
                }
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