# Mermaid K8s Preview

A powerful VS Code extension for rendering **Mermaid diagrams** in a live preview panel — with built-in support for **custom icon packs** including Kubernetes, AWS, logos, and more.

![VSCode Badge](https://img.shields.io/badge/VS%20Code-1.85+-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🔴 **Live Preview** — Updates as you type in `.mmd` files
- ⬡ **Custom Icon Packs** — Load icons from URLs or local files
- 🚀 **Preloaded Packs** — Built-in `k8s` and `aws` icon packs
- ➕ **Zoom Controls** — Zoom in/out, reset to fit
- ↓ **Export as SVG** — Download diagrams for documentation
- 🎨 **Theme Support** — Switch between dark and light themes
- 🪟 **Side-by-Side Preview** — Just like VS Code's Markdown preview
- ⚡ **Fast Rendering** — Mermaid 11+ with minimal lag

## 📦 Installation

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/):

```
ext install mermaid-k8s-preview
```

Or manually via VSIX file — see [Build.md](Build.md).

## 🚀 Quick Start

1. Create or open a `.mmd` or `.mermaid` file
2. Click the **Preview** button in the top-right toolbar  
   — or press `Cmd+Shift+P` and run **Mermaid K8s: Open Preview**
3. Start editing! The preview updates live.

## ⚙️ Configuration

Add to your VS Code `settings.json`:

```json
"mermaidK8sPreview.iconPacks": [
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

### Icon Pack URLs

| Name    | URL                                                  | Description          |
| ------- | ---------------------------------------------------- | -------------------- |
| `logos` | `https://unpkg.com/@iconify-json/logos@1/icons.json` | 500+ brand logos     |
| `aws`   | `https://unpkg.com/@iconify-json/aws@1/icons.json`   | AWS service icons    |
| `k8s`   | Built-in (preloaded)                                 | Kubernetes resources |
| Custom  | Your own URL or local file                           | See below            |

### Local Icon Packs

Use the workspace-relative path:

```json
"mermaidK8sPreview.iconPacks": [
  {
    "name": "custom",
    "url": "${workspaceFolder}/icons/my-icons.json"
  }
]
```

### Theme Options

- `"dark"` (default) — Dark background
- `"light"` — Light background
- `"neutral"` — High contrast
- `"forest"` — Muted forest theme

## 📋 Example Diagram

Create a file `example.mmd`:

```
architecture-beta
  service pod(k8s:pod)[Pod]
  service svc(k8s:svc)[Service]
  service deploy(k8s:deploy)[Deployment]
  service db(logos:postgresql)[PostgreSQL]

  svc:R --> L:deploy
  deploy:R --> L:pod
  pod:B --> T:db
```

Then open the preview to see the diagram rendered with icons.

## 🔧 Keyboard Shortcuts

| Command         | Shortcut | Action              |
| --------------- | -------- | ------------------- |
| Open Preview    | -        | Shows preview panel |
| Zoom In         | -        | Click ＋ button     |
| Zoom Out        | -        | Click － button     |
| Reset Zoom      | -        | Click Reset button  |
| Download as SVG | -        | Click ↓ SVG button  |

## 🐛 Troubleshooting

### Icon pack fails to load

**Error:** "Could not load icon pack: Invalid URL"

**Solution:**

- Verify the URL is correct and accessible
- Check internet connectivity
- Try a different icon pack URL to isolate the issue
- For local files, ensure the path exists and uses `${workspaceFolder}`

### Preview not updating

**Solution:**

- Reload VS Code: `Cmd+Shift+P` → "Developer: Reload Window"
- Ensure the file extension is `.mmd` or `.mermaid`
- Check the file is in the editor (not just the file manager)

### Diagram has syntax errors

**Solution:**

- Check [Mermaid docs](https://mermaid.js.org) for diagram syntax
- The error panel at the bottom of preview shows specific issues
- Verify icon names match the pack names

## 📚 Diagram Types Supported

All Mermaid 11 diagram types:

- Flowchart
- Sequence Diagram
- Gantt Chart
- Class Diagram
- State Diagram
- Entity-Relationship Diagram
- Architecture Diagram (**with icons**)
- Git Graph
- And more...

See [mermaid.js.org](https://mermaid.js.org) for full documentation.

## 🛠️ Development

See [Build.md](Build.md) for build, packaging, and installation instructions.

## 📄 License

MIT License — See LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Open an issue or pull request on GitHub.

## 💡 Tips & Tricks

- **Organize diagrams**: Use proper naming like `arch-01.mmd`, `flow-user-auth.mmd`
- **Share exports**: Download SVG and embed in documentation or wikis
- **Font control**: Theme settings control diagram appearance
- **Performance**: For very large diagrams, consider breaking into smaller files
- **Icon discovery**: Browse [Iconify](https://iconify.design) to find more icon packs
