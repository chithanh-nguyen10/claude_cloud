/* DP Check — logic (không phụ thuộc giao diện).
 * Chi phí đoạn được cho dưới dạng ma trận C[i][j] (0 ≤ i ≤ j < n, chỉ số nội bộ từ 0). */
(function (global) {
'use strict';

/* Normalize a matrix of BigInt|Number to one numeric type */
function normalize(C) {
  let allBig = true;
  for (const row of C) for (const v of row) if (v !== undefined && typeof v !== 'bigint') { allBig = false; break; }
  if (allBig) return { C, big: true };
  return { C: C.map((row) => row.map((v) => (v === undefined ? v : Number(v)))), big: false };
}
const ops = (big) => (big ? { zero: 0n, add: (a, b) => a + b, neg: (a) => -a, lt: (a, b) => a < b, eq: (a, b) => a === b } :
  { zero: 0, add: (a, b) => a + b, neg: (a) => -a, lt: (a, b) => a < b - 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)), eq: (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)) });

/* Quadrangle inequality: C[a][c] + C[b][d] <= C[a][d] + C[b][c] (min) for a <= b <= c <= d.
   Full check when n <= fullN, otherwise random samples. Returns null or a violation. */
function checkQI(Cin, n, mode, opts) {
  opts = opts || {};
  const { C, big } = normalize(Cin), O = ops(big);
  const fullN = opts.fullN || 45, samples = opts.samples || 200000;
  const bad = (a, b, c, d) => {
    const lhs = O.add(C[a][c], C[b][d]), rhs = O.add(C[a][d], C[b][c]);
    // min: need lhs <= rhs, max: need lhs >= rhs
    return mode === 'max' ? O.lt(lhs, rhs) : O.lt(rhs, lhs);
  };
  const viol = (a, b, c, d) => ({ a, b, c, d, ac: C[a][c], bd: C[b][d], ad: C[a][d], bc: C[b][c] });
  if (n <= fullN) {
    for (let a = 0; a < n; a++) for (let b = a; b < n; b++) for (let c = b; c < n; c++) for (let d = c; d < n; d++) if (bad(a, b, c, d)) return viol(a, b, c, d);
    return null;
  }
  const R = opts.rng || Math.random;
  for (let s = 0; s < samples; s++) {
    const q = [0, 0, 0, 0].map(() => Math.floor(R() * n)).sort((x, y) => x - y);
    if (bad(q[0], q[1], q[2], q[3])) return viol(q[0], q[1], q[2], q[3]);
  }
  return null;
}

/* Layered partition DP: dp[k][i] = best over j in [k-1, i-1] of dp[k-1][j] + cost(j, i-1)
   (cost of the segment of positions j..i-1). Returns brute dp, opt ranges, monotonicity and DnC comparison. */
function checkDnC(Cin, n, mode, Kmax) {
  const { C, big } = normalize(Cin), O = ops(big);
  const sign = mode === 'max' ? O.neg : (x) => x;
  const cost = (j, i) => sign(C[j][i - 1]);
  const K = Math.max(1, Math.min(n, Kmax || n));
  let prev = new Array(n + 1).fill(null); prev[0] = O.zero;
  const layers = [];
  let optViol = null, dncViol = null;
  for (let k = 1; k <= K; k++) {
    const cur = new Array(n + 1).fill(null), optL = new Array(n + 1).fill(-1), optR = new Array(n + 1).fill(-1);
    for (let i = k; i <= n; i++) {
      let best = null;
      for (let j = k - 1; j <= i - 1; j++) {
        if (prev[j] === null) continue;
        const v = O.add(prev[j], cost(j, i));
        if (best === null || O.lt(v, best)) { best = v; optL[i] = j; optR[i] = j; }
        else if (O.eq(v, best)) optR[i] = j;
      }
      cur[i] = best;
    }
    // monotone choice exists only if optL(i) <= optR(i+1) for every i
    if (!optViol) for (let i = k; i < n; i++) if (optL[i] >= 0 && optR[i + 1] >= 0 && optL[i] > optR[i + 1]) { optViol = { k, i, optLi: optL[i], optRi1: optR[i + 1], optL: optL.slice(), optR: optR.slice() }; break; }
    // divide & conquer on the same layer
    const dnc = new Array(n + 1).fill(null);
    const solve = (lo, hi, olo, ohi) => {
      if (lo > hi) return;
      const mid = (lo + hi) >> 1;
      let best = null, bj = olo;
      for (let j = Math.max(olo, k - 1); j <= Math.min(mid - 1, ohi); j++) {
        if (prev[j] === null) continue;
        const v = O.add(prev[j], cost(j, mid));
        if (best === null || O.lt(v, best)) { best = v; bj = j; }
      }
      dnc[mid] = best;
      solve(lo, mid - 1, olo, bj);
      solve(mid + 1, hi, bj, ohi);
    };
    solve(k, n, k - 1, n - 1);
    if (!dncViol) for (let i = k; i <= n; i++) {
      const a = dnc[i], b = cur[i];
      if (!(a === null && b === null) && (a === null || b === null || !O.eq(a, b))) { dncViol = { k, i, dnc: a === null ? null : sign(a), brute: b === null ? null : sign(b) }; break; }
    }
    layers.push({ k, dp: cur.map((v) => (v === null ? null : sign(v))), optL, optR });
    prev = cur;
  }
  return { layers, optViol, dncViol };
}

/* Convexity of f(0..K): mode 'convex' (min problems) needs Δ non-decreasing, 'concave' (max) non-increasing.
   vals: array of BigInt|Number|null (null = undefined value, skipped at the ends) */
function checkConvex(vals, mode) {
  const idx = [];
  vals.forEach((v, k) => { if (v !== null && v !== undefined) idx.push(k); });
  // undefined values in the middle break the alien trick as well
  for (let t = 1; t < idx.length; t++) if (idx[t] !== idx[t - 1] + 1) return { gap: true, k: idx[t - 1] + 1 };
  const big = idx.every((k) => typeof vals[k] === 'bigint');
  const v = idx.map((k) => (big ? vals[k] : Number(vals[k])));
  const diffs = [];
  for (let t = 0; t + 1 < v.length; t++) diffs.push(v[t + 1] - v[t]);
  const O = ops(big);
  for (let t = 0; t + 1 < diffs.length; t++) {
    const bad = mode === 'convex' ? O.lt(diffs[t + 1], diffs[t]) : O.lt(diffs[t], diffs[t + 1]);
    if (bad) return { k: idx[0] + t + 1, diffs, first: idx[0] };
  }
  return { ok: true, diffs, first: idx.length ? idx[0] : 0 };
}

global.DPLogic = { checkQI, checkDnC, checkConvex, normalize };
})(typeof window !== 'undefined' ? window : globalThis);
