/* Phần 2: An toàn — tràn số, giới hạn kiểu, phép mod, bộ nhớ */
(function () {
'use strict';
const { $, $$, esc, kv, out, errBox, chip, numField, evalField, wire } = UI;
const { isBig } = CP;

I18N.add({
  vi: {
    'sf.nav.overflow': 'Tràn số', 'sf.nav.limits': 'Giới hạn kiểu', 'sf.nav.mod': 'Phép mod', 'sf.nav.memory': 'Bộ nhớ',
    'of.title': 'Kiểm tra tràn số', 'of.desc': 'Tính chính xác từng bước của biểu thức theo kiểu C++ (chia nguyên cắt phần thập phân, % giữ dấu số bị chia) và chỉ ra bước đầu tiên bị tràn với từng kiểu.',
    'of.expr': 'Biểu thức', 'of.hint': 'Trong C++ kiểu của phép tính phụ thuộc vào toán hạng: <code>int * int</code> vẫn tràn dù gán vào <code>long long</code>. Hãy ép kiểu sớm, vd <code>1LL * a * b</code>.',
    'of.colStep': 'Bước', 'of.colVal': 'Giá trị', 'of.fits': 'Vừa', 'of.overflow': 'Tràn ở bước {k}', 'of.nonInt': 'Bước "{s}" không ra số nguyên. Kiểm tra tràn chỉ áp dụng cho phép tính số nguyên.',
    'of.huge': 'cực lớn (> 2^4096)', 'of.dbl': 'double chính xác', 'of.final': 'Kết quả cuối', 'of.negExp': 'Số mũ âm không dùng được trong phép tính nguyên',
    'of.sugInt': 'int đủ dùng.', 'of.sugLL': 'Dùng long long. Nhớ ép kiểu trước khi nhân, vd 1LL * a * b.', 'of.sug128': 'Vượt long long. Dùng __int128, hoặc lấy mod / chia nhỏ phép tính.',
    'of.sugBig': 'Vượt cả __int128. Cần số nguyên lớn hoặc đổi cách tính.', 'of.tip': 'Gợi ý',
    'lim.title': 'Giới hạn các kiểu dữ liệu', 'lim.desc': 'Giá trị nhỏ nhất, lớn nhất của các kiểu số nguyên trong C++ (GCC/Clang). Bấm vào số để chép.',
    'lim.colType': 'Kiểu', 'lim.colBytes': 'Byte', 'lim.colMin': 'Nhỏ nhất', 'lim.colMax': 'Lớn nhất', 'lim.colApprox': 'Xấp xỉ',
    'lim.long': 'long: 4 byte trên Windows, 8 byte trên Linux. Đừng dùng long cho số lớn.',
    'lim.float': 'Số thực', 'lim.colMant': 'Bit định trị', 'lim.colDigits': 'Chữ số chính xác', 'lim.colExact': 'Số nguyên chính xác đến', 'lim.colEps': 'Epsilon',
    'lim.floatNote': 'long double: GCC/MinGW dùng 80 bit (18–19 chữ số); MSVC thì long double chỉ bằng double. So sánh số thực nên dùng sai số, vd |a − b| < 1e-9.',
    'lim.ldGcc': 'long double (GCC/MinGW)', 'lim.ldMsvc': 'long double (MSVC)',
    'md.title': 'Phép mod', 'md.desc': 'Kiểm tra phép nhân, cộng dồn trước khi lấy mod có bị tràn không.', 'md.k': 'Số tích cộng dồn trước khi mod',
    'md.prime': 'MOD là số nguyên tố?', 'md.primeYes': 'Có, nghịch đảo bằng a^(MOD−2)', 'md.primeNo': 'Không, nghịch đảo cần Euclid mở rộng và gcd(a, MOD) = 1',
    'md.sq': '(MOD − 1)²', 'md.sumK': 'K · (MOD − 1)²', 'md.add': '(MOD − 1) + (MOD − 1) trong int', 'md.maxK': 'Số tích tối đa cộng dồn được trong long long',
    'md.maxKU': 'trong unsigned long long', 'md.fitsLL': 'Vừa long long', 'md.needs128': 'Tràn long long, dùng __int128 hoặc mulmod',
    'md.m1': 'MOD − 1 =', 'md.ntt': 'Hỗ trợ NTT độ dài tối đa 2^{k}',
    'mem.title': 'Ước lượng bộ nhớ', 'mem.desc': 'Liệt kê các mảng, cấu trúc của bài rồi so tổng với memory limit. Số lượng là biểu thức theo các biến.',
    'mem.ml': 'Memory limit (MB)', 'mem.add': '+ Thêm dòng', 'mem.presets': 'Thêm mẫu:', 'mem.presetPick': '— chọn —',
    'mem.colName': 'Tên', 'mem.colType': 'Kiểu', 'mem.colKind': 'Dạng chứa', 'mem.colCount': 'Số phần tử', 'mem.colBytes': 'Bộ nhớ',
    'mem.total': 'Tổng', 'mem.ofML': '{p}% memory limit', 'mem.kind.array': 'mảng / vector', 'mem.kind.set': 'set / map (mỗi node)',
    'mem.kind.uset': 'unordered_set / map', 'mem.kind.bitset': 'bitset (bit)', 'mem.note': 'set/map tốn khoảng 48–64 byte mỗi phần tử, unordered khoảng 40. vector khi push_back có thể chiếm gấp đôi lúc cấp phát lại.',
    'mem.v.ok': 'Vừa', 'mem.v.warn': 'Sát ML', 'mem.v.bad': 'MLE',
    'mp.seg': 'Segment tree 4n (long long)', 'mp.lazy': 'Segment tree lazy 4n × 2 (long long)', 'mp.bit': 'Fenwick n + 1 (long long)',
    'mp.sparse': 'Sparse table n·(log n + 1) (int)', 'mp.adj': 'Danh sách kề vector<vector<int>> (n đỉnh, m cạnh vô hướng)',
    'mp.dp': 'Bảng DP n × m (int)', 'mp.bitset': 'bitset n', 'mp.map': 'map<int,int> n phần tử',
  },
  en: {
    'sf.nav.overflow': 'Overflow', 'sf.nav.limits': 'Type limits', 'sf.nav.mod': 'Modular arithmetic', 'sf.nav.memory': 'Memory',
    'of.title': 'Overflow check', 'of.desc': 'Evaluates every step exactly with C++ semantics (integer division truncates, % keeps the dividend sign) and shows the first step that overflows for each type.',
    'of.expr': 'Expression', 'of.hint': 'In C++ the type of an operation depends on its operands: <code>int * int</code> overflows even when assigned to <code>long long</code>. Cast early, e.g. <code>1LL * a * b</code>.',
    'of.colStep': 'Step', 'of.colVal': 'Value', 'of.fits': 'Fits', 'of.overflow': 'Overflows at step {k}', 'of.nonInt': 'Step "{s}" is not an integer. The overflow check only applies to integer arithmetic.',
    'of.huge': 'huge (> 2^4096)', 'of.dbl': 'double exact', 'of.final': 'Final result', 'of.negExp': 'Negative exponents are not valid in integer arithmetic',
    'of.sugInt': 'int is enough.', 'of.sugLL': 'Use long long. Cast before multiplying, e.g. 1LL * a * b.', 'of.sug128': 'Exceeds long long. Use __int128, or take the modulus / split the computation.',
    'of.sugBig': 'Exceeds even __int128. You need big integers or a different approach.', 'of.tip': 'Suggestion',
    'lim.title': 'Data type limits', 'lim.desc': 'Minimum and maximum of C++ integer types (GCC/Clang). Click a number to copy it.',
    'lim.colType': 'Type', 'lim.colBytes': 'Bytes', 'lim.colMin': 'Min', 'lim.colMax': 'Max', 'lim.colApprox': 'Approx.',
    'lim.long': 'long: 4 bytes on Windows, 8 bytes on Linux. Avoid long for big numbers.',
    'lim.float': 'Floating point', 'lim.colMant': 'Mantissa bits', 'lim.colDigits': 'Exact digits', 'lim.colExact': 'Exact integers up to', 'lim.colEps': 'Epsilon',
    'lim.floatNote': 'long double: GCC/MinGW use 80 bits (18–19 digits); with MSVC long double is just double. Compare floats with a tolerance, e.g. |a − b| < 1e-9.',
    'lim.ldGcc': 'long double (GCC/MinGW)', 'lim.ldMsvc': 'long double (MSVC)',
    'md.title': 'Modular arithmetic', 'md.desc': 'Checks whether products and running sums overflow before you take the modulus.', 'md.k': 'Products summed before taking mod',
    'md.prime': 'Is MOD prime?', 'md.primeYes': 'Yes, inverse is a^(MOD−2)', 'md.primeNo': 'No, inverse needs extended Euclid and gcd(a, MOD) = 1',
    'md.sq': '(MOD − 1)²', 'md.sumK': 'K · (MOD − 1)²', 'md.add': '(MOD − 1) + (MOD − 1) in int', 'md.maxK': 'Max products you can sum in long long',
    'md.maxKU': 'in unsigned long long', 'md.fitsLL': 'Fits long long', 'md.needs128': 'Overflows long long, use __int128 or mulmod',
    'md.m1': 'MOD − 1 =', 'md.ntt': 'Supports NTT up to length 2^{k}',
    'mem.title': 'Memory estimate', 'mem.desc': 'List the arrays and structures of your solution and compare the total with the memory limit. Counts are expressions in the variables.',
    'mem.ml': 'Memory limit (MB)', 'mem.add': '+ Add row', 'mem.presets': 'Add preset:', 'mem.presetPick': '— pick —',
    'mem.colName': 'Name', 'mem.colType': 'Type', 'mem.colKind': 'Container', 'mem.colCount': 'Elements', 'mem.colBytes': 'Memory',
    'mem.total': 'Total', 'mem.ofML': '{p}% of memory limit', 'mem.kind.array': 'array / vector', 'mem.kind.set': 'set / map (per node)',
    'mem.kind.uset': 'unordered_set / map', 'mem.kind.bitset': 'bitset (bits)', 'mem.note': 'set/map cost about 48–64 bytes per element, unordered about 40. A vector growing with push_back can briefly use twice its size while reallocating.',
    'mem.v.ok': 'Fits', 'mem.v.warn': 'Near ML', 'mem.v.bad': 'MLE',
    'mp.seg': 'Segment tree 4n (long long)', 'mp.lazy': 'Lazy segment tree 4n × 2 (long long)', 'mp.bit': 'Fenwick n + 1 (long long)',
    'mp.sparse': 'Sparse table n·(log n + 1) (int)', 'mp.adj': 'Adjacency list vector<vector<int>> (n vertices, m undirected edges)',
    'mp.dp': 'DP table n × m (int)', 'mp.bitset': 'bitset n', 'mp.map': 'map<int,int> with n entries',
  },
});

/* ============================================ Overflow */
const TYPES = [
  { id: 'int', name: 'int', min: -(2n ** 31n), max: 2n ** 31n - 1n },
  { id: 'uint', name: 'unsigned', min: 0n, max: 2n ** 32n - 1n },
  { id: 'll', name: 'long long', min: -(2n ** 63n), max: 2n ** 63n - 1n },
  { id: 'ull', name: 'unsigned long long', min: 0n, max: 2n ** 64n - 1n },
  { id: 'i128', name: '__int128', min: -(2n ** 127n), max: 2n ** 127n - 1n },
];
const HUGE = 1n << 4100n;
const DBL_EXACT = 2n ** 53n;

function compactBig(v) {
  const s = (v < 0n ? -v : v).toString();
  const m = s.match(/^(\d{1,3}?)(0{4,})$/);
  if (m) return (v < 0n ? '-' : '') + m[1] + 'e' + m[2].length;
  return v.toString();
}
const PREC = { '+': 10, '-': 10, '*': 20, '/': 20, '//': 20, '%': 20, '^': 40 };
function astStr(n) {
  switch (n.t) {
    case 'num': return { s: isBig(n.v) ? compactBig(n.v) : String(n.v), p: 100 };
    case 'var': return { s: n.name, p: 100 };
    case 'call': return { s: n.name + '(' + n.args.map((a) => astStr(a).s).join(', ') + ')', p: 100 };
    case 'fact': { const a = astStr(n.a); return { s: (a.p < 50 ? '(' + a.s + ')' : a.s) + '!', p: 50 }; }
    case 'neg': { const a = astStr(n.a); return { s: '-' + (a.p <= 30 ? '(' + a.s + ')' : a.s), p: 30 }; }
    case 'bin': {
      const P = PREC[n.op], a = astStr(n.a), b = astStr(n.b);
      const la = n.op === '^' ? a.p <= P : a.p < P;
      const rb = n.op === '^' ? b.p < P : (b.p < P || (b.p === P && '-///%'.includes(n.op)));
      return { s: (la ? '(' + a.s + ')' : a.s) + ' ' + n.op + ' ' + (rb ? '(' + b.s + ')' : b.s), p: P };
    }
  }
  return { s: '?', p: 100 };
}
function evalCpp(ast, env) {
  const steps = [];
  const ev = (n) => {
    let r, huge = false;
    switch (n.t) {
      case 'num':
        if (!isBig(n.v)) throw { key: 'of.nonInt', params: { s: String(n.v) } };
        return { v: n.v, huge: false };
      case 'var': {
        const v = Object.prototype.hasOwnProperty.call(env, n.name) ? env[n.name] : undefined;
        if (v === undefined) throw { key: 'err.unknownVar', params: { name: n.name } };
        if (!isBig(v)) throw { key: 'of.nonInt', params: { s: n.name } };
        return { v, huge: false };
      }
      case 'neg': { const a = ev(n.a); r = -a.v; huge = a.huge; break; }
      case 'fact': {
        const a = ev(n.a);
        if (a.v > 3000n) { r = HUGE; huge = true; } else { r = CP.factorial(a.v); }
        break;
      }
      case 'bin': {
        const a = ev(n.a), b = ev(n.b);
        huge = a.huge || b.huge;
        const x = a.v, y = b.v;
        switch (n.op) {
          case '+': r = x + y; break;
          case '-': r = x - y; break;
          case '*': r = x * y; if (CP.bitLen(r) > 4100) { r = (r < 0n ? -HUGE : HUGE); huge = true; } break;
          case '/': if (y === 0n) throw { key: 'err.divZero' }; r = x / y; break;
          case '//': r = CP.A.idiv(x, y); break;
          case '%': if (y === 0n) throw { key: 'err.divZero' }; r = x % y; break;
          case '^':
            if (y < 0n) throw { key: 'of.negExp' };
            if (x === 0n || x === 1n || x === -1n) r = CP.A.pow(x, y);
            else if (Number(y) * Math.log2(Number(x < 0n ? -x : x)) > 4096) { r = (x < 0n && (y & 1n) ? -HUGE : HUGE); huge = true; }
            else r = x ** y;
            break;
        }
        break;
      }
      case 'call': {
        const args = n.args.map(ev);
        huge = args.some((a) => a.huge);
        const f = CP.FUNCS[n.name];
        if (!f) throw { key: 'err.unknownFn', params: { name: n.name } };
        r = CP.unwrap(f(args.map((a) => a.v)));
        if (!isBig(r)) throw { key: 'of.nonInt', params: { s: astStr(n).s } };
        break;
      }
    }
    steps.push({ s: astStr(n).s, v: r, huge });
    return { v: r, huge };
  };
  const res = ev(ast);
  if (!steps.length) steps.push({ s: astStr(ast).s, v: res.v, huge: false });
  return steps;
}
function runOverflow() {
  const sum = $('#ofSummary'), tbl = $('#ofTable');
  let steps;
  try {
    const env = CP.parseVars($('#ofVars').value);
    steps = evalCpp(CP.parse($('#ofExpr').value), env);
  } catch (e) { sum.innerHTML = errBox(e); tbl.innerHTML = ''; return; }
  const first = {};
  TYPES.forEach((ty) => {
    const k = steps.findIndex((st) => st.huge || st.v < ty.min || st.v > ty.max);
    first[ty.id] = k;
  });
  const last = steps[steps.length - 1];
  const fmtV = (st) => (st.huge ? t('of.huge') : CP.formatValue(st.v).main);
  let rows = kv(t('of.final'), esc(fmtV(last)), last.huge ? '' : esc(CP.formatValue(last.v).sub || ''), { big: true, copy: last.huge ? '' : last.v.toString() });
  rows += TYPES.map((ty) => kv(esc(ty.name), first[ty.id] < 0 ? chip('ok', t('of.fits')) : chip('bad', t('of.overflow', { k: first[ty.id] + 1 })) + ` <span class="hint mono">${esc(steps[first[ty.id]].s)}</span>`)).join('');
  let sug;
  if (first.int < 0) sug = t('of.sugInt');
  else if (first.ll < 0) sug = t('of.sugLL');
  else if (first.i128 < 0) sug = t('of.sug128');
  else sug = t('of.sugBig');
  rows += kv(t('of.tip'), `<span style="font-family:var(--font);font-weight:500">${esc(sug)}</span>`);
  sum.innerHTML = out(rows);
  const cell = (ty, k, st) => {
    const bad = st.huge || st.v < ty.min || st.v > ty.max;
    if (!bad) return '<td style="color:var(--ok)">✓</td>';
    return k === first[ty.id] ? '<td><span class="chip bad">✗</span></td>' : '<td style="color:var(--bad)">✗</td>';
  };
  tbl.innerHTML = `<table class="tbl"><thead><tr><th>#</th><th>${t('of.colStep')}</th><th class="num">${t('of.colVal')}</th>${TYPES.map((ty) => `<th>${esc(ty.name)}</th>`).join('')}<th>${t('of.dbl')}</th></tr></thead><tbody>` +
    steps.map((st, k) => `<tr><td class="num">${k + 1}</td><td class="mono">${esc(st.s)}</td><td class="num">${esc(fmtV(st))}</td>${TYPES.map((ty) => cell(ty, k, st)).join('')}${
      !st.huge && st.v <= DBL_EXACT && st.v >= -DBL_EXACT ? '<td style="color:var(--ok)">✓</td>' : '<td style="color:var(--warn)">≈</td>'}</tr>`).join('') + '</tbody></table>';
}
wire(['ofExpr', 'ofVars'], runOverflow);

/* ============================================ Limits */
function renderLimits() {
  const I = [
    ['signed char', 1, -(2n ** 7n), 2n ** 7n - 1n], ['unsigned char', 1, 0n, 2n ** 8n - 1n],
    ['short', 2, -(2n ** 15n), 2n ** 15n - 1n], ['unsigned short', 2, 0n, 2n ** 16n - 1n],
    ['int', 4, -(2n ** 31n), 2n ** 31n - 1n], ['unsigned int', 4, 0n, 2n ** 32n - 1n],
    ['long (Windows)', 4, -(2n ** 31n), 2n ** 31n - 1n], ['long (Linux)', 8, -(2n ** 63n), 2n ** 63n - 1n],
    ['long long', 8, -(2n ** 63n), 2n ** 63n - 1n], ['unsigned long long', 8, 0n, 2n ** 64n - 1n],
    ['__int128', 16, -(2n ** 127n), 2n ** 127n - 1n], ['unsigned __int128', 16, 0n, 2n ** 128n - 1n],
  ];
  const c = (v) => `<span data-copy="${v}" style="cursor:copy">${v}</span>`;
  $('#limInt').innerHTML = `<table class="tbl"><thead><tr><th>${t('lim.colType')}</th><th class="num">${t('lim.colBytes')}</th><th class="num">${t('lim.colMin')}</th><th class="num">${t('lim.colMax')}</th><th class="num">${t('lim.colApprox')}</th></tr></thead><tbody>` +
    I.map(([n, b, mn, mx]) => `<tr${n.startsWith('long (') ? ' class="hl"' : ''}><td class="mono">${esc(n)}</td><td class="num">${b}</td><td class="num">${c(mn)}</td><td class="num">${c(mx)}</td><td class="num">${esc(CP.sciFromBig(mx, 2).replace('≈ ', ''))}</td></tr>`).join('') +
    `</tbody></table><div class="msg note">${esc(t('lim.long'))}</div>`;
  const F = [
    ['float', 4, 24, '6–7', '3.4e38', '2²⁴ = 16777216', '1.19e-7'],
    ['double', 8, 53, '15–16', '1.8e308', '2⁵³ ≈ 9.007e15', '2.22e-16'],
    [t('lim.ldGcc'), '10 (16)', 64, '18–19', '1.19e4932', '2⁶⁴ ≈ 1.8e19', '1.08e-19'],
    [t('lim.ldMsvc'), 8, 53, '15–16', '1.8e308', '2⁵³ ≈ 9.007e15', '2.22e-16'],
  ];
  $('#limFloat').innerHTML = `<table class="tbl"><thead><tr><th>${t('lim.colType')}</th><th class="num">${t('lim.colBytes')}</th><th class="num">${t('lim.colMant')}</th><th class="num">${t('lim.colDigits')}</th><th class="num">${t('lim.colMax')}</th><th class="num">${t('lim.colExact')}</th><th class="num">${t('lim.colEps')}</th></tr></thead><tbody>` +
    F.map((r) => `<tr><td class="mono">${esc(r[0])}</td>${r.slice(1).map((x) => `<td class="num">${esc(x)}</td>`).join('')}</tr>`).join('') + '</tbody></table>';
}
renderLimits(); I18N.onChange(renderLimits);

/* ============================================ Mod */
const LLMAX = 2n ** 63n - 1n, ULLMAX = 2n ** 64n - 1n, INTMAX = 2n ** 31n - 1n;
function runMod() {
  const o = $('#mdOutS');
  try {
    const M = CP.toBigInt(evalField($('#mdM').value), 'MOD');
    const K = CP.toBigInt(evalField($('#mdK').value), 'K');
    if (M < 2n) throw { key: 'err.needPositive', params: { fn: 'MOD' } };
    const prime = CP.isPrime(M);
    const sq = (M - 1n) * (M - 1n), sk = sq * (K < 1n ? 1n : K);
    const fitChip = (v) => (v <= LLMAX ? chip('ok', 'long long') : v <= ULLMAX ? chip('warn', 'unsigned long long') : v < 2n ** 127n ? chip('bad', '__int128') : chip('bad', '> __int128'));
    let rows = kv(t('md.prime'), prime ? chip('ok', t('md.primeYes')) : chip('neutral', t('md.primeNo')));
    rows += kv(t('md.sq'), esc(CP.formatValue(sq).main) + ' ' + fitChip(sq), esc(sq <= LLMAX ? t('md.fitsLL') : t('md.needs128')));
    if (K > 1n) rows += kv(t('md.sumK'), esc(CP.formatValue(sk).main) + ' ' + fitChip(sk));
    rows += kv(t('md.maxK'), esc((LLMAX / sq).toString()), esc(t('md.maxKU')) + ': ' + esc((ULLMAX / sq).toString()));
    const add = 2n * (M - 1n);
    rows += kv(t('md.add'), esc(add.toString()) + ' ' + (add <= INTMAX ? chip('ok', 'int') : chip('bad', 'int')));
    if (M - 1n <= 10n ** 30n) {
      const f = CP.factorize(M - 1n);
      const two = f.find(([p]) => p === 2n);
      const k = two ? two[1] : 0;
      rows += kv(t('md.m1'), esc(f.map(([p, e]) => p + (e > 1 ? '^' + e : '')).join(' · ')), prime && k >= 10 ? esc(t('md.ntt', { k })) : '');
    }
    o.innerHTML = out(rows);
  } catch (e) { o.innerHTML = errBox(e); }
}
wire(['mdM', 'mdK'], runMod);

/* ============================================ Memory */
const MTYPES = [
  ['bool', 1], ['char', 1], ['short', 2], ['int', 4], ['unsigned', 4], ['float', 4], ['long long', 8], ['double', 8],
  ['long double', 16], ['pair<int,int>', 8], ['pair<ll,ll>', 16], ['array<int,3>', 12], ['pointer', 8], ['vector<T> (header)', 24], ['string (header)', 32],
];
const MKINDS = ['array', 'set', 'uset', 'bitset'];
const memRows = [
  { name: 'a', type: 'int', kind: 'array', count: 'n' },
  { name: 'seg', type: 'long long', kind: 'array', count: '4 * n' },
  { name: 'adj', type: 'vector<T> (header)', kind: 'array', count: 'n' },
  { name: 'adj[]', type: 'int', kind: 'array', count: '2 * m' },
];
const PRESETS = [
  ['mp.seg', [{ name: 'seg', type: 'long long', kind: 'array', count: '4 * n' }]],
  ['mp.lazy', [{ name: 'seg', type: 'long long', kind: 'array', count: '4 * n' }, { name: 'lazy', type: 'long long', kind: 'array', count: '4 * n' }]],
  ['mp.bit', [{ name: 'bit', type: 'long long', kind: 'array', count: 'n + 1' }]],
  ['mp.sparse', [{ name: 'sp', type: 'int', kind: 'array', count: 'n * (floor(log(n)) + 1)' }]],
  ['mp.adj', [{ name: 'adj', type: 'vector<T> (header)', kind: 'array', count: 'n' }, { name: 'adj[]', type: 'int', kind: 'array', count: '2 * m' }]],
  ['mp.dp', [{ name: 'dp', type: 'int', kind: 'array', count: 'n * m' }]],
  ['mp.bitset', [{ name: 'bs', type: 'bool', kind: 'bitset', count: 'n' }]],
  ['mp.map', [{ name: 'mp', type: 'pair<int,int>', kind: 'set', count: 'n' }]],
];
const r16 = (x) => Math.ceil(x / 16) * 16;
function elemBytes(type, kind) {
  const sz = (MTYPES.find((x) => x[0] === type) || [0, 4])[1];
  if (kind === 'bitset') return 1 / 8;
  if (kind === 'set') return r16(32 + sz + 8);
  if (kind === 'uset') return r16(8 + sz + 8) + 8;
  return sz;
}
function renderMemTable() {
  const opt = (arr, cur, lab) => arr.map((x) => `<option value="${esc(x)}"${x === cur ? ' selected' : ''}>${esc(lab ? lab(x) : x)}</option>`).join('');
  $('#memTable').innerHTML = `<table class="tbl"><thead><tr><th>${t('mem.colName')}</th><th>${t('mem.colType')}</th><th>${t('mem.colKind')}</th><th>${t('mem.colCount')}</th><th class="num">${t('mem.colBytes')}</th><th></th></tr></thead><tbody>` +
    memRows.map((r, i) => `<tr data-i="${i}">
      <td><input class="input mono" data-k="name" value="${esc(r.name)}" style="width:90px"></td>
      <td><select class="input" data-k="type" style="width:auto">${opt(MTYPES.map((x) => x[0]), r.type, (x) => x + ' · ' + MTYPES.find((y) => y[0] === x)[1] + 'B')}</select></td>
      <td><select class="input" data-k="kind" style="width:auto">${opt(MKINDS, r.kind, (x) => t('mem.kind.' + x))}</select></td>
      <td><input class="input mono" data-k="count" value="${esc(r.count)}" style="width:170px"></td>
      <td class="num" data-out></td>
      <td><button class="btn sm danger" data-del title="×">×</button></td></tr>`).join('') + '</tbody></table>';
  runMem();
}
$('#memTable').addEventListener('input', (e) => {
  const tr = e.target.closest('tr[data-i]'); if (!tr || !e.target.dataset.k) return;
  memRows[+tr.dataset.i][e.target.dataset.k] = e.target.value; runMemD();
});
$('#memTable').addEventListener('click', (e) => {
  if (!e.target.closest('[data-del]')) return;
  memRows.splice(+e.target.closest('tr').dataset.i, 1); renderMemTable();
});
$('#memAdd').onclick = () => { memRows.push({ name: 'x', type: 'int', kind: 'array', count: 'n' }); renderMemTable(); };
function renderPresets() {
  $('#memPreset').innerHTML = `<option value="">${esc(t('mem.presetPick'))}</option>` + PRESETS.map((p, i) => `<option value="${i}">${esc(t(p[0]))}</option>`).join('');
}
$('#memPreset').addEventListener('change', (e) => {
  const p = PRESETS[e.target.value]; if (!p) return;
  p[1].forEach((r) => memRows.push(Object.assign({}, r)));
  e.target.value = ''; renderMemTable();
});
function runMem() {
  const o = $('#memOut');
  let env, ml;
  try { env = CP.parseVars($('#memVars').value); ml = numField($('#memML').value); } catch (e) { o.innerHTML = errBox(e); return; }
  let total = 0, err = null;
  $$('#memTable tr[data-i]').forEach((tr) => {
    const r = memRows[+tr.dataset.i], cell = tr.querySelector('[data-out]');
    const inp = tr.querySelector('[data-k="count"]');
    try {
      const cnt = CP.toNum(evalField(r.count, env));
      const b = cnt * elemBytes(r.type, r.kind);
      total += b; cell.textContent = CP.fmtBytes(b); inp.classList.remove('err');
    } catch (e) { cell.textContent = '—'; inp.classList.add('err'); err = err || e; }
  });
  const limit = ml * 1048576, ratio = total / limit, pct = ratio * 100;
  const cls = ratio <= 0.6 ? 'ok' : ratio <= 1 ? 'warn' : 'bad';
  o.innerHTML = (err ? errBox(err) : '') + out(
    kv(t('mem.total'), esc(CP.fmtBytes(total)), esc(t('mem.ofML', { p: pct < 0.1 ? '<0.1' : pct.toFixed(pct < 10 ? 1 : 0) })), { big: true }) +
    kv(t('cx.verdict'), chip(cls, t('mem.v.' + cls)) + `<div class="meter ${cls}" style="margin-top:8px"><span style="width:${Math.min(100, Math.max(1, pct))}%"></span></div>`)) +
    `<p class="hint">${esc(t('mem.note'))}</p>`;
}
const runMemD = UI.debounce(runMem, 150);
renderPresets(); renderMemTable();
I18N.onChange(() => { renderPresets(); renderMemTable(); });
['memVars', 'memML'].forEach((id) => $('#' + id).addEventListener('input', runMemD));

})();
