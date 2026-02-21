# Building the Extension

## Prerequisites

- Node.js 14+ and npm
- Visual Studio Code

## Build & Package

```bash
cd mermaid-preview-ext

# Install dependencies
npm install

# Install packaging tool globally
npm install -g @vscode/vsce

# Package the extension
vsce package
# Outputs: mermaid-k8s-preview-1.0.0.vsix
```

## Installation

### From VSIX File

```bash
code --install-extension mermaid-k8s-preview-1.0.0.vsix
```

### Development / Symlink Installation

For local development, symlink the extension directory:

```bash
mkdir -p ~/.vscode/extensions/local.mermaid-k8s-preview
cp -r mermaid-preview-ext/* ~/.vscode/extensions/local.mermaid-k8s-preview/
```

Then reload VS Code or run `Developer: Reload Window` from the command palette.

## Publishing to Marketplace

```bash
vsce publish
```

(Requires authentication and verified publisher account)

# Development Loading

```

cp -r mermaid-preview-ext/\* ~/.vscode/extensions/local.mermaid-k8s-preview/

```
