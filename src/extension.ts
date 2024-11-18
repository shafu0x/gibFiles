// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "shafupt" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('shafupt.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from shafuPT!');
	});

	context.subscriptions.push(disposable);
	
	const gibFiles = vscode.commands.registerCommand('shafupt.gibFiles', async () => {
		// Find all files in the current workspace
		const files = await vscode.workspace.findFiles('**/*');
		if (files.length > 0) {
			// Create a QuickPick for file selection with checkboxes
			const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem>();
			quickPick.items = files.map(file => ({
				label: file.fsPath,
				picked: false // Initially unchecked
			}));

			quickPick.canSelectMany = true;
			quickPick.placeholder = 'Select files from your project';

			quickPick.onDidAccept(() => {
				const selectedFiles = quickPick.selectedItems.map(item => item.label);
				if (selectedFiles.length > 0) {
					vscode.window.showInformationMessage(`Selected files:\n${selectedFiles.join('\n')}`);
				} else {
					vscode.window.showInformationMessage('No files selected.');
				}
				quickPick.hide();
			});

			quickPick.onDidHide(() => quickPick.dispose());
			quickPick.show();
		} else {
			vscode.window.showInformationMessage('No files found in the workspace.');
		}
	});

	context.subscriptions.push(gibFiles);
}

// This method is called when your extension is deactivated
export function deactivate() {}
