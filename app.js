(() => {
'use strict';

/* ================= Configuration ================= */
const TARGET = 250000, GOAL = 1000000;
const START = '2026-11-08', DEADLINE = '2027-01-12';
const MIGUEL = { name: 'Miguel Tchemou', tel: '+237 698 717 390' };

const SECTORS = [
  { id: 'logiciel', name: 'Logiciel secrétariat', short: 'Logiciel', managers: ['Mr Tedongap', 'Mr Pone'],
    budget: [['Salaire des stagiaires', 50], ['Dépenses courantes', 50]] },
  { id: 'egdevhelp', name: 'Egdevhelp', short: 'Egdevhelp', managers: ['Mr Signe'],
    budget: [['Loyer', 50], ['Caisse publicité', 50]] },
  { id: 'vfs', name: 'VFS', short: 'VFS', managers: ['Mr Signe'],
    budget: [['Loyer', 50], ['Épargne & développement TFS', 50]] },
  { id: 'tfs', name: 'TFS', short: 'TFS', managers: ['Mr Tchemou'],
    budget: [['VPS', 15], ['Budget associés', 75]] },
];
const OUT_DEFAULT = ['Transport', 'Connexion internet', 'Papier, glace et autres', 'Crédit téléphonique',
  'Salaire d’un assistant', 'Abonnement VPS', 'Abonnement outil IA', 'Électricité'];
const IN_DEFAULT = {
  logiciel: ['Recaprint', 'Classeur de cartes de visite', 'Flashprinter', 'Flash magazine', 'Flashcard', 'Scantoword'],
  egdevhelp: ['Playstore perso', 'Playstore entreprise', 'Appstore perso', 'VPS', 'Nom de domaine', 'API de paiement'],
  vfs: ['Vidéo motion', 'Montage vidéo', 'Clip vidéo', 'Vidéo publicitaire'],
  tfs: ['Site', 'Application', 'Partenariat Infonova', 'EG Restau', 'EGBP'],
};

const ENCOURAGE = [
  'Chaque franc enregistré vous rapproche du million.',
  'Un million, ça se construit un jour à la fois.',
  'La régularité bat l’intensité. Avancez aujourd’hui.',
  'Quatre secteurs, un seul objectif.',
  'Ce que vous faites aujourd’hui compte déjà.',
  'Le million est au bout de la discipline.',
  'Aucun jour perdu : chaque vente compte.',
];
const QUOTES = [
  ['Le succès, c’est tomber sept fois et se relever huit.', 'Proverbe japonais'],
  ['Le succès est la somme de petits efforts répétés jour après jour.', 'Robert Collier'],
  ['Ce n’est pas parce que les choses sont difficiles que nous n’osons pas, c’est parce que nous n’osons pas qu’elles sont difficiles.', 'Sénèque'],
  ['La discipline est le pont entre les objectifs et les accomplissements.', 'Jim Rohn'],
  ['Commence où tu es, utilise ce que tu as, fais ce que tu peux.', 'Arthur Ashe'],
  ['Le meilleur moment pour planter un arbre était il y a vingt ans. Le deuxième meilleur moment, c’est maintenant.', 'Proverbe chinois'],
  ['Rien de grand ne s’est accompli sans enthousiasme.', 'Ralph Waldo Emerson'],
  ['La persévérance est la mère du succès.', ''],
  ['Un objectif sans plan n’est qu’un souhait.', ''],
];
const VERSES = [
  ['Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes.', 'Colossiens 3.23'],
  ['Les projets de l’homme diligent ne mènent qu’à l’abondance.', 'Proverbes 21.5'],
  ['Recommande à l’Éternel tes œuvres, et tes projets se réaliseront.', 'Proverbes 16.3'],
  ['Je puis tout par celui qui me fortifie.', 'Philippiens 4.13'],
  ['Tout ce que ta main trouve à faire avec ta force, fais-le.', 'Ecclésiaste 9.10'],
  ['Ne nous lassons pas de faire le bien ; car nous moissonnerons au temps convenable, si nous ne nous relâchons pas.', 'Galates 6.9'],
  ['Tout travail procure l’abondance.', 'Proverbes 14.23'],
  ['La main des diligents dominera.', 'Proverbes 12.24'],
  ['Souviens-toi de l’Éternel, ton Dieu, car c’est lui qui te donne de la force pour acquérir ces richesses.', 'Deutéronome 8.18'],
  ['Fortifie-toi et prends courage.', 'Josué 1.9'],
  ['Celui qui est fidèle dans les moindres choses l’est aussi dans les grandes.', 'Luc 16.10'],
  ['Affermis l’ouvrage de nos mains.', 'Psaume 90.17'],
];

/* "w" = noms des responsables, "p" = pluriel */
const MSG = {
  done: [
    (w, p) => `${w} ${p ? 'ont atteint' : 'a atteint'} l’objectif de ${fmt(TARGET)} FCFA. Respect.`,
    (w) => `Objectif bouclé pour ${w}. Le surplus alimente la caisse nouveau projet.`,
  ],
  ahead: [
    (w, p) => `${w} ${p ? 'prennent' : 'prend'} déjà beaucoup d’avance. Dépêchez-vous de ${p ? 'les' : 'le'} rattraper !`,
    (w, p) => `${w} ${p ? 'sont' : 'est'} en avance sur le rythme. Les autres, vous regardez ou vous courez ?`,
    (w) => `L’avance de ${w} grandit. Qui relève le défi ?`,
  ],
  track: [
    (w, p) => `${w} ${p ? 'sont' : 'est'} dans le rythme. Ne relâchez rien.`,
    (w) => `Rythme tenu pour ${w}. Un bon jour de plus et l’avance arrive.`,
  ],
  late: [
    (w, p) => `${w} ${p ? 'ont' : 'a'} pris du retard. Il est temps d’accélérer.`,
    (w) => `Le rythme n’y est plus pour ${w}. À rattraper cette semaine.`,
  ],
  vlate: [
    (w, p) => `${w} ${p ? 'sont' : 'est'} très en retard sur l’objectif. ${p ? 'Ils doivent' : 'Il doit'} se réveiller !`,
    (w, p) => `Alerte : ${w} ${p ? 'sont' : 'est'} loin derrière. Le temps ne s’arrête pas.`,
    (w, p) => `${w} ${p ? 'dorment' : 'dort'} sur l’objectif… Réveil immédiat !`,
  ],
};

/* ================= Utilitaires ================= */
const $ = (s, r = document) => r.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => iso(new Date());
const dnum = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
const diff = (a, b) => Math.round(dnum(a) - dnum(b));
const addDays = (s, n) => { const t = new Date((dnum(s) + n) * 86400000); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`; };
const weekStart = s => addDays(s, -((new Date(dnum(s) * 86400000).getUTCDay() + 6) % 7));
const fmt = n => Math.round(n).toLocaleString('fr-FR').replace(/[  ]/g, ' ');
const ddmm = s => `${s.slice(8, 10)}/${s.slice(5, 7)}`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const parseAmt = s => parseInt(String(s).replace(/\D/g, ''), 10) || 0;
const dayIdx = () => Math.floor(dnum(today()));

/* ================= Base SQLite (sql.js) + serveur ================= */
let SQL, db, noIDB = false, unlocked = true, serverETag = null;
let dbDirty = false, syncConflict = false;
const q = (sql, p = []) => {
  const st = db.prepare(sql); st.bind(p);
  const rows = []; while (st.step()) rows.push(st.getAsObject());
  st.free(); return rows;
};
const run = (sql, p = []) => { db.run(sql, p); dbDirty = true; };
async function apiFetch(url, options = {}, allowedStatuses = []) {
  if (location.protocol === 'file:')
    throw new Error('Le site est ouvert directement depuis un fichier. Ouvrez l’adresse Netlify (https://…netlify.app), ou lancez « node server.js » puis http://localhost:3000.');
  const response = await fetch(url, { cache: 'no-store', ...options });
  if (!response.ok && !allowedStatuses.includes(response.status))
    throw new Error(`Erreur serveur (${response.status}).`);
  return response;
}
async function loadRemote() {
  const response = await apiFetch('/api/database', {}, [404]);
  if (response.status === 404) return null;
  serverETag = response.headers.get('X-DB-Version');
  return new Uint8Array(await response.arrayBuffer());
}
async function loadLegacyDatabase() {
  if (!window.indexedDB) return null;
  const request = indexedDB.open('road-to-1m', 1);
  const database = await new Promise((resolve, reject) => {
    request.onupgradeneeded = () => request.transaction.abort();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => request.error.name === 'AbortError' ? resolve(null) : reject(request.error);
  });
  if (!database || !database.objectStoreNames.contains('db')) return null;
  return new Promise((resolve, reject) => {
    const get = database.transaction('db').objectStore('db').get('main');
    get.onsuccess = () => resolve(get.result && get.result.data ? new Uint8Array(get.result.data) : null);
    get.onerror = () => reject(get.error);
  });
}
async function clearLegacyDatabase() {
  const request = indexedDB.open('road-to-1m', 1);
  const database = await new Promise((resolve, reject) => {
    request.onupgradeneeded = () => request.transaction.abort();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => request.error.name === 'AbortError' ? resolve(null) : reject(request.error);
  });
  if (!database || !database.objectStoreNames.contains('db')) return;
  await new Promise((resolve, reject) => {
    const transaction = database.transaction('db', 'readwrite');
    transaction.objectStore('db').delete('main');
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}
async function save() {
  try {
    const response = await apiFetch('/api/database', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/vnd.sqlite3',
        ...(serverETag ? { 'X-If-Version': serverETag } : { 'X-New-Database': '1' }),
      },
      body: db.export(),
    }, [409]);
    if (response.status === 409) {
      syncConflict = true; noIDB = true;
      toast('Données modifiées ailleurs : exportez cette copie, puis rechargez la page.');
      return false;
    }
    serverETag = response.headers.get('X-DB-Version');
    dbDirty = false; syncConflict = false; noIDB = false;
    return true;
  } catch (e) {
    noIDB = true;
    toast(`Sauvegarde impossible : ${e.message}`);
    return false;
  }
}
function seed() {
  db.run(`CREATE TABLE categories(id INTEGER PRIMARY KEY AUTOINCREMENT, sector TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN('in','out')), name TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE operations(id INTEGER PRIMARY KEY AUTOINCREMENT, sector TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN('in','out')), category_id INTEGER, amount INTEGER NOT NULL, date TEXT NOT NULL, note TEXT, created_at TEXT);
CREATE TABLE versements(id INTEGER PRIMARY KEY AUTOINCREMENT, sector TEXT NOT NULL, amount INTEGER NOT NULL, received INTEGER, status TEXT NOT NULL DEFAULT 'pending', date TEXT NOT NULL, validated_at TEXT);
CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT);`);
  for (const s of SECTORS) {
    for (const n of IN_DEFAULT[s.id]) run('INSERT INTO categories(sector,type,name) VALUES(?,?,?)', [s.id, 'in', n]);
    for (const n of OUT_DEFAULT) run('INSERT INTO categories(sector,type,name) VALUES(?,?,?)', [s.id, 'out', n]);
  }
  run('INSERT INTO meta VALUES(?,?)', ['created', new Date().toISOString()]);
}

function migrate() {
  try { run('ALTER TABLE operations ADD COLUMN vid INTEGER'); } catch (e) {}
  run('CREATE TABLE IF NOT EXISTS avail(week TEXT,person TEXT,day INTEGER,hour INTEGER,PRIMARY KEY(week,person,day,hour))');
  run("CREATE TABLE IF NOT EXISTS tickets(id INTEGER PRIMARY KEY AUTOINCREMENT,label TEXT NOT NULL,descr TEXT,created_at TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'open',validated_at TEXT)");
}
const PEOPLE = ['Mr Tedongap', 'Mr Pone', 'Mr Signe', 'Mr Tchemou'], DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const H0 = 7, H1 = 20, TICKET_MS = 12 * 3600 * 1000;
const ticketLeft = t => new Date(t.created_at).getTime() + TICKET_MS - Date.now();
const openTickets = () => q("SELECT * FROM tickets WHERE status='open'").filter(t => ticketLeft(t) > 0).length;

/* ================= Calculs ================= */
function stats(sec) {
  const t = today(), ws = weekStart(t);
  let net = 0, before = 0, week = 0;
  for (const o of q('SELECT type,amount,date FROM operations WHERE sector=?', [sec.id])) {
    const v = o.type === 'in' ? o.amount : -o.amount;
    net += v; if (o.date < ws) before += v; else week += v;
  }
  let paid = 0, pending = 0;
  for (const v of q('SELECT status,amount,received FROM versements WHERE sector=?', [sec.id])) {
    if (v.status === 'validated') paid += v.received || 0; else if (v.status === 'pending') pending += v.amount;
  }
  const left = diff(DEADLINE, t), remaining = Math.max(0, TARGET - net);
  const perDay = left > 0 ? remaining / left : remaining;
  const remStart = Math.max(0, TARGET - before);
  const weeks = Math.max(1, Math.ceil(Math.max(1, diff(DEADLINE, ws)) / 7));
  const weekTarget = Math.ceil(remStart / weeks);
  const total = diff(DEADLINE, START), el = clamp(diff(t, START), 0, total);
  const delta = net - TARGET * el / total;
  const state = net >= TARGET ? 'done' : delta >= .05 * TARGET ? 'ahead' : delta > -.05 * TARGET ? 'track' : delta > -.15 * TARGET ? 'late' : 'vlate';
  return { sec, net, paid, pending, caisse: net - paid - pending, left, remaining, perDay, week, weekTarget, state,
    base: clamp(net, 0, TARGET), surplus: Math.max(0, net - TARGET) };
}
const who = sec => sec.managers.join(' et ');
const msgFor = (s, salt = 0) => { const a = MSG[s.state]; return a[(dayIdx() + salt) % a.length](who(s.sec), s.sec.managers.length > 1); };

/* ================= État UI ================= */
let page, curSec;
const route = () => { page = location.hash.slice(1) || 'index'; curSec = SECTORS.find(s => s.id === page); };
route();
const st = { mode: 'in', amount: '', date: today(), note: '', cat: null, vamt: '', all: false, person: PEOPLE[0], week: weekStart(today()), day: 0 };

/* ================= Rendu ================= */
const pendingCount = () => q("SELECT COUNT(*) c FROM versements WHERE status='pending'")[0].c;
const nav = cur => { const n = pendingCount(), u = openTickets(); return `<nav><a class="brand" href="#">Road to 1M</a><div class="tabs">${
  SECTORS.map(s => `<a href="#${s.id}" class="${cur === s.id ? 'on' : ''}">${s.short}</a>`).join('')}<a href="#validation" class="${cur === 'validation' ? 'on' : ''}">Validation${n ? '<i></i>' : ''}</a><a href="#stats" class="${cur === 'stats' ? 'on' : ''}">Statistiques</a><a href="#dispo" class="${cur === 'dispo' ? 'on' : ''}">Disponibilité</a><a href="#urgence" class="${cur === 'urgence' ? 'on' : ''}">Urgence${u ? '<i></i>' : ''}</a></div></nav>`; };
const warn = () => noIDB ? `<div class="warn">${syncConflict
  ? 'Les données du serveur ont changé pendant votre modification. Exportez cette copie, puis rechargez la page avant de continuer.'
  : 'Serveur indisponible : vos modifications ne sont pas sauvegardées.'}</div>` : '';

function chartSVG() {
  const t = today(), total = diff(DEADLINE, START), el = clamp(diff(t, START), 0, total);
  const per = {}; SECTORS.forEach(s => per[s.id] = new Array(el + 1).fill(0));
  for (const o of q('SELECT sector,type,amount,date FROM operations'))
    if (per[o.sector]) per[o.sector][clamp(diff(o.date, START), 0, el)] += o.type === 'in' ? o.amount : -o.amount;
  const cum = new Array(el + 1).fill(0);
  SECTORS.forEach(s => { let c = 0; per[s.id].forEach((v, i) => { c += v; cum[i] += clamp(c, 0, TARGET); }); });
  const W = 640, H = 260, l = 46, r = 12, tp = 12, b = 26;
  const X = i => l + i / total * (W - l - r), Y = v => tp + (1 - v / GOAL) * (H - tp - b);
  const grid = [0, 250000, 500000, 750000, 1000000].map(v =>
    `<line class="g" x1="${l}" x2="${W - r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${l - 6}" y="${Y(v) + 4}" text-anchor="end">${v ? v / 1000 >= 1000 ? '1M' : v / 1000 + 'k' : '0'}</text>`).join('');
  const pts = cum.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const area = el > 0 ? `<polygon class="area" points="${X(0)},${Y(0)} ${pts} ${X(el)},${Y(0)}"/>` : '';
  const line = el > 0 ? `<polyline class="act" points="${pts}"/>` : '';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution">${grid}
<line class="ideal" x1="${X(0)}" y1="${Y(0)}" x2="${X(total)}" y2="${Y(GOAL)}"/>${area}${line}
<circle class="dot" cx="${X(el)}" cy="${Y(cum[el])}" r="4.5"/>
<text x="${l}" y="${H - 6}">8 nov</text><text x="${W - r}" y="${H - 6}" text-anchor="end">12 janv</text></svg>`;
}

