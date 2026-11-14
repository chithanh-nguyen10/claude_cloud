/* CP Calculator — core: expression engine, number theory, combinatorics, formatting.
 * Values are BigInt (exact integers) or Number (real / approximate). */
(function (global) {
'use strict';

const isBig = (v) => typeof v === 'bigint';
const toNum = (v) => (isBig(v) ? Number(v) : v);
const absBig = (v) => (v < 0n ? -v : v);

class CalcError extends Error {
  constructor(key, params) { super(key); this.key = key; this.params = params || {}; }
}

/* ---------------- Tokenizer ---------------- */
function tokenize(src) {
  const toks = [];
  let i = 0;
  const s = src;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      const m = s.slice(i).match(/^(?:\d[\d']*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
      if (!m) throw new CalcError('err.badNumber', { at: i + 1 });
      toks.push({ t: 'num', v: parseNumber(m[0].replace(/'/g, '')), pos: i });
      i += m[0].length; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = s.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
      toks.push({ t: 'id', v: m[0], pos: i }); i += m[0].length; continue;
    }
    const two = s.slice(i, i + 2);
    if (two === '**' || two === '//') { toks.push({ t: 'op', v: two === '**' ? '^' : '//', pos: i }); i += 2; continue; }
    if ('+-*/%^(),!=[]'.includes(c)) { toks.push({ t: 'op', v: c, pos: i }); i++; continue; }
    if (c === '×' || c === '·') { toks.push({ t: 'op', v: '*', pos: i }); i++; continue; }
    throw new CalcError('err.badChar', { ch: c, at: i + 1 });
  }
  toks.push({ t: 'end', pos: s.length });
  return toks;
}

function parseNumber(str) {
  const m = str.match(/^(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/);
  if (!m) throw new CalcError('err.badNumber', {});
  const intPart = m[1] || '0', frac = (m[2] || '').replace(/0+$/, ''), exp = m[3] ? parseInt(m[3], 10) : 0;
  const shift = exp - frac.length;
  if (shift >= 0 && shift < 4000) {
    return BigInt(intPart + frac) * 10n ** BigInt(shift);
  }
  return parseFloat(str);
}

/* ---------------- Parser (Pratt) ---------------- */
function parse(src) {
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const next = () => toks[p++];
  const expectOp = (v) => {
    const t = next();
    if (t.t !== 'op' || t.v !== v) throw new CalcError('err.expected', { what: v, at: t.pos + 1 });
  };
  const BP = { '+': 10, '-': 10, '*': 20, '/': 20, '//': 20, '%': 20, '^': 40 };

  function nud(t) {
    if (t.t === 'num') return { t: 'num', v: t.v };
    if (t.t === 'id') {
      if (peek().t === 'op' && peek().v === '[') {
        // array access: a[i], g[i][j]
        const idx = [];
        while (peek().t === 'op' && peek().v === '[') { next(); idx.push(expr(0)); expectOp(']'); }
        return { t: 'index', name: t.v, idx };
      }
      if (peek().t === 'op' && peek().v === '(') {
        next();
        const args = [];
        if (!(peek().t === 'op' && peek().v === ')')) {
          for (;;) {
            args.push(expr(0));
            if (peek().t === 'op' && peek().v === ',') { next(); continue; }
            break;
          }
        }
        expectOp(')');
        return { t: 'call', name: t.v, args };
      }
      return { t: 'var', name: t.v };
    }
    if (t.t === 'op' && t.v === '(') { const e = expr(0); expectOp(')'); return e; }
    if (t.t === 'op' && t.v === '-') return { t: 'neg', a: expr(30) };
    if (t.t === 'op' && t.v === '+') return expr(30);
    if (t.t === 'end') throw new CalcError('err.unexpectedEnd', {});
    throw new CalcError('err.unexpected', { tok: t.v, at: t.pos + 1 });
  }

  function expr(rbp) {
    let left = nud(next());
    for (;;) {
      const t = peek();
      if (t.t === 'op' && t.v === '!') { next(); left = { t: 'fact', a: left }; continue; }
      // implicit multiplication: 2n, 3(n+1), (a)(b), n log(n)
      if ((t.t === 'id' || t.t === 'num' || (t.t === 'op' && t.v === '(')) && rbp < 20) {
        left = { t: 'bin', op: '*', a: left, b: expr(20) }; continue;
      }
      if (t.t !== 'op' || !(t.v in BP)) break;
      const bp = BP[t.v];
      if (bp <= rbp) break;
      next();
      const right = expr(t.v === '^' ? bp - 1 : bp);
      left = { t: 'bin', op: t.v, a: left, b: right };
    }
    return left;
  }

  const ast = expr(0);
  if (peek().t !== 'end') {
    const t = peek();
    throw new CalcError('err.unexpected', { tok: t.v, at: t.pos + 1 });
  }
  return ast;
}

/* Parse a notebook line: "name = expr" or "expr" */
function parseLine(line) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(?!=)\s*(.*)$/);
  if (m) {
    if (!m[2].trim()) throw new CalcError('err.unexpectedEnd', {});
    return { assign: m[1], ast: parse(m[2]) };
  }
  return { assign: null, ast: parse(line) };
}

/* Parse "n = 2e5, m = 3e5; q=1e5" into an env object */
function parseVars(text, baseEnv) {
  const env = Object.assign({}, baseEnv || {});
  for (const part of (text || '').split(/[,;\n]+/)) {
    if (!part.trim()) continue;
    const { assign, ast } = parseLine(part);
    if (!assign) throw new CalcError('err.varFormat', { part: part.trim() });
    env[assign] = evaluate(ast, env);
  }
  return env;
}

/* ---------------- Arithmetic on BigInt|Number ---------------- */
function bitLen(b) { b = absBig(b); return b === 0n ? 0 : b.toString(2).length; }

const A = {
  add: (a, b) => (isBig(a) && isBig(b) ? a + b : toNum(a) + toNum(b)),
  sub: (a, b) => (isBig(a) && isBig(b) ? a - b : toNum(a) - toNum(b)),
  mul: (a, b) => (isBig(a) && isBig(b) ? a * b : toNum(a) * toNum(b)),
  div: (a, b) => {
    if (isBig(a) && isBig(b)) {
      if (b === 0n) throw new CalcError('err.divZero', {});
      if (a % b === 0n) return a / b;
      return bigRatio(a, b);
    }
    if (toNum(b) === 0) throw new CalcError('err.divZero', {});
    return toNum(a) / toNum(b);
  },
  idiv: (a, b) => {
    if (isBig(a) && isBig(b)) {
      if (b === 0n) throw new CalcError('err.divZero', {});
      let q = a / b;
      if ((a % b !== 0n) && ((a < 0n) !== (b < 0n))) q -= 1n;
      return q;
    }
    if (toNum(b) === 0) throw new CalcError('err.divZero', {});
    return Math.floor(toNum(a) / toNum(b));
  },
  mod: (a, b) => {
    if (isBig(a) && isBig(b)) {
      if (b === 0n) throw new CalcError('err.divZero', {});
      const r = a % b; return r !== 0n && (r < 0n) !== (b < 0n) ? r + b : r;
    }
    const x = toNum(a), y = toNum(b);
    if (y === 0) throw new CalcError('err.divZero', {});
    return x - y * Math.floor(x / y);
  },
  pow: (a, b) => {
    if (isBig(a) && isBig(b) && b >= 0n) {
      if (a === 0n || a === 1n) return b === 0n ? 1n : a;
      if (a === -1n) return b % 2n === 0n ? 1n : -1n;
      const bits = Number(b) * Math.log2(Number(absBig(a)));
      if (bits <= 200000) return a ** b;
      return Math.pow(toNum(a), toNum(b));
    }
    return Math.pow(toNum(a), toNum(b));
  },
  neg: (a) => (isBig(a) ? -a : -a),
};

// a/b as a float with good precision even for huge BigInts
function bigRatio(a, b) {
  const na = Number(a), nb = Number(b);
  if (Number.isFinite(na) && Number.isFinite(nb)) return na / nb;
  const la = bitLen(a), lb = bitLen(b);
  const shift = Math.max(0, Math.max(la, lb) - 900);
  return Number(a >> BigInt(shift)) / Number(b >> BigInt(shift));
}

function toBigInt(v, name) {
  if (isBig(v)) return v;
  if (Number.isInteger(v) && Math.abs(v) <= Number.MAX_SAFE_INTEGER) return BigInt(v);
  if (Number.isInteger(v) && Number.isFinite(v)) return BigInt(v);
  throw new CalcError('err.needInt', { fn: name });
}

function log2Any(v) {
  if (isBig(v)) {
    if (v <= 0n) return v === 0n ? -Infinity : NaN;
    const L = bitLen(v);
    if (L <= 1000) return Math.log2(Number(v));
    const sh = BigInt(L - 60);
    return Math.log2(Number(v >> sh)) + Number(sh);
  }
  return Math.log2(v);
}

/* ---------------- Number theory (BigInt) ---------------- */
const SMALL_PRIMES = [];
(function () {
  const N = 1000, s = new Uint8Array(N + 1);
  for (let i = 2; i <= N; i++) if (!s[i]) { SMALL_PRIMES.push(i); for (let j = i * i; j <= N; j += i) s[j] = 1; }
})();

function powmod(a, e, m) {
  let r = 1n; a %= m;
  while (e > 0n) { if (e & 1n) r = r * a % m; a = a * a % m; e >>= 1n; }
  return r;
}

function isPrime(n) {
  n = toBigInt(n, 'isprime');
  if (n < 2n) return false;
  for (const p of SMALL_PRIMES.slice(0, 25)) {
    const P = BigInt(p);
    if (n === P) return true;
    if (n % P === 0n) return false;
  }
  let d = n - 1n, s = 0;
  while ((d & 1n) === 0n) { d >>= 1n; s++; }
  for (const a of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n]) {
    let x = powmod(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let comp = true;
    for (let r = 1; r < s; r++) { x = x * x % n; if (x === n - 1n) { comp = false; break; } }
    if (comp) return false;
  }
  return true;
}

function gcdBig(a, b) { a = absBig(a); b = absBig(b); while (b) { [a, b] = [b, a % b]; } return a; }

function pollard(n) {
  if (n % 2n === 0n) return 2n;
  for (let c = 1n; ; c++) {
    // Brent's variant
    let y = 2n, x = 2n, g = 1n, q = 1n, ys = 2n, r = 1, m = 128;
    const f = (v) => (v * v + c) % n;
    do {
      x = y;
      for (let i = 0; i < r; i++) y = f(y);
      let k = 0;
      do {
        ys = y;
        const lim = Math.min(m, r - k);
        for (let i = 0; i < lim; i++) { y = f(y); q = q * absBig(x - y) % n; }
        g = gcdBig(q, n); k += m;
      } while (k < r && g === 1n);
      r *= 2;
    } while (g === 1n);
    if (g === n) {
      do { ys = f(ys); g = gcdBig(absBig(x - ys), n); } while (g === 1n);
    }
    if (g !== n) return g;
  }
}

const FACTOR_LIMIT = 10n ** 30n;
function factorize(n) {
  n = toBigInt(n, 'factor');
  if (n < 1n) throw new CalcError('err.needPositive', { fn: 'factor' });
  if (n > FACTOR_LIMIT) throw new CalcError('err.tooBig', { fn: 'factor', max: '1e30' });
  const res = new Map();
  const add = (p, e = 1) => res.set(p, (res.get(p) || 0) + e);
  for (const p of SMALL_PRIMES) {
    const P = BigInt(p);
    if (P * P > n) break;
    while (n % P === 0n) { add(P); n /= P; }
  }
  const stack = n > 1n ? [n] : [];
  while (stack.length) {
    const x = stack.pop();
    if (x === 1n) continue;
    if (isPrime(x)) { add(x); continue; }
    const d = pollard(x);
    stack.push(d, x / d);
  }
  return [...res.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
}

function numDivisors(n) { return factorize(n).reduce((acc, [, e]) => acc * BigInt(e + 1), 1n); }
function sumDivisors(n) {
  return factorize(n).reduce((acc, [p, e]) => acc * ((p ** BigInt(e + 1) - 1n) / (p - 1n)), 1n);
}
function phi(n) {
  return factorize(n).reduce((acc, [p, e]) => acc * (p - 1n) * p ** BigInt(e - 1), 1n);
}

/* Max number of divisors among x <= N (highly composite search) */
const MAXDIV_LIMIT = 10n ** 24n;
function maxDivisors(N) {
  N = toBigInt(N, 'maxdiv');
  if (N < 1n) throw new CalcError('err.needPositive', { fn: 'maxdiv' });
  if (N > MAXDIV_LIMIT) throw new CalcError('err.tooBig', { fn: 'maxdiv', max: '1e24' });
  const primes = SMALL_PRIMES.slice(0, 30).map(BigInt);
  let bestCnt = 1n, bestNum = 1n;
  (function dfs(idx, cur, cnt, maxE) {
    if (cnt > bestCnt || (cnt === bestCnt && cur < bestNum)) { bestCnt = cnt; bestNum = cur; }
    if (idx >= primes.length) return;
    const p = primes[idx];
    let v = cur;
    for (let e = 1; e <= maxE; e++) {
      if (v > N / p) break;
      v *= p;
      dfs(idx + 1, v, cnt * BigInt(e + 1), e);
    }
  })(0, 1n, 1n, 64);
  return { count: bestCnt, number: bestNum };
}

function maxDistinctPrimes(N) {
  N = toBigInt(N, 'maxomega');
  let prod = 1n, k = 0;
  for (const p of SMALL_PRIMES) {
    const P = BigInt(p);
    if (prod * P > N) break;
    prod *= P; k++;
  }
  return { count: k, number: prod };
}

/* Prime counting: Lucy_Hedgehog, exact up to 1e11 */
const PRIMEPI_LIMIT = 1e11;
const primePiCache = new Map();
function primePiExact(n) {
  if (n < 2) return 0;
  if (primePiCache.has(n)) return primePiCache.get(n);
  const r = Math.floor(Math.sqrt(n));
  const V = [];
  for (let i = 1; i <= r; i++) V.push(Math.floor(n / i));
  const last = V[V.length - 1];
  for (let v = last - 1; v > 0; v--) V.push(v);
  const len = V.length;
  const S = new Float64Array(len);
  for (let i = 0; i < len; i++) S[i] = V[i] - 1;
  const idx = (v) => (v <= r ? len - v : Math.floor(n / v) - 1);
  for (let p = 2; p <= r; p++) {
    const sp = S[len - (p - 1)];
    if (S[len - p] > sp) {
      const p2 = p * p;
      for (let i = 0; i < len; i++) {
        const v = V[i];
        if (v < p2) break;
        S[i] -= S[idx(Math.floor(v / p))] - sp;
      }
    }
  }
  const res = S[0];
  primePiCache.set(n, res);
  return res;
}
function li(x) {
  // Logarithmic integral li(x), Ramanujan series
  if (x < 2) return 0;
  const g = 0.5772156649015329, L = Math.log(x);
  let sum = 0, term = 1, inner = 0;
  for (let n = 1; n < 400; n++) {
    term *= L / n / (n > 1 ? 2 : 1);           // L^n / (n! 2^(n-1))
    if (((n - 1) & 1) === 0) inner += 1 / n;   // Σ_{k<=(n-1)/2} 1/(2k+1)
    const add = (n % 2 ? 1 : -1) * term * inner;
    sum += add;
    if (Math.abs(add) < 1e-16 * Math.abs(sum)) break;
  }
  return g + Math.log(L) + Math.sqrt(x) * sum;
}

/* π(10^k), known exact values (OEIS A006880) */
const PI_POW10 = [0n, 4n, 25n, 168n, 1229n, 9592n, 78498n, 664579n, 5761455n, 50847534n, 455052511n, 4118054813n,
  37607912018n, 346065536839n, 3204941750802n, 29844570422669n, 279238341033925n, 2623557157654233n, 24739954287740860n];
/* exact π(n) when possible: Lucy up to 1e11, table for powers of ten up to 1e18; otherwise null */
function primePi(n) {
  n = toBigInt(n, 'primepi');
  if (n < 2n) return 0n;
  if (n <= BigInt(PRIMEPI_LIMIT)) return BigInt(primePiExact(Number(n)));
  const s = n.toString();
  if (/^10*$/.test(s) && s.length - 1 < PI_POW10.length) return PI_POW10[s.length - 1];
  return null;
}
/* Dusart (2010): for x >= 599, x/ln x·(1 + 1/ln x) <= π(x) <= x/ln x·(1 + 1.2762/ln x) */
function primePiBounds(x) {
  const L = Math.log(x);
  return { lo: x / L * (1 + 1 / L), hi: x / L * (1 + 1.2762 / L), valid: x >= 599 };
}
function nextPrime(n) {
  n = toBigInt(n, 'nextprime');
  let v = n < 2n ? 2n : n + 1n;
  while (!isPrime(v)) v++;
  return v;
}
function prevPrime(n) {
  n = toBigInt(n, 'prevprime');
  let v = n - 1n;
  while (v >= 2n && !isPrime(v)) v--;
  if (v < 2n) throw new CalcError('err.noPrime', { n: String(n) });
  return v;
}
/* n-th prime, exact for n <= 1e6 (sieve); p_1 = 2 */
const NTHPRIME_LIMIT = 1000000;
function nthPrime(k) {
  k = Number(toBigInt(k, 'nthprime'));
  if (k < 1) throw new CalcError('err.needPositive', { fn: 'nthprime' });
  if (k > NTHPRIME_LIMIT) throw new CalcError('err.tooBig', { fn: 'nthprime', max: '1e6' });
  const lim = k < 6 ? 15 : Math.ceil(k * (Math.log(k) + Math.log(Math.log(k)))) + 10;
  const s = new Uint8Array(lim + 1);
  let cnt = 0;
  for (let i = 2; i <= lim; i++) {
    if (s[i]) continue;
    if (++cnt === k) return BigInt(i);
    for (let j = i * i; j <= lim; j += i) s[j] = 1;
  }
  throw new CalcError('err.generic', { msg: 'sieve bound' });
}
/* Rosser–Schoenfeld / Dusart: n(ln n + ln ln n − 1) < p_n < n(ln n + ln ln n) for n >= 6 */
function nthPrimeBounds(n) {
  const L = Math.log(n), LL = Math.log(L);
  return { lo: n * (L + LL - 1), hi: n * (L + LL), approx: n * (L + LL - 1 + (LL - 2) / L) };
}

/* Σ_{i=1..n} floor(n/i) exact (n <= 1e14), and number of distinct values of floor(n/i) */
const SUMFLOOR_LIMIT = 1e14;
function sumFloor(n) {
  n = toNum(n);
  if (!(n >= 0) || !Number.isInteger(n)) throw new CalcError('err.needInt', { fn: 'sumfloor' });
  if (n > SUMFLOOR_LIMIT) throw new CalcError('err.tooBig', { fn: 'sumfloor', max: '1e14' });
  const s = Math.floor(Math.sqrt(n));
  let acc = 0;
  for (let i = 1; i <= s; i++) acc += Math.floor(n / i);
  return BigInt(acc) * 2n - BigInt(s) * BigInt(s);
}
function isqrt(n) {
  n = toBigInt(n, 'isqrt');
  if (n < 0n) throw new CalcError('err.needPositive', { fn: 'isqrt' });
  if (n < 2n) return n;
  let x = BigInt(Math.floor(Math.sqrt(Number(n))));
  while (x * x > n) x--;
  while ((x + 1n) * (x + 1n) <= n) x++;
  return x;
}
function distinctFloor(n) {
  n = toBigInt(n, 'distinctfloor');
  if (n < 1n) return 0n;
  const s = isqrt(n);
  return 2n * s - (n / s === s ? 1n : 0n);
}
/* Σ_{i<=n} σ(i) = Σ i*floor(n/i), exact for n <= 1e12 */
const SUMSIGMA_LIMIT = 1e12;
function sumSigma(n) {
  n = toNum(n);
  if (n > SUMSIGMA_LIMIT) throw new CalcError('err.tooBig', { fn: 'sumsigma', max: '1e12' });
  let res = 0n;
  for (let l = 1; l <= n;) {
    const q = Math.floor(n / l), r = Math.floor(n / q);
    const cnt = BigInt(r - l + 1), sumLR = (BigInt(l) + BigInt(r)) * cnt / 2n;
    res += BigInt(q) * sumLR;
    l = r + 1;
  }
  return res;
}
function harmonic(n) {
  n = toNum(n);
  if (n < 1) return 0;
  if (n <= 1e6) { let s = 0; for (let i = n; i >= 1; i--) s += 1 / i; return s; }
  const g = 0.5772156649015329;
  return Math.log(n) + g + 1 / (2 * n) - 1 / (12 * n * n);
}
/* Σ_{p<=n, p prime} 1/p */
const SUMINVP_EXACT = 2e7;
function sumInvPrimes(n) {
  n = Math.floor(toNum(n));
  if (n <= SUMINVP_EXACT) {
    const s = new Uint8Array(n + 1); let acc = 0;
    for (let i = 2; i <= n; i++) {
      if (!s[i]) { acc += 1 / i; if (i * i <= n) for (let j = i * i; j <= n; j += i) s[j] = 1; }
    }
    return { value: acc, exact: true };
  }
  return { value: Math.log(Math.log(n)) + 0.2614972128476428, exact: false };
}

/* ---------------- Combinatorics ---------------- */
const FACT_EXACT = 20000;
function lgammaApprox(x) {
  // ln Γ(x) via Lanczos for x > 0
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61503916999185, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgammaApprox(1 - x);
  x -= 1;
  let a = c[0]; const t = x + g + 0.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
function factorial(n) {
  if (!isBig(n) && !Number.isInteger(n)) return Math.exp(lgammaApprox(n + 1));
  n = toBigInt(n, 'fact');
  if (n < 0n) throw new CalcError('err.needPositive', { fn: '!' });
  if (n > BigInt(FACT_EXACT)) return { approxLog10: lgammaApprox(Number(n) + 1) / Math.LN10 };
  let r = 1n;
  for (let i = 2n; i <= n; i++) r *= i;
  return r;
}
function binom(n, k) {
  n = toBigInt(n, 'C'); k = toBigInt(k, 'C');
  if (k < 0n || k > n || n < 0n) return 0n;
  if (k > n - k) k = n - k;
  if (k > 300000n) {
    return { approxLog10: (lgammaApprox(Number(n) + 1) - lgammaApprox(Number(k) + 1) - lgammaApprox(Number(n - k) + 1)) / Math.LN10 };
  }
  let r = 1n;
  for (let i = 1n; i <= k; i++) r = r * (n - k + i) / i;
  return r;
}
function perm(n, k) {
  n = toBigInt(n, 'P'); k = toBigInt(k, 'P');
  if (k < 0n || k > n) return 0n;
  if (k > 300000n) return { approxLog10: (lgammaApprox(Number(n) + 1) - lgammaApprox(Number(n - k) + 1)) / Math.LN10 };
  let r = 1n;
  for (let i = 0n; i < k; i++) r *= n - i;
  return r;
}
function catalan(n) {
  n = toBigInt(n, 'catalan');
  const c = binom(2n * n, n);
  if (!isBig(c)) return { approxLog10: c.approxLog10 - Math.log10(Number(n) + 1) };
  return c / (n + 1n);
}
function partitions(n) {
  n = Number(toBigInt(n, 'partitions'));
  if (n < 0) return 0n;
  if (n > 20000) throw new CalcError('err.tooBig', { fn: 'partitions', max: '20000' });
  const p = [1n];
  for (let i = 1; i <= n; i++) {
    let s = 0n;
    for (let k = 1; ; k++) {
      const g1 = k * (3 * k - 1) / 2, g2 = k * (3 * k + 1) / 2;
      if (g1 > i) break;
      const sign = (k & 1) ? 1n : -1n;
      s += sign * p[i - g1];
      if (g2 <= i) s += sign * p[i - g2];
    }
    p.push(s);
  }
  return p[n];
}
function bell(n) {
  n = Number(toBigInt(n, 'bell'));
  if (n > 3000) throw new CalcError('err.tooBig', { fn: 'bell', max: '3000' });
  let row = [1n];
  for (let i = 1; i <= n; i++) {
    const nr = [row[row.length - 1]];
    for (let j = 0; j < row.length; j++) nr.push(nr[j] + row[j]);
    row = nr;
  }
  return row[0];
}
function stirling2(n, k) {
  n = Number(toBigInt(n, 'S2')); k = Number(toBigInt(k, 'S2'));
  if (n > 3000) throw new CalcError('err.tooBig', { fn: 'S2', max: '3000' });
  if (k > n || k < 0) return 0n;
  let row = new Array(k + 1).fill(0n); row[0] = 1n;
  for (let i = 1; i <= n; i++) {
    for (let j = Math.min(i, k); j >= 1; j--) row[j] = BigInt(j) * row[j] + row[j - 1];
    row[0] = 0n;
  }
  return row[k];
}
function stirling1(n, k) {
  n = Number(toBigInt(n, 'S1')); k = Number(toBigInt(k, 'S1'));
  if (n > 3000) throw new CalcError('err.tooBig', { fn: 'S1', max: '3000' });
  if (k > n || k < 0) return 0n;
  let row = new Array(k + 1).fill(0n); row[0] = 1n;
  for (let i = 1; i <= n; i++) {
    for (let j = Math.min(i, k); j >= 1; j--) row[j] = BigInt(i - 1) * row[j] + row[j - 1];
    row[0] = 0n;
  }
  return row[k];
}
function fib(n) {
  n = toBigInt(n, 'fib');
  if (n > 2000000n) throw new CalcError('err.tooBig', { fn: 'fib', max: '2e6' });
  // fast doubling
  function fd(k) {
    if (k === 0n) return [0n, 1n];
    const [a, b] = fd(k >> 1n);
    const c = a * (2n * b - a), d = a * a + b * b;
    return (k & 1n) ? [d, c + d] : [c, d];
  }
  return fd(n)[0];
}

/* Inverse Ackermann α(n) = min k with A(k, k) >= n, where A(0,0)=1, A(1,1)=3, A(2,2)=7, A(3,3)=61
   and A(4,4) = 2^2^2^65536 − 3 (larger than anything that fits in this universe), so α(n) <= 4 in practice. */
function ackermannInverse(n) {
  if (isBig(n) ? false : !Number.isFinite(n)) return 4n;
  const v = isBig(n) ? n : BigInt(Math.ceil(n));
  if (v <= 1n) return 0n;
  if (v <= 3n) return 1n;
  if (v <= 7n) return 2n;
  if (v <= 61n) return 3n;
  return 4n;
}

/* ---------------- Evaluation ---------------- */
// Approximate huge results are returned as {approxLog10}; arithmetic on them converts to Number.
const unwrap = (v) => {
  if (v && typeof v === 'object' && 'display' in v) throw new CalcError('err.notNumber', { what: v.copy });
  return v && typeof v === 'object' && 'approxLog10' in v ? Math.pow(10, v.approxLog10) : v;
};
const SUPS = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
/* factorization as text: pretty (2⁶ · 3³ · 7) and plain (2^6 * 3^3 * 7) */
function factorText(f) {
  if (!f.length) return { pretty: '1', plain: '1' };
  return {
    pretty: f.map(([p, e]) => p.toString() + (e > 1 ? String(e).split('').map((d) => SUPS[d]).join('') : '')).join(' · '),
    plain: f.map(([p, e]) => p.toString() + (e > 1 ? '^' + e : '')).join(' * '),
  };
}
/* all divisors in increasing order (caller limits the count) */
function divisors(f) {
  let ds = [1n];
  for (const [p, e] of f) {
    const next = [];
    for (const d of ds) { let m = d; for (let k = 0; k <= e; k++) { next.push(m); m *= p; } }
    ds = next;
  }
  return ds.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

const CONSTS = { pi: Math.PI, PI: Math.PI, e: Math.E, E: Math.E, inf: Infinity, INF: Infinity };

function argNum(args, i) { return toNum(unwrap(args[i])); }
function needArgs(name, args, min, max = min) {
  if (args.length < min || args.length > max) throw new CalcError('err.arity', { fn: name, n: min === max ? min : `${min}-${max}` });
}

const FUNCS = {
  log: (a) => { needArgs('log', a, 1, 2); return a.length === 2 ? log2Any(unwrap(a[0])) / Math.log2(argNum(a, 1)) : log2Any(unwrap(a[0])); },
  log2: (a) => { needArgs('log2', a, 1); return log2Any(unwrap(a[0])); },
  lg: (a) => { needArgs('lg', a, 1); return log2Any(unwrap(a[0])); },
  ln: (a) => { needArgs('ln', a, 1); return log2Any(unwrap(a[0])) * Math.LN2; },
  log10: (a) => { needArgs('log10', a, 1); return log2Any(unwrap(a[0])) * Math.LN2 / Math.LN10; },
  sqrt: (a) => {
    needArgs('sqrt', a, 1); const v = unwrap(a[0]);
    if (isBig(v) && v >= 0n) { const r = isqrt(v); if (r * r === v) return r; if (bitLen(v) > 1000) return Math.pow(2, log2Any(v) / 2); }
    return Math.sqrt(toNum(v));
  },
  isqrt: (a) => { needArgs('isqrt', a, 1); return isqrt(unwrap(a[0])); },
  cbrt: (a) => { needArgs('cbrt', a, 1); return Math.cbrt(argNum(a, 0)); },
  exp: (a) => { needArgs('exp', a, 1); return Math.exp(argNum(a, 0)); },
  pow: (a) => { needArgs('pow', a, 2); return A.pow(unwrap(a[0]), unwrap(a[1])); },
  floor: (a) => { needArgs('floor', a, 1); const v = unwrap(a[0]); return isBig(v) ? v : numToInt(Math.floor(v)); },
  ceil: (a) => { needArgs('ceil', a, 1); const v = unwrap(a[0]); return isBig(v) ? v : numToInt(Math.ceil(v)); },
  round: (a) => { needArgs('round', a, 1); const v = unwrap(a[0]); return isBig(v) ? v : numToInt(Math.round(v)); },
  abs: (a) => { needArgs('abs', a, 1); const v = unwrap(a[0]); return isBig(v) ? absBig(v) : Math.abs(v); },
  min: (a) => { if (!a.length) needArgs('min', a, 1); return a.map(unwrap).reduce((x, y) => (toNum(A.sub(x, y)) <= 0 ? x : y)); },
  max: (a) => { if (!a.length) needArgs('max', a, 1); return a.map(unwrap).reduce((x, y) => (toNum(A.sub(x, y)) >= 0 ? x : y)); },
  gcd: (a) => { if (!a.length) needArgs('gcd', a, 1); return a.map((v) => toBigInt(unwrap(v), 'gcd')).reduce(gcdBig); },
  lcm: (a) => { if (!a.length) needArgs('lcm', a, 1); return a.map((v) => toBigInt(unwrap(v), 'lcm')).reduce((x, y) => (x === 0n || y === 0n ? 0n : absBig(x / gcdBig(x, y) * y))); },
  fact: (a) => { needArgs('fact', a, 1); return factorial(unwrap(a[0])); },
  C: (a) => { needArgs('C', a, 2); return binom(unwrap(a[0]), unwrap(a[1])); },
  P: (a) => { needArgs('P', a, 2); return perm(unwrap(a[0]), unwrap(a[1])); },
  catalan: (a) => { needArgs('catalan', a, 1); return catalan(unwrap(a[0])); },
  partitions: (a) => { needArgs('partitions', a, 1); return partitions(unwrap(a[0])); },
  bell: (a) => { needArgs('bell', a, 1); return bell(unwrap(a[0])); },
  S2: (a) => { needArgs('S2', a, 2); return stirling2(unwrap(a[0]), unwrap(a[1])); },
  S1: (a) => { needArgs('S1', a, 2); return stirling1(unwrap(a[0]), unwrap(a[1])); },
  fib: (a) => { needArgs('fib', a, 1); return fib(unwrap(a[0])); },
  d: (a) => { needArgs('d', a, 1); return numDivisors(unwrap(a[0])); },
  sigma: (a) => { needArgs('sigma', a, 1); return sumDivisors(unwrap(a[0])); },
  phi: (a) => { needArgs('phi', a, 1); return phi(unwrap(a[0])); },
  factor: (a) => { needArgs('factor', a, 1); const ft = factorText(factorize(unwrap(a[0]))); return { display: ft.pretty, copy: ft.plain }; },
  omega: (a) => { needArgs('omega', a, 1); return BigInt(factorize(unwrap(a[0])).length); },
  bigomega: (a) => { needArgs('bigomega', a, 1); return BigInt(factorize(unwrap(a[0])).reduce((s, [, e]) => s + e, 0)); },
  spf: (a) => { needArgs('spf', a, 1); const f = factorize(unwrap(a[0])); if (!f.length) throw new CalcError('err.needPositive', { fn: 'spf (n > 1)' }); return f[0][0]; },
  lpf: (a) => { needArgs('lpf', a, 1); const f = factorize(unwrap(a[0])); if (!f.length) throw new CalcError('err.needPositive', { fn: 'lpf (n > 1)' }); return f[f.length - 1][0]; },
  totient: (a) => { needArgs('totient', a, 1); return phi(unwrap(a[0])); },
  ackinv: (a) => { needArgs('ackinv', a, 1); return ackermannInverse(unwrap(a[0])); },
  alpha: (a) => { needArgs('alpha', a, 1); return ackermannInverse(unwrap(a[0])); },
  isprime: (a) => { needArgs('isprime', a, 1); return isPrime(unwrap(a[0])) ? 1n : 0n; },
  primepi: (a) => {
    needArgs('primepi', a, 1);
    const r = primePi(unwrap(a[0]));
    if (r === null) throw new CalcError('err.tooBig', { fn: 'primepi', max: '1e11 (10^k ≤ 1e18)' });
    return r;
  },
  nextprime: (a) => { needArgs('nextprime', a, 1); return nextPrime(unwrap(a[0])); },
  prevprime: (a) => { needArgs('prevprime', a, 1); return prevPrime(unwrap(a[0])); },
  nthprime: (a) => { needArgs('nthprime', a, 1); return nthPrime(unwrap(a[0])); },
  maxomega: (a) => { needArgs('maxomega', a, 1); return BigInt(maxDistinctPrimes(unwrap(a[0])).count); },
  maxdiv: (a) => { needArgs('maxdiv', a, 1); return maxDivisors(unwrap(a[0])).count; },
  H: (a) => { needArgs('H', a, 1); return harmonic(argNum(a, 0)); },
  sumfloor: (a) => { needArgs('sumfloor', a, 1); return sumFloor(unwrap(a[0])); },
  sumsigma: (a) => { needArgs('sumsigma', a, 1); return sumSigma(unwrap(a[0])); },
};

function numToInt(x) {
  if (Number.isFinite(x) && Math.abs(x) < 1e300) return BigInt(x);
  return x;
}

function evaluate(ast, env, hook) {
  env = env || {};
  const ev = (n) => {
    let r;
    switch (n.t) {
      case 'num': r = n.v; break;
      case 'var':
        if (Object.prototype.hasOwnProperty.call(env, n.name)) r = env[n.name];
        else if (n.name in CONSTS) r = CONSTS[n.name];
        else throw new CalcError('err.unknownVar', { name: n.name });
        break;
      case 'neg': r = A.neg(unwrap(ev(n.a))); break;
      case 'fact': r = factorial(unwrap(ev(n.a))); break;
      case 'index': {
        const arr = Object.prototype.hasOwnProperty.call(env, n.name) ? env[n.name] : undefined;
        if (arr === undefined) throw new CalcError('err.unknownVar', { name: n.name });
        r = arr;
        for (const ie of n.idx) {
          if (!r || typeof r.at !== 'function') throw new CalcError('err.notArray', { name: n.name });
          r = r.at(Number(toBigInt(unwrap(ev(ie)), n.name + '[]')));
        }
        break;
      }
      case 'call': {
        // functions supplied by the caller (e.g. range functions on arrays) take priority
        if (env.__funcs && env.__funcs[n.name]) { r = env.__funcs[n.name](n.args.map(ev), n.args); break; }
        const f = FUNCS[n.name];
        if (!f) throw new CalcError('err.unknownFn', { name: n.name });
        r = f(n.args.map(ev)); break;
      }
      case 'bin': {
        const a = unwrap(ev(n.a)), b = unwrap(ev(n.b));
        switch (n.op) {
          case '+': r = A.add(a, b); break;
          case '-': r = A.sub(a, b); break;
          case '*': r = A.mul(a, b); break;
          case '/': r = A.div(a, b); break;
          case '//': r = A.idiv(a, b); break;
          case '%': r = A.mod(a, b); break;
          case '^': r = A.pow(a, b); break;
        }
        break;
      }
    }
    if (hook) hook(n, r);
    return r;
  };
  return ev(ast);
}

/* Fast float-only compile for hot loops (sums, integrals, searches). */
function compileFloat(ast, varNames) {
  const fns = {
    log: (x, b) => (b === undefined ? Math.log2(x) : Math.log2(x) / Math.log2(b)), log2: Math.log2, lg: Math.log2,
    ln: Math.log, log10: Math.log10, sqrt: Math.sqrt, cbrt: Math.cbrt, exp: Math.exp, pow: Math.pow,
    floor: Math.floor, ceil: Math.ceil, round: Math.round, abs: Math.abs, min: Math.min, max: Math.max,
    isqrt: (x) => Math.floor(Math.sqrt(x)), H: harmonic, ackinv: (x) => Number(ackermannInverse(x)), alpha: (x) => Number(ackermannInverse(x)),
  };
  const gen = (n) => {
    switch (n.t) {
      case 'num': return '(' + String(toNum(n.v)) + ')';
      case 'var':
        if (varNames.includes(n.name)) return 'v_' + n.name;
        if (n.name in CONSTS) return '(' + CONSTS[n.name] + ')';
        throw new CalcError('err.unknownVar', { name: n.name });
      case 'neg': return '(-' + gen(n.a) + ')';
      case 'fact': return 'F.fact(' + gen(n.a) + ')';
      case 'call':
        if (!fns[n.name]) return null;
        return 'F.' + n.name + '(' + n.args.map(gen).join(',') + ')';
      case 'bin': {
        const a = gen(n.a), b = gen(n.b);
        if (a === null || b === null) return null;
        switch (n.op) {
          case '^': return 'Math.pow(' + a + ',' + b + ')';
          case '//': return 'Math.floor(' + a + '/' + b + ')';
          case '%': return '((' + a + ')-(' + b + ')*Math.floor((' + a + ')/(' + b + ')))';
          default: return '(' + a + n.op + b + ')';
        }
      }
    }
    return null;
  };
  let code;
  try { code = gen(ast); } catch (e) { throw e; }
  if (code === null || code.includes('null')) {
    // fallback: generic evaluation
    return (...vals) => {
      const env = {}; varNames.forEach((v, i) => (env[v] = vals[i]));
      return toNum(unwrap(evaluate(ast, env)));
    };
  }
  fns.fact = (x) => Math.exp(lgammaApprox(x + 1));
  // eslint-disable-next-line no-new-func
  const f = new Function('F', ...varNames.map((v) => 'v_' + v), 'return ' + code + ';');
  return (...vals) => f(fns, ...vals);
}

/* ---------------- Formatting ---------------- */
function sciFromBig(b, digits = 3) {
  const neg = b < 0n; const s = absBig(b).toString();
  if (s.length <= 1) return (neg ? '-' : '') + s;
  const mant = s[0] + '.' + s.slice(1, 1 + digits);
  const lossy = /[1-9]/.test(s.slice(1 + digits));
  return (lossy ? '≈ ' : '') + (neg ? '-' : '') + mant.replace(/\.?0+$/, '') + 'e' + (s.length - 1);
}
function sciNum(x, digits = 3) {
  if (!Number.isFinite(x)) return Number.isNaN(x) ? 'NaN' : (x > 0 ? '∞' : '-∞');
  if (x === 0) return '0';
  const s = x.toExponential(digits);
  return s.replace(/\.?0+e/, 'e').replace('e+', 'e');
}
function plainNum(x) {
  if (!Number.isFinite(x)) return sciNum(x);
  if (Number.isInteger(x) && Math.abs(x) < 1e21) return String(x);
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-6 || a >= 1e15)) return sciNum(x, 6);
  return String(parseFloat(x.toPrecision(12)));
}
/* Returns { main, sub, exact } for display */
function formatValue(v) {
  if (v && typeof v === 'object' && 'display' in v) return { main: v.display, sub: '', exact: true, copy: v.copy };
  if (v && typeof v === 'object' && 'approxLog10' in v) {
    const e = Math.floor(v.approxLog10), m = Math.pow(10, v.approxLog10 - e);
    return { main: '≈ ' + m.toFixed(3) + 'e' + e, sub: '', exact: false, copy: m.toFixed(6) + 'e' + e };
  }
  if (isBig(v)) {
    const s = v.toString();
    const digits = s.replace('-', '').length;
    if (digits <= 60) return { main: s, sub: digits > 6 ? sciFromBig(v) : '', exact: true, copy: s, digits };
    return { main: s.slice(0, 24) + '…' + s.slice(-12), sub: sciFromBig(v, 5) + ' · ' + digits + ' digits', exact: true, copy: s, digits };
  }
  return { main: plainNum(v), sub: Math.abs(v) >= 1e6 && Number.isFinite(v) && Math.abs(v) < 1e15 ? sciNum(v) : '', exact: false, copy: plainNum(v) };
}
function fmtCount(v) {
  // short human form for operation counts
  if (isBig(v)) return absBig(v) < 1000000n ? v.toString() : sciFromBig(v, 2);
  if (!Number.isFinite(v)) return sciNum(v);
  return Math.abs(v) < 1e6 ? plainNum(Math.round(v * 100) / 100) : sciNum(v, 2);
}
function fmtTime(sec) {
  if (!Number.isFinite(sec)) return '∞';
  if (sec < 1e-3) return (sec * 1e6).toFixed(sec < 1e-5 ? 2 : 0) + ' µs';
  if (sec < 1) return (sec * 1000).toFixed(sec < 0.01 ? 2 : 0) + ' ms';
  if (sec < 120) return sec.toFixed(2) + ' s';
  if (sec < 7200) return (sec / 60).toFixed(1) + ' min';
  if (sec < 172800) return (sec / 3600).toFixed(1) + ' h';
  if (sec < 3.15e9) return (sec / 86400).toFixed(1) + ' d';
  return sciNum(sec / 3.15e7, 2) + ' y';
}
function fmtBytes(b) {
  b = toNum(b);
  if (!Number.isFinite(b)) return '∞';
  if (b < 1024) return b.toFixed(0) + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB';
  return (b / 1073741824).toFixed(2) + ' GB';
}

global.CP = {
  CalcError, isBig, toNum, unwrap, toBigInt, bitLen, log2Any,
  tokenize, parse, parseLine, parseVars, evaluate, compileFloat, A,
  isPrime, factorize, factorText, divisors, numDivisors, sumDivisors, phi, maxDivisors, maxDistinctPrimes,
  primePiExact, PRIMEPI_LIMIT, primePi, primePiBounds, PI_POW10, nextPrime, prevPrime, nthPrime, nthPrimeBounds, NTHPRIME_LIMIT, li, sumFloor, SUMFLOOR_LIMIT, distinctFloor, isqrt, sumSigma, SUMSIGMA_LIMIT,
  harmonic, ackermannInverse, sumInvPrimes, factorial, binom, perm, catalan, partitions, bell, stirling1, stirling2, fib, lgammaApprox,
  sciFromBig, sciNum, plainNum, formatValue, fmtCount, fmtTime, fmtBytes, FUNCS,
};
})(typeof window !== 'undefined' ? window : globalThis);
