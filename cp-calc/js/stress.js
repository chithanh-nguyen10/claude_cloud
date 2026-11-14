/* Phần 3: Stress test & Benchmark (cần runner.py chạy trên máy) */
(function () {
'use strict';
const { $, $$, esc, kv, out, chip } = UI;

I18N.add({
  vi: {
    'rn.checking': 'Đang kết nối runner…', 'rn.ok': 'Đã kết nối runner', 'rn.off': 'Chưa kết nối runner', 'rn.retry': 'Kết nối lại',
    'rn.info': '{os} · Python {py} · {tools}', 'rn.noCompiler': 'không tìm thấy g++ / clang++', 'rn.file': 'Trang đang mở trực tiếp từ file nên không gọi được runner.',
    'rn.howTitle': 'Cách bật Stress test & Benchmark',
    'rn.step1': 'Cài <b>Python 3</b> và <b>g++</b> (MinGW-w64 / MSYS2 trên Windows) hoặc <b>clang++</b>.',
    'rn.step2': 'Windows: bấm đúp <code>start-runner.bat</code> trong thư mục <code>cp-calc</code>. Máy khác: chạy <code>python3 runner.py</code>.',
    'rn.step3': 'Trình duyệt tự mở <code>http://127.0.0.1:8765/#stress</code>. Dùng trang đó (không mở file index.html trực tiếp).',
    'rn.why': 'Trình duyệt không tự chạy được g++ hay file .exe, nên cần runner. Runner chỉ nghe trên 127.0.0.1 và yêu cầu mã bí mật của phiên, trang web khác không dùng được.',
    'sp.title': 'Chương trình', 'slot.sol': 'Code cần kiểm tra', 'slot.brute': 'Code trâu', 'slot.gen': 'Sinh test', 'slot.checker': 'Checker',
    'slot.d.sol': 'Bắt buộc. Lời giải bạn muốn kiểm tra và đo thời gian, bộ nhớ.',
    'slot.d.brute': 'Tuỳ chọn. Lời giải chậm nhưng chắc đúng. Output của nó là đáp án để so.',
    'slot.d.gen': 'Bắt buộc. Một chương trình bình thường: không nhận tham số, in một test ra stdout. Muốn đổi giới hạn thì sửa thẳng trong code. Seed mt19937 theo thời gian để mỗi lần ra test khác.',
    'slot.d.checker': 'Tuỳ chọn. Kiểu testlib: chạy checker <input> <output> <answer>, trả mã 0 là đúng. Không có checker thì so trực tiếp với output code trâu.',
    'slot.load': 'Mở file…', 'slot.clear': 'Xoá', 'slot.sample': 'Nạp ví dụ…', 'slot.lang': 'Ngôn ngữ',
    'slot.ph': 'Dán code vào đây, hoặc bấm "Mở file…", hoặc kéo thả file vào ô này.',
    'io.in': 'Đọc input từ', 'io.out': 'Ghi output ra', 'io.file': 'file', 'io.inName': 'Tên file input', 'io.outName': 'Tên file output',
    'io.args': 'Tham số dòng lệnh', 'io.hint.gen': 'Output của trình sinh được dùng làm input cho code cần kiểm tra và code trâu.',
    'io.hint.checker': 'Mặc định: {input} {output} {answer}. Nếu không có code trâu, file answer rỗng.', 'io.hint.sol': 'Output của chương trình này đem đi so lấy từ đây.',
    'cp.title': 'Biên dịch', 'cp.compiler': 'Trình biên dịch', 'cp.custom': 'Đường dẫn trình biên dịch', 'cp.customOpt': 'Tự nhập đường dẫn…',
    'cp.std': 'Chuẩn C++', 'cp.opt': 'Tối ưu', 'cp.none': '(không)', 'cp.flags': 'Cờ thêm', 'cp.template': 'Lệnh biên dịch (sửa được, có {compiler} {std} {opt} {flags} {src} {exe})',
    'cp.python': 'Lệnh chạy Python', 'cp.preview': 'Lệnh sẽ chạy', 'cp.compileAll': 'Biên dịch tất cả', 'cp.reset': 'Khôi phục mặc định',
    'cp.ok': '{slot}: biên dịch xong ({ms} ms)', 'cp.cached': '{slot}: không đổi, dùng bản đã biên dịch', 'cp.err': '{slot}: lỗi biên dịch', 'cp.py': '{slot}: Python, không cần biên dịch',
    'cp.detected': 'tìm thấy', 'cp.notFound': '(chưa thấy trong PATH)',
    'rs.title': 'Chạy', 'rs.stress': 'Stress test', 'rs.bench': 'Benchmark',
    'rs.d.stress': 'Sinh test ngẫu nhiên liên tục, chạy code cần kiểm tra và code trâu (hoặc checker), dừng ở test sai đầu tiên.',
    'rs.d.bench': 'Chạy một bộ test cố định, đo thời gian và bộ nhớ từng test. Có thể kiểm tra đúng sai nếu có code trâu hoặc checker.',
    'rs.tl': 'Time limit (ms)', 'rs.ml': 'Memory limit (MB)', 'rs.seed': 'Seed bắt đầu', 'rs.count': 'Số test (0 = chạy mãi)', 'rs.benchCount': 'Số test',
    'rs.compare': 'Cách so output',
    'res.dup': 'Trình sinh test đang ra cùng một test nhiều lần liên tiếp. Hãy seed mt19937 theo thời gian (xem Hướng dẫn), đừng dùng hằng số hay time(0).',
    'rs.stopFail': 'Dừng ở test sai đầu tiên', 'rs.verify': 'Kiểm tra đúng sai (cần code trâu hoặc checker)',
    'rs.start': 'Bắt đầu', 'rs.stop': 'Dừng', 'cmp.tokens': 'Bỏ qua khoảng trắng (mặc định)', 'cmp.lines': 'Theo dòng (bỏ khoảng trắng cuối dòng)',
    'cmp.exact': 'Chính xác từng byte', 'cmp.float': 'Số thực với sai số ε',
    'need.runner': 'Cần kết nối runner.', 'need.sol': 'Thiếu code cần kiểm tra.', 'need.gen': 'Thiếu trình sinh test.', 'need.ref': 'Stress test cần code trâu hoặc checker.',
    'res.title': 'Kết quả', 'res.empty': 'Chưa chạy. Nạp chương trình rồi bấm Bắt đầu.', 'res.compiling': 'Đang biên dịch…', 'res.running': 'Đang chạy',
    'res.passed': 'Số test đúng', 'res.run': 'Đã chạy {n} test', 'res.maxTime': 'Thời gian lớn nhất', 'res.maxMem': 'Bộ nhớ lớn nhất', 'res.avgTime': 'Thời gian trung bình',
    'res.status': 'Trạng thái', 'res.allOk': 'Tất cả đúng', 'res.found': 'Tìm thấy test sai', 'res.stopped': 'Đã dừng', 'res.done': 'Xong',
    'res.atTest': 'test #{i}', 'res.input': 'Input', 'res.output': 'Output (code cần kiểm tra)', 'res.answer': 'Đáp án (code trâu)', 'res.msg': 'Chi tiết',
    'res.download': 'Tải', 'res.openFolder': 'Mở thư mục test', 'res.truncated': '(đã cắt bớt, tải file để xem đủ)', 'res.genArgs': 'Tham số sinh test',
    'res.colNo': '#', 'res.colArgs': 'Tham số', 'res.colV': 'Kết quả', 'res.colT': 'Thời gian', 'res.colM': 'Bộ nhớ', 'res.colIn': 'Kích thước input',
    'res.csv': 'Xuất CSV', 'res.failures': 'Các test sai', 'res.clickRow': 'Bấm vào một dòng để xem chi tiết test.', 'res.slowest': 'chậm nhất: test #{i}',
    'res.error': 'Lỗi runner: {msg}', 'res.asGraph': 'Mở dạng đồ thị', 'res.savedAt': 'Đã lưu tại {dir}',
    'vd.AC': 'Đúng', 'vd.OK': 'Chạy xong', 'vd.WA': 'Sai', 'vd.TLE': 'Quá thời gian', 'vd.MLE': 'Quá bộ nhớ', 'vd.RE': 'Lỗi khi chạy',
    'vd.GEN_ERR': 'Lỗi trình sinh', 'vd.BRUTE_ERR': 'Lỗi code trâu', 'vd.CHK_ERR': 'Lỗi checker',
  },
  en: {
    'rn.checking': 'Connecting to runner…', 'rn.ok': 'Runner connected', 'rn.off': 'Runner not connected', 'rn.retry': 'Reconnect',
    'rn.info': '{os} · Python {py} · {tools}', 'rn.noCompiler': 'no g++ / clang++ found', 'rn.file': 'This page was opened directly from a file, so it cannot reach the runner.',
    'rn.howTitle': 'How to enable Stress test & Benchmark',
    'rn.step1': 'Install <b>Python 3</b> and <b>g++</b> (MinGW-w64 / MSYS2 on Windows) or <b>clang++</b>.',
    'rn.step2': 'Windows: double-click <code>start-runner.bat</code> in the <code>cp-calc</code> folder. Elsewhere: run <code>python3 runner.py</code>.',
    'rn.step3': 'Your browser opens <code>http://127.0.0.1:8765/#stress</code>. Use that page (not index.html opened as a file).',
    'rn.why': 'Browsers cannot run g++ or .exe files themselves, so a small runner is needed. It listens on 127.0.0.1 only and requires a per-session secret, so other websites cannot use it.',
    'sp.title': 'Programs', 'slot.sol': 'Solution', 'slot.brute': 'Brute force', 'slot.gen': 'Generator', 'slot.checker': 'Checker',
    'slot.d.sol': 'Required. The solution you want to check and measure.',
    'slot.d.brute': 'Optional. A slow but surely correct solution. Its output is the expected answer.',
    'slot.d.gen': 'Required. A normal program: no arguments, prints one test to stdout. Change the limits directly in the code. Seed mt19937 with the clock so every run gives a new test.',
    'slot.d.checker': 'Optional. testlib style: runs checker <input> <output> <answer>, exit code 0 means correct. Without a checker, output is compared with the brute force output.',
    'slot.load': 'Open file…', 'slot.clear': 'Clear', 'slot.sample': 'Load an example…', 'slot.lang': 'Language',
    'slot.ph': 'Paste code here, click "Open file…", or drop a file onto this box.',
    'io.in': 'Read input from', 'io.out': 'Write output to', 'io.file': 'file', 'io.inName': 'Input file name', 'io.outName': 'Output file name',
    'io.args': 'Command-line arguments', 'io.hint.gen': 'The generator output becomes the input of the solution and the brute force.',
    'io.hint.checker': 'Default: {input} {output} {answer}. Without a brute force, the answer file is empty.', 'io.hint.sol': 'The output that gets compared is read from here.',
    'cp.title': 'Compile', 'cp.compiler': 'Compiler', 'cp.custom': 'Compiler path', 'cp.customOpt': 'Enter a path…',
    'cp.std': 'C++ standard', 'cp.opt': 'Optimization', 'cp.none': '(none)', 'cp.flags': 'Extra flags', 'cp.template': 'Compile command (editable; uses {compiler} {std} {opt} {flags} {src} {exe})',
    'cp.python': 'Python command', 'cp.preview': 'Command that will run', 'cp.compileAll': 'Compile all', 'cp.reset': 'Reset to defaults',
    'cp.ok': '{slot}: compiled ({ms} ms)', 'cp.cached': '{slot}: unchanged, using the previous build', 'cp.err': '{slot}: compile error', 'cp.py': '{slot}: Python, no compile needed',
    'cp.detected': 'found', 'cp.notFound': '(not found in PATH)',
    'rs.title': 'Run', 'rs.stress': 'Stress test', 'rs.bench': 'Benchmark',
    'rs.d.stress': 'Generates random tests in a loop, runs the solution and the brute force (or checker), and stops at the first wrong answer.',
    'rs.d.bench': 'Runs a fixed set of tests and measures time and memory for each. Checks correctness too if you have a brute force or checker.',
    'rs.tl': 'Time limit (ms)', 'rs.ml': 'Memory limit (MB)', 'rs.seed': 'Starting seed', 'rs.count': 'Tests (0 = forever)', 'rs.benchCount': 'Tests',
    'rs.compare': 'Output comparison',
    'res.dup': 'The generator keeps printing the same test. Seed mt19937 with the clock (see the Guide), not with a constant or time(0).',
    'rs.stopFail': 'Stop at the first failing test', 'rs.verify': 'Check correctness (needs brute force or checker)',
    'rs.start': 'Start', 'rs.stop': 'Stop', 'cmp.tokens': 'Ignore whitespace (default)', 'cmp.lines': 'Line by line (ignore trailing spaces)',
    'cmp.exact': 'Exact bytes', 'cmp.float': 'Floats with tolerance ε',
    'need.runner': 'Connect the runner first.', 'need.sol': 'The solution is missing.', 'need.gen': 'The generator is missing.', 'need.ref': 'A stress test needs a brute force or a checker.',
    'res.title': 'Results', 'res.empty': 'Nothing run yet. Load the programs and press Start.', 'res.compiling': 'Compiling…', 'res.running': 'Running',
    'res.passed': 'Tests passed', 'res.run': 'Ran {n} tests', 'res.maxTime': 'Max time', 'res.maxMem': 'Max memory', 'res.avgTime': 'Average time',
    'res.status': 'Status', 'res.allOk': 'All correct', 'res.found': 'Found a failing test', 'res.stopped': 'Stopped', 'res.done': 'Done',
    'res.atTest': 'test #{i}', 'res.input': 'Input', 'res.output': 'Output (solution)', 'res.answer': 'Expected (brute force)', 'res.msg': 'Details',
    'res.download': 'Download', 'res.openFolder': 'Open test folder', 'res.truncated': '(truncated, download to see everything)', 'res.genArgs': 'Generator arguments',
    'res.colNo': '#', 'res.colArgs': 'Arguments', 'res.colV': 'Verdict', 'res.colT': 'Time', 'res.colM': 'Memory', 'res.colIn': 'Input size',
    'res.csv': 'Export CSV', 'res.failures': 'Failing tests', 'res.clickRow': 'Click a row to see that test.', 'res.slowest': 'slowest: test #{i}',
    'res.error': 'Runner error: {msg}', 'res.asGraph': 'Open as graph', 'res.savedAt': 'Saved in {dir}',
    'vd.AC': 'Accepted', 'vd.OK': 'Finished', 'vd.WA': 'Wrong answer', 'vd.TLE': 'Time limit', 'vd.MLE': 'Memory limit', 'vd.RE': 'Runtime error',
    'vd.GEN_ERR': 'Generator error', 'vd.BRUTE_ERR': 'Brute force error', 'vd.CHK_ERR': 'Checker error',
  },
});

const TOKEN = ($('meta[name="runner-token"]') || {}).content || '';
const ONLINE = /^https?:$/.test(location.protocol) && TOKEN;
const SLOTS = ['sol', 'brute', 'gen', 'checker'];
const DEFAULT_TEMPLATE = '{compiler} -std={std} {opt} {flags} {src} -o {exe}';
const guessWin = /Windows/i.test(navigator.userAgent);

/* ---------------- state ---------------- */
function defaults(isWin) {
  return {
    slots: {
      sol: { lang: 'cpp', src: '', file: '', io: { in: 'stdin', inName: '', out: 'stdout', outName: '' } },
      brute: { lang: 'cpp', src: '', file: '', io: { in: 'stdin', inName: '', out: 'stdout', outName: '' } },
      gen: { lang: 'cpp', src: '', file: '' },
      checker: { lang: 'cpp', src: '', file: '', args: '{input} {output} {answer}' },
    },
    cur: 'sol',
    compile: { compiler: '', custom: '', std: 'c++17', opt: '-O2', flags: isWin ? '-Wl,--stack=268435456' : '', template: DEFAULT_TEMPLATE, python: isWin ? 'python' : 'python3' },
    run: { mode: 'stress', tl: '1000', ml: '256', count: '500', benchCount: '10', compare: 'tokens', eps: '1e-6', stopFail: true, verify: true },
  };
}
let S = defaults(guessWin);
try {
  const saved = JSON.parse(localStorage.getItem('cpcalc.stress') || 'null');
  if (saved && saved.slots) {
    for (const k of SLOTS) Object.assign(S.slots[k], saved.slots[k] || {});
    Object.assign(S.compile, saved.compile || {});
    Object.assign(S.run, saved.run || {});
    if (SLOTS.includes(saved.cur)) S.cur = saved.cur;
    delete S.slots.gen.io; delete S.slots.gen.args; delete S.run.seed; delete S.run.benchArgs;
  }
} catch (e) { /* ignore */ }
const persist = UI.debounce(() => { try { localStorage.setItem('cpcalc.stress', JSON.stringify(S)); } catch (e) { /* ignore */ } }, 400);

let info = null;           // runner /api/info
const compileState = {};   // slot -> 'ok' | 'bad'

/* ---------------- API ---------------- */
async function api(path, body) {
  const r = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Runner-Token': TOKEN },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({ error: 'HTTP ' + r.status }));
  if (!r.ok) throw new Error(data.error || 'HTTP ' + r.status);
  return data;
}

/* Shared with other tabs (DP Check): same runner connection and compile settings */
window.Runner = {
  get online() { return !!info; },
  get info() { return info; },
  check: () => checkRunner(),
  compile(slot, lang, source) {
    return api('/api/compile', {
      slot, lang, source, compiler: compilerValue(), std: S.compile.std, opt: S.compile.opt,
      flags: S.compile.flags, template: S.compile.template || DEFAULT_TEMPLATE, python: S.compile.python,
    });
  },
  exec(slot, input, args, tl) { return api('/api/exec', { slot, input, args: args || [], tl_ms: tl || 5000 }); },
};

/* ---------------- runner status ---------------- */
async function checkRunner() {
  const ch = $('#runnerChip');
  if (!ONLINE) {
    ch.className = 'chip bad'; ch.textContent = t('rn.off');
    $('#runnerInfo').textContent = location.protocol === 'file:' ? t('rn.file') : '';
    $('#runnerHelp').hidden = false; info = null; renderCompilerSel(); updateNeed(); return;
  }
  ch.className = 'chip neutral'; ch.textContent = t('rn.checking');
  try {
    info = await api('/api/info');
    ch.className = 'chip ok'; ch.textContent = t('rn.ok');
    const tools = info.tools.compilers.length ? info.tools.compilers.map((c) => c.name + ' ' + (c.version.match(/\d+\.\d+(\.\d+)?/) || [''])[0]).join(', ') : t('rn.noCompiler');
    $('#runnerInfo').textContent = t('rn.info', { os: info.os + ' ' + info.osRelease, py: info.python, tools });
    $('#runnerHelp').hidden = true;
    if (!S._osApplied) {
      // First connection: adopt OS-specific defaults unless the user changed them
      const d = defaults(info.isWindows).compile;
      if (S.compile.flags === defaults(!info.isWindows).compile.flags) S.compile.flags = d.flags;
      if (!S.compile.python || S.compile.python === defaults(!info.isWindows).compile.python) S.compile.python = info.tools.python[0] || d.python;
      S._osApplied = true; persist();
    }
  } catch (e) {
    info = null; ch.className = 'chip bad'; ch.textContent = t('rn.off');
    $('#runnerInfo').textContent = e.message; $('#runnerHelp').hidden = false;
  }
  renderCompile(); updateNeed();
  document.dispatchEvent(new CustomEvent('runnerchange'));
}
$('#runnerRetry').onclick = checkRunner;

/* ---------------- slot editor ---------------- */
function saveSlotFromUI() {
  const s = S.slots[S.cur];
  s.src = $('#slotSrc').value; s.lang = $('#slotLang').value;
  if (s.io) {
    if ('in' in s.io) { s.io.in = $('#ioIn').value; s.io.inName = $('#ioInName').value; }
    s.io.out = $('#ioOut').value; s.io.outName = $('#ioOutName').value;
  }
  if ('args' in s) s.args = $('#ioArgs').value;
}
function renderSlot() {
  const k = S.cur, s = S.slots[k];
  $$('#slotTabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.slot === k)));
  $('#slotDesc').textContent = t('slot.d.' + k);
  $('#slotSrc').value = s.src; $('#slotLang').value = s.lang;
  $('#slotFile').textContent = s.file || '';
  const show = (name, on) => { $(`[data-io="${name}"]`).hidden = !on; };
  const io = s.io || {};
  show('in', 'in' in io); show('inName', 'in' in io && io.in === 'file');
  show('out', !!s.io); show('outName', !!s.io && io.out === 'file');
  show('args', 'args' in s);
  if ('in' in io) { $('#ioIn').value = io.in; $('#ioInName').value = io.inName || ''; }
  if (s.io) { $('#ioOut').value = io.out; $('#ioOutName').value = io.outName || ''; }
  if ('args' in s) $('#ioArgs').value = s.args;
  $('#slotIOHint').textContent = k === 'gen' ? t('io.hint.gen') : k === 'checker' ? t('io.hint.checker') : t('io.hint.sol');
  renderDots();
}
function renderDots() {
  SLOTS.forEach((k) => {
    const d = $(`[data-dot="${k}"]`);
    d.className = 'dot' + (S.slots[k].src.trim() ? (compileState[k] === 'ok' ? ' ok' : compileState[k] === 'bad' ? ' bad' : ' has') : '');
  });
}
$('#slotTabs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-slot]'); if (!b) return;
  saveSlotFromUI(); S.cur = b.dataset.slot; renderSlot(); persist();
});
['slotSrc', 'slotLang', 'ioIn', 'ioInName', 'ioOut', 'ioOutName', 'ioArgs'].forEach((id) => {
  $('#' + id).addEventListener('input', () => {
    saveSlotFromUI();
    if (id === 'slotSrc' || id === 'slotLang') delete compileState[S.cur];
    if (id === 'ioIn' || id === 'ioOut') {
      const io = S.slots[S.cur].io;
      if (io.in === 'file' && !io.inName) io.inName = 'input.txt';
      if (io.out === 'file' && !io.outName) io.outName = 'output.txt';
      renderSlot();
    }
    renderDots(); updateNeed(); persist();
  });
});
$('#slotSrc').addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  const ta = e.target, st = ta.selectionStart;
  ta.setRangeText('    ', st, ta.selectionEnd, 'end');
  ta.dispatchEvent(new Event('input'));
});
function loadFile(file) {
  const rd = new FileReader();
  rd.onload = () => {
    const s = S.slots[S.cur];
    s.src = String(rd.result); s.file = file.name;
    if (/\.py$/i.test(file.name)) s.lang = 'py'; else if (/\.(c|cc|cpp|cxx|h|hpp)$/i.test(file.name)) s.lang = 'cpp';
    delete compileState[S.cur]; renderSlot(); updateNeed(); persist();
  };
  rd.readAsText(file);
}
$('#slotLoad').onclick = () => $('#slotFileInput').click();
$('#slotFileInput').onchange = (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) loadFile(f); };
$('#slotSrc').addEventListener('dragover', (e) => { e.preventDefault(); });
$('#slotSrc').addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f) { e.preventDefault(); loadFile(f); } });
$('#slotClear').onclick = () => { const s = S.slots[S.cur]; s.src = ''; s.file = ''; delete compileState[S.cur]; renderSlot(); updateNeed(); persist(); };

