/* CP Tracker — giao diện */
(function () {
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const esc = (s) => String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const P = Platforms, S = Store, B = Store.Backend;

const ui = {
  view: 'queue', sel: null, notesMode: 'write', codeMode: 'write', confirmDel: false,
  f: { q: '', platform: '', status: '', tag: '', sort: '' },
};
const metaCtx = {};
const loading = new Set();

/* ================================================================ helpers */
function toast(msg, kind) {
  const el = document.createElement('div');
  el.className = 'toast' + (kind ? ' ' + kind : ''); el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), kind === 'err' ? 6000 : 2600);
}
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(I18N.lang === 'en' ? 'en-GB' : 'vi-VN') + ' ' + d.toLocaleTimeString(I18N.lang === 'en' ? 'en-GB' : 'vi-VN', { hour: '2-digit', minute: '2-digit' });
}
function diffColor(p) {
  const d = p.difficulty;
  if (d === null || d === undefined || d === '') return 'var(--muted)';
  if (p.platform === 'cf' || p.platform === 'codechef') {
    return d < 1200 ? '#808080' : d < 1400 ? '#008000' : d < 1600 ? '#03a89e' : d < 1900 ? '#2e5bd7' : d < 2100 ? '#aa00aa' : d < 2400 ? '#ff8c00' : '#e5242b';
  }
  if (p.platform === 'atcoder') {
    return d < 400 ? '#808080' : d < 800 ? '#804000' : d < 1200 ? '#008000' : d < 1600 ? '#00a8a8' : d < 2000 ? '#2e5bd7' : d < 2400 ? '#c0c000' : d < 2800 ? '#ff8000' : '#e5242b';
  }
  return 'var(--fg)';
}
function badge(p) { const pl = P.PLATFORMS[p.platform] || P.PLATFORMS.other; return `<span class="badge" style="background:${pl.color}" title="${esc(pl.name)}">${esc(pl.short)}</span>`; }
function done(p) { return p.status === 'ac' || p.status === 'skip'; }
function splitTags(s) { return [...new Set(String(s || '').split(',').map((x) => x.trim()).filter(Boolean))]; }
function sanitize(html) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  doc.querySelectorAll('script,iframe,object,embed,style,link,meta,form').forEach((n) => n.remove());
  doc.querySelectorAll('*').forEach((n) => {
    [...n.attributes].forEach((a) => { if (/^on/i.test(a.name) || (/^(href|src)$/i.test(a.name) && /^\s*javascript:/i.test(a.value))) n.removeAttribute(a.name); });
  });
  return doc.body.firstChild.innerHTML;
}

