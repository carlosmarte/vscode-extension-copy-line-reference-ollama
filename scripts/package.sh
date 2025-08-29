#!/bin/bash

echo "Packaging VSCode Extension..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the extension
echo "Building extension..."
./scripts/build.sh

# Install vsce if not already installed
if ! command -v vsce &> /dev/null; then
    echo "Installing vsce..."
    npm install -g @vscode/vsce
fi

# Package the extension
echo "Creating .vsix package..."
vsce package

echo "Package created successfully!"
echo "You can now install the .vsix file in VSCode:"
echo "1. Open VSCode"
echo "2. Go to Extensions (Ctrl+Shift+X)"
echo "3. Click the '...' menu"
echo "4. Select 'Install from VSIX...'"
echo "5. Choose the generated .vsix file" 