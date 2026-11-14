/* Numerical — thuật toán: nghiệm đa thức, khử Gauss, Lagrange, Berlekamp–Massey, truy hồi, bảng sinh. */
(function (global) {
'use strict';
const CP = global.CP, N = global.NumCore;
const NE = (key, params) => new CP.CalcError(key, params);
const { Q, Mat, Poly, Disp, isMat, isPoly } = N;

/* ================================================================ roots (real / complex) */
const C = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]], sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
  mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
  div: (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; },
  abs: (a) => Math.hypot(a[0], a[1]),
};
function cHorner(c, z) {
  // value and derivative of the polynomial with real coefficients c (low → high)
  let p = [0, 0], dp = [0, 0];
  for (let i = c.length - 1; i >= 0; i--) { dp = C.add(C.mul(dp, z), p); p = C.add(C.mul(p, z), [c[i], 0]); }
  return [p, dp];
}
/* Aberth–Ehrlich iteration for all complex roots of a real polynomial */
function aberth(c) {
  const n = c.length - 1;
  if (n < 1) return [];
  const lead = c[n];
  const a = c.map((x) => x / lead);
  const R = 1 + Math.max(...a.slice(0, n).map(Math.abs));   // Cauchy bound
  let z = Array.from({ length: n }, (_, k) => { const t = 2 * Math.PI * k / n + 0.4; return [R * 0.7 * Math.cos(t), R * 0.7 * Math.sin(t)]; });
  for (let it = 0; it < 500; it++) {
    let maxc = 0;
    const nz = z.map((zk, k) => {
      const [p, dp] = cHorner(a, zk);
      if (C.abs(p) === 0) return zk;
      const w = C.div(p, dp);
      let s = [0, 0];
      for (let j = 0; j < n; j++) if (j !== k) { const d = C.sub(zk, z[j]); if (C.abs(d) > 0) s = C.add(s, C.div([1, 0], d)); }
      const corr = C.div(w, C.sub([1, 0], C.mul(w, s)));
      maxc = Math.max(maxc, C.abs(corr) / Math.max(1, C.abs(zk)));
      return C.sub(zk, corr);
    });
    z = nz;
    if (maxc < 1e-15) break;
  }
  return z;
}
/* group close roots into one root with multiplicity */
function cluster(z) {
  const used = new Array(z.length).fill(false), out = [];
  for (let i = 0; i < z.length; i++) {
    if (used[i]) continue;
    const grp = [z[i]]; used[i] = true;
    for (let j = i + 1; j < z.length; j++) if (!used[j] && C.abs(C.sub(z[i], z[j])) < 1e-5 * Math.max(1, C.abs(z[i]))) { used[j] = true; grp.push(z[j]); }
    const re = grp.reduce((s, x) => s + x[0], 0) / grp.length, im = grp.reduce((s, x) => s + x[1], 0) / grp.length;
    out.push({ re, im, mult: grp.length });
  }
  return out;
}
function divisorsOf(x, cap) {
  x = x < 0n ? -x : x;
  if (x === 0n) return null;
  if (x > 10n ** 30n) return null;
  const f = CP.factorize(x);
  const count = f.reduce((a, [, e]) => a * (e + 1), 1);
  if (count > cap) return null;
  return CP.divisors(f);
}
/* roots of P: exact rational roots (exact mode) + numeric real/complex roots for the rest */
function roots(F, P) {
  if (F.mode === 'mod') throw NE('num.rootsMod', {});
  if (P.deg < 1) throw NE('num.rootsConst', {});
  const res = [];
  let c = P.c.slice();
  if (F.mode === 'exact') {
    // x = 0 roots
    let z0 = 0; while (c.length > 1 && c[0].n === 0n) { c.shift(); z0++; }
    if (z0) res.push({ exact: '0', re: 0, im: 0, mult: z0 });
    // clear denominators → integer coefficients
    const L = c.reduce((l, q) => l / N.bgcd(l, q.d) * q.d, 1n);
    let ints = c.map((q) => q.n * (L / q.d));
    const ps = divisorsOf(ints[0], 3000), qs = divisorsOf(ints[ints.length - 1], 3000);
    if (ps && qs) {
      const tried = new Set();
      const tryRoot = (p, q) => {
        // q^d · P(p/q) with integer arithmetic
        let acc = 0n; const d = ints.length - 1;
        for (let i = 0; i <= d; i++) acc += ints[i] * p ** BigInt(i) * q ** BigInt(d - i);
        return acc === 0n;
      };
      for (const q of qs) for (const p0 of ps) for (const p of [p0, -p0]) {
        if (N.bgcd(p, q) !== 1n) continue;
        const key = p + '/' + q; if (tried.has(key)) continue; tried.add(key);
        let mult = 0;
        while (ints.length > 1 && tryRoot(p, q)) {
          // divide by (q·x − p): P = (q·x − p)·S
          const d = ints.length - 1, sv = new Array(d);
          sv[d - 1] = ints[d] / q;
          for (let i = d - 1; i >= 1; i--) sv[i - 1] = (ints[i] + p * sv[i]) / q;
          ints = sv; mult++;
        }
        if (mult) res.push({ exact: q === 1n ? p.toString() : p + '/' + q, re: Number(p) / Number(q), im: 0, mult });
      }
      c = ints.map((x) => new Q(x));
    }
    c = c.map((q) => Number(q.n) / Number(q.d));
  } else c = c.slice();
  if (c.length > 1) {
    const num = cluster(aberth(c)).map((r) => {
      const re = Math.abs(r.re) < 1e-12 ? 0 : r.re, im = Math.abs(r.im) < 1e-9 * Math.max(1, Math.abs(r.re)) ? 0 : r.im;
      return { exact: null, re, im, mult: r.mult };
    });
    res.push(...num);
  }
  // real roots first (increasing), then complex ones
  return res.sort((a, b) => (a.im !== 0) - (b.im !== 0) || a.re - b.re || a.im - b.im);
}
function fmtR(x) { const r = parseFloat(x.toPrecision(12)); return Object.is(r, -0) ? '0' : String(r); }
function rootText(r) {
  if (r.exact) return r.exact;
  if (r.im === 0) return '≈ ' + fmtR(r.re);
  return '≈ ' + fmtR(r.re) + (r.im < 0 ? ' − ' : ' + ') + fmtR(Math.abs(r.im)) + 'i';
}

