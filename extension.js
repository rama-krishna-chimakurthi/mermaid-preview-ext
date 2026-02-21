const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const os = require('os');
const https = require('https');

const panels = new Map();

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'vscode-mermaid-k8s-preview' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Failed to parse JSON from ' + url)); }
      });
    }).on('error', reject);
  });
}

async function loadIconPacks(iconPacks, workspaceFolder) {
  const loaded = [];
  for (const pack of iconPacks) {
    try {
      let icons;
      if (pack.url.startsWith('http://') || pack.url.startsWith('https://')) {
        icons = await fetchJson(pack.url);
      } else {
        const absPath = pack.url.replace('${workspaceFolder}', workspaceFolder || '');
        icons = JSON.parse(fs.readFileSync(absPath, 'utf8'));
      }
      loaded.push({ name: pack.name, icons });
      console.log(`[Mermaid K8s] Loaded icon pack: ${pack.name}`);
    } catch (e) {
      console.error(`[Mermaid K8s] Failed to load pack "${pack.name}": ${e.message}`);
    }
  }
  return loaded;
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('mermaidK8s.openPreview', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      if (!editor.document.fileName.match(/\.(mmd|mermaid)$/)) {
        vscode.window.showWarningMessage('Open a .mmd file first.');
        return;
      }
      openPreview(context, editor.document);
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor && editor.document.fileName.match(/\.(mmd|mermaid)$/)) {
        openPreview(context, editor.document);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(e => {
      if (!e.document.fileName.match(/\.(mmd|mermaid)$/)) return;
      const panel = panels.get(e.document.uri.fsPath);
      if (panel) {
        panel.webview.postMessage({ type: 'update', content: e.document.getText() });
      }
    })
  );
}

async function openPreview(context, doc) {
  const filePath = doc.uri.fsPath;
  const fileName = path.basename(filePath);

  if (panels.has(filePath)) {
    panels.get(filePath).reveal(vscode.ViewColumn.Beside);
    return;
  }

  const config = vscode.workspace.getConfiguration('mermaidK8sPreview');
  const iconPacksConfig = config.get('iconPacks', []);
  const theme = config.get('theme', 'dark');
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';

  const panel = vscode.window.createWebviewPanel(
    'mermaidK8sPreview',
    `⬡ ${fileName}`,
    vscode.ViewColumn.Beside,
    { enableScripts: true, retainContextWhenHidden: true }
  );

  panel.webview.html = getWebviewContent(theme);
  panels.set(filePath, panel);
  panel.onDidDispose(() => panels.delete(filePath));

  // Load icon packs in Node.js (full network access) then send to webview
  vscode.window.withProgress(
    { location: vscode.ProgressLocation.Window, title: 'Loading icon packs…' },
    async () => {
      const loadedPacks = await loadIconPacks(iconPacksConfig, workspaceFolder);
      // Send icon packs + initial content to webview
      panel.webview.postMessage({
        type: 'init',
        content: doc.getText(),
        iconPacks: loadedPacks,
        theme
      });
    }
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
    }
    #toolbar .label {
      font-size: 11px;
      color: #858585;
      margin-right: auto;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .btn {
      background: #3c3c3c;
      border: 1px solid #555;
      color: #ccc;
      padding: 3px 10px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    }
    .btn:hover { background: #4a4a4a; color: #fff; }
    #status { font-size: 11px; padding: 2px 8px; border-radius: 3px; }
    #status.loading { color: #858585; }
    #status.ok { color: #4ec9b0; }
    #status.error { color: #f44747; }
    #canvas {
      flex: 1;
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    #wrapper { transform-origin: center center; transition: transform 0.1s; }
    #wrapper svg { max-width: 100%; height: auto; }
    #error-box {
      display: none;
      background: #3c1f1f;
      border: 1px solid #7a2020;
      border-radius: 6px;
      padding: 12px;
      font-family: monospace;
      font-size: 11px;
      color: #f48771;
      max-width: 600px;
      white-space: pre-wrap;
      margin-top: 12px;
    }
    #loading {
      color: #555;
      font-size: 13px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .spinner {
      width: 24px; height: 24px;
      border: 2px solid #333;
      border-top-color: #007acc;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
<div id="toolbar">
  <span class="label">⬡ Mermaid Preview</span>
  <span id="status" class="loading">Initializing…</span>
  <button class="btn" onclick="zoom(-0.15)">－</button>
  <button class="btn" onclick="zoom(0)">100%</button>
  <button class="btn" onclick="zoom(0.15)">＋</button>
  <button class="btn" onclick="dl()">↓ SVG</button>
</div>
<div id="canvas">
  <div id="loading"><div class="spinner"></div><span>Loading icon packs…</span></div>
  <div id="wrapper" style="display:none">
    <div id="diagram"></div>
    <div id="error-box"></div>
  </div>
</div>

<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

  let scale = 1, count = 0, ready = false;

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

  function status(type, text) {
    const el = document.getElementById('status');
    el.className = type; el.textContent = text;
  }

  async function render(content) {
    if (!ready || !content.trim()) return;
    const diagramEl = document.getElementById('diagram');
    const errorEl = document.getElementById('error-box');
    try {
      status('loading', 'Rendering…');
      const id = 'mmk8s-' + (++count);
      const { svg } = await mermaid.render(id, content);
      diagramEl.innerHTML = svg;
      errorEl.style.display = 'none';
      status('ok', '✓ OK');
    } catch (e) {
      errorEl.style.display = 'block';
      errorEl.textContent = e.message || String(e);
      status('error', '✗ ' + (e.message?.split('\\n')[0] || 'Error'));
    }
  }

  window.addEventListener('message', async (e) => {
    const msg = e.data;

    if (msg.type === 'init') {
      // Register icon packs sent from Node.js
      if (msg.iconPacks && msg.iconPacks.length > 0) {
        mermaid.registerIconPacks(
          msg.iconPacks.map(p => ({ name: p.name, icons: p.icons }))
        );
      }

      mermaid.initialize({ startOnLoad: false, theme: msg.theme, securityLevel: 'loose' });
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

function deactivate() { panels.clear(); }
module.exports = { activate, deactivate };
