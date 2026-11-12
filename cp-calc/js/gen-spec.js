/* Sinh test từ mô tả định dạng.
 *
 *   n k              ← bố cục: mỗi dòng là một dòng của input
 *   a[n]
 *   q * (l r)
 *   ---
 *   n: 5..40         ← phạm vi: tên: thấp..cao [tuỳ chọn]
 *   k: 1..n
 *   a: -20..20 distinct
 *   l: 1..n
 *   r: l..n
 *
 * Tuỳ chọn: distinct, sorted, desc, nonzero, perm, edge (hay chọn giá trị biên),
 *           string len <expr> alpha "abc"
 */
(function (global) {
'use strict';
const CP = global.CP;

class SpecError extends Error { constructor(key, params) { super(key); this.key = key; this.params = params || {}; } }

/* Array with a base index, so formulas can use a[i] with 1-based or 0-based indices */
class Arr {
  constructor(data, base) { this.data = data; this.base = base; }
  at(i) {
    const v = this.data[i - this.base];
    if (v === undefined) throw new CP.CalcError('err.index', { i, name: '' });
    return v;
  }
  get length() { return this.data.length; }
}

/* ---------------- parsing ---------------- */
function parseSpec(text) {
  const parts = text.split(/^\s*---+\s*$/m);
  const layoutText = parts[0] || '', rangeText = parts.slice(1).join('\n');
  const layout = [];
  layoutText.split(/\r?\n/).forEach((raw, ln) => {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) return;
    const rep = line.match(/^(.+?)\s*\*\s*\((.*)\)\s*$/);
    if (rep) {
      const items = rep[2].trim().split(/\s+/).filter(Boolean).map((tok) => parseItem(tok, ln + 1));
      if (items.some((it) => it.kind !== 'scalar')) throw new SpecError('gs.repScalar', { line: ln + 1 });
      layout.push({ kind: 'repeat', count: CP.parse(rep[1]), items, line: ln + 1 });
      return;
    }
    const items = line.split(/\s+/).map((tok) => parseItem(tok, ln + 1));
    if (items.some((it) => it.kind === 'matrix') && items.length > 1) throw new SpecError('gs.matrixAlone', { line: ln + 1 });
    layout.push({ kind: 'line', items, line: ln + 1 });
  });
  const ranges = new Map();
  rangeText.split(/\r?\n/).forEach((raw, ln) => {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) return;
    const m = line.match(/^([A-Za-z_]\w*)\s*:\s*(.*)$/);
    if (!m) throw new SpecError('gs.badRange', { line: line });
    ranges.set(m[1], parseRange(m[1], m[2].trim()));
  });
  // every layout variable needs a range (count expressions may use earlier variables)
  const names = [];
  layout.forEach((L) => L.items.forEach((it) => names.push(it.name)));
  names.forEach((nm) => { if (!ranges.has(nm)) throw new SpecError('gs.noRange', { name: nm }); });
  if (!layout.length) throw new SpecError('gs.empty');
  return { layout, ranges, names };
}
function parseItem(tok, line) {
  const m = tok.match(/^([A-Za-z_]\w*)((?:\[[^\]]+\])*)$/);
  if (!m) throw new SpecError('gs.badItem', { tok, line });
  const dims = [...m[2].matchAll(/\[([^\]]+)\]/g)].map((x) => CP.parse(x[1]));
  if (dims.length === 0) return { kind: 'scalar', name: m[1] };
  if (dims.length === 1) return { kind: 'array', name: m[1], len: dims[0] };
  if (dims.length === 2) return { kind: 'matrix', name: m[1], rows: dims[0], cols: dims[1] };
  throw new SpecError('gs.badItem', { tok, line });
}
function parseRange(name, s) {
  const r = { name, opts: new Set(), lo: null, hi: null, str: null };
  let rest = s;
  const sm = rest.match(/^string\b(.*)$/i);
  if (sm) {
    const len = sm[1].match(/\blen\s+([^\s"]+)/i), alpha = sm[1].match(/\balpha\s+"([^"]*)"/i);
    r.str = { len: len ? CP.parse(len[1]) : null, alpha: alpha ? alpha[1] : 'abcdefghijklmnopqrstuvwxyz' };
    if (!r.str.alpha.length) throw new SpecError('gs.badRange', { line: name + ': ' + s });
    return r;
  }
  if (/^perm\b/i.test(rest)) { r.opts.add('perm'); rest = rest.replace(/^perm\b/i, '').trim(); }
  const rm = rest.match(/^(.+?)\.\.(\S+)(.*)$/);
  if (rm) { r.lo = CP.parse(rm[1]); r.hi = CP.parse(rm[2]); rest = rm[3]; }
  else if (!r.opts.has('perm')) {
    const cm = rest.match(/^(\S+)(.*)$/);
    if (!cm) throw new SpecError('gs.badRange', { line: name + ': ' + s });
    r.lo = r.hi = CP.parse(cm[1]); rest = cm[2];
  }
  rest.trim().split(/\s+/).filter(Boolean).forEach((o) => {
    o = o.toLowerCase();
    if (!['distinct', 'sorted', 'desc', 'nonzero', 'perm', 'edge'].includes(o)) throw new SpecError('gs.badOpt', { opt: o, name });
    r.opts.add(o);
  });
  return r;
}

/* ---------------- random ---------------- */
function rng(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function randBig(R, lo, hi) {
  const span = hi - lo + 1n;
  if (span <= 0n) throw new SpecError('gs.emptyRange', { lo: String(lo), hi: String(hi) });
  if (span <= 9007199254740992n) return lo + BigInt(Math.floor(R() * Number(span)));
  // combine 52-bit chunks
  let x = 0n, bits = 0n;
  while ((1n << bits) < span * 1024n) { x = (x << 52n) + BigInt(Math.floor(R() * 4503599627370496)); bits += 52n; }
  return lo + (x % span);
}

/* ---------------- generation ---------------- */
function evalBig(ast, env, what) {
  let v;
  try { v = CP.unwrap(CP.evaluate(ast, env)); }
  catch (e) {
    if (e.key === 'err.unknownVar') throw new SpecError('gs.notYet', { name: e.params.name, what });
    throw e;
  }
  if (CP.isBig(v)) return v;
  if (Number.isFinite(v)) return BigInt(Math.floor(v));
  throw new SpecError('gs.notInt', { what });
}
function genValue(R, rg, env) {
  const lo = evalBig(rg.lo, env, rg.name), hi = evalBig(rg.hi, env, rg.name);
  if (lo > hi) throw new SpecError('gs.loHi', { name: rg.name, lo: String(lo), hi: String(hi) });
  for (let tries = 0; tries < 200; tries++) {
    let v;
    if (rg.opts.has('edge') && R() < 0.35) {
      const cands = [lo, hi, lo + 1n, hi - 1n, 0n, 1n, -1n].filter((x) => x >= lo && x <= hi);
      v = cands[Math.floor(R() * cands.length)];
    } else v = randBig(R, lo, hi);
    if (rg.opts.has('nonzero') && v === 0n) continue;
    return v;
  }
  throw new SpecError('gs.noValue', { name: rg.name });
}
function genArray(R, rg, len, env) {
  if (len < 0) throw new SpecError('gs.negLen', { name: rg.name });
  if (len > 2000000) throw new SpecError('gs.tooLong', { name: rg.name });
  let out;
  if (rg.str) {
    // array of strings
    out = [];
    for (let i = 0; i < len; i++) out.push(genString(R, rg, env));
    return out;
  }
  if (rg.opts.has('perm')) {
    out = Array.from({ length: len }, (_, i) => BigInt(i + 1));
    for (let i = len - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  } else if (rg.opts.has('distinct')) {
    const lo = evalBig(rg.lo, env, rg.name), hi = evalBig(rg.hi, env, rg.name);
    let span = hi - lo + 1n;
    if (rg.opts.has('nonzero') && lo <= 0n && hi >= 0n) span -= 1n;
    if (BigInt(len) > span) throw new SpecError('gs.distinct', { name: rg.name, len, span: String(span) });
    const seen = new Set(); out = [];
    if (span <= BigInt(len) * 3n) {
      // small range: shuffle the whole range and take a prefix
      const all = [];
      for (let x = lo; x <= hi; x++) if (!(rg.opts.has('nonzero') && x === 0n)) all.push(x);
      for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
      out = all.slice(0, len);
    } else {
      while (out.length < len) { const v = genValue(R, rg, env); const k = v.toString(); if (!seen.has(k)) { seen.add(k); out.push(v); } }
    }
  } else {
    out = [];
    for (let i = 0; i < len; i++) out.push(genValue(R, rg, env));
  }
  if (rg.opts.has('sorted')) out.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  if (rg.opts.has('desc')) out.sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
  return out;
}
function genString(R, rg, env) {
  const len = rg.str.len ? Number(evalBig(rg.str.len, env, rg.name)) : 1 + Math.floor(R() * 10);
  let s = '';
  for (let i = 0; i < len; i++) s += rg.str.alpha[Math.floor(R() * rg.str.alpha.length)];
  return s;
}

/* Generate one test. Returns { text, vars } (vars: name → BigInt | string | BigInt[] | BigInt[][]) */
function generate(spec, seed) {
  const R = rng(seed);
  const env = {}, vars = {}, lines = [];
  const fmt = (v) => (typeof v === 'bigint' ? v.toString() : String(v));
  for (const L of spec.layout) {
    if (L.kind === 'repeat') {
      const cnt = Number(evalBig(L.count, env, 'count'));
      if (cnt < 0) throw new SpecError('gs.negLen', { name: L.items.map((x) => x.name).join(' ') });
      L.items.forEach((it) => { vars[it.name] = []; });
      for (let k = 0; k < cnt; k++) {
        const local = Object.assign({}, env), row = [];
        for (const it of L.items) {
          const rg = spec.ranges.get(it.name);
          const v = rg.str ? genString(R, rg, local) : genValue(R, rg, local);
          local[it.name] = v; vars[it.name].push(v); row.push(fmt(v));
        }
        lines.push(row.join(' '));
      }
      continue;
    }
    const row = [];
    for (const it of L.items) {
      const rg = spec.ranges.get(it.name);
      if (it.kind === 'scalar') {
        const v = rg.str ? genString(R, rg, env) : genValue(R, rg, env);
        env[it.name] = v; vars[it.name] = v; row.push(fmt(v));
      } else if (it.kind === 'array') {
        const len = Number(evalBig(it.len, env, it.name));
        const arr = genArray(R, rg, len, env);
        vars[it.name] = arr; env[it.name] = new Arr(arr, 1);
        if (rg.str) row.push(arr.join(' ')); else row.push(arr.map(fmt).join(' '));
      } else {
        const rows = Number(evalBig(it.rows, env, it.name)), cols = Number(evalBig(it.cols, env, it.name));
        const mat = [];
        for (let i = 0; i < rows; i++) mat.push(genArray(R, rg, cols, env));
        vars[it.name] = mat;
        mat.forEach((r) => lines.push(r.map(fmt).join(' ')));
      }
    }
    if (row.length) lines.push(row.join(' ').trim());
  }
  return { text: lines.join('\n') + '\n', vars };
}

/* Read a test text according to the layout (used for tests from a custom generator) */
function read(spec, text) {
  const toks = text.split(/\s+/).filter(Boolean);
  let p = 0;
  const env = {}, vars = {};
  const take = (name) => {
    if (p >= toks.length) throw new SpecError('gs.eof', { name });
    const s = toks[p++];
    return /^[+-]?\d+$/.test(s) ? BigInt(s) : s;
  };
  for (const L of spec.layout) {
    if (L.kind === 'repeat') {
      const cnt = Number(evalBig(L.count, env, 'count'));
      L.items.forEach((it) => { vars[it.name] = []; });
      for (let k = 0; k < cnt; k++) L.items.forEach((it) => vars[it.name].push(take(it.name)));
      continue;
    }
    for (const it of L.items) {
      if (it.kind === 'scalar') { const v = take(it.name); vars[it.name] = v; env[it.name] = v; }
      else if (it.kind === 'array') {
        const len = Number(evalBig(it.len, env, it.name));
        const arr = []; for (let i = 0; i < len; i++) arr.push(take(it.name));
        vars[it.name] = arr; env[it.name] = new Arr(arr, 1);
      } else {
        const rows = Number(evalBig(it.rows, env, it.name)), cols = Number(evalBig(it.cols, env, it.name));
        const mat = [];
        for (let i = 0; i < rows; i++) { const r = []; for (let j = 0; j < cols; j++) r.push(take(it.name)); mat.push(r); }
        vars[it.name] = mat;
      }
    }
  }
  return { text, vars };
}

global.GenSpec = { parseSpec, generate, read, Arr, SpecError, rng };
})(typeof window !== 'undefined' ? window : globalThis);