function renderHome() {
  const S = SECTORS.map(stats);
  const prog = S.reduce((a, s) => a + s.base, 0);
  const surplus = S.reduce((a, s) => a + s.surplus, 0);
  const held = S.reduce((a, s) => a + s.paid, 0), pend = S.reduce((a, s) => a + s.pending, 0);
  const left = diff(DEADLINE, today()), rem = GOAL - prog;
  const perDay = left > 0 ? rem / left : rem;
  const pct = Math.floor(prog / GOAL * 100);
  const ranked = [...S].sort((a, b) => b.net - a.net);
  const lead = ranked[0], last = ranked[ranked.length - 1];
  const lines = [];
  if (lead.state === 'ahead' || lead.state === 'done') lines.push(`<p class="msg ${lead.state}">${esc(msgFor(lead, 1))}</p>`);
  if (last !== lead && (last.state === 'late' || last.state === 'vlate')) lines.push(`<p class="msg ${last.state}">${esc(msgFor(last, 2))}</p>`);
  const weekGain = S.reduce((a, s) => a + s.week, 0);
  const avg = prog / (Math.max(0, diff(today(), START)) + 1);
  const quote = QUOTES[dayIdx() % QUOTES.length], verse = VERSES[(dayIdx() + 3) % VERSES.length];
  return `${nav('')}${warn()}
<section class="card hero">
  <div>
    <div class="big">${fmt(prog)} <small>/ ${fmt(GOAL)} FCFA</small></div>
    <div class="bar"><i style="width:${clamp(prog / GOAL * 100, 0, 100)}%"></i></div>
    <div class="stats">
      <div><b>${pct}%</b><small>progression</small></div>
      <div><b>${left > 0 ? left : 0}</b><small>jours avant le 12 janv. 2027</small></div>
      <div><b>${rem > 0 ? fmt(perDay) : '✓'}</b><small>FCFA / jour requis</small></div>
    </div>
  </div>
  <div class="side">
    <p class="msg track" style="margin-top:0">${ENCOURAGE[dayIdx() % ENCOURAGE.length]}</p>
    ${lines.join('')}
    <div class="quote"><p>« ${esc(quote[0])} »${quote[1] ? ' — ' + esc(quote[1]) : ''}</p><p>${esc(verse[0])} — <em>${esc(verse[1])}</em></p></div>
  </div>
</section>
<div class="cols">
  <div class="col">
    <section class="card" style="--o:1"><h2>Top performeurs</h2>
    ${ranked.map((s, i) => `<a class="rank" href="#${s.sec.id}"><span class="n">${i + 1}</span><span>${s.sec.name}</span><b>${fmt(s.net)} · ${Math.floor(s.net / TARGET * 100)}%</b><div class="bar sm"><i style="width:${clamp(s.net / TARGET * 100, 0, 100)}%"></i></div></a>`).join('')}
    </section>
    <section class="card" style="--o:4"><h2>Évolution</h2>${chartSVG()}
    <div class="row"><span>${weekGain >= 0 ? '+' : ''}${fmt(weekGain)} cette semaine</span><span>${fmt(avg)} / jour en moyenne</span></div></section>
  </div>
  <div class="col">
    <section class="card" style="--o:2">
      <div class="kv"><span>Caisses de ${MIGUEL.name}</span><b>${fmt(held)} FCFA</b></div>
      ${pend ? `<a class="kv" href="#validation"><span>Versements à valider</span><b>${fmt(pend)} FCFA</b></a>` : ''}
      <div class="kv sur"><span>Surplus · nouveau projet & divertissement</span><b>${fmt(surplus)} FCFA</b></div>
    </section>
    <section class="card" style="--o:3"><h2>Données</h2>
      <div class="foot"><button data-act="export">Exporter</button><button data-act="import">Importer</button></div>
      <input type="file" id="file" accept=".sqlite,.db,application/octet-stream" hidden>
    </section>
  </div>
</div>`;
}

