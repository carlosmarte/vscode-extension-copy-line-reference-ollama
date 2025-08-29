#!/bin/bash

echo "Starting VSCode Extension in development mode..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start TypeScript compilation in watch mode
echo "Starting TypeScript compilation in watch mode..."
npm run watch 