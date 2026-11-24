/* Phần 4: Graph Editor */
(function () {
'use strict';
const { $, $$, esc } = UI;
const GA = GraphAlgos;

const APSP_MAX_TXT = '400';
I18N.add({
  vi: {
    'ge.data': 'Dữ liệu', 'ge.dataHint': 'Mỗi dòng <code>u v</code> hoặc <code>u v w</code> (w là trọng số). Một từ trên dòng là đỉnh lẻ. Tên đỉnh là chữ hay số đều được.',
    'ge.shift': 'Cộng thêm vào số đỉnh', 'ge.shiftK': 'k', 'ge.shiftApply': 'Cộng k', 'ge.shiftTo0': '−1 (1-index → 0-index)', 'ge.shiftTo1': '+1 (0-index → 1-index)', 'ge.shiftOff': 'Chỉ dùng được khi mọi tên đỉnh đều là số nguyên', 'ge.shiftDone': 'Đã cộng {k} vào mọi số đỉnh', 'ge.shiftBad': 'k phải là số nguyên',
    'ge.n': 'Số đỉnh n (tuỳ chọn)', 'ge.base': 'Đánh số từ', 'ge.nHint': 'Thêm sẵn các đỉnh 1..n (hoặc 0..n−1), kể cả đỉnh không có cạnh nào.',
    'ge.nCap': 'Chỉ vẽ tối đa {max} đỉnh', 'ge.inRange': 'Đỉnh {v} nằm trong dải số đỉnh nên vẫn còn. Đã xoá các cạnh của nó. Muốn bỏ hẳn thì giảm "Số đỉnh" (đỉnh cuối là {last}).',
    'ge.labels': 'Label đỉnh (tuỳ chọn)', 'ge.labelsPh': 'vd: 5 3 _ 8 1', 'ge.labelsHint': 'Gán lần lượt cho các đỉnh theo thứ tự tên tăng dần. Dùng _ để bỏ qua một đỉnh.',
    'ge.stat': '{n} đỉnh · {m} cạnh', 'ge.export': 'Xuất', 'ge.copy': 'Chép danh sách cạnh', 'ge.copyHdr': 'Chép kèm "n m"', 'ge.png': 'Tải ảnh PNG', 'ge.copyImg': 'Chép ảnh', 'copiedImg': 'Đã chép ảnh đồ thị vào clipboard', 'copyImgFail': 'Trình duyệt không cho chép ảnh, hãy dùng Tải ảnh PNG',
    'ge.fit': 'Căn giữa', 'ge.modes': 'Chế độ', 'ge.algos': 'Thuật toán', 'ge.appearance': 'Giao diện',
    'ge.newTab': 'Đồ thị {k}', 'ge.addTab': '+ Tab mới', 'ge.dupTab': 'Nhân bản tab', 'ge.renameHint': 'Bấm đúp để đổi tên',
    'tool.move': 'Di chuyển / chọn', 'tool.add': 'Thêm đỉnh, cạnh', 'tool.del': 'Xoá', 'tool.paint': 'Tô màu', 'tool.bold': 'In đậm', 'tool.pin': 'Ghim đỉnh',
    'tool.pen': 'Bút vẽ', 'tool.eraser': 'Tẩy nét bút',
    'hint.move': 'Kéo đỉnh để di chuyển, kéo nền để cuộn, lăn chuột để phóng to. Bấm đúp đỉnh để đổi tên, bấm đúp cạnh để sửa trọng số.',
    'hint.add': 'Bấm chỗ trống để thêm đỉnh. Kéo từ đỉnh này sang đỉnh kia (hoặc bấm lần lượt 2 đỉnh) để thêm cạnh. Bấm 2 lần cùng một đỉnh để tạo self loop.',
    'hint.addPending': 'Đã chọn đỉnh {v}. Bấm đỉnh thứ hai (hoặc chính nó để tạo self loop). Esc để huỷ.',
    'hint.del': 'Bấm vào đỉnh hoặc cạnh để xoá.', 'hint.paint': 'Chọn màu ở bảng màu rồi bấm vào đỉnh hoặc cạnh. Ô gạch chéo là bỏ màu.',
    'hint.bold': 'Bấm vào đỉnh hoặc cạnh để bật / tắt in đậm.', 'hint.pin': 'Bấm vào đỉnh để ghim / bỏ ghim. Đỉnh đã ghim đứng yên, các đỉnh khác vẫn trôi.',
    'hint.pen': 'Kéo để vẽ. Màu lấy từ bảng màu.', 'hint.eraser': 'Kéo qua nét bút để tẩy đúng phần bị chà (Ctrl+Z để hoàn tác).',
    'hint.spSource': 'Đường đi ngắn nhất: bấm đỉnh để chọn nguồn.', 'hint.spSources': 'Đường đi ngắn nhất: bấm đỉnh để thêm / bỏ nguồn.', 'hint.spTarget': 'Đường đi ngắn nhất: bấm đỉnh để chọn đích.',
    'act.clearColors': 'Xoá màu & in đậm', 'act.clearPen': 'Xoá nét bút', 'act.undo': 'Hoàn tác nét vẽ (Ctrl+Z)', 'act.redo': 'Làm lại (Ctrl+Y)', 'act.relayout': 'Xếp lại', 'act.unpin': 'Bỏ ghim tất cả',
    'm.directed': 'Có hướng', 'm.weighted': 'Có trọng số', 'm.weighted.d': 'Tắt thì ẩn trọng số', 'm.multi': 'Multiedge', 'm.multi.d': 'Tắt thì gộp các cạnh trùng',
    'm.lock': 'Khoá (Lock)', 'm.lock.d': 'Tắt lực đẩy, mọi đỉnh đứng yên', 'm.physics': 'Edge physics', 'm.physics.d': 'Đỉnh đẩy cả cạnh để không đè lên nhau',
    'm.bip': 'Hai phía (Bipartite)', 'm.bip.d': 'Tô màu và xếp hai phía thành hai cột', 'm.bip.no': 'Đồ thị không phải hai phía',
    'lk.radius': 'Bán kính đỉnh', 'lk.font': 'Cỡ chữ', 'lk.nodeBorder': 'Viền đỉnh', 'lk.edgeWidth': 'Độ dày cạnh', 'lk.edgeLen': 'Độ dài cạnh',
    'lk.labelOff': 'Khoảng cách nhãn trọng số', 'lk.pen': 'Cỡ bút', 'lk.penAlpha': 'Độ đậm bút (%)', 'lk.eraser': 'Cỡ tẩy', 'lk.repel': 'Lực đẩy giữa các đỉnh', 'lk.tension': 'Độ căng cạnh',
    'lk.reset': 'Khôi phục mặc định',
    'al.matching': 'Cặp ghép hai phía', 'al.bridges': 'Khớp & cầu', 'al.ecc2': 'Thành phần song liên thông cạnh (2ECC)', 'al.bcc': 'Thành phần song liên thông đỉnh (BCC)', 'al.mst': 'Cây khung nhỏ nhất (MST)', 'al.comp': 'Thành phần liên thông', 'al.scc': 'Thành phần liên thông mạnh (SCC)',
    'al.topo': 'Sắp xếp topo', 'al.sp': 'Đường đi ngắn nhất', 'al.apsp': 'Khoảng cách mọi cặp', 'al.neg': 'Chu trình âm',
    'why.bip': 'Cần đồ thị hai phía', 'why.undirected': 'Cần đồ thị vô hướng', 'why.directed': 'Cần đồ thị có hướng', 'why.weights': 'Cần bật "Có trọng số" và mọi trọng số là số', 'why.empty': 'Đồ thị chưa có cạnh', 'why.spWeights': 'Có trọng số không phải số (cạnh không ghi trọng số được tính là 1)',
    'r.allUnit': 'Đồ thị không trọng số: mỗi cạnh tính là 1.', 'r.someUnit': '{k} cạnh không ghi trọng số được tính là 1.',
    'r.matchSize': 'Kích thước cặp ghép', 'r.bridges': 'Cầu', 'r.cuts': 'Khớp', 'r.none': 'không có', 'r.mstTotal': 'Tổng trọng số', 'r.trees': 'Số cây', 'r.edges': 'Số cạnh',
    'r.comps': 'Số thành phần', 'r.sccs': 'Số SCC', 'r.ecc2': 'Số 2ECC', 'r.bcc': 'Số BCC (khối)', 'r.eccHint': 'Bỏ hết cầu (nét đứt đỏ), phần còn liên thông là một 2ECC.', 'r.bccHint': 'Mỗi cạnh thuộc đúng một khối; đỉnh khớp (lục giác) thuộc nhiều khối.', 'r.order': 'Thứ tự', 'r.another': 'Thứ tự khác', 'r.lex': 'Lex nhỏ nhất', 'r.cycle': 'Có chu trình nên không sắp topo được:',
    'r.mode': 'Nguồn', 'r.single': 'Một nguồn', 'r.multi': 'Nhiều nguồn', 'r.pick': 'Bấm đỉnh để chọn', 'r.pickSrc': 'nguồn', 'r.pickDst': 'đích',
    'r.sources': 'Nguồn', 'r.target': 'Đích', 'r.dist': 'Độ dài', 'r.path': 'Đường đi', 'r.noPath': 'Không tới được', 'r.algoUsed': 'Thuật toán',
    'r.negInf': 'Có đỉnh khoảng cách −∞ (tới được từ chu trình âm)', 'r.noSource': 'Chưa chọn nguồn. Bấm một đỉnh trên canvas.', 'r.clear': 'Bỏ chọn',
    'r.negNone': 'Không có chu trình âm', 'r.negFound': 'Có chu trình âm', 'r.negTotal': 'Tổng trọng số chu trình', 'r.negUndirected': 'Đồ thị vô hướng: cạnh âm u–v cho chu trình u → v → u.',
    'r.flashHint': 'Bấm vào một mục để chỉ ra trên canvas.',
    'why.apspBig': 'Tối đa ' + APSP_MAX_TXT + ' đỉnh', 'r.nodes': 'Số đỉnh', 'r.apOpen': 'Xem ma trận khoảng cách', 'r.apTitle': 'Ma trận khoảng cách',
    'r.apCellHint': 'Hàng là đỉnh xuất phát, cột là đỉnh đích. Bấm một ô để xem đường đi trên canvas.', 'r.apCopy': 'Chép ma trận', 'r.apClose': 'Đóng',
    'r.apFromTo': 'từ \\ đến', 'r.apNeg': 'Có chu trình âm: ô −∞ là cặp đi qua được chu trình âm.', 'r.pair': 'Cặp', 'r.apHint': 'Mở ma trận rồi bấm một ô để xem đường đi.',
    'copiedEdges': 'Đã chép {m} cạnh', 'ge.openFromTest': 'Test #{i}', 'ge.badName': 'Tên đỉnh không được rỗng hoặc có dấu cách', 'ge.nameTaken': 'Đã có đỉnh tên "{v}"',
  },
  en: {
    'ge.data': 'Data', 'ge.dataHint': 'One edge per line: <code>u v</code> or <code>u v w</code> (w is the weight). A single word is an isolated node. Node names can be words or numbers.',
    'ge.shift': 'Add an offset to node numbers', 'ge.shiftK': 'k', 'ge.shiftApply': 'Add k', 'ge.shiftTo0': '−1 (1-indexed → 0-indexed)', 'ge.shiftTo1': '+1 (0-indexed → 1-indexed)', 'ge.shiftOff': 'Only when every node name is an integer', 'ge.shiftDone': 'Added {k} to every node number', 'ge.shiftBad': 'k must be an integer',
    'ge.n': 'Node count n (optional)', 'ge.base': 'Numbered from', 'ge.nHint': 'Adds nodes 1..n (or 0..n−1), including nodes with no edges.',
    'ge.nCap': 'At most {max} nodes are drawn', 'ge.inRange': 'Node {v} is inside the node count range, so it stays; its edges were removed. Lower "Node count" to drop it (the last node is {last}).',
    'ge.labels': 'Node labels (optional)', 'ge.labelsPh': 'e.g. 5 3 _ 8 1', 'ge.labelsHint': 'Assigned to nodes in increasing name order. Use _ to skip a node.',
    'ge.stat': '{n} nodes · {m} edges', 'ge.export': 'Export', 'ge.copy': 'Copy edge list', 'ge.copyHdr': 'Copy with "n m"', 'ge.png': 'Download PNG', 'ge.copyImg': 'Copy image', 'copiedImg': 'Graph image copied to the clipboard', 'copyImgFail': 'The browser does not allow copying images; use Download PNG',
    'ge.fit': 'Fit', 'ge.modes': 'Modes', 'ge.algos': 'Algorithms', 'ge.appearance': 'Appearance',
    'ge.newTab': 'Graph {k}', 'ge.addTab': '+ New tab', 'ge.dupTab': 'Duplicate tab', 'ge.renameHint': 'Double-click to rename',
    'tool.move': 'Move / select', 'tool.add': 'Add nodes, edges', 'tool.del': 'Delete', 'tool.paint': 'Paint', 'tool.bold': 'Bold', 'tool.pin': 'Pin node',
    'tool.pen': 'Pen', 'tool.eraser': 'Erase pen strokes',
    'hint.move': 'Drag nodes to move them, drag the background to pan, scroll to zoom. Double-click a node to rename it, an edge to edit its weight.',
    'hint.add': 'Click empty space to add a node. Drag from one node to another (or click two nodes) to add an edge. Click the same node twice for a self loop.',
    'hint.addPending': 'Node {v} selected. Click the second node (or the same one for a self loop). Esc to cancel.',
    'hint.del': 'Click a node or an edge to delete it.', 'hint.paint': 'Pick a color, then click a node or edge. The crossed swatch removes color.',
    'hint.bold': 'Click a node or edge to toggle bold.', 'hint.pin': 'Click a node to pin / unpin it. Pinned nodes stay still, the others keep floating.',
    'hint.pen': 'Drag to draw. The color comes from the palette.', 'hint.eraser': 'Drag over pen strokes to erase just the part you rub (Ctrl+Z to undo).',
    'hint.spSource': 'Shortest path: click a node to choose the source.', 'hint.spSources': 'Shortest path: click nodes to add / remove sources.', 'hint.spTarget': 'Shortest path: click a node to choose the target.',
    'act.clearColors': 'Clear colors & bold', 'act.clearPen': 'Clear pen strokes', 'act.undo': 'Undo drawing (Ctrl+Z)', 'act.redo': 'Redo (Ctrl+Y)', 'act.relayout': 'Re-layout', 'act.unpin': 'Unpin all',
    'm.directed': 'Directed', 'm.weighted': 'Weighted', 'm.weighted.d': 'Off hides the weights', 'm.multi': 'Multiedge', 'm.multi.d': 'Off merges duplicate edges',
    'm.lock': 'Lock', 'm.lock.d': 'Stops the forces, every node stays put', 'm.physics': 'Edge physics', 'm.physics.d': 'Nodes push edges away so they do not overlap',
    'm.bip': 'Bipartite', 'm.bip.d': 'Colors the two sides and lays them out in two columns', 'm.bip.no': 'The graph is not bipartite',
    'lk.radius': 'Node radius', 'lk.font': 'Font size', 'lk.nodeBorder': 'Node border', 'lk.edgeWidth': 'Edge width', 'lk.edgeLen': 'Edge length',
    'lk.labelOff': 'Weight label distance', 'lk.pen': 'Pen size', 'lk.penAlpha': 'Pen opacity (%)', 'lk.eraser': 'Eraser size', 'lk.repel': 'Node repulsion', 'lk.tension': 'Edge tension',
    'lk.reset': 'Reset to defaults',
    'al.matching': 'Bipartite matching', 'al.bridges': 'Articulation points & bridges', 'al.ecc2': '2-edge-connected components (2ECC)', 'al.bcc': 'Biconnected components (BCC)', 'al.mst': 'Minimum spanning tree (MST)', 'al.comp': 'Connected components', 'al.scc': 'Strongly connected components (SCC)',
    'al.topo': 'Topological sort', 'al.sp': 'Shortest paths', 'al.apsp': 'All-pairs distances', 'al.neg': 'Negative cycle',
    'why.bip': 'Needs a bipartite graph', 'why.undirected': 'Needs an undirected graph', 'why.directed': 'Needs a directed graph', 'why.weights': 'Needs "Weighted" on and every weight numeric', 'why.empty': 'The graph has no edges', 'why.spWeights': 'Some weights are not numbers (edges without a weight count as 1)',
    'r.allUnit': 'Unweighted graph: every edge counts as 1.', 'r.someUnit': '{k} edges without a weight count as 1.',
    'r.matchSize': 'Matching size', 'r.bridges': 'Bridges', 'r.cuts': 'Articulation points', 'r.none': 'none', 'r.mstTotal': 'Total weight', 'r.trees': 'Trees', 'r.edges': 'Edges',
    'r.comps': 'Components', 'r.sccs': 'SCCs', 'r.ecc2': '2ECCs', 'r.bcc': 'BCCs (blocks)', 'r.eccHint': 'Remove every bridge (dashed red); whatever stays connected is one 2ECC.', 'r.bccHint': 'Each edge is in exactly one block; cut vertices (hexagons) are in several.', 'r.order': 'Order', 'r.another': 'Another order', 'r.lex': 'Lexicographically smallest', 'r.cycle': 'There is a cycle, so no topological order exists:',
    'r.mode': 'Sources', 'r.single': 'Single source', 'r.multi': 'Multiple sources', 'r.pick': 'Clicking a node picks the', 'r.pickSrc': 'source', 'r.pickDst': 'target',
    'r.sources': 'Sources', 'r.target': 'Target', 'r.dist': 'Length', 'r.path': 'Path', 'r.noPath': 'Unreachable', 'r.algoUsed': 'Algorithm',
    'r.negInf': 'Some nodes have distance −∞ (reachable from a negative cycle)', 'r.noSource': 'No source yet. Click a node on the canvas.', 'r.clear': 'Clear',
    'r.negNone': 'No negative cycle', 'r.negFound': 'Negative cycle found', 'r.negTotal': 'Cycle weight', 'r.negUndirected': 'Undirected graph: a negative edge u–v gives the cycle u → v → u.',
    'r.flashHint': 'Click an item to point it out on the canvas.',
    'why.apspBig': 'At most ' + APSP_MAX_TXT + ' nodes', 'r.nodes': 'Nodes', 'r.apOpen': 'Show distance matrix', 'r.apTitle': 'Distance matrix',
    'r.apCellHint': 'Rows are sources, columns are targets. Click a cell to see the path on the canvas.', 'r.apCopy': 'Copy matrix', 'r.apClose': 'Close',
    'r.apFromTo': 'from \\ to', 'r.apNeg': 'There is a negative cycle: −∞ cells are pairs that can go through it.', 'r.pair': 'Pair', 'r.apHint': 'Open the matrix and click a cell to see the path.',
    'copiedEdges': 'Copied {m} edges', 'ge.openFromTest': 'Test #{i}', 'ge.badName': 'Node names cannot be empty or contain spaces', 'ge.nameTaken': 'A node named "{v}" already exists',
  },
});

/* ============================================================ constants */
const PALETTE = ['#e5484d', '#f76b15', '#f5c400', '#30a46c', '#12a594', '#0090ff', '#3e63dd', '#8e4ec6', '#d6409f', '#8b8d98'];
const COMP_COLORS = ['#7ea6ff', '#ffb366', '#7fd99a', '#ff8a8a', '#c9a0ff', '#6fd6d0', '#ffd866', '#ff9ccf', '#a8c66c', '#b0b4c0', '#f0a07a', '#8fb8de'];
const SIDE_COLORS = ['#8fb3ff', '#ffbf80'];
const SRC_COLORS = ['#e5484d', '#0090ff', '#30a46c', '#8e4ec6', '#f76b15', '#d6409f'];
const LOOK_DEFAULT = { radius: 18, font: 14, nodeBorder: 2, edgeWidth: 2, edgeLen: 110, labelOff: 12, pen: 3, penAlpha: 85, eraser: 16, repel: 100, tension: 100 };
const LOOK_RANGE = {
  radius: [8, 40, 1], font: [8, 30, 1], nodeBorder: [1, 6, 0.5], edgeWidth: [1, 8, 0.5], edgeLen: [40, 300, 5], labelOff: [0, 30, 1],
  pen: [1, 20, 1], penAlpha: [10, 100, 5], eraser: [5, 60, 1], repel: [10, 300, 10], tension: [10, 300, 10],
};
const TOOLS = [
  ['move', 'V', '<path d="M5 3l14 8-6 2-2 6z" fill="currentColor"/>'],
  ['add', 'A', '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2"/>'],
  ['del', 'D', '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'],
  ['paint', 'C', '<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z" fill="currentColor"/>'],
  ['bold', 'B', '<path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z" fill="none" stroke="currentColor" stroke-width="2.6"/>'],
  ['pin', 'P', '<path d="M9 3h6l-1 6 3 3H7l3-3zM12 12v9" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'],
  ['pen', 'N', '<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'],
  ['eraser', 'E', '<path d="M4 16l9-9 6 6-7 7H8zM9 20h11" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'],
];
const ALGOS = ['comp', 'scc', 'bridges', 'ecc2', 'bcc', 'mst', 'matching', 'topo', 'sp', 'apsp', 'neg'];
const APSP_MAX = 400;

/* ============================================================ state */
const look = Object.assign({}, LOOK_DEFAULT);
let tool = 'move', color = PALETTE[5];
let tabs = [], active = null, tabSeq = 0;
const view = { x: 0, y: 0, k: 1 };
const canvas = $('#geCanvas'), wrap = $('#geWrap'), ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1;

function newTab(name, text, opts) {
  tabSeq++;
  const tb = {
    id: tabSeq, name: name || t('ge.newTab', { k: tabSeq }), text: text || '', labels: '', nCount: '', base: '1',
    modes: Object.assign({ directed: false, weighted: true, multi: true, lock: false, physics: false, bip: false }, opts || {}),
    pos: new Map(), nodeColor: new Map(), nodeBold: new Set(), edgeColor: new Map(), edgeBold: new Set(),
    strokes: [], algo: null, sp: { multi: false, pick: 'src', sources: [], target: null }, ap: { sel: null }, topoMode: 'lex', topoSeed: 0,
    graph: null, view: null, sleeping: 0, autoFit: true,
  };
  rebuild(tb);
  return tb;
}

/* ============================================================ parsing */
function parseText(tb) {
  const raw = tb.text.split(/\r?\n/);
  const lines = [];
  raw.forEach((l, i) => { const s = l.trim(); if (s && !s.startsWith('#') && !s.startsWith('//')) lines.push({ toks: s.split(/\s+/), line: i + 1 }); });
  const nodes = [], seen = new Set(), edges = [];
  const addNode = (v) => { if (!seen.has(v)) { seen.add(v); nodes.push(v); } };
  const occ = new Map();
  for (const { toks: tk } of lines) {
    if (tk.length === 1) { addNode(tk[0]); continue; }
    const u = tk[0], v = tk[1], w = tk.length > 2 ? tk.slice(2).join(' ') : null;
    addNode(u); addNode(v);
    const key = u + '\u0001' + v;
    const k = occ.get(key) || 0; occ.set(key, k + 1);
    edges.push({ id: key + '\u0001' + k, u, v, w });
  }
  // node count field: add nodes base..base+n-1 (including isolated ones)
  const r = nodeRange(tb);
  if (r) for (let i = r.base; i < r.base + r.n; i++) addNode(String(i));
  return { nodes, edges };
}
const N_MAX = 5000;
function nodeRange(tb) {
  const n = parseInt(String(tb.nCount).trim(), 10);
  if (!(n > 0)) return null;
  return { n: Math.min(n, N_MAX), base: tb.base === '0' ? 0 : 1, capped: n > N_MAX };
}
function inRange(tb, x) {
  const r = nodeRange(tb);
  if (!r || !/^\d+$/.test(x)) return false;
  const v = Number(x);
  return v >= r.base && v < r.base + r.n;
}

/* Build displayed graph from the tab text and settings */
function rebuild(tb) {
  const p = parseText(tb);
  let edges = p.edges;
  if (!tb.modes.multi) {
    const seen = new Set();
    edges = edges.filter((e) => {
      const k = tb.modes.directed || e.u === e.v ? e.u + '\u0001' + e.v : [e.u, e.v].sort().join('\u0001');
      if (seen.has(k)) return false; seen.add(k); return true;
    });
  }
  tb.parsed = p;
  tb.graph = { nodes: p.nodes, edges: edges.map((e) => ({ id: e.id, u: e.u, v: e.v, w: tb.modes.weighted ? e.w : null })), directed: tb.modes.directed };
  // labels
  tb.labelMap = new Map();
  const toks = tb.labels.trim() ? tb.labels.trim().split(/[\s,]+/) : [];
  if (toks.length) {
    const sorted = p.nodes.slice().sort(GA.natCmp);
    sorted.forEach((n, i) => { if (i < toks.length && toks[i] !== '_') tb.labelMap.set(n, toks[i]); });
  }
  // positions for new nodes: near a placed neighbour, else around the center
  const adj = new Map();
  edges.forEach((e) => { (adj.get(e.u) || adj.set(e.u, []).get(e.u)).push(e.v); (adj.get(e.v) || adj.set(e.v, []).get(e.v)).push(e.u); });
  const c = worldCenter();
  for (const n of p.nodes) {
    if (tb.pos.has(n)) continue;
    const nb = (adj.get(n) || []).map((x) => tb.pos.get(x)).filter(Boolean);
    const base = nb.length ? nb[0] : { x: c.x, y: c.y };
    const r = nb.length ? look.edgeLen * 0.8 : look.edgeLen * (0.5 + Math.sqrt(tb.pos.size) * 0.35);
    const a = Math.random() * Math.PI * 2;
    tb.pos.set(n, { x: base.x + Math.cos(a) * r, y: base.y + Math.sin(a) * r, vx: 0, vy: 0, pinned: false });
  }
  for (const n of [...tb.pos.keys()]) if (!p.nodes.includes(n)) tb.pos.delete(n);
  tb.bip = GA.bipartite(tb.graph);
  if (tb.modes.bip && !tb.bip.ok) tb.modes.bip = false;
  tb.sp.sources = tb.sp.sources.filter((s) => tb.pos.has(s));
  if (tb.sp.target && !tb.pos.has(tb.sp.target)) tb.sp.target = null;
  if (tb.algo && !algoAvailable(tb, tb.algo).ok) tb.algo = null;
  computeAlgo(tb);
  tb.sleeping = 0;
}

/* Serialize the structure back to text after a canvas edit */
function serialize(tb, nodes, edges) {
  const out = [];
  const deg = new Set();
  edges.forEach((e) => { out.push(e.u + ' ' + e.v + (e.w !== null && e.w !== undefined && e.w !== '' ? ' ' + e.w : '')); deg.add(e.u); deg.add(e.v); });
  // isolated nodes (those inside the 1..n range come from the node count field)
  nodes.forEach((n) => { if (!deg.has(n) && !inRange(tb, n)) out.push(n); });
  return out.join('\n');
}
function editStructure(tb, fn) {
  const nodes = tb.parsed.nodes.slice();
  const edges = tb.parsed.edges.map((e) => Object.assign({}, e));
  fn(nodes, edges);
  tb.text = serialize(tb, nodes, edges);
  rebuild(tb);
  if (tb === active) { $('#geText').value = tb.text; renderSide(); }
  wake();
}
function freeName(tb) {
  const used = new Set(tb.parsed.nodes);
  for (let i = 1; ; i++) if (!used.has(String(i))) return String(i);
}

/* ============================================================ algorithms → visual overlay */
function algoAvailable(tb, id) {
  const g = tb.graph, m = tb.modes;
  const numeric = m.weighted && g.edges.length > 0 && GA.weightsNumeric(g);
  switch (id) {
    case 'matching': return !g.edges.length ? { ok: false, why: 'why.empty' } : tb.bip.ok ? { ok: true } : { ok: false, why: 'why.bip' };
    case 'bridges': case 'ecc2': case 'bcc': return m.directed ? { ok: false, why: 'why.undirected' } : { ok: true };
    case 'mst': case 'neg': return numeric ? { ok: true } : { ok: false, why: 'why.weights' };
    case 'sp': return spGraph(tb) ? { ok: true } : { ok: false, why: 'why.spWeights' };
    case 'apsp': return g.nodes.length > APSP_MAX ? { ok: false, why: 'why.apspBig' } : spGraph(tb) ? { ok: true } : { ok: false, why: 'why.spWeights' };
    case 'comp': return { ok: true };
    case 'scc': case 'topo': return m.directed ? { ok: true } : { ok: false, why: 'why.directed' };
  }
  return { ok: false };
}
/* Graph for shortest paths: an edge without a weight (or every edge, when "Weighted" is off) counts as 1.
   Returns null when some written weight is not a number. */
function spGraph(tb) {
  const g = tb.graph;
  const bad = g.edges.some((e) => e.w !== null && e.w !== undefined && e.w !== '' && !GA.NUM_RE.test(String(e.w)));
  if (bad) return null;
  const unit = g.edges.filter((e) => e.w === null || e.w === undefined || e.w === '').length;
  return { g: Object.assign({}, g, { edges: g.edges.map((e) => (e.w === null || e.w === undefined || e.w === '' ? Object.assign({}, e, { w: '1' }) : e)) }), unit, all: unit === g.edges.length };
}
function seededRng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1e9) / 1e9; }; }