function renderSector(sec) {
  const s = stats(sec), t = today();
  const cats = q('SELECT id,name FROM categories WHERE sector=? AND type=? AND active=1 ORDER BY id', [sec.id, st.mode]);
  const pct = Math.floor(s.net / TARGET * 100);
  const pace = s.remaining === 0 ? 'Objectif atteint'
    : s.left > 0 ? `${fmt(s.perDay)} FCFA / jour · ${s.left} j` : `Échéance dépassée · reste ${fmt(s.remaining)}`;
  const wk = s.weekTarget > 0 ? clamp(s.week / s.weekTarget * 100, 0, 100) : 100;
  let pcts = sec.budget.map(b => [...b]);
  const sum = pcts.reduce((a, b) => a + b[1], 0);
  if (sum < 100) pcts.push(['Non affecté', 100 - sum]);
  const vs = q('SELECT * FROM versements WHERE sector=? ORDER BY id DESC', [sec.id]);
  const ops = q(`SELECT o.id,o.type,o.amount,o.date,o.note,c.name cat FROM operations o LEFT JOIN categories c ON c.id=o.category_id
    WHERE o.sector=? ORDER BY o.date DESC,o.id DESC`, [sec.id]);
  const shown = st.all ? ops : ops.slice(0, 20);
  const free = q('SELECT o.type,o.amount,o.date,c.name cat FROM operations o LEFT JOIN categories c ON c.id=o.category_id WHERE o.sector=? AND o.vid IS NULL ORDER BY o.date DESC,o.id DESC', [sec.id]);
  const lockedIds = new Set(q('SELECT id FROM operations WHERE sector=? AND vid IS NOT NULL', [sec.id]).map(r => r.id));
  return `${nav(sec.id)}${warn()}
<h1>${sec.name}</h1><p class="sub">${who(sec)}</p>
<div class="cols" style="margin-top:0">
<div class="col">
<section class="card" style="--o:1">
  <div class="big">${fmt(s.net)} <small>/ ${fmt(TARGET)} FCFA</small></div>
  <div class="bar"><i style="width:${clamp(s.net / TARGET * 100, 0, 100)}%"></i></div>
  <div class="row"><b>${pct}%</b><span>${pace}</span></div>
  <div class="week"><span>Semaine</span><div class="bar sm"><i style="width:${wk}%"></i></div><span>${fmt(s.week)} / ${fmt(s.weekTarget)}</span></div>
  <p class="msg ${s.state}">${esc(msgFor(s, SECTORS.indexOf(sec)))}</p>
</section>
<section class="card" style="--o:2">
  <div class="seg"><button data-act="mode" data-v="in" class="${st.mode === 'in' ? 'on in' : ''}">Entrée</button><button data-act="mode" data-v="out" class="${st.mode === 'out' ? 'on out' : ''}">Sortie</button></div>
  <div class="line"><input id="amt" inputmode="numeric" placeholder="Montant" autocomplete="off" value="${esc(st.amount)}"><input id="dt" type="date" max="${t}" value="${st.date}"></div>
  <input id="nt" placeholder="Note (facultatif)" autocomplete="off" value="${esc(st.note)}">
  <div class="chips">${cats.map(c => `<button data-act="cat" data-id="${c.id}" class="${st.cat == c.id ? 'sel' : ''}">${esc(c.name)}</button>`).join('')}</div>
  <button class="link" data-act="cats">Gérer les catégories</button>
</section>
<section class="card" style="--o:5"><h2>Opérations</h2>
${shown.map(o => `<div class="op"><span class="mut">${ddmm(o.date)}</span><span>${esc(o.cat || '—')}${o.note ? `<small>${esc(o.note)}</small>` : ''}</span><b class="${o.type}">${o.type === 'in' ? '+' : '−'}${fmt(o.amount)}</b>${lockedIds.has(o.id) ? '<span class="mut" title="Déjà versé : non modifiable">🔒</span>' : `<button class="x" data-act="delop" data-id="${o.id}" aria-label="Supprimer">×</button>`}</div>`).join('') || '<small>Aucune opération</small>'}
${!st.all && ops.length > 20 ? '<button class="more" data-act="more">Tout afficher</button>' : ''}
</section>
</div>
<div class="col">
<section class="card" style="--o:3"><h2>Budget</h2>
${pcts.map(([n, p]) => `<div class="kv"><span>${n} <em>${p}%</em></span><b>${fmt(s.base * p / 100)}</b></div>`).join('')}
<div class="kv sur"><span>Surplus · nouveau projet & divertissement</span><b>${fmt(s.surplus)}</b></div></section>
<section class="card" style="--o:4"><h2>Versements</h2>
  <div class="trio"><div><small>Caisse dispo</small><b>${fmt(s.caisse)}</b></div><div><small>Versé</small><b>${fmt(s.paid)}</b></div><div><small>En attente</small><b>${fmt(s.pending)}</b></div></div>
  <h2>Transactions de la caisse actuelle</h2>
  ${free.map(o => `<div class="vrow"><span class="mut">${ddmm(o.date)}</span><span>${esc(o.cat || '—')}</span><b class="${o.type === 'in' ? 'pos' : 'neg'}">${o.type === 'in' ? '+' : '−'}${fmt(o.amount)}</b></div>`).join('') || '<small>Aucune transaction non versée</small>'}
  <small style="display:block;margin:8px 0">Après le versement, ces opérations seront verrouillées.</small>
  <div class="line" style="margin-top:0"><input id="vamt" inputmode="numeric" placeholder="Montant à verser" autocomplete="off" value="${esc(st.vamt)}"><button class="primary" data-act="verser">Verser</button></div>
  <small style="display:block;margin-top:8px">${MIGUEL.name} · ${MIGUEL.tel}</small>
  <div style="margin-top:8px">${vs.map(v => `<div class="vrow"><span class="mut">${ddmm(v.date)}</span><b>${v.status === 'validated' ? fmt(v.received) + (v.received < v.amount ? ` <em>/ ${fmt(v.amount)}</em>` : '') : fmt(v.amount)}</b>${
    v.status === 'validated' ? '<span class="badge ok">Validé</span>' : v.status === 'rejected' ? '<span class="badge no">Refusé</span>' : '<span class="badge">En attente</span>'}</div>`).join('')}</div>
</section>
</div>
</div>`;
}

