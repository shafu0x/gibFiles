import * as vscode from 'vscode';
import * as path from 'path';

export class FileTreeDataProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | void> =
    new vscode.EventEmitter<FileItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | void> =
    this._onDidChangeTreeData.event;

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

    const dirPath = element ? element.resourceUri.fsPath : this.workspaceRoot;
    return this.getFilesAndDirs(dirPath);
  }

  private async getFilesAndDirs(dirPath: string): Promise<FileItem[]> {
    const uri = vscode.Uri.file(dirPath);
    const entries = await vscode.workspace.fs.readDirectory(uri);

    return entries.map(([name, type]) => {
      const fullPath = path.join(dirPath, name);
      const isDirectory = type === vscode.FileType.Directory;

      const fileItem = new FileItem(
        name,
        isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
        fullPath,
        isDirectory
      );

      // Set an icon to simulate a checkbox
      const isSelected = this.selectedFiles.has(fullPath);
      fileItem.iconPath = isSelected
        ? new vscode.ThemeIcon('check') // Checked icon
        : new vscode.ThemeIcon('circle-outline'); // Unchecked icon

      // Attach the toggleSelection command to both files and directories
      fileItem.command = {
        command: 'fileSelector.toggleSelection',
        title: '',
        arguments: [fileItem],
      };

      return fileItem;
    });
  }

  public async toggleSelection(fileItem: FileItem) {
    const fullPath = fileItem.resourceUri.fsPath;
    const uri = vscode.Uri.file(fullPath);
    const stat = await vscode.workspace.fs.stat(uri);

    if (stat.type === vscode.FileType.Directory) {
      if (this.selectedFiles.has(fullPath)) {
        // Deselect directory and its contents
        this.selectedFiles.delete(fullPath);
        await this.deselectAllInDirectory(uri);
      } else {
        // Select directory and its contents
        this.selectedFiles.add(fullPath);
        await this.selectAllInDirectory(uri);
      }
    } else if (stat.type === vscode.FileType.File) {
      // Toggle selection for files
      if (this.selectedFiles.has(fullPath)) {
        this.selectedFiles.delete(fullPath);
      } else {
        this.selectedFiles.add(fullPath);
      }
    }
    // Refresh the tree view to update icons
    this.refresh();
  }

  private async selectAllInDirectory(uri: vscode.Uri) {
    const entries = await vscode.workspace.fs.readDirectory(uri);
    for (const [name, type] of entries) {
      const childUri = vscode.Uri.joinPath(uri, name);
      const childPath = childUri.fsPath;

      if (type === vscode.FileType.Directory) {
        this.selectedFiles.add(childPath);
        await this.selectAllInDirectory(childUri);
      } else if (type === vscode.FileType.File) {
        this.selectedFiles.add(childPath);
      }
      // Ignore other types
    }
  }

  private async deselectAllInDirectory(uri: vscode.Uri) {
    const entries = await vscode.workspace.fs.readDirectory(uri);
    for (const [name, type] of entries) {
      const childUri = vscode.Uri.joinPath(uri, name);
      const childPath = childUri.fsPath;

      if (type === vscode.FileType.Directory) {
        this.selectedFiles.delete(childPath);
        await this.deselectAllInDirectory(childUri);
      } else if (type === vscode.FileType.File) {
        this.selectedFiles.delete(childPath);
      }
      // Ignore other types
    }
  }

  public async getSelectedFiles(): Promise<string[]> {
    const files: string[] = [];

    for (const selectedPath of this.selectedFiles) {
      const uri = vscode.Uri.file(selectedPath);
      const stat = await vscode.workspace.fs.stat(uri);

      if (stat.type === vscode.FileType.Directory) {
        const dirFiles = await this.getFilesInDirectory(uri);
        files.push(...dirFiles);
      } else if (stat.type === vscode.FileType.File) {
        files.push(selectedPath);
      }
      // Ignore other types
    }

    return files;
  }

  private async getFilesInDirectory(uri: vscode.Uri): Promise<string[]> {
    let files: string[] = [];
    const entries = await vscode.workspace.fs.readDirectory(uri);

    for (const [name, type] of entries) {
      const childUri = vscode.Uri.joinPath(uri, name);

      if (type === vscode.FileType.Directory) {
        const subDirFiles = await this.getFilesInDirectory(childUri);
        files.push(...subDirFiles);
      } else if (type === vscode.FileType.File) {
        files.push(childUri.fsPath);
      }
      // Ignore other types
    }
    return files;
  }
}

class FileItem extends vscode.TreeItem {
  public resourceUri: vscode.Uri;

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