function computeAlgo(tb) {
  const V = { hulls: [], nodeFill: new Map(), nodeRing: new Map(), hex: new Set(), badge: new Map(), edge: new Map(), dim: false, keepN: new Set(), keepE: new Set(), res: null };
  tb.view = V;
  const g = tb.graph;
  if (!tb.algo) return;
  try {
    switch (tb.algo) {
      case 'matching': {
        const r = GA.matching(g);
        r.edges.forEach((id) => V.edge.set(id, { color: 'accent', w: 3.2 }));
        g.nodes.forEach((n) => V.nodeFill.set(n, SIDE_COLORS[tb.bip.side.get(n)]));
        V.res = r; break;
      }
      case 'bridges': {
        const r = GA.bridgesAndCuts(g);
        V.dim = true;
        r.bridges.forEach((id) => { V.edge.set(id, { color: '#e5484d', w: 3.4, double: true, glow: true }); V.keepE.add(id); });
        r.cuts.forEach((n) => { V.hex.add(n); V.nodeFill.set(n, '#f76b15'); V.nodeRing.set(n, '#c2410c'); V.keepN.add(n); });
        g.edges.forEach((e) => { if (r.bridges.has(e.id)) { V.keepN.add(e.u); V.keepN.add(e.v); } });
        V.res = r; break;
      }
      case 'ecc2': {
        const r = GA.twoEdgeCC(g);
        const col = (k) => COMP_COLORS[k % COMP_COLORS.length];
        const groups = new Map();
        g.nodes.forEach((n) => { const k = r.comp.get(n); (groups.get(k) || groups.set(k, []).get(k)).push(n); V.nodeFill.set(n, col(k)); });
        groups.forEach((ns, k) => V.hulls.push({ nodes: ns, color: col(k) }));
        g.edges.forEach((e) => {
          if (r.bridges.has(e.id)) V.edge.set(e.id, { color: '#e5484d', w: 1.6, dash: true });
          else V.edge.set(e.id, { color: col(r.comp.get(e.u)), w: 2.4 });
        });
        r.groups = [...groups.entries()].map(([k, ns]) => ({ color: col(k), nodes: ns.sort(GA.natCmp) }));
        V.res = r; break;
      }
      case 'bcc': {
        const r = GA.biconnected(g);
        const col = (k) => COMP_COLORS[k % COMP_COLORS.length];
        r.blocks.forEach((b, k) => {
          V.hulls.push({ nodes: b.nodes, color: col(k), edges: b.edges });
          b.edges.forEach((id) => V.edge.set(id, { color: col(k), w: 2.4 }));
          b.nodes.forEach((n) => { if (!r.cuts.has(n)) V.nodeFill.set(n, col(k)); });
        });
        r.cuts.forEach((n) => { V.hex.add(n); V.nodeFill.set(n, '#f76b15'); V.nodeRing.set(n, '#c2410c'); });
        r.groups = r.blocks.map((b, k) => ({ color: col(k), nodes: b.nodes }));
        V.res = r; break;
      }
      case 'mst': {
        const r = GA.mst(g);
        V.dim = true;
        r.edges.forEach((id) => { V.edge.set(id, { color: 'accent', w: 3.4 }); V.keepE.add(id); });
        g.nodes.forEach((n) => V.keepN.add(n));
        V.res = r; break;
      }
      case 'comp': case 'scc': {
        const r = tb.algo === 'comp' ? GA.components(g) : GA.scc(g);
        g.nodes.forEach((n) => V.nodeFill.set(n, COMP_COLORS[r.comp.get(n) % COMP_COLORS.length]));
        g.edges.forEach((e) => { if (r.comp.get(e.u) === r.comp.get(e.v)) V.edge.set(e.id, { color: COMP_COLORS[r.comp.get(e.u) % COMP_COLORS.length], w: 2.4 }); else V.edge.set(e.id, { faint: true }); });
        V.res = r; break;
      }
      case 'topo': {
        const r = GA.topo(g, tb.topoMode, seededRng(tb.topoSeed));
        if (r.ok) r.order.forEach((n, i) => V.badge.set(n, String(i + 1)));
        else if (r.cycle) {
          V.dim = true;
          const set = new Set(r.cycle);
          g.edges.forEach((e) => { if (set.has(e.id)) { V.edge.set(e.id, { color: '#e5484d', w: 3.4, glow: true }); V.keepE.add(e.id); V.keepN.add(e.u); V.keepN.add(e.v); } });
        }
        V.res = r; break;
      }
      case 'sp': {
        const S = tb.sp;
        if (!S.sources.length) { V.res = { empty: true }; break; }
        const sg = spGraph(tb);
        const r = Object.assign(GA.shortestPaths(sg.g, S.sources), { unit: sg.unit, allUnit: sg.all });
        g.nodes.forEach((n) => {
          const d = r.dist.get(n);
          V.badge.set(n, d === Infinity ? '∞' : d === -Infinity ? '−∞' : fmtNum(d));
        });
        r.parent.forEach((p) => V.edge.set(p.edge, { color: S.multi ? SRC_COLORS[r.origin.get(edgeTarget(g, p.edge, r)) % SRC_COLORS.length] : 'accent', w: 2.2, alpha: 0.55 }));
        if (S.multi) g.nodes.forEach((n) => { const o = r.origin.get(n); if (o >= 0 && r.dist.get(n) !== Infinity) V.nodeFill.set(n, lighten(SRC_COLORS[o % SRC_COLORS.length])); });
        S.sources.forEach((s, i) => V.nodeRing.set(s, S.multi ? SRC_COLORS[i % SRC_COLORS.length] : '#e5484d'));
        let path = null;
        if (S.target) {
          path = GA.pathTo(r, S.target);
          V.nodeRing.set(S.target, '#0b8a4f');
          if (path) path.edges.forEach((id) => V.edge.set(id, { color: '#e5484d', w: 4, glow: true }));
        }
        V.res = Object.assign({}, r, { path }); break;
      }
      case 'apsp': {
        const sg = spGraph(tb);
        const r = GA.allPairs(sg.g);
        const sel = tb.ap.sel;
        let path = null, dist = null;
        if (sel && tb.pos.has(sel.a) && tb.pos.has(sel.b)) {
          const ia = r.order.indexOf(sel.a), ib = r.order.indexOf(sel.b);
          dist = r.D[ia][ib];
          path = r.path(sel.a, sel.b);
          V.nodeRing.set(sel.a, '#e5484d'); V.nodeRing.set(sel.b, '#0b8a4f');
          if (path) {
            V.dim = true;
            path.forEach((n) => V.keepN.add(n));
            for (let i = 0; i + 1 < path.length; i++) {
              // cheapest edge between consecutive nodes (respecting direction)
              let best = null;
              sg.g.edges.forEach((e) => {
                const fw = e.u === path[i] && e.v === path[i + 1], bw = !sg.g.directed && e.v === path[i] && e.u === path[i + 1];
                if ((fw || bw) && (!best || Number(e.w) < Number(best.w))) best = e;
              });
              if (best) { V.edge.set(best.id, { color: '#e5484d', w: 4, glow: true }); V.keepE.add(best.id); }
            }
          }
        } else tb.ap.sel = null;
        V.res = { ap: r, unit: sg.unit, allUnit: sg.all, path, dist };
        break;
      }
      case 'neg': {
        const r = GA.negativeCycle(g);
        if (r) {
          V.dim = true;
          const set = new Set(r.edges);
          g.edges.forEach((e) => { if (set.has(e.id)) { V.edge.set(e.id, { color: '#e5484d', w: 3.6, glow: true }); V.keepE.add(e.id); } });
          r.nodes.forEach((n) => { V.keepN.add(n); V.nodeRing.set(n, '#e5484d'); });
        }
        V.res = { cycle: r }; break;
      }
    }
  } catch (e) { console.error(e); V.res = { error: String(e) }; }
}
function edgeTarget(g, id, r) { const e = g.edges.find((x) => x.id === id); const p = r.parent.get(e.v); return p && p.edge === id ? e.v : e.u; }
function fmtNum(x) { return Number.isInteger(x) ? String(x) : String(parseFloat(x.toPrecision(6))); }
function lighten(hex) {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const m = (c) => Math.round(c + (255 - c) * 0.55);
  return '#' + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1);
}

