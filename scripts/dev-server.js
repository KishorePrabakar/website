/**
 * Local approximation of the Vercel deployment: serves the repo root statically,
 * runs `api/*.js` as functions, and applies the rewrites from vercel.json in
 * Vercel's order (filesystem first, then rewrites).
 *
 *   node scripts/dev-server.js [port]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.argv[2] || 3000);
const { redirects = [], rewrites = [] } = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')
);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

const toRegExp = (source) => new RegExp(`^${source}$`);

function resolveFile(pathname) {
  const filePath = path.join(ROOT, decodeURIComponent(pathname));
  if (!filePath.startsWith(ROOT)) return null;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return filePath;
  const indexPath = path.join(filePath, 'index.html');
  if (fs.existsSync(indexPath)) return indexPath;
  return null;
}

function sendFile(res, filePath) {
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream' });
  res.end(fs.readFileSync(filePath));
}

function runFunction(pathname, req, res) {
  const handlerPath = path.join(ROOT, `${pathname}.js`);
  if (!pathname.startsWith('/api/') || !fs.existsSync(handlerPath)) return false;
  delete require.cache[require.resolve(handlerPath)];
  const handler = require(handlerPath);
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
    return res;
  };
  Promise.resolve(handler(req, res)).catch((error) => {
    console.error(error);
    if (!res.headersSent) res.writeHead(500);
    res.end('function error');
  });
  return true;
}

http
  .createServer((req, res) => {
    const { pathname } = new URL(req.url, `http://localhost:${PORT}`);

    for (const rule of redirects) {
      if (toRegExp(rule.source).test(pathname)) {
        res.writeHead(rule.permanent ? 308 : 307, { Location: rule.destination });
        return res.end();
      }
    }

    const file = resolveFile(pathname);
    if (file) return sendFile(res, file);
    if (runFunction(pathname, req, res)) return;

    for (const rule of rewrites) {
      const match = toRegExp(rule.source).exec(pathname);
      if (!match) continue;
      const destination = rule.destination.replace(/\$(\d)/g, (_, i) => match[Number(i)] || '');
      if (runFunction(destination, req, res)) return;
      const rewritten = resolveFile(destination);
      if (rewritten) return sendFile(res, rewritten);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404');
  })
  .listen(PORT, () => console.log(`http://localhost:${PORT}`));