function renderValidation() {
  if (!unlocked) return `${nav('validation')}
<section class="card lock"><h1>Validation</h1><p class="mut">Réservé à ${MIGUEL.name}</p>
<div class="line"><button class="primary" data-act="unlock">Accéder à la validation</button></div></section>`;
  const sname = id => SECTORS.find(s => s.id === id).name;
  const pend = q("SELECT * FROM versements WHERE status='pending' ORDER BY id");
  const hist = q("SELECT * FROM versements WHERE status!='pending' ORDER BY id DESC LIMIT 15");
  const S = SECTORS.map(stats), held = S.reduce((a, s) => a + s.paid, 0);
  return `${nav('validation')}
<div class="head"><div><h1>Validation</h1><p class="sub">${MIGUEL.name} · ${MIGUEL.tel}</p></div><button data-act="lock">Verrouiller</button></div>
<div class="cols" style="margin-top:0">
<div class="col"><section class="card" style="--o:1"><h2>À valider</h2>
${pend.map(v => `<div class="pend"><div class="top"><span>${sname(v.sector)} <em>· ${ddmm(v.date)}</em></span><b>${fmt(v.amount)}</b></div>
<div class="act"><input id="vr-${v.id}" inputmode="numeric" value="${v.amount}" aria-label="Montant reçu"><button class="ok" data-act="vok" data-id="${v.id}">Valider</button><button class="no" data-act="vno" data-id="${v.id}">Refuser</button></div></div>`).join('') || '<small>Aucun versement en attente</small>'}
</section></div>
<div class="col">
<section class="card" style="--o:2"><h2>Caisses</h2>
${S.map(s => `<div class="kv"><span>${s.sec.name}</span><b>${fmt(s.paid)}</b></div>`).join('')}
<div class="kv sur"><span>Total</span><b>${fmt(held)} FCFA</b></div></section>
<section class="card" style="--o:3"><h2>Historique</h2>
${hist.map(v => `<div class="vrow"><span class="mut">${ddmm(v.date)}</span><span>${sname(v.sector)} · <b>${fmt(v.status === 'validated' ? v.received : v.amount)}</b>${v.status === 'validated' && v.received < v.amount ? ` <em>/ ${fmt(v.amount)}</em>` : ''}</span>${v.status === 'validated' ? '<span class="badge ok">Validé</span>' : '<span class="badge no">Refusé</span>'}</div>`).join('') || '<small>Aucun historique</small>'}
</section></div></div>`;
}

