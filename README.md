# Apex Log Profiler & Analyzer

Quickly profile and analyze Salesforce logs with Apex Logs. Apex Logs offers developers the ability to easily visualize their codes execution and see meaningful
information about the transaction. Developers can utilize the interactive stack trace to see why trasactions are running slow, or visualize their codes
limits consumption.
![GitHub Logo](https://raw.githubusercontent.com/forcecreators/apex-logs/master/ui/media/ApexLogs.gif)

## Features

-   Start a logging session with a single click
-   See available logs directly in VSCode
-   Visualize and interact with your codes stack tace to easily find bottlenecks
-   Visualize your codes limits consumption with easy to read graphs.

## Known Issues

The `FLOW_START_INTERVIEW_LIMIT_USAGE` may break the apex log profiler. Use Workflow `INFO` if log profiles fail to render.

## Release Notes

### 0.1.2

Bug Fix: Extension will not start debugging if user changes their workspace default org.

### 0.1.0

Initial Release