/* ================================================================ Gauss–Jordan */
/* A: rows of field elements (augmented when rhs). Returns reduced matrix, pivots, rank. */
function rref(F, rows, ncols) {
  const a = rows.map((r) => r.slice());
  const pivots = [];
  let r = 0;
  for (let c = 0; c < ncols && r < a.length; c++) {
    let p = -1;
    if (F.mode === 'real') { let best = 1e-12; for (let i = r; i < a.length; i++) if (Math.abs(a[i][c]) > best) { best = Math.abs(a[i][c]); p = i; } }
    else for (let i = r; i < a.length; i++) if (!F.isZero(a[i][c])) { p = i; break; }
    if (p < 0) continue;
    [a[r], a[p]] = [a[p], a[r]];
    const inv = F.div(F.one, a[r][c]);
    a[r] = a[r].map((x) => F.mul(x, inv));
    for (let i = 0; i < a.length; i++) {
      if (i === r || F.isZero(a[i][c])) continue;
      const f = a[i][c];
      a[i] = a[i].map((x, j) => F.sub(x, F.mul(f, a[r][j])));
    }
    pivots.push(c); r++;
  }
  return { a, pivots, rank: r };
}
function requirePrime(F) { if (F.mode === 'mod' && !F.prime) throw NE('num.needPrime', { m: F.M.toString() }); }
/* Solve a linear system. aug: rows [a1..an | b]. Returns { status: 'none'|'unique'|'many', ... } */
function solveLinear(F, aug, nvars) {
  requirePrime(F);
  const { a, pivots, rank } = rref(F, aug, nvars);
  for (let i = rank; i < a.length; i++) if (!F.isZero(a[i][nvars])) return { status: 'none', rank };
  const free = [];
  for (let c = 0; c < nvars; c++) if (!pivots.includes(c)) free.push(c);
  // x_pivot = b − Σ a[row][free]·t_free
  const sol = new Array(nvars).fill(null);
  pivots.forEach((c, row) => { sol[c] = { k: a[row][nvars], terms: free.map((f) => [f, F.neg(a[row][f])]).filter(([, v]) => !F.isZero(v)) }; });
  free.forEach((f) => { sol[f] = { free: true }; });
  return { status: free.length ? 'many' : 'unique', rank, free, sol };
}
function det(F, A) {
  if (A.r !== A.c) throw NE('num.notSquare', { a: A.r + '×' + A.c });
  requirePrime(F);
  const a = A.a.map((r) => r.slice());
  let d = F.one;
  for (let c = 0; c < A.r; c++) {
    let p = -1;
    if (F.mode === 'real') { let best = 1e-12; for (let i = c; i < A.r; i++) if (Math.abs(a[i][c]) > best) { best = Math.abs(a[i][c]); p = i; } }
    else for (let i = c; i < A.r; i++) if (!F.isZero(a[i][c])) { p = i; break; }
    if (p < 0) return F.zero;
    if (p !== c) { [a[p], a[c]] = [a[c], a[p]]; d = F.neg(d); }
    d = F.mul(d, a[c][c]);
    for (let i = c + 1; i < A.r; i++) {
      if (F.isZero(a[i][c])) continue;
      const f = F.div(a[i][c], a[c][c]);
      for (let j = c; j < A.r; j++) a[i][j] = F.sub(a[i][j], F.mul(f, a[c][j]));
    }
  }
  return d;
}
function inverse(F, A) {
  if (A.r !== A.c) throw NE('num.notSquare', { a: A.r + '×' + A.c });
  requirePrime(F);
  const n = A.r;
  const aug = A.a.map((r, i) => r.concat(Array.from({ length: n }, (_, j) => (i === j ? F.one : F.zero))));
  const { a, rank } = rref(F, aug, n);
  if (rank < n) throw NE('num.singular', {});
  return new Mat(a.map((r) => r.slice(n)));
}