/* ================= Statistiques ================= */
const COLORS = ['#0071e3', '#1f8a3e', '#d70015', '#b25000', '#8e44ad', '#0f766e', '#e67e22', '#7f8c8d', '#c2185b'];
function donut(items) {
  const tot = items.reduce((a, i) => a + i.v, 0); if (!tot) return '<small>Aucune donnée</small>';
  let off = 0; const R = 15.9155;
  const arcs = items.map((it, i) => { const p = it.v / tot * 100, a = `<circle r="${R}" cx="21" cy="21" fill="none" stroke="${COLORS[i % 9]}" stroke-width="7" stroke-dasharray="${p} ${100 - p}" stroke-dashoffset="${25 - off}"/>`; off += p; return a; }).join('');
  return `<div class="pie"><svg viewBox="0 0 42 42" role="img">${arcs}</svg><div>${items.map((it, i) => `<div class="lg"><i style="background:${COLORS[i % 9]}"></i><span>${esc(it.n)}</span><b>${Math.round(it.v / tot * 100)}%</b></div>`).join('')}</div></div>`;
}
function ranking(rows, cls) {
  const max = rows.length ? rows[0].v : 1;
  return rows.map((r, i) => `<div class="rank2"><span class="n">${i + 1}</span><span>${esc(r.n)}</span><b class="${cls}">${fmt(r.v)}</b><div class="bar sm"><i style="width:${r.v / max * 100}%;background:var(--${cls === 'pos' ? 'pos' : 'out'})"></i></div></div>`).join('') || '<small>Aucune donnée</small>';
}
function renderStats() {
  const sum = t => q('SELECT COALESCE(SUM(amount),0) s FROM operations WHERE type=?', [t])[0].s;
  const tin = sum('in'), tout = sum('out'), net = tin - tout;
  const S = SECTORS.map(stats), prog = S.reduce((a, s) => a + s.base, 0);
  const days = Math.max(1, diff(today(), START) + 1), nOps = q('SELECT COUNT(*) c FROM operations')[0].c;
  const best = q("SELECT date,SUM(amount) s FROM operations WHERE type='in' GROUP BY date ORDER BY s DESC LIMIT 1")[0];
  const byCat = t => q('SELECT c.name n,SUM(o.amount) v FROM operations o JOIN categories c ON c.id=o.category_id WHERE o.type=? GROUP BY c.name ORDER BY v DESC', [t]);
  const cin = byCat('in'), cout = byCat('out');
  const secIn = SECTORS.map(s => ({ n: s.name, v: q("SELECT COALESCE(SUM(amount),0) s FROM operations WHERE sector=? AND type='in'", [s.id])[0].s })).filter(x => x.v);
  const kpi = (l, v) => `<div class="kpi"><small>${l}</small><b>${v}</b></div>`;
  return `${nav('stats')}${warn()}<h1>Statistiques</h1><p class="sub">Vue d’ensemble du projet</p>
<section class="card"><div class="kpis">${kpi('Entrées', fmt(tin))}${kpi('Sorties', fmt(tout))}${kpi('Net', fmt(net))}${kpi('Objectif atteint', Math.floor(prog / GOAL * 100) + '%')}${kpi('Entrées / jour', fmt(tin / days))}${kpi('Taux de dépenses', tin ? Math.round(tout / tin * 100) + '%' : '—')}${kpi('Opérations', nOps)}${kpi('Meilleur jour', best ? fmt(best.s) + ' · ' + ddmm(best.date) : '—')}</div></section>
<div class="cols"><div class="col">
<section class="card" style="--o:1"><h2>Courbe de progression</h2>${chartSVG()}</section>
<section class="card" style="--o:3"><h2>Classement des catégories de dépenses</h2>${ranking(cout, 'neg')}</section>
<section class="card" style="--o:5"><h2>Classement des catégories d’entrées</h2>${ranking(cin, 'pos')}</section>
</div><div class="col">
<section class="card" style="--o:2"><h2>Entrées par secteur</h2>${donut(secIn)}</section>
<section class="card" style="--o:4"><h2>Répartition des dépenses</h2>${donut(cout.slice(0, 8))}</section>
<section class="card" style="--o:6"><h2>Progression par secteur</h2>${S.map(s => `<div class="kv"><span>${s.sec.name}</span><b>${Math.floor(s.net / TARGET * 100)}%</b></div>`).join('')}</section>
</div></div>`;
}

