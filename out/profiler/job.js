"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("./service");
const { workerData, parentPort } = require("worker_threads");
parentPort.postMessage("starting job with " + workerData);
new service_1.ProfileService(workerData, {})
    .on("progress", (value) => {
    parentPort.postMessage({
        event: "progress",
        value: value,
    });
})
    .on("debug", (value) => {
    parentPort.postMessage({
        event: "debug",
        value: value,
    });
})
    .run()
    .then((metadata) => {
    parentPort.postMessage({
        event: "finish",
        value: JSON.parse(JSON.stringify(metadata)),
    });
});
//# sourceMappingURL=job.js.map