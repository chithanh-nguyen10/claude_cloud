/* CP Tracker — dữ liệu và lớp gọi xuống máy (Tauri) hoặc trình duyệt (để chạy thử). */
(function (global) {
'use strict';

/* ---------------- backend ---------------- */
const TAURI = global.__TAURI__;
const invoke = TAURI && TAURI.core && TAURI.core.invoke;

const desktop = invoke && {
  kind: 'desktop',
  load: () => invoke('load_db'),
  save: (json) => invoke('save_db', { json }),
  fetchText: (url) => invoke('fetch_text', { url }),
  openUrl: (url) => invoke('open_url', { url }),
  info: () => invoke('info'),
  openDataDir: () => invoke('open_data_dir'),
  saveFile: (defaultName, content) => invoke('save_file_dialog', { defaultName, content }),
  openFile: () => invoke('open_file_dialog'),
  pickDataDir: () => invoke('pick_data_dir'),
  resetDataDir: () => invoke('reset_data_dir'),
};

const LS_KEY = 'cptracker.db';
const browser = {
  kind: 'browser',
  load: async () => { try { return localStorage.getItem(LS_KEY) || ''; } catch (e) { return ''; } },
  save: async (json) => { try { localStorage.setItem(LS_KEY, json); } catch (e) { /* ignore */ } },
  // tests can plug in a fake fetch; real sites block cross-origin requests from a plain web page
  fetchText: async (url) => {
    if (global.__CPT_FETCH__) return global.__CPT_FETCH__(url);
    const r = await fetch(url);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.text();
  },
  openUrl: async (url) => { global.open(url, '_blank', 'noopener'); },
  info: async () => ({ data_dir: '(trình duyệt / browser)', db_path: 'localStorage', backup_dir: '—', version: 'web' }),
  openDataDir: async () => {},
  saveFile: async (name, content) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'application/octet-stream' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return name;
  },
  openFile: () => new Promise((resolve) => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = () => { const f = inp.files[0]; if (!f) return resolve(null); const rd = new FileReader(); rd.onload = () => resolve(String(rd.result)); rd.readAsText(f); };
    inp.click();
  }),
  pickDataDir: async () => null,
  resetDataDir: async () => '',
};
const Backend = desktop || browser;

/* ---------------- data ---------------- */
const STATUSES = ['todo', 'doing', 'stuck', 'ac', 'skip'];
let db = { version: 1, problems: [], collections: [], settings: { lang: 'vi', theme: 'system' } };
const listeners = [];
let saveTimer = null, saving = Promise.resolve();

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function now() { return new Date().toISOString(); }

function normalizeProblem(p) {
  return Object.assign({
    id: uid(), key: '', platform: 'other', pid: '', url: '', title: '', difficulty: null, diffLabel: '', tags: [],
    status: 'todo', inQueue: false, queuePos: 0, fav: false, stars: 0, myTags: [], collections: [],
    notes: '', code: '', codeLang: 'cpp', editorial: '', addedAt: now(), updatedAt: now(), acAt: null,
    titleManual: false, metaError: null,
  }, p);
}

async function load() {
  const raw = await Backend.load();
  if (raw) {
    const d = JSON.parse(raw);
    db = Object.assign({ version: 1, problems: [], collections: [], settings: {} }, d);
    db.problems = db.problems.map(normalizeProblem);
    db.settings = Object.assign({ lang: 'vi', theme: 'system' }, db.settings);
  }
  return db;
}
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 350);
}
function flush() {
  clearTimeout(saveTimer);
  const json = JSON.stringify(db, null, 1);
  saving = saving.then(() => Backend.save(json)).catch((e) => { listeners.forEach((f) => f('saveError', e)); });
  return saving;
}
function changed(what) { scheduleSave(); listeners.forEach((f) => f(what)); }
function on(f) { listeners.push(f); }

function byKey(key) { return db.problems.find((p) => p.key === key); }
function byId(id) { return db.problems.find((p) => p.id === id); }
function maxQueuePos() { return db.problems.reduce((m, p) => (p.inQueue ? Math.max(m, p.queuePos) : m), 0); }