/* ============================================================ geometry */
function worldCenter() { return { x: (W / 2 - view.x) / view.k, y: (H / 2 - view.y) / view.k }; }
function toWorld(sx, sy) { return { x: (sx - view.x) / view.k, y: (sy - view.y) / view.k }; }
function edgeGeometry(tb) {
  // returns Map id -> {type:'line'|'curve'|'loop', ...}
  const g = tb.graph, R = look.radius;
  const groups = new Map(), loops = new Map(), geo = new Map();
  g.edges.forEach((e) => {
    if (e.u === e.v) { (loops.get(e.u) || loops.set(e.u, []).get(e.u)).push(e); return; }
    const k = e.u < e.v ? e.u + '\u0001' + e.v : e.v + '\u0001' + e.u;
    (groups.get(k) || groups.set(k, []).get(k)).push(e);
  });
  groups.forEach((list) => {
    const a = list[0].u < list[0].v ? list[0].u : list[0].v;
    const directedPair = tb.modes.directed && list.some((e) => e.u === a) && list.some((e) => e.u !== a);
    list.forEach((e, i) => {
      const P = tb.pos.get(e.u), Q = tb.pos.get(e.v);
      if (!P || !Q) return;
      let off = (i - (list.length - 1) / 2) * R * 1.4;
      if (list.length === 1 && directedPair) off = 0;
      if (list.length === 2 && directedPair && list[0].u !== list[1].u) off = (e.u === a ? -1 : 1) * R * 0.9;
      // perpendicular w.r.t. the canonical direction a→b
      const A = e.u === a ? P : Q, B = e.u === a ? Q : P;
      const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1;
      const nx = -dy / L, ny = dx / L;
      if (Math.abs(off) < 1e-6) geo.set(e.id, { type: 'line', P, Q });
      else {
        const C = { x: (P.x + Q.x) / 2 + nx * off * 2, y: (P.y + Q.y) / 2 + ny * off * 2 };
        geo.set(e.id, { type: 'curve', P, Q, C });
      }
    });
  });
  loops.forEach((list, n) => {
    const P = tb.pos.get(n); if (!P) return;
    list.forEach((e, i) => {
      const r = R * (0.75 + i * 0.45);
      geo.set(e.id, { type: 'loop', P, r, cx: P.x, cy: P.y - R - r * 0.8 + r * 0.15 });
    });
  });
  return geo;
}
function qPoint(G, t) {
  const a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
  return { x: a * G.P.x + b * G.C.x + c * G.Q.x, y: a * G.P.y + b * G.C.y + c * G.Q.y };
}
function trimT(G, fromEnd, R) {
  // find t where the curve leaves the node circle
  let lo = fromEnd ? 0.5 : 0, hi = fromEnd ? 1 : 0.5;
  const C = fromEnd ? G.Q : G.P;
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2, p = qPoint(G, m), d = Math.hypot(p.x - C.x, p.y - C.y);
    if (fromEnd) { if (d > R) lo = m; else hi = m; } else { if (d > R) hi = m; else lo = m; }
  }
  return (lo + hi) / 2;
}
function samplePts(G, R) {
  if (G.type === 'line') return [G.P, G.Q];
  if (G.type === 'curve') { const pts = []; for (let i = 0; i <= 20; i++) pts.push(qPoint(G, i / 20)); return pts; }
  const pts = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2; pts.push({ x: G.cx + Math.cos(a) * G.r, y: G.cy + Math.sin(a) * G.r }); } return pts;
}
function distSeg(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
  let t = L ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / L : 0;
  t = Math.max(0, Math.min(1, t));
  return { d: Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy), t };
}

/* ============================================================ hit testing */
function hitNode(tb, w) {
  const R = look.radius + 3 / view.k;
  let best = null, bd = Infinity;
  tb.pos.forEach((p, n) => { const d = Math.hypot(p.x - w.x, p.y - w.y); if (d <= R && d < bd) { bd = d; best = n; } });
  return best;
}
function hitEdge(tb, w) {
  const geo = edgeGeometry(tb), tol = Math.max(6 / view.k, look.edgeWidth);
  let best = null, bd = Infinity;
  geo.forEach((G, id) => {
    const pts = samplePts(G);
    for (let i = 0; i + 1 < pts.length; i++) { const d = distSeg(w, pts[i], pts[i + 1]).d; if (d < bd) { bd = d; best = id; } }
  });
  return bd <= tol ? best : null;
}

