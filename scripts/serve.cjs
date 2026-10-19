// Minimal static file server for public/ used by the browser checks.
// Serves directory indexes, falls back to the nearest 404.html (like
// Cloudflare Workers static assets with not_found_handling "404-page") and
// applies the headers of the "/*" block in public/_headers, so that the
// Content-Security-Policy is active during the tests.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".png": "image/png", ".jpg": "image/jpeg", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

// Headers of the "/*" block in _headers (the only global block).
function globalHeaders(root) {
  const file = path.join(root, "_headers");
  if (!fs.existsSync(file)) return {};
  const headers = {};
  let inGlobal = false;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) { inGlobal = line.trim() === "/*"; continue; }
    const m = line.trim().match(/^([^:]+):\s*(.*)$/);
    if (inGlobal && m) headers[m[1]] = m[2];
  }
  return headers;
}

function notFoundPage(root, p) {
  let dir = path.dirname(path.join(root, p.endsWith("/") ? p + "x" : p));
  while (dir.startsWith(root)) {
    const f = path.join(dir, "404.html");
    if (fs.existsSync(f)) return f;
    dir = path.dirname(dir);
  }
  return path.join(root, "404.html");
}

function start(root, port = 0) {
  root = path.resolve(root);
  const extra = globalHeaders(root);
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = path.join(root, p);
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    let status = 200;
    if (!fs.existsSync(file)) { file = notFoundPage(root, p); status = 404; }
    res.writeHead(status, { ...extra, "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () =>
    resolve({ server, url: `http://127.0.0.1:${server.address().port}` })));
}

module.exports = { start };
