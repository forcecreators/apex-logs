# Apex Log Profiler & Analyzer

Quickly profile and analyze Salesforce logs with Apex Logs. Apex Logs offers developers the ability to easily visualize their codes execution and see meaningful
information about the transaction. Developers can utilize the interactive stack trace to see why trasactions are running slow, or visualize their codes
limits consumption.
![Apex Logs](https://raw.githubusercontent.com/forcecreators/apex-logs/master/ui/media/ApexLogs.gif)

## Features

-   Start a logging session with a single click
-   See available logs directly in VSCode
-   Visualize and interact with your codes stack tace to easily find bottlenecks
-   Visualize your codes limits consumption with easy to read graphs.

## Release Notes

### 0.1.4

Bug Fix: Process builders show up under the "other" tab in "executed units" #20

Bug Fix: Improve error handling for SFDX commands #14

Bug Fix: Prevent blank screens when loading. Log Editor Provider to show information about profiling progress #23

Bug Fix: Check for active trace flags when the extension starts #16

### 0.1.3

Bug Fix: The `FLOW_START_INTERVIEW_LIMIT_USAGE` may break the apex log profiler. Profiler will work regardless of `WORKFLOW` log levels.

### 0.1.2

Bug Fix: Extension will not start debugging if user changes their workspace default org.

### 0.1.0

Initial Release
