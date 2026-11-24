/* Calculator → Base converter: edit any field, the others follow. Exact (BigInt), any size. */
(function () {
'use strict';
const { $, $$, esc } = UI;

I18N.add({
  vi: {
    'calc.nav.base': 'Đổi cơ số',
    'bs.title': 'Đổi cơ số', 'bs.desc': 'Gõ vào ô nào cũng được, các ô còn lại tự đổi theo. Số nguyên chính xác, dài bao nhiêu cũng được. Dấu cách, _ và \' được bỏ qua; ô thập phân nhận cả biểu thức như 2^40 - 1.',
    'bs.width': 'Độ rộng bit', 'bs.widthNone': 'Không (có dấu −)', 'bs.custom': 'Cơ số tuỳ chọn (2 đến 36)',
    'bs.b2': 'Nhị phân (2)', 'bs.b8': 'Bát phân (8)', 'bs.b10': 'Thập phân (10)', 'bs.b16': 'Thập lục phân (16)', 'bs.bk': 'Cơ số {k}',
    'bs.copy': 'Chép', 'bs.bad': 'Chữ số "{d}" không hợp lệ ở cơ số {b}', 'bs.empty': 'Chưa có số',
    'bs.bits': 'Số bit', 'bs.pop': 'Số bit 1', 'bs.unsigned': 'Không dấu ({w} bit)', 'bs.signed': 'Có dấu ({w} bit)',
    'bs.range': 'Không vừa {w} bit: cần trong [{lo}, {hi}]', 'bs.twos': 'Số âm hiện theo bù 2 với {w} bit (như C++).',
  },
  en: {
    'calc.nav.base': 'Base converter',
    'bs.title': 'Base converter', 'bs.desc': 'Type in any field and the others follow. Exact integers of any length. Spaces, _ and \' are ignored; the decimal field also takes expressions like 2^40 - 1.',
    'bs.width': 'Bit width', 'bs.widthNone': 'None (use a − sign)', 'bs.custom': 'Custom base (2 to 36)',
    'bs.b2': 'Binary (2)', 'bs.b8': 'Octal (8)', 'bs.b10': 'Decimal (10)', 'bs.b16': 'Hexadecimal (16)', 'bs.bk': 'Base {k}',
    'bs.copy': 'Copy', 'bs.bad': 'Digit "{d}" is not valid in base {b}', 'bs.empty': 'No number yet',
    'bs.bits': 'Bit length', 'bs.pop': 'Set bits', 'bs.unsigned': 'Unsigned ({w}-bit)', 'bs.signed': 'Signed ({w}-bit)',
    'bs.range': 'Does not fit in {w} bits: must be in [{lo}, {hi}]', 'bs.twos': 'Negative numbers are shown in {w}-bit two\'s complement (as in C++).',
  },
});

const DIG = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const PREFIX = { 2: /^0b/i, 8: /^0o/i, 16: /^0x/i };
let value = 0n;   // the current number (signed)

function customBase() { const k = parseInt($('#bsK').value, 10); return k >= 2 && k <= 36 ? k : null; }
function width() { const w = parseInt($('#bsW').value, 10); return w > 0 ? w : null; }

/* digits of x ≥ 0 in base b */
function toBase(x, b) {
  if (b === 2 || b === 8 || b === 10 || b === 16 || b === 36) return x.toString(b).toUpperCase();
  if (x === 0n) return '0';
  const B = BigInt(b); let out = '';
  while (x > 0n) { out = DIG[Number(x % B)] + out; x /= B; }
  return out;
}
function fromBase(text, b) {
  let s = text.replace(/[\s_']/g, '').toUpperCase();
  let neg = false;
  if (s.startsWith('-')) { neg = true; s = s.slice(1); } else if (s.startsWith('+')) s = s.slice(1);
  if (PREFIX[b] && PREFIX[b].test(s)) s = s.slice(2);
  if (!s) throw { key: 'bs.empty' };
  const B = BigInt(b); let x = 0n;
  for (const ch of s) {
    const d = DIG.indexOf(ch);
    if (d < 0 || d >= b) throw { key: 'bs.bad', p: { d: ch, b } };
    x = x * B + BigInt(d);
  }
  return neg ? -x : x;
}
const group = (s, k) => { const out = []; for (let i = s.length; i > 0; i -= k) out.unshift(s.slice(Math.max(0, i - k), i)); return out.join(' '); };

/* how a value is shown in base b (with the bit width, negatives become two's complement) */
function show(x, b) {
  const w = width();
  const fits = w && x >= -(1n << BigInt(w - 1)) && x < (1n << BigInt(w));
  if (fits && b !== 10) {
    const mask = (1n << BigInt(w)) - 1n;
    let s = toBase(x & mask, b);
    if (b === 2) s = s.padStart(w, '0');
    else if (b === 16) s = s.padStart(Math.ceil(w / 4), '0');
    else if (b === 8) s = s.padStart(Math.ceil(w / 3), '0');
    return b === 2 ? group(s, 4) : b === 16 ? group(s, 4) : s;
  }
  const s = toBase(x < 0n ? -x : x, b);
  return (x < 0n ? '-' : '') + (b === 2 ? group(s, 4) : s);
}

function fields() {
  const k = customBase();
  return [['b2', 2], ['b8', 8], ['b10', 10], ['b16', 16]].concat(k ? [['bk', k]] : []);
}
function render() {
  const k = customBase();
  $('#bsRows').innerHTML = fields().map(([id, b]) => `
    <div class="bs-row">
      <label for="bs-${id}">${esc(id === 'bk' ? t('bs.bk', { k }) : t('bs.' + id))}</label>
      <input class="input mono" id="bs-${id}" data-base="${b}" spellcheck="false" autocomplete="off">
      <button class="btn sm" data-copy="${id}">${esc(t('bs.copy'))}</button>
      <div class="bs-err" id="bs-${id}-err"></div>
    </div>`).join('');
  refresh(null);
}
/* update every field except the one being typed in */
function refresh(except) {
  fields().forEach(([id, b]) => {
    const el = $('#bs-' + id); if (!el || id === except) return;
    el.value = show(value, b); el.classList.remove('err'); $('#bs-' + id + '-err').textContent = '';
  });
  info();
}
function info() {
  const w = width(), x = value, rows = [];
  const mag = x < 0n ? -x : x;
  if (!w) rows.push([t('bs.bits'), x === 0n ? '0' : String(mag.toString(2).length)]);
  if (w) {
    const W = BigInt(w), lo = -(1n << (W - 1n)), hi = (1n << W) - 1n;
    if (x < lo || x > hi) { $('#bsInfo').innerHTML = `<div class="msg err">${esc(t('bs.range', { w, lo: String(lo), hi: String(hi) }))}</div>`; return; }
    const u = x & ((1n << W) - 1n), sg = u >= (1n << (W - 1n)) ? u - (1n << W) : u;
    rows.push([t('bs.bits'), u === 0n ? '0' : String(u.toString(2).length)], [t('bs.pop'), String([...u.toString(2)].filter((c) => c === '1').length)]);
    rows.push([t('bs.unsigned', { w }), String(u)], [t('bs.signed', { w }), String(sg)]);
  } else if (x >= 0n) rows.push([t('bs.pop'), String([...x.toString(2)].filter((c) => c === '1').length)]);
  $('#bsInfo').innerHTML = UI.out(rows.map(([a, b]) => UI.kv(esc(a), esc(b))).join('')) +
    (w ? `<p class="hint">${esc(t('bs.twos', { w }))}</p>` : '');
}

$('#bsRows').addEventListener('input', (e) => {
  const el = e.target.closest('input[data-base]'); if (!el) return;
  const b = Number(el.dataset.base), id = el.id.slice(3), err = $('#bs-' + id + '-err');
  try {
    let x;
    if (b === 10 && /[^\d\s_'+-]/.test(el.value)) x = CP.toBigInt(CP.unwrap(CP.evaluate(CP.parse(el.value), {})), t('bs.b10'));
    else x = fromBase(el.value, b);
    // with a bit width, a non-decimal pattern is read as w-bit two's complement
    const w = width();
    if (w && b !== 10 && x >= 0n && x < (1n << BigInt(w)) && x >= (1n << BigInt(w - 1))) x -= 1n << BigInt(w);
    value = x;
    el.classList.remove('err'); err.textContent = '';
    refresh(id);
  } catch (ex) {
    el.classList.add('err');
    err.textContent = ex.key && ex.key.startsWith('bs.') ? t(ex.key, ex.p || {}) : UI.errMsg(ex);
  }
});
$('#bsRows').addEventListener('click', (e) => {
  const c = e.target.closest('[data-copy]'); if (!c) return;
  UI.copy($('#bs-' + c.dataset.copy).value.replace(/\s+/g, ''));
});
$('#bsK').addEventListener('input', render);
$('#bsW').addEventListener('change', () => refresh(null));
I18N.onChange(render);

value = 255n;
render();
})();
