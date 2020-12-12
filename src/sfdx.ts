import * as cp from "child_process";
import { downloadAndUnzipVSCode } from "vscode-test";
import * as apexlog from "./apexlog";
import * as vscode from "vscode";

export function command(command: string, args: string[]) {
    return new Promise((resolve, reject) => {
        args.unshift(command);
        args.push("--json");
        let ls = cp.spawn("sfdx", args, {
            cwd: apexlog.config.getWorkspaceFolder(),
        });
        ls.stdout.on("data", function (data) {
            let response: any;
            try {
                response = JSON.parse(data.toString());
            } catch (e) {
                reject(e.message);
            }
            if (response.status === 0) {
                resolve(response);
            } else {
                reject(response);
            }
        });
    });
}