/* ================= Disponibilité ================= */
function renderDispo() {
  const busy = new Set(q('SELECT person,day,hour FROM avail WHERE week=?', [st.week]).map(r => `${r.person}|${r.day}|${r.hour}`));
  const hrs = Array.from({ length: H1 - H0 }, (_, i) => H0 + i);
  const head = `<tr><th></th>${DAYS.map(d => `<th>${d}</th>`).join('')}</tr>`;
  const mine = `<table class="grid">${head}${hrs.map(h => `<tr><th>${h}h</th>${DAYS.map((d, i) => `<td><button data-act="slot" data-d="${i}" data-h="${h}" class="${busy.has(`${st.person}|${i}|${h}`) ? 'busy' : ''}" aria-label="${d} ${h}h"></button></td>`).join('')}</tr>`).join('')}</table>`;
  const all = `<table class="grid">${head}${hrs.map(h => `<tr><th>${h}h</th>${DAYS.map((d, i) => `<td><button data-act="who" data-d="${i}" data-h="${h}" class="f${PEOPLE.filter(p => !busy.has(`${p}|${i}|${h}`)).length}">${PEOPLE.filter(p => !busy.has(`${p}|${i}|${h}`)).length}</button></td>`).join('')}</tr>`).join('')}</table>`;
  const dayList = PEOPLE.map(p => {
    const spans = []; hrs.filter(h => !busy.has(`${p}|${st.day}|${h}`)).forEach(h => { const l = spans[spans.length - 1]; if (l && l[1] === h) l[1] = h + 1; else spans.push([h, h + 1]); });
    return `<div class="kv"><span>${p}</span><b>${spans.map(x => `${x[0]}h–${x[1]}h`).join(', ') || 'Occupé'}</b></div>`;
  }).join('');
  return `${nav('dispo')}${warn()}<h1>Disponibilité</h1><p class="sub">Touchez les créneaux où vous êtes occupé. Le reste est libre.</p>
<div class="head2"><button data-act="wk" data-v="-7">‹</button><b>Semaine du ${ddmm(st.week)} au ${ddmm(addDays(st.week, 6))}</b><button data-act="wk" data-v="7">›</button></div>
<div class="cols"><div class="col">
<section class="card" style="--o:1"><h2>Mes occupations</h2><div class="chips" style="margin:0 0 14px">${PEOPLE.map(p => `<button data-act="pers" data-v="${p}" class="${st.person === p ? 'sel' : ''}">${p}</button>`).join('')}</div>${mine}</section></div>
<div class="col"><section class="card" style="--o:2"><h2>Vue globale · collaborateurs libres (sur 4)</h2>${all}
<div class="chips" style="margin:14px 0 6px">${DAYS.map((d, i) => `<button data-act="day" data-v="${i}" class="${st.day === i ? 'sel' : ''}">${d}</button>`).join('')}</div>${dayList}</section></div></div>`;
}

