"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runProfiler = void 0;
const worker_threads_1 = require("worker_threads");
function runProfiler(uri) {
    return new Promise((resolve) => {
        const parser = new worker_threads_1.Worker(__dirname + "/job.js", { workerData: uri });
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
exports.runProfiler = runProfiler;
//# sourceMappingURL=index.js.map