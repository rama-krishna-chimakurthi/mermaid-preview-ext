const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const os = require("os");
const https = require("https");
const { URL } = require("url");

const panels = new Map();

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        { headers: { "User-Agent": "vscode-mermaid-k8s-preview" } },
        (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            const location = res.headers.location;
            const absoluteUrl = new URL(location, url).href;
            return fetchJson(absoluteUrl).then(resolve).catch(reject);
          }
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        },
      )
      .on("error", reject);
  });
}

async function loadIconPacks(iconPacks, workspaceFolder) {
  const loaded = [];
  for (const pack of iconPacks) {
    try {
      let icons;
      if (pack.url.startsWith("http://") || pack.url.startsWith("https://")) {
        icons = await fetchJson(pack.url);
      } else {
        const absPath = pack.url.replace(
          "${workspaceFolder}",
          workspaceFolder || "",
        );
        icons = JSON.parse(fs.readFileSync(absPath, "utf8"));
      }
      loaded.push({ name: pack.name, icons });
    } catch (e) {
      vscode.window.showWarningMessage(
        `Mermaid Preview: Could not load icon pack "${pack.name}": ${e.message}`,
      );
    }
  }
  return loaded;
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("mermaidK8s.openPreview", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      if (!editor.document.fileName.match(/\.(mmd|mermaid)$/)) {
        vscode.window.showWarningMessage("Open a .mmd file first.");
        return;
      }
      openPreview(context, editor.document);
    }),
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && editor.document.fileName.match(/\.(mmd|mermaid)$/)) {
        openPreview(context, editor.document);
      }
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (!e.document.fileName.match(/\.(mmd|mermaid)$/)) return;
      const panel = panels.get(e.document.uri.fsPath);
      if (panel)
        panel.webview.postMessage({
          type: "update",
          content: e.document.getText(),
        });
    }),
  );
}

async function openPreview(context, doc) {
  const filePath = doc.uri.fsPath;
  const fileName = path.basename(filePath);

  if (panels.has(filePath)) {
    panels.get(filePath).reveal(vscode.ViewColumn.Beside);
    return;
  }

  const config = vscode.workspace.getConfiguration("mermaidK8sPreview");
  const iconPacksConfig = config.get("iconPacks", []);
  const theme = config.get("theme", "dark");
  const workspaceFolder =
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";
  const extensionDir = context.extensionPath;

  // Preload default icon packs (aws and k8s) from extension directory
  const defaultPacks = [
    { name: "aws", url: path.join(extensionDir, "aws-icons.json") },
    // { name: "k8s", url: path.join(extensionDir, "k8s.json") },
    {
      name: "k8s",
      url: "https://unpkg.com/@rama_krishna/k8s-icons/icons.json",
    },
  ];

  // Combine: settings packs come first (on top), then defaults
  const allIconPacks = [...iconPacksConfig, ...defaultPacks];

  const panel = vscode.window.createWebviewPanel(
    "mermaidK8sPreview",
    `⬡ ${fileName}`,
    vscode.ViewColumn.Beside,
    { enableScripts: true, retainContextWhenHidden: true },
  );

  panel.webview.html = getWebviewContent(theme);
  panels.set(filePath, panel);
  panel.onDidDispose(() => panels.delete(filePath));

  vscode.window.withProgress(
    { location: vscode.ProgressLocation.Window, title: "Loading icon packs…" },
    async () => {
      const loadedPacks = await loadIconPacks(allIconPacks, workspaceFolder);
      panel.webview.postMessage({
        type: "init",
        content: doc.getText(),
        iconPacks: loadedPacks,
        theme,
      });
    },
  );
}

