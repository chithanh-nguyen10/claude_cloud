/* Phần 5: DP Check — kiểm tra DnC optimization và alien trick */
(function () {
'use strict';
const { $, $$, esc, kv, out, chip } = UI;
const G = GenSpec, D = DPLogic;

I18N.add({
  vi: {
    'tab.dp': 'DP Check', 'dp.nav.dnc': 'DnC optimization', 'dp.nav.alien': 'Alien trick',
    'dnc.title': 'Kiểm tra Divide & Conquer optimization',
    'dnc.desc': 'Với dp[k][i] = min(dp[k−1][j] + cost(j+1, i)), kiểm tra hàm cost trên nhiều test ngẫu nhiên: bất đẳng thức tứ giác, opt đơn điệu, và so DnC với DP vét cạn.',
    'al.title': 'Kiểm tra alien trick (lồi / lõm)',
    'al.desc': 'Chạy code vét cạn của bạn trên nhiều test ngẫu nhiên, lấy dãy f(0), f(1), …, f(K) rồi kiểm tra f có lồi (bài min) hoặc lõm (bài max) theo k không.',
    'c.cost': 'Hàm cost', 'c.sample': 'Mẫu', 'c.samplePick': '— chọn mẫu —', 'c.formula': 'Công thức', 'c.code': 'Code C++',
    'c.formulaLbl': 'cost(l, r) =', 'c.formulaHint': 'Dùng l, r, len (= r − l + 1), các biến và mảng trong phần Sinh test. Hàm trên đoạn: sum, min, max, distinct, xor, gcd, inv (số nghịch thế), cnt(a,l,r,x). Có đủ + − * / // % ^ abs gcd sqrt log…',
    'c.codeHint': 'Viết hàm void init() đọc test từ stdin (giống input của đề) và hàm long long cost(int l, int r). Không viết main, công cụ tự thêm. Cần runner.',
    'c.kind': 'Bài toán', 'c.min': 'min (tìm nhỏ nhất)', 'c.max': 'max (tìm lớn nhất)', 'c.base': 'Chỉ số mảng từ', 'c.lenVar': 'Biến độ dài dãy', 'c.K': 'Số tầng K tối đa',
    'c.gen': 'Sinh test', 'c.genSrc': 'Nguồn test', 'c.genSpec': 'Mô tả định dạng', 'c.genCode': 'Code sinh test (runner)',
    'c.spec': 'Bố cục và phạm vi', 'c.specHint': 'Trên dấu --- là bố cục input (n k, a[n], q * (l r), g[n][m]). Dưới là phạm vi: tên: thấp..cao, kèm distinct, sorted, desc, nonzero, perm, edge (hay chọn giá trị biên), string len n alpha "ab". Cận không chứa dấu cách.',
    'c.specCodeHint': 'Khi dùng code sinh test, phần bố cục vẫn được dùng để đọc test (phạm vi bị bỏ qua).',
    'c.genCodeLbl': 'Code sinh test', 'c.genArgs': 'Tham số', 'c.lang': 'Ngôn ngữ', 'c.tests': 'Số test', 'c.seed': 'Seed',
    'c.preview': 'Sinh thử 1 test', 'c.start': 'Bắt đầu', 'c.stop': 'Dừng', 'c.copy': 'Chép test',
    'c.brute': 'Code vét cạn', 'c.bruteHint': 'Đọc test từ stdin, in f(0) f(1) … f(K) cách nhau bởi khoảng trắng (có thể bắt đầu từ f(1)). Giá trị vô nghiệm in bằng một trong các từ ở ô bên dưới. Cần runner.',
    'c.shape': 'f(k) phải', 'c.concave': 'lõm (bài max)', 'c.convex': 'lồi (bài min)', 'c.infTok': 'Từ chỉ vô nghiệm', 'c.k0': 'Dãy in ra bắt đầu từ',
    'r.empty': 'Chưa chạy. Chọn một mẫu hoặc nhập hàm rồi bấm Bắt đầu.', 'r.running': 'Đang chạy… {i}/{n}', 'r.tests': 'Số test đã chạy',
    'r.qi': 'Bất đẳng thức tứ giác', 'r.opt': 'opt đơn điệu', 'r.dnc': 'DnC = DP vét cạn', 'r.allOk': 'Đúng trên mọi test', 'r.failAt': 'Sai ở test #{i}',
    'r.v.ok': '✅ Dùng được DnC: cost thoả bất đẳng thức tứ giác và opt đơn điệu trên mọi test.',
    'r.v.warn': '⚠️ Không thoả bất đẳng thức tứ giác, nhưng opt vẫn đơn điệu và DnC ra đúng trên các test đã thử. Cẩn thận: chưa có chứng minh.',
    'r.v.bad': '❌ Không dùng được DnC: opt không đơn điệu hoặc DnC ra sai.',
    'r.test': 'Test #{i}', 'r.qiDetail': 'a = {a}, b = {b}, c = {c}, d = {d}: cost(a,c) + cost(b,d) = {lhs} {op} {rhs} = cost(a,d) + cost(b,c)',
    'r.optDetail': 'Tầng k = {k}: opt({i}) ≥ {x} nhưng opt({i1}) ≤ {y}. Không có cách chọn opt tăng dần.',
    'r.dncDetail': 'Tầng k = {k}, i = {i}: DnC ra {dnc}, vét cạn ra {brute}.',
    'r.optTable': 'Điểm cắt tốt nhất ở tầng k = {k} (đoạn cuối bắt đầu tại l)', 'r.colI': 'i', 'r.colOpt': 'l tốt nhất',
    'r.shapeOk': 'f lõm trên mọi test', 'r.shapeOkConvex': 'f lồi trên mọi test', 'r.shape': 'Hình dạng f(k)',
    'r.aOk': '✅ f(k) {shape} trên mọi test: dùng được alien trick (với các test đã thử).', 'r.aBad': '❌ f(k) không {shape}: không dùng alien trick trực tiếp được.',
    'r.aDetail': 'Δ(k) = f(k+1) − f(k) {dir} tại k = {k}.', 'r.aDirConcave': 'tăng lên', 'r.aDirConvex': 'giảm xuống', 'r.gap': 'f(k) vô nghiệm ở giữa dãy (k = {k}).',
    'r.colK': 'k', 'r.colF': 'f(k)', 'r.colD': 'Δ(k)', 'r.noRunner': 'Cần kết nối runner (xem tab Stress test).', 'r.compileErr': 'Lỗi biên dịch', 'r.runErr': 'Lỗi khi chạy code ở test #{i}: {msg}',
    'r.badOut': 'Output không đọc được: "{tok}"', 'r.genErr': 'Lỗi sinh test: {msg}', 'r.costErr': 'Lỗi tính cost: {msg}', 'r.nVar': 'Không tìm thấy biến độ dài "{v}" trong test',
    'r.stopped': 'Đã dừng',
    'gs.repScalar': 'Dòng {line}: trong "q * (...)" chỉ được dùng biến đơn', 'gs.matrixAlone': 'Dòng {line}: ma trận phải đứng một mình trên dòng',
    'gs.badRange': 'Phạm vi không hợp lệ: "{line}"', 'gs.noRange': 'Thiếu phạm vi cho "{name}"', 'gs.empty': 'Chưa có bố cục', 'gs.badItem': 'Dòng {line}: không hiểu "{tok}"',
    'gs.badOpt': '"{name}": tuỳ chọn "{opt}" không hợp lệ', 'gs.emptyRange': 'Phạm vi rỗng {lo}..{hi}', 'gs.notInt': '"{what}" phải là số nguyên', 'gs.loHi': '"{name}": cận dưới {lo} lớn hơn cận trên {hi}',
    'gs.noValue': '"{name}": không sinh được giá trị thoả điều kiện', 'gs.negLen': '"{name}": độ dài âm', 'gs.tooLong': '"{name}": quá dài', 'gs.distinct': '"{name}": cần {len} giá trị khác nhau nhưng phạm vi chỉ có {span}',
    'gs.eof': 'Test hết dữ liệu khi đọc "{name}"', 'gs.notYet': '"{name}" chưa được sinh khi tính "{what}" (cần đứng trước trong bố cục)',
  },
  en: {
    'tab.dp': 'DP Check', 'dp.nav.dnc': 'DnC optimization', 'dp.nav.alien': 'Alien trick',
    'dnc.title': 'Divide & Conquer optimization check',
    'dnc.desc': 'For dp[k][i] = min(dp[k−1][j] + cost(j+1, i)), checks the cost function on many random tests: quadrangle inequality, monotone opt, and DnC against a brute-force DP.',
    'al.title': 'Alien trick check (convex / concave)',
    'al.desc': 'Runs your brute-force code on many random tests, reads f(0), f(1), …, f(K) and checks that f is convex (min problems) or concave (max problems) in k.',
    'c.cost': 'Cost function', 'c.sample': 'Sample', 'c.samplePick': '— pick a sample —', 'c.formula': 'Formula', 'c.code': 'C++ code',
    'c.formulaLbl': 'cost(l, r) =', 'c.formulaHint': 'Use l, r, len (= r − l + 1) and the variables and arrays from Test generation. Range functions: sum, min, max, distinct, xor, gcd, inv (inversions), cnt(a,l,r,x). Also + − * / // % ^ abs gcd sqrt log…',
    'c.codeHint': 'Write void init() that reads the test from stdin (same as the problem input) and long long cost(int l, int r). Do not write main, it is added for you. Needs the runner.',
    'c.kind': 'Problem', 'c.min': 'min (minimize)', 'c.max': 'max (maximize)', 'c.base': 'Arrays start at', 'c.lenVar': 'Sequence length variable', 'c.K': 'Max layers K',
    'c.gen': 'Test generation', 'c.genSrc': 'Tests from', 'c.genSpec': 'Format description', 'c.genCode': 'Generator code (runner)',
    'c.spec': 'Layout and ranges', 'c.specHint': 'Above --- is the input layout (n k, a[n], q * (l r), g[n][m]). Below are ranges: name: low..high, plus distinct, sorted, desc, nonzero, perm, edge (favors boundary values), string len n alpha "ab". Bounds contain no spaces.',
    'c.specCodeHint': 'With a generator program, the layout part is still used to read the test (ranges are ignored).',
    'c.genCodeLbl': 'Generator code', 'c.genArgs': 'Arguments', 'c.lang': 'Language', 'c.tests': 'Tests', 'c.seed': 'Seed',
    'c.preview': 'Generate one test', 'c.start': 'Start', 'c.stop': 'Stop', 'c.copy': 'Copy test',
    'c.brute': 'Brute-force code', 'c.bruteHint': 'Reads the test from stdin and prints f(0) f(1) … f(K) separated by spaces (starting at f(1) is fine). Print one of the words below for infeasible values. Needs the runner.',
    'c.shape': 'f(k) must be', 'c.concave': 'concave (max problems)', 'c.convex': 'convex (min problems)', 'c.infTok': 'Words meaning infeasible', 'c.k0': 'Output starts at',
    'r.empty': 'Nothing run yet. Pick a sample or enter a function and press Start.', 'r.running': 'Running… {i}/{n}', 'r.tests': 'Tests run',
    'r.qi': 'Quadrangle inequality', 'r.opt': 'Monotone opt', 'r.dnc': 'DnC = brute DP', 'r.allOk': 'Holds on every test', 'r.failAt': 'Fails on test #{i}',
    'r.v.ok': '✅ DnC works: the cost satisfies the quadrangle inequality and opt is monotone on every test.',
    'r.v.warn': '⚠️ The quadrangle inequality fails, but opt stays monotone and DnC is correct on the tests tried. Careful: there is no proof.',
    'r.v.bad': '❌ DnC does not work: opt is not monotone or DnC gives a wrong answer.',
    'r.test': 'Test #{i}', 'r.qiDetail': 'a = {a}, b = {b}, c = {c}, d = {d}: cost(a,c) + cost(b,d) = {lhs} {op} {rhs} = cost(a,d) + cost(b,c)',
    'r.optDetail': 'Layer k = {k}: opt({i}) ≥ {x} but opt({i1}) ≤ {y}. No non-decreasing choice of opt exists.',
    'r.dncDetail': 'Layer k = {k}, i = {i}: DnC gives {dnc}, brute force gives {brute}.',
    'r.optTable': 'Best split points at layer k = {k} (the last segment starts at l)', 'r.colI': 'i', 'r.colOpt': 'best l',
    'r.shapeOk': 'f is concave on every test', 'r.shapeOkConvex': 'f is convex on every test', 'r.shape': 'Shape of f(k)',
    'r.aOk': '✅ f(k) is {shape} on every test: the alien trick applies (on the tests tried).', 'r.aBad': '❌ f(k) is not {shape}: the alien trick cannot be used directly.',
    'r.aDetail': 'Δ(k) = f(k+1) − f(k) {dir} at k = {k}.', 'r.aDirConcave': 'goes up', 'r.aDirConvex': 'goes down', 'r.gap': 'f(k) is infeasible in the middle of the sequence (k = {k}).',
    'r.colK': 'k', 'r.colF': 'f(k)', 'r.colD': 'Δ(k)', 'r.noRunner': 'Connect the runner first (see the Stress test tab).', 'r.compileErr': 'Compile error', 'r.runErr': 'Your code failed on test #{i}: {msg}',
    'r.badOut': 'Cannot read output token "{tok}"', 'r.genErr': 'Test generation error: {msg}', 'r.costErr': 'Cost evaluation error: {msg}', 'r.nVar': 'Length variable "{v}" not found in the test',
    'r.stopped': 'Stopped',
    'gs.repScalar': 'Line {line}: only plain variables are allowed inside "q * (...)"', 'gs.matrixAlone': 'Line {line}: a matrix must be alone on its line',
    'gs.badRange': 'Invalid range: "{line}"', 'gs.noRange': 'No range for "{name}"', 'gs.empty': 'The layout is empty', 'gs.badItem': 'Line {line}: cannot read "{tok}"',
    'gs.badOpt': '"{name}": unknown option "{opt}"', 'gs.emptyRange': 'Empty range {lo}..{hi}', 'gs.notInt': '"{what}" must be an integer', 'gs.loHi': '"{name}": lower bound {lo} is above upper bound {hi}',
    'gs.noValue': '"{name}": cannot generate a valid value', 'gs.negLen': '"{name}": negative length', 'gs.tooLong': '"{name}": too long', 'gs.distinct': '"{name}": needs {len} distinct values but the range only has {span}',
    'gs.eof': 'The test ran out of data while reading "{name}"', 'gs.notYet': '"{name}" is not generated yet when computing "{what}" (it must come earlier in the layout)',
  },
});

/* ============================================================ samples */
const DNC_SPEC = 'n k\na[n]\n---\nn: 4..30\nk: 1..n\na: 0..50';
const DNC_SAMPLES = [
  { key: 'sq', vi: 'Bình phương tổng đoạn, a ≥ 0 (dùng được)', en: 'Squared segment sum, a ≥ 0 (works)', mode: 'formula', formula: 'sum(a,l,r)^2', spec: DNC_SPEC, kind: 'min' },
  { key: 'inv', vi: 'Số nghịch thế trên đoạn (dùng được)', en: 'Inversions in the segment (works)', mode: 'formula', formula: 'inv(a,l,r)', spec: 'n k\na[n]\n---\nn: 4..30\nk: 1..n\na: 1..10', kind: 'min' },
  { key: 'sqneg', vi: 'Bình phương tổng khi a có số âm (không dùng được)', en: 'Squared sum with negative a (fails)', mode: 'formula', formula: 'sum(a,l,r)^2', spec: 'n k\na[n]\n---\nn: 4..30\nk: 1..n\na: -20..20', kind: 'min' },
  { key: 'lenmax', vi: 'len · max(a,l,r)', en: 'len · max(a,l,r)', mode: 'formula', formula: 'len * max(a,l,r)', spec: 'n k\na[n]\n---\nn: 4..30\nk: 1..n\na: 1..30', kind: 'min' },
  { key: 'distinct', vi: 'distinct(a,l,r)^2 (số giá trị khác nhau)', en: 'distinct(a,l,r)^2 (number of distinct values)', mode: 'formula', formula: 'distinct(a,l,r)^2', spec: 'n k\na[n]\n---\nn: 4..30\nk: 1..n\na: 1..6', kind: 'min' },
  { key: 'code', vi: 'Code C++: bình phương tổng bằng mảng cộng dồn', en: 'C++ code: squared sum with prefix sums', mode: 'code', spec: DNC_SPEC, kind: 'min',
    code: `#include <bits/stdc++.h>
using namespace std;

// Đọc test giống hệt input của đề (theo bố cục ở phần Sinh test)
int n, k;
vector<long long> a, pre;
void init() {
    cin >> n >> k;
    a.assign(n + 1, 0); pre.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) { cin >> a[i]; pre[i] = pre[i - 1] + a[i]; }
}

// chi phí của đoạn [l, r]
long long cost(int l, int r) {
    long long s = pre[r] - pre[l - 1];
    return s * s;
}
` },
];
const FEAST = `#include <bits/stdc++.h>
using namespace std;
// NOI 2019 Feast (bản vét cạn O(n^2)).
// Cho dãy a[1..n]; f(k) = tổng lớn nhất khi chọn đúng k đoạn con khác rỗng, rời nhau.
// In f(0) f(1) ... f(n).
int main() {
    int n, K;
    cin >> n >> K;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    const long long NEG = LLONG_MIN / 4;
    // closed[j]: đã có j đoạn, phần tử hiện tại không nằm trong đoạn đang mở
    // open[j]  : đã có j đoạn, đoạn thứ j đang mở và chứa phần tử hiện tại
    vector<long long> closed(n + 1, NEG), open(n + 1, NEG);
    closed[0] = 0;
    for (int i = 1; i <= n; i++) {
        vector<long long> c2(n + 1, NEG), o2(n + 1, NEG);
        for (int j = 0; j <= n; j++) {
            c2[j] = max(closed[j], open[j]);
            if (j > 0) {
                long long best = max(open[j], max(closed[j - 1], open[j - 1]));
                if (best > NEG) o2[j] = best + a[i];
            }
        }
        closed = c2; open = o2;
    }
    for (int j = 0; j <= n; j++) {
        long long v = max(closed[j], open[j]);
        if (v <= NEG / 2) cout << "INF"; else cout << v;
        cout << (j == n ? '\\n' : ' ');
    }
}
`;
const NOT_CONCAVE = `#include <bits/stdc++.h>
using namespace std;
// Ví dụ KHÔNG lõm: f(k) = tổng lớn nhất của một đoạn con có độ dài đúng k.
int main() {
    int n, K;
    cin >> n >> K;
    vector<long long> a(n + 1), pre(n + 1, 0);
    for (int i = 1; i <= n; i++) { cin >> a[i]; pre[i] = pre[i - 1] + a[i]; }
    for (int k = 1; k <= n; k++) {
        long long best = LLONG_MIN;
        for (int l = 1; l + k - 1 <= n; l++) best = max(best, pre[l + k - 1] - pre[l - 1]);
        cout << best << (k == n ? '\\n' : ' ');
    }
}
`;
const ALIEN_SPEC = 'n k\na[n]\n---\nn: 1..12\nk: 1..n\na: -10..10 edge';
const ALIEN_SAMPLES = [
  { key: 'feast', vi: 'NOI 2019 Feast: chọn đúng k đoạn rời nhau (lõm)', en: 'NOI 2019 Feast: exactly k disjoint segments (concave)', code: FEAST, spec: ALIEN_SPEC, shape: 'concave', k0: '0' },
  { key: 'bad', vi: 'Đoạn con độ dài đúng k tổng lớn nhất (không lõm)', en: 'Best segment of length exactly k (not concave)', code: NOT_CONCAVE, spec: ALIEN_SPEC, shape: 'concave', k0: '1' },
];

/* ============================================================ markup */
function genCard(p) {
  return `<div class="card"><header><h3 data-i18n="c.gen"></h3></header><div class="card-body">
    <div class="fields">
      <div class="field span2"><label for="${p}GenSrc" data-i18n="c.genSrc"></label>
        <select class="input" id="${p}GenSrc"><option value="spec" data-i18n="c.genSpec"></option><option value="code" data-i18n="c.genCode"></option></select></div>
      <div class="field"><label for="${p}Tests" data-i18n="c.tests"></label><input class="input mono" id="${p}Tests" value="200"></div>
      <div class="field"><label for="${p}Seed" data-i18n="c.seed"></label><input class="input mono" id="${p}Seed" value="1"></div>
      <div class="field full"><label for="${p}Spec" data-i18n="c.spec"></label><textarea class="input code" id="${p}Spec" rows="8" spellcheck="false" style="min-height:150px"></textarea></div>
    </div>
    <p class="hint" data-i18n="c.specHint"></p>
    <div id="${p}GenCodeBox" class="content" hidden>
      <p class="hint" data-i18n="c.specCodeHint"></p>
      <div class="fields">
        <div class="field"><label for="${p}GenLang" data-i18n="c.lang"></label><select class="input" id="${p}GenLang"><option value="cpp">C++</option><option value="py">Python</option></select></div>
        <div class="field full"><label for="${p}GenCode" data-i18n="c.genCodeLbl"></label><textarea class="input code" id="${p}GenCode" rows="8" spellcheck="false" style="min-height:140px"></textarea></div>
      </div>
    </div>
    <div class="row">
      <button class="btn" id="${p}Preview" data-i18n="c.preview"></button>
      <button class="btn primary" id="${p}Start" data-i18n="c.start"></button>
      <button class="btn" id="${p}Stop" disabled data-i18n="c.stop"></button>
    </div>
    <div id="${p}PreviewOut"></div>
  </div></div>`;
}
const root = $('#tab-dp');
root.innerHTML = `
<div class="layout">
  <nav class="subnav" data-subnav="dp">
    <button data-sec="dnc" aria-current="true" data-i18n="dp.nav.dnc"></button>
    <button data-sec="alien" data-i18n="dp.nav.alien"></button>
  </nav>
  <div class="content">
    <div data-sec-panel="dnc" class="content">
      <div class="sec-head"><h2 data-i18n="dnc.title"></h2><p data-i18n="dnc.desc"></p></div>
      <div class="stress-grid">
        <div class="content">
          <div class="card"><header><h3 data-i18n="c.cost"></h3></header><div class="card-body">
            <div class="field"><label for="dnSample" data-i18n="c.sample"></label><select class="input" id="dnSample"></select></div>
            <div class="seg" id="dnMode"><button data-m="formula" aria-selected="true" data-i18n="c.formula"></button><button data-m="code" aria-selected="false" data-i18n="c.code"></button></div>
            <div id="dnFormulaBox" class="field"><label for="dnFormula" data-i18n="c.formulaLbl"></label><input class="input mono" id="dnFormula" spellcheck="false"><p class="hint" data-i18n="c.formulaHint"></p></div>
            <div id="dnCodeBox" class="field" hidden><textarea class="input code" id="dnCode" rows="14" spellcheck="false"></textarea><p class="hint" data-i18n="c.codeHint"></p></div>
            <div class="fields">
              <div class="field"><label for="dnKind" data-i18n="c.kind"></label><select class="input" id="dnKind"><option value="min" data-i18n="c.min"></option><option value="max" data-i18n="c.max"></option></select></div>
              <div class="field"><label for="dnBase" data-i18n="c.base"></label><select class="input" id="dnBase"><option value="1">1</option><option value="0">0</option></select></div>
              <div class="field"><label for="dnLenVar" data-i18n="c.lenVar"></label><input class="input mono" id="dnLenVar" value="n"></div>
              <div class="field"><label for="dnK" data-i18n="c.K"></label><input class="input mono" id="dnK" value="n"></div>
            </div>
          </div></div>
          ${genCard('dn')}
        </div>
        <div class="content"><div class="card"><header><h3 data-i18n="res.title"></h3></header><div class="card-body" id="dnRes"></div></div></div>
      </div>
    </div>

    <div data-sec-panel="alien" class="content" hidden>
      <div class="sec-head"><h2 data-i18n="al.title"></h2><p data-i18n="al.desc"></p></div>
      <div class="stress-grid">
        <div class="content">
          <div class="card"><header><h3 data-i18n="c.brute"></h3></header><div class="card-body">
            <div class="fields">
              <div class="field span2"><label for="alSample" data-i18n="c.sample"></label><select class="input" id="alSample"></select></div>
              <div class="field"><label for="alLang" data-i18n="c.lang"></label><select class="input" id="alLang"><option value="cpp">C++</option><option value="py">Python</option></select></div>
            </div>
            <textarea class="input code" id="alCode" rows="16" spellcheck="false"></textarea>
            <p class="hint" data-i18n="c.bruteHint"></p>
            <div class="fields">
              <div class="field"><label for="alShape" data-i18n="c.shape"></label><select class="input" id="alShape"><option value="concave" data-i18n="c.concave"></option><option value="convex" data-i18n="c.convex"></option></select></div>
              <div class="field"><label for="alK0" data-i18n="c.k0"></label><select class="input" id="alK0"><option value="0">f(0)</option><option value="1">f(1)</option></select></div>
              <div class="field"><label for="alInf" data-i18n="c.infTok"></label><input class="input mono" id="alInf" value="INF -INF inf -inf"></div>
            </div>
          </div></div>
          ${genCard('al')}
        </div>
        <div class="content"><div class="card"><header><h3 data-i18n="res.title"></h3></header><div class="card-body" id="alRes"></div></div></div>
      </div>
    </div>
  </div>
</div>`;
I18N.apply(root);

/* ============================================================ helpers */
const L = () => (I18N.lang === 'en' ? 'en' : 'vi');
function msgOf(e) { return e && e.key ? t(e.key, e.params) : (e && e.message) || String(e); }
function fmtV(v) { return v === null || v === undefined ? '—' : typeof v === 'bigint' ? v.toString() : String(Number.isInteger(v) ? v : parseFloat(v.toPrecision(10))); }
const tick = () => new Promise((r) => setTimeout(r, 0));
function preBox(text, copyLabel) {
  return `<div class="io3"><div><div class="lbl"><span>Input</span><button class="btn sm" data-copy="${esc(text)}">${esc(copyLabel || t('c.copy'))}</button></div><pre>${esc(text)}</pre></div></div>`;
}
function wireGenSrc(p) {
  const upd = () => { $(`#${p}GenCodeBox`).hidden = $(`#${p}GenSrc`).value !== 'code'; };
  $(`#${p}GenSrc`).addEventListener('change', upd); upd();
}
wireGenSrc('dn'); wireGenSrc('al');
$('#dnGenCode').value = $('#alGenCode').value = `#include <bits/stdc++.h>
using namespace std;
mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());
int main() {
    int n = rng() % 10 + 1, k = rng() % n + 1;
    cout << n << " " << k << "\\n";
    for (int i = 0; i < n; i++) cout << (int)(rng() % 21) - 10 << " \\n"[i + 1 == n];
}
`;

/* Get one test: { text, vars } from the spec or a generator program */
async function getTest(p, spec, seed) {
  if ($(`#${p}GenSrc`).value === 'code') {
    const r = await Runner.exec(p + 'gen', '', [], 10000);
    if (r.status !== 'OK') throw new Error((r.note || r.status) + (r.stderr ? ': ' + r.stderr.slice(0, 200) : ''));
    return G.read(spec, r.stdout);
  }
  return G.generate(spec, seed);
}
async function prepareGen(p) {
  if ($(`#${p}GenSrc`).value !== 'code') return true;
  if (!window.Runner || !Runner.online) throw new Error(t('r.noRunner'));
  const c = await Runner.compile(p + 'gen', $(`#${p}GenLang`).value, $(`#${p}GenCode`).value);
  if (!c.ok) throw new Error(t('r.compileErr') + ':\n' + c.log);
  return true;
}
function wirePreview(p) {
  $(`#${p}Preview`).onclick = async () => {
    const o = $(`#${p}PreviewOut`);
    try {
      const spec = G.parseSpec($(`#${p}Spec`).value);
      await prepareGen(p);
      const seed = Math.floor(UI.numField($(`#${p}Seed`).value) || 1);
      const tst = await getTest(p, spec, seed);
      o.innerHTML = preBox(tst.text);
    } catch (e) { o.innerHTML = `<div class="msg err" style="white-space:pre-wrap">${esc(msgOf(e))}</div>`; }
  };
}
wirePreview('dn'); wirePreview('al');

/* ============================================================ DnC */
function renderDnSamples() {
  $('#dnSample').innerHTML = `<option value="">${esc(t('c.samplePick'))}</option>` + DNC_SAMPLES.map((s, i) => `<option value="${i}">${esc(s[L()])}</option>`).join('');
  $('#alSample').innerHTML = `<option value="">${esc(t('c.samplePick'))}</option>` + ALIEN_SAMPLES.map((s, i) => `<option value="${i}">${esc(s[L()])}</option>`).join('');
}
renderDnSamples(); I18N.onChange(renderDnSamples);
let dnMode = 'formula';
function setDnMode(m) {
  dnMode = m;
  $$('#dnMode button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.m === m)));
  $('#dnFormulaBox').hidden = m !== 'formula'; $('#dnCodeBox').hidden = m !== 'code';
}
$('#dnMode').addEventListener('click', (e) => { const b = e.target.closest('[data-m]'); if (b) setDnMode(b.dataset.m); });
function loadDn(i) {
  const s = DNC_SAMPLES[i]; if (!s) return;
  setDnMode(s.mode);
  if (s.formula) $('#dnFormula').value = s.formula;
  if (s.code) $('#dnCode').value = s.code;
  $('#dnSpec').value = s.spec; $('#dnKind').value = s.kind; $('#dnBase').value = '1'; $('#dnGenSrc').value = 'spec';
  $('#dnGenSrc').dispatchEvent(new Event('change'));
  $('#dnRes').innerHTML = `<div class="empty">${esc(t('r.empty'))}</div>`;
}
$('#dnSample').addEventListener('change', (e) => loadDn(e.target.value));
loadDn(0); $('#dnSample').value = '0';

/* range functions for formulas */
function rangeFuncs() {
  const isArr = (x) => x instanceof G.Arr;
  const seg = (a, l, r) => { const L1 = Number(l), R1 = Number(r), out = []; for (let i = L1; i <= R1; i++) out.push(a.at(i)); return out; };
  const big = (x) => (typeof x === 'bigint' ? x : BigInt(x));
  const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
  const wrap = (name, f) => (args) => (args.length && isArr(args[0]) ? f(...args) : CP.FUNCS[name](args));
  return {
    sum: (args) => { const [a, l, r] = args; return seg(a, l, r).reduce((s, x) => CP.A.add(s, x), 0n); },
    min: wrap('min', (a, l, r) => seg(a, l, r).reduce((m, x) => (m === null || x < m ? x : m), null)),
    max: wrap('max', (a, l, r) => seg(a, l, r).reduce((m, x) => (m === null || x > m ? x : m), null)),
    gcd: wrap('gcd', (a, l, r) => seg(a, l, r).reduce((g, x) => gcd(g, big(x)), 0n)),
    xor: ([a, l, r]) => seg(a, l, r).reduce((s, x) => s ^ big(x), 0n),
    distinct: ([a, l, r]) => BigInt(new Set(seg(a, l, r).map(String)).size),
    cnt: ([a, l, r, x]) => BigInt(seg(a, l, r).filter((y) => String(y) === String(x)).length),
    inv: ([a, l, r]) => { const s = seg(a, l, r); let c = 0n; for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) if (s[i] > s[j]) c++; return c; },
  };
}
function formulaMatrix(ast, vars, n, base) {
  const env = { __funcs: rangeFuncs() };
  for (const [k, x] of Object.entries(vars)) env[k] = Array.isArray(x) ? (Array.isArray(x[0]) ? new G.Arr(x.map((r) => new G.Arr(r, base)), base) : new G.Arr(x, base)) : x;
  const C = Array.from({ length: n }, () => new Array(n));
  for (let i = 0; i < n; i++) for (let j = i; j < n; j++) {
    env.l = BigInt(i + base); env.r = BigInt(j + base); env.len = BigInt(j - i + 1);
    C[i][j] = CP.unwrap(CP.evaluate(ast, env));
  }
  return C;
}
const HARNESS = `
// ---- thêm tự động bởi CP Calc ----
int main(int argc, char** argv) {
    int N = atoi(argv[1]), B = atoi(argv[2]);
    init();
    std::cout << std::setprecision(17);
    for (int l = B; l < B + N; l++) for (int r = l; r < B + N; r++) std::cout << cost(l, r) << ' ';
    std::cout << '\\n';
}
`;
function parseNum(tok) { if (/^[+-]?\d+$/.test(tok)) return BigInt(tok); const v = Number(tok); if (Number.isNaN(v)) throw new Error(t('r.badOut', { tok })); return v; }

let dnRunning = false, dnStop = false;
$('#dnStop').onclick = () => { dnStop = true; };
$('#dnStart').onclick = async () => {
  if (dnRunning) return;
  const res = $('#dnRes');
  const kind = $('#dnKind').value, base = Number($('#dnBase').value), lenVar = $('#dnLenVar').value.trim() || 'n';
  let spec, ast;
  try {
    spec = G.parseSpec($('#dnSpec').value);
    if (dnMode === 'formula') ast = CP.parse($('#dnFormula').value);
  } catch (e) { res.innerHTML = `<div class="msg err">${esc(msgOf(e))}</div>`; return; }
  const total = Math.max(1, Math.floor(UI.numField($('#dnTests').value) || 100));
  const seed0 = Math.floor(UI.numField($('#dnSeed').value) || 1);
  dnRunning = true; dnStop = false; $('#dnStart').disabled = true; $('#dnStop').disabled = false;
  const st = { ran: 0, qi: null, opt: null, dnc: null, error: null };
  const draw = (done) => renderDnRes(st, total, done);
  try {
    await prepareGen('dn');
    if (dnMode === 'code') {
      if (!window.Runner || !Runner.online) throw new Error(t('r.noRunner'));
      const c = await Runner.compile('dpcost', 'cpp', $('#dnCode').value + HARNESS);
      if (!c.ok) throw new Error(t('r.compileErr') + ':\n' + c.log);
    }
    for (let i = 1; i <= total && !dnStop; i++) {
      let tst;
      try { tst = await getTest('dn', spec, seed0 + i - 1); } catch (e) { throw new Error(t('r.genErr', { msg: msgOf(e) })); }
      const nv = tst.vars[lenVar];
      if (nv === undefined || typeof nv !== 'bigint') throw new Error(t('r.nVar', { v: lenVar }));
      const n = Number(nv);
      let C;
      if (dnMode === 'formula') {
        try { C = formulaMatrix(ast, tst.vars, n, base); } catch (e) { throw new Error(t('r.costErr', { msg: msgOf(e) })); }
      } else {
        const r = await Runner.exec('dpcost', tst.text, [n, base], 10000);
        if (r.status !== 'OK') throw new Error(t('r.runErr', { i, msg: (r.note || r.status) + (r.stderr ? ' — ' + r.stderr.slice(0, 300) : '') }));
        const toks = r.stdout.split(/\s+/).filter(Boolean);
        C = Array.from({ length: n }, () => new Array(n));
        let p = 0;
        for (let a = 0; a < n; a++) for (let b = a; b < n; b++) { if (p >= toks.length) throw new Error(t('r.badOut', { tok: 'EOF' })); C[a][b] = parseNum(toks[p++]); }
      }
      const Kmax = (() => { try { return Number(CP.unwrap(CP.evaluate(CP.parse($('#dnK').value || 'n'), Object.assign({}, tst.vars, { n: BigInt(n) })))); } catch (e) { return n; } })();
      st.ran = i;
      if (!st.qi) { const v = D.checkQI(C, n, kind, { rng: G.rng(seed0 + i) }); if (v) st.qi = { i, v, text: tst.text, base }; }
      if (!st.opt || !st.dnc) {
        const r = D.checkDnC(C, n, kind, Kmax);
        if (!st.opt && r.optViol) st.opt = { i, v: r.optViol, text: tst.text, base, n };
        if (!st.dnc && r.dncViol) st.dnc = { i, v: r.dncViol, text: tst.text, base };
      }
      if (st.opt && st.dnc && st.qi) break;
      if (i % 5 === 0) { draw(false); await tick(); }
    }
  } catch (e) { st.error = msgOf(e); }
  st.stopped = dnStop;
  dnRunning = false; $('#dnStart').disabled = false; $('#dnStop').disabled = true;
  draw(true);
};
function renderDnRes(st, total, done) {
  const res = $('#dnRes');
  if (st.error) { res.innerHTML = `<div class="msg err" style="white-space:pre-wrap">${esc(st.error)}</div>`; return; }
  const item = (label, f) => kv(esc(label), f ? chip('bad', t('r.failAt', { i: f.i })) : chip(done ? 'ok' : 'neutral', done ? t('r.allOk') : '…'));
  let h = out(
    kv(t('r.tests'), esc(st.ran + ' / ' + total) + (done ? '' : ` <span class="hint">${esc(t('r.running', { i: st.ran, n: total }))}</span>`) + (st.stopped ? ' ' + chip('warn', t('r.stopped')) : '')) +
    item(t('r.qi'), st.qi) + item(t('r.opt'), st.opt) + item(t('r.dnc'), st.dnc));
  if (done) {
    const cls = st.opt || st.dnc ? 'bad' : st.qi ? 'warn' : 'ok';
    h += `<div class="msg ${cls === 'bad' ? 'err' : 'note'}" style="${cls === 'ok' ? 'color:var(--ok);background:var(--ok-soft);border-radius:7px' : cls === 'warn' ? 'color:var(--warn);background:var(--warn-soft);border-radius:7px' : ''}">${esc(t('r.v.' + cls))}</div>`;
  }
  const kind = $('#dnKind').value;
  if (st.opt) {
    const { v, base } = st.opt;
    h += `<div class="lbl">${esc(t('r.test', { i: st.opt.i }))} · ${esc(t('r.opt'))}</div><div class="failmsg">${esc(t('r.optDetail', { k: v.k, i: v.i, i1: v.i + 1, x: v.optLi + base, y: v.optRi1 + base }))}</div>`;
    h += optTable(v, base) + preBox(st.opt.text);
  } else if (st.dnc) {
    const { v } = st.dnc;
    h += `<div class="lbl">${esc(t('r.test', { i: st.dnc.i }))} · ${esc(t('r.dnc'))}</div><div class="failmsg">${esc(t('r.dncDetail', { k: v.k, i: v.i, dnc: fmtV(v.dnc), brute: fmtV(v.brute) }))}</div>` + preBox(st.dnc.text);
  }
  if (st.qi) {
    const { v, base } = st.qi;
    const lhs = CP.A.add(v.ac, v.bd), rhs = CP.A.add(v.ad, v.bc);
    h += `<div class="lbl">${esc(t('r.test', { i: st.qi.i }))} · ${esc(t('r.qi'))}</div><div class="failmsg">${esc(t('r.qiDetail', { a: v.a + base, b: v.b + base, c: v.c + base, d: v.d + base, lhs: fmtV(lhs), rhs: fmtV(rhs), op: kind === 'max' ? '<' : '>' }))}</div>`;
    if (!st.opt && !st.dnc) h += preBox(st.qi.text);
  }
  if (!st.ran && !done) h = `<div class="empty">${esc(t('r.running', { i: 0, n: total }))}</div>`;
  res.innerHTML = h;
}
function optTable(v, base) {
  // opt for positions around the violation; j is a split point → last segment starts at l = j + base
  const from = Math.max(v.k, v.i - 4), to = Math.min(v.optL.length - 1, v.i + 5);
  let rows = '';
  for (let i = from; i <= to; i++) {
    const a = v.optL[i], b = v.optR[i];
    const txt = a < 0 ? '—' : a === b ? String(a + base) : (a + base) + '..' + (b + base);
    rows += `<tr${i === v.i || i === v.i + 1 ? ' class="hl"' : ''}><td class="num">${i}</td><td class="num">${esc(txt)}</td></tr>`;
  }
  return `<div class="lbl">${esc(t('r.optTable', { k: v.k }))}</div><div class="tbl-wrap"><table class="tbl"><thead><tr><th class="num">${t('r.colI')}</th><th class="num">${t('r.colOpt')}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
$('#dnRes').innerHTML = `<div class="empty">${esc(t('r.empty'))}</div>`;

/* ============================================================ Alien */
function loadAl(i) {
  const s = ALIEN_SAMPLES[i]; if (!s) return;
  $('#alCode').value = s.code; $('#alLang').value = 'cpp'; $('#alSpec').value = s.spec; $('#alShape').value = s.shape; $('#alK0').value = s.k0; $('#alGenSrc').value = 'spec';
  $('#alGenSrc').dispatchEvent(new Event('change'));
  $('#alRes').innerHTML = `<div class="empty">${esc(t('r.empty'))}</div>`;
}
$('#alSample').addEventListener('change', (e) => loadAl(e.target.value));
loadAl(0); $('#alSample').value = '0';
if (UI.HOSTED) {
  // web version: only the formula mode of the DnC check works
  const alien = $('#tab-dp [data-sec-panel="alien"]');
  alien.querySelector('.stress-grid').hidden = true;
  alien.insertAdjacentHTML('beforeend', UI.hostedNotice());
  const codeBtn = $('#dnMode [data-m="code"]');
  codeBtn.disabled = true; codeBtn.title = t('host.title');
  $$('#dnGenSrc option[value="code"]').forEach((o) => { o.disabled = true; });
  DNC_SAMPLES.forEach((x, i) => { if (x.mode === 'code') { const o = $(`#dnSample option[value="${i}"]`); if (o) o.disabled = true; } });
  I18N.apply(alien);
}
let alRunning = false, alStop = false;
$('#alStop').onclick = () => { alStop = true; };
$('#alStart').onclick = async () => {
  if (alRunning) return;
  const res = $('#alRes');
  let spec;
  try { spec = G.parseSpec($('#alSpec').value); } catch (e) { res.innerHTML = `<div class="msg err">${esc(msgOf(e))}</div>`; return; }
  const shape = $('#alShape').value;
  const k0 = Number($('#alK0').value);
  const infs = new Set($('#alInf').value.split(/\s+/).filter(Boolean));
  const total = Math.max(1, Math.floor(UI.numField($('#alTests').value) || 100));
  const seed0 = Math.floor(UI.numField($('#alSeed').value) || 1);
  alRunning = true; alStop = false; $('#alStart').disabled = true; $('#alStop').disabled = false;
  const st = { ran: 0, fail: null, error: null };
  try {
    if (!window.Runner || !Runner.online) throw new Error(t('r.noRunner'));
    await prepareGen('al');
    const c = await Runner.compile('albrute', $('#alLang').value, $('#alCode').value);
    if (!c.ok) throw new Error(t('r.compileErr') + ':\n' + c.log);
    for (let i = 1; i <= total && !alStop; i++) {
      let tst;
      try { tst = await getTest('al', spec, seed0 + i - 1); } catch (e) { throw new Error(t('r.genErr', { msg: msgOf(e) })); }
      const r = await Runner.exec('albrute', tst.text, [], 10000);
      if (r.status !== 'OK') throw new Error(t('r.runErr', { i, msg: (r.note || r.status) + (r.stderr ? ' — ' + r.stderr.slice(0, 300) : '') }));
      const vals = r.stdout.split(/\s+/).filter(Boolean).map((tok) => (infs.has(tok) ? null : parseNum(tok)));
      st.ran = i;
      const cv = D.checkConvex(vals, shape);
      if (!cv.ok) { st.fail = { i, cv, vals, text: tst.text }; break; }
      if (i % 5 === 0) { renderAlRes(st, total, false, shape, k0); await tick(); }
    }
  } catch (e) { st.error = msgOf(e); }
  st.stopped = alStop;
  alRunning = false; $('#alStart').disabled = false; $('#alStop').disabled = true;
  renderAlRes(st, total, true, shape, k0);
};
function renderAlRes(st, total, done, shape, k0) {
  const res = $('#alRes');
  if (st.error) { res.innerHTML = `<div class="msg err" style="white-space:pre-wrap">${esc(st.error)}</div>`; return; }
  const shapeWord = shape === 'concave' ? t('c.concave').split(' ')[0] : t('c.convex').split(' ')[0];
  let h = out(
    kv(t('r.tests'), esc(st.ran + ' / ' + total) + (st.stopped ? ' ' + chip('warn', t('r.stopped')) : '')) +
    kv(t('r.shape'), st.fail ? chip('bad', t('r.failAt', { i: st.fail.i })) : chip(done ? 'ok' : 'neutral', done ? (shape === 'concave' ? t('r.shapeOk') : t('r.shapeOkConvex')) : '…')));
  if (done && !st.stopped) h += st.fail ? `<div class="msg err">${esc(t('r.aBad', { shape: shapeWord }))}</div>` :
    `<div class="msg note" style="color:var(--ok);background:var(--ok-soft);border-radius:7px">${esc(t('r.aOk', { shape: shapeWord }))}</div>`;
  if (st.fail) {
    const { cv, vals } = st.fail;
    h += `<div class="lbl">${esc(t('r.test', { i: st.fail.i }))}</div>`;
    h += `<div class="failmsg">${esc(cv.gap ? t('r.gap', { k: cv.k + k0 }) : t('r.aDetail', { k: cv.k + k0, dir: shape === 'concave' ? t('r.aDirConcave') : t('r.aDirConvex') }))}</div>`;
    h += chart(vals, cv.k, k0);
    let rows = '';
    vals.forEach((v, k) => {
      const d = cv.diffs && k - cv.first >= 0 && k - cv.first < cv.diffs.length ? cv.diffs[k - cv.first] : undefined;
      const hl = !cv.gap && (k === cv.k - 1 || k === cv.k);
      rows += `<tr${hl ? ' class="hl"' : ''}><td class="num">${k + k0}</td><td class="num">${esc(fmtV(v))}</td><td class="num">${d === undefined ? '' : esc(fmtV(d))}</td></tr>`;
    });
    h += `<div class="tbl-wrap" style="max-height:260px"><table class="tbl"><thead><tr><th class="num">${t('r.colK')}</th><th class="num">${t('r.colF')}</th><th class="num">${t('r.colD')}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    h += preBox(st.fail.text);
  }
  res.innerHTML = h;
}
/* small line chart of f(k), the violating point in red */
function chart(vals, badK, k0) {
  const pts = vals.map((v, k) => (v === null ? null : [k, Number(v)])).filter(Boolean);
  if (pts.length < 2) return '';
  const W = 460, H = 160, P = 28;
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const sx = (x) => P + (x - x0) / Math.max(1, x1 - x0) * (W - 2 * P), sy = (y) => H - P + 8 - (y - y0) / Math.max(1e-9, y1 - y0) * (H - 2 * P);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + sx(p[0]).toFixed(1) + ' ' + sy(p[1]).toFixed(1)).join(' ');
  const dots = pts.map((p) => `<circle cx="${sx(p[0]).toFixed(1)}" cy="${sy(p[1]).toFixed(1)}" r="${p[0] === badK ? 5 : 3}" fill="${p[0] === badK ? 'var(--bad)' : 'var(--accent)'}"/>`).join('');
  return `<div class="chart-box"><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="f(k)">
    <line x1="${P}" y1="${H - P + 8}" x2="${W - P}" y2="${H - P + 8}" stroke="var(--line)"/>
    <text x="${P}" y="${H - 6}" fill="var(--muted)" font-size="11">k = ${x0 + k0}</text><text x="${W - P}" y="${H - 6}" fill="var(--muted)" font-size="11" text-anchor="end">k = ${x1 + k0}</text>
    <text x="4" y="14" fill="var(--muted)" font-size="11">${esc(fmtV(y1))}</text>
    <path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2"/>${dots}</svg></div>`;
}
$('#alRes').innerHTML = `<div class="empty">${esc(t('r.empty'))}</div>`;
})();
