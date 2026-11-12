/* Graph Editor — thuật toán (thuần, không phụ thuộc giao diện).
 * Đồ thị: { nodes: [name...], edges: [{id, u, v, w}], directed: bool }  (u, v là tên đỉnh) */
(function (global) {
'use strict';

const NUM_RE = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
/* So tên đỉnh: tên là số thì so theo giá trị, số đứng trước chữ */
function natCmp(a, b) {
  const na = NUM_RE.test(a), nb = NUM_RE.test(b);
  if (na && nb) { const d = Number(a) - Number(b); return d !== 0 ? d : (a < b ? -1 : a > b ? 1 : 0); }
  if (na) return -1;
  if (nb) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

function index(g) {
  const id = new Map();
  g.nodes.forEach((n, i) => id.set(n, i));
  return id;
}
/* Danh sách kề. both=true: coi như vô hướng. Mỗi phần tử: {to, e (edge index), w} */
function adjacency(g, both) {
  const id = index(g), n = g.nodes.length;
  const adj = Array.from({ length: n }, () => []);
  g.edges.forEach((e, k) => {
    const a = id.get(e.u), b = id.get(e.v);
    adj[a].push({ to: b, e: k });
    if (both || !g.directed) { if (a !== b || both) adj[b].push({ to: a, e: k }); }
  });
  return { id, adj, n };
}

function weightsNumeric(g) {
  return g.edges.every((e) => e.w !== null && e.w !== undefined && e.w !== '' && NUM_RE.test(String(e.w)));
}

/* ---------------- Hai phía ---------------- */
function bipartite(g) {
  const { adj, n } = adjacency(g, true);
  const side = new Array(n).fill(-1);
  for (let s = 0; s < n; s++) {
    if (side[s] !== -1) continue;
    side[s] = 0;
    const q = [s];
    const par = new Map([[s, -1]]);
    for (let qi = 0; qi < q.length; qi++) {
      const x = q[qi];
      for (const { to } of adj[x]) {
        if (side[to] === -1) { side[to] = side[x] ^ 1; par.set(to, x); q.push(to); }
        else if (side[to] === side[x]) return { ok: false };
      }
    }
  }
  const out = new Map();
  g.nodes.forEach((name, i) => out.set(name, side[i]));
  return { ok: true, side: out };
}

/* ---------------- Cặp ghép hai phía (Hopcroft–Karp) ---------------- */
function matching(g) {
  const bp = bipartite(g);
  if (!bp.ok) return null;
  const { id, n } = adjacency(g, true);
  const left = [], isLeft = new Array(n).fill(false);
  g.nodes.forEach((name, i) => { if (bp.side.get(name) === 0) { left.push(i); isLeft[i] = true; } });
  const adjL = Array.from({ length: n }, () => []);
  g.edges.forEach((e, k) => {
    let a = id.get(e.u), b = id.get(e.v);
    if (a === b) return;
    if (!isLeft[a]) [a, b] = [b, a];
    adjL[a].push({ to: b, e: k });
  });
  const matchL = new Array(n).fill(-1), matchR = new Array(n).fill(-1), matchE = new Array(n).fill(-1);
  const dist = new Array(n);
  const INF = 1e9;
  function bfs() {
    const q = [];
    let found = false;
    for (const u of left) { if (matchL[u] === -1) { dist[u] = 0; q.push(u); } else dist[u] = INF; }
    for (let qi = 0; qi < q.length; qi++) {
      const u = q[qi];
      for (const { to } of adjL[u]) {
        const w = matchR[to];
        if (w === -1) found = true;
        else if (dist[w] === INF) { dist[w] = dist[u] + 1; q.push(w); }
      }
    }
    return found;
  }
  function dfs(u) {
    for (const { to, e } of adjL[u]) {
      const w = matchR[to];
      if (w === -1 || (dist[w] === dist[u] + 1 && dfs(w))) {
        matchL[u] = to; matchR[to] = u; matchE[u] = e; return true;
      }
    }
    dist[u] = INF; return false;
  }
  let size = 0;
  while (bfs()) for (const u of left) if (matchL[u] === -1 && dfs(u)) size++;
  const edges = new Set();
  for (const u of left) if (matchL[u] !== -1) edges.add(g.edges[matchE[u]].id);
  return { size, edges };
}

/* ---------------- Khớp & cầu (vô hướng, có cạnh song song) ---------------- */
function bridgesAndCuts(g) {
  const { adj, n } = adjacency(g, false);
  const tin = new Array(n).fill(-1), low = new Array(n).fill(0);
  const bridges = new Set(), cuts = new Set();
  let timer = 0;
  for (let r = 0; r < n; r++) {
    if (tin[r] !== -1) continue;
    // DFS lặp để không tràn stack
    const stack = [{ v: r, pe: -1, it: 0, kids: 0 }];
    tin[r] = low[r] = timer++;
    while (stack.length) {
      const f = stack[stack.length - 1];
      if (f.it < adj[f.v].length) {
        const { to, e } = adj[f.v][f.it++];
        if (e === f.pe || to === f.v) continue;
        if (tin[to] !== -1) { low[f.v] = Math.min(low[f.v], tin[to]); continue; }
        tin[to] = low[to] = timer++;
        f.kids++;
        stack.push({ v: to, pe: e, it: 0, kids: 0 });
      } else {
        stack.pop();
        if (stack.length) {
          const p = stack[stack.length - 1];
          low[p.v] = Math.min(low[p.v], low[f.v]);
          if (low[f.v] > tin[p.v]) bridges.add(g.edges[f.pe].id);
          if (stack.length > 1 && low[f.v] >= tin[p.v]) cuts.add(g.nodes[p.v]);
        } else if (f.kids > 1) cuts.add(g.nodes[f.v]);
      }
    }
  }
  return { bridges, cuts };
}

/* ---------------- DSU, MST ---------------- */
function dsu(n) {
  const p = Array.from({ length: n }, (_, i) => i), r = new Array(n).fill(0);
  const find = (x) => { while (p[x] !== x) { p[x] = p[p[x]]; x = p[x]; } return x; };
  const unite = (a, b) => {
    a = find(a); b = find(b);
    if (a === b) return false;
    if (r[a] < r[b]) [a, b] = [b, a];
    p[b] = a; if (r[a] === r[b]) r[a]++;
    return true;
  };
  return { find, unite };
}
function mst(g) {
  const id = index(g);
  const d = dsu(g.nodes.length);
  const order = g.edges.map((e, k) => k).sort((a, b) => Number(g.edges[a].w) - Number(g.edges[b].w));
  const edges = new Set();
  let total = 0, used = 0;
  for (const k of order) {
    const e = g.edges[k];
    if (d.unite(id.get(e.u), id.get(e.v))) { edges.add(e.id); total += Number(e.w); used++; }
  }
  return { edges, total, trees: g.nodes.length - used };
}

/* ---------------- Thành phần liên thông (yếu) ---------------- */
function components(g) {
  const id = index(g);
  const d = dsu(g.nodes.length);
  g.edges.forEach((e) => d.unite(id.get(e.u), id.get(e.v)));
  return groupBy(g, (i) => d.find(i));
}
function groupBy(g, keyOf) {
  const map = new Map(), comp = new Map();
  g.nodes.forEach((name, i) => {
    const k = keyOf(i);
    if (!map.has(k)) map.set(k, map.size);
    comp.set(name, map.get(k));
  });
  return { count: map.size, comp };
}

/* ---------------- SCC (Tarjan lặp) ---------------- */
function scc(g) {
  const { adj, n } = adjacency(Object.assign({}, g, { directed: true }), false);
  const idx = new Array(n).fill(-1), low = new Array(n).fill(0), on = new Array(n).fill(false), comp = new Array(n).fill(-1);
  const st = [];
  let t = 0, c = 0;
  for (let r = 0; r < n; r++) {
    if (idx[r] !== -1) continue;
    const call = [{ v: r, it: 0 }];
    idx[r] = low[r] = t++; st.push(r); on[r] = true;
    while (call.length) {
      const f = call[call.length - 1];
      if (f.it < adj[f.v].length) {
        const to = adj[f.v][f.it++].to;
        if (idx[to] === -1) { idx[to] = low[to] = t++; st.push(to); on[to] = true; call.push({ v: to, it: 0 }); }
        else if (on[to]) low[f.v] = Math.min(low[f.v], idx[to]);
      } else {
        call.pop();
        if (call.length) { const p = call[call.length - 1].v; low[p] = Math.min(low[p], low[f.v]); }
        if (low[f.v] === idx[f.v]) {
          let x;
          do { x = st.pop(); on[x] = false; comp[x] = c; } while (x !== f.v);
          c++;
        }
      }
    }
  }
  return groupBy(g, (i) => comp[i]);
}

/* ---------------- Topo sort ---------------- */
function findCycle(g) {
  // trả về danh sách id cạnh tạo thành một chu trình có hướng (hoặc null)
  const { adj, n } = adjacency(Object.assign({}, g, { directed: true }), false);
  const color = new Array(n).fill(0), parE = new Array(n).fill(-1), parV = new Array(n).fill(-1);
  for (let r = 0; r < n; r++) {
    if (color[r]) continue;
    const call = [{ v: r, it: 0 }];
    color[r] = 1;
    while (call.length) {
      const f = call[call.length - 1];
      if (f.it < adj[f.v].length) {
        const { to, e } = adj[f.v][f.it++];
        if (color[to] === 0) { color[to] = 1; parE[to] = e; parV[to] = f.v; call.push({ v: to, it: 0 }); }
        else if (color[to] === 1) {
          const cyc = [g.edges[e].id];
          for (let x = f.v; x !== to; x = parV[x]) cyc.push(g.edges[parE[x]].id);
          return cyc.reverse();
        }
      } else { color[f.v] = 2; call.pop(); }
    }
  }
  return null;
}
/* mode: 'lex' (nhỏ nhất theo natCmp) | 'random' */
function topo(g, mode, rng) {
  const { adj, n } = adjacency(Object.assign({}, g, { directed: true }), false);
  const indeg = new Array(n).fill(0);
  adj.forEach((l) => l.forEach(({ to }) => indeg[to]++));
  const avail = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) avail.push(i);
  const order = [];
  const cmp = (a, b) => natCmp(g.nodes[a], g.nodes[b]);
  rng = rng || Math.random;
  while (avail.length) {
    let pick;
    if (mode === 'random') pick = Math.floor(rng() * avail.length);
    else { pick = 0; for (let k = 1; k < avail.length; k++) if (cmp(avail[k], avail[pick]) < 0) pick = k; }
    const v = avail[pick];
    avail[pick] = avail[avail.length - 1]; avail.pop();
    order.push(g.nodes[v]);
    for (const { to } of adj[v]) if (--indeg[to] === 0) avail.push(to);
  }
  if (order.length < n) return { ok: false, cycle: findCycle(g) };
  return { ok: true, order };
}

/* ---------------- Đường đi ngắn nhất (nhiều nguồn) ---------------- */
function shortestPaths(g, sources) {
  const { id, adj, n } = adjacency(g, false);
  const w = g.edges.map((e) => Number(e.w));
  const dist = new Array(n).fill(Infinity), parE = new Array(n).fill(-1), parV = new Array(n).fill(-1), origin = new Array(n).fill(-1);
  const src = sources.map((s) => id.get(s)).filter((x) => x !== undefined);
  src.forEach((s, k) => { dist[s] = 0; origin[s] = k; });
  const negative = w.some((x) => x < 0);
  const negInf = new Array(n).fill(false);
  if (!negative) {
    // Dijkstra với heap nhị phân
    const heap = [];
    const push = (d, v) => { heap.push([d, v]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    src.forEach((s) => push(0, s));
    while (heap.length) {
      const [d, v] = pop();
      if (d > dist[v]) continue;
      for (const { to, e } of adj[v]) {
        const nd = d + w[e];
        if (nd < dist[to]) { dist[to] = nd; parE[to] = e; parV[to] = v; origin[to] = origin[v]; push(nd, to); }
      }
    }
  } else {
    // Bellman-Ford; đỉnh tới được từ chu trình âm → −∞
    for (let it = 0; it < n; it++) {
      let ch = false;
      for (let v = 0; v < n; v++) {
        if (dist[v] === Infinity) continue;
        for (const { to, e } of adj[v]) if (dist[v] + w[e] < dist[to]) { dist[to] = dist[v] + w[e]; parE[to] = e; parV[to] = v; origin[to] = origin[v]; ch = true; }
      }
      if (!ch) break;
    }
    const q = [];
    for (let v = 0; v < n; v++) {
      if (dist[v] === Infinity) continue;
      for (const { to, e } of adj[v]) if (dist[v] + w[e] < dist[to] && !negInf[to]) { negInf[to] = true; q.push(to); }
    }
    for (let qi = 0; qi < q.length; qi++) for (const { to } of adj[q[qi]]) if (!negInf[to]) { negInf[to] = true; q.push(to); }
  }
  const res = { dist: new Map(), origin: new Map(), parent: new Map(), negative, anyNegInf: negInf.some(Boolean) };
  g.nodes.forEach((name, i) => {
    res.dist.set(name, negInf[i] ? -Infinity : dist[i]);
    res.origin.set(name, origin[i]);
    if (parE[i] !== -1 && !negInf[i]) res.parent.set(name, { edge: g.edges[parE[i]].id, from: g.nodes[parV[i]] });
  });
  return res;
}
function pathTo(sp, target) {
  const d = sp.dist.get(target);
  if (d === undefined || d === Infinity || d === -Infinity) return null;
  const edges = [], nodes = [target];
  let x = target;
  for (let guard = 0; sp.parent.has(x) && guard < 1e6; guard++) {
    const p = sp.parent.get(x);
    edges.push(p.edge); nodes.push(p.from); x = p.from;
  }
  return { edges: edges.reverse(), nodes: nodes.reverse(), length: d };
}

/* ---------------- Chu trình âm ---------------- */
function negativeCycle(g) {
  const { adj, n } = adjacency(g, false);
  const w = g.edges.map((e) => Number(e.w));
  if (!g.directed) {
    // vô hướng: một cạnh âm u–v đã cho chu trình u → v → u
    let best = -1;
    g.edges.forEach((e, k) => { if (w[k] < 0 && (best === -1 || w[k] < w[best])) best = k; });
    if (best === -1) return null;
    const e = g.edges[best];
    return { nodes: e.u === e.v ? [e.u] : [e.u, e.v], edges: [e.id], total: e.u === e.v ? w[best] : 2 * w[best], undirectedEdge: true };
  }
  const dist = new Array(n).fill(0), parE = new Array(n).fill(-1), parV = new Array(n).fill(-1);
  let x = -1;
  for (let it = 0; it < n; it++) {
    x = -1;
    for (let v = 0; v < n; v++) for (const { to, e } of adj[v]) {
      if (dist[v] + w[e] < dist[to]) { dist[to] = dist[v] + w[e]; parE[to] = e; parV[to] = v; x = to; }
    }
    if (x === -1) return null;
  }
  for (let i = 0; i < n; i++) x = parV[x];
  const edges = [], nodes = [];
  let total = 0;
  for (let v = x; ; v = parV[v]) {
    edges.push(g.edges[parE[v]].id); nodes.push(g.nodes[v]); total += w[parE[v]];
    if (parV[v] === x) break;
  }
  return { nodes: nodes.reverse(), edges: edges.reverse(), total };
}

/* ======================================================================
 * All-pairs distances (Floyd–Warshall). Edge weights numeric (strings ok).
 * ====================================================================== */
function allPairs(g) {
  const id = index(g), n = g.nodes.length;
  const D = Array.from({ length: n }, () => new Float64Array(n).fill(Infinity));
  const nx = Array.from({ length: n }, () => new Int32Array(n).fill(-1));
  for (let i = 0; i < n; i++) { D[i][i] = 0; nx[i][i] = i; }
  g.edges.forEach((e) => {
    const a = id.get(e.u), b = id.get(e.v), w = Number(e.w);
    if (w < D[a][b]) { D[a][b] = w; nx[a][b] = b; }
    if (!g.directed && w < D[b][a]) { D[b][a] = w; nx[b][a] = a; }
  });
  for (let k = 0; k < n; k++) {
    const Dk = D[k];
    for (let i = 0; i < n; i++) {
      const dik = D[i][k];
      if (dik === Infinity) continue;
      const Di = D[i], ni = nx[i];
      for (let j = 0; j < n; j++) { const v = dik + Dk[j]; if (v < Di[j]) { Di[j] = v; ni[j] = ni[k]; } }
    }
  }
  let neg = false;
  for (let k = 0; k < n; k++) if (D[k][k] < 0) {
    neg = true;
    for (let i = 0; i < n; i++) if (D[i][k] < Infinity) for (let j = 0; j < n; j++) if (D[k][j] < Infinity) D[i][j] = -Infinity;
  }
  const path = (a, b) => {
    let i = id.get(a); const j = id.get(b);
    if (!Number.isFinite(D[i][j]) || nx[i][j] < 0) return null;
    const out = [g.nodes[i]];
    for (let guard = 0; i !== j && guard <= n; guard++) { i = nx[i][j]; out.push(g.nodes[i]); }
    return out;
  };
  return { D, neg, path, order: g.nodes };
}

global.GraphAlgos = { natCmp, allPairs, weightsNumeric, bipartite, matching, bridgesAndCuts, mst, components, scc, topo, findCycle, shortestPaths, pathTo, negativeCycle, NUM_RE };
})(typeof window !== 'undefined' ? window : globalThis);
