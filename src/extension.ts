import * as vscode from "vscode";
import * as path from "path";
import * as http from "http";
import * as https from "https";

export function activate(context: vscode.ExtensionContext) {
  console.log('Copy Line Reference extension is now active!');

  // Register all commands
  const commands = [
    vscode.commands.registerCommand('copy-line-reference.copyPath', () => copyPath()),
    vscode.commands.registerCommand('copy-line-reference.copyPathWithCode', () => copyPathWithCode()),
    vscode.commands.registerCommand('copy-line-reference.copyAbsolutePath', () => copyAbsolutePath()),
    vscode.commands.registerCommand('copy-line-reference.copyFilename', () => copyFilename()),
    vscode.commands.registerCommand('copy-line-reference.copyRelativePath', () => copyRelativePath()),
    vscode.commands.registerCommand('copy-line-reference.copyWorkspaceRelativePath', () => copyWorkspaceRelativePath()),
    vscode.commands.registerCommand('copy-line-reference.copyPathWithAISummary', () => copyPathWithAISummary())
  ];

  context.subscriptions.push(...commands);
}

// Helper function to get the active editor
function getActiveEditor(): vscode.TextEditor | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor found');
    return null;
  }
  return editor;
}

// Helper function to get workspace folder
function getWorkspaceFolder(document: vscode.TextDocument): vscode.WorkspaceFolder | null {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder found');
    return null;
  }
  return workspaceFolder;
}

// Helper function to get configuration
function getPathType(): 'relative' | 'absolute' {
  const config = vscode.workspace.getConfiguration('copy-line-reference');
  return config.get('pathType', 'relative');
}

// Helper function to normalize path for cross-platform compatibility
function normalizePath(pathStr: string): string {
  return pathStr.replace(/\\/g, '/');
}

// Helper function to check if a line is empty or whitespace only
function isEmptyLine(document: vscode.TextDocument, lineNumber: number): boolean {
  const line = document.lineAt(lineNumber);
  return line.text.trim().length === 0;
}

// Helper function to format line numbers in GitHub style
function formatLineNumbers(startLine: number, endLine: number, includeEmpty: boolean = true): string {
  if (!includeEmpty) {
    return '';
  }
  if (startLine === endLine) {
    return `#L${startLine}`;
  } else {
    return `#L${startLine}-${endLine}`;
  }
}

// Helper function to copy text to clipboard
async function copyToClipboard(text: string, description: string = ''): Promise<void> {
  try {
    await vscode.env.clipboard.writeText(text);
    const message = description ? `Copied ${description}: ${text}` : `Copied: ${text}`;
    vscode.window.showInformationMessage(message);
  } catch (error: unknown) {
    vscode.window.showErrorMessage(`Failed to copy to clipboard: ${error}`);
  }
}

// Ollama configuration helper functions
function getOllamaConfig() {
  const config = vscode.workspace.getConfiguration('copy-line-reference');
  return {
    endpoint: config.get('ollamaEndpoint', 'http://localhost:11434'),
    model: config.get('ollamaModel', 'deepseek-r1:8b'),
    timeout: config.get('aiSummaryTimeout', 30000),
    enabled: config.get('aiSummaryEnabled', true),
    systemPrompt: config.get('defaultSystemPrompt', '')
  };
}

