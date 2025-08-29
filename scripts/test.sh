#!/bin/bash

echo "Running VSCode Extension tests..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Compile first
echo "Compiling TypeScript..."
npm run compile

# Run tests
echo "Running tests..."
npm test 