/* Tiện ích giao diện dùng chung */
(function (global) {
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function debounce(fn, ms) {
  let h;
  return (...a) => { clearTimeout(h); h = setTimeout(() => fn(...a), ms); };
}
function toast(msg, kind) {
  const el = document.createElement('div');
  el.className = 'toast' + (kind ? ' ' + kind : '');
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), kind === 'err' ? 5000 : 2200);
}
function copy(text) {
  const done = () => toast(t('copied', { v: text.length > 40 ? text.slice(0, 40) + '…' : text }));
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
  } else fallbackCopy(text, done);
}
function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text; document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
  ta.remove();
}

/* Error → localized message */
function errMsg(e) {
  if (e && e.key) return t(e.key, e.params);
  return t('err.generic', { msg: e && e.message ? e.message : String(e) });
}

/* Judge settings */
function judge() {
  let tl = 1, speed = 2e8;
  try { tl = CP.toNum(CP.unwrap(CP.evaluate(CP.parse($('#jTL').value)))); } catch (e) { /* keep default */ }
  try { speed = CP.toNum(CP.unwrap(CP.evaluate(CP.parse($('#jSpeed').value)))); } catch (e) { /* keep default */ }
  if (!(tl > 0)) tl = 1;
  if (!(speed > 0)) speed = 2e8;
  return { tl, speed };
}
/* ops → {time, ratio, cls} */
function verdict(ops, constFactor) {
  const { tl, speed } = judge();
  const time = (ops * (constFactor || 1)) / speed;
  const ratio = time / tl;
  const cls = !(ratio <= 1) ? 'bad' : ratio <= 0.5 ? 'ok' : 'warn';
  return { time, ratio, cls };
}
function chip(cls, text) { return `<span class="chip ${cls}">${esc(text || t('v.' + cls))}</span>`; }

/* Output builders */
function kv(k, v, sub, opts) {
  opts = opts || {};
  return `<div class="kv${opts.big ? ' big' : ''}"><div class="k">${k}</div><div class="v"${opts.copy !== undefined ? ` data-copy="${esc(opts.copy)}" style="cursor:copy"` : ''}>${v}${sub ? `<small>${sub}</small>` : ''}</div></div>`;
}
function out(html) { return `<div class="out">${html}</div>`; }
function errBox(e) { return `<div class="msg err">${esc(errMsg(e))}</div>`; }
function note(text) { return `<div class="msg note">${text}</div>`; }
/* Format a calc value into kv-friendly (main, sub) */
function val(v) {
  const f = CP.formatValue(v);
  return { main: esc(f.main), sub: esc(f.sub || ''), copy: f.copy };
}
function kvVal(label, v, extraSub, opts) {
  const f = val(v);
  const sub = [f.sub, extraSub].filter(Boolean).join(' · ');
  return kv(label, f.main, sub, Object.assign({ copy: f.copy }, opts || {}));
}

/* Parse a single expression field (with optional env) to a value */
function evalField(text, env) {
  return CP.unwrap(CP.evaluate(CP.parse(text), env || {}));
}
function numField(text, env) { return CP.toNum(evalField(text, env)); }

/* Copy on click for any [data-copy] */
document.addEventListener('click', (e) => {
  const c = e.target.closest('[data-copy]');
  if (c) copy(c.dataset.copy);
});

/* Wire inputs: run fn on input events of listed ids, re-run on language change */
function wire(ids, fn, ms) {
  const run = () => { try { fn(); } catch (e) { console.error(e); } };
  const d = debounce(run, ms === undefined ? 120 : ms);
  ids.forEach((id) => { const el = document.getElementById(id); if (el) el.addEventListener('input', d); });
  I18N.onChange(run);
  global.UI._runners.push(run);
  run();
  return run;
}

/* Web version (e.g. GitHub Pages): features that compile/run code need the local runner */
const HOSTED = /^https?:$/.test(location.protocol) && !['127.0.0.1', 'localhost'].includes(location.hostname);
I18N.add({
  vi: {
    'host.title': 'Tính năng này chỉ có ở bản chạy trên máy',
    'host.desc': 'Bạn đang dùng bản web. Trình duyệt không biên dịch và chạy được C++, nên phần này cần chương trình runner chạy trên máy bạn.',
    'host.step1': 'Tải mã nguồn: trên GitHub bấm <b>Code → Download ZIP</b> rồi giải nén.',
    'host.step2': 'Cài <b>Python 3</b> và <b>g++</b> (MinGW-w64 / MSYS2 trên Windows).',
    'host.step3': 'Trong thư mục <code>cp-calc</code>: Windows bấm đúp <code>start-runner.bat</code>, máy khác chạy <code>python3 runner.py</code>. Trình duyệt tự mở bản chạy trên máy, có đủ mọi tính năng.',
    'host.repo': 'Mở repo trên GitHub',
  },
  en: {
    'host.title': 'This feature is only available in the local version',
    'host.desc': 'You are using the web version. Browsers cannot compile and run C++, so this part needs the runner program on your computer.',
    'host.step1': 'Get the source: on GitHub click <b>Code → Download ZIP</b> and unzip it.',
    'host.step2': 'Install <b>Python 3</b> and <b>g++</b> (MinGW-w64 / MSYS2 on Windows).',
    'host.step3': 'In the <code>cp-calc</code> folder: on Windows double-click <code>start-runner.bat</code>, elsewhere run <code>python3 runner.py</code>. Your browser opens the local version with every feature.',
    'host.repo': 'Open the repository on GitHub',
  },
});
const REPO_URL = 'https://github.com/chithanh-nguyen10/claude_cloud';
function hostedNotice() {
  return `<div class="card host-note"><div class="card-body">
    <h3 data-i18n="host.title"></h3><p data-i18n="host.desc"></p>
    <ol class="steps-list"><li data-i18n-html="host.step1"></li><li data-i18n-html="host.step2"></li><li data-i18n-html="host.step3"></li></ol>
    <div><a class="btn" href="${REPO_URL}" target="_blank" rel="noopener" data-i18n="host.repo"></a></div>
  </div></div>`;
}

global.UI = {
  HOSTED, hostedNotice, $, $$, esc, debounce, toast, copy, errMsg, judge, verdict, chip, kv, out, errBox, note, val, kvVal, evalField, numField, wire, _runners: [] };
})(window);
