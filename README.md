# Mermaid K8s Preview

A VSCode extension that renders `.mmd` files in a live preview panel — with support for **custom icon packs** like `k8s`, `logos`, `aws`, and more. No patching of other extensions required.

## Features

- 🔴 Live preview that updates as you type
- ⬡ Custom icon packs via settings (URL or local file)
- ➕ Zoom in/out controls
- ↓ Export diagram as SVG
- 🎨 Configurable Mermaid themes
- 🪟 Side-by-side preview (just like Markdown preview)

## Installation

```bash
cp -r mermaid-k8s-preview ~/.vscode/extensions/mermaid-k8s-preview
```
Reload VSCode (`Ctrl+Shift+P` → Developer: Reload Window).

## Usage

1. Open any `.mmd` file
2. Click the preview icon in the top-right toolbar  
   — or run `Mermaid K8s: Open Preview` from the command palette

## Configuration (`settings.json`)

```json
"mermaidK8sPreview.iconPacks": [
  {
    "name": "k8s",
    "url": "https://unpkg.com/@rama_krishna/k8s-icons/icons.json"
  },
  {
    "name": "logos",
    "url": "https://unpkg.com/@iconify-json/logos@1/icons.json"
  },
  {
    "name": "aws",
    "url": "https://unpkg.com/@iconify-json/aws@1/icons.json"
  }
],
"mermaidK8sPreview.theme": "dark"
```

### Local icon packs

```json
"mermaidK8sPreview.iconPacks": [
  {
    "name": "k8s",
    "url": "${workspaceFolder}/icons/k8s.json"
  }
]
```

## Example Diagram

```
architecture-beta
  service pod(k8s:pod)[My Pod]
  service svc(k8s:svc)[Service]
  service deploy(k8s:deploy)[Deployment]
  service db(logos:postgresql)[Database]

  svc:R --> L:deploy
  deploy:R --> L:pod
  pod:B --> T:db
```

## Available Icon Packs

| Name | URL |
|------|-----|
| `k8s` | `https://unpkg.com/@rama_krishna/k8s-icons/icons.json` |
| `logos` | `https://unpkg.com/@iconify-json/logos@1/icons.json` |
| `aws` | `https://unpkg.com/@iconify-json/aws@1/icons.json` |
| `azure` | `https://unpkg.com/@iconify-json/azure@1/icons.json` |
| `gcp` | `https://unpkg.com/@iconify-json/gcp@1/icons.json` |
| `mdi` | `https://unpkg.com/@iconify-json/mdi@1/icons.json` |
