"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebviewContent = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
function getWebviewContent(name, webview, context) {
    const visTimelineCss = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "ui/common/css", "vis-timeline-graph2d.min.css")));
    const bootstrapCss = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "ui/common/css", "bootstrap.min.css")));
    const jquery = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "ui/common/js", "jquery.min.js")));
    const bootstrap = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "ui/common/js", "bootstrap.bundle.min.js")));
    const moment = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "ui/common/js", "moment.js")));
    const visTimeline = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "ui/common/js", "vis-timeline-graph2d.min.js")));
    const vis = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "ui/common/js", "vis.js")));
    const codemirrorJs = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "ui/common/js/codemirror/lib", "codemirror.js")));
    const codemirrorCss = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "ui/common/js/codemirror/lib", "codemirror.css")));
    const codeMirrorMode = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "ui/common/js/codemirror/mode/javascript", "javascript.js")));
    const htmlBody = fs.readFileSync(path.join(context.extensionPath, "ui", name, "body.html"), "utf8");
    const jsBody = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "ui", name, "body.js")));
    const cssBody = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "ui", name, "body.css")));
    return `
		<!DOCTYPE HTML>
		<html>
		<head>
			<link href="${visTimelineCss}" rel="stylesheet" type="text/css" />
			<link href="${bootstrapCss}" rel="stylesheet" type="text/css" />
			<link href="${codemirrorCss}" rel="stylesheet" type="text/css" />
			<link href="${cssBody}" rel="stylesheet" type="text/css" />
		</head>
		
		<body>
			${htmlBody}
			<script src="${jquery}"></script>
			<script src="${bootstrap}"></script>
			<script src="${moment}"></script>
			<script src="${visTimeline}"></script>
			<script src="${codemirrorJs}"></script>
			<script src="${jsBody}"></script>
		</body>
		</html>
		`;
}
exports.getWebviewContent = getWebviewContent;
//# sourceMappingURL=ui.js.map