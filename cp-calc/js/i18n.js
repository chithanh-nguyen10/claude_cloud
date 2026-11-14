/* Song ngữ VI/EN. Mỗi module tự đăng ký chuỗi qua I18N.add({vi:{}, en:{}}). */
(function (global) {
'use strict';
const dict = { vi: {}, en: {} };
let lang = 'vi';
try { const s = localStorage.getItem('cpcalc.lang'); if (s === 'en' || s === 'vi') lang = s; } catch (e) { /* ignore */ }

function add(d) { for (const l of Object.keys(d)) Object.assign(dict[l] || (dict[l] = {}), d[l]); }
function t(key, params) {
  let s = dict[lang][key];
  if (s === undefined) s = dict.vi[key] !== undefined ? dict.vi[key] : key;
  if (params && typeof s === 'string') s = s.replace(/\{(\w+)\}/g, (m, k) => (params[k] !== undefined ? params[k] : m));
  return s;
}
function apply(root) {
  root = root || document;
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  root.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  document.documentElement.lang = lang;
}
const listeners = [];
function setLang(l) {
  lang = l;
  try { localStorage.setItem('cpcalc.lang', l); } catch (e) { /* ignore */ }
  apply();
  listeners.forEach((f) => f(l));
}
function onChange(f) { listeners.push(f); }

add({
  vi: {
    'tab.calc': 'Calculator', 'tab.safety': 'An toàn', 'tab.stress': 'Stress test & Benchmark', 'tab.graph': 'Graph Editor',
    'judge.title': 'Máy chấm', 'judge.tl': 'Time limit', 'judge.speed': 'Tốc độ (phép/giây)',
    'judge.hint': 'Dùng để kết luận 🟢🟡🔴 cho mọi ước lượng. 1e8 là an toàn, máy chấm hiện đại thường 2e8 đến 5e8 phép đơn giản/giây.',
    'v.ok': 'An toàn', 'v.warn': 'Sát TL', 'v.bad': 'TLE',
    'copied': 'Đã chép: {v}', 'exact': 'chính xác', 'approx': 'xấp xỉ',
    'err.badNumber': 'Số không hợp lệ ở vị trí {at}', 'err.badChar': 'Ký tự "{ch}" không hợp lệ ở vị trí {at}',
    'err.expected': 'Thiếu "{what}" ở vị trí {at}', 'err.unexpectedEnd': 'Biểu thức chưa kết thúc',
    'err.unexpected': 'Không mong đợi "{tok}" ở vị trí {at}', 'err.divZero': 'Chia cho 0',
    'err.needInt': '{fn} cần số nguyên', 'err.needPositive': '{fn} cần số dương',
    'err.tooBig': '{fn}: giá trị quá lớn (tối đa {max})', 'err.arity': '{fn} cần {n} tham số',
    'err.unknownVar': 'Chưa định nghĩa biến "{name}"', 'err.unknownFn': 'Không có hàm "{name}"',
    'err.varFormat': 'Viết biến dạng "tên = giá trị": "{part}"', 'err.notFinite': 'Kết quả không hữu hạn',
    'err.generic': 'Lỗi: {msg}', 'err.noPrime': 'Không có số nguyên tố nhỏ hơn {n}', 'err.notNumber': 'Kết quả "{what}" là phân tích, không dùng để tính tiếp được', 'err.notArray': '"{name}" không phải mảng (hoặc truy cập quá số chiều)', 'err.index': 'Chỉ số {i} nằm ngoài mảng {name}',
  },
  en: {
    'tab.calc': 'Calculator', 'tab.safety': 'Safety', 'tab.stress': 'Stress test & Benchmark', 'tab.graph': 'Graph Editor',
    'judge.title': 'Judge', 'judge.tl': 'Time limit', 'judge.speed': 'Speed (ops/sec)',
    'judge.hint': 'Used for every 🟢🟡🔴 verdict. 1e8 is safe; modern judges run about 2e8 to 5e8 simple ops/sec.',
    'v.ok': 'Safe', 'v.warn': 'Tight', 'v.bad': 'TLE',
    'copied': 'Copied: {v}', 'exact': 'exact', 'approx': 'approx.',
    'err.badNumber': 'Invalid number at position {at}', 'err.badChar': 'Invalid character "{ch}" at position {at}',
    'err.expected': 'Expected "{what}" at position {at}', 'err.unexpectedEnd': 'Expression is incomplete',
    'err.unexpected': 'Unexpected "{tok}" at position {at}', 'err.divZero': 'Division by zero',
    'err.needInt': '{fn} needs an integer', 'err.needPositive': '{fn} needs a positive number',
    'err.tooBig': '{fn}: value too large (max {max})', 'err.arity': '{fn} takes {n} argument(s)',
    'err.unknownVar': 'Variable "{name}" is not defined', 'err.unknownFn': 'Unknown function "{name}"',
    'err.varFormat': 'Write variables as "name = value": "{part}"', 'err.notFinite': 'Result is not finite',
    'err.generic': 'Error: {msg}', 'err.noPrime': 'There is no prime below {n}', 'err.notNumber': '"{what}" is a factorization and cannot be used in further arithmetic', 'err.notArray': '"{name}" is not an array (or has fewer dimensions)', 'err.index': 'Index {i} is outside array {name}',
  },
});

global.I18N = { add, t, apply, setLang, onChange, get lang() { return lang; } };
global.t = t;
})(window);