/* ================= Urgence ================= */
function renderUrgence() {
  const all = q('SELECT * FROM tickets ORDER BY id DESC');
  const live = all.filter(t => t.status === 'open' && ticketLeft(t) > 0), exp = all.filter(t => t.status === 'open' && ticketLeft(t) <= 0), ok = all.filter(t => t.status === 'validated').slice(0, 15);
  const left = ms => `${Math.floor(ms / 3600000)}h${pad(Math.floor(ms % 3600000 / 60000))}`;
  const card = (t, tag, btn) => `<div class="pend"><div class="top"><b style="font-size:17px">${esc(t.label)}</b>${tag}</div>${t.descr ? `<p class="mut" style="margin-top:6px">${esc(t.descr)}</p>` : ''}<div class="act">${btn}</div></div>`;
  return `${nav('urgence')}${warn()}<h1>Urgence</h1><p class="sub">Chaque ticket doit être validé en moins de 12 h, sinon il expire.</p>
<div class="cols"><div class="col">
<section class="card" style="--o:1"><h2>Nouveau ticket</h2><input id="tl" placeholder="Libellé" autocomplete="off" value="${esc(st.tl || '')}"><input id="td" placeholder="Description" autocomplete="off" style="margin-top:10px" value="${esc(st.td || '')}"><div class="line"><button class="primary" data-act="tadd" style="width:100%">Ajouter</button></div></section>
<section class="card" style="--o:3"><h2>Validés</h2>${ok.map(t => `<div class="vrow"><span class="mut">${ddmm(t.validated_at.slice(0, 10))}</span><span>${esc(t.label)}</span><span class="badge ok">Validé</span></div>`).join('') || '<small>Aucun</small>'}</section></div>
<div class="col"><section class="card" style="--o:2"><h2>En cours</h2>
${live.map(t => card(t, `<span class="badge">${left(ticketLeft(t))} restant</span>`, `<button class="ok" data-act="tok" data-id="${t.id}">Valider</button>`)).join('') || '<small>Aucun ticket en cours</small>'}
${exp.map(t => card(t, '<span class="badge no">Expiré</span>', `<button class="primary" data-act="trenew" data-id="${t.id}">Reconduire</button>`)).join('')}</section></div></div>`;
}
const tickAct = async (sql, p) => { run(sql, p); await save(); render(); };

function render() {
  $('#app').innerHTML = curSec ? renderSector(curSec) : page === 'validation' ? renderValidation() : page === 'stats' ? renderStats() : page === 'dispo' ? renderDispo() : page === 'urgence' ? renderUrgence() : renderHome();
}

/* ================= Interactions ================= */
let toastT;
function toast(m) {
  let e = $('#toast'); if (!e) { e = document.createElement('div'); e.id = 'toast'; document.body.appendChild(e); }
  e.textContent = m; e.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('on'), 2200);
}
const shake = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); el.focus(); };

async function addOp() {
  st.amount = $('#amt').value; st.note = $('#nt').value; st.date = $('#dt').value;
  const amount = parseAmt(st.amount);
  if (!amount) return shake($('#amt'));
  if (!st.cat) return toast('Choisissez une catégorie');
  if (!st.date || st.date > today()) return shake($('#dt'));
  run('INSERT INTO operations(sector,type,category_id,amount,date,note,created_at) VALUES(?,?,?,?,?,?,?)',
    [curSec.id, st.mode, st.cat, amount, st.date, st.note.trim(), new Date().toISOString()]);
  st.amount = ''; st.note = ''; st.cat = null;
  if (!await save()) { render(); return; }
  render(); $('#amt').focus(); toast('Enregistré');
}

function unlock() { unlocked = true; render(); toast('Déverrouillé'); }

async function verser() {
  st.vamt = $('#vamt').value;
  const s = stats(curSec), amount = parseAmt(st.vamt);
  if (!amount) return shake($('#vamt'));
  if (amount > s.caisse) { toast('Supérieur à la caisse disponible'); return shake($('#vamt')); }
  run('INSERT INTO versements(sector,amount,status,date) VALUES(?,?,?,?)', [curSec.id, amount, 'pending', today()]);
  run('UPDATE operations SET vid=? WHERE sector=? AND vid IS NULL', [q('SELECT last_insert_rowid() i')[0].i, curSec.id]);
  st.vamt = '';
  if (!await save()) { render(); return; }
  render(); toast('Versement envoyé');
}

async function validate(id, ok) {
  if (!unlocked) return;
  const v = q('SELECT amount FROM versements WHERE id=?', [id])[0]; if (!v) return;
  if (!ok) run('UPDATE versements SET status=?, received=0, validated_at=? WHERE id=?', ['rejected', new Date().toISOString(), id]);
  else {
    const r = parseAmt($('#vr-' + id).value);
    if (!r) return shake($('#vr-' + id));
    if (r > v.amount) { toast('Supérieur au montant versé'); return shake($('#vr-' + id)); }
    run('UPDATE versements SET status=?, received=?, validated_at=? WHERE id=?', ['validated', r, new Date().toISOString(), id]);
  }
  await save(); render();
}

function exportDB() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([db.export()], { type: 'application/octet-stream' }));
  a.download = `road-to-1m-${today()}.sqlite`; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
async function importDB(file) {
  if (!file) return;
  try {
    const nd = new SQL.Database(new Uint8Array(await file.arrayBuffer()));
    const names = (nd.exec("SELECT name FROM sqlite_master WHERE type='table'")[0] || { values: [] }).values.flat();
    if (!['operations', 'categories', 'versements'].every(n => names.includes(n))) throw new Error('invalid');
    if (!confirm('Remplacer toutes les données actuelles par ce fichier ?')) { nd.close(); return; }
    db = nd; dbDirty = true; migrate();
    if (!await save()) { render(); return; }
    render(); toast('Données importées');
  } catch (e) { toast('Fichier invalide'); }
}