const GEN_SAMPLE = `#include <bits/stdc++.h>
using namespace std;
// Trình sinh test: chương trình bình thường, không nhận tham số, in test ra stdout.
// Seed theo thời gian để mỗi lần chạy ra một test khác.
mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());
long long rnd(long long l, long long r) { return uniform_int_distribution<long long>(l, r)(rng); }

int main() {
    int n = rnd(1, 8);                 // giới hạn: sửa thẳng ở đây
    cout << n << "\\n";
    for (int i = 0; i < n; i++) cout << rnd(-10, 10) << " \\n"[i == n - 1];
}
`;
const BRUTE_SAMPLE = `#include <bits/stdc++.h>
using namespace std;
// Code trâu: thử mọi đoạn [l, r], O(n^2)
int main() {
    int n; cin >> n;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    long long best = LLONG_MIN;
    for (int l = 0; l < n; l++) { long long s = 0; for (int r = l; r < n; r++) { s += a[r]; best = max(best, s); } }
    cout << best << "\\n";
}
`;
const SAMPLES = [
  {
    key: 'stdin', vi: 'Ví dụ 1: đọc ghi stdin / stdout', en: 'Example 1: stdin / stdout',
    slots: {
      sol: { src: `// Bài: tổng lớn nhất của một đoạn con liên tiếp khác rỗng.
// Kadane có lỗi: khởi tạo best = 0, sai khi mọi phần tử đều âm.
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    long long best = 0, cur = 0;
    for (long long x : a) { cur = max(x, cur + x); best = max(best, cur); }
    cout << best << "\\n";
}
`, io: { in: 'stdin', inName: '', out: 'stdout', outName: '' } },
      brute: { src: BRUTE_SAMPLE, io: { in: 'stdin', inName: '', out: 'stdout', outName: '' } },
      gen: { src: GEN_SAMPLE },
      checker: { src: '' },
    },
  },
  {
    key: 'file', vi: 'Ví dụ 2: đọc ghi file (BAI.INP / BAI.OUT)', en: 'Example 2: file I/O (BAI.INP / BAI.OUT)',
    slots: {
      sol: { src: `// Cùng bài, nhưng đọc ghi file như nhiều đề thi Việt Nam.
// Ở ô bên dưới đã chọn: Đọc input từ file BAI.INP, Ghi output ra file BAI.OUT (phải khớp với freopen).
#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("BAI.INP", "r", stdin);
    freopen("BAI.OUT", "w", stdout);
    int n; cin >> n;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    long long best = 0, cur = 0;          // cùng lỗi như ví dụ 1
    for (long long x : a) { cur = max(x, cur + x); best = max(best, cur); }
    cout << best << "\\n";
}
`, io: { in: 'file', inName: 'BAI.INP', out: 'file', outName: 'BAI.OUT' } },
      brute: { src: BRUTE_SAMPLE, io: { in: 'stdin', inName: '', out: 'stdout', outName: '' } },
      gen: { src: GEN_SAMPLE },
      checker: { src: '' },
    },
  },
  {
    key: 'checker', vi: 'Ví dụ 3: nhiều đáp án đúng, dùng checker', en: 'Example 3: many correct answers, with a checker',
    slots: {
      sol: { src: `// Bài: in ra vị trí (từ 1) của một phần tử lớn nhất. Có nhiều đáp án đúng nếu có nhiều phần tử bằng nhau.
// Lỗi: khởi tạo mx = 0, sai khi mọi phần tử đều âm.
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<long long> a(n + 1);
    int pos = 1; long long mx = 0;
    for (int i = 1; i <= n; i++) { cin >> a[i]; if (a[i] >= mx) { mx = a[i]; pos = i; } }
    cout << pos << "\\n";
}
`, io: { in: 'stdin', inName: '', out: 'stdout', outName: '' } },
      brute: { src: '', io: { in: 'stdin', inName: '', out: 'stdout', outName: '' } },
      gen: { src: GEN_SAMPLE },
      checker: { src: `// Checker: chạy dạng  checker <input> <output> <answer>
// Trả về 0 nếu output đúng, khác 0 nếu sai (in lý do ra stderr).
#include <bits/stdc++.h>
using namespace std;
int main(int argc, char** argv) {
    ifstream inp(argv[1]), out(argv[2]);
    int n; inp >> n;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) inp >> a[i];
    long long pos;
    if (!(out >> pos)) { cerr << "khong doc duoc output"; return 1; }
    if (pos < 1 || pos > n) { cerr << "vi tri " << pos << " nam ngoai [1, n]"; return 1; }
    long long mx = *max_element(a.begin() + 1, a.end());
    if (a[pos] != mx) { cerr << "a[" << pos << "] = " << a[pos] << " nhung max = " << mx; return 1; }
    return 0;
}
` },
    },
  },
];
function renderSamples() {
  const sel = $('#slotSamples');
  sel.innerHTML = `<option value="">${esc(t('slot.sample'))}</option>` + SAMPLES.map((x, i) => `<option value="${i}">${esc(x[I18N.lang === 'en' ? 'en' : 'vi'])}</option>`).join('');
}
$('#slotSamples').addEventListener('change', (e) => {
  const ex = SAMPLES[e.target.value]; e.target.value = '';
  if (!ex) return;
  for (const k of SLOTS) {
    const d = ex.slots[k];
    Object.assign(S.slots[k], { src: d.src, file: d.src ? 'example_' + k + '.cpp' : '', lang: 'cpp' });
    if (d.io) S.slots[k].io = Object.assign({}, d.io);
    delete compileState[k];
  }
  S.cur = 'sol';
  renderSlot(); updateNeed(); persist();
  UI.toast(ex[I18N.lang === 'en' ? 'en' : 'vi']);
});

