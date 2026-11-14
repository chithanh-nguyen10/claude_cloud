/* Numerical — lõi: trường số (phân số chính xác / số thực / modulo), ma trận, đa thức, bộ tính cho sổ tay. */
(function (global) {
'use strict';
const CP = global.CP;
const NE = (key, params) => new CP.CalcError(key, params);
const babs = (x) => (x < 0n ? -x : x);
function bgcd(a, b) { a = babs(a); b = babs(b); while (b) [a, b] = [b, a % b]; return a; }

/* ================================================================ fields */
class Q {
  constructor(n, d) {
    if (d === undefined) d = 1n;
    if (d === 0n) throw NE('err.divZero', {});
    if (d < 0n) { n = -n; d = -d; }
    const g = bgcd(n, d) || 1n;
    this.n = n / g; this.d = d / g;
  }
}
function decimalToQ(str) {
  // "0.125" / "1.5e-3" → exact fraction
  const m = String(str).match(/^(-?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
  if (!m) return null;
  const frac = m[3] || '', exp = m[4] ? parseInt(m[4], 10) : 0;
  let n = BigInt((m[2] || '0') + frac), d = 10n ** BigInt(frac.length);
  if (exp > 0) n *= 10n ** BigInt(exp); else if (exp < 0) d *= 10n ** BigInt(-exp);
  return new Q(m[1] ? -n : n, d);
}

function makeField(mode, M) {
  if (mode === 'real') {
    return {
      mode, zero: 0, one: 1,
      from(v) { if (v instanceof Q) return Number(v.n) / Number(v.d); return typeof v === 'bigint' ? Number(v) : v; },
      add: (a, b) => a + b, sub: (a, b) => a - b, mul: (a, b) => a * b, neg: (a) => -a,
      div(a, b) { if (b === 0) throw NE('err.divZero', {}); return a / b; },
      isZero: (a) => Math.abs(a) < 1e-12, eq: (a, b) => Math.abs(a - b) <= 1e-12 * Math.max(1, Math.abs(a), Math.abs(b)),
      toNumber: (a) => a, isInt: (a) => Number.isInteger(a), toBig: (a) => BigInt(Math.round(a)),
      str(a) { if (Math.abs(a) < 1e-12) return '0'; const r = parseFloat(a.toPrecision(12)); return Math.abs(r) >= 1e15 || (Math.abs(r) < 1e-6) ? r.toExponential(6).replace(/\.?0+e/, 'e') : String(r); },
      sign: (a) => (a < 0 ? -1 : a > 0 ? 1 : 0),
    };
  }
  if (mode === 'mod') {
    if (M < 2n) throw NE('num.badMod', {});
    const norm = (x) => { x %= M; return x < 0n ? x + M : x; };
    const prime = CP.isPrime(M);
    const inv = (a) => {
      // extended Euclid (works whenever gcd(a, M) = 1)
      let [g, x] = [a, 1n], [g2, x2] = [M, 0n];
      while (g2) { const q = g / g2; [g, g2] = [g2, g - q * g2]; [x, x2] = [x2, x - q * x2]; }
      if (g !== 1n) throw NE('num.noInverse', { a: a.toString(), m: M.toString() });
      return norm(x);
    };
    return {
      mode, M, prime, zero: 0n, one: 1n,
      from(v) {
        if (v instanceof Q) return norm(norm(v.n) * inv(norm(v.d)));
        if (typeof v === 'bigint') return norm(v);
        if (Number.isInteger(v)) return norm(BigInt(v));
        const q = decimalToQ(String(v)); if (!q) throw NE('num.notExact', { v: String(v) });
        return this.from(q);
      },
      add: (a, b) => norm(a + b), sub: (a, b) => norm(a - b), mul: (a, b) => (a * b) % M, neg: (a) => norm(-a),
      div(a, b) { if (b === 0n) throw NE('err.divZero', {}); return (a * inv(b)) % M; },
      isZero: (a) => a === 0n, eq: (a, b) => a === b, toNumber: (a) => Number(a), isInt: () => true, toBig: (a) => a,
      str: (a) => a.toString(), sign: (a) => (a === 0n ? 0 : 1), inv,
    };
  }
  // exact rationals
  return {
    mode: 'exact', zero: new Q(0n), one: new Q(1n),
    from(v) {
      if (v instanceof Q) return v;
      if (typeof v === 'bigint') return new Q(v);
      if (Number.isInteger(v) && Math.abs(v) <= Number.MAX_SAFE_INTEGER) return new Q(BigInt(v));
      if (!Number.isFinite(v)) throw NE('num.notExact', { v: String(v) });
      const q = decimalToQ(String(v)); if (!q) throw NE('num.notExact', { v: String(v) });
      return q;
    },
    add: (a, b) => new Q(a.n * b.d + b.n * a.d, a.d * b.d), sub: (a, b) => new Q(a.n * b.d - b.n * a.d, a.d * b.d),
    mul: (a, b) => new Q(a.n * b.n, a.d * b.d), neg: (a) => new Q(-a.n, a.d),
    div(a, b) { if (b.n === 0n) throw NE('err.divZero', {}); return new Q(a.n * b.d, a.d * b.n); },
    isZero: (a) => a.n === 0n, eq: (a, b) => a.n === b.n && a.d === b.d,
    toNumber: (a) => Number(a.n) / Number(a.d), isInt: (a) => a.d === 1n, toBig: (a) => a.n / a.d,
    str: (a) => (a.d === 1n ? a.n.toString() : a.n.toString() + '/' + a.d.toString()), sign: (a) => (a.n < 0n ? -1 : a.n > 0n ? 1 : 0),
  };
}
function fpow(F, a, e) {
  e = BigInt(e);
  if (e < 0n) { a = F.div(F.one, a); e = -e; }
  let r = F.one;
  while (e > 0n) { if (e & 1n) r = F.mul(r, a); a = F.mul(a, a); e >>= 1n; }
  return r;
}

/* ================================================================ matrices */
class Mat {
  constructor(a) { this.a = a; this.r = a.length; this.c = a.length ? a[0].length : 0; }
}
function matIdentity(F, n) { return new Mat(Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? F.one : F.zero)))); }
function matMul(F, A, B) {
  if (A.c !== B.r) throw NE('num.dimMul', { a: A.r + '×' + A.c, b: B.r + '×' + B.c });
  const out = Array.from({ length: A.r }, () => new Array(B.c).fill(F.zero));
  for (let i = 0; i < A.r; i++) for (let k = 0; k < A.c; k++) {
    const x = A.a[i][k]; if (F.isZero(x)) continue;
    for (let j = 0; j < B.c; j++) out[i][j] = F.add(out[i][j], F.mul(x, B.a[k][j]));
  }
  return new Mat(out);
}
function matPow(F, A, e) {
  if (A.r !== A.c) throw NE('num.notSquare', { a: A.r + '×' + A.c });
  e = BigInt(e);
  if (e < 0n) throw NE('num.negPow', {});
  let R = matIdentity(F, A.r), B = A;
  while (e > 0n) { if (e & 1n) R = matMul(F, R, B); B = matMul(F, B, B); e >>= 1n; }
  return R;
}
function matZip(F, A, B, op, sym) {
  if (A.r !== B.r || A.c !== B.c) throw NE('num.dimAdd', { a: A.r + '×' + A.c, b: B.r + '×' + B.c, op: sym });
  return new Mat(A.a.map((row, i) => row.map((x, j) => op(x, B.a[i][j]))));
}
const matMap = (A, f) => new Mat(A.a.map((row) => row.map(f)));

/* ================================================================ polynomials (coefficients low → high) */
class Poly {
  constructor(v, c, F) { this.v = v; this.c = c; if (F) trim(F, this.c); }
  get deg() { return this.c.length - 1; }
}
function trim(F, c) { while (c.length > 1 && F.isZero(c[c.length - 1])) c.pop(); if (!c.length) c.push(F.zero); return c; }
function pconst(F, v, k) { return new Poly(v, [k], F); }
function sameVar(P, Q2) {
  if (P.v !== Q2.v && P.deg > 0 && Q2.deg > 0) throw NE('num.varMismatch', { a: P.v, b: Q2.v });
  return P.deg > 0 ? P.v : Q2.v;
}
function padd(F, P, Q2, sub) {
  const v = sameVar(P, Q2), n = Math.max(P.c.length, Q2.c.length), c = [];
  for (let i = 0; i < n; i++) {
    const a = P.c[i] !== undefined ? P.c[i] : F.zero, b = Q2.c[i] !== undefined ? Q2.c[i] : F.zero;
    c.push(sub ? F.sub(a, b) : F.add(a, b));
  }
  return new Poly(v, c, F);
}
function pmul(F, P, Q2) {
  const v = sameVar(P, Q2);
  if (P.c.length + Q2.c.length > 20002) throw NE('num.tooBigPoly', {});
  const c = new Array(P.c.length + Q2.c.length - 1).fill(F.zero);
  for (let i = 0; i < P.c.length; i++) {
    if (F.isZero(P.c[i])) continue;
    for (let j = 0; j < Q2.c.length; j++) c[i + j] = F.add(c[i + j], F.mul(P.c[i], Q2.c[j]));
  }
  return new Poly(v, c, F);
}
function pIsZero(F, P) { return P.c.length === 1 && F.isZero(P.c[0]); }
function pdivmod(F, P, Q2) {
  const v = sameVar(P, Q2);
  if (pIsZero(F, Q2)) throw NE('err.divZero', {});
  if (F.mode === 'mod' && !F.prime) throw NE('num.needPrime', { m: F.M.toString() });
  const r = P.c.slice(), dq = Q2.deg, lead = Q2.c[dq];
  if (P.deg < dq) return { q: pconst(F, v, F.zero), r: new Poly(v, r, F) };
  const q = new Array(P.deg - dq + 1).fill(F.zero);
  for (let i = P.deg - dq; i >= 0; i--) {
    const coef = F.div(r[i + dq], lead);
    q[i] = coef;
    if (F.isZero(coef)) continue;
    for (let j = 0; j <= dq; j++) r[i + j] = F.sub(r[i + j], F.mul(coef, Q2.c[j]));
  }
  return { q: new Poly(v, q, F), r: new Poly(v, r.slice(0, Math.max(1, dq)), F) };
}
function peval(F, P, x) {
  let r = F.zero;
  for (let i = P.c.length - 1; i >= 0; i--) r = F.add(F.mul(r, x), P.c[i]);
  return r;
}
function pderiv(F, P) {
  if (P.deg === 0) return pconst(F, P.v, F.zero);
  return new Poly(P.v, P.c.slice(1).map((a, i) => F.mul(a, F.from(BigInt(i + 1)))), F);
}
function pinteg(F, P) {
  const c = [F.zero];
  P.c.forEach((a, i) => {
    if (F.mode === 'mod' && BigInt(i + 1) % F.M === 0n && !F.isZero(a)) throw NE('num.integMod', { k: i + 1 });
    c.push(F.div(a, F.from(BigInt(i + 1))));
  });
  return new Poly(P.v, c, F);
}
function pcompose(F, P, Q2) {
  let r = pconst(F, Q2.v, F.zero);
  for (let i = P.c.length - 1; i >= 0; i--) r = padd(F, pmul(F, r, Q2), pconst(F, Q2.v, P.c[i]));
  return r;
}
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
function polyStr(F, P, plain) {
  const terms = [];
  for (let i = P.c.length - 1; i >= 0; i--) {
    const a = P.c[i];
    if (F.isZero(a) && P.deg > 0) continue;
    let neg = F.mode !== 'mod' && F.sign(a) < 0;
    let s = F.str(neg ? F.neg(a) : a);
    const mono = i === 0 ? '' : P.v + (i > 1 ? (plain ? '^' + i : String(i).split('').map((d) => SUP[d]).join('')) : '');
    if (i > 0 && s === '1') s = '';
    else if (i > 0 && s.includes('/')) s = '(' + s + ')' + (plain ? '*' : '·');
    else if (i > 0 && plain) s += '*';
    terms.push({ neg, t: s + mono });
  }
  if (!terms.length) return '0';
  return terms.map((x, k) => (k === 0 ? (x.neg ? (plain ? '-' : '−') : '') : x.neg ? (plain ? ' - ' : ' − ') : ' + ') + x.t).join('');
}

/* ================================================================ values & display */
const isMat = (x) => x instanceof Mat, isPoly = (x) => x instanceof Poly;
class Disp { constructor(html, text, kind) { this.html = html; this.text = text; this.kind = kind || 'disp'; } }

function toText(F, v) {
  if (isMat(v)) return v.a.map((r) => r.map((x) => F.str(x)).join(' ')).join('\n');
  if (isPoly(v)) return polyStr(F, v, true);
  if (v instanceof Disp) return v.text;
  return F.str(v);
}

/* ================================================================ evaluator */
function ops(F) {
  const bad = (op, a, b) => NE('num.badOp', { op, a: kindOf(a), b: kindOf(b) });
  const add = (a, b, sub) => {
    if (isMat(a) && isMat(b)) return matZip(F, a, b, sub ? F.sub : F.add, sub ? '−' : '+');
    if (isMat(a) || isMat(b)) throw bad(sub ? '−' : '+', a, b);
    if (isPoly(a) || isPoly(b)) {
      const v = isPoly(a) ? a.v : b.v;
      return padd(F, isPoly(a) ? a : pconst(F, v, a), isPoly(b) ? b : pconst(F, v, b), sub);
    }
    return sub ? F.sub(a, b) : F.add(a, b);
  };
  const mul = (a, b) => {
    if (isMat(a) && isMat(b)) return matMul(F, a, b);
    if (isMat(a) && !isPoly(b)) return matMap(a, (x) => F.mul(x, b));
    if (isMat(b) && !isPoly(a)) return matMap(b, (x) => F.mul(a, x));
    if (isMat(a) || isMat(b)) throw bad('×', a, b);
    if (isPoly(a) || isPoly(b)) {
      if (!isPoly(a)) return new Poly(b.v, b.c.map((x) => F.mul(a, x)), F);
      if (!isPoly(b)) return new Poly(a.v, a.c.map((x) => F.mul(x, b)), F);
      return pmul(F, a, b);
    }
    return F.mul(a, b);
  };
  const div = (a, b) => {
    if (isMat(b)) throw bad('/', a, b);
    if (isMat(a)) return matMap(a, (x) => F.div(x, b));
    if (isPoly(b)) {
      const P = isPoly(a) ? a : pconst(F, b.v, a);
      const { q, r } = pdivmod(F, P, b);
      if (pIsZero(F, r)) return q;
      return divDisp(F, q, r);
    }
    if (isPoly(a)) return new Poly(a.v, a.c.map((x) => F.div(x, b)), F);
    return F.div(a, b);
  };
  const mod = (a, b) => {
    if (isPoly(a) || isPoly(b)) {
      const v = isPoly(a) ? a.v : b.v;
      return pdivmod(F, isPoly(a) ? a : pconst(F, v, a), isPoly(b) ? b : pconst(F, v, b)).r;
    }
    if (isMat(a) || isMat(b)) throw bad('%', a, b);
    if (F.mode === 'exact' && F.isInt(a) && F.isInt(b)) { if (b.n === 0n) throw NE('err.divZero', {}); let r = a.n % b.n; if (r < 0n) r += babs(b.n); return new Q(r); }
    if (F.mode === 'real') return a - b * Math.floor(a / b);
    throw bad('%', a, b);
  };
  const pow = (a, e) => {
    if (isMat(a)) return matPow(F, a, e);
    if (isPoly(a)) {
      if (e < 0n) throw NE('num.negPow', {});
      if (BigInt(a.deg) * e > 20000n) throw NE('num.tooBigPoly', {});
      let r = pconst(F, a.v, F.one), b = a, k = e;
      while (k > 0n) { if (k & 1n) r = pmul(F, r, b); k >>= 1n; if (k) b = pmul(F, b, b); }
      return r;
    }
    return fpow(F, a, e);
  };
  return { add, mul, div, mod, pow };
}
function kindOf(x) { return isMat(x) ? 'matrix ' + x.r + '×' + x.c : isPoly(x) ? 'polynomial(' + x.v + ')' : x instanceof Disp ? 'result' : 'number'; }
function divDisp(F, q, r) {
  const t = 'q = ' + polyStr(F, q, true) + ' ; r = ' + polyStr(F, r, true);
  return new Disp(null, t, 'divmod');
}

/* Evaluate a parsed AST. env: name → value; builtins get F and the evaluator */
function evaluate(ast, env, F, builtins) {
  const O = ops(F);
  const ev = (n) => {
    switch (n.t) {
      case 'num': return F.from(n.v);
      case 'var':
        if (Object.prototype.hasOwnProperty.call(env, n.name)) {
          const v = env[n.name];
          if (v instanceof Disp) throw NE('num.dispUse', { name: n.name });
          return v;
        }
        if ((n.name === 'pi' || n.name === 'e') && F.mode === 'real') return n.name === 'pi' ? Math.PI : Math.E;
        throw NE('err.unknownVar', { name: n.name });
      case 'neg': { const a = ev(n.a); return O.mul(F.from(-1n), a); }
      case 'fact': throw NE('num.noFact', {});
      case 'index': throw NE('num.noIndex', {});
      case 'call': {
        const f = Object.prototype.hasOwnProperty.call(env, n.name) ? env[n.name] : undefined;
        if (isPoly(f)) {
          if (n.args.length !== 1) throw NE('err.arity', { fn: n.name, n: 1 });
          const x = ev(n.args[0]);
          if (isPoly(x)) return pcompose(F, f, x);
          if (isMat(x)) {
            // matrix polynomial by Horner
            if (x.r !== x.c) throw NE('num.notSquare', { a: x.r + '×' + x.c });
            let R = matMap(x, () => F.zero);
            const I = matIdentity(F, x.r);
            for (let i = f.c.length - 1; i >= 0; i--) R = matZip(F, matMul(F, R, x), matMap(I, (v) => F.mul(v, f.c[i])), F.add, '+');
            return R;
          }
          return peval(F, f, x);
        }
        const b = builtins[n.name];
        if (!b) throw NE('err.unknownFn', { name: n.name });
        return b(n.args, ev, env);
      }
      case 'bin': {
        if (n.op === '^') {
          const base = ev(n.a);
          return O.pow(base, intExpr(n.b, env, F));
        }
        const a = ev(n.a), b = ev(n.b);
        if (a instanceof Disp || b instanceof Disp) throw NE('num.dispUse', { name: '…' });
        switch (n.op) {
          case '+': return O.add(a, b);
          case '-': return O.add(a, b, true);
          case '*': return O.mul(a, b);
          case '/': return O.div(a, b);
          case '%': return O.mod(a, b);
          case '//': throw NE('num.useDivmod', {});
        }
      }
    }
    throw NE('err.generic', { msg: 'node ' + n.t });
  };
  return ev(ast);
}
/* exponents are plain integers (not reduced modulo M) */
function intExpr(ast, env, F) {
  const plain = {};
  for (const [k, v] of Object.entries(env)) {
    if (v instanceof Q && v.d === 1n) plain[k] = v.n;
    else if (typeof v === 'bigint') plain[k] = v;
    else if (typeof v === 'number' && Number.isInteger(v)) plain[k] = BigInt(v);
  }
  const r = CP.unwrap(CP.evaluate(ast, plain));
  if (typeof r === 'bigint') return r;
  if (Number.isInteger(r)) return BigInt(r);
  throw NE('num.intExp', {});
}

/* matrix literals: "[1 2; 3 4]" → placeholders, parsed separately */
function extractMatrices(line) {
  const mats = [];
  let out = '', i = 0;
  while (i < line.length) {
    const ch = line[i];
    const prev = out.replace(/\s+$/, '').slice(-1);
    if (ch === '[' && !/[A-Za-z0-9_\])]/.test(prev)) {
      let depth = 0, j = i;
      for (; j < line.length; j++) { if (line[j] === '[') depth++; else if (line[j] === ']' && --depth === 0) break; }
      if (j >= line.length) throw NE('err.expected', { what: ']', at: i + 1 });
      mats.push(line.slice(i + 1, j));
      out += ' __m' + (mats.length - 1) + ' ';
      i = j + 1;
      continue;
    }
    out += ch; i++;
  }
  return { text: out, mats };
}
function parseMatrix(src, env, F, builtins) {
  const rows = src.split(/;|\n/).map((r) => r.trim()).filter(Boolean);
  if (!rows.length) throw NE('num.emptyMat', {});
  const a = rows.map((r) => (r.includes(',') ? r.split(',') : r.split(/\s+/)).map((x) => x.trim()).filter(Boolean).map((x) => {
    const v = evaluate(CP.parse(x), env, F, builtins);
    if (isMat(v) || isPoly(v) || v instanceof Disp) throw NE('num.matEntry', { x });
    return v;
  }));
  const w = a[0].length;
  a.forEach((r, i) => { if (r.length !== w) throw NE('num.ragged', { i: i + 1, n: r.length, w }); });
  return new Mat(a);
}