document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const id = b.dataset.id, act = b.dataset.act;
  if (act === 'mode') { st.mode = b.dataset.v; st.cat = null; render(); $('#amt').focus(); }
  else if (act === 'cat') {
    st.cat = +id; st.amount = $('#amt').value;
    if (parseAmt(st.amount)) addOp(); else { render(); shake($('#amt')); }
  }
  else if (act === 'verser') verser();
  else if (act === 'unlock') unlock();
  else if (act === 'lock') { unlocked = false; render(); }
  else if (act === 'vok') validate(+id, true);
  else if (act === 'vno') validate(+id, false);
  else if (act === 'delop') { if (q('SELECT vid FROM operations WHERE id=?', [+id])[0]?.vid) toast('Opération déjà versée : verrouillée');
    else if (confirm('Supprimer cette opération ?')) { run('DELETE FROM operations WHERE id=?', [+id]); await save(); render(); } }
  else if (act === 'more') { st.all = true; render(); }
  else if (act === 'cats') { renderDlg(); dlg.showModal(); }
  else if (act === 'slot') { const a = [st.week, st.person, +b.dataset.d, +b.dataset.h], k = q('SELECT 1 x FROM avail WHERE week=? AND person=? AND day=? AND hour=?', a);
    await tickAct(k.length ? 'DELETE FROM avail WHERE week=? AND person=? AND day=? AND hour=?' : 'INSERT INTO avail VALUES(?,?,?,?)', a); }
  else if (act === 'who') { const d = +b.dataset.d, h = +b.dataset.h, f = PEOPLE.filter(p => !q('SELECT 1 x FROM avail WHERE week=? AND person=? AND day=? AND hour=?', [st.week, p, d, h]).length); toast(`${DAYS[d]} ${h}h · ${f.join(', ') || 'personne de libre'}`); }
  else if (act === 'pers') { st.person = b.dataset.v; render(); }
  else if (act === 'day') { st.day = +b.dataset.v; render(); }
  else if (act === 'wk') { st.week = addDays(st.week, +b.dataset.v); render(); }
  else if (act === 'tadd') { const l = $('#tl').value.trim(); if (!l) return shake($('#tl')); const d = $('#td').value.trim(); st.tl = ''; st.td = ''; await tickAct('INSERT INTO tickets(label,descr,created_at) VALUES(?,?,?)', [l, d, new Date().toISOString()]); }
  else if (act === 'tok') tickAct("UPDATE tickets SET status='validated',validated_at=? WHERE id=?", [new Date().toISOString(), +id]);
  else if (act === 'trenew') tickAct("UPDATE tickets SET created_at=? WHERE id=?", [new Date().toISOString(), +id]);
  else if (act === 'export') exportDB();
  else if (act === 'import') $('#file').click();
});
document.addEventListener('input', e => {
  const i = e.target.id;
  if (i === 'amt') st.amount = e.target.value;
  else if (i === 'dt') st.date = e.target.value;
  else if (i === 'nt') st.note = e.target.value;
  else if (i === 'vamt') st.vamt = e.target.value;
  else if (i === 'tl') st.tl = e.target.value;
  else if (i === 'td') st.td = e.target.value;
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (e.target.id === 'amt' || e.target.id === 'nt') { if (st.cat) addOp(); else if (parseAmt(st.amount)) toast('Choisissez une catégorie'); }
  else if (e.target.id === 'vamt') verser();
  else if (e.target.id && e.target.id.startsWith('vr-')) validate(+e.target.id.slice(3), true);
});
document.addEventListener('change', e => { if (e.target.id === 'file') { importDB(e.target.files[0]); e.target.value = ''; } });

/* ---- Dialogue catégories ---- */
const dlg = document.createElement('dialog');
document.body.appendChild(dlg);
function renderDlg() {
  const rows = t => q('SELECT id,name,active FROM categories WHERE sector=? AND type=? ORDER BY id', [curSec.id, t]);
  dlg.innerHTML = `<div class="dhead"><h2>Catégories</h2><button class="x" data-d="close">✕</button></div>` +
    ['in', 'out'].map(t => `<h3>${t === 'in' ? 'Entrées' : 'Sorties'}</h3>${rows(t).map(c =>
      `<div class="crow"><input data-cname="${c.id}" value="${esc(c.name)}"><input type="checkbox" data-cact="${c.id}" ${c.active ? 'checked' : ''} title="Actif"></div>`).join('')}
      <div class="crow"><input data-new="${t}" placeholder="Nouvelle catégorie"><button data-add="${t}">+</button></div>`).join('');
}
async function addCat(t) {
  const i = dlg.querySelector(`[data-new="${t}"]`), n = i.value.trim();
  if (!n) return i.focus();
  run('INSERT INTO categories(sector,type,name) VALUES(?,?,?)', [curSec.id, t, n]);
  await save(); renderDlg(); dlg.querySelector(`[data-new="${t}"]`).focus();
}
dlg.addEventListener('click', e => {
  if (e.target === dlg || e.target.dataset.d === 'close') dlg.close();
  else if (e.target.dataset.add) addCat(e.target.dataset.add);
});
dlg.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset.new) addCat(e.target.dataset.new); });
dlg.addEventListener('change', async e => {
  const t = e.target;
  if (t.dataset.cname) { const n = t.value.trim(); if (n) run('UPDATE categories SET name=? WHERE id=?', [n, +t.dataset.cname]); else renderDlg(); }
  else if (t.dataset.cact) run('UPDATE categories SET active=? WHERE id=?', [t.checked ? 1 : 0, +t.dataset.cact]);
  await save();
});
dlg.addEventListener('close', render);

/* ================= Démarrage ================= */
async function init() {
  SQL = await initSqlJs({ wasmBinary: Uint8Array.from(atob(window.SQLWASM), c => c.charCodeAt(0)) });
  try {
    const saved = await loadRemote();
    if (saved) db = new SQL.Database(saved);
    else {
      const legacy = await loadLegacyDatabase();
      if (legacy) db = new SQL.Database(legacy);
      else { db = new SQL.Database(); seed(); }
    }
    migrate();
    if (!saved) {
      const migrated = await save();
      if (migrated) await clearLegacyDatabase();
    } else if (dbDirty) await save();
  } catch (e) {
    noIDB = true;
    $('#app').innerHTML = `<main class="card"><h1>Connexion impossible</h1><p>${esc(e.message)}</p><p>Vérifiez votre connexion et rechargez la page.</p></main>`;
    console.error('Échec du démarrage de la base partagée:', e);
    return;
  }
  render();
  window.addEventListener('hashchange', () => { route(); render(); window.scrollTo(0, 0); });
  let day = today();
  async function refresh() {
    if (dlg.open) return;
    const a = document.activeElement;
    if (a && a.tagName === 'INPUT') return;
    try {
      const previousETag = serverETag;
      const data = await loadRemote();
      if (data && serverETag !== previousETag) {
        if (dbDirty) { syncConflict = true; noIDB = true; }
        else { db = new SQL.Database(data); migrate(); if (dbDirty) await save(); }
        render();
      }
      else if (page === 'urgence') render();
      else if (day !== today()) { day = today(); render(); }
      if (data) noIDB = syncConflict;
    } catch (e) { noIDB = true; console.error('Échec de synchronisation:', e); }
  }
  window.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  setInterval(refresh, 4000);
}
init();
})();
