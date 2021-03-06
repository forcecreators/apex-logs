# Change Log

All notable changes to the "apex-logs" extension will be documented in this file.

### 0.2.4

Announcement: Log Explorer will be moving to its own extension on 2/6/21. Log Explorer will be removed from Apex Logs starting 2/12/21. For more information see https://github.com/forcecreators/apex-logs/issues/41

Work Around: In issue 41 we discuss a bug where some users extension may not load correctly. Users affected by this bug can navigate to the VSCode settings, search for "bypass log explorer", and set it to `true` to avoid this problem.

### 0.2.3

Note: Extension out of preview!

Feature: See profiling results in VSCodes "Problems" panel when opening logs. Developers can set customizable thresholds for alerts.

Feature: Kick off the Apex Replay Debugger directly from Apex Logs

Feature: Delete all logs in an org.

Enhancement: Decreased the size of elements in visual stack trace.

Bug Fix: Editor shows multiple active items when clicking a limits tab.

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