// HTTP request helper for Ollama API
function makeHttpRequest(url: string, options: any, data?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestModule = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = requestModule.request(url, options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

// Get available Ollama models
async function getOllamaModels(endpoint: string, timeout: number): Promise<string[]> {
  try {
    const response = await makeHttpRequest(`${endpoint}/api/tags`, {
      method: 'GET',
      timeout: timeout
    });
    
    const data = JSON.parse(response);
    return data.models ? data.models.map((model: any) => model.name) : [];
  } catch (error) {
    console.error('Failed to get Ollama models:', error);
    return [];
  }
}

// Summarize text using Ollama
async function summarizeWithOllama(text: string, model: string, endpoint: string, timeout: number, systemPrompt: string = ''): Promise<string> {
  const basePrompt = `Please provide a brief, technical summary (1-2 sentences) of this code snippet. Focus on what it does, not how it works:\n\n${text}`;
  
  // Prepend system prompt if provided
  const finalPrompt = systemPrompt.trim() 
    ? `${systemPrompt.trim()}\n\n${basePrompt}`
    : basePrompt;
  
  const payload = JSON.stringify({
    model: model,
    prompt: finalPrompt,
    stream: false,
    options: {
      temperature: 0.3,
      top_p: 0.9
    }
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    },
    timeout: timeout
  };

  try {
    const response = await makeHttpRequest(`${endpoint}/api/generate`, options, payload);
    const data = JSON.parse(response);
    
    if (data.response) {
      return data.response.trim()
        .replace(/<think>[\s\S]*?<\/think>/gi, '') // Remove thinking tags
        .replace(/\n+/g, ' ')
        .trim();
    } else {
      throw new Error('No response from Ollama');
    }
  } catch (error) {
    console.error('Failed to get AI summary:', error);
    throw error;
  }
}

// Command 1: Copy Path with Line Numbers (main command)
async function copyPath(): Promise<void> {
  const editor = getActiveEditor();
  if (!editor) {return;}

  const document = editor.document;
  const selection = editor.selection;
  const pathType = getPathType();

  let filePath: string;
  if (pathType === 'absolute') {
    filePath = normalizePath(document.uri.fsPath);
  } else {
    const workspaceFolder = getWorkspaceFolder(document);
    if (!workspaceFolder) {return;}
    const relativePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath);
    filePath = normalizePath(relativePath);
  }

  const startLine = selection.start.line + 1;
  const endLine = selection.end.line + 1;

  // Smart cursor handling: if cursor is on empty line, don't include line numbers
  const shouldIncludeLineNumbers = !selection.isEmpty || !isEmptyLine(document, selection.start.line);
  const lineNumbers = formatLineNumbers(startLine, endLine, shouldIncludeLineNumbers);
  
  const result = `${filePath}${lineNumbers}`;
  await copyToClipboard(result, 'path');
}

// Command 2: Copy Path with Code
async function copyPathWithCode(): Promise<void> {
  const editor = getActiveEditor();
  if (!editor) {return;}

  const document = editor.document;
  const selection = editor.selection;
  const pathType = getPathType();

  let filePath: string;
  if (pathType === 'absolute') {
    filePath = normalizePath(document.uri.fsPath);
  } else {
    const workspaceFolder = getWorkspaceFolder(document);
    if (!workspaceFolder) {return;}
    const relativePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath);
    filePath = normalizePath(relativePath);
  }

  const startLine = selection.start.line + 1;
  const endLine = selection.end.line + 1;
  const lineNumbers = formatLineNumbers(startLine, endLine);
  
  // Get selected text or current line if no selection
  let selectedText: string;
  if (!selection.isEmpty) {
    selectedText = document.getText(selection);
  } else {
    const currentLine = document.lineAt(selection.start.line);
    selectedText = currentLine.text;
  }

  // Determine language for code block
  const languageId = document.languageId;
  
  const result = `${filePath}${lineNumbers}\n\n\`\`\`${languageId}\n${selectedText}\n\`\`\``;
  await copyToClipboard(result, 'path with code');
}

// Command 3: Copy Absolute Path
async function copyAbsolutePath(): Promise<void> {
  const editor = getActiveEditor();
  if (!editor) {return;}

  const document = editor.document;
  const filePath = normalizePath(document.uri.fsPath);
  await copyToClipboard(filePath, 'absolute path');
}

// Command 4: Copy Filename Only
async function copyFilename(): Promise<void> {
  const editor = getActiveEditor();
  if (!editor) {return;}

  const document = editor.document;
  const filename = path.basename(document.uri.fsPath);
  await copyToClipboard(filename, 'filename');
}