/* ============================================================ physics */
let rafOn = false;
function wake() { if (active) active.sleeping = 0; if (!rafOn) { rafOn = true; requestAnimationFrame(frame); } }
function step(tb) {
  const nodes = tb.graph.nodes, n = nodes.length;
  if (!n) return 0;
  const P = nodes.map((x) => tb.pos.get(x));
  const fx = new Float64Array(n), fy = new Float64Array(n);
  const L = look.edgeLen, rep = L * L * 0.9 * look.repel / 100, ten = 0.04 * look.tension / 100;
  const c = worldCenter();
  // repulsion (grid cutoff for big graphs)
  const cut = n > 350 ? L * 3 : Infinity;
  if (cut === Infinity) {
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      let dx = P[i].x - P[j].x, dy = P[i].y - P[j].y, d2 = dx * dx + dy * dy;
      if (d2 < 0.01) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 0.5; }
      const f = rep / d2, d = Math.sqrt(d2);
      fx[i] += f * dx / d; fy[i] += f * dy / d; fx[j] -= f * dx / d; fy[j] -= f * dy / d;
    }
  } else {
    const grid = new Map(), key = (x, y) => x + ',' + y;
    P.forEach((p, i) => { const k = key(Math.floor(p.x / cut), Math.floor(p.y / cut)); (grid.get(k) || grid.set(k, []).get(k)).push(i); });
    P.forEach((p, i) => {
      const gx = Math.floor(p.x / cut), gy = Math.floor(p.y / cut);
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const j of grid.get(key(gx + a, gy + b)) || []) {
        if (j <= i) continue;
        let dx = p.x - P[j].x, dy = p.y - P[j].y, d2 = dx * dx + dy * dy;
        if (d2 < 0.01) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 0.5; }
        const f = rep / d2, d = Math.sqrt(d2);
        fx[i] += f * dx / d; fy[i] += f * dy / d; fx[j] -= f * dx / d; fy[j] -= f * dy / d;
      }
    });
  }
  const idx = new Map(nodes.map((x, i) => [x, i]));
  // springs
  tb.graph.edges.forEach((e) => {
    if (e.u === e.v) return;
    const i = idx.get(e.u), j = idx.get(e.v);
    const dx = P[j].x - P[i].x, dy = P[j].y - P[i].y, d = Math.hypot(dx, dy) || 0.01;
    const f = ten * (d - L);
    fx[i] += f * dx / d; fy[i] += f * dy / d; fx[j] -= f * dx / d; fy[j] -= f * dy / d;
  });
  // edge physics: nodes push edges away
  if (tb.modes.physics && n <= 400) {
    const thr = look.radius * 2.2;
    tb.graph.edges.forEach((e) => {
      if (e.u === e.v) return;
      const i = idx.get(e.u), j = idx.get(e.v);
      for (let k = 0; k < n; k++) {
        if (k === i || k === j) continue;
        const r = distSeg(P[k], P[i], P[j]);
        if (r.d >= thr || r.t <= 0 || r.t >= 1) continue;
        const qx = P[i].x + (P[j].x - P[i].x) * r.t, qy = P[i].y + (P[j].y - P[i].y) * r.t;
        let dx = P[k].x - qx, dy = P[k].y - qy; const d = Math.hypot(dx, dy) || 0.01;
        dx /= d; dy /= d;
        const f = (thr - r.d) * 0.12;
        fx[k] += f * dx; fy[k] += f * dy;
        fx[i] -= f * dx * (1 - r.t); fy[i] -= f * dy * (1 - r.t);
        fx[j] -= f * dx * r.t; fy[j] -= f * dy * r.t;
      }
    });
  }
  // bipartite columns
  if (tb.modes.bip && tb.bip.ok) {
    nodes.forEach((x, i) => { const tx = c.x + (tb.bip.side.get(x) ? 1 : -1) * L * 0.9; fx[i] += (tx - P[i].x) * 0.08; });
  }
  // gravity
  for (let i = 0; i < n; i++) { fx[i] += (c.x - P[i].x) * 0.004; fy[i] += (c.y - P[i].y) * 0.004; }
  let energy = 0;
  for (let i = 0; i < n; i++) {
    const p = P[i];
    if (p.pinned || p === drag.node) { p.vx = p.vy = 0; continue; }
    p.vx = (p.vx + Math.max(-30, Math.min(30, fx[i]))) * 0.82;
    p.vy = (p.vy + Math.max(-30, Math.min(30, fy[i]))) * 0.82;
    p.x += p.vx; p.y += p.vy;
    energy += Math.abs(p.vx) + Math.abs(p.vy);
  }
  return energy / n;
}
function frame() {
  const tb = active;
  let keep = false;
  if (tb && !$('#tab-graph').hidden) {
    if (!tb.modes.lock) {
      const e = step(tb);
      if (e < 0.05 && !drag.node) tb.sleeping++; else tb.sleeping = 0;
      keep = tb.sleeping < 40;
    }
    if (flash && performance.now() < flash.until) keep = true;
    draw();
  }
  if (tb && !keep && tb.autoFit && !$('#tab-graph').hidden && W) { tb.autoFit = false; fit(); }
  if (keep || drag.active) requestAnimationFrame(frame); else rafOn = false;
}

/* ============================================================ drawing */
let cssCache = null, cssTime = 0;
function css() {
  const now = performance.now();
  if (!cssCache || now - cssTime > 400) {
    const s = getComputedStyle(document.documentElement);
    const g = (k) => s.getPropertyValue(k).trim();
    cssCache = { bg: g('--surface'), fg: g('--fg'), muted: g('--muted'), line: g('--line'), accent: g('--accent'), soft: g('--accent-soft'), bg2: g('--surface-2') };
    const dark = luminance(cssCache.bg) < 0.4;
    cssCache.wt = dark ? '#c9d1d9' : '#3d3d4f';    // edge weights
    cssCache.accentFg = g('--accent-fg') || '#fff';
    cssCache.lbFg = dark ? '#ffa657' : '#d9730d';   // node label text (orange, readable on both themes)
    cssCache.lbRing = dark ? '#8b949e' : '#b4b4c0'; // dotted ring around it
    cssTime = now;
  }
  return cssCache;
}
function luminance(hex) {
  if (!hex || hex[0] !== '#') return 1;
  const n = parseInt(hex.slice(1, 7), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}
function draw() {
  const tb = active;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (!tb) return;
  ctx.save();
  ctx.translate(view.x, view.y); ctx.scale(view.k, view.k);
  render(ctx, tb, css(), true);
  ctx.restore();
}
function render(c, tb, C, interactive) {
  const R = look.radius, V = tb.view, g = tb.graph;
  const geo = edgeGeometry(tb);
  const flashOn = interactive && flash && performance.now() < flash.until && Math.floor((flash.until - performance.now()) / 180) % 2 === 0;
  // component regions (2ECC / BCC): a rounded convex hull around each group of nodes
  if (V.hulls && V.hulls.length) {
    V.hulls.forEach((h, k) => {
      const pts = h.nodes.map((n) => tb.pos.get(n)).filter(Boolean);
      if (!pts.length) return;
      // in BCC, blocks share cut vertices: give each block a slightly different padding so outlines stay apart
      const pad = R + 9 + (tb.algo === 'bcc' ? (k % 3) * 4 : 0);
      hullPath(c, convexHull(pts), pad);
      c.globalAlpha = 0.16; c.fillStyle = h.color; c.fill();
      c.globalAlpha = 0.85; c.lineWidth = 2; c.strokeStyle = h.color; c.setLineDash([7, 5]); c.stroke(); c.setLineDash([]);
      c.globalAlpha = 1;
    });
  }
  // edges
  g.edges.forEach((e) => {
    const G = geo.get(e.id); if (!G) return;
    const st = V.edge.get(e.id) || {};
    let col = st.color === 'accent' ? C.accent : st.color || tb.edgeColor.get(e.id) || C.fg;
    let width = (st.w || 1) * look.edgeWidth * (tb.edgeBold.has(e.id) ? 2.2 : 1);
    let alpha = st.alpha || 1;
    if (st.faint) alpha = 0.3;
    if (V.dim && !V.keepE.has(e.id)) alpha = 0.22;
    if (flashOn && flash.edge === e.id) { col = '#e5484d'; width *= 1.8; alpha = 1; }
    c.globalAlpha = alpha;
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = width; c.lineCap = 'round';
    if (st.glow) { c.shadowColor = col; c.shadowBlur = 10; }
    const strokePath = () => {
      c.beginPath();
      if (G.type === 'line') {
        const dx = G.Q.x - G.P.x, dy = G.Q.y - G.P.y, L = Math.hypot(dx, dy) || 1;
        c.moveTo(G.P.x + dx / L * R, G.P.y + dy / L * R);
        c.lineTo(G.Q.x - dx / L * (R + (tb.modes.directed ? width * 1.5 : 0)), G.Q.y - dy / L * (R + (tb.modes.directed ? width * 1.5 : 0)));
      } else if (G.type === 'curve') {
        const t0 = trimT(G, false, R), t1 = trimT(G, true, R + (tb.modes.directed ? width * 1.5 : 0));
        const p0 = qPoint(G, t0);
        c.moveTo(p0.x, p0.y);
        for (let i = 1; i <= 24; i++) { const p = qPoint(G, t0 + (t1 - t0) * i / 24); c.lineTo(p.x, p.y); }
      } else c.arc(G.cx, G.cy, G.r, 0, Math.PI * 2);
      c.stroke();
    };
    if (st.double) {
      // bridge: thick outer stroke + inner gap line
      strokePath();
      c.shadowBlur = 0;
      c.globalAlpha = 1; c.strokeStyle = C.bg; c.lineWidth = width * 0.35; strokePath();
      c.strokeStyle = col; c.lineWidth = width;
    } else if (st.dash) { c.setLineDash([8, 6]); strokePath(); c.setLineDash([]); } else strokePath();
    c.shadowBlur = 0;
    if (tb.modes.directed) drawArrow(c, G, R, width, col);
    c.globalAlpha = 1;
  });
  // edge weights
  if (tb.modes.weighted) {
    c.font = `600 ${Math.round(look.font * 1.05)}px ${getComputedStyle(document.body).fontFamily}`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    g.edges.forEach((e) => {
      if (e.w === null || e.w === undefined || e.w === '') return;
      const G = geo.get(e.id); if (!G) return;
      const tw = c.measureText(e.w).width + 8, th = look.font * 1.05 + 4;
      // push the whole box off the edge: gap + half the box size measured along the edge normal
      const ext = (ax, ay) => Math.abs(ax) * tw / 2 + Math.abs(ay) * th / 2;
      const gap = look.labelOff * 0.5 + look.edgeWidth / 2 + 2;
      let p, nx = 0, ny = -1;
      if (G.type === 'loop') p = { x: G.cx, y: G.cy - G.r - gap - th / 2 };
      else {
        const m = G.type === 'line' ? { x: (G.P.x + G.Q.x) / 2, y: (G.P.y + G.Q.y) / 2 } : qPoint(G, 0.5);
        const dx = G.Q.x - G.P.x, dy = G.Q.y - G.P.y, L = Math.hypot(dx, dy) || 1;
        nx = -dy / L; ny = dx / L;
        if (G.type === 'curve') { const s = (G.C.x - m.x) * nx + (G.C.y - m.y) * ny; if (s < 0) { nx = -nx; ny = -ny; } }
        else if (ny > 0) { nx = -nx; ny = -ny; }
        const d = gap + ext(nx, ny);
        p = { x: m.x + nx * d, y: m.y + ny * d };
      }
      c.globalAlpha = V.dim && !V.keepE.has(e.id) ? 0.3 : 1;
      c.fillStyle = (V.edge.get(e.id) || {}).color === 'accent' ? C.accent : C.wt;
      c.fillText(e.w, p.x, p.y + 0.5);
      c.globalAlpha = 1;
    });
  }
  // node label directions: put each label where the node has the most free space (away from its edges)
  const lbDir = new Map(), bdDir = new Map();
  if (tb.labelMap.size || V.badge.size) {
    const ang = new Map();
    g.edges.forEach((e) => {
      if (e.u === e.v) { (ang.get(e.u) || ang.set(e.u, []).get(e.u)).push(-Math.PI / 2); return; }
      const a = tb.pos.get(e.u), b = tb.pos.get(e.v); if (!a || !b) return;
      (ang.get(e.u) || ang.set(e.u, []).get(e.u)).push(Math.atan2(b.y - a.y, b.x - a.x));
      (ang.get(e.v) || ang.set(e.v, []).get(e.v)).push(Math.atan2(a.y - b.y, a.x - b.x));
    });
    const freest = (list, start) => {
      let best = start, bestGap = -1;
      for (let i = 0; i < 16; i++) {
        const cand = start + i * Math.PI / 8;
        let gap = Math.PI;
        list.forEach((a) => { let d = Math.abs(cand - a) % (2 * Math.PI); if (d > Math.PI) d = 2 * Math.PI - d; gap = Math.min(gap, d); });
        if (gap > bestGap + 1e-6) { bestGap = gap; best = cand; }
      }
      return best;
    };
    tb.labelMap.forEach((_, n) => lbDir.set(n, freest(ang.get(n) || [], -Math.PI / 4))); // prefer top-right
    V.badge.forEach((_, n) => {
      const list = (ang.get(n) || []).slice();
      if (lbDir.has(n)) list.push(lbDir.get(n), lbDir.get(n)); // keep away from the label
      bdDir.set(n, freest(list, Math.PI / 2)); // prefer below
    });
  }
  // nodes
  const fontFam = getComputedStyle(document.body).fontFamily;
  c.textAlign = 'center'; c.textBaseline = 'middle';
  g.nodes.forEach((n) => {
    const p = tb.pos.get(n); if (!p) return;
    let fill = V.nodeFill.get(n) || (tb.modes.bip && tb.bip.ok ? SIDE_COLORS[tb.bip.side.get(n)] : null) || tb.nodeColor.get(n) || C.bg;
    const bold = tb.nodeBold.has(n);
    c.globalAlpha = V.dim && !V.keepN.has(n) ? 0.28 : 1;
    const ring = V.nodeRing.get(n);
    const flashMe = flashOn && flash.node === n;
    c.beginPath();
    if (V.hex.has(n)) {
      for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3, rr = R * 1.18; c[i ? 'lineTo' : 'moveTo'](p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr); }
      c.closePath();
    } else c.arc(p.x, p.y, R, 0, Math.PI * 2);
    c.fillStyle = fill; c.fill();
    c.lineWidth = look.nodeBorder * (bold ? 2.4 : 1) * (V.hex.has(n) ? 1.6 : 1);
    c.strokeStyle = flashMe ? '#e5484d' : ring || C.fg;
    if (ring) c.lineWidth = Math.max(c.lineWidth, 3.2);
    c.stroke();
    if (flashMe) { c.beginPath(); c.arc(p.x, p.y, R + 8, 0, Math.PI * 2); c.strokeStyle = '#e5484d'; c.lineWidth = 3; c.stroke(); }
    if (p.pinned) { c.beginPath(); c.arc(p.x, p.y, R + 4, 0, Math.PI * 2); c.strokeStyle = C.muted; c.lineWidth = 1.5; c.setLineDash([3, 3]); c.stroke(); c.setLineDash([]); }
    if (interactive && pending === n) { c.beginPath(); c.arc(p.x, p.y, R + 5, 0, Math.PI * 2); c.strokeStyle = C.accent; c.lineWidth = 2.5; c.stroke(); }
    const txt = fill === C.bg ? C.fg : (luminance(fill) > 0.55 ? '#16161d' : '#ffffff');
    c.fillStyle = txt;
    const fs = n.length > 4 ? look.font * 0.8 : look.font;
    c.font = `${bold ? '700' : '600'} ${Math.round(fs)}px ${fontFam}`;
    c.fillText(n, p.x, p.y + 0.5);
    // label from labels array
    const lb = tb.labelMap.get(n);
    if (lb !== undefined) {
      // label in a dotted bubble next to the node, on its freest side
      c.font = `700 ${Math.round(look.font * 1.05)}px ${fontFam}`;
      // regular octagon (almost round, with corners) big enough for the text
      const lr = Math.max((look.font * 1.05 + 14) / 2, c.measureText(lb).width / 2 + 9) / Math.cos(Math.PI / 8);
      const a = lbDir.has(n) ? lbDir.get(n) : -Math.PI / 4;
      const reach = R + 6 + lr;
      const lx = p.x + Math.cos(a) * reach, ly = p.y + Math.sin(a) * reach;
      c.beginPath();
      for (let i = 0; i < 8; i++) { const q = Math.PI / 8 + i * Math.PI / 4; c[i ? 'lineTo' : 'moveTo'](lx + Math.cos(q) * lr, ly + Math.sin(q) * lr); }
      c.closePath();
      c.fillStyle = C.bg; c.fill();
      c.lineWidth = 1.6; c.strokeStyle = C.lbRing; c.setLineDash([2.5, 3]); c.stroke(); c.setLineDash([]);
      c.fillStyle = C.lbFg; c.fillText(lb, lx, ly + 0.5);
    }
    // badge (topo order, distance): solid accent pill, so it never looks like a user label
    const bd = V.badge.get(n);
    if (bd !== undefined) {
      c.font = `700 ${Math.round(look.font * 1)}px ${fontFam}`;
      const bh = look.font + 10, bw = Math.max(bh, c.measureText(bd).width + 14);
      const a = bdDir.has(n) ? bdDir.get(n) : Math.PI / 2, ux = Math.cos(a), uy = Math.sin(a);
      const reach = R + 5 + Math.abs(ux) * bw / 2 + Math.abs(uy) * bh / 2;
      const bx = p.x + ux * reach, by = p.y + uy * reach;
      roundRect(c, bx - bw / 2, by - bh / 2, bw, bh, 5);
      c.fillStyle = C.accent; c.fill();
      c.lineWidth = 2; c.strokeStyle = C.bg; c.stroke();
      c.fillStyle = C.accentFg || '#fff'; c.fillText(bd, bx, by + 0.5);
    }
    c.globalAlpha = 1;
  });
  // pen strokes
  tb.strokes.forEach((s) => {
    if (s.pts.length < 2) return;
    c.globalAlpha = s.alpha; c.strokeStyle = s.color; c.lineWidth = s.width; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(s.pts[0], s.pts[1]);
    for (let i = 2; i < s.pts.length; i += 2) c.lineTo(s.pts[i], s.pts[i + 1]);
    c.stroke(); c.globalAlpha = 1;
  });
  // rubber band edge while dragging in add mode
  if (interactive && drag.edgeFrom && drag.cur) {
    const p = tb.pos.get(drag.edgeFrom);
    c.strokeStyle = C.accent; c.lineWidth = 2; c.setLineDash([6, 5]);
    c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(drag.cur.x, drag.cur.y); c.stroke(); c.setLineDash([]);
  }
  if (interactive && tool === 'eraser' && hover) {
    c.strokeStyle = C.muted; c.lineWidth = 1 / view.k; c.beginPath(); c.arc(hover.x, hover.y, look.eraser, 0, Math.PI * 2); c.stroke();
  }
}
/* Convex hull (monotone chain), returned with positive signed area in canvas coordinates */
function convexHull(pts) {
  const P = [...new Map(pts.map((p) => [p.x + ',' + p.y, { x: p.x, y: p.y }])).values()].sort((a, b) => a.x - b.x || a.y - b.y);
  if (P.length < 3) return P;
  const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo = [], up = [];
  for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], P[i]) <= 0) up.pop(); up.push(p); }
  const h = lo.slice(0, -1).concat(up.slice(0, -1));
  let area = 0;
  for (let i = 0; i < h.length; i++) { const a = h[i], b = h[(i + 1) % h.length]; area += a.x * b.y - b.x * a.y; }
  return area < 0 ? h.reverse() : h;
}
/* Outline of the hull grown by r: straight sides joined by arcs (1 point: circle, 2 points: capsule) */
function hullPath(c, h, r) {
  c.beginPath();
  if (h.length === 1) { c.arc(h[0].x, h[0].y, r, 0, Math.PI * 2); return; }
  const m = h.length;
  const nrm = (a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1; return Math.atan2(-dx / L, dy / L); };
  for (let i = 0; i < m; i++) {
    const prev = h[(i - 1 + m) % m], cur = h[i], next = h[(i + 1) % m];
    let a0 = nrm(prev, cur), a1 = nrm(cur, next);
    if (a1 < a0) a1 += Math.PI * 2;
    c.arc(cur.x, cur.y, r, a0, a1, false);
  }
  c.closePath();
}
function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function drawArrow(c, G, R, width, col) {
  let tip, dir;
  const size = Math.max(8, width * 3.2);
  if (G.type === 'line') {
    const dx = G.Q.x - G.P.x, dy = G.Q.y - G.P.y, L = Math.hypot(dx, dy) || 1;
    dir = { x: dx / L, y: dy / L }; tip = { x: G.Q.x - dir.x * R, y: G.Q.y - dir.y * R };
  } else if (G.type === 'curve') {
    const t1 = trimT(G, true, R); tip = qPoint(G, t1);
    const pr = qPoint(G, t1 - 0.04); const L = Math.hypot(tip.x - pr.x, tip.y - pr.y) || 1;
    dir = { x: (tip.x - pr.x) / L, y: (tip.y - pr.y) / L };
  } else {
    // loop: arrow where the loop re-enters the node (right side)
    const a = Math.PI * 0.62; tip = { x: G.cx + Math.cos(a) * G.r, y: G.cy + Math.sin(a) * G.r };
    dir = { x: -Math.sin(a), y: Math.cos(a) };
  }
  c.fillStyle = col; c.beginPath();
  c.moveTo(tip.x, tip.y);
  c.lineTo(tip.x - dir.x * size - dir.y * size * 0.55, tip.y - dir.y * size + dir.x * size * 0.55);
  c.lineTo(tip.x - dir.x * size + dir.y * size * 0.55, tip.y - dir.y * size - dir.x * size * 0.55);
  c.closePath(); c.fill();
}

