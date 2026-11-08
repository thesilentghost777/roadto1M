'use strict';
// Serveur LOCAL (facultatif) : sert le site et stocke la base SQLite dans data/road-to-1m.sqlite.
// Sur Netlify, ce fichier n'est pas utilisé : c'est netlify/functions/database.mjs qui joue ce rôle.
// Lancer en local : node server.js  (puis http://localhost:3000)

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'road-to-1m.sqlite');
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 3000);
const MAX_DB_SIZE = 20 * 1024 * 1024;
const PUBLIC_FILES = new Set([
  'index.html', 'dispo.html', 'egdevhelp.html', 'logiciel.html', 'stats.html',
  'tfs.html', 'urgence.html', 'validation.html', 'vfs.html', 'style.css',
  'app.js', 'sql-wasm.js', 'sql-wasm-data.js',
]);
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(body);
}

function version(data) {
  return `"${crypto.createHash('sha256').update(data).digest('hex')}"`;
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_DB_SIZE) {
      req.destroy();
      const error = new Error('Fichier SQLite trop volumineux.');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

let writeQueue = Promise.resolve();
function serializeWrite(callback) {
  const write = writeQueue.then(callback);
  writeQueue = write.catch(() => {});
  return write;
}

async function handleDatabase(req, res) {
  if (req.method === 'GET') {
    let data;
    try { data = await fs.readFile(DB_FILE); }
    catch (error) {
      if (error.code === 'ENOENT') {
        send(res, 404, 'Base pas encore initialisée.', { 'Cache-Control': 'no-store' });
        return;
      }
      throw error;
    }
    send(res, 200, data, {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/vnd.sqlite3',
      'X-DB-Version': version(data),
    });
    return;
  }

  if (req.method !== 'PUT') {
    send(res, 405, 'Méthode non autorisée.', { Allow: 'GET, PUT' });
    return;
  }

  const data = await readBody(req);
  if (data.length < 16 || data.subarray(0, 16).toString('binary') !== 'SQLite format 3\u0000') {
    send(res, 400, 'Fichier SQLite invalide.');
    return;
  }

  const result = await serializeWrite(async () => {
    let current = null;
    try { current = await fs.readFile(DB_FILE); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }

    const matches = current
      ? req.headers['x-if-version'] === version(current)
      : req.headers['x-new-database'] === '1';
    if (!matches) return false;

    await fs.mkdir(DATA_DIR, { recursive: true });
    const tempFile = path.join(DATA_DIR, `.road-to-1m-${process.pid}-${crypto.randomBytes(8).toString('hex')}.tmp`);
    try {
      await fs.writeFile(tempFile, data, { mode: 0o600 });
      await fs.rename(tempFile, DB_FILE);
    } catch (error) {
      await fs.rm(tempFile, { force: true });
      throw error;
    }
    return true;
  });

  if (!result) {
    send(res, 409, 'La base a changé depuis votre dernière synchronisation.', { 'Cache-Control': 'no-store' });
    return;
  }
  send(res, 200, 'Enregistré.', { 'Cache-Control': 'no-store', 'X-DB-Version': version(data) });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/database') {
      await handleDatabase(req, res);
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      send(res, 405, 'Méthode non autorisée.', { Allow: 'GET, HEAD' });
      return;
    }

    let requested;
    try { requested = decodeURIComponent(url.pathname); }
    catch { send(res, 400, 'Chemin invalide.'); return; }
    const fileName = requested === '/' ? 'index.html' : requested.slice(1);
    if (fileName.includes('/') || !PUBLIC_FILES.has(fileName)) {
      send(res, 404, 'Introuvable.');
      return;
    }
    const file = path.join(ROOT, fileName);
    const content = await fs.readFile(file);
    res.writeHead(200, {
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': MIME_TYPES[path.extname(file)] || 'application/octet-stream',
    });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    if (res.headersSent) { res.destroy(); return; }
    console.error('Erreur serveur:', error);
    send(res, error.statusCode || 500, error.statusCode ? error.message : 'Erreur interne du serveur.');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Road to 1M disponible sur http://localhost:${PORT}`);
  console.log(`Fichier SQLite : ${DB_FILE}`);
});