/* ================================================================ theme & language */
function applySettings() {
  const st = S.db.settings;
  I18N.lang = st.lang;
  const dark = st.theme === 'dark' || (st.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  $('#hlLight').disabled = dark; $('#hlDark').disabled = !dark;
  I18N.apply();
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { applySettings(); });

/* ================================================================ adding problems */
function candidates(text) {
  // every whitespace-separated word: links, or short codes like CF1900A
  return String(text).split(/[\s<>"'`]+/).map((w) => w.replace(/[),.;]+$/, '')).filter(Boolean);
}
function contextFields() {
  const v = ui.view;
  if (v === 'fav') return { fav: true };
  if (v.startsWith('col:')) return { collections: [v.slice(4)] };
  if (v === 'done') return { status: 'ac' };
  return { inQueue: true };
}
function addFromText(text, ctx) {
  ctx = ctx || contextFields();
  let added = 0;
  const bad = [];
  let lastId = null;
  for (const c of candidates(text)) {
    let parsed = P.parseLink(c);
    if (!parsed) {
      if (/^https?:\/\//i.test(c)) {
        parsed = { platform: 'other', pid: c.replace(/^https?:\/\//i, '').replace(/\/+$/, ''), url: c, extra: {} };
        toast(t('t.other'));
      } else { bad.push(c); continue; }
    }
    const key = P.keyOf(parsed);
    const ex = S.byKey(key);
    if (ex) {
      const patch = {};
      if (ctx.inQueue && !ex.inQueue) patch.inQueue = true;
      if (ctx.fav && !ex.fav) patch.fav = true;
      if (ctx.collections && !ex.collections.includes(ctx.collections[0])) patch.collections = ex.collections.concat(ctx.collections);
      if (ctx.status && ex.status !== ctx.status) patch.status = ctx.status;
      if (Object.keys(patch).length) S.update(ex.id, patch);
      toast(t('t.exists', { t: ex.title || ex.pid }));
      lastId = ex.id;
      continue;
    }
    const p = S.addProblem(Object.assign({ key, platform: parsed.platform, pid: parsed.pid, url: parsed.url, title: parsed.pid }, ctx, ctx.collections ? { collections: ctx.collections.slice() } : {}));
    if (ctx.status === 'ac') S.update(p.id, { status: 'ac' });
    added++; lastId = p.id;
    if (parsed.platform !== 'other') fetchInfo(p.id);
  }
  if (bad.length) toast(t('t.bad', { s: bad.slice(0, 3).join(' ') }), 'err');
  if (added) toast(t('t.added', { n: added }), 'ok');
  if (lastId) select(lastId, false);
  render();
}
let fetchChain = Promise.resolve();
function fetchInfo(id) {
  loading.add(id);
  fetchChain = fetchChain.then(async () => {
    const p = S.byId(id);
    if (!p) return;
    const parsed = P.parseLink(p.url);
    try {
      const m = await P.fetchMeta(parsed, B.fetchText, metaCtx);
      const patch = { metaError: null };
      if (m.title && !p.titleManual) patch.title = m.title;
      if (m.difficulty !== undefined) patch.difficulty = m.difficulty;
      if (m.diffLabel !== undefined) patch.diffLabel = m.diffLabel;
      if (m.tags) patch.tags = m.tags;
      patch.needsTitle = m.note === 'manualTitle';
      S.update(id, patch);
    } catch (e) {
      S.update(id, { metaError: String(e && e.message ? e.message : e) });
    }
    loading.delete(id);
    renderList();
    if (ui.sel === id) renderDetail();
  });
}

/* ================================================================ navigation */
const VIEWS = [['queue', '☰'], ['fav', '★'], ['all', '▤'], ['done', '✓']];
function countFor(v) {
  const ps = S.db.problems;
  if (v === 'queue') return ps.filter((p) => p.inQueue && !done(p)).length;
  if (v === 'fav') return ps.filter((p) => p.fav).length;
  if (v === 'all') return ps.length;
  if (v === 'done') return ps.filter((p) => p.status === 'ac').length;
  if (v.startsWith('col:')) return ps.filter((p) => p.collections.includes(v.slice(4))).length;
  return '';
}
let editingCol = null;
function renderNav() {
  $('#nav').innerHTML = VIEWS.map(([v, ico]) => `<button data-view="${v}" aria-current="${ui.view === v}"><span class="ico">${ico}</span><span>${esc(t('nav.' + v))}</span><span class="cnt">${countFor(v)}</span></button>`).join('');
  $('#colNav').innerHTML = S.db.collections.map((c) => {
    const v = 'col:' + c.id;
    if (editingCol === c.id) return `<input class="input" data-colname="${c.id}" value="${esc(c.name)}">`;
    return `<button data-view="${v}" aria-current="${ui.view === v}" title="${esc(t('col.rename'))}: double-click"><span class="ico">#</span><span>${esc(c.name)}</span><span class="cnt">${countFor(v)}</span></button>`;
  }).join('') + (editingCol === 'new' ? `<input class="input" data-colname="new" placeholder="${esc(t('col.ph'))}">` : '');
  $('#navSettings').setAttribute('aria-current', String(ui.view === 'settings'));
  const inp = $('[data-colname]');
  if (inp) { inp.focus(); inp.select(); }
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-view]');
  if (b && b.closest('.side')) { setView(b.dataset.view); }
});
$('#colNav').addEventListener('dblclick', (e) => {
  const b = e.target.closest('[data-view]'); if (!b) return;
  editingCol = b.dataset.view.slice(4); renderNav();
});
$('#addCol').onclick = () => { editingCol = 'new'; renderNav(); };
$('#colNav').addEventListener('keydown', (e) => {
  const inp = e.target.closest('[data-colname]'); if (!inp) return;
  if (e.key === 'Enter') inp.blur();
  if (e.key === 'Escape') { editingCol = null; renderNav(); }
});
$('#colNav').addEventListener('focusout', (e) => {
  const inp = e.target.closest('[data-colname]'); if (!inp || editingCol === null) return;
  const name = inp.value.trim(), id = inp.dataset.colname;
  editingCol = null;
  if (id === 'new') { if (name) { const c = S.addCollection(name); setView('col:' + c.id); return; } }
  else if (name) S.renameCollection(id, name);
  renderNav(); renderHead();
});
function setView(v) {
  ui.view = v; ui.confirmDel = false;
  ui.f.sort = '';
  render();
}

/* ================================================================ list */
function viewProblems() {
  const v = ui.view, ps = S.db.problems;
  if (v === 'queue') return ps.filter((p) => p.inQueue);
  if (v === 'fav') return ps.filter((p) => p.fav);
  if (v === 'done') return ps.filter((p) => p.status === 'ac');
  if (v.startsWith('col:')) return ps.filter((p) => p.collections.includes(v.slice(4)));
  return ps.slice();
}
function defaultSort() { return ui.view === 'queue' ? 'queue' : ui.view === 'done' ? 'ac' : ui.view === 'fav' ? 'stars' : 'added'; }
function applyFilters(list) {
  const f = ui.f, q = f.q.trim().toLowerCase();
  return list.filter((p) => {
    if (f.platform && p.platform !== f.platform) return false;
    if (f.status && p.status !== f.status) return false;
    if (f.tag && !p.tags.includes(f.tag) && !p.myTags.includes(f.tag)) return false;
    if (q) {
      const hay = [p.title, p.pid, p.tags.join(' '), p.myTags.join(' '), p.notes].join(' ').toLowerCase();
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  });
}
function sortList(list) {
  const s = ui.f.sort || defaultSort();
  const num = (x) => (x === null || x === undefined || x === '' ? Infinity : Number(x));
  const cmp = {
    queue: (a, b) => a.queuePos - b.queuePos,
    added: (a, b) => (a.addedAt < b.addedAt ? 1 : -1),
    diffAsc: (a, b) => num(a.difficulty) - num(b.difficulty),
    diffDesc: (a, b) => (num(b.difficulty) === Infinity ? -1 : num(a.difficulty) === Infinity ? 1 : num(b.difficulty) - num(a.difficulty)),
    title: (a, b) => a.title.localeCompare(b.title),
    ac: (a, b) => ((a.acAt || '') < (b.acAt || '') ? 1 : -1),
    stars: (a, b) => b.stars - a.stars || (a.addedAt < b.addedAt ? 1 : -1),
  }[s];
  return list.sort(cmp);
}
function rowHTML(p, drag) {
  const tags = p.myTags.map((x) => `<span class="tagchip mine">${esc(x)}</span>`).concat(p.tags.slice(0, 3).map((x) => `<span class="tagchip">${esc(x)}</span>`)).join('');
  const st = S.STATUSES.map((s) => `<option value="${s}"${p.status === s ? ' selected' : ''}>${esc(t('st.' + s))}</option>`).join('');
  return `<div class="prow${ui.sel === p.id ? ' sel' : ''}${done(p) ? ' done' : ''}" data-id="${p.id}">
    <span class="handle"${drag ? '' : ' style="visibility:hidden"'} title="⋮⋮">⋮⋮</span>
    ${badge(p)}
    <div class="ptitle"><b class="${loading.has(p.id) ? 'loading' : ''}">${esc(p.title || p.pid)}</b><small><span>${esc(p.pid)}</span>${tags}</small></div>
    <span class="diff" style="color:${diffColor(p)}">${esc(p.diffLabel || '')}</span>
    <select class="spill st-${p.status}" data-status aria-label="${esc(t('d.status'))}">${st}</select>
    <button class="tog fav${p.fav ? ' on' : ''}" data-fav title="${esc(t('d.fav'))}">${p.fav ? '★' : '☆'}</button>
    <button class="tog q${p.inQueue ? ' on' : ''}" data-q title="${esc(t('d.queue'))}">☰</button>
  </div>`;
}
let sortable = null;
function renderList() {
  if (ui.view === 'settings') return;
  const all = viewProblems();
  const list = sortList(applyFilters(all));
  const filtering = ui.f.q || ui.f.platform || ui.f.status || ui.f.tag;
  const canDrag = ui.view === 'queue' && (ui.f.sort || 'queue') === 'queue' && !filtering;
  $('#fCount').textContent = t('f.count', { n: list.length });
  const box = $('#list');
  if (sortable) { sortable.destroy(); sortable = null; }
  if (!all.length) { box.innerHTML = emptyHTML(); return; }
  if (!list.length) { box.innerHTML = `<div class="empty">${esc(t('e.filter'))}</div>`; return; }
  if (ui.view === 'queue') {
    const active = list.filter((p) => !done(p)), fin = list.filter(done);
    box.innerHTML = `<div id="qActive">${active.map((p) => rowHTML(p, canDrag)).join('')}</div>` +
      (fin.length ? `<div class="group-head"><span>${esc(t('g.done', { n: fin.length }))}</span></div>${fin.map((p) => rowHTML(p, false)).join('')}` : '');
    if (canDrag && window.Sortable) {
      sortable = Sortable.create($('#qActive'), {
        handle: '.handle', animation: 150,
        onEnd: () => {
          const ids = $$('#qActive .prow').map((r) => r.dataset.id);
          const rest = S.db.problems.filter((p) => p.inQueue && done(p)).sort((a, b) => a.queuePos - b.queuePos).map((p) => p.id);
          S.reorderQueue(ids.concat(rest));
        },
      });
    }
  } else box.innerHTML = list.map((p) => rowHTML(p, false)).join('');
}
function emptyHTML() {
  const v = ui.view.startsWith('col:') ? 'col' : ui.view;
  const ex = ['https://codeforces.com/problemset/problem/1900/C', 'https://atcoder.jp/contests/abc300/tasks/abc300_e', 'https://oj.uz/problem/view/IOI11_ricehub'];
  const d = { queue: 'e.queue.d', fav: 'e.fav.d', done: 'e.done.d', col: 'e.col.d', all: 'e.queue.d' }[v];
  return `<div class="empty"><h3>${esc(t('e.' + v + '.t'))}</h3><p>${esc(t(d))}</p>${v === 'queue' || v === 'all' ? ex.map((u) => `<code>${esc(u)}</code>`).join('') : ''}<p class="hint">${esc(t('e.tip'))}</p></div>`;
}
$('#list').addEventListener('click', (e) => {
  const row = e.target.closest('.prow'); if (!row) return;
  const id = row.dataset.id, p = S.byId(id);
  if (e.target.closest('[data-fav]')) { S.update(id, { fav: !p.fav }); render(); return; }
  if (e.target.closest('[data-q]')) { S.update(id, { inQueue: !p.inQueue }); render(); return; }
  if (e.target.closest('[data-status]') || e.target.closest('.handle')) return;
  select(id);
});
$('#list').addEventListener('dblclick', (e) => {
  const row = e.target.closest('.prow'); if (!row || e.target.closest('select,button')) return;
  const p = S.byId(row.dataset.id); if (p) B.openUrl(p.url);
});
$('#list').addEventListener('change', (e) => {
  const sel = e.target.closest('[data-status]'); if (!sel) return;
  S.update(sel.closest('.prow').dataset.id, { status: sel.value });
  render();
});
function select(id, rerender) {
  ui.sel = id; ui.confirmDel = false;
  const p = S.byId(id);
  ui.notesMode = p && p.notes ? 'view' : 'write';
  ui.codeMode = p && p.code ? 'view' : 'write';
  if (rerender !== false) { renderList(); }
  renderDetail();
}

/* ================================================================ header, filters, actions */
function renderHead() {
  const v = ui.view;
  let title, desc;
  if (v.startsWith('col:')) { const c = S.db.collections.find((x) => x.id === v.slice(4)); title = c ? c.name : '?'; desc = t('v.col.d'); }
  else if (v === 'settings') { title = t('v.settings.t'); desc = ''; }
  else { title = t('v.' + v + '.t'); desc = t('v.' + v + '.d'); }
  $('#viewTitle').textContent = title; $('#viewDesc').textContent = desc;
  let acts = '';
  if (v === 'queue') acts = `<button class="btn primary" id="aNext">${esc(t('act.next'))}</button><button class="btn" id="aClean">${esc(t('act.clean'))}</button>`;
  if (v.startsWith('col:')) acts = `<button class="btn sm danger" id="aDelCol">${esc(t('col.delete'))}</button>`;
  $('#viewActions').innerHTML = acts;
  const isSet = v === 'settings';
  $('#filters').hidden = isSet; $('#list').hidden = isSet; $('#settings').hidden = !isSet;
  $('.app').classList.toggle('no-detail', isSet);
  // filter options
  const plats = [...new Set(S.db.problems.map((p) => p.platform))];
  $('#fPlatform').innerHTML = `<option value="">${esc(t('f.allPlat'))}</option>` + Object.entries(P.PLATFORMS).filter(([k]) => plats.includes(k)).map(([k, x]) => `<option value="${k}">${esc(x.name)}</option>`).join('');
  $('#fStatus').innerHTML = `<option value="">${esc(t('f.allStatus'))}</option>` + S.STATUSES.map((s) => `<option value="${s}">${esc(t('st.' + s))}</option>`).join('');
  const tags = [...new Set(S.db.problems.flatMap((p) => p.myTags.concat(p.tags)))].sort((a, b) => a.localeCompare(b));
  $('#fTag').innerHTML = `<option value="">${esc(t('f.allTags'))}</option>` + tags.map((x) => `<option>${esc(x)}</option>`).join('');
  const sorts = ['queue', 'added', 'ac', 'stars', 'diffAsc', 'diffDesc', 'title'].filter((s) => s !== 'queue' || v === 'queue');
  $('#fSort').innerHTML = sorts.map((s) => `<option value="${s}">${esc(t('sort.' + s))}</option>`).join('');
  $('#fPlatform').value = ui.f.platform; $('#fStatus').value = ui.f.status; $('#fTag').value = tags.includes(ui.f.tag) ? ui.f.tag : '';
  $('#fSort').value = ui.f.sort || defaultSort();
}
$('#viewActions').addEventListener('click', async (e) => {
  if (e.target.id === 'aNext') {
    const q = S.db.problems.filter((p) => p.inQueue && !done(p)).sort((a, b) => a.queuePos - b.queuePos);
    if (!q.length) { toast(t('act.noNext')); return; }
    const p = q.find((x) => x.status === 'doing') || q[0];
    if (p.status === 'todo') S.update(p.id, { status: 'doing' });
    select(p.id); render(); B.openUrl(p.url);
  }
  if (e.target.id === 'aClean') {
    const fin = S.db.problems.filter((p) => p.inQueue && done(p));
    fin.forEach((p) => S.update(p.id, { inQueue: false }));
    toast(t('act.cleaned', { n: fin.length })); render();
  }
  if (e.target.id === 'aDelCol') {
    const id = ui.view.slice(4), c = S.db.collections.find((x) => x.id === id);
    $('#viewActions').innerHTML = `<div class="confirm">${esc(t('col.deleteAsk', { n: c ? c.name : '' }))}<button class="btn sm danger" id="aDelColYes">${esc(t('common.delete'))}</button><button class="btn sm" id="aDelColNo">${esc(t('common.cancel'))}</button></div>`;
  }
  if (e.target.id === 'aDelColYes') { S.removeCollection(ui.view.slice(4)); setView('queue'); }
  if (e.target.id === 'aDelColNo') renderHead();
});
let searchTimer;
$('#fSearch').addEventListener('input', (e) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { ui.f.q = e.target.value; renderList(); }, 120); });
[['fPlatform', 'platform'], ['fStatus', 'status'], ['fTag', 'tag'], ['fSort', 'sort']].forEach(([id, k]) => $('#' + id).addEventListener('change', (e) => { ui.f[k] = e.target.value; renderList(); }));

/* ================================================================ detail panel */
function renderDetail() {
  const box = $('#detail');
  const p = ui.sel && S.byId(ui.sel);
  if (!p) { box.innerHTML = `<div class="d-empty">${esc(t('d.empty'))}</div>`; return; }
  const pl = P.PLATFORMS[p.platform] || P.PLATFORMS.other;
  const stars = [1, 2, 3, 4, 5].map((k) => `<button data-star="${k}" class="${p.stars >= k ? 'on' : ''}" aria-label="${k}">★</button>`).join('');
  const cols = S.db.collections.length ? S.db.collections.map((c) => `<button class="chipbtn" data-col="${c.id}" aria-pressed="${p.collections.includes(c.id)}">${esc(c.name)}</button>`).join('') : `<span class="hint">${esc(t('d.noCol'))}</span>`;
  const notesView = ui.notesMode === 'view' && p.notes ? `<div class="md" id="dNotesView">${sanitize(window.marked ? marked.parse(p.notes) : esc(p.notes))}</div>` : `<textarea class="input" id="dNotes" rows="7" placeholder="${esc(t('d.notesPh'))}">${esc(p.notes)}</textarea>`;
  let codeView;
  if (ui.codeMode === 'view' && p.code) {
    let html = esc(p.code);
    try { if (window.hljs) html = hljs.highlight(p.code, { language: hljs.getLanguage(p.codeLang) ? p.codeLang : 'plaintext' }).value; } catch (e) { /* plain */ }
    codeView = `<pre class="codeview"><code class="hljs">${html}</code></pre>`;
  } else codeView = `<textarea class="input code" id="dCode" rows="10" spellcheck="false" placeholder="${esc(t('d.codePh'))}">${esc(p.code)}</textarea>`;
  box.innerHTML = `<div class="d-inner">
    <div class="d-top">${badge(p)}<span class="hint mono">${esc(p.pid)}</span><div class="grow"></div>
      <button class="btn sm" id="dRefetch"${p.platform === 'other' ? ' hidden' : ''}>${esc(t('d.refetch'))}</button><button class="btn sm primary" id="dOpen">${esc(t('d.open'))}</button></div>
    <input class="d-title" id="dTitle" value="${esc(p.title)}" placeholder="${esc(t('d.titlePh'))}">
    ${p.needsTitle && !p.titleManual ? `<div class="warnbox">${esc(t('d.manualTitle'))}</div>` : ''}
    ${p.metaError ? `<div class="warnbox">${esc(t('d.metaErr', { e: p.metaError }))}</div>` : ''}
    <div class="d-meta"><span>${esc(pl.name)}</span>${p.diffLabel ? `<span>· ${esc(t('d.diff'))}: <b style="color:${diffColor(p)}">${esc(p.diffLabel)}</b></span>` : ''}</div>
    <div class="d-sec"><label>${esc(t('d.status'))}</label>
      <div class="seg" id="dStatus">${S.STATUSES.map((s) => `<button data-st="${s}" aria-pressed="${p.status === s}">${esc(t('st.' + s))}</button>`).join('')}</div></div>
    <div class="row">
      <label class="check"><input type="checkbox" id="dQueue"${p.inQueue ? ' checked' : ''}> ${esc(t('d.queue'))}</label>
      <label class="check"><input type="checkbox" id="dFav"${p.fav ? ' checked' : ''}> ${esc(t('d.fav'))}</label>
      <div class="grow"></div><div class="stars" id="dStars" title="${esc(t('d.stars'))}">${stars}</div>
    </div>
    ${p.tags.length ? `<div class="d-sec"><label>${esc(t('d.tags'))}</label><div class="chips">${p.tags.map((x) => `<span class="tagchip">${esc(x)}</span>`).join('')}</div></div>` : ''}
    <div class="d-sec"><label for="dMyTags">${esc(t('d.myTags'))}</label><input class="input" id="dMyTags" value="${esc(p.myTags.join(', '))}" placeholder="${esc(t('d.myTagsPh'))}"></div>
    <div class="d-sec"><label>${esc(t('d.collections'))}</label><div class="chips" id="dCols">${cols}</div></div>
    <div class="d-sec"><label for="dEditorial">${esc(t('d.editorial'))}</label><div class="row" style="flex-wrap:nowrap"><input class="input" id="dEditorial" value="${esc(p.editorial)}" placeholder="https://…"><button class="btn sm" id="dOpenEd"${p.editorial ? '' : ' disabled'}>${esc(t('common.open'))}</button></div></div>
    <div class="d-sec"><label>${esc(t('d.notes'))}<span class="tabs2" id="dNotesTabs"><button data-m="write" aria-pressed="${ui.notesMode === 'write' || !p.notes}">${esc(t('d.write'))}</button><button data-m="view" aria-pressed="${ui.notesMode === 'view' && !!p.notes}">${esc(t('d.view'))}</button></span></label>${notesView}</div>
    <div class="d-sec"><label>${esc(t('d.code'))}<span class="row" style="gap:6px"><select class="input" id="dLang" style="width:auto;padding:2px 6px;font-size:12px">${['cpp', 'python', 'java', 'kotlin', 'rust', 'go', 'plaintext'].map((l) => `<option${p.codeLang === l ? ' selected' : ''}>${l}</option>`).join('')}</select>
      <span class="tabs2" id="dCodeTabs"><button data-m="write" aria-pressed="${ui.codeMode === 'write' || !p.code}">${esc(t('d.write'))}</button><button data-m="view" aria-pressed="${ui.codeMode === 'view' && !!p.code}">${esc(t('d.view'))}</button></span></span></label>${codeView}</div>
    <div class="d-meta"><span>${esc(t('d.added'))}: ${esc(fmtDate(p.addedAt))}</span>${p.acAt ? `<span>· ${esc(t('d.acAt'))}: ${esc(fmtDate(p.acAt))}</span>` : ''}</div>
    ${ui.confirmDel ? `<div class="confirm">${esc(t('d.deleteAsk'))}<button class="btn sm danger" id="dDelYes">${esc(t('common.delete'))}</button><button class="btn sm" id="dDelNo">${esc(t('common.cancel'))}</button></div>` : `<div><button class="btn sm danger" id="dDel">${esc(t('d.delete'))}</button></div>`}
  </div>`;
}
const detail = $('#detail');
function cur() { return ui.sel && S.byId(ui.sel); }
detail.addEventListener('click', (e) => {
  const p = cur(); if (!p) return;
  const tg = e.target;
  if (tg.closest('#dOpen')) { B.openUrl(p.url); return; }
  if (tg.closest('#dOpenEd')) { if (p.editorial) B.openUrl(p.editorial); return; }
  if (tg.closest('#dRefetch')) { fetchInfo(p.id); renderList(); return; }
  const st = tg.closest('[data-st]'); if (st) { S.update(p.id, { status: st.dataset.st }); renderDetail(); render(false); return; }
  const sr = tg.closest('[data-star]'); if (sr) { const k = +sr.dataset.star; S.update(p.id, { stars: p.stars === k ? 0 : k, fav: true }); renderDetail(); render(false); return; }
  const cb = tg.closest('[data-col]'); if (cb) { const id = cb.dataset.col; S.update(p.id, { collections: p.collections.includes(id) ? p.collections.filter((x) => x !== id) : p.collections.concat(id) }); renderDetail(); render(false); return; }
  const nt = tg.closest('#dNotesTabs [data-m]'); if (nt) { ui.notesMode = nt.dataset.m; renderDetail(); return; }
  const ct = tg.closest('#dCodeTabs [data-m]'); if (ct) { ui.codeMode = ct.dataset.m; renderDetail(); return; }
  const a = tg.closest('#dNotesView a[href]'); if (a) { e.preventDefault(); B.openUrl(a.href); return; }
  if (tg.closest('#dDel')) { ui.confirmDel = true; renderDetail(); return; }
  if (tg.closest('#dDelNo')) { ui.confirmDel = false; renderDetail(); return; }
  if (tg.closest('#dDelYes')) { S.remove(p.id); ui.sel = null; ui.confirmDel = false; render(); return; }
});
detail.addEventListener('dblclick', (e) => { if (e.target.closest('#dNotesView')) { ui.notesMode = 'write'; renderDetail(); const ta = $('#dNotes'); if (ta) ta.focus(); } });
detail.addEventListener('change', (e) => {
  const p = cur(); if (!p) return;
  if (e.target.id === 'dQueue') { S.update(p.id, { inQueue: e.target.checked }); render(false); }
  if (e.target.id === 'dFav') { S.update(p.id, { fav: e.target.checked }); render(false); }
  if (e.target.id === 'dLang') { S.update(p.id, { codeLang: e.target.value }); }
  if (e.target.id === 'dMyTags') { S.update(p.id, { myTags: splitTags(e.target.value) }); render(false); }
});
detail.addEventListener('input', (e) => {
  const p = cur(); if (!p) return;
  const v = e.target.value;
  if (e.target.id === 'dTitle') { S.update(p.id, { title: v, titleManual: true }); renderListSoon(); }
  if (e.target.id === 'dNotes') S.update(p.id, { notes: v });
  if (e.target.id === 'dCode') S.update(p.id, { code: v });
  if (e.target.id === 'dEditorial') { S.update(p.id, { editorial: v.trim() }); $('#dOpenEd').disabled = !v.trim(); }
});
detail.addEventListener('keydown', (e) => {
  if (e.target.id === 'dCode' && e.key === 'Tab') { e.preventDefault(); e.target.setRangeText('    ', e.target.selectionStart, e.target.selectionEnd, 'end'); e.target.dispatchEvent(new Event('input', { bubbles: true })); }
  if (e.target.id === 'dTitle' && e.key === 'Enter') e.target.blur();
});
let listTimer;
function renderListSoon() { clearTimeout(listTimer); listTimer = setTimeout(renderList, 250); }

/* ================================================================ settings */
async function renderSettings() {
  const st = S.db.settings;
  let info = {};
  try { info = await B.info(); } catch (e) { /* ignore */ }
  const desk = B.kind === 'desktop';
  const ps = S.db.problems;
  $('#settings').innerHTML = `
    <div class="card"><h3>${esc(t('s.lang'))} · ${esc(t('s.theme'))}</h3>
      <div class="row"><div class="seg" id="sLang"><button data-v="vi" aria-pressed="${st.lang === 'vi'}">Tiếng Việt</button><button data-v="en" aria-pressed="${st.lang === 'en'}">English</button></div>
      <div class="seg" id="sTheme">${['system', 'light', 'dark'].map((x) => `<button data-v="${x}" aria-pressed="${st.theme === x}">${esc(t('s.theme.' + x))}</button>`).join('')}</div></div>
    </div>
    <div class="card"><h3>${esc(t('s.data'))}</h3><p class="hint">${esc(t('s.dataDesc'))}</p>
      ${desk ? '' : `<div class="warnbox">${esc(t('s.web'))}</div>`}
      <div class="d-lbl">${esc(t('s.dataDir'))}</div><div class="path">${esc(info.data_dir || '')}</div>
      <div class="row"><button class="btn" id="sPick"${desk ? '' : ' disabled'}>${esc(t('s.change'))}</button><button class="btn" id="sReset"${desk ? '' : ' disabled'}>${esc(t('s.default'))}</button><button class="btn" id="sOpen"${desk ? '' : ' disabled'}>${esc(t('s.openDir'))}</button></div>
      <p class="hint">${esc(t('s.backup'))}</p>
    </div>
    <div class="card"><h3>${esc(t('s.export'))}</h3>
      <div class="row"><button class="btn" id="sExpJson">${esc(t('s.exportJson'))}</button><button class="btn" id="sExpCsv">${esc(t('s.exportCsv'))}</button></div>
      <div class="row"><span class="hint">${esc(t('s.importMode'))}:</span><div class="seg" id="sMode"><button data-v="merge" aria-pressed="true">${esc(t('s.merge'))}</button><button data-v="replace" aria-pressed="false">${esc(t('s.replace'))}</button></div>
      <button class="btn" id="sImport">${esc(t('s.import'))}</button></div>
      <div id="sImportConfirm"></div>
    </div>
    <div class="card"><h3>${esc(t('s.platforms'))}</h3><p class="hint">${esc(t('s.platDesc'))}</p></div>
    <div class="card"><h3>${esc(t('s.about'))}</h3><p class="hint">CP Tracker · ${esc(t('s.version', { v: info.version || '' }))} · ${esc(t('stat.total', { n: ps.length, ac: ps.filter((p) => p.status === 'ac').length }))}</p></div>`;
}
let importMode = 'merge', pendingImport = null;
$('#settings').addEventListener('click', async (e) => {
  const tg = e.target;
  const lb = tg.closest('#sLang [data-v]'); if (lb) { S.setSetting('lang', lb.dataset.v); applySettings(); render(); return; }
  const th = tg.closest('#sTheme [data-v]'); if (th) { S.setSetting('theme', th.dataset.v); applySettings(); renderSettings(); return; }
  const md = tg.closest('#sMode [data-v]'); if (md) { importMode = md.dataset.v; $$('#sMode [data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b === md))); return; }
  try {
    if (tg.id === 'sPick') { await S.flush(); const d = await B.pickDataDir(); if (d) { await S.load(); applySettings(); toast(t('t.dirChanged'), 'ok'); render(); } }
    if (tg.id === 'sReset') { await S.flush(); await B.resetDataDir(); await S.load(); applySettings(); toast(t('t.dirChanged'), 'ok'); render(); }
    if (tg.id === 'sOpen') await B.openDataDir();
    if (tg.id === 'sExpJson' || tg.id === 'sExpCsv') {
      const day = new Date().toISOString().slice(0, 10);
      const json = tg.id === 'sExpJson';
      const f = await B.saveFile(`cp-tracker-${day}.${json ? 'json' : 'csv'}`, json ? S.exportJSON() : S.exportCSV());
      if (f) toast(t('t.exported', { f }), 'ok');
    }
    if (tg.id === 'sImport') {
      const text = await B.openFile(); if (!text) return;
      if (importMode === 'replace') {
        pendingImport = text;
        $('#sImportConfirm').innerHTML = `<div class="confirm">${esc(t('s.replaceAsk'))}<button class="btn sm danger" id="sImpYes">${esc(t('common.yes'))}</button><button class="btn sm" id="sImpNo">${esc(t('common.cancel'))}</button></div>`;
        return;
      }
      doImport(text, 'merge');
    }
    if (tg.id === 'sImpYes' && pendingImport) { doImport(pendingImport, 'replace'); pendingImport = null; }
    if (tg.id === 'sImpNo') { pendingImport = null; $('#sImportConfirm').innerHTML = ''; }
  } catch (err) { toast(String(err && err.message ? err.message : err), 'err'); }
});
function doImport(text, mode) {
  try { const r = S.importJSON(text, mode); toast(t('t.imported', { a: r.added, s: r.skipped }), 'ok'); applySettings(); render(); }
  catch (e) { toast(t('t.importErr'), 'err'); }
}

/* ================================================================ add bar, paste, keys */
$('#addBtn').onclick = () => { const v = $('#addInput').value; if (v.trim()) { addFromText(v); $('#addInput').value = ''; } };
$('#addInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#addBtn').click(); });
$('#addManyBtn').onclick = () => { $('#manyModal').hidden = false; $('#manyText').value = ''; $('#manyText').focus(); };
$('#manyCancel').onclick = () => { $('#manyModal').hidden = true; };
$('#manyOk').onclick = () => {
  const ctx = contextFields();
  if ($('#manyQueue').checked) ctx.inQueue = true; else delete ctx.inQueue;
  addFromText($('#manyText').value, ctx);
  $('#manyModal').hidden = true;
};
document.addEventListener('paste', (e) => {
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  if (/INPUT|TEXTAREA|SELECT/.test(tag) || ui.view === 'settings') return;
  const text = (e.clipboardData || window.clipboardData).getData('text');
  if (text && text.trim()) { e.preventDefault(); addFromText(text); }
});
document.addEventListener('keydown', (e) => {
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  if (e.key === 'Escape' && !$('#manyModal').hidden) { $('#manyModal').hidden = true; return; }
  if (/INPUT|TEXTAREA|SELECT/.test(tag) || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === '/') { e.preventDefault(); $('#fSearch').focus(); }
  if (e.key === 'n') { e.preventDefault(); $('#addInput').focus(); }
});

/* ================================================================ render */
function render(full) {
  renderNav(); renderHead();
  if (ui.view === 'settings') renderSettings(); else renderList();
  if (full !== false && ui.view !== 'settings') renderDetail();
}
S.on((what, e) => { if (what === 'saveError') toast(t('t.saveErr', { e: String(e) }), 'err'); });
window.addEventListener('beforeunload', () => { S.flush(); });

(async function init() {
  try { await S.load(); } catch (e) { toast(t('t.saveErr', { e: String(e) }), 'err'); }
  applySettings();
  render();
  // retry problems whose info is still missing (e.g. added while offline)
  S.db.problems.filter((p) => p.platform !== 'other' && p.title === p.pid && !p.needsTitle && !p.titleManual).forEach((p) => fetchInfo(p.id));
})();
})();