/* Parse linear equations "2x + 3y - z = 5" (one per line). Returns { vars, aug }. */
function parseEquations(F, text) {
  const lines = text.split(/\n|;/).map((l) => l.trim()).filter(Boolean);
  const vars = [];
  const lin = (n) => {
    // value: { k: const, c: Map var → coef }
    switch (n.t) {
      case 'num': return { k: F.from(n.v), c: new Map() };
      case 'var': { if (!vars.includes(n.name)) vars.push(n.name); return { k: F.zero, c: new Map([[n.name, F.one]]) }; }
      case 'neg': { const a = lin(n.a); return scale(a, F.neg(F.one)); }
      case 'bin': {
        const a = lin(n.a), b = lin(n.b);
        if (n.op === '+' || n.op === '-') {
          const c = new Map(a.c);
          b.c.forEach((v, k) => { const cur = c.has(k) ? c.get(k) : F.zero; c.set(k, n.op === '+' ? F.add(cur, v) : F.sub(cur, v)); });
          return { k: n.op === '+' ? F.add(a.k, b.k) : F.sub(a.k, b.k), c };
        }
        if (n.op === '*') { if (!a.c.size) return scale(b, a.k); if (!b.c.size) return scale(a, b.k); throw NE('num.nonLinear', {}); }
        if (n.op === '/') { if (b.c.size) throw NE('num.nonLinear', {}); return scale(a, F.div(F.one, b.k)); }
        throw NE('num.nonLinear', {});
      }
    }
    throw NE('num.nonLinear', {});
  };
  const scale = (x, s) => ({ k: F.mul(x.k, s), c: new Map([...x.c].map(([k, v]) => [k, F.mul(v, s)])) });
  const eqs = lines.map((l) => {
    const parts = l.split('=');
    if (parts.length > 2) throw NE('num.badEq', { l });
    const L = lin(CP.parse(parts[0])), R = parts.length === 2 ? lin(CP.parse(parts[1])) : { k: F.zero, c: new Map() };
    return { L, R };
  });
  const aug = eqs.map(({ L, R }) => {
    const row = vars.map((v) => F.sub(L.c.has(v) ? L.c.get(v) : F.zero, R.c.has(v) ? R.c.get(v) : F.zero));
    row.push(F.sub(R.k, L.k));
    return row;
  });
  return { vars, aug };
}

