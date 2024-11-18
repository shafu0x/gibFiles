import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class FileTreeDataProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | void> = new vscode.EventEmitter<FileItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | void> = this._onDidChangeTreeData.event;

  private workspaceRoot: string | undefined;
  private selectedFiles: Set<string> = new Set();

  constructor() {
    if (vscode.workspace.workspaceFolders) {
      this.workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FileItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FileItem): Thenable<FileItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No workspace found');
      return Promise.resolve([]);
    }

    const dirPath = element && element.resourceUri ? element.resourceUri.fsPath : this.workspaceRoot;
    return Promise.resolve(this.getFilesAndDirs(dirPath));
  }

  private getFilesAndDirs(dirPath: string): FileItem[] {
    const items = fs.readdirSync(dirPath);
    return items.map((item) => {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);
        const isDirectory = stats.isDirectory();

        const fileItem = new FileItem(
            item,
            isDirectory
                ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None,
            fullPath,
            isDirectory
        );

        // Set an icon to simulate a checkbox
        const isSelected = this.selectedFiles.has(fullPath);
        fileItem.iconPath = isSelected
            ? new vscode.ThemeIcon('check') // Checked icon
            : new vscode.ThemeIcon('circle-outline'); // Unchecked icon

        // Attach a command to handle selection toggling
        fileItem.command = {
            command: 'fileSelector.toggleSelection',
            title: '',
            arguments: [fileItem],
        };

        return fileItem;
    });
}

public toggleSelection(fileItem: FileItem) {
    const fullPath = fileItem.resourceUri?.fsPath;
    if (!fullPath) {
        return;
    }

    if (this.selectedFiles.has(fullPath)) {
        // Remove from selected files if already selected
        this.selectedFiles.delete(fullPath);
    } else {
        // Add to selected files if not selected
        this.selectedFiles.add(fullPath);
    }

    // Refresh the tree view to update icons
    this.refresh();
}


  public getSelectedFiles(): string[] {
    return Array.from(this.selectedFiles);
  }
}

class FileItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly fullPath: string,
    public readonly isDirectory: boolean
  ) {
    super(label, collapsibleState);
    this.resourceUri = vscode.Uri.file(fullPath);
  }
}
