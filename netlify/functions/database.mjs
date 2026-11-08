import { getStore } from '@netlify/blobs';
import { readFile } from 'node:fs/promises';

const KEY = 'road-to-1m.sqlite';
const MAX_SIZE = 20 * 1024 * 1024;
const MAGIC = 'SQLite format 3\u0000';
const NO_STORE = { 'Cache-Control': 'no-store' };

const text = (status, body, extra = {}) =>
  new Response(body, { status, headers: { ...NO_STORE, ...extra } });

// Fichier de départ : data/road-to-1m.sqlite (inclus dans la fonction via netlify.toml)
async function seedFile() {
  const candidates = [
    new URL('../../data/road-to-1m.sqlite', import.meta.url),
    new URL('./data/road-to-1m.sqlite', import.meta.url),
  ];
  for (const url of candidates) {
    try { return await readFile(url); } catch { /* essaie le suivant */ }
  }
  return null;
}

export default async (req) => {
  const store = getStore({ name: 'road-to-1m', consistency: 'strong' });

  if (req.method === 'GET') {
    let entry = await store.getWithMetadata(KEY, { type: 'arrayBuffer' });
    if (!entry) {
      // Première utilisation : on crée la base à partir du fichier SQLite du projet
      const seed = await seedFile();
      if (!seed) return text(404, 'Base pas encore initialisée.');
      await store.set(KEY, seed, { onlyIfNew: true }); // si deux personnes arrivent en même temps, une seule écrit
      entry = await store.getWithMetadata(KEY, { type: 'arrayBuffer' });
      if (!entry) return text(404, 'Base pas encore initialisée.');
    }
    return new Response(entry.data, {
      status: 200,
      headers: { ...NO_STORE, 'Content-Type': 'application/vnd.sqlite3', 'X-DB-Version': entry.etag },
    });
  }

  if (req.method === 'PUT') {
    const data = new Uint8Array(await req.arrayBuffer());
    if (data.length > MAX_SIZE) return text(413, 'Fichier SQLite trop volumineux.');
    if (data.length < 16 || new TextDecoder('latin1').decode(data.subarray(0, 16)) !== MAGIC)
      return text(400, 'Fichier SQLite invalide.');

    const version = req.headers.get('x-if-version');
    const isNew = req.headers.get('x-new-database') === '1';
    if (!version && !isNew) return text(409, 'Version manquante.');

    // Écriture conditionnelle : refusée si quelqu'un d'autre a enregistré entre-temps
    const result = await store.set(KEY, data, version ? { onlyIfMatch: version } : { onlyIfNew: true });
    if (!result.modified) return text(409, 'La base a changé depuis votre dernière synchronisation.');
    return text(200, 'Enregistré.', { 'X-DB-Version': result.etag });
  }

  return text(405, 'Méthode non autorisée.', { Allow: 'GET, PUT' });
};

export const config = { path: '/api/database' };