/* ================================================================ Lagrange */
function lagrange(F, xs, ys) {
  requirePrime(F);
  const n = xs.length;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (F.eq(xs[i], xs[j])) throw NE('num.dupX', { x: F.str(xs[i]) });
  let P = N.pconst(F, 'x', F.zero);
  for (let i = 0; i < n; i++) {
    let num = N.pconst(F, 'x', F.one), den = F.one;
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      num = N.pmul(F, num, new Poly('x', [F.neg(xs[j]), F.one], F));
      den = F.mul(den, F.sub(xs[i], xs[j]));
    }
    P = N.padd(F, P, new Poly('x', num.c.map((c) => F.mul(c, F.div(ys[i], den))), F));
  }
  return P;
}

/* ================================================================ Berlekamp–Massey & Kitamasa */
/* returns c[1..L] with a_n = Σ c_i a_{n−i} */
function berlekampMassey(F, s) {
  requirePrime(F);
  let C0 = [F.one], B = [F.one], L = 0, m = 1, b = F.one;
  for (let n = 0; n < s.length; n++) {
    let d = s[n];
    for (let i = 1; i <= L; i++) d = F.add(d, F.mul(C0[i] !== undefined ? C0[i] : F.zero, s[n - i]));
    if (F.isZero(d)) { m++; continue; }
    const T = C0.slice(), coef = F.div(d, b);
    const need = B.length + m;
    while (C0.length < need) C0.push(F.zero);
    for (let i = 0; i < B.length; i++) C0[i + m] = F.sub(C0[i + m], F.mul(coef, B[i]));
    if (2 * L <= n) { L = n + 1 - L; B = T; b = d; m = 1; } else m++;
  }
  while (C0.length < L + 1) C0.push(F.zero);
  return C0.slice(1, L + 1).map((x) => F.neg(x));
}
/* a_N for a_n = Σ c_i a_{n−i}, given a_0..a_{L−1} (Kitamasa: x^N mod characteristic polynomial) */
function linRecNth(F, c, init, Nn) {
  const L = c.length;
  Nn = BigInt(Nn);
  if (L === 0) return F.zero;
  if (Nn < BigInt(init.length)) return init[Number(Nn)];
  // multiply two polys of degree < L modulo x^L − Σ c_i x^{L−i}
  const mulmod = (p, q) => {
    const r = new Array(2 * L - 1).fill(F.zero);
    for (let i = 0; i < L; i++) { if (F.isZero(p[i])) continue; for (let j = 0; j < L; j++) r[i + j] = F.add(r[i + j], F.mul(p[i], q[j])); }
    for (let k = 2 * L - 2; k >= L; k--) {
      if (F.isZero(r[k])) continue;
      for (let i = 1; i <= L; i++) r[k - i] = F.add(r[k - i], F.mul(r[k], c[i - 1]));
    }
    return r.slice(0, L);
  };
  let res = new Array(L).fill(F.zero); res[0] = F.one;
  let base = new Array(L).fill(F.zero);
  if (L === 1) base[0] = c[0]; else base[1] = F.one;
  let e = Nn;
  while (e > 0n) { if (e & 1n) res = mulmod(res, base); base = mulmod(base, base); e >>= 1n; }
  let ans = F.zero;
  for (let i = 0; i < L; i++) ans = F.add(ans, F.mul(res[i], init[i]));
  return ans;
}

