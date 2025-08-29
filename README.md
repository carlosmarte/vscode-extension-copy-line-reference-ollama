# Copy Line Reference

A Visual Studio Code extension that copies file paths with line numbers in GitHub-style format. Works with both selected text and cursor position.

## Features

### Copy Path with Line Numbers
Copy file path with line numbers for selected text or cursor position

### Smart Cursor Handling
When no text is selected:
- Copies path with cursor line number (e.g., `src/main.ts#L10`)
- On empty lines, copies just the file path without line number

### Copy Path with Code
Copy both the file path reference and the code content

### Relative or Absolute Paths
Configure whether to use relative paths (from workspace root) or absolute paths

### Multi-line Selection Support
Automatically formats single line (`#L10`) or range (`#L10-15`) references

### Multiple Copy Options
- Copy path with line numbers (GitHub-style format)
- Copy path with code content
- Copy absolute path of the file
- Copy just the file name
- Copy relative file path with line numbers
- Copy relative file path without line numbers
- Copy path relative to the workspace

## Usage

### With Text Selection

Select code in the editor and use one of the following methods:

### Without Text Selection (Cursor Position)

Place your cursor on any line and use the same shortcuts/commands to copy the current line reference.
On empty lines, only the file path will be copied.

### Keyboard Shortcuts

- **Copy Path**: `Cmd+Alt+C` (Mac) / `Ctrl+Alt+C` (Windows/Linux)
- **Copy Path with Code**: `Cmd+Alt+Shift+C` (Mac) / `Ctrl+Alt+Shift+C` (Windows/Linux)

### Command Palette

Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) and search for:

- **Copy Line Reference: Copy Path** - Copies path with line numbers
- **Copy Line Reference: Copy Path with Code** - Copies path and selected code
- **Copy Line Reference: Copy Absolute Path** - Copies absolute file path
- **Copy Line Reference: Copy Filename** - Copies just the filename
- **Copy Line Reference: Copy Relative Path** - Copies relative path without line numbers
- **Copy Line Reference: Copy Workspace Relative Path** - Copies workspace-relative path with line numbers

### Context Menu

Right-click on selected text and choose from the copy options in the context menu.

## Example Output

### Copy Path (with selection):
```
src/components/Header.tsx#L25-30
```

### Copy Path (cursor on line 25, no selection):
```
src/components/Header.tsx#L25
```

### Copy Path (cursor on empty line):
```
src/components/Header.tsx
```

### Copy Path with Code:
```
src/components/Header.tsx#L25-30

```jsx
export const Header: React.FC = () => {
  return (
    <header className="main-header">
      <h1>Welcome</h1>
    </header>
  );
};
```

## Installation

### From VSCode Marketplace
1. Open VSCode
2. Go to Extensions view (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Search for "Copy Line Reference"
4. Click Install

### From VSIX Package
1. Download the `.vsix` file from releases
2. Open VSCode
3. Go to Extensions view (`Cmd+Shift+X` / `Ctrl+Shift+X`)
4. Click the "..." menu → "Install from VSIX..."
5. Select the downloaded `.vsix` file

### Manual Installation
```bash
code --install-extension copy-line-reference-0.0.1.vsix
```

## Extension Settings

This extension contributes the following settings:

- `copy-line-reference.pathType`: Choose between path types
  - `"relative"` (default): Use relative paths from workspace root
  - `"absolute"`: Use absolute file path

## Development

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- VSCode

### Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Commands

- **Compile**: `npm run compile`
- **Watch**: `npm run watch` (automatically recompiles on changes)
- **Lint**: `npm run lint`
- **Test**: `npm test`

### Running the Extension

1. Open the project in VSCode
2. Press `F5` to start debugging
3. A new VSCode window will open with your extension loaded
4. Try the keyboard shortcuts or right-click context menu options

### Testing

Run the test suite:

```bash
npm test
```

### Building for Production

To create a VSIX package for distribution:

```bash
./scripts/package.sh
```

Or manually:

```bash
npm install -g @vscode/vsce
vsce package
```

## Project Structure

```
copy-line-reference/
├── src/                    # Source code
│   ├── extension.ts       # Main extension entry point
│   └── test/              # Test files
│       ├── runTest.ts     # Test runner
│       └── suite/         # Test suites
├── demo/                   # Demo files for testing
├── scripts/                # Build and development scripts
├── package.json           # Extension manifest
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

MIT