// Command 5: Copy Relative Path (without line numbers)
async function copyRelativePath(): Promise<void> {
  const editor = getActiveEditor();
  if (!editor) {return;}

  const document = editor.document;
  const workspaceFolder = getWorkspaceFolder(document);
  if (!workspaceFolder) {return;}

  const relativePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath);
  const filePath = normalizePath(relativePath);
  await copyToClipboard(filePath, 'relative path');
}

// Command 6: Copy Workspace Relative Path (same as copy path but explicit)
async function copyWorkspaceRelativePath(): Promise<void> {
  const editor = getActiveEditor();
  if (!editor) {return;}

  const document = editor.document;
  const selection = editor.selection;
  const workspaceFolder = getWorkspaceFolder(document);
  if (!workspaceFolder) {return;}

  const relativePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath);
  const filePath = normalizePath(relativePath);

  const startLine = selection.start.line + 1;
  const endLine = selection.end.line + 1;
  const shouldIncludeLineNumbers = !selection.isEmpty || !isEmptyLine(document, selection.start.line);
  const lineNumbers = formatLineNumbers(startLine, endLine, shouldIncludeLineNumbers);
  
  const result = `${filePath}${lineNumbers}`;
  await copyToClipboard(result, 'workspace relative path');
}

// Command 7: Copy Path with AI Summary
async function copyPathWithAISummary(): Promise<void> {
  const editor = getActiveEditor();
  if (!editor) { return; }

  const document = editor.document;
  const selection = editor.selection;
  const ollamaConfig = getOllamaConfig();

  // Check if AI features are enabled
  if (!ollamaConfig.enabled) {
    vscode.window.showWarningMessage('AI summarization is disabled in settings');
    return;
  }

  // Get file path using the configured path type
  const pathType = getPathType();
  let filePath: string;
  if (pathType === 'absolute') {
    filePath = normalizePath(document.uri.fsPath);
  } else {
    const workspaceFolder = getWorkspaceFolder(document);
    if (!workspaceFolder) { return; }
    const relativePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath);
    filePath = normalizePath(relativePath);
  }

  // Get line numbers
  const startLine = selection.start.line + 1;
  const endLine = selection.end.line + 1;
  
  // Get selected text or current line if no selection
  let selectedText: string;
  let lineRef: string;
  
  if (!selection.isEmpty) {
    selectedText = document.getText(selection);
    lineRef = `LINE(${startLine}::${endLine})`;
  } else {
    const currentLine = document.lineAt(selection.start.line);
    selectedText = currentLine.text;
    lineRef = `LINE(${startLine})`;
  }

  // Check if there's meaningful content to summarize
  if (!selectedText.trim()) {
    vscode.window.showWarningMessage('No meaningful content selected to summarize');
    return;
  }

  // Show progress indicator
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "Generating AI summary...",
    cancellable: false
  }, async (progress) => {
    try {
      progress.report({ increment: 30, message: "Connecting to Ollama..." });
      
      // Get AI summary
      const summary = await summarizeWithOllama(
        selectedText,
        ollamaConfig.model,
        ollamaConfig.endpoint,
        ollamaConfig.timeout,
        ollamaConfig.systemPrompt
      );

      progress.report({ increment: 70, message: "Formatting result..." });

      // Format result as requested: {file-path LINE(x::y) [AI Summary]}
      const result = `{${filePath} ${lineRef} [${summary}]}`;
      
      await copyToClipboard(result, 'path with AI summary');
      
    } catch (error: any) {
      let errorMessage = 'Failed to generate AI summary';
      
      if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to Ollama server. Make sure Ollama is running on ' + ollamaConfig.endpoint;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'AI summary request timed out. Try with shorter text or increase timeout in settings.';
      } else if (error.message.includes('model')) {
        errorMessage = `Model '${ollamaConfig.model}' not found. Check your model configuration.`;
      }
      
      vscode.window.showErrorMessage(errorMessage);
      console.error('AI summary error:', error);
    }
  });
}

export function deactivate() {}
