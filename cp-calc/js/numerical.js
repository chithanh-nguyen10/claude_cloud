/* Phần 6: Numerical — sổ tay ma trận & đa thức, hệ phương trình, Lagrange, truy hồi tuyến tính, bảng sinh */
(function () {
'use strict';
const { $, $$, esc, kv, out, chip } = UI;
const N = NumCore, A = NumAlgos;

I18N.add({
  vi: {
    'tab.num': 'Numerical', 'nm.nav.nb': 'Ma trận & đa thức', 'nm.nav.gauss': 'Hệ phương trình', 'nm.nav.lag': 'Nội suy Lagrange', 'nm.nav.rec': 'Truy hồi tuyến tính', 'nm.nav.gen': 'Bảng sinh / Grundy',
    'nm.mode': 'Số', 'nm.exact': 'Chính xác (phân số)', 'nm.real': 'Số thực', 'nm.mod': 'Modulo', 'nm.prime': 'nguyên tố', 'nm.notPrime': 'không nguyên tố: Gauss, chia đa thức, Lagrange cần M nguyên tố',
    'nm.nb.title': 'Ma trận & đa thức', 'nm.nb.desc': 'Mỗi dòng một phép tính, đặt biến được. Ma trận viết [1 2; 3 4]; đa thức viết P(x) = 3x^2 - 2x + 1 (tên ẩn tuỳ chọn). Bấm vào kết quả để chép.',
    'nm.ref': 'Hàm và cú pháp',
    'nm.g.title': 'Hệ phương trình tuyến tính', 'nm.g.desc': 'Khử Gauss. Ra nghiệm duy nhất, vô nghiệm, hoặc nghiệm tổng quát theo các ẩn tự do. Chế độ Modulo 2 dùng cho hệ XOR.',
    'nm.g.eq': 'Phương trình', 'nm.g.mat': 'Ma trận mở rộng', 'nm.g.eqHint': 'Mỗi dòng một phương trình, vd 2x + 3y - z = 5. Tên ẩn tuỳ ý.', 'nm.g.matHint': 'Mỗi dòng là một hàng [a₁ … aₙ | b], cột cuối là vế phải.',
    'nm.g.none': 'Vô nghiệm', 'nm.g.unique': 'Nghiệm duy nhất', 'nm.g.many': 'Vô số nghiệm', 'nm.g.rank': 'Hạng', 'nm.g.free': 'Ẩn tự do', 'nm.g.count': 'Số nghiệm (mod {m})', 'nm.g.isFree': 'tự do',
    'nm.l.title': 'Nội suy Lagrange', 'nm.l.desc': 'Tìm đa thức bậc nhỏ nhất đi qua các điểm, rồi tính giá trị tại X (X lớn đến 1e18, nên dùng Modulo).',
    'nm.l.xy': 'Các cặp "x y"', 'nm.l.y': 'Chỉ y (x = 0, 1, 2, …)', 'nm.l.X': 'Tính tại X =', 'nm.l.poly': 'Đa thức', 'nm.l.val': 'P(X)', 'nm.l.deg': 'Bậc',
    'nm.r.title': 'Truy hồi tuyến tính', 'nm.r.desc': 'Nhập các số đầu của dãy. Berlekamp–Massey tìm hệ thức tuyến tính ngắn nhất, rồi tính a(N) với N lớn (đến 1e18, nên dùng Modulo).',
    'nm.r.seq': 'Các số đầu a(0), a(1), …', 'nm.r.N': 'Tính a(N) với N =', 'nm.r.rel': 'Hệ thức', 'nm.r.order': 'Bậc', 'nm.r.aN': 'a(N)', 'nm.r.warn': 'Mới có {n} số hạng cho hệ thức bậc {L}: cần ít nhất {need} số để chắc chắn đúng.',
    'nm.r.none': 'Dãy toàn số 0',
    'nm.s.title': 'Bảng sinh giá trị', 'nm.s.desc': 'Truy hồi tổng quát với xor, and, or, mex, min, max… Tính bảng giá trị để tự tìm quy luật (vd hàm Grundy). Luôn tính bằng số nguyên.',
    'nm.s.preset': 'Mẫu', 'nm.s.def': 'Định nghĩa', 'nm.s.init': 'Giá trị đầu a(0), a(1), … (tuỳ chọn)', 'nm.s.from': 'Từ n =', 'nm.s.to': 'đến n =', 'nm.s.piles': 'Các đống (tuỳ chọn): XOR Grundy',
    'nm.s.hint': 'Hàm có sẵn: xor(a,b,…), and, or, shl, shr, popcount, mex(…), min, max; vòng lặp mexfor(i, lo, hi, biểu thức), xorfor, sumfor, minfor, maxfor. Trong mex/min/max, a(k) với k âm được bỏ qua.',
    'nm.s.copy': 'Chép các giá trị', 'nm.s.stopped': 'Dừng ở n = {n} vì chạy quá 4 giây', 'nm.s.xor': 'XOR = {x}: người đi trước {w}', 'nm.s.win': 'thắng', 'nm.s.lose': 'thua',
    'nm.p.sub': 'Trò bốc: mỗi lượt bốc 1, 3 hoặc 4 viên', 'nm.p.split': 'Chia một đống thành hai đống khác rỗng', 'nm.p.subk': 'Trò bốc: bốc 1 đến 3 viên', 'nm.p.xorpre': 'XOR tiền tố 0 ^ 1 ^ … ^ n', 'nm.p.fib': 'Fibonacci', 'nm.p.pop': 'Số bit 1 của n',
    'num.badMod': 'M phải ≥ 2', 'num.noInverse': '{a} không có nghịch đảo modulo {m}', 'num.notExact': 'Không đổi được "{v}" thành phân số', 'num.dimMul': 'Không nhân được: {a} × {b}', 'num.notSquare': 'Cần ma trận vuông (đang là {a})',
    'num.negPow': 'Số mũ phải ≥ 0', 'num.dimAdd': 'Không {op} được hai ma trận khác kích thước: {a} và {b}', 'num.varMismatch': 'Hai đa thức khác tên ẩn ({a} và {b})', 'num.tooBigPoly': 'Đa thức quá lớn',
    'num.needPrime': 'Phép này cần M nguyên tố (M = {m})', 'num.integMod': 'Không chia được cho {k} trong modulo này', 'num.badOp': 'Không {op} được {a} với {b}', 'num.dispUse': 'Kết quả "{name}" chỉ để xem, không tính tiếp được',
    'num.noFact': 'Không dùng ! ở đây', 'num.noIndex': 'Không dùng a[i] ở đây', 'num.useDivmod': 'Dùng quo(P, Q) hoặc divmod(P, Q)', 'num.intExp': 'Số mũ phải là số nguyên', 'num.emptyMat': 'Ma trận rỗng',
    'num.matEntry': 'Phần tử ma trận phải là số: "{x}"', 'num.ragged': 'Hàng {i} có {n} phần tử, các hàng khác có {w}', 'num.notPoly': '"{name}" không phải đa thức', 'num.manyFree': 'Có nhiều biến chưa định nghĩa: {v}',
    'num.rootsMod': 'Tìm nghiệm chỉ hỗ trợ chế độ Chính xác và Số thực', 'num.rootsConst': 'Đa thức hằng không có nghiệm để tìm', 'num.singular': 'Ma trận suy biến (det = 0), không có nghịch đảo',
    'num.nonLinear': 'Phương trình không tuyến tính', 'num.badEq': 'Phương trình có nhiều dấu "=": {l}', 'num.dupX': 'Trùng x = {x}', 'num.needPoly': '{fn} cần đa thức', 'num.needMat': '{fn} cần ma trận', 'num.badSize': 'Kích thước không hợp lệ',
    'gen.badDef': 'Viết dạng a(n) = biểu thức', 'gen.badLoop': 'Vòng lặp viết dạng mexfor(i, lo, hi, biểu thức)', 'gen.empty': '{fn}: không có giá trị nào', 'gen.missing': 'Tính {f}({n}) cần {f}({k}) chưa có. Thêm giá trị đầu.',
  },
  en: {
    'tab.num': 'Numerical', 'nm.nav.nb': 'Matrices & polynomials', 'nm.nav.gauss': 'Linear systems', 'nm.nav.lag': 'Lagrange interpolation', 'nm.nav.rec': 'Linear recurrences', 'nm.nav.gen': 'Sequence table / Grundy',
    'nm.mode': 'Numbers', 'nm.exact': 'Exact (fractions)', 'nm.real': 'Real', 'nm.mod': 'Modulo', 'nm.prime': 'prime', 'nm.notPrime': 'not prime: Gauss, polynomial division and Lagrange need a prime M',
    'nm.nb.title': 'Matrices & polynomials', 'nm.nb.desc': 'One calculation per line, variables allowed. Matrices: [1 2; 3 4]; polynomials: P(x) = 3x^2 - 2x + 1 (any variable name). Click a result to copy it.',
    'nm.ref': 'Functions and syntax',
    'nm.g.title': 'Linear systems', 'nm.g.desc': 'Gaussian elimination. Gives the unique solution, no solution, or the general solution in terms of free variables. Modulo 2 handles XOR systems.',
    'nm.g.eq': 'Equations', 'nm.g.mat': 'Augmented matrix', 'nm.g.eqHint': 'One equation per line, e.g. 2x + 3y - z = 5. Any variable names.', 'nm.g.matHint': 'Each line is a row [a₁ … aₙ | b]; the last column is the right-hand side.',
    'nm.g.none': 'No solution', 'nm.g.unique': 'Unique solution', 'nm.g.many': 'Infinitely many solutions', 'nm.g.rank': 'Rank', 'nm.g.free': 'Free variables', 'nm.g.count': 'Number of solutions (mod {m})', 'nm.g.isFree': 'free',
    'nm.l.title': 'Lagrange interpolation', 'nm.l.desc': 'Finds the lowest-degree polynomial through the points and evaluates it at X (X up to 1e18; use Modulo).',
    'nm.l.xy': '"x y" pairs', 'nm.l.y': 'Only y (x = 0, 1, 2, …)', 'nm.l.X': 'Evaluate at X =', 'nm.l.poly': 'Polynomial', 'nm.l.val': 'P(X)', 'nm.l.deg': 'Degree',
    'nm.r.title': 'Linear recurrences', 'nm.r.desc': 'Enter the first terms. Berlekamp–Massey finds the shortest linear recurrence, then a(N) is computed for large N (up to 1e18; use Modulo).',
    'nm.r.seq': 'First terms a(0), a(1), …', 'nm.r.N': 'Compute a(N) for N =', 'nm.r.rel': 'Recurrence', 'nm.r.order': 'Order', 'nm.r.aN': 'a(N)', 'nm.r.warn': 'Only {n} terms for a recurrence of order {L}: give at least {need} to be sure.',
    'nm.r.none': 'The sequence is all zeros',
    'nm.s.title': 'Sequence table', 'nm.s.desc': 'General recurrences with xor, and, or, mex, min, max… Builds a table of values so you can spot the pattern yourself (e.g. Grundy values). Always computed with integers.',
    'nm.s.preset': 'Preset', 'nm.s.def': 'Definition', 'nm.s.init': 'Initial values a(0), a(1), … (optional)', 'nm.s.from': 'From n =', 'nm.s.to': 'to n =', 'nm.s.piles': 'Piles (optional): XOR of Grundy values',
    'nm.s.hint': 'Functions: xor(a,b,…), and, or, shl, shr, popcount, mex(…), min, max; loops mexfor(i, lo, hi, expr), xorfor, sumfor, minfor, maxfor. Inside mex/min/max, a(k) with negative k is skipped.',
    'nm.s.copy': 'Copy values', 'nm.s.stopped': 'Stopped at n = {n} after 4 seconds', 'nm.s.xor': 'XOR = {x}: the first player {w}', 'nm.s.win': 'wins', 'nm.s.lose': 'loses',
    'nm.p.sub': 'Subtraction game: take 1, 3 or 4', 'nm.p.split': 'Split a pile into two non-empty piles', 'nm.p.subk': 'Subtraction game: take 1 to 3', 'nm.p.xorpre': 'Prefix XOR 0 ^ 1 ^ … ^ n', 'nm.p.fib': 'Fibonacci', 'nm.p.pop': 'Number of 1 bits of n',
    'num.badMod': 'M must be ≥ 2', 'num.noInverse': '{a} has no inverse modulo {m}', 'num.notExact': 'Cannot turn "{v}" into a fraction', 'num.dimMul': 'Cannot multiply {a} × {b}', 'num.notSquare': 'Needs a square matrix (got {a})',
    'num.negPow': 'The exponent must be ≥ 0', 'num.dimAdd': 'Cannot {op} matrices of different sizes: {a} and {b}', 'num.varMismatch': 'The polynomials use different variables ({a} and {b})', 'num.tooBigPoly': 'Polynomial too large',
    'num.needPrime': 'This needs a prime M (M = {m})', 'num.integMod': 'Cannot divide by {k} with this modulus', 'num.badOp': 'Cannot {op} {a} and {b}', 'num.dispUse': 'Result "{name}" is for display only and cannot be used further',
    'num.noFact': '! is not available here', 'num.noIndex': 'a[i] is not available here', 'num.useDivmod': 'Use quo(P, Q) or divmod(P, Q)', 'num.intExp': 'The exponent must be an integer', 'num.emptyMat': 'Empty matrix',
    'num.matEntry': 'Matrix entries must be numbers: "{x}"', 'num.ragged': 'Row {i} has {n} entries, the others have {w}', 'num.notPoly': '"{name}" is not a polynomial', 'num.manyFree': 'Several undefined variables: {v}',
    'num.rootsMod': 'Root finding works in Exact and Real modes only', 'num.rootsConst': 'A constant polynomial has no roots to find', 'num.singular': 'Singular matrix (det = 0), no inverse',
    'num.nonLinear': 'The equation is not linear', 'num.badEq': 'Several "=" in one equation: {l}', 'num.dupX': 'Repeated x = {x}', 'num.needPoly': '{fn} needs a polynomial', 'num.needMat': '{fn} needs a matrix', 'num.badSize': 'Invalid size',
    'gen.badDef': 'Write it as a(n) = expression', 'gen.badLoop': 'Loops are written mexfor(i, lo, hi, expression)', 'gen.empty': '{fn}: no values', 'gen.missing': 'Computing {f}({n}) needs {f}({k}), which does not exist. Add initial values.',
  },
});

const REF = [
  ['A = [1 2; 3 4]', 'Ma trận; ";" ngăn hàng, phần tử cách bởi dấu cách hoặc dấu phẩy', 'Matrix; ";" separates rows, entries separated by spaces or commas'],
  ['A + B  A - B  A * B  k * A  A ^ n', 'Cộng, trừ, nhân, lũy thừa (n đến 1e18)', 'Add, subtract, multiply, power (n up to 1e18)'],
  ['I(n)  zeros(r, c)  transpose(A)', 'Ma trận đơn vị, ma trận 0, chuyển vị', 'Identity, zero matrix, transpose'],
  ['det(A)  inv(A)', 'Định thức, nghịch đảo', 'Determinant, inverse'],
  ['P(x) = 3x^2 - 2x + 1', 'Đa thức, đặt tên ẩn tuỳ ý: Q(t) = t^3 + 1', 'Polynomial with any variable name: Q(t) = t^3 + 1'],
  ['P + Q  P - Q  P * Q  P ^ k', 'Cộng, trừ, nhân, lũy thừa', 'Add, subtract, multiply, power'],
  ['P / Q  P % Q  divmod(P, Q)', 'Chia: chia hết ra thương, không hết ra thương và dư; % là dư', 'Division: exact → quotient, otherwise quotient and remainder; % is the remainder'],
  ['quo(P, Q)  rem(P, Q)  gcd(P, Q)', 'Thương, dư, ước chung lớn nhất', 'Quotient, remainder, greatest common divisor'],
  ['deriv(P)  integ(P)  integ(P, a, b)', 'Đạo hàm, nguyên hàm, tích phân từ a đến b', 'Derivative, antiderivative, integral from a to b'],
  ['P(5)  P(Q)  P(A)', 'Giá trị tại số, hợp hai đa thức, đa thức của ma trận', 'Value at a number, composition, polynomial of a matrix'],
  ['roots(P)  deg(P)  coef(P, k)', 'Nghiệm thực / phức (kèm bội), bậc, hệ số của xᵏ', 'Real / complex roots (with multiplicity), degree, coefficient of xᵏ'],
  ['(x + 1)^5  roots(x^2 - 2)', 'Chữ chưa định nghĩa được hiểu là ẩn của đa thức', 'An undefined letter is the polynomial variable'],
];
const NB_EXAMPLE = ['F = [1 1; 1 0]', 'F^10', 'A = [2 1; 1 3]', 'inv(A)', 'P(x) = x^3 - 6x^2 + 11x - 6', 'roots(P)', 'P / (x - 1)', 'divmod(P, x^2 + 1)', 'deriv(P)', 'integ(P, 0, 3)', 'roots(x^4 + 1)'];

/* ================================================================ mode */
const st = { mode: 'exact', M: '998244353' };
function field() {
  let M = 998244353n;
  try { M = CP.toBigInt(CP.unwrap(CP.evaluate(CP.parse(st.M || '998244353'), {})), 'M'); } catch (e) { /* keep default */ }
  return N.makeField(st.mode, M);
}
function renderMode() {
  $$('#nmMode [data-m]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.m === st.mode)));
  $('#nmModWrap').hidden = st.mode !== 'mod';
  if (st.mode === 'mod') {
    let p = false, okM = true;
    try { const M = CP.toBigInt(CP.unwrap(CP.evaluate(CP.parse(st.M), {})), 'M'); p = M >= 2n && CP.isPrime(M); okM = M >= 2n; } catch (e) { okM = false; }
    $('#nmPrime').innerHTML = okM ? (p ? chip('ok', t('nm.prime')) : chip('warn', t('nm.notPrime'))) : '';
  }
}
$('#nmMode').addEventListener('click', (e) => { const b = e.target.closest('[data-m]'); if (!b) return; st.mode = b.dataset.m; renderMode(); runAll(); });
$('#nmM').addEventListener('input', UI.debounce(() => { st.M = $('#nmM').value; renderMode(); runAll(); }, 250));

/* ================================================================ notebook */
function valueHTML(F, v) {
  if (N.isMat(v)) {
    return `<table class="mat">${v.a.map((r) => `<tr>${r.map((x) => `<td>${esc(F.str(x))}</td>`).join('')}</tr>`).join('')}</table><small>${v.r}×${v.c}</small>`;
  }
  if (N.isPoly(v)) return `${esc(N.polyStr(F, v))}<small>deg ${v.deg}</small>`;
  if (v instanceof N.Disp) {
    if (v.kind === 'divmod' && v.html === null) {
      const parts = v.text.split(' ; ');
      return parts.map((p) => esc(p.replace(/\*/g, '').replace(/\^(\d+)/g, (m, d) => d.split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]).join('')))).join('<br>');
    }
    if (v.kind === 'roots') return v.text.split(' ; ').map((r) => `<span class="root">${esc(r)}</span>`).join(' ');
    return esc(v.text);
  }
  return esc(F.str(v));
}
const nb = $('#nmNb');
function nbRow(text) {
  const row = document.createElement('div');
  row.className = 'nb-row';
  row.innerHTML = '<span class="nb-idx"></span><input class="nb-in" spellcheck="false" autocomplete="off"><div class="nb-out"></div>';
  row.querySelector('input').value = text || '';
  return row;
}
function nbSet(lines) { nb.innerHTML = ''; lines.forEach((l) => nb.appendChild(nbRow(l))); nbCompute(); }
function nbCompute() {
  let F;
  try { F = field(); } catch (e) { $$('.nb-out', nb).forEach((o) => { o.className = 'nb-out err'; o.textContent = UI.errMsg(e); }); return; }
  const B = A.builtins(F), env = {};
  $$('.nb-row', nb).forEach((row, i) => {
    row.querySelector('.nb-idx').textContent = i + 1;
    const text = row.querySelector('input').value.trim(), o = row.querySelector('.nb-out');
    o.className = 'nb-out'; delete o.dataset.copy;
    if (!text || text.startsWith('#')) { o.innerHTML = ''; return; }
    try {
      const r = N.runLine(text, env, F, B);
      if (r.name) env[r.name] = r.value;
      o.innerHTML = (r.name ? `<span class="eq">${esc(r.name)} = </span>` : '') + valueHTML(F, r.value);
      o.dataset.copy = N.toText(F, r.value);
    } catch (e) { o.className = 'nb-out err'; o.textContent = UI.errMsg(e); }
  });
}
nb.addEventListener('input', UI.debounce(nbCompute, 120));
nb.addEventListener('keydown', (e) => {
  const inp = e.target.closest('.nb-in'); if (!inp) return;
  const row = inp.parentElement;
  if (e.key === 'Enter') { e.preventDefault(); const r = nbRow(''); row.after(r); r.querySelector('input').focus(); nbCompute(); }
  else if (e.key === 'Backspace' && inp.value === '' && nb.children.length > 1) { e.preventDefault(); const p = row.previousElementSibling || row.nextElementSibling; row.remove(); p.querySelector('input').focus(); nbCompute(); }
  else if (e.key === 'ArrowUp' && row.previousElementSibling) { e.preventDefault(); row.previousElementSibling.querySelector('input').focus(); }
  else if (e.key === 'ArrowDown' && row.nextElementSibling) { e.preventDefault(); row.nextElementSibling.querySelector('input').focus(); }
});
$('#nmNbAdd').onclick = () => { const r = nbRow(''); nb.appendChild(r); r.querySelector('input').focus(); };
$('#nmNbClear').onclick = () => nbSet(['']);
$('#nmNbEx').onclick = () => nbSet(NB_EXAMPLE);
function renderRef() { const L = I18N.lang === 'en' ? 2 : 1; $('#nmRef').innerHTML = REF.map((r) => `<div><code>${esc(r[0])}</code><span>${esc(r[L])}</span></div>`).join(''); }

/* ================================================================ Gauss */
let gMode = 'eq';
$('#nmGMode').addEventListener('click', (e) => {
  const b = e.target.closest('[data-g]'); if (!b) return; gMode = b.dataset.g;
  $$('#nmGMode [data-g]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
  $('#nmGHint').textContent = t(gMode === 'eq' ? 'nm.g.eqHint' : 'nm.g.matHint');
  if (gMode === 'mat' && /[a-z]/i.test($('#nmGIn').value)) $('#nmGIn').value = '1 1 1 6\n2 -1 1 3\n1 2 -1 2';
  if (gMode === 'eq' && !/[a-z]/i.test($('#nmGIn').value)) $('#nmGIn').value = 'x + y + z = 6\n2x - y + z = 3\nx + 2y - z = 2';
  runGauss();
});
function runGauss() {
  const o = $('#nmGOut');
  try {
    const F = field();
    let vars, aug;
    if (gMode === 'eq') ({ vars, aug } = A.parseEquations(F, $('#nmGIn').value));
    else {
      aug = $('#nmGIn').value.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.replace('|', ' ').split(/[\s,]+/).filter(Boolean).map((x) => F.from(CP.unwrap(CP.evaluate(CP.parse(x), {})))));
      if (!aug.length) throw { key: 'num.emptyMat' };
      const w = aug[0].length;
      aug.forEach((r, i) => { if (r.length !== w) throw { key: 'num.ragged', params: { i: i + 1, n: r.length, w } }; });
      vars = Array.from({ length: w - 1 }, (_, i) => 'x' + (i + 1));
    }
    const s = A.solveLinear(F, aug, vars.length);
    let h = kv(t('nm.g.rank'), esc(String(s.rank)));
    if (s.status === 'none') h = kv('', chip('bad', t('nm.g.none'))) + h;
    else {
      h = kv('', chip(s.status === 'unique' ? 'ok' : 'warn', t(s.status === 'unique' ? 'nm.g.unique' : 'nm.g.many'))) + h;
      if (s.status === 'many') {
        h += kv(t('nm.g.free'), esc(s.free.map((f) => vars[f]).join(', ')));
        if (F.mode === 'mod') h += kv(t('nm.g.count', { m: F.M.toString() }), esc(F.M.toString() + '^' + s.free.length + (F.M ** BigInt(s.free.length) < 10n ** 30n ? ' = ' + (F.M ** BigInt(s.free.length)).toString() : '')));
      }
      h += vars.map((v, i) => {
        const x = s.sol[i];
        if (x.free) return kv(esc(v), `<span class="hint">${esc(t('nm.g.isFree'))}</span>`);
        let txt = F.str(x.k);
        x.terms.forEach(([f, c]) => {
          const neg = F.mode !== 'mod' && F.sign(c) < 0, a = neg ? F.neg(c) : c, as = F.str(a);
          txt += (neg ? ' − ' : ' + ') + (as === '1' ? '' : (as.includes('/') ? '(' + as + ')' : as) + '·') + vars[f];
        });
        txt = txt.replace(/^0 \+ /, '').replace(/^0 − /, '−');
        return kv(esc(v), esc(txt));
      }).join('');
    }
    o.innerHTML = out(h);
  } catch (e) { o.innerHTML = UI.errBox(e); }
}

/* ================================================================ Lagrange */
let lMode = 'y';
$('#nmLMode').addEventListener('click', (e) => {
  const b = e.target.closest('[data-l]'); if (!b) return; lMode = b.dataset.l;
  $$('#nmLMode [data-l]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
  $('#nmLIn').value = lMode === 'y' ? '0 1 5 14 30' : '0 0\n1 1\n2 5\n3 14\n4 30';
  runLag();
});
function runLag() {
  const o = $('#nmLOut');
  try {
    const F = field();
    const num = (x) => F.from(CP.unwrap(CP.evaluate(CP.parse(x), {})));
    let xs = [], ys = [];
    if (lMode === 'y') { ys = $('#nmLIn').value.split(/[\s,]+/).filter(Boolean).map(num); xs = ys.map((_, i) => F.from(BigInt(i))); }
    else $('#nmLIn').value.split('\n').map((l) => l.trim()).filter(Boolean).forEach((l) => { const [a, b] = l.split(/[\s,]+/); xs.push(num(a)); ys.push(num(b)); });
    if (!xs.length) { o.innerHTML = ''; return; }
    const P = A.lagrange(F, xs, ys);
    let h = kv(t('nm.l.poly'), esc(N.polyStr(F, P)), '', { copy: N.polyStr(F, P, true) }) + kv(t('nm.l.deg'), esc(String(P.deg)));
    const Xs = $('#nmLX').value.trim();
    if (Xs) { const X = CP.unwrap(CP.evaluate(CP.parse(Xs), {})); h += kv(t('nm.l.val'), esc(F.str(N.peval(F, P, F.from(X)))), '', { big: true, copy: F.str(N.peval(F, P, F.from(X))) }); }
    o.innerHTML = out(h);
  } catch (e) { o.innerHTML = UI.errBox(e); }
}

/* ================================================================ BM */
function runRec() {
  const o = $('#nmROut');
  try {
    const F = field();
    const seq = $('#nmRIn').value.split(/[\s,]+/).filter(Boolean).map((x) => F.from(CP.unwrap(CP.evaluate(CP.parse(x), {}))));
    if (!seq.length) { o.innerHTML = ''; return; }
    const c = A.berlekampMassey(F, seq);
    if (!c.length) { o.innerHTML = out(kv(t('nm.r.rel'), esc(t('nm.r.none')))); return; }
    const terms = c.map((x, i) => [x, i + 1]).filter(([x]) => !F.isZero(x)).map(([x, i], k) => {
      const neg = F.mode !== 'mod' && F.sign(x) < 0, a = neg ? F.neg(x) : x, s = F.str(a);
      return (k === 0 ? (neg ? '−' : '') : neg ? ' − ' : ' + ') + (s === '1' ? '' : (s.includes('/') ? '(' + s + ')' : s) + '·') + `a(n−${i})`;
    }).join('');
    let h = kv(t('nm.r.rel'), esc('a(n) = ' + (terms || '0')), '', { copy: c.map((x) => F.str(x)).join(' ') }) + kv(t('nm.r.order'), esc(String(c.length)));
    if (seq.length < 2 * c.length + 1) h += `<div class="msg err">${esc(t('nm.r.warn', { n: seq.length, L: c.length, need: 2 * c.length + 1 }))}</div>`;
    const Ns = $('#nmRN').value.trim();
    if (Ns) {
      const Nn = CP.toBigInt(CP.unwrap(CP.evaluate(CP.parse(Ns), {})), 'N');
      if (F.mode !== 'mod' && Nn > 100000n) throw { key: 'err.tooBig', params: { fn: 'N', max: '1e5 (Modulo: 1e18)' } };
      const v = A.linRecNth(F, c, seq.slice(0, c.length), Nn);
      h += kv(t('nm.r.aN'), esc(F.str(v)), '', { big: true, copy: F.str(v) });
    }
    o.innerHTML = out(h);
  } catch (e) { o.innerHTML = UI.errBox(e); }
}

/* ================================================================ generator */
const PRESETS = [
  ['nm.p.sub', 'g(n) = mex(g(n-1), g(n-3), g(n-4))', '', '0', '40'],
  ['nm.p.subk', 'g(n) = mex(g(n-1), g(n-2), g(n-3))', '', '0', '40'],
  ['nm.p.split', 'g(n) = mexfor(i, 1, n-1, xor(g(i), g(n-i)))', '', '0', '40'],
  ['nm.p.xorpre', 'a(n) = xor(a(n-1), n)', '0', '0', '40'],
  ['nm.p.pop', 'a(n) = popcount(n)', '', '0', '40'],
  ['nm.p.fib', 'a(n) = a(n-1) + a(n-2)', '0 1', '0', '40'],
];
function renderPresets() {
  $('#nmSPreset').innerHTML = `<option value="">—</option>` + PRESETS.map((p, i) => `<option value="${i}">${esc(t(p[0]))}</option>`).join('');
}
$('#nmSPreset').addEventListener('change', (e) => {
  const p = PRESETS[e.target.value]; if (!p) return;
  $('#nmSDef').value = p[1]; $('#nmSInit').value = p[2]; $('#nmSFrom').value = p[3]; $('#nmSTo').value = p[4];
  runGen();
});
let genText = '';
function runGen() {
  const o = $('#nmSOut');
  try {
    const from = Math.max(0, Math.floor(UI.numField($('#nmSFrom').value || '0'))), to = Math.floor(UI.numField($('#nmSTo').value || '40'));
    if (!(to >= from)) throw { key: 'err.needPositive', params: { fn: 'n' } };
    if (to > 200000) throw { key: 'err.tooBig', params: { fn: 'n', max: '2e5' } };
    const piles = $('#nmSPiles').value.split(/[\s,]+/).filter(Boolean).map((x) => Number(CP.toBigInt(CP.unwrap(CP.evaluate(CP.parse(x), {})), 'pile')));
    const R = Math.max(to, ...piles, 0);
    const r = A.generate($('#nmSDef').value, $('#nmSInit').value, R);
    const vals = r.vals.slice(from, to + 1);
    genText = vals.map(String).join(' ');
    const cols = 10;
    let rows = '';
    for (let s = from; s <= Math.min(to, r.vals.length - 1); s += cols) {
      rows += `<tr><th class="num">${s}</th>${Array.from({ length: cols }, (_, k) => s + k).map((n) => (n <= to && n < r.vals.length ? `<td class="num v${String(r.vals[n]).length < 3 ? ' c' + (Number(r.vals[n]) % 8 + 8) % 8 : ''}">${esc(String(r.vals[n]))}</td>` : '<td></td>')).join('')}</tr>`;
    }
    let h = `<div class="tbl-wrap" style="max-height:420px;overflow:auto"><table class="tbl gen-tbl"><thead><tr><th>n</th>${Array.from({ length: cols }, (_, k) => `<th class="num">+${k}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
    if (r.stopped !== null) h = `<div class="msg err">${esc(t('nm.s.stopped', { n: r.stopped }))}</div>` + h;
    if (piles.length) {
      const x = piles.reduce((acc, p) => acc ^ CP.toBigInt(r.vals[p], 'g'), 0n);
      h += `<div class="msg note">${esc(t('nm.s.xor', { x: x.toString(), w: x !== 0n ? t('nm.s.win') : t('nm.s.lose') }))} ${piles.map((p) => r.fname + '(' + p + ') = ' + r.vals[p]).join(', ')}</div>`;
    }
    o.innerHTML = h;
  } catch (e) { o.innerHTML = UI.errBox(e); }
}
$('#nmSCopy').onclick = () => { if (genText) UI.copy(genText); };

/* ================================================================ init */
function runAll() { nbCompute(); runGauss(); runLag(); runRec(); }
['nmGIn'].forEach((id) => $('#' + id).addEventListener('input', UI.debounce(runGauss, 200)));
['nmLIn', 'nmLX'].forEach((id) => $('#' + id).addEventListener('input', UI.debounce(runLag, 200)));
['nmRIn', 'nmRN'].forEach((id) => $('#' + id).addEventListener('input', UI.debounce(runRec, 200)));
['nmSDef', 'nmSInit', 'nmSFrom', 'nmSTo', 'nmSPiles'].forEach((id) => $('#' + id).addEventListener('input', UI.debounce(runGen, 300)));
renderMode(); renderRef(); renderPresets();
nbSet(NB_EXAMPLE);
runGauss(); runLag(); runRec();
$('#nmSPreset').value = '0'; $('#nmSPreset').dispatchEvent(new Event('change'));
I18N.onChange(() => { renderMode(); renderRef(); renderPresets(); runAll(); runGen(); $('#nmGHint').textContent = t(gMode === 'eq' ? 'nm.g.eqHint' : 'nm.g.matHint'); });
})();