function getWebviewContent(theme) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'unsafe-inline'; img-src * data: blob:;">
  <title>Mermaid Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Segoe UI', system-ui, sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    #toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: #252526;
      border-bottom: 1px solid #333;
      flex-shrink: 0;
      user-select: none;
    }
    #toolbar .label { font-size: 11px; color: #858585; margin-right: auto; text-transform: uppercase; letter-spacing: 0.5px; }
    .btn { background: #3c3c3c; border: 1px solid #555; color: #ccc; padding: 3px 10px; border-radius: 3px; cursor: pointer; font-size: 12px; }
    .btn:hover { background: #4a4a4a; color: #fff; }
    #status { font-size: 11px; padding: 2px 8px; border-radius: 3px; white-space: nowrap; max-width: 400px; overflow: hidden; text-overflow: ellipsis; }
    #status.loading { color: #858585; }
    #status.ok { color: #4ec9b0; }
    #status.error { color: #f44747; }
    #canvas { flex: 1; overflow: auto; display: flex; align-items: flex-start; justify-content: center; padding: 24px; }
    #wrapper { transform-origin: top center; transition: transform 0.1s; }
    #wrapper svg { max-width: 100%; height: auto; display: block; }
    #error-panel {
      display: none;
      margin-top: 16px;
      background: #2a1f1f;
      border-left: 3px solid #f44747;
      border-radius: 4px;
      padding: 12px 16px;
      font-family: 'Cascadia Code', 'Fira Code', monospace;
      font-size: 11px;
      color: #f48771;
      white-space: pre-wrap;
      word-break: break-word;
      max-width: 700px;
    }
    #error-panel .err-title { font-weight: bold; margin-bottom: 6px; color: #f44747; font-size: 12px; }
    #loading { color: #555; font-size: 13px; display: flex; flex-direction: column; align-items: center; gap: 12px; padding-top: 80px; }
    .spinner { width: 24px; height: 24px; border: 2px solid #333; border-top-color: #007acc; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
<div id="toolbar">
  <span class="label">⬡ Mermaid K8s Preview</span>
  <span id="status" class="loading">Initializing…</span>
  <button class="btn" onclick="zoom(-0.2)">－</button>
  <button class="btn" onclick="zoom(0)">Reset</button>
  <button class="btn" onclick="zoom(0.2)">＋</button>
  <button class="btn" onclick="dl()">↓ SVG</button>
</div>
<div id="canvas">
  <div id="loading"><div class="spinner"></div><span>Loading icon packs…</span></div>
  <div id="wrapper" style="display:none">
    <div id="diagram"></div>
    <div id="error-panel">
      <div class="err-title">⚠ Syntax Error</div>
      <div id="error-text"></div>
    </div>
  </div>
</div>

<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

  let scale = 1, count = 0, ready = false, lastGoodSvg = null;

  window.zoom = (d) => {
    scale = d === 0 ? 1 : Math.max(0.2, Math.min(4, scale + d));
    document.getElementById('wrapper').style.transform = 'scale(' + scale + ')';
  };

  window.dl = () => {
    const svg = document.querySelector('#diagram svg');
    if (!svg) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([svg.outerHTML], { type: 'image/svg+xml' }));
    a.download = 'diagram.svg';
    a.click();
  };

  function setStatus(type, text) {
    const el = document.getElementById('status');
    el.className = type;
    el.textContent = text;
    el.title = text;
  }

  async function render(content) {
    if (!ready) return;
    const diagramEl = document.getElementById('diagram');
    const errorPanel = document.getElementById('error-panel');
    const errorText = document.getElementById('error-text');

    if (!content.trim()) {
      setStatus('ok', 'Empty file');
      return;
    }

    try {
      setStatus('loading', 'Rendering…');
      // Clean up any leftover mermaid error divs from DOM
      document.querySelectorAll('[id^="dmermaid-"]').forEach(el => el.remove());
      document.querySelectorAll('.mermaid-error').forEach(el => el.remove());

      const id = 'mmk8s' + (++count);
      const { svg } = await mermaid.render(id, content);
      lastGoodSvg = svg;
      diagramEl.innerHTML = svg;
      errorPanel.style.display = 'none';
      setStatus('ok', '✓ OK');
    } catch (e) {
      // Show last good diagram + error below — no bomb, no full screen takeover
      if (lastGoodSvg) {
        diagramEl.innerHTML = lastGoodSvg;
      }
      // Clean the error message — strip HTML tags mermaid injects
      const clean = (e.message || String(e))
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')
        .trim();
      errorText.textContent = clean;
      errorPanel.style.display = 'block';
      // Short version for toolbar
      const short = clean.split('\\n')[0].slice(0, 80);
      setStatus('error', '✗ ' + short);

      // Remove any bomb/error SVGs mermaid injected into the DOM
      document.querySelectorAll('svg[id^="dmermaid"]').forEach(el => el.remove());
      document.querySelectorAll('[id^="mmk8s"]').forEach(el => {
        if (!el.closest('#diagram')) el.remove();
      });
    }
  }

  window.addEventListener('message', async (e) => {
    const msg = e.data;
    if (msg.type === 'init') {
      if (msg.iconPacks?.length > 0) {
        mermaid.registerIconPacks(msg.iconPacks.map(p => ({ name: p.name, icons: p.icons })));
      }
      mermaid.initialize({
        startOnLoad: false,
        theme: msg.theme || 'dark',
        securityLevel: 'loose',
        suppressErrorRendering: true
      });
      ready = true;
      document.getElementById('loading').style.display = 'none';
      document.getElementById('wrapper').style.display = 'block';
      await render(msg.content);
    }
    if (msg.type === 'update') {
      await render(msg.content);
    }
  });
</script>
</body>
</html>`;
}

function deactivate() {
  panels.clear();
}
module.exports = { activate, deactivate };
