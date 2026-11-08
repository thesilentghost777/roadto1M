// Génère data/road-to-1m.sqlite (même schéma et mêmes catégories que app.js)
// Usage : node make-seed.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const src = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const SECTORS = vm.runInNewContext('(' + /const SECTORS = (\[[\s\S]*?\n\]);/.exec(src)[1] + ')');
const OUT_DEFAULT = vm.runInNewContext(/const OUT_DEFAULT = (\[[\s\S]*?\]);/.exec(src)[1]);
const IN_DEFAULT = vm.runInNewContext('(' + /const IN_DEFAULT = (\{[\s\S]*?\n\});/.exec(src)[1] + ')');

// Le binaire WebAssembly est embarqué dans sql-wasm-data.js (window.SQLWASM)
const w = {}; vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'sql-wasm-data.js'), 'utf8'), { window: w });
const initSqlJs = require('./sql-wasm.js');
(async () => {
  const SQL = await initSqlJs({ wasmBinary: Buffer.from(w.SQLWASM, 'base64') });
  const db = new SQL.Database();
  db.run(`CREATE TABLE categories(id INTEGER PRIMARY KEY AUTOINCREMENT, sector TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN('in','out')), name TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE operations(id INTEGER PRIMARY KEY AUTOINCREMENT, sector TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN('in','out')), category_id INTEGER, amount INTEGER NOT NULL, date TEXT NOT NULL, note TEXT, created_at TEXT, vid INTEGER);
CREATE TABLE versements(id INTEGER PRIMARY KEY AUTOINCREMENT, sector TEXT NOT NULL, amount INTEGER NOT NULL, received INTEGER, status TEXT NOT NULL DEFAULT 'pending', date TEXT NOT NULL, validated_at TEXT);
CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE avail(week TEXT,person TEXT,day INTEGER,hour INTEGER,PRIMARY KEY(week,person,day,hour));
CREATE TABLE tickets(id INTEGER PRIMARY KEY AUTOINCREMENT,label TEXT NOT NULL,descr TEXT,created_at TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'open',validated_at TEXT);`);
  for (const s of SECTORS) {
    for (const n of IN_DEFAULT[s.id]) db.run('INSERT INTO categories(sector,type,name) VALUES(?,?,?)', [s.id, 'in', n]);
    for (const n of OUT_DEFAULT) db.run('INSERT INTO categories(sector,type,name) VALUES(?,?,?)', [s.id, 'out', n]);
  }
  db.run('INSERT INTO meta VALUES(?,?)', ['created', new Date().toISOString()]);
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'data', 'road-to-1m.sqlite'), Buffer.from(db.export()));
  console.log('OK : data/road-to-1m.sqlite');
})();