/* ============================================================ interaction */
const drag = { active: false };
let pending = null, hover = null, flash = null, lastDown = 0;
function setTool(id) { tool = id; pending = null; renderToolbar(); updateHint(); draw(); }
function evtPos(e) { const r = canvas.getBoundingClientRect(); return { sx: e.clientX - r.left, sy: e.clientY - r.top }; }

canvas.addEventListener('pointerdown', (e) => {
  if (!active || e.button === 2) return;
  canvas.focus();
  hideEdit();
  const { sx, sy } = evtPos(e), w = toWorld(sx, sy), tb = active;
  canvas.setPointerCapture(e.pointerId);
  Object.assign(drag, { active: true, sx, sy, moved: false, node: null, pan: false, edgeFrom: null, cur: null, stroke: null, vx0: view.x, vy0: view.y, lastErase: null, erased: false });
  const n = hitNode(tb, w);
  if (tool === 'pen') {
    const s = { pts: [w.x, w.y, w.x + 0.01, w.y], color, width: look.pen, alpha: look.penAlpha / 100 }; // a click leaves a dot
    penSnapshot(tb);
    tb.strokes.push(s); drag.stroke = s; wake(); return;
  }
  if (tool === 'eraser') { eraseAt(w); return; }
  if (tool === 'add' && n) { drag.edgeFrom = n; drag.cur = w; wake(); return; }
  if ((tool === 'move' || tool === 'pin') && n) {
    drag.node = tb.pos.get(n); drag.nodeName = n; drag.off = { x: drag.node.x - w.x, y: drag.node.y - w.y }; wake(); return;
  }
  if (!n && (tool === 'move' || tool === 'paint' || tool === 'bold' || tool === 'pin' || tool === 'del')) { drag.pan = true; return; }
});
canvas.addEventListener('pointermove', (e) => {
  const { sx, sy } = evtPos(e), w = toWorld(sx, sy);
  hover = w;
  if (!drag.active) { if (tool === 'eraser') draw(); return; }
  if (Math.hypot(sx - drag.sx, sy - drag.sy) > 3) drag.moved = true;
  const tb = active;
  if (drag.stroke) { const P = drag.stroke.pts; if (P.length === 4 && P[2] - P[0] < 0.02 && P[3] === P[1]) P.length = 2; P.push(w.x, w.y); draw(); return; }
  if (tool === 'eraser') { eraseAt(w); return; }
  if (drag.edgeFrom) { drag.cur = w; draw(); return; }
  if (drag.node) { drag.node.x = w.x + drag.off.x; drag.node.y = w.y + drag.off.y; drag.node.vx = drag.node.vy = 0; tb.sleeping = 0; wake(); draw(); return; }
  if (drag.pan) { view.x = drag.vx0 + (sx - drag.sx); view.y = drag.vy0 + (sy - drag.sy); draw(); }
});
canvas.addEventListener('pointerup', (e) => {
  if (!drag.active) return;
  const { sx, sy } = evtPos(e), w = toWorld(sx, sy), tb = active;
  drag.active = false;
  const n = hitNode(tb, w);
  if (drag.stroke) { drag.stroke = null; return; }
  if (tool === 'eraser') { drag.lastErase = null; return; }
  if (drag.edgeFrom) {
    const from = drag.edgeFrom; drag.edgeFrom = null;
    if (drag.moved && n) addEdge(tb, from, n);
    else if (drag.moved && !n) {
      const name = freeName(tb);
      tb.pos.set(name, { x: w.x, y: w.y, vx: 0, vy: 0, pinned: false });
      addEdge(tb, from, name);
    }
    else if (!drag.moved) {
      if (pending) { addEdge(tb, pending, from); pending = null; }
      else pending = from;
      updateHint();
    }
    draw(); return;
  }
  const clickNode = !drag.moved ? n : null;
  if (drag.node) { drag.node = null; if (drag.moved) { wake(); return; } }
  if (drag.moved) return;
  // plain click
  const edge = clickNode ? null : hitEdge(tb, w);
  switch (tool) {
    case 'move':
      if (clickNode && tb.algo === 'sp') spClick(tb, clickNode);
      break;
    case 'add':
      if (!clickNode) {
        if (pending) { pending = null; updateHint(); draw(); break; }
        const name = freeName(tb);
        tb.pos.set(name, { x: w.x, y: w.y, vx: 0, vy: 0, pinned: false });
        editStructure(tb, (nodes) => nodes.push(name));
      }
      break;
    case 'del':
      if (clickNode && inRange(tb, clickNode)) {
        const r = nodeRange(tb);
        if (Number(clickNode) === r.base + r.n - 1) { tb.nCount = String(r.n - 1); $('#geN').value = tb.nCount; }
        else UI.toast(t('ge.inRange', { v: clickNode, last: r.base + r.n - 1 }));
      }
      if (clickNode) editStructure(tb, (nodes, edges) => { nodes.splice(nodes.indexOf(clickNode), 1); for (let i = edges.length - 1; i >= 0; i--) if (edges[i].u === clickNode || edges[i].v === clickNode) edges.splice(i, 1); });
      else if (edge) editStructure(tb, (nodes, edges) => { const i = edges.findIndex((x) => x.id === edge); if (i >= 0) { const x = edges[i]; edges.splice(i, 1); [x.u, x.v].forEach((v) => { if (!edges.some((y) => y.u === v || y.v === v) && !nodes.includes(v)) nodes.push(v); }); } });
      break;
    case 'paint':
      if (clickNode) { if (color) tb.nodeColor.set(clickNode, color); else tb.nodeColor.delete(clickNode); }
      else if (edge) { if (color) tb.edgeColor.set(edge, color); else tb.edgeColor.delete(edge); }
      draw(); break;
    case 'bold':
      if (clickNode) toggleSet(tb.nodeBold, clickNode); else if (edge) toggleSet(tb.edgeBold, edge);
      draw(); break;
    case 'pin':
      if (clickNode) { const p = tb.pos.get(clickNode); p.pinned = !p.pinned; wake(); draw(); }
      break;
  }
});
canvas.addEventListener('pointerleave', () => { hover = null; if (tool === 'eraser') draw(); });
function toggleSet(s, v) { if (s.has(v)) s.delete(v); else s.add(v); }
function addEdge(tb, a, b) {
  editStructure(tb, (nodes, edges) => {
    const key = a + '\u0001' + b;
    const k = edges.filter((e) => e.u === a && e.v === b).length;
    edges.push({ id: key + '\u0001' + k, u: a, v: b, w: null });
    // drop the isolated-node entries that are now part of an edge
  });
  // ask for a weight when the graph is weighted and already has weights
  if (tb.modes.weighted && tb.parsed.edges.some((e) => e.w !== null)) {
    const e = tb.parsed.edges[tb.parsed.edges.length - 1];
    openEdgeEditor(tb, e.id);
  }
}
/* ---- pen history (undo / redo for drawing) ---- */
const HIST_MAX = 100;
const cloneStrokes = (list) => list.map((x) => Object.assign({}, x, { pts: x.pts.slice() }));
function penHist(tb) { return tb.penHist || (tb.penHist = { undo: [], redo: [] }); }
function penSnapshot(tb) {
  const h = penHist(tb);
  h.undo.push(cloneStrokes(tb.strokes)); if (h.undo.length > HIST_MAX) h.undo.shift();
  h.redo = [];
  renderUndoBtns();
}
function penUndo(tb, redo) {
  const h = penHist(tb), from = redo ? h.redo : h.undo, to = redo ? h.undo : h.redo;
  if (!from.length) return;
  to.push(cloneStrokes(tb.strokes));
  tb.strokes = from.pop();
  renderUndoBtns(); draw();
}
function renderUndoBtns() {
  const h = active ? penHist(active) : { undo: [], redo: [] };
  const u = $('#geToolbar [data-act="undo"]'), r = $('#geToolbar [data-act="redo"]');
  if (u) u.disabled = !h.undo.length;
  if (r) r.disabled = !h.redo.length;
}

