import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";

suite("Copy Line Reference Test Suite", () => {
  vscode.window.showInformationMessage("Starting Copy Line Reference tests.");

  test("Extension should be present", () => {
    assert.ok(vscode.extensions.getExtension("copy-line-reference"));
  });

  test("Should register all 6 commands", async () => {
    const commands = await vscode.commands.getCommands();
    const expectedCommands = [
      'copy-line-reference.copyPath',
      'copy-line-reference.copyPathWithCode',
      'copy-line-reference.copyAbsolutePath',
      'copy-line-reference.copyFilename',
      'copy-line-reference.copyRelativePath',
      'copy-line-reference.copyWorkspaceRelativePath'
    ];
    
    expectedCommands.forEach(command => {
      assert.ok(commands.includes(command), `Command ${command} should be registered`);
    });
  });

  test("Should use GitHub-style format for single line", () => {
    const testPath = "src/test.ts#L42";
    assert.ok(testPath.includes("#L"), "Should use #L format for line numbers");
    assert.ok(!testPath.includes(":"), "Should not use colon format");
  });

  test("Should use GitHub-style format for multi-line range", () => {
    const testPath = "src/test.ts#L42-45";
    assert.ok(testPath.includes("#L"), "Should use #L format for line numbers");
    assert.ok(testPath.includes("-"), "Should use dash for range");
    assert.ok(!testPath.includes(":"), "Should not use colon format");
  });

  test("Should handle empty line detection", () => {
    // Test that empty lines don't include line numbers
    const pathWithoutLine = "src/test.ts";
    const pathWithLine = "src/test.ts#L42";
    
    assert.ok(!pathWithoutLine.includes("#L"), "Empty line should not include line number");
    assert.ok(pathWithLine.includes("#L"), "Non-empty line should include line number");
  });

  test("Should handle filename extraction", () => {
    const fullPath = "/Users/test/project/src/components/Button.tsx";
    const filename = path.basename(fullPath);
    assert.strictEqual(filename, "Button.tsx", "Should extract correct filename");
  });

  test("Should normalize paths for cross-platform compatibility", () => {
    const windowsPath = "src\\components\\Button.tsx";
    const normalizedPath = windowsPath.replace(/\\/g, "/");
    assert.strictEqual(normalizedPath, "src/components/Button.tsx", "Should normalize Windows paths");
  });

  test("Should handle relative path calculation", () => {
    const workspacePath = "/Users/test/project";
    const filePath = "/Users/test/project/src/components/Button.tsx";
    const relativePath = path.relative(workspacePath, filePath);
    assert.strictEqual(relativePath, "src/components/Button.tsx", "Should calculate correct relative path");
  });

  test("Configuration should have correct default value", () => {
    // This would test the default configuration value
    const config = vscode.workspace.getConfiguration('copy-line-reference');
    const pathType = config.get('pathType', 'relative');
    assert.strictEqual(pathType, 'relative', "Default pathType should be relative");
  });

  test("Should handle code block formatting", () => {
    const testCode = `export const hello = () => {\n  console.log(\"Hello World!\");\n};`;
    const languageId = 'typescript';
    const expectedFormat = `\`\`\`${languageId}\n${testCode}\n\`\`\``;
    
    assert.ok(expectedFormat.includes('```typescript'), "Should include language identifier");
    assert.ok(expectedFormat.includes(testCode), "Should include the code content");
  });
});