function addProblem(fields) {
  const p = normalizeProblem(fields);
  if (p.inQueue && !p.queuePos) p.queuePos = maxQueuePos() + 1;
  db.problems.push(p);
  changed('problems');
  return p;
}
function update(id, patch) {
  const p = byId(id); if (!p) return null;
  if (patch.status && patch.status !== p.status) {
    if (patch.status === 'ac' && !p.acAt) patch.acAt = now();
    if (patch.status !== 'ac') patch.acAt = null;
  }
  if (patch.inQueue && !p.inQueue) patch.queuePos = maxQueuePos() + 1;
  Object.assign(p, patch, { updatedAt: now() });
  changed('problem');
  return p;
}
function remove(id) { db.problems = db.problems.filter((p) => p.id !== id); changed('problems'); }
function reorderQueue(ids) {
  ids.forEach((id, i) => { const p = byId(id); if (p) p.queuePos = i + 1; });
  changed('queue');
}
function addCollection(name) { const c = { id: uid(), name }; db.collections.push(c); changed('collections'); return c; }
function renameCollection(id, name) { const c = db.collections.find((x) => x.id === id); if (c) { c.name = name; changed('collections'); } }
function removeCollection(id) {
  db.collections = db.collections.filter((c) => c.id !== id);
  db.problems.forEach((p) => { p.collections = p.collections.filter((x) => x !== id); });
  changed('collections');
}
function setSetting(k, v) { db.settings[k] = v; changed('settings'); }

/* import / export */
function exportJSON() { return JSON.stringify(db, null, 1); }
function csvCell(v) { const s = Array.isArray(v) ? v.join('; ') : v === null || v === undefined ? '' : String(v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function exportCSV() {
  const cols = ['platform', 'pid', 'title', 'url', 'diffLabel', 'status', 'inQueue', 'fav', 'stars', 'tags', 'myTags', 'addedAt', 'acAt'];
  const colNames = new Map(db.collections.map((c) => [c.id, c.name]));
  const lines = [cols.concat(['collections', 'notes']).join(',')];
  db.problems.forEach((p) => lines.push(cols.map((c) => csvCell(p[c])).concat([csvCell(p.collections.map((x) => colNames.get(x) || '')), csvCell(p.notes)]).join(',')));
  return '﻿' + lines.join('\r\n'); // BOM so Excel reads Vietnamese correctly
}
/* mode 'merge': add problems not present (by key) and collections by name; 'replace': take the file as is */
function importJSON(text, mode) {
  const d = JSON.parse(text);
  if (!d || !Array.isArray(d.problems)) throw new Error('badFile');
  if (mode === 'replace') {
    db = Object.assign({ version: 1, problems: [], collections: [], settings: db.settings }, d);
    db.problems = db.problems.map(normalizeProblem);
    changed('all');
    return { added: db.problems.length, skipped: 0 };
  }
  const colMap = new Map();
  (d.collections || []).forEach((c) => {
    let mine = db.collections.find((x) => x.name === c.name);
    if (!mine) { mine = { id: uid(), name: c.name }; db.collections.push(mine); }
    colMap.set(c.id, mine.id);
  });
  let added = 0, skipped = 0;
  d.problems.forEach((raw) => {
    const p = normalizeProblem(raw);
    if (p.key && byKey(p.key)) { skipped++; return; }
    p.id = uid();
    p.collections = (p.collections || []).map((x) => colMap.get(x)).filter(Boolean);
    if (p.inQueue) p.queuePos = maxQueuePos() + 1;
    db.problems.push(p); added++;
  });
  changed('all');
  return { added, skipped };
}

global.Store = {
  Backend, STATUSES, load, flush, on, get db() { return db; },
  byKey, byId, addProblem, update, remove, reorderQueue, addCollection, renameCollection, removeCollection, setSetting,
  exportJSON, exportCSV, importJSON,
};
})(window);