/* Real eraser: cut away only the part of each stroke inside the eraser circle (strokes split in two). */
function eraseStroke(s, w, r) {
  const P = s.pts, hit = r + s.width / 2;
  // quick reject: nothing of this stroke near the eraser
  let near = false;
  for (let i = 0; i + 1 < P.length && !near; i += 2) {
    const ax = P[i], ay = P[i + 1], bx = i + 3 < P.length ? P[i + 2] : ax, by = i + 3 < P.length ? P[i + 3] : ay;
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    const t0 = L2 ? Math.max(0, Math.min(1, ((w.x - ax) * dx + (w.y - ay) * dy) / L2)) : 0;
    if (Math.hypot(ax + dx * t0 - w.x, ay + dy * t0 - w.y) <= hit) near = true;
  }
  if (!near) return [s];
  // resample densely so the cut follows the circle, then keep the runs outside it
  const step = Math.max(0.75, Math.min(r, s.width) / 3);
  const pts = [];
  for (let i = 0; i < P.length; i += 2) {
    if (i === 0) { pts.push([P[0], P[1]]); continue; }
    const ax = P[i - 2], ay = P[i - 1], bx = P[i], by = P[i + 1];
    const k = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
    for (let j = 1; j <= k; j++) pts.push([ax + (bx - ax) * j / k, ay + (by - ay) * j / k]);
  }
  const pieces = []; let cur = [];
  pts.forEach(([x, y]) => {
    if (Math.hypot(x - w.x, y - w.y) <= hit) { if (cur.length) pieces.push(cur); cur = []; }
    else cur.push(x, y);
  });
  if (cur.length) pieces.push(cur);
  return pieces.filter((p) => p.length >= 4).map((p) => Object.assign({}, s, { pts: p }));
}
function eraseAt(w) {
  const tb = active, r = look.eraser;
  // sweep from the previous eraser position so fast moves leave no gaps
  const from = drag.lastErase || w, d = Math.hypot(w.x - from.x, w.y - from.y), k = Math.max(1, Math.ceil(d / (r / 2)));
  let changed = false;
  for (let j = 1; j <= k; j++) {
    const q = { x: from.x + (w.x - from.x) * j / k, y: from.y + (w.y - from.y) * j / k };
    const next = [];
    let hit = false;
    tb.strokes.forEach((s) => { const out = eraseStroke(s, q, r); if (out.length !== 1 || out[0] !== s) hit = true; next.push(...out); });
    if (hit) {
      if (!drag.erased) { drag.erased = true; penSnapshot(tb); } // one undo step per eraser drag
      tb.strokes = next; changed = true;
    }
  }
  drag.lastErase = w;
  if (changed || hover) draw();
}
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const { sx, sy } = evtPos(e);
  zoomAt(sx, sy, Math.exp(-e.deltaY * 0.0015));
}, { passive: false });
function zoomAt(sx, sy, f) {
  const k = Math.max(0.15, Math.min(5, view.k * f));
  const w = toWorld(sx, sy);
  view.k = k; view.x = sx - w.x * k; view.y = sy - w.y * k;
  draw();
}
canvas.addEventListener('dblclick', (e) => {
  const tb = active; if (!tb) return;
  const { sx, sy } = evtPos(e), w = toWorld(sx, sy);
  const n = hitNode(tb, w);
  if (n) { openNodeEditor(tb, n); return; }
  const ed = hitEdge(tb, w);
  if (ed) openEdgeEditor(tb, ed);
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

/* inline editor */
const edit = $('#geEdit');
let editCb = null;
function showEdit(wx, wy, value, cb) {
  edit.hidden = false; edit.value = value;
  edit.style.left = Math.max(4, Math.min(W - 124, wx * view.k + view.x - 60)) + 'px';
  edit.style.top = Math.max(4, Math.min(H - 34, wy * view.k + view.y - 14)) + 'px';
  editCb = cb; edit.focus(); edit.select();
}
function hideEdit(commit) {
  if (edit.hidden) return;
  const cb = editCb; editCb = null; edit.hidden = true;
  if (commit && cb) cb(edit.value.trim());
  canvas.focus();
}
edit.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); hideEdit(true); }
  else if (e.key === 'Escape') { e.preventDefault(); hideEdit(false); }
});
edit.addEventListener('blur', () => hideEdit(true));
function openNodeEditor(tb, n) {
  const p = tb.pos.get(n);
  showEdit(p.x, p.y, n, (v) => {
    if (v === n) return;
    if (!v || /\s/.test(v)) { UI.toast(t('ge.badName'), 'err'); return; }
    if (tb.parsed.nodes.includes(v)) { UI.toast(t('ge.nameTaken', { v }), 'err'); return; }
    tb.pos.set(v, tb.pos.get(n)); tb.pos.delete(n);
    if (tb.nodeColor.has(n)) { tb.nodeColor.set(v, tb.nodeColor.get(n)); tb.nodeColor.delete(n); }
    if (tb.nodeBold.has(n)) { tb.nodeBold.add(v); tb.nodeBold.delete(n); }
    tb.sp.sources = tb.sp.sources.map((s) => (s === n ? v : s)); if (tb.sp.target === n) tb.sp.target = v;
    editStructure(tb, (nodes, edges) => {
      nodes[nodes.indexOf(n)] = v;
      edges.forEach((e) => { if (e.u === n) e.u = v; if (e.v === n) e.v = v; });
    });
  });
}
function openEdgeEditor(tb, id) {
  const G = edgeGeometry(tb).get(id); if (!G) return;
  const e = tb.parsed.edges.find((x) => x.id === id); if (!e) return;
  const p = G.type === 'loop' ? { x: G.cx, y: G.cy - G.r } : G.type === 'curve' ? qPoint(G, 0.5) : { x: (G.P.x + G.Q.x) / 2, y: (G.P.y + G.Q.y) / 2 };
  showEdit(p.x, p.y, e.w || '', (v) => {
    if (!tb.modes.weighted && v) tb.modes.weighted = true;
    editStructure(tb, (nodes, edges) => { const x = edges.find((y) => y.id === id); if (x) x.w = v.replace(/\s+/g, '_') || null; });
    renderModes();
  });
}