/* ---------------- compile settings ---------------- */
function compilerValue() {
  const c = S.compile;
  if (c.compiler === '__custom') return c.custom || 'g++';
  if (c.compiler) return c.compiler;
  if (info && info.tools.compilers.length) return info.tools.compilers[0].in_path ? info.tools.compilers[0].name : info.tools.compilers[0].path;
  return 'g++';
}
function renderCompilerSel() {
  const sel = $('#cpCompiler');
  const opts = [];
  const seen = new Set();
  if (info) info.tools.compilers.forEach((c) => {
    const v = c.in_path ? c.name : c.path;
    if (seen.has(v)) return; seen.add(v);
    opts.push(`<option value="${esc(v)}">${esc(v)} · ${esc((c.version.match(/\d+\.\d+(\.\d+)?/) || [''])[0])} ${esc(t('cp.detected'))}</option>`);
  });
  ['g++', 'clang++'].forEach((v) => { if (!seen.has(v)) { seen.add(v); opts.push(`<option value="${v}">${v} ${info ? esc(t('cp.notFound')) : ''}</option>`); } });
  if (S.compile.compiler && S.compile.compiler !== '__custom' && !seen.has(S.compile.compiler)) opts.push(`<option value="${esc(S.compile.compiler)}">${esc(S.compile.compiler)}</option>`);
  opts.push(`<option value="__custom">${esc(t('cp.customOpt'))}</option>`);
  sel.innerHTML = opts.join('');
  sel.value = S.compile.compiler || (sel.options[0] && sel.options[0].value) || 'g++';
  if (!S.compile.compiler) S.compile.compiler = sel.value;
}
function renderCompile() {
  renderCompilerSel();
  const c = S.compile;
  $('#cpCustomWrap').hidden = c.compiler !== '__custom';
  $('#cpCustom').value = c.custom; $('#cpStd').value = c.std; $('#cpOpt').value = c.opt;
  $('#cpFlags').value = c.flags; $('#cpTemplate').value = c.template; $('#cpPython').value = c.python;
  renderPreview();
}
function renderPreview() {
  const c = S.compile, exe = info && !info.isWindows ? 'sol' : 'sol.exe';
  const v = { compiler: compilerValue(), std: c.std, opt: c.opt, flags: c.flags, src: 'sol.cpp', exe };
  $('#cpPreview').textContent = (c.template || DEFAULT_TEMPLATE).replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m)).replace(/\s+/g, ' ').trim();
}
[['cpCompiler', 'compiler'], ['cpCustom', 'custom'], ['cpStd', 'std'], ['cpOpt', 'opt'], ['cpFlags', 'flags'], ['cpTemplate', 'template'], ['cpPython', 'python']].forEach(([id, key]) => {
  $('#' + id).addEventListener('input', (e) => {
    S.compile[key] = e.target.value;
    Object.keys(compileState).forEach((k) => delete compileState[k]);
    $('#cpCustomWrap').hidden = S.compile.compiler !== '__custom';
    renderPreview(); renderDots(); persist();
  });
});
$('#cpReset').onclick = () => { S.compile = defaults(info ? info.isWindows : guessWin).compile; if (info && info.tools.python[0]) S.compile.python = info.tools.python[0]; renderCompile(); persist(); };

