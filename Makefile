# Copy Line Reference Extension Makefile

# Variables
EXTENSION_NAME = copy-line-reference
VERSION = 0.0.1
VSIX_FILE = $(EXTENSION_NAME)-$(VERSION).vsix

# Default target
.PHONY: all
all: build

# Install dependencies
.PHONY: install
install:
	npm install

# Compile TypeScript
.PHONY: compile
compile: install
	npm run compile

# Run linter
.PHONY: lint
lint: install
	npm run lint

# Run tests
.PHONY: test
test: compile
	npm test

# Build VSIX package
.PHONY: build
build: compile lint
	@echo "Building VSIX package..."
	@if ! command -v vsce >/dev/null 2>&1; then \
		echo "Installing vsce..."; \
		npm install -g @vscode/vsce; \
	fi
	vsce package
	@echo "Built $(VSIX_FILE)"

# Install the extension in VSCode
.PHONY: install-extension
install-extension: build
	@echo "Installing extension in VSCode..."
	code --install-extension $(VSIX_FILE)
	@echo "Extension installed successfully!"

# Uninstall the extension from VSCode
.PHONY: uninstall-extension
uninstall-extension:
	@echo "Uninstalling extension from VSCode..."
	code --uninstall-extension $(EXTENSION_NAME)
	@echo "Extension uninstalled!"

# Clean build artifacts
.PHONY: clean
clean:
	rm -rf out/
	rm -f *.vsix
	@echo "Cleaned build artifacts"

# Development: compile and watch for changes
.PHONY: watch
watch: install
	npm run watch

# Run extension in development mode (F5 equivalent)
.PHONY: dev
dev: compile
	@echo "Open VSCode and press F5 to start debugging"
	code .

# Full development cycle: clean, build, and install
.PHONY: deploy
deploy: clean build install-extension

# Show help
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  install             - Install npm dependencies"
	@echo "  compile             - Compile TypeScript code"
	@echo "  lint                - Run ESLint"
	@echo "  test                - Run test suite"
	@echo "  build               - Build VSIX package"
	@echo "  install-extension   - Build and install extension in VSCode"
	@echo "  uninstall-extension - Uninstall extension from VSCode"
	@echo "  clean               - Clean build artifacts"
	@echo "  watch               - Compile and watch for changes"
	@echo "  dev                 - Open project for development"
	@echo "  deploy              - Clean, build, and install extension"
	@echo "  help                - Show this help message"