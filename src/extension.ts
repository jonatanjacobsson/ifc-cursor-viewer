import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	console.log('IFC Viewer extension is active');

	context.subscriptions.push(IFCEditorProvider.register(context));
}

class IFCEditorProvider implements vscode.CustomReadonlyEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new IFCEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(IFCEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'ifc-vscode-viewer.ifcEditor';

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

	async openCustomDocument(
		uri: vscode.Uri,
		openContext: vscode.CustomDocumentOpenContext,
		token: vscode.CancellationToken
	): Promise<vscode.CustomDocument> {
		return { uri, dispose: () => { } };
	}

	async resolveCustomEditor(
		document: vscode.CustomDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		webviewPanel.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.file(path.join(this.context.extensionPath, 'dist')),
				vscode.Uri.file(path.dirname(document.uri.fsPath)) // Allow access to the file's directory
			]
		};

		const scriptPathOnDisk = vscode.Uri.file(
			path.join(this.context.extensionPath, 'dist', 'viewer.js')
		);
		const scriptUri = webviewPanel.webview.asWebviewUri(scriptPathOnDisk);

		// Convert WASM directory to webview URI
		const wasmDirOnDisk = vscode.Uri.file(
			path.join(this.context.extensionPath, 'dist')
		);
		const wasmDirUri = webviewPanel.webview.asWebviewUri(wasmDirOnDisk);

		// Convert document URI to webview URI so we can fetch it
		const fileUri = webviewPanel.webview.asWebviewUri(document.uri);

		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, scriptUri, fileUri, wasmDirUri);
	}

	private getHtmlForWebview(webview: vscode.Webview, scriptUri: vscode.Uri, fileUri: vscode.Uri, wasmDirUri: vscode.Uri): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' ${webview.cspSource} blob:; connect-src ${webview.cspSource} blob: data:; img-src ${webview.cspSource} blob: data:;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IFC Viewer</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            overflow: hidden; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        #app { 
            width: 100vw; 
            height: 100vh; 
            display: grid;
            grid-template-columns: 300px 1fr;
            background: #1a1a1a;
        }
        #sidebar-container {
            background: #252525;
            border-right: 1px solid #333;
            overflow-y: auto;
        }
        #viewer-container {
            position: relative;
            overflow: hidden;
        }
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #1a1a1a;
        }
        ::-webkit-scrollbar-thumb {
            background: #444;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    </style>
</head>
<body>
    <div id="app">
        <div id="sidebar-container"></div>
        <div id="viewer-container"></div>
    </div>
    <script>
        window.modelUri = "${fileUri.toString()}";
        window.wasmPath = "${wasmDirUri.toString()}";
    </script>
    <script src="${scriptUri}"></script>
</body>
</html>`;
	}
}

export function deactivate() { }