/* ================================================================ sequence generator (integers) */
/* def: "a(n) = expr"; init: values a(0..k−1); computes a(0..R). Supports mex/xor/and/or and loops. */
function generate(defText, initText, R, timeLimitMs) {
  const m = defText.match(/^\s*([A-Za-z_]\w*)\s*\(\s*([A-Za-z_]\w*)\s*\)\s*=(?!=)\s*(.+)$/s);
  if (!m) throw NE('gen.badDef', {});
  const [, fname, vname, rhs] = m;
  const ast = CP.parse(rhs.replace(/\n/g, ' '));
  const init = (initText || '').split(/[\s,]+/).filter(Boolean).map((x) => CP.toBigInt(CP.unwrap(CP.evaluate(CP.parse(x), {})), 'init'));
  const vals = [];
  const big = (x) => CP.toBigInt(CP.unwrap(x), 'bit op');
  class Missing extends Error { constructor(k) { super('missing'); this.k = k; } }
  const env = {};
  env.__funcs = {
    [fname]: ([k]) => { const i = Number(CP.toBigInt(CP.unwrap(k), fname)); if (i < 0 || i >= vals.length) throw new Missing(i); return vals[i]; },
    xor: (a) => a.map(big).reduce((x, y) => x ^ y, 0n),
    and: (a) => a.map(big).reduce((x, y) => x & y),
    or: (a) => a.map(big).reduce((x, y) => x | y, 0n),
    shl: ([a, b]) => big(a) << big(b), shr: ([a, b]) => big(a) >> big(b),
    popcount: ([a]) => { let x = big(a), c = 0n; while (x > 0n) { c += x & 1n; x >>= 1n; } return c; },
  };
  const evalSkip = (args, e) => {
    // evaluate each argument, skipping references to values that do not exist (e.g. a(n−3) when n < 3)
    const out = [];
    for (const a of args) { try { out.push(CP.unwrap(CP.evaluate(a, e))); } catch (err) { if (!(err instanceof Missing)) throw err; } }
    return out;
  };
  const mexOf = (xs) => { const s = new Set(xs.map((x) => String(x))); let k = 0n; while (s.has(String(k))) k++; return k; };
  const loop = (args, e, combine) => {
    if (args.length !== 4 || args[0].t !== 'var') throw NE('gen.badLoop', {});
    const v = args[0].name;
    const lo = CP.toBigInt(CP.unwrap(CP.evaluate(args[1], e)), 'lo'), hi = CP.toBigInt(CP.unwrap(CP.evaluate(args[2], e)), 'hi');
    const xs = [];
    for (let i = lo; i <= hi; i++) {
      const e2 = Object.assign({}, e, { [v]: i });
      try { xs.push(CP.unwrap(CP.evaluate(args[3], e2))); } catch (err) { if (!(err instanceof Missing)) throw err; }
    }
    return combine(xs);
  };
  env.__lazy = {
    mex: (args, e) => mexOf(evalSkip(args, e)),
    min: (args, e) => { const xs = evalSkip(args, e); if (!xs.length) throw NE('gen.empty', { fn: 'min' }); return xs.reduce((a, b) => (CP.toNum(CP.A.sub(a, b)) <= 0 ? a : b)); },
    max: (args, e) => { const xs = evalSkip(args, e); if (!xs.length) throw NE('gen.empty', { fn: 'max' }); return xs.reduce((a, b) => (CP.toNum(CP.A.sub(a, b)) >= 0 ? a : b)); },
    mexfor: (args, e) => loop(args, e, mexOf),
    xorfor: (args, e) => loop(args, e, (xs) => xs.map(big).reduce((x, y) => x ^ y, 0n)),
    sumfor: (args, e) => loop(args, e, (xs) => xs.reduce((x, y) => CP.A.add(x, y), 0n)),
    minfor: (args, e) => loop(args, e, (xs) => { if (!xs.length) throw NE('gen.empty', { fn: 'minfor' }); return xs.reduce((a, b) => (CP.toNum(CP.A.sub(a, b)) <= 0 ? a : b)); }),
    maxfor: (args, e) => loop(args, e, (xs) => { if (!xs.length) throw NE('gen.empty', { fn: 'maxfor' }); return xs.reduce((a, b) => (CP.toNum(CP.A.sub(a, b)) >= 0 ? a : b)); }),
  };
  const t0 = Date.now();
  for (let n = 0; n <= R; n++) {
    if (n < init.length) { vals.push(init[n]); continue; }
    env[vname] = BigInt(n);
    try { vals.push(CP.unwrap(CP.evaluate(ast, env))); }
    catch (err) {
      if (err instanceof Missing) throw NE('gen.missing', { f: fname, k: err.k, n });
      throw err;
    }
    if ((n & 255) === 0 && Date.now() - t0 > (timeLimitMs || 4000)) return { vals, fname, stopped: n };
  }
  return { vals, fname, stopped: null };
}