/* keyboard */
document.addEventListener('keydown', (e) => {
  if ($('#tab-graph').hidden) return;
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
  if ((e.ctrlKey || e.metaKey) && !e.altKey && active) {
    const k = e.key.toLowerCase();
    if (k === 'z' && !e.shiftKey) { penUndo(active, false); e.preventDefault(); return; }
    if (k === 'y' || (k === 'z' && e.shiftKey)) { penUndo(active, true); e.preventDefault(); return; }
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Escape') { pending = null; updateHint(); draw(); return; }
  const tl = TOOLS.find((x) => x[1].toLowerCase() === e.key.toLowerCase());
  if (tl) { setTool(tl[0]); e.preventDefault(); return; }
  if (e.key === 'f' || e.key === 'F') { fit(); e.preventDefault(); }
});

/* shortest path clicks */
function spClick(tb, n) {
  const S = tb.sp;
  if (S.pick === 'dst') S.target = S.target === n ? null : n;
  else if (S.multi) { const i = S.sources.indexOf(n); if (i >= 0) S.sources.splice(i, 1); else S.sources.push(n); }
  else S.sources = [n];
  computeAlgo(tb); renderAlgoOut(); draw();
}

/* ============================================================ view */
function fit() {
  const tb = active; if (!tb || !tb.pos.size) { view.x = W / 2; view.y = H / 2; view.k = 1; draw(); return; }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  tb.pos.forEach((p) => { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
  const pad = look.radius * 3 + 20;
  const k = Math.max(0.15, Math.min(1.5, Math.min(W / (x1 - x0 + pad * 2), H / (y1 - y0 + pad * 2))));
  view.k = k; view.x = W / 2 - (x0 + x1) / 2 * k; view.y = H / 2 - (y0 + y1) / 2 * k;
  draw();
}
function resize() {
  const r = wrap.getBoundingClientRect();
  if (!r.width) return;
  const first = W === 0;
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  const cx = (W / 2 - view.x) / view.k, cy = (H / 2 - view.y) / view.k;
  W = r.width; H = r.height;
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  if (first) { view.x = W / 2; view.y = H / 2; } else { view.x = W / 2 - cx * view.k; view.y = H / 2 - cy * view.k; }
  draw();
}
new ResizeObserver(resize).observe(wrap);
$('#geZoomIn').onclick = () => zoomAt(W / 2, H / 2, 1.25);
$('#geZoomOut').onclick = () => zoomAt(W / 2, H / 2, 0.8);
$('#geFit').onclick = fit;

/* ============================================================ side panels */
function renderTabs() {
  const box = $('#geTabs');
  box.innerHTML = tabs.map((tb) => `<span class="ge-tab" role="tab" data-id="${tb.id}" aria-selected="${tb === active}" title="${esc(t('ge.renameHint'))}"><span class="nm">${esc(tb.name)}</span>${tabs.length > 1 ? `<button class="x" data-close="${tb.id}" aria-label="Close">×</button>` : ''}</span>`).join('') +
    `<button class="btn sm" id="geAddTab">${esc(t('ge.addTab'))}</button><button class="btn sm" id="geDupTab">${esc(t('ge.dupTab'))}</button>`;
}
$('#geTabs').addEventListener('click', (e) => {
  const x = e.target.closest('[data-close]');
  if (x) {
    const i = tabs.findIndex((tb) => tb.id === +x.dataset.close);
    const wasActive = tabs[i] === active;
    tabs.splice(i, 1);
    if (wasActive) activate(tabs[Math.max(0, i - 1)]); else renderTabs();
    return;
  }
  if (e.target.closest('#geAddTab')) { const tb = newTab(); tabs.push(tb); activate(tb); return; }
  if (e.target.closest('#geDupTab')) { if (active) { const tb = cloneTab(active); tabs.push(tb); activate(tb); } return; }
  const tbEl = e.target.closest('[data-id]');
  if (tbEl && !e.target.closest('input')) { const tb = tabs.find((x) => x.id === +tbEl.dataset.id); if (tb && tb !== active) activate(tb); }
});
$('#geTabs').addEventListener('dblclick', (e) => {
  const tbEl = e.target.closest('[data-id]'); if (!tbEl) return;
  const tb = tabs.find((x) => x.id === +tbEl.dataset.id);
  const nm = tbEl.querySelector('.nm');
  const inp = document.createElement('input'); inp.value = tb.name;
  nm.replaceWith(inp); inp.focus(); inp.select();
  const done = (ok) => { if (ok && inp.value.trim()) tb.name = inp.value.trim(); renderTabs(); };
  inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') done(true); if (ev.key === 'Escape') done(false); });
  inp.addEventListener('blur', () => done(true));
});
function cloneTab(src) {
  const tb = newTab(src.name + ' (2)', src.text, Object.assign({}, src.modes));
  tb.labels = src.labels; tb.nCount = src.nCount; tb.base = src.base;
  src.pos.forEach((p, n) => tb.pos.set(n, Object.assign({}, p)));
  tb.nodeColor = new Map(src.nodeColor); tb.nodeBold = new Set(src.nodeBold); tb.edgeColor = new Map(src.edgeColor); tb.edgeBold = new Set(src.edgeBold);
  tb.strokes = src.strokes.map((s) => Object.assign({}, s, { pts: s.pts.slice() }));
  rebuild(tb);
  return tb;
}
function activate(tb) {
  if (active) active.viewState = { x: view.x, y: view.y, k: view.k };
  active = tb; pending = null; renderUndoBtns();
  if (tb.viewState) Object.assign(view, tb.viewState);
  $('#geText').value = tb.text; $('#geLabels').value = tb.labels; $('#geN').value = tb.nCount; $('#geBase').value = tb.base;
  renderTabs(); renderSide(); wake();
}

function renderToolbar() {
  const bar = $('#geToolbar');
  bar.innerHTML = `<div class="ge-tools">${TOOLS.map(([id, key, svg]) => `<button class="ge-tool" data-tool="${id}" aria-pressed="${tool === id}" title="${esc(t('tool.' + id))} (${key})"><svg width="18" height="18" viewBox="0 0 24 24">${svg}</svg><kbd>${key}</kbd></button>`).join('')}</div>
    <div class="ge-sep"></div>
    <div class="ge-pal">${PALETTE.map((c) => `<button class="ge-sw" data-color="${c}" style="background:${c}" aria-pressed="${color === c}" title="${c}"></button>`).join('')}<button class="ge-sw none" data-color="" aria-pressed="${color === null}" title="×"></button></div>
    <div class="ge-sep"></div>
    <button class="btn sm" data-act="clearColors">${esc(t('act.clearColors'))}</button>
    <button class="btn sm icon" data-act="undo" title="${esc(t('act.undo'))}" aria-label="${esc(t('act.undo'))}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg></button>
    <button class="btn sm icon" data-act="redo" title="${esc(t('act.redo'))}" aria-label="${esc(t('act.redo'))}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/></svg></button>
    <button class="btn sm" data-act="clearPen">${esc(t('act.clearPen'))}</button>
    <button class="btn sm" data-act="unpin">${esc(t('act.unpin'))}</button>
    <button class="btn sm" data-act="relayout">${esc(t('act.relayout'))}</button>`;
  renderUndoBtns();
}
$('#geToolbar').addEventListener('click', (e) => {
  const tl = e.target.closest('[data-tool]'); if (tl) { setTool(tl.dataset.tool); return; }
  const sw = e.target.closest('[data-color]');
  if (sw) { color = sw.dataset.color || null; if (tool !== 'pen' && tool !== 'paint') tool = 'paint'; renderToolbar(); updateHint(); return; }
  const a = e.target.closest('[data-act]'); if (!a || !active) return;
  const tb = active;
  if (a.dataset.act === 'clearColors') { tb.nodeColor.clear(); tb.edgeColor.clear(); tb.nodeBold.clear(); tb.edgeBold.clear(); }
  if (a.dataset.act === 'undo' || a.dataset.act === 'redo') { penUndo(tb, a.dataset.act === 'redo'); return; }
  if (a.dataset.act === 'clearPen' && tb.strokes.length) { penSnapshot(tb); tb.strokes = []; }
  if (a.dataset.act === 'unpin') tb.pos.forEach((p) => { p.pinned = false; });
  if (a.dataset.act === 'relayout') { const c = worldCenter(); tb.pos.forEach((p) => { if (!p.pinned) { p.x = c.x + (Math.random() - 0.5) * W * 0.6 / view.k; p.y = c.y + (Math.random() - 0.5) * H * 0.6 / view.k; p.vx = p.vy = 0; } }); }
  wake(); draw();
});
function updateHint() {
  let h = t('hint.' + tool);
  if (tool === 'add' && pending) h = t('hint.addPending', { v: pending });
  if (tool === 'move' && active && active.algo === 'sp') h = active.sp.pick === 'dst' ? t('hint.spTarget') : active.sp.multi ? t('hint.spSources') : t('hint.spSource');
  $('#geHint').textContent = h;
}

function renderModes() {
  const tb = active, m = tb.modes;
  const row = (key, label, desc, disabled, why) => `<label class="ge-toggle${disabled ? ' off' : ''}"><input type="checkbox" data-mode="${key}"${m[key] ? ' checked' : ''}${disabled ? ' disabled' : ''}><span>${esc(t(label))}${desc || why ? `<small>${esc(why ? t(why) : t(desc))}</small>` : ''}</span></label>`;
  $('#geModes').innerHTML =
    row('directed', 'm.directed') + row('weighted', 'm.weighted', 'm.weighted.d') + row('multi', 'm.multi', 'm.multi.d') +
    row('lock', 'm.lock', 'm.lock.d') + row('physics', 'm.physics', 'm.physics.d') +
    row('bip', 'm.bip', 'm.bip.d', !tb.bip.ok, !tb.bip.ok ? 'm.bip.no' : null);
}
$('#geModes').addEventListener('change', (e) => {
  const k = e.target.dataset.mode; if (!k) return;
  active.modes[k] = e.target.checked;
  if (k === 'lock' && !e.target.checked) active.pos.forEach((p) => { p.vx = p.vy = 0; });
  rebuild(active); renderSide(); wake();
});

function renderLook() {
  $('#geLook').innerHTML = Object.keys(LOOK_DEFAULT).map((k) => {
    const [mn, mx, st] = LOOK_RANGE[k];
    return `<div class="ge-slider"><label for="lk-${k}">${esc(t('lk.' + ({ radius: 'radius', font: 'font', nodeBorder: 'nodeBorder', edgeWidth: 'edgeWidth', edgeLen: 'edgeLen', labelOff: 'labelOff', pen: 'pen', penAlpha: 'penAlpha', eraser: 'eraser', repel: 'repel', tension: 'tension' })[k]))}</label>
      <input type="range" id="lk-${k}" data-look="${k}" min="${mn}" max="${mx}" step="${st}" value="${look[k]}"><output>${look[k]}</output></div>`;
  }).join('') + `<button class="btn sm" id="lkReset">${esc(t('lk.reset'))}</button>`;
}
$('#geLook').addEventListener('input', (e) => {
  const k = e.target.dataset.look; if (!k) return;
  look[k] = Number(e.target.value); e.target.nextElementSibling.textContent = look[k];
  if (['edgeLen', 'repel', 'tension'].includes(k)) wake();
  draw();
});
$('#geLook').addEventListener('click', (e) => { if (e.target.id === 'lkReset') { Object.assign(look, LOOK_DEFAULT); renderLook(); wake(); draw(); } });

function renderAlgos() {
  const tb = active;
  $('#geAlgos').innerHTML = ALGOS.map((id) => {
    const av = algoAvailable(tb, id);
    return `<button class="ge-algo" data-algo="${id}" aria-pressed="${tb.algo === id}"${av.ok ? '' : ' disabled'}><span class="rb"></span><span>${esc(t('al.' + id))}${av.ok ? '' : `<small>${esc(t(av.why))}</small>`}</span></button>`;
  }).join('');
  renderAlgoOut();
}
$('#geAlgos').addEventListener('click', (e) => {
  const b = e.target.closest('[data-algo]'); if (!b || b.disabled) return;
  const tb = active;
  tb.algo = tb.algo === b.dataset.algo ? null : b.dataset.algo;
  if (tb.algo === 'sp' && tool !== 'move') setTool('move');
  computeAlgo(tb); renderAlgos(); updateHint(); draw();
});

function edgeLabel(tb, id) { const e = tb.graph.edges.find((x) => x.id === id); return e ? `${e.u} ${tb.modes.directed ? '→' : '–'} ${e.v}` : id; }
function items(list, kind) { return list.length ? `<div class="ge-items">${list.map((x) => `<span class="ge-item" data-flash-${kind}="${esc(x.id)}">${esc(x.label)}</span>`).join('')}</div>` : `<div class="hint">${esc(t('r.none'))}</div>`; }
function resRow(k, v) { return `<div class="ge-res-row"><span>${esc(k)}</span><b>${v}</b></div>`; }
function renderAlgoOut() {
  const tb = active, o = $('#geAlgoOut');
  if (!tb || !tb.algo) { o.innerHTML = ''; return; }
  const r = tb.view.res || {};
  if (r.error) { o.innerHTML = `<div class="msg err">${esc(r.error)}</div>`; return; }
  let h = '';
  switch (tb.algo) {
    case 'matching':
      h = resRow(t('r.matchSize'), r.size) + items([...r.edges].map((id) => ({ id, label: edgeLabel(tb, id) })), 'edge');
      break;
    case 'bridges':
      h = resRow(t('r.bridges'), r.bridges.size) + items([...r.bridges].map((id) => ({ id, label: edgeLabel(tb, id) })), 'edge') +
        resRow(t('r.cuts'), r.cuts.size) + items([...r.cuts].sort(GA.natCmp).map((n) => ({ id: n, label: n })), 'node') +
        `<div class="hint">${esc(t('r.flashHint'))}</div>`;
      break;
    case 'mst':
      h = resRow(t('r.mstTotal'), esc(fmtNum(r.total))) + resRow(t('r.edges'), r.edges.size) + resRow(t('r.trees'), r.trees);
      break;
    case 'ecc2': case 'bcc': {
      h = resRow(tb.algo === 'ecc2' ? t('r.ecc2') : t('r.bcc'), r.groups.length) +
        `<div class="ge-items">${r.groups.map((x) => `<span class="ge-item" style="border-color:${x.color};border-width:2px">{${esc(x.nodes.join(', '))}}</span>`).join('')}</div>` +
        (tb.algo === 'bcc' ? resRow(t('r.cuts'), r.cuts.size) + items([...r.cuts].sort(GA.natCmp).map((n) => ({ id: n, label: n })), 'node') : '') +
        `<div class="hint">${esc(t(tb.algo === 'ecc2' ? 'r.eccHint' : 'r.bccHint'))}</div>`;
      break;
    }
    case 'comp': case 'scc': {
      const groups = new Map();
      tb.graph.nodes.forEach((n) => { const c = r.comp.get(n); (groups.get(c) || groups.set(c, []).get(c)).push(n); });
      h = resRow(tb.algo === 'comp' ? t('r.comps') : t('r.sccs'), r.count) +
        `<div class="ge-items">${[...groups.entries()].map(([c, ns]) => `<span class="ge-item" style="border-color:${COMP_COLORS[c % COMP_COLORS.length]};border-width:2px">{${esc(ns.sort(GA.natCmp).join(', '))}}</span>`).join('')}</div>`;
      break;
    }
    case 'topo':
      if (r.ok) h = `<div class="lbl">${esc(t('r.order'))}</div><div class="ge-order">${esc(r.order.join(' '))}</div>`;
      else h = `<div class="msg err">${esc(t('r.cycle'))} ${esc((r.cycle || []).map((id) => edgeLabel(tb, id)).join(', '))}</div>`;
      h += `<div class="row"><button class="btn sm" data-topo="random">${esc(t('r.another'))}</button><button class="btn sm" data-topo="lex">${esc(t('r.lex'))}</button></div>`;
      break;
    case 'sp': {
      const S = tb.sp;
      h = `<div class="seg"><button data-spm="single" aria-selected="${!S.multi}">${esc(t('r.single'))}</button><button data-spm="multi" aria-selected="${S.multi}">${esc(t('r.multi'))}</button></div>
        <div class="row" style="font-size:12.5px"><span>${esc(t('r.pick'))}</span><div class="seg" style="flex:1"><button data-spp="src" aria-selected="${S.pick === 'src'}">${esc(t('r.pickSrc'))}</button><button data-spp="dst" aria-selected="${S.pick === 'dst'}">${esc(t('r.pickDst'))}</button></div></div>`;
      if (r.empty) { h += `<div class="hint">${esc(t('r.noSource'))}</div>`; break; }
      h += resRow(t('r.sources'), esc(S.sources.join(', '))) + resRow(t('r.algoUsed'), r.negative ? 'Bellman-Ford' : r.allUnit ? 'BFS' : 'Dijkstra');
      if (r.unit) h += `<div class="hint">${esc(r.allUnit ? t('r.allUnit') : t('r.someUnit', { k: r.unit }))}</div>`;
      if (r.anyNegInf) h += `<div class="msg err">${esc(t('r.negInf'))}</div>`;
      if (S.target) {
        h += resRow(t('r.target'), esc(S.target));
        if (r.path) h += resRow(t('r.dist'), esc(fmtNum(r.path.length))) + `<div class="lbl">${esc(t('r.path'))}</div><div class="ge-order">${esc(r.path.nodes.join(' → '))}</div>`;
        else h += resRow(t('r.dist'), esc(r.dist.get(S.target) === -Infinity ? '−∞' : t('r.noPath')));
      }
      h += `<button class="btn sm" data-spclear>${esc(t('r.clear'))}</button>`;
      break;
    }
    case 'apsp': {
      const S = tb.ap.sel;
      h = resRow(t('r.algoUsed'), 'Floyd–Warshall') + resRow(t('r.nodes'), r.ap.order.length);
      if (r.unit) h += `<div class="hint">${esc(r.allUnit ? t('r.allUnit') : t('r.someUnit', { k: r.unit }))}</div>`;
      if (r.ap.neg) h += `<div class="msg err">${esc(t('r.apNeg'))}</div>`;
      h += `<button class="btn sm primary" data-apopen>${esc(t('r.apOpen'))}</button>`;
      if (S) {
        h += resRow(t('r.pair'), esc(S.a + ' → ' + S.b)) + resRow(t('r.dist'), esc(fmtDist(r.dist)));
        if (r.path) h += `<div class="lbl">${esc(t('r.path'))}</div><div class="ge-order">${esc(r.path.join(' → '))}</div>`;
        h += `<button class="btn sm" data-apclear>${esc(t('r.clear'))}</button>`;
      } else h += `<div class="hint">${esc(t('r.apHint'))}</div>`;
      break;
    }
    case 'neg':
      if (!r.cycle) h = `<div class="msg note" style="padding:0">${esc(t('r.negNone'))}</div>`;
      else h = `<div class="msg err">${esc(t('r.negFound'))}</div><div class="ge-order">${esc(r.cycle.nodes.concat(r.cycle.undirectedEdge && r.cycle.nodes.length === 1 ? [] : [r.cycle.nodes[0]]).join(' → '))}</div>` +
        resRow(t('r.negTotal'), esc(fmtNum(r.cycle.total))) + (r.cycle.undirectedEdge ? `<div class="hint">${esc(t('r.negUndirected'))}</div>` : '');
      break;
  }
  o.innerHTML = h;
}
$('#geAlgoOut').addEventListener('click', (e) => {
  const tb = active;
  const tp = e.target.closest('[data-topo]');
  if (tp) { tb.topoMode = tp.dataset.topo; tb.topoSeed = (Math.random() * 1e9) | 0; computeAlgo(tb); renderAlgoOut(); draw(); return; }
  const m = e.target.closest('[data-spm]');
  if (m) { tb.sp.multi = m.dataset.spm === 'multi'; if (!tb.sp.multi) tb.sp.sources = tb.sp.sources.slice(0, 1); computeAlgo(tb); renderAlgoOut(); updateHint(); draw(); return; }
  const pk = e.target.closest('[data-spp]');
  if (pk) { tb.sp.pick = pk.dataset.spp; renderAlgoOut(); updateHint(); return; }
  if (e.target.closest('[data-apopen]')) { openMatrix(tb); return; }
  if (e.target.closest('[data-apclear]')) { tb.ap.sel = null; computeAlgo(tb); renderAlgoOut(); draw(); return; }
  if (e.target.closest('[data-spclear]')) { tb.sp.sources = []; tb.sp.target = null; tb.sp.pick = 'src'; computeAlgo(tb); renderAlgoOut(); updateHint(); draw(); return; }
  const fe = e.target.closest('[data-flash-edge]'), fn = e.target.closest('[data-flash-node]');
  if (fe || fn) { flash = { edge: fe ? fe.dataset.flashEdge : null, node: fn ? fn.dataset.flashNode : null, until: performance.now() + 1500 }; wake(); }
});

function fmtDist(d) { return d === Infinity ? '∞' : d === -Infinity ? '−∞' : fmtNum(d); }
function sortedOrder(r) { return r.order.map((n, i) => [n, i]).sort((x, y) => GA.natCmp(x[0], y[0])); }
function matrixText(r) {
  const ord = sortedOrder(r);
  const cell = (d) => (d === Infinity ? 'INF' : d === -Infinity ? '-INF' : fmtNum(d));
  return ord.map(([, i]) => ord.map(([, j]) => cell(r.D[i][j])).join(' ')).join('\n');
}
let modal = null;
function openMatrix(tb) {
  const r = tb.view.res && tb.view.res.ap; if (!r) return;
  const ord = sortedOrder(r);
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'ge-modal';
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('[data-mclose]')) { modal.hidden = true; return; }
      if (e.target.closest('[data-mcopy]')) { UI.copy(modal._text); return; }
      const td = e.target.closest('td[data-a]');
      if (td && active) {
        active.ap.sel = { a: td.dataset.a, b: td.dataset.b };
        modal.hidden = true;
        computeAlgo(active); renderAlgoOut(); draw();
      }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal && !modal.hidden) modal.hidden = true; });
  }
  modal._text = matrixText(r);
  const sel = tb.ap.sel;
  const head = ord.map(([n]) => `<th class="num">${esc(n)}</th>`).join('');
  const rows = ord.map(([a, i]) => `<tr><th>${esc(a)}</th>${ord.map(([b, j]) => {
    const d = r.D[i][j];
    const cls = [i === j ? 'diag' : '', d === Infinity ? 'inf' : '', d === -Infinity ? 'neginf' : '', sel && sel.a === a && sel.b === b ? 'sel' : ''].filter(Boolean).join(' ');
    return `<td class="num ${cls}" data-a="${esc(a)}" data-b="${esc(b)}" title="${esc(a)} → ${esc(b)}">${esc(fmtDist(d))}</td>`;
  }).join('')}</tr>`).join('');
  modal.innerHTML = `<div class="ge-modal-box" role="dialog" aria-modal="true">
    <div class="ge-modal-head"><b>${esc(t('r.apTitle'))}</b><span class="hint">${esc(t('r.apCellHint'))}</span><div class="grow"></div>
      <button class="btn sm" data-mcopy>${esc(t('r.apCopy'))}</button><button class="btn sm" data-mclose>${esc(t('r.apClose'))}</button></div>
    ${r.neg ? `<div class="msg err">${esc(t('r.apNeg'))}</div>` : ''}
    <div class="ge-matrix"><table class="tbl"><thead><tr><th>${esc(t('r.apFromTo'))}</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
  modal.hidden = false;
}

function renderStatus() {
  const tb = active, p = tb.parsed;
  let h = `<span>${esc(t('ge.stat', { n: tb.graph.nodes.length, m: tb.graph.edges.length }))}</span>`;
  const r = nodeRange(tb);
  if (r && r.capped) h += `<span class="err">${esc(t('ge.nCap', { max: N_MAX }))}</span>`;
  $('#geStatus').innerHTML = h;
}
function renderSide() { renderModes(); renderAlgos(); renderStatus(); updateHint(); if ($('#geShift')) renderShift(); }

/* data inputs */
const onText = UI.debounce(() => { const tb = active; tb.text = $('#geText').value; rebuild(tb); renderSide(); wake(); }, 200);
$('#geText').addEventListener('input', onText);
$('#geLabels').addEventListener('input', UI.debounce(() => { active.labels = $('#geLabels').value; rebuild(active); draw(); }, 150));
$('#geN').addEventListener('input', UI.debounce(() => { active.nCount = $('#geN').value; rebuild(active); renderSide(); wake(); }, 200));
$('#geBase').addEventListener('change', () => { active.base = $('#geBase').value; rebuild(active); renderSide(); wake(); });

/* ============================================================ node offset: add k to every (integer) node name */
const INT_RE = /^[+-]?\d+$/;
function allIntNodes(tb) { return tb.parsed.nodes.length > 0 && tb.parsed.nodes.every((n) => INT_RE.test(n)); }
function shiftNodes(tb, k) {
  if (!allIntNodes(tb) || !k) return false;
  const sh = (n) => (INT_RE.test(n) ? String(BigInt(n) + BigInt(k)) : n);
  // 1) the data text: shift the first two tokens of each edge line, or the single token of a node line
  const isolated = new Set();
  const r = nodeRange(tb);
  let lines = tb.text.split(/\r?\n/).map((l) => {
    const s0 = l.trim();
    if (!s0 || s0.startsWith('#') || s0.startsWith('//')) return l;
    const tk = s0.split(/\s+/);
    tk[0] = sh(tk[0]); if (tk.length > 1) tk[1] = sh(tk[1]);
    return tk.join(' ');
  });
  // 2) the node-count range (1..n / 0..n-1) moves too; if it leaves 0/1, write its nodes out explicitly
  if (r) {
    const nb = r.base + k;
    if (nb === 0 || nb === 1) tb.base = String(nb);
    else {
      const inText = new Set();
      lines.forEach((l) => { const s0 = l.trim(); if (s0 && !s0.startsWith('#') && !s0.startsWith('//')) s0.split(/\s+/).slice(0, 2).forEach((x) => inText.add(x)); });
      for (let i = r.base; i < r.base + r.n; i++) { const v = String(i + k); if (!inText.has(v)) isolated.add(v); }
      tb.nCount = '';
    }
  }
  if (isolated.size) lines = lines.concat([...isolated]);
  tb.text = lines.join('\n');
  // 3) everything keyed by node name or edge id keeps its node
  const mapKeys = (m) => new Map([...m].map(([key, v]) => [sh(key), v]));
  const edgeId = (id) => { const p = id.split('\u0001'); return p.length === 3 ? [sh(p[0]), sh(p[1]), p[2]].join('\u0001') : id; };
  tb.pos = mapKeys(tb.pos);
  tb.nodeColor = mapKeys(tb.nodeColor);
  tb.nodeBold = new Set([...tb.nodeBold].map(sh));
  tb.edgeColor = new Map([...tb.edgeColor].map(([id, v]) => [edgeId(id), v]));
  tb.edgeBold = new Set([...tb.edgeBold].map(edgeId));
  tb.sp.sources = tb.sp.sources.map(sh);
  if (tb.sp.target) tb.sp.target = sh(tb.sp.target);
  if (tb.ap.sel) tb.ap.sel = { a: sh(tb.ap.sel.a), b: sh(tb.ap.sel.b) };
  pending = null;
  return true;
}
function renderShift() {
  const ok = active && allIntNodes(active);
  $$('#geShift button').forEach((b) => { b.disabled = !ok; });
  $('#geShiftK').disabled = !ok;
  $('#geShiftNote').textContent = ok ? '' : t('ge.shiftOff');
}
$('#geShift').addEventListener('click', (e) => {
  const b = e.target.closest('[data-shift]'); if (!b || !active) return;
  let k = b.dataset.shift === 'k' ? $('#geShiftK').value.trim() : b.dataset.shift;
  if (!INT_RE.test(k)) { UI.toast(t('ge.shiftBad'), 'err'); return; }
  k = Number(k);
  if (!shiftNodes(active, k)) return;
  $('#geText').value = active.text; $('#geN').value = active.nCount; $('#geBase').value = active.base;
  rebuild(active); renderSide(); wake();
  UI.toast(t('ge.shiftDone', { k: k > 0 ? '+' + k : k }));
});

/* ============================================================ export */
function edgeListText(tb, withHeader) {
  const g = tb.graph;
  const deg = new Set(); const lines = [];
  if (withHeader) lines.push(g.nodes.length + ' ' + g.edges.length);
  g.edges.forEach((e) => { lines.push(e.u + ' ' + e.v + (e.w !== null && e.w !== undefined && e.w !== '' ? ' ' + e.w : '')); deg.add(e.u); deg.add(e.v); });
  if (!withHeader) g.nodes.forEach((n) => { if (!deg.has(n)) lines.push(n); });
  return lines.join('\n');
}
function copyEdges(withHeader) {
  const txt = edgeListText(active, withHeader);
  const done = () => UI.toast(t('copiedEdges', { m: active.graph.edges.length }));
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, () => { UI.copy(txt); });
  else UI.copy(txt);
}
$('#geCopy').onclick = () => copyEdges(false);
$('#geCopyHdr').onclick = () => copyEdges(true);
function graphImage(tb) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const grow = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
  tb.pos.forEach((p) => grow(p.x, p.y));
  tb.strokes.forEach((s) => { for (let i = 0; i < s.pts.length; i += 2) grow(s.pts[i], s.pts[i + 1]); });
  if (x0 === Infinity) { x0 = y0 = 0; x1 = y1 = 100; }
  const pad = look.radius * 3 + 30, scale = 2;
  const w = x1 - x0 + pad * 2, h = y1 - y0 + pad * 2;
  const off = document.createElement('canvas');
  off.width = Math.min(8000, Math.round(w * scale)); off.height = Math.min(8000, Math.round(h * scale));
  const c = off.getContext('2d');
  const C = css();
  c.fillStyle = C.bg; c.fillRect(0, 0, off.width, off.height);
  c.scale(scale, scale); c.translate(pad - x0, pad - y0);
  render(c, tb, C, false);
  return off;
}
$('#gePng').onclick = () => {
  const tb = active; if (!tb) return;
  graphImage(tb).toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (tb.name.replace(/[\\/:*?"<>|\s]+/g, '_') || 'graph') + '.png';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  });
};

$('#geCopyImg').onclick = () => {
  const tb = active; if (!tb) return;
  const fail = () => UI.toast(t('copyImgFail'));
  if (!navigator.clipboard || !window.ClipboardItem) { fail(); return; }
  // pass a promise so Safari keeps the user gesture
  const blob = new Promise((res) => graphImage(tb).toBlob(res, 'image/png'));
  navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => UI.toast(t('copiedImg')), fail);
};

/* ============================================================ public API (Stress test → graph) */
/* Test files usually start with "n m" (or "n" for trees) followed by the edges and maybe queries.
   Turn that first line into the node count and keep only the edge lines. */
function splitTestInput(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const isInt = (x) => /^\d+$/.test(x);
  const f = lines.length ? lines[0].trim().split(/\s+/) : [];
  if (!f.length || !f.every(isInt) || f.length > 2) return { body: text, n: 0 };
  const m = f.length === 2 ? Number(f[1]) : Number(f[0]) - 1;
  const edgeLines = lines.slice(1, 1 + m);
  if (m < 0 || edgeLines.length < m || !edgeLines.every((l) => { const k = l.trim().split(/\s+/).length; return k >= 2 && k <= 3; })) return { body: text, n: 0 };
  const zero = edgeLines.some((l) => l.trim().split(/\s+/).slice(0, 2).includes('0'));
  return { body: edgeLines.join('\n'), n: Number(f[0]), base: zero ? '0' : '1' };
}
window.GraphEditor = {
  /* screen position of a node (used by automated tests) */
  nodeScreenPos(n) { const p = active && active.pos.get(n); return p ? { x: p.x * view.k + view.x, y: p.y * view.k + view.y } : null; },
  openText(name, text) {
    const { body, n, base } = splitTestInput(text);
    const tb = newTab(name, body);
    if (n) { tb.nCount = String(n); tb.base = base; rebuild(tb); }
    tabs.push(tb);
    if (window.showTab) window.showTab('graph');
    activate(tb);
    setTimeout(() => { resize(); wake(); }, 50);
  },
};

/* ============================================================ init */
const SAMPLE = '1 2 4\n1 3 2\n2 3 1\n2 4 5\n3 5 8\n4 5 2\n4 6 6\n5 6 3\n6 7 1\n7 8 2\n7 9 3\n8 9 4\n9 10 2';
tabs.push(newTab(null, SAMPLE));
renderToolbar(); renderLook();
activate(tabs[0]);
I18N.onChange(() => { renderToolbar(); renderLook(); renderTabs(); renderSide(); });
// redraw the canvas with the new colors when the theme changes
const redrawTheme = () => { cssCache = null; draw(); };
document.addEventListener('themechange', () => setTimeout(redrawTheme, 0));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redrawTheme);
document.addEventListener('tabshow', (e) => { if (e.detail === 'graph') setTimeout(() => { resize(); wake(); }, 30); });
})();