function freeVars(ast, env, builtins) {
  const out = new Set();
  const walk = (n) => {
    if (!n) return;
    if (n.t === 'var' && !Object.prototype.hasOwnProperty.call(env, n.name) && !['pi', 'e'].includes(n.name)) out.add(n.name);
    if (n.t === 'bin') { walk(n.a); if (n.op !== '^') walk(n.b); }
    if (n.t === 'neg' || n.t === 'fact') walk(n.a);
    if (n.t === 'call') n.args.forEach(walk);
  };
  walk(ast);
  return [...out];
}
/* One notebook line → { name, value } */
function runLine(line, env, F, builtins) {
  let m = line.match(/^\s*([A-Za-z_]\w*)\s*\(\s*([A-Za-z_]\w*)\s*\)\s*=(?!=)\s*(.+)$/);
  if (m) {
    // polynomial definition P(x) = ...
    const [, name, v, rhs] = m;
    const local = Object.assign({}, env, { [v]: new Poly(v, [F.zero, F.one], F) });
    const ex = extractMatrices(rhs);
    ex.mats.forEach((s, k) => { local['__m' + k] = parseMatrix(s, local, F, builtins); });
    let val = evaluate(CP.parse(ex.text), local, F, builtins);
    if (!isPoly(val) && !isMat(val) && !(val instanceof Disp)) val = pconst(F, v, val);
    if (!isPoly(val)) throw NE('num.notPoly', { name });
    val = new Poly(v, val.c.slice(), F);
    return { name, value: val };
  }
  m = line.match(/^\s*([A-Za-z_]\w*)\s*=(?!=)\s*(.+)$/);
  const name = m ? m[1] : null, rhs = m ? m[2] : line;
  const ex = extractMatrices(rhs);
  const local = Object.assign({}, env);
  ex.mats.forEach((s, k) => { local['__m' + k] = parseMatrix(s, local, F, builtins); });
  const ast = CP.parse(ex.text);
  // an undefined variable (only one allowed per line) is the variable of a polynomial: (x+1)^3, roots(x^2+1)
  const free = freeVars(ast, local, builtins);
  if (free.length > 1) throw NE('num.manyFree', { v: free.join(', ') });
  if (free.length === 1) local[free[0]] = new Poly(free[0], [F.zero, F.one], F);
  const value = evaluate(ast, local, F, builtins);
  return { name, value };
}

global.NumCore = {
  Q, decimalToQ, makeField, fpow, Mat, matIdentity, matMul, matPow, matMap, Poly, pconst, padd, pmul, pdivmod, peval, pderiv, pinteg,
  pcompose, pIsZero, polyStr, Disp, isMat, isPoly, toText, evaluate, runLine, intExpr, kindOf, bgcd,
};
})(typeof window !== 'undefined' ? window : globalThis);
