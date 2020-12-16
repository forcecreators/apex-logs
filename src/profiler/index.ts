import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { Worker } from "worker_threads";

export function runProfiler(uri: string, config: any) {
    return new Promise((resolve) => {
        const data = {
            uri: uri,
            config: config,
        };
        const parser = new Worker(__dirname + "/job.js", { workerData: data });
        parser.on("message", (message) => {
            switch (message.event) {
                case "progress":
                    //progress.report({message:'profiling...', increment:message.value});
                    break;
                case "finish":
                    resolve(message.value);
                    break;
                case "debug":
                    console.log(message.value);
                    break;
                default:
            }
        });
    });
}
