import * as vscode from 'vscode';
import { FileTreeDataProvider } from './fileTreeDataProvider'; // Adjust the import path as needed

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "shafupt" is now active!');

  const disposable = vscode.commands.registerCommand('shafupt.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from shafuPT!');
  });

  context.subscriptions.push(disposable);

  const fileTreeDataProvider = new FileTreeDataProvider();
  vscode.window.registerTreeDataProvider('fileSelector', fileTreeDataProvider);

  vscode.commands.registerCommand('fileSelector.toggleSelection', (item) => {
    fileTreeDataProvider.toggleSelection(item);
  });

  const getSelectedFiles = vscode.commands.registerCommand('shafupt.gibFiles', () => {
    const selectedFiles = fileTreeDataProvider.getSelectedFiles();
    if (selectedFiles.length > 0) {
      vscode.window.showInformationMessage(`Selected files:\n${selectedFiles.join('\n')}`);
    } else {
      vscode.window.showInformationMessage('No files selected.');
    }
  });

  context.subscriptions.push(getSelectedFiles);
}

export function deactivate() {}