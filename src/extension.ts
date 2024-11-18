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

  const getSelectedFiles = vscode.commands.registerCommand('shafupt.gibFiles', async () => {
    const selectedFiles = fileTreeDataProvider.getSelectedFiles();
    if (selectedFiles.length > 0) {
      try {
        // Read contents of selected files
        const fileContentsPromises = selectedFiles.map(async (filePath) => {
          const uri = vscode.Uri.file(filePath);
          const fileData = await vscode.workspace.fs.readFile(uri);
          const fileContent = new TextDecoder('utf-8').decode(fileData);
          return fileContent;
        });

        // Wait for all file contents to be read
        const fileContentsArray = await Promise.all(fileContentsPromises);

        // Concatenate the contents
        const concatenatedContents = fileContentsArray.join('\n');

        // Copy the concatenated text to the clipboard
        await vscode.env.clipboard.writeText(concatenatedContents);

        // Inform the user
        vscode.window.showInformationMessage('Selected files\' content copied to clipboard.');
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error copying file contents: ${error.message}`);
      }
    } else {
      vscode.window.showInformationMessage('No files selected.');
    }
  });

  context.subscriptions.push(getSelectedFiles);
}

export function deactivate() {}
