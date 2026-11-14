/* Khởi động: tab, mục con, ngôn ngữ, thanh Máy chấm */
(function () {
'use strict';
const { $, $$ } = UI;
const TABS = ['calc', 'num', 'safety', 'stress', 'graph', 'dp'];

function showTab(name) {
  $$('.tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
  $$('[data-tabpanel]').forEach((p) => { p.hidden = p.dataset.tabpanel !== name; });
  try { if (location.hash !== '#' + name) history.replaceState(null, '', '#' + name); } catch (e) { /* file:// may refuse */ }
  document.dispatchEvent(new CustomEvent('tabshow', { detail: name }));
}
window.showTab = showTab;
$$('.tab').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));

/* Sub navigation inside a tab */
function wireSubnav(nav) {
  const panel = nav.closest('[data-tabpanel]');
  nav.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sec]'); if (!b) return;
    $$('[data-sec]', nav).forEach((x) => x.setAttribute('aria-current', String(x === b)));
    $$('[data-sec-panel]', panel).forEach((p) => { p.hidden = p.dataset.secPanel !== b.dataset.sec; });
    window.scrollTo({ top: 0 });
  });
}
$$('[data-subnav]').forEach(wireSubnav);

/* Theme: light / dark (GitHub Dark) / follow the system */
function applyTheme(th) {
  if (th === 'light' || th === 'dark') document.documentElement.dataset.theme = th;
  else delete document.documentElement.dataset.theme;
  $$('#themeSwitch [data-th]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.th === (th || 'system'))));
  try { if (th === 'light' || th === 'dark') localStorage.setItem('cpcalc.theme', th); else localStorage.removeItem('cpcalc.theme'); } catch (e) { /* ignore */ }
  document.dispatchEvent(new CustomEvent('themechange'));
}
$('#themeSwitch').addEventListener('click', (e) => { const b = e.target.closest('[data-th]'); if (b) applyTheme(b.dataset.th); });
applyTheme(document.documentElement.dataset.theme || 'system');

/* Language */
function syncLangButtons() { $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === I18N.lang))); }
$$('.lang button').forEach((b) => b.addEventListener('click', () => { I18N.setLang(b.dataset.lang); syncLangButtons(); }));
syncLangButtons();
I18N.apply();

/* Judge settings → re-run every calculator card */
const rerun = UI.debounce(() => UI._runners.forEach((f) => f()), 150);
['jTL', 'jSpeed'].forEach((id) => $('#' + id).addEventListener('input', rerun));

const start = (location.hash || '').slice(1);
if (TABS.includes(start)) showTab(start);
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (TABS.includes(h)) showTab(h); });
})();
