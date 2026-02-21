```
cd mermaid-preview-ext
npm install
npm install -g @vscode/vsce
vsce package
# outputs: mermaid-k8s-preview-1.0.0.vsix

# Install it:
code --install-extension mermaid-k8s-preview-1.0.0.vsix
```

# Development Loading

```
cp -r mermaid-preview-ext/* ~/.vscode/extensions/local.mermaid-k8s-preview/
```
