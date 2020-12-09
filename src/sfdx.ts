import * as cp from "child_process";
import * as apexlog from "./apexlog";

export function command(command: string, args: string[]) {
    return new Promise((resolve, reject) => {
        args.unshift(command);
        args.push("--json");
        let ls = cp.spawn("sfdx", args, {
            cwd: apexlog.config.getWorkspaceFolder(),
        });
        ls.stdout.on("data", function (data) {
            const response = JSON.parse(data.toString());
            resolve(response);
        });
    });
}