/* ================================================================ notebook builtins */
function builtins(F) {
  const one = (args, ev, name) => { if (args.length !== 1) throw NE('err.arity', { fn: name, n: 1 }); return ev(args[0]); };
  const needPoly = (x, fn) => { if (!isPoly(x)) throw NE('num.needPoly', { fn }); return x; };
  const needMat = (x, fn) => { if (!isMat(x)) throw NE('num.needMat', { fn }); return x; };
  const intArg = (x, fn) => { if (isMat(x) || isPoly(x) || !F.isInt(x)) throw NE('err.needInt', { fn }); return Number(F.toBig(x)); };
  return {
    I: (a, ev) => { const n = intArg(one(a, ev, 'I'), 'I'); if (n < 1 || n > 200) throw NE('num.badSize', {}); return N.matIdentity(F, n); },
    zeros: (a, ev) => {
      if (a.length < 1 || a.length > 2) throw NE('err.arity', { fn: 'zeros', n: '1-2' });
      const r = intArg(ev(a[0]), 'zeros'), c = a.length > 1 ? intArg(ev(a[1]), 'zeros') : r;
      if (r < 1 || c < 1 || r * c > 40000) throw NE('num.badSize', {});
      return new Mat(Array.from({ length: r }, () => new Array(c).fill(F.zero)));
    },
    transpose: (a, ev) => { const A = needMat(one(a, ev, 'transpose'), 'transpose'); return new Mat(A.a[0].map((_, j) => A.a.map((r) => r[j]))); },
    det: (a, ev) => det(F, needMat(one(a, ev, 'det'), 'det')),
    inv: (a, ev) => inverse(F, needMat(one(a, ev, 'inv'), 'inv')),
    deriv: (a, ev) => N.pderiv(F, needPoly(one(a, ev, 'deriv'), 'deriv')),
    integ: (a, ev) => {
      if (a.length !== 1 && a.length !== 3) throw NE('err.arity', { fn: 'integ', n: '1 / 3' });
      const P = needPoly(ev(a[0]), 'integ'), G = N.pinteg(F, P);
      if (a.length === 1) return G;
      return F.sub(N.peval(F, G, ev(a[2])), N.peval(F, G, ev(a[1])));
    },
    quo: (a, ev) => { if (a.length !== 2) throw NE('err.arity', { fn: 'quo', n: 2 }); return N.pdivmod(F, needPoly(ev(a[0]), 'quo'), needPoly(ev(a[1]), 'quo')).q; },
    rem: (a, ev) => { if (a.length !== 2) throw NE('err.arity', { fn: 'rem', n: 2 }); return N.pdivmod(F, needPoly(ev(a[0]), 'rem'), needPoly(ev(a[1]), 'rem')).r; },
    divmod: (a, ev) => {
      if (a.length !== 2) throw NE('err.arity', { fn: 'divmod', n: 2 });
      const r = N.pdivmod(F, needPoly(ev(a[0]), 'divmod'), needPoly(ev(a[1]), 'divmod'));
      return new Disp(null, 'q = ' + N.polyStr(F, r.q, true) + ' ; r = ' + N.polyStr(F, r.r, true), 'divmod', r);
    },
    deg: (a, ev) => F.from(BigInt(needPoly(one(a, ev, 'deg'), 'deg').deg)),
    coef: (a, ev) => { if (a.length !== 2) throw NE('err.arity', { fn: 'coef', n: 2 }); const P = needPoly(ev(a[0]), 'coef'), k = intArg(ev(a[1]), 'coef'); return P.c[k] !== undefined ? P.c[k] : F.zero; },
    roots: (a, ev) => {
      const P = needPoly(one(a, ev, 'roots'), 'roots');
      const rs = roots(F, P);
      return new Disp(null, rs.map((r) => rootText(r) + (r.mult > 1 ? ' (×' + r.mult + ')' : '')).join(' ; '), 'roots', rs);
    },
    gcd: (a, ev) => {
      if (a.length !== 2) throw NE('err.arity', { fn: 'gcd', n: 2 });
      let P = ev(a[0]), Qp = ev(a[1]);
      if (!isPoly(P) || !isPoly(Qp)) throw NE('num.needPoly', { fn: 'gcd' });
      while (!N.pIsZero(F, Qp)) { const r = N.pdivmod(F, P, Qp).r; P = Qp; Qp = r; }
      const lead = P.c[P.deg];
      return new Poly(P.v, P.c.map((x) => F.div(x, lead)), F);
    },
  };
}

global.NumAlgos = { roots, rootText, rref, solveLinear, det, inverse, parseEquations, lagrange, berlekampMassey, linRecNth, generate, builtins, aberth };
})(typeof window !== 'undefined' ? window : globalThis);