async function compileSlots(list) {
  const log = $('#cpLog');
  const items = [];
  let ok = true;
  log.innerHTML = `<div class="msg note">${esc(t('res.compiling'))}</div>`;
  for (const k of list) {
    const s = S.slots[k];
    const label = t('slot.' + k);
    try {
      const r = await api('/api/compile', {
        slot: k, lang: s.lang, source: s.src, compiler: compilerValue(), std: S.compile.std, opt: S.compile.opt,
        flags: S.compile.flags, template: S.compile.template || DEFAULT_TEMPLATE, python: S.compile.python,
      });
      compileState[k] = r.ok ? 'ok' : 'bad';
      if (!r.ok) ok = false;
      const head = s.lang === 'py' ? t('cp.py', { slot: label }) : r.ok ? (r.cached ? t('cp.cached', { slot: label }) : t('cp.ok', { slot: label, ms: r.time_ms })) : t('cp.err', { slot: label });
      items.push(`<div>${chip(r.ok ? 'ok' : 'bad', head)}${!r.ok || (r.log && r.log.trim()) ? `<pre class="log">${esc((r.cmdline ? '$ ' + r.cmdline + '\n' : '') + r.log)}</pre>` : ''}</div>`);
    } catch (e) {
      ok = false; compileState[k] = 'bad';
      items.push(`<div>${chip('bad', label)} <span class="failmsg">${esc(e.message)}</span></div>`);
    }
    log.innerHTML = `<div class="loglist">${items.join('')}</div>`;
    renderDots();
  }
  return ok;
}
$('#cpCompileAll').onclick = async () => {
  if (!info) { UI.toast(t('need.runner'), 'err'); return; }
  saveSlotFromUI();
  const list = SLOTS.filter((k) => S.slots[k].src.trim());
  if (list.length) await compileSlots(list);
};

