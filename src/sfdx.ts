import * as cp from "child_process";
import { downloadAndUnzipVSCode } from "vscode-test";
import * as apexlog from "./apexlog";
import * as vscode from "vscode";
import { lstat } from "fs";

export function command(command: string, args: string[], json = true) {
    return new Promise((resolve, reject) => {
        args.unshift(command);
        if (json) args.push("--json");
        let ls = cp.spawn("sfdx", args, {
            cwd: apexlog.config.getWorkspaceFolder(),
        });
        let raw: any = "";
        ls.stdout.on("data", function (data) {
            raw += data;
        });
        ls.stdout.on("close", () => {
            let response = raw;
            try {
                if (json) {
                    response = JSON.parse(raw.toString());
                } else {
                    response = raw.toString();
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
