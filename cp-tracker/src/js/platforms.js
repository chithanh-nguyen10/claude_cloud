/* CP Tracker — nhận diện link bài và lấy thông tin bài cho từng nền tảng.
 * Không phụ thuộc giao diện: hàm fetchText(url) được truyền vào (Tauri / trình duyệt / test). */
(function (global) {
'use strict';

const PLATFORMS = {
  cf: { name: 'Codeforces', short: 'CF', color: '#1f8acb' },
  atcoder: { name: 'AtCoder', short: 'AC', color: '#222222' },
  ojuz: { name: 'oj.uz', short: 'oj.uz', color: '#4a6fa5' },
  csa: { name: 'CS Academy', short: 'CSA', color: '#3fa34d' },
  codechef: { name: 'CodeChef', short: 'CC', color: '#5b4638' },
  dmoj: { name: 'DMOJ', short: 'DMOJ', color: '#ad6c1a' },
  vnoj: { name: 'VNOJ', short: 'VNOJ', color: '#c0392b' },
  other: { name: 'Other', short: '—', color: '#8b8d98' },
};

/* Parse a link (or a short code like "CF1900A") → { platform, pid, url, extra } or null */
function parseLink(input) {
  let s = String(input || '').trim();
  if (!s) return null;
  // short codes
  let m = s.match(/^cf\s*(\d+)\s*([A-Za-z]\d?)$/i);
  if (m) return cf(m[1], m[2].toUpperCase(), false);
  if (!/^https?:\/\//i.test(s) && /^[\w.-]+\.[a-z]{2,}\//i.test(s)) s = 'https://' + s;
  let u;
  try { u = new URL(s); } catch (e) { return null; }
  const host = u.hostname.replace(/^www\./, '').toLowerCase();
  const path = u.pathname.replace(/\/+$/, '');
  if (/(^|\.)codeforces\.(com|ml|net)$|^codeforc\.es$|^m[123]\.codeforces\.com$/.test(host) || host.endsWith('codeforces.com')) {
    if ((m = path.match(/^\/problemset\/problem\/(\d+)\/([A-Za-z]\d?)$/i))) return cf(m[1], m[2].toUpperCase(), false);
    if ((m = path.match(/^\/contest\/(\d+)\/problem\/([A-Za-z]\d?)$/i))) return cf(m[1], m[2].toUpperCase(), false);
    if ((m = path.match(/^\/gym\/(\d+)\/problem\/([A-Za-z]\d?)$/i))) return cf(m[1], m[2].toUpperCase(), true);
    if ((m = path.match(/^\/group\/(\w+)\/contest\/(\d+)\/problem\/([A-Za-z]\d?)$/i))) {
      return { platform: 'cf', pid: 'group/' + m[1] + '/' + m[2] + m[3].toUpperCase(), url: `https://codeforces.com/group/${m[1]}/contest/${m[2]}/problem/${m[3].toUpperCase()}`, extra: { group: m[1], contest: m[2], index: m[3].toUpperCase(), gym: true } };
    }
    return null;
  }
  if (host === 'atcoder.jp') {
    if ((m = path.match(/^\/contests\/([\w-]+)\/tasks\/([\w-]+)$/))) {
      return { platform: 'atcoder', pid: m[2], url: `https://atcoder.jp/contests/${m[1]}/tasks/${m[2]}`, extra: { contest: m[1] } };
    }
    return null;
  }
  if (host === 'oj.uz') {
    if ((m = path.match(/^\/problem\/(?:view|submit)\/([\w-]+)$/))) return { platform: 'ojuz', pid: m[1], url: `https://oj.uz/problem/view/${m[1]}`, extra: {} };
    return null;
  }
  if (host === 'csacademy.com') {
    if ((m = path.match(/^\/contest\/([\w-]+)\/task\/([\w-]+)$/))) return { platform: 'csa', pid: m[2], url: `https://csacademy.com/contest/${m[1]}/task/${m[2]}/`, extra: { contest: m[1] } };
    return null;
  }
  if (host === 'codechef.com') {
    if ((m = path.match(/^(?:\/([\w-]+))?\/problems\/([\w-]+)$/i))) {
      const code = m[2].toUpperCase();
      return { platform: 'codechef', pid: code, url: `https://www.codechef.com/problems/${code}`, extra: { contest: m[1] || '' } };
    }
    return null;
  }
  if (host === 'dmoj.ca') {
    if ((m = path.match(/^\/problem\/([\w-]+)$/))) return { platform: 'dmoj', pid: m[1], url: `https://dmoj.ca/problem/${m[1]}`, extra: {} };
    return null;
  }
  if (host === 'oj.vnoi.info') {
    if ((m = path.match(/^\/problem\/([\w-]+)$/))) return { platform: 'vnoj', pid: m[1], url: `https://oj.vnoi.info/problem/${m[1]}`, extra: {} };
    return null;
  }
  return null;
}
function cf(contest, index, gym) {
  return {
    platform: 'cf', pid: (gym ? 'gym' : '') + contest + index,
    url: `https://codeforces.com/${gym ? 'gym' : 'contest'}/${contest}/problem/${index}`,
    extra: { contest, index, gym },
  };
}
function keyOf(p) { return p.platform + ':' + p.pid.toLowerCase(); }

/* AtCoder Problems clips low difficulties so they stay positive */
function atcoderDiff(d) { return d >= 400 ? Math.round(d) : Math.round(400 / Math.exp((400 - d) / 400)); }
function titleCase(slug) { return slug.split(/[-_]/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' '); }
function pyList(s) { if (Array.isArray(s)) return s.map(String); return [...String(s || '').matchAll(/'([^']+)'/g)].map((m) => m[1]); }
function decodeEntities(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (m, c) => String.fromCharCode(+c));
}

/* Metadata fetchers. Each returns { title, difficulty, diffLabel, tags, note } (fields may be missing).
   `ctx` caches big lists (Codeforces problemset, AtCoder lists) for the session. */
async function fetchMeta(p, fetchText, ctx) {
  ctx = ctx || {};
  const json = async (url) => JSON.parse(await fetchText(url));
  switch (p.platform) {
    case 'cf': {
      if (p.extra.gym) return { title: `${p.extra.group ? 'Group' : 'Gym'} ${p.extra.contest} ${p.extra.index}`, note: 'manualTitle' };
      if (!ctx.cfProblems) {
        const d = await json('https://codeforces.com/api/problemset.problems');
        if (d.status !== 'OK') throw new Error(d.comment || 'Codeforces API error');
        ctx.cfProblems = new Map(d.result.problems.map((x) => [x.contestId + x.index, x]));
      }
      let x = ctx.cfProblems.get(p.extra.contest + p.extra.index);
      if (!x) {
        // very new contests are not in the problemset yet
        const d = await json(`https://codeforces.com/api/contest.standings?contestId=${p.extra.contest}`);
        if (d.status === 'OK') x = d.result.problems.find((q) => q.index === p.extra.index);
      }
      if (!x) throw new Error('notFound');
      return { title: x.name, difficulty: x.rating || null, diffLabel: x.rating ? String(x.rating) : '', tags: x.tags || [] };
    }
    case 'atcoder': {
      if (!ctx.acProblems) {
        const [probs, models] = await Promise.all([json('https://kenkoooo.com/atcoder/resources/problems.json'), json('https://kenkoooo.com/atcoder/resources/problem-models.json')]);
        ctx.acProblems = new Map(probs.map((x) => [x.id, x]));
        ctx.acModels = models;
      }
      const x = ctx.acProblems.get(p.pid);
      if (!x) throw new Error('notFound');
      const mdl = ctx.acModels[p.pid];
      const d = mdl && typeof mdl.difficulty === 'number' ? atcoderDiff(mdl.difficulty) : null;
      return { title: x.name, difficulty: d, diffLabel: d === null ? '' : String(d), tags: [] };
    }
    case 'dmoj': case 'vnoj': {
      const host = p.platform === 'dmoj' ? 'https://dmoj.ca' : 'https://oj.vnoi.info';
      try {
        const d = await json(`${host}/api/v2/problem/${p.pid}`);
        const o = d.data && d.data.object;
        if (!o) throw new Error('notFound');
        return { title: o.name, difficulty: typeof o.points === 'number' ? o.points : null, diffLabel: typeof o.points === 'number' ? o.points + 'p' : '', tags: (o.types || []).concat(o.group && o.group !== 'Uncategorized' ? [o.group] : []) };
      } catch (e) {
        // VNOJ sits behind Cloudflare and often refuses programs: keep the code as the title
        if (p.platform === 'vnoj') return { title: p.pid, note: 'manualTitle' };
        throw e;
      }
    }
    case 'codechef': {
      const d = await json(`https://www.codechef.com/api/contests/PRACTICE/problems/${p.pid}`);
      if (d.status !== 'success' || !d.problem_name) throw new Error('notFound');
      const r = parseInt(d.difficulty_rating, 10);
      return { title: d.problem_name, difficulty: r > 0 ? r : null, diffLabel: r > 0 ? String(r) : '', tags: pyList(d.user_tags) };
    }
    case 'ojuz': {
      const html = await fetchText(p.url);
      const m = html.match(/<title>\s*View problem - (.*?) \(([^)]*)\) :: oj\.uz\s*<\/title>/i) || html.match(/<h1[^>]*>\s*([^<]+?)\s*</i);
      if (!m) throw new Error('notFound');
      return { title: decodeEntities(m[1].trim()), tags: [] };
    }
    case 'csa':
      // the site renders everything with JavaScript: the slug is the best title we can get offline
      return { title: titleCase(p.pid), note: 'manualTitle' };
  }
  return {};
}

global.Platforms = { PLATFORMS, parseLink, keyOf, fetchMeta, atcoderDiff };
})(typeof window !== 'undefined' ? window : globalThis);