/* ---------------- run settings ---------------- */
function renderRun() {
  const r = S.run;
  $$('#modeSeg button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === r.mode)));
  $$('[data-mode-only]').forEach((el) => { el.hidden = el.dataset.modeOnly !== r.mode; });
  $('#modeDesc').textContent = t('rs.d.' + r.mode);
  $('#rsTL').value = r.tl; $('#rsML').value = r.ml; $('#rsCount').value = r.count;
  $('#rsBenchCount').value = r.benchCount; $('#rsCompare').value = r.compare; $('#rsEps').value = r.eps;
  $('#rsStopFail').checked = r.stopFail; $('#rsVerify').checked = r.verify;
  $('#rsEpsWrap').hidden = r.compare !== 'float';
  updateNeed();
}
$('#modeSeg').addEventListener('click', (e) => { const b = e.target.closest('[data-mode]'); if (!b || running) return; S.run.mode = b.dataset.mode; renderRun(); persist(); });
[['rsTL', 'tl'], ['rsML', 'ml'], ['rsCount', 'count'], ['rsBenchCount', 'benchCount'], ['rsCompare', 'compare'], ['rsEps', 'eps']].forEach(([id, key]) => {
  $('#' + id).addEventListener('input', (e) => { S.run[key] = e.target.value; if (key === 'compare') $('#rsEpsWrap').hidden = S.run.compare !== 'float'; persist(); });
});
$('#rsStopFail').addEventListener('change', (e) => { S.run.stopFail = e.target.checked; persist(); });
$('#rsVerify').addEventListener('change', (e) => { S.run.verify = e.target.checked; persist(); updateNeed(); });

function problems() {
  const p = [];
  if (!info) p.push(t('need.runner'));
  if (!S.slots.sol.src.trim()) p.push(t('need.sol'));
  if (!S.slots.gen.src.trim()) p.push(t('need.gen'));
  if (S.run.mode === 'stress' && !S.slots.brute.src.trim() && !S.slots.checker.src.trim()) p.push(t('need.ref'));
  return p;
}
function updateNeed() {
  const p = problems();
  $('#rsNeed').textContent = p.join(' ');
  $('#rsStart').disabled = running || p.length > 0;
}

/* ---------------- running ---------------- */
let running = false, stopFlag = false;
const num = (s, d) => { try { const v = UI.numField(String(s)); return Number.isFinite(v) ? v : d; } catch (e) { return d; } };

function payload(i, verify) {
  const sl = S.slots;
  const useBrute = !!sl.brute.src.trim() && verify;
  const useChk = !!sl.checker.src.trim() && verify;
  return {
    index: i, verify, save: S.run.mode === 'bench',
    gen: { args: '', io: {} },
    sol: { io: sl.sol.io },
    brute: useBrute ? { io: sl.brute.io } : null,
    checker: useChk ? { args: sl.checker.args } : null,
    compare: { mode: S.run.compare, eps: num(S.run.eps, 1e-6) },
    tl_ms: num(S.run.tl, 1000), ml_mb: num(S.run.ml, 256),
  };
}
function vChip(v) {
  const cls = v === 'AC' || v === 'OK' ? 'ok' : v === 'TLE' || v === 'MLE' ? 'warn' : 'bad';
  return chip(cls, v + ' · ' + t('vd.' + v));
}
function timeCls(ms) { const tl = num(S.run.tl, 1000); return ms > tl ? 'bad' : ms > tl / 2 ? 'warn' : 'ok'; }
const fmtMs = (ms) => (ms >= 1000 ? (ms / 1000).toFixed(2) + ' s' : Math.round(ms) + ' ms');
const fmtMb = (mb) => mb.toFixed(mb < 10 ? 2 : 1) + ' MB';

function dl(id, f) { return `/api/saved/${encodeURIComponent(id)}/${f}.txt?token=${encodeURIComponent(TOKEN)}`; }
function testDetail(r) {
  if (!r) return '';
  const pre = (txt, trunc) => `<pre>${esc(txt || '')}${trunc ? '\n' + esc(t('res.truncated')) : ''}</pre>`;
  const dlink = (f) => (r.savedId ? `<a class="btn sm" href="${dl(r.savedId, f)}" download>${esc(t('res.download'))}</a>` : '');
  let h = out(
    kv(t('res.colV'), vChip(r.verdict) + (r.sol ? ` <span class="hint">${esc(fmtMs(r.sol.time_ms))} · ${esc(fmtMb(r.sol.mem_mb))}</span>` : '')) +
    (r.message ? kv(t('res.msg'), `<span class="failmsg">${esc(r.message)}</span>`) : ''));
  h += `<div class="io3">
    <div><div class="lbl">${esc(t('res.input'))}${dlink('input')}</div>${pre(r.inputPreview, r.inputTrunc)}</div>
    <div><div class="lbl">${esc(t('res.output'))}${dlink('output')}</div>${pre(r.outPreview, r.outTrunc)}</div>
    ${r.ansPreview !== undefined ? `<div><div class="lbl">${esc(t('res.answer'))}${dlink('answer')}</div>${pre(r.ansPreview, r.ansTrunc)}</div>` : ''}
  </div>`;
  h += `<div class="row"><button class="btn sm" data-graph="${r.index}">${esc(t('res.asGraph'))}</button>${r.savedId ? `<button class="btn sm" data-open="${esc(r.savedId)}">${esc(t('res.openFolder'))}</button><span class="hint mono">${esc(t('res.savedAt', { dir: r.savedDir }))}</span>` : ''}</div>`;
  return h;
}
$('#resBody').addEventListener('click', async (e) => {
  const gb = e.target.closest('[data-graph]');
  if (gb) { openAsGraph(+gb.dataset.graph); return; }
  const o = e.target.closest('[data-open]');
  if (o) { try { await api('/api/open', { id: o.dataset.open }); } catch (err) { UI.toast(err.message, 'err'); } return; }
  const row = e.target.closest('tr[data-idx]');
  if (row && R.rows) { R.sel = +row.dataset.idx; renderResults(); }
  if (e.target.closest('#csvBtn')) exportCsv();
});

async function openAsGraph(index) {
  const r = (R.rows ? R.rows.filter(Boolean) : R.fails).find((x) => x.index === index);
  if (!r || !window.GraphEditor) return;
  let text = r.inputPreview || '';
  if (r.savedId && r.inputTrunc) {
    try { const res = await fetch(dl(r.savedId, 'input')); if (res.ok) text = await res.text(); } catch (e) { /* keep preview */ }
  }
  window.GraphEditor.openText(t('ge.openFromTest', { i: index }), text);
}

/* results state */
let R = { mode: null };
function renderResults() {
  const body = $('#resBody');
  if (!R.mode) { body.innerHTML = `<div class="empty">${esc(t('res.empty'))}</div>`; $('#resTag').textContent = ''; return; }
  const statusChip = R.state === 'running' ? chip('neutral', t('res.running') + '…') : R.state === 'fail' ? chip('bad', t('res.found')) :
    R.state === 'stopped' ? chip('warn', t('res.stopped')) : R.state === 'compileErr' ? chip('bad', t('cp.err', { slot: '' }).replace(/^:\s*/, '')) : chip('ok', R.mode === 'stress' ? t('res.allOk') : t('res.done'));
  $('#resTag').textContent = R.mode === 'stress' ? t('rs.stress') : t('rs.bench');
  if (R.error) { body.innerHTML = `<div class="msg err">${esc(t('res.error', { msg: R.error }))}</div>`; return; }
  if (R.mode === 'stress') {
    const total = R.total || 0;
    let h = out(
      kv(t('res.status'), statusChip) +
      kv(t('res.passed'), `${R.passed}${total ? ' / ' + total : ''}`, esc(t('res.run', { n: R.ran }))) +
      kv(t('res.maxTime'), R.ran ? `${chip(timeCls(R.maxT), fmtMs(R.maxT))}` : '—', R.ran ? esc(t('res.atTest', { i: R.maxTi })) : '') +
      kv(t('res.maxMem'), R.ran ? esc(fmtMb(R.maxM)) : '—'));
    if (total) h += `<div class="progress"><span style="width:${Math.min(100, R.ran / total * 100)}%"></span></div>`;
    if (R.dupWarn) h += `<div class="msg err">${esc(t('res.dup'))}</div>`;
    if (R.fails.length) {
      if (R.fails.length > 1) h += `<div class="lbl">${esc(t('res.failures'))}: ${R.fails.map((f) => '#' + f.index).join(', ')}</div>`;
      h += testDetail(R.fails[R.fails.length - 1]);
    }
    body.innerHTML = h;
  } else {
    const rows = R.rows;
    const done = rows.filter(Boolean);
    const times = done.filter((r) => r.sol).map((r) => r.sol.time_ms);
    const maxT = times.length ? Math.max(...times) : 0;
    const slow = done.find((r) => r.sol && r.sol.time_ms === maxT);
    const mems = done.filter((r) => r.sol).map((r) => r.sol.mem_mb);
    let h = out(
      kv(t('res.status'), statusChip) +
      kv(t('res.maxTime'), times.length ? chip(timeCls(maxT), fmtMs(maxT)) : '—', slow ? esc(t('res.slowest', { i: slow.index })) : '') +
      kv(t('res.avgTime'), times.length ? esc(fmtMs(times.reduce((a, b) => a + b, 0) / times.length)) : '—') +
      kv(t('res.maxMem'), mems.length ? esc(fmtMb(Math.max(...mems))) : '—'));
    h += `<div class="progress"><span style="width:${done.length / rows.length * 100}%"></span></div>`;
    h += `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${t('res.colNo')}</th><th>${t('res.colV')}</th><th class="num">${t('res.colT')}</th><th class="num">${t('res.colM')}</th><th class="num">${t('res.colIn')}</th></tr></thead><tbody>` +
      rows.map((r, i) => r ? `<tr class="click${R.sel === i ? ' hl' : ''}" data-idx="${i}"><td class="num">${r.index}</td><td>${vChip(r.verdict)}</td>
        <td class="num">${r.sol ? chip(timeCls(r.sol.time_ms), fmtMs(r.sol.time_ms)) : '—'}</td><td class="num">${r.sol ? esc(fmtMb(r.sol.mem_mb)) : '—'}</td><td class="num">${esc(CP.fmtBytes(r.inputBytes || 0))}</td></tr>`
        : `<tr><td class="num">${i + 1}</td><td colspan="4" class="hint">…</td></tr>`).join('') + '</tbody></table></div>';
    h += `<div class="row"><button class="btn sm" id="csvBtn"${done.length ? '' : ' disabled'}>${esc(t('res.csv'))}</button><span class="hint">${esc(t('res.clickRow'))}</span></div>`;
    if (R.sel !== undefined && rows[R.sel]) h += testDetail(rows[R.sel]);
    body.innerHTML = h;
  }
}
function exportCsv() {
  const lines = [['test', 'verdict', 'time_ms', 'wall_ms', 'mem_mb', 'input_bytes', 'message'].join(',')];
  R.rows.filter(Boolean).forEach((r) => {
    const q = (s) => '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"';
    lines.push([r.index, r.verdict, r.sol ? r.sol.time_ms : '', r.sol ? r.sol.wall_ms : '', r.sol ? r.sol.mem_mb : '', r.inputBytes || '', q(r.message)].join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'benchmark.csv';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function setRunning(on) {
  running = on; stopFlag = false;
  $('#rsStop').disabled = !on;
  $$('#modeSeg button').forEach((b) => { b.disabled = on; });
  updateNeed();
}
$('#rsStop').onclick = () => { stopFlag = true; };

$('#rsStart').onclick = async () => {
  saveSlotFromUI(); persist();
  if (problems().length) return;
  const mode = S.run.mode;
  const verify = mode === 'stress' ? true : S.run.verify;
  const need = ['sol', 'gen'];
  if (verify && S.slots.brute.src.trim()) need.push('brute');
  if (verify && S.slots.checker.src.trim()) need.push('checker');
  setRunning(true);
  R = { mode, state: 'running', ran: 0, passed: 0, maxT: 0, maxTi: 0, maxM: 0, fails: [], rows: null };
  $('#resBody').innerHTML = `<div class="empty">${esc(t('res.compiling'))}</div>`;
  const ok = await compileSlots(need);
  if (!ok) { R.state = 'compileErr'; R.mode = null; setRunning(false); $('#resBody').innerHTML = `<div class="msg err">${esc(t('cp.err', { slot: need.filter((k) => compileState[k] === 'bad').map((k) => t('slot.' + k)).join(', ') }))}</div>`; return; }
  try {
    if (mode === 'stress') {
      const total = Math.max(0, Math.floor(num(S.run.count, 500)));
      R.total = total;
      for (let i = 1; (total === 0 || i <= total) && !stopFlag; i++) {
        const r = await api('/api/test', payload(i, true));
        R.ran++;
        // a generator seeded with a constant (or time(0)) keeps printing the same test
        if (r.inputPreview === R.lastInput) R.same = (R.same || 0) + 1; else R.same = 0;
        R.lastInput = r.inputPreview;
        if (R.same >= 4) R.dupWarn = true;
        if (r.sol && r.sol.time_ms >= R.maxT) { R.maxT = r.sol.time_ms; R.maxTi = i; }
        if (r.sol) R.maxM = Math.max(R.maxM, r.sol.mem_mb);
        if (r.verdict === 'AC') R.passed++;
        else {
          R.fails.push(r);
          if (S.run.stopFail) { R.state = 'fail'; break; }
        }
        if (i % 3 === 0 || i === total) renderResults();
      }
      if (R.state === 'running') R.state = stopFlag ? 'stopped' : R.fails.length ? 'fail' : 'done';
    } else {
      const n = Math.max(1, Math.floor(num(S.run.benchCount, 10)));
      R.rows = new Array(n).fill(null);
      renderResults();
      for (let i = 0; i < n && !stopFlag; i++) {
        const r = await api('/api/test', payload(i + 1, verify));
        R.rows[i] = r;
        renderResults();
      }
      R.state = stopFlag ? 'stopped' : R.rows.some((r) => r && !['AC', 'OK'].includes(r.verdict)) ? 'fail' : 'done';
    }
  } catch (e) { R.error = e.message; }
  setRunning(false);
  renderResults();
};

/* ---------------- guide ---------------- */
const G_SOL_STDIN = `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;                 // đọc từ stdin
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    cout << *max_element(a.begin(), a.end()) << "\\n";   // in ra stdout
}`;
const G_SOL_FILE = `#include <bits/stdc++.h>
using namespace std;
int main() {
    freopen("BAI.INP", "r", stdin);  // tên file phải khớp với ô "Tên file input"
    freopen("BAI.OUT", "w", stdout); // và ô "Tên file output"
    int n; cin >> n;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    cout << *max_element(a.begin(), a.end()) << "\\n";
}`;
const G_GEN = `#include <bits/stdc++.h>
using namespace std;
mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());
long long rnd(long long l, long long r) { return uniform_int_distribution<long long>(l, r)(rng); }

int main() {
    int n = rnd(1, 10);              // giới hạn: sửa thẳng ở đây
    cout << n << "\\n";
    for (int i = 0; i < n; i++) cout << rnd(-10, 10) << " \\n"[i == n - 1];
}`;
const G_GEN_MORE = `// Hoán vị 1..n
vector<int> p(n); iota(p.begin(), p.end(), 1); shuffle(p.begin(), p.end(), rng);

// Cây n đỉnh ngẫu nhiên (in n-1 cạnh)
for (int v = 2; v <= n; v++) cout << rnd(1, v - 1) << " " << v << "\\n";

// Đồ thị n đỉnh m cạnh, không cạnh lặp, không khuyên
set<pair<int,int>> used;
while ((int)used.size() < m) {
    int u = rnd(1, n), v = rnd(1, n);
    if (u == v || used.count({min(u, v), max(u, v)})) continue;
    used.insert({min(u, v), max(u, v)});
    cout << u << " " << v << "\\n";
}

// Chuỗi độ dài n chỉ gồm 'a', 'b'
string s(n, 'a'); for (auto &c : s) c = 'a' + rnd(0, 1);`;
const G_GEN_PY = `import random
n = random.randint(1, 10)            # random tự seed theo thời gian
print(n)
print(*[random.randint(-10, 10) for _ in range(n)])`;
const G_CHECKER = `#include <bits/stdc++.h>
using namespace std;
// Chạy dạng: checker <input> <output> <answer>
//   input  = test, output = output của code cần kiểm tra, answer = output của code trâu (rỗng nếu không có)
// Trả về 0 nếu đúng; khác 0 nếu sai, in lý do ra stderr (hiện ở phần Chi tiết).
int main(int argc, char** argv) {
    ifstream inp(argv[1]), out(argv[2]), ans(argv[3]);
    long long n; inp >> n;
    long long got, expected;
    if (!(out >> got)) { cerr << "khong doc duoc output"; return 1; }
    ans >> expected;
    if (got != expected) { cerr << "doc duoc " << got << ", dap an " << expected; return 1; }
    return 0;
}`;
function codeBlock(code) {
  return `<div class="gd-code"><button class="btn sm" data-copy="${esc(code)}">${esc(t('gd.copy'))}</button><pre class="log">${esc(code)}</pre></div>`;
}
function renderGuide() {
  const en = I18N.lang === 'en';
  const T = (vi, enT) => (en ? enT : vi);
  $('#stressGuideBody').innerHTML = `
  <div class="gd">
    <section><h4>${T('1. Stress test chạy thế nào', '1. How a stress test runs')}</h4>
      <ol class="steps-list">
        <li>${T('Chạy <b>Sinh test</b> → được một test (input).', 'Run the <b>Generator</b> → one test (input).')}</li>
        <li>${T('Chạy <b>Code cần kiểm tra</b> và <b>Code trâu</b> với cùng input đó.', 'Run the <b>Solution</b> and the <b>Brute force</b> on that input.')}</li>
        <li>${T('So hai output (hoặc hỏi <b>Checker</b>). Giống nhau thì lặp lại với test mới, khác nhau thì dừng và hiện test sai.', 'Compare the outputs (or ask the <b>Checker</b>). Same → next test; different → stop and show the failing test.')}</li>
      </ol>
      <p class="hint">${T('Không biết bắt đầu từ đâu? Chọn "Nạp ví dụ…" ở ô Chương trình rồi bấm Bắt đầu.', 'Not sure where to start? Pick "Load an example…" in Programs and press Start.')}</p>
    </section>
    <section><h4>${T('2. Code cần kiểm tra và code trâu: stdin hay file', '2. Solution and brute force: stdin or files')}</h4>
      <p>${T('<b>Đọc ghi stdin / stdout</b> (mặc định): để nguyên "Đọc input từ: stdin", "Ghi output ra: stdout".', '<b>stdin / stdout</b> (default): keep "Read input from: stdin" and "Write output to: stdout".')}</p>
      ${codeBlock(G_SOL_STDIN)}
      <p>${T('<b>Đọc ghi file</b> (freopen): chọn "Đọc input từ: file" và "Ghi output ra: file", rồi điền <b>đúng tên file</b> như trong code (ví dụ BAI.INP, BAI.OUT). Để trống thì là input.txt / output.txt. Mỗi chương trình đặt riêng: code trâu vẫn dùng stdin được.', '<b>Files</b> (freopen): choose "file" for both, then type <b>exactly the file names</b> used in the code (e.g. BAI.INP, BAI.OUT). Empty means input.txt / output.txt. Each program has its own setting: the brute force can still use stdin.')}</p>
      ${codeBlock(G_SOL_FILE)}
    </section>
    <section><h4>${T('3. Sinh test', '3. Generator')}</h4>
      <p>${T('Là một chương trình bình thường, biên dịch như thường, <b>không nhận tham số</b>, chỉ in một test ra stdout. Muốn đổi giới hạn (n, giá trị…) thì sửa thẳng trong code. Seed <code>mt19937</code> bằng đồng hồ để mỗi lần chạy ra test khác. Đừng dùng <code>srand(time(0))</code>: nó đổi theo giây nên nhiều lần chạy liền nhau ra cùng một test.', 'A normal program, compiled as usual, <b>with no arguments</b>, that prints one test to stdout. Change the limits (n, values…) directly in the code. Seed <code>mt19937</code> with the clock so every run differs. Avoid <code>srand(time(0))</code>: it changes once per second, so consecutive runs repeat the same test.')}</p>
      ${codeBlock(G_GEN)}
      <p>${T('Mẹo: để n nhỏ (5 đến 10) thì test sai dễ đọc. Vài đoạn hay dùng:', 'Tip: keep n small (5 to 10) so a failing test is easy to read. Handy snippets:')}</p>
      ${codeBlock(G_GEN_MORE)}
      <p>${T('Viết bằng Python cũng được (chọn Ngôn ngữ: Python):', 'Python works too (Language: Python):')}</p>
      ${codeBlock(G_GEN_PY)}
    </section>
    <section><h4>${T('4. So output và checker', '4. Comparing outputs and checkers')}</h4>
      <p>${T('Không có checker thì output được so với code trâu theo ô "Cách so output": bỏ qua khoảng trắng (mặc định), theo dòng, đúng từng byte, hoặc số thực sai số ε.', 'Without a checker, outputs are compared with the brute force using "Output comparison": ignore whitespace (default), line by line, exact bytes, or floats within ε.')}</p>
      <p>${T('Bài có nhiều đáp án đúng thì cần <b>checker</b>. Checker trả về 0 là đúng; khi đó không bắt buộc có code trâu (Ví dụ 3).', 'Problems with several correct answers need a <b>checker</b>. It returns 0 for correct; then a brute force is optional (Example 3).')}</p>
      ${codeBlock(G_CHECKER)}
    </section>
    <section><h4>${T('5. Đọc kết quả', '5. Reading the results')}</h4>
      <ul class="steps-list">
        <li><b>AC</b> ${T('đúng', 'correct')} · <b>WA</b> ${T('sai, xem "Chi tiết" để biết token / dòng khác nhau đầu tiên', 'wrong, see "Details" for the first differing token / line')}</li>
        <li><b>TLE / MLE</b> ${T('quá thời gian / bộ nhớ đặt ở ô Time limit, Memory limit', 'over the Time / Memory limit you set')}</li>
        <li><b>RE</b> ${T('chương trình lỗi khi chạy, kèm lý do (Stack overflow, Access violation, chia cho 0…)', 'the program crashed, with the reason (Stack overflow, Access violation, division by zero…)')}</li>
        <li><b>${T('Lỗi trình sinh / code trâu / checker', 'Generator / brute force / checker error')}</b> ${T('chính các chương trình đó bị lỗi, không phải code cần kiểm tra', 'those programs failed, not your solution')}</li>
      </ul>
      <p class="hint">${T('Test sai được lưu trong cp-calc/work/saved/, có nút tải input / output / đáp án và nút "Mở dạng đồ thị".', 'Failing tests are saved in cp-calc/work/saved/, with download buttons and "Open as graph".')}</p>
    </section>
  </div>`;
}
I18N.add({ vi: { 'gd.title': 'Hướng dẫn & code mẫu', 'gd.sub': 'stdin, đọc ghi file, sinh test, checker', 'gd.copy': 'Chép' },
  en: { 'gd.title': 'Guide & code templates', 'gd.sub': 'stdin, file I/O, generators, checkers', 'gd.copy': 'Copy' } });
renderGuide(); renderSamples();
I18N.onChange(() => { renderGuide(); renderSamples(); });

/* ---------------- init ---------------- */
renderSlot(); renderCompile(); renderRun(); renderResults();
I18N.onChange(() => { renderSlot(); renderCompile(); renderRun(); renderResults(); if (info) checkRunner(); else checkRunner(); });
if (UI.HOSTED) {
  const tab = $('#tab-stress');
  [...tab.querySelector('.content').children].forEach((el) => el.classList.add('hosted-off'));
  tab.querySelector('.content').insertAdjacentHTML('afterbegin', UI.hostedNotice());
  I18N.apply(tab);
} else checkRunner();
})();
