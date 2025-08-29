#!/bin/bash

echo "Building VSCode Extension..."

# Clean previous build
rm -rf out/

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Compile TypeScript
echo "Compiling TypeScript..."
npm run compile

# Run linting
echo "Running linting..."
npm run lint

echo "Build completed successfully!" 