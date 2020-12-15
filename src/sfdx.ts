import * as cp from "child_process";
import { downloadAndUnzipVSCode } from "vscode-test";
import * as apexlog from "./apexlog";
import * as vscode from "vscode";

export function command(command: string, args: string[], json = true) {
    return new Promise((resolve, reject) => {
        args.unshift(command);
        if (json) args.push("--json");
        let ls = cp.spawn("sfdx", args, {
            cwd: apexlog.config.getWorkspaceFolder(),
        });
        ls.stdout.on("data", function (data) {
            let response: any;
            try {
                if (json) {
                    response = JSON.parse(data.toString());
                } else {
                    response = data.toString();
                    resolve(response);
                }
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
