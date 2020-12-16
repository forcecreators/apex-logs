import { ProfileService } from "./service";
import { debug } from "console";
const { workerData, parentPort } = require("worker_threads");

parentPort.postMessage("starting job with " + workerData);

new ProfileService(workerData, {})
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
    .then((metadata: object) => {
        parentPort.postMessage({
            event: "finish",
            value: JSON.parse(JSON.stringify(metadata)),
        });
    });
