# Apex Log Profiler & Analyzer

Salesforce performance profiling directly in VSCode. Quickly and easily identify performance bottlenecks or address runaway limits consumption. Visual stack traces make it easy to find exactly where and why transactions
![Apex Logs](https://raw.githubusercontent.com/forcecreators/apex-logs/master/ui/media/ApexLogs.gif)

## Features

-   Get profiling alerts directly in the VSCode "Problems" panel.
    -   Limits consumption alerts
    -   Long running query alerts
    -   Trigger recursion alerts
    -   Long running method alerts
-   Traverse your logs visually with the visual stack trace to quickly find performance bottlenecks.
-   Use the Executed Units tab to visualize your logs executed units quantitatively.
-   See your limits consumption over time with graphs. Supports most limits.
-   Start logging sessions quickly with a single click.
-   Set logging levels directly from the UI
-   Browse server logs directly from VSCode
-   Delete server logs with a single click

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
