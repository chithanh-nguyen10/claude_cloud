/* Phần 1: Calculator */
(function () {
'use strict';
const { $, $$, esc, kv, out, errBox, note, kvVal, chip, verdict, evalField, numField, wire } = UI;

I18N.add({
  vi: {
    'calc.nav.notebook': 'Máy tính', 'calc.nav.complexity': 'Độ phức tạp', 'calc.nav.sums': 'Tổng & vòng lặp',
    'calc.nav.analysis': 'Truy hồi & tích phân', 'calc.nav.nt': 'Số học', 'calc.nav.comb': 'Tổ hợp',
    'nb.title': 'Máy tính', 'nb.desc': 'Mỗi dòng một phép tính. Đặt biến bằng "n = 2e5" rồi dùng ở các dòng dưới. Số nguyên được tính chính xác (không giới hạn chữ số). Bấm vào kết quả để chép.',
    'nb.add': '+ Thêm dòng', 'nb.clear': 'Xoá hết', 'nb.example': 'Nạp ví dụ', 'nb.keys': 'Enter: dòng mới · Backspace ở dòng trống: xoá dòng · ↑↓: di chuyển',
    'nb.angle': 'Đơn vị góc', 'nb.deg': 'Độ',
    'nb.ref': 'Hàm và cú pháp', 'nb.ph': 'Nhập biểu thức, vd n*log(n)',
    'cx.title': 'Độ phức tạp', 'cx.desc': 'Nhập độ phức tạp dạng biểu thức (log là log cơ số 2). Kết luận dựa trên Time limit và tốc độ ở thanh Máy chấm.',
    'cx.est': 'Ước lượng thời gian', 'cx.tpl': 'Mẫu dựng sẵn', 'cx.tplNone': '— Tự nhập —', 'cx.expr': 'Độ phức tạp', 'cx.vars': 'Biến',
    'cx.const': 'Hệ số hằng', 'cx.ops': 'Số phép tính', 'cx.time': 'Thời gian ước lượng', 'cx.ofTL': '{p}% time limit',
    'cx.verdict': 'Kết luận', 'cx.inv': 'Tính ngược: n tối đa', 'cx.invExpr': 'Độ phức tạp theo n (các biến khác lấy từ ô Biến bên trái)',
    'cx.invHint': 'Tìm n lớn nhất để chạy kịp trong time limit (giả sử hàm tăng theo n).', 'cx.nmax': 'n tối đa', 'cx.none': 'Không có n nào chạy kịp',
    'cx.budget': 'Ngân sách phép tính', 'cx.cmp': 'Bảng so sánh', 'cx.cmpTag': 'với n = {n}', 'cx.colCx': 'Độ phức tạp', 'cx.colOps': 'Số phép',
    'cx.colTime': 'Thời gian', 'cx.colV': 'Kết luận', 'cx.colNmax': 'n tối đa',
    'tpl.seg': 'Segment tree: (n + q)·log n', 'tpl.bit': 'Fenwick (BIT): (n + q)·log n', 'tpl.mo': "Mo's algorithm: (n + q)·√n",
    'tpl.dij': 'Dijkstra (heap): (n + m)·log n', 'tpl.floyd': 'Floyd–Warshall: n³', 'tpl.bf': 'Bellman–Ford: n·m',
    'tpl.bitmask': 'DP bitmask: 2ⁿ·n²', 'tpl.submask': 'Duyệt submask: 3ⁿ', 'tpl.fft': 'FFT/NTT: n·log n (hằng số lớn)',
    'tpl.sort': 'Sắp xếp: n·log n', 'tpl.sparse': 'Sparse table: n·log n + q', 'tpl.sieve': 'Sàng Eratosthenes: n·ln ln n',
    'tpl.bs': 'Chặt nhị phân đáp án: n·log(1e18)', 'tpl.mat': 'Nhân ma trận lũy thừa: k³·log n', 'tpl.sqrt': 'Chia căn: q·√n',
    'tpl.lca': 'LCA binary lifting: (n + q)·log n', 'tpl.dsu': 'DSU (gộp theo hạng + nén đường): (n + q)·α(n)',
    'sum.title': 'Tổng & vòng lặp', 'sum.desc': 'Các tổng hay gặp khi phân tích độ phức tạp, và bộ đếm số lần lặp của vòng lặp lồng nhau.',
    'sum.harm': 'Harmonic sum', 'sum.primes': 'Tổng trên số nguyên tố', 'sum.custom': 'Tổng tự định nghĩa', 'sum.loops': 'Đếm vòng lặp lồng nhau',
    'h.H': 'H(n) = Σ 1/i', 'h.sum': 'Σ n/i = n·H(n)', 'h.approx': 'n·ln n', 'h.floor': 'Σ ⌊n/i⌋ (= Σ d(i))', 'h.distinct': 'Số giá trị khác nhau của ⌊n/i⌋',
    'h.floorApprox': 'xấp xỉ n·ln n + (2γ − 1)·n (n > 1e14)', 'h.verdict': 'Duyệt bội số (Σ n/i bước)',
    'p.sum': 'Σ 1/p (p ≤ n)', 'p.ops': 'Σ n/p (số bước sàng)', 'p.approx': 'n·ln ln n', 'p.pi': 'π(n) số lượng số nguyên tố ≤ n',
    'p.approxNote': 'xấp xỉ ln ln n + 0.2615 (n > 2e7)',
    'cs.count': 'Số số hạng', 'cs.value': 'Giá trị tổng', 'cs.exactLoop': 'tính trực tiếp', 'cs.em': 'xấp xỉ bằng tích phân (Euler–Maclaurin)',
    'loop.add': '+ Thêm vòng lặp', 'loop.del': '− Bỏ vòng trong cùng', 'loop.vars': 'Biến (biến đầu tiên dùng để suy ra công thức)',
    'loop.count': 'Số lần lặp thân trong cùng', 'loop.formula': 'Công thức theo {v}', 'loop.direct': 'đếm trực tiếp',
    'loop.fit': 'nội suy đa thức từ các giá trị nhỏ của {v}', 'loop.trend': 'không phải đa thức; ước lượng theo xu hướng, chỉ để tham khảo',
    'loop.tooMany': 'Quá nhiều vòng lặp để đếm trực tiếp và không suy được công thức.', 'loop.badStep': 'Bước nhảy phải > 0 (với +=) hoặc > 1 (với *=)',
    'an.title': 'Truy hồi & tích phân', 'an.desc': 'Định lý thợ (Master), Akra–Bazzi, tính trực tiếp một hệ thức truy hồi và tích phân số.',
    'an.master': 'Định lý thợ (Master)', 'an.evalAt': 'Tính T tại n =', 'an.akra': 'Akra–Bazzi', 'an.terms': 'Mỗi dòng "a b" nghĩa là a·T(n/b)',
    'an.rec': 'Tính trực tiếp truy hồi', 'an.baseN': 'Cơ sở: n ≤', 'an.baseV': 'thì T(n) =', 'an.int': 'Tích phân số',
    'an.recHint': 'Dùng T(...) trong biểu thức. Đối số tự làm tròn xuống, vd T(n/2) là T(⌊n/2⌋).',
    'ms.c': 'c = log_b(a)', 'ms.case': 'Trường hợp', 'ms.result': 'Kết quả', 'ms.T': 'T(n) tính trực tiếp',
    'ms.case1': '1: f(n) = O(n^(c−ε)), lá cây đệ quy chiếm ưu thế', 'ms.case2': '2: f(n) = Θ(n^c·log^p n), mọi tầng ngang nhau',
    'ms.case3': '3: f(n) = Ω(n^(c+ε)), gốc chiếm ưu thế (điều kiện chính quy thoả)', 'ms.case2b': '2 mở rộng (p = −1)', 'ms.case2c': '2 mở rộng (p < −1)',
    'ms.badAB': 'Cần a ≥ 1 và b > 1', 'ab.p': 'p thoả Σ aᵢ·bᵢ^(−p) = 1', 'ab.badTerms': 'Mỗi dòng cần 2 số: a > 0 và b > 1',
    're.value': 'T(N)', 're.calls': 'Số trạng thái đã tính', 're.tooDeep': 'Truy hồi quá sâu. Hãy giảm N (tối đa 2e6 với dạng T(n−1)).',
    're.selfRef': 'T(n) gọi lại T với đối số ≥ n, truy hồi không dừng.',
    'ig.value': 'Giá trị tích phân', 'ig.bad': 'Tích phân không hội tụ hoặc hàm không xác định trên đoạn',
    'nt.title': 'Số học', 'nt.desc': 'Phân tích thừa số (Pollard-rho, đến 1e30), số ước, tổng ước, số ước lớn nhất, đếm số nguyên tố.',
    'nt.one': 'Phân tích một số', 'nt.fac': 'Phân tích', 'nt.d': 'd(n) số ước', 'nt.sigma': 'σ(n) tổng ước', 'nt.phi': 'φ(n)', 'nt.prime': 'Nguyên tố?',
    'nt.yes': 'Có', 'nt.no': 'Không', 'nt.maxdiv': 'Số ước nhiều nhất', 'nt.maxdivCount': 'Số ước lớn nhất của x ≤ N', 'nt.maxdivNum': 'Đạt tại x =',
    'nt.omegaN': 'ω(n): số ước nguyên tố phân biệt', 'nt.bigOmega': 'Ω(n): số thừa số nguyên tố (tính lặp)', 'nt.spf': 'Ước nguyên tố nhỏ nhất / lớn nhất',
    'nt.kind': 'Tính chất', 'nt.squarefree': 'không chính phương (squarefree)', 'nt.power': 'lũy thừa đúng: {b}^{g}', 'nt.rad': 'rad(n): tích các ước nguyên tố',
    'nt.divs': 'Các ước', 'nt.divsMany': 'có {n} ước, chỉ hiện khi ≤ 5000', 'nt.copyPlain': 'Chép dạng p^e', 'nt.copyLines': 'Chép dạng "p e" từng dòng', 'nt.copyDivs': 'Chép các ước',
    'fb.title': 'Phân tích nhiều số', 'fb.in': 'Các số (cách nhau bởi dấu cách hoặc xuống dòng; viết được biểu thức như 2^61-1, 1e18+9)', 'fb.copy': 'Chép kết quả',
    'fb.colN': 'n', 'fb.colF': 'Phân tích', 'fb.colD': 'd(n)', 'fb.colW': 'ω', 'fb.info': '{n} số · {ms} ms', 'fb.max': 'Chỉ phân tích 300 số đầu',
    'est.title': 'Ước lượng nhanh', 'est.hint': 'Các con số hay cần khi chọn thuật toán và giới hạn mảng. Số đánh dấu "≈" là ước lượng, còn lại là chính xác.',
    'est.div': 'Ước', 'est.prime': 'Số nguyên tố', 'est.maxd': 'Số ước nhiều nhất của x ≤ N', 'est.maxdAt': 'đạt tại x = {x}', 'est.cbrt': 'Quy tắc nhanh: d(x) thường ≤ khoảng ∛x · 2 (∛N = {v})',
    'est.avgd': 'Số ước trung bình (x ≤ N)', 'est.avgdSub': '≈ ln N', 'est.maxw': 'Số ước nguyên tố phân biệt nhiều nhất', 'est.maxW': 'Số thừa số nguyên tố nhiều nhất (tính lặp)', 'est.maxWSub': '⌊log₂ N⌋, đạt tại 2^k',
    'est.pi': 'π(N): số lượng số nguyên tố ≤ N', 'est.piApprox': 'không có giá trị chính xác cho N này; ≈ li(N)', 'est.piBounds': 'Chặn chắc chắn (Dusart)', 'est.nln': 'N / ln N', 'est.li': 'li(N)',
    'est.density': 'Mật độ số nguyên tố quanh N', 'est.densitySub': '≈ 1 / ln N: trung bình cứ {g} số có một số nguyên tố',
    'est.prev': 'Số nguyên tố lớn nhất ≤ N', 'est.next': 'Số nguyên tố nhỏ nhất > N', 'est.nth': 'Số nguyên tố thứ N (p_N)', 'est.nthApprox': 'N > 1e6 nên chỉ ước lượng; chặn: {lo} < p_N < {hi}',
    'est.sqfree': 'Số số không chính phương (squarefree) ≤ N', 'est.sqfreeSub': '≈ 6/π² · N',
    'nt.colPi': 'π(N)',
    'nt.omega': 'Số ước nguyên tố phân biệt nhiều nhất', 'nt.omegaNum': 'Đạt tại (tích các số nguyên tố đầu)', 'nt.colN': 'N', 'nt.colD': 'max d(x)', 'nt.colX': 'x', 'nt.colW': 'max ω(x)',
    'nt.pi': 'Đếm số nguyên tố', 'nt.piExact': 'π(n) chính xác', 'nt.piBig': 'chỉ tính chính xác khi n ≤ 1e11 hoặc n = 10^k ≤ 1e18 (xem Ước lượng nhanh)', 'nt.nln': 'n / ln n', 'nt.li': 'li(n)',
    'nt.sumd': 'Tổng số ước, tổng của tổng ước', 'nt.sumD': 'Σ d(i), i ≤ n', 'nt.sumS': 'Σ σ(i), i ≤ n', 'nt.sumSApprox': 'xấp xỉ π²/12·n² (n > 1e12)',
    'nt.sumDApprox': 'xấp xỉ n·ln n + (2γ − 1)·n (n > 1e14)',
    'cb.title': 'Tổ hợp', 'cb.desc': 'Giá trị chính xác bằng số nguyên lớn, và kiểm tra nhanh xem vét cạn có chạy kịp không.',
    'cb.values': 'Giá trị', 'cb.feas': 'Vét cạn có chạy kịp không?', 'cb.colF': 'Hàm', 'cb.colV': 'Giá trị', 'cb.colD': 'Số chữ số',
    'cb.skip': '(n quá lớn để tính)', 'cb.colPat': 'Kiểu vét cạn', 'cb.colOps': 'Số phép', 'cb.colT': 'Thời gian', 'cb.colVd': 'Kết luận',
    'fs.perm': 'Duyệt hoán vị', 'fs.permn': 'Hoán vị, mỗi cái O(n)', 'fs.subset': 'Duyệt tập con', 'fs.subsetn': 'Tập con, mỗi cái O(n)',
    'fs.bitdp': 'DP bitmask 2ⁿ·n²', 'fs.submask': 'Duyệt submask 3ⁿ', 'fs.choose': 'Chọn k phần tử C(n,k)', 'fs.choosek': 'C(n,k), mỗi cái O(k)',
    'fs.power': 'Mỗi vị trí k lựa chọn… nᵏ', 'fs.mitm': 'Meet in the middle 2^(n/2)·n',
  },
  en: {
    'calc.nav.notebook': 'Calculator', 'calc.nav.complexity': 'Complexity', 'calc.nav.sums': 'Sums & loops',
    'calc.nav.analysis': 'Recurrences & integrals', 'calc.nav.nt': 'Number theory', 'calc.nav.comb': 'Combinatorics',
    'nb.title': 'Calculator', 'nb.desc': 'One calculation per line. Set variables with "n = 2e5" and use them below. Integers are exact (no digit limit). Click a result to copy it.',
    'nb.add': '+ Add line', 'nb.clear': 'Clear all', 'nb.example': 'Load example', 'nb.keys': 'Enter: new line · Backspace on empty line: delete · ↑↓: move',
    'nb.angle': 'Angle unit', 'nb.deg': 'Deg',
    'nb.ref': 'Functions and syntax', 'nb.ph': 'Type an expression, e.g. n*log(n)',
    'cx.title': 'Complexity', 'cx.desc': 'Type the complexity as an expression (log is base 2). The verdict uses the time limit and speed from the Judge bar.',
    'cx.est': 'Running time estimate', 'cx.tpl': 'Preset', 'cx.tplNone': '— Custom —', 'cx.expr': 'Complexity', 'cx.vars': 'Variables',
    'cx.const': 'Constant factor', 'cx.ops': 'Operations', 'cx.time': 'Estimated time', 'cx.ofTL': '{p}% of time limit',
    'cx.verdict': 'Verdict', 'cx.inv': 'Inverse: maximum n', 'cx.invExpr': 'Complexity in n (other variables come from the Variables field on the left)',
    'cx.invHint': 'Finds the largest n that fits in the time limit (assumes the function grows with n).', 'cx.nmax': 'Maximum n', 'cx.none': 'No n fits',
    'cx.budget': 'Operation budget', 'cx.cmp': 'Comparison table', 'cx.cmpTag': 'for n = {n}', 'cx.colCx': 'Complexity', 'cx.colOps': 'Operations',
    'cx.colTime': 'Time', 'cx.colV': 'Verdict', 'cx.colNmax': 'Max n',
    'tpl.seg': 'Segment tree: (n + q)·log n', 'tpl.bit': 'Fenwick (BIT): (n + q)·log n', 'tpl.mo': "Mo's algorithm: (n + q)·√n",
    'tpl.dij': 'Dijkstra (heap): (n + m)·log n', 'tpl.floyd': 'Floyd–Warshall: n³', 'tpl.bf': 'Bellman–Ford: n·m',
    'tpl.bitmask': 'Bitmask DP: 2ⁿ·n²', 'tpl.submask': 'Submask enumeration: 3ⁿ', 'tpl.fft': 'FFT/NTT: n·log n (large constant)',
    'tpl.sort': 'Sorting: n·log n', 'tpl.sparse': 'Sparse table: n·log n + q', 'tpl.sieve': 'Sieve of Eratosthenes: n·ln ln n',
    'tpl.bs': 'Binary search on answer: n·log(1e18)', 'tpl.mat': 'Matrix power: k³·log n', 'tpl.sqrt': 'Sqrt decomposition: q·√n',
    'tpl.lca': 'LCA binary lifting: (n + q)·log n', 'tpl.dsu': 'DSU (union by rank + path compression): (n + q)·α(n)',
    'sum.title': 'Sums & loops', 'sum.desc': 'Sums that show up in complexity analysis, plus an iteration counter for nested loops.',
    'sum.harm': 'Harmonic sum', 'sum.primes': 'Sum over primes', 'sum.custom': 'Custom sum', 'sum.loops': 'Nested loop counter',
    'h.H': 'H(n) = Σ 1/i', 'h.sum': 'Σ n/i = n·H(n)', 'h.approx': 'n·ln n', 'h.floor': 'Σ ⌊n/i⌋ (= Σ d(i))', 'h.distinct': 'Distinct values of ⌊n/i⌋',
    'h.floorApprox': 'approx. n·ln n + (2γ − 1)·n (n > 1e14)', 'h.verdict': 'Iterating multiples (Σ n/i steps)',
    'p.sum': 'Σ 1/p (p ≤ n)', 'p.ops': 'Σ n/p (sieve steps)', 'p.approx': 'n·ln ln n', 'p.pi': 'π(n) primes ≤ n',
    'p.approxNote': 'approx. ln ln n + 0.2615 (n > 2e7)',
    'cs.count': 'Number of terms', 'cs.value': 'Sum', 'cs.exactLoop': 'computed directly', 'cs.em': 'approximated with an integral (Euler–Maclaurin)',
    'loop.add': '+ Add loop', 'loop.del': '− Remove innermost', 'loop.vars': 'Variables (the first one is used to derive a formula)',
    'loop.count': 'Innermost body runs', 'loop.formula': 'Formula in {v}', 'loop.direct': 'counted directly',
    'loop.fit': 'polynomial fit from small values of {v}', 'loop.trend': 'not a polynomial; trend estimate, for reference only',
    'loop.tooMany': 'Too many iterations to count directly and no formula could be derived.', 'loop.badStep': 'Step must be > 0 (for +=) or > 1 (for *=)',
    'an.title': 'Recurrences & integrals', 'an.desc': 'Master theorem, Akra–Bazzi, direct evaluation of a recurrence, and numeric integration.',
    'an.master': 'Master theorem', 'an.evalAt': 'Evaluate T at n =', 'an.akra': 'Akra–Bazzi', 'an.terms': 'Each line "a b" means a·T(n/b)',
    'an.rec': 'Evaluate a recurrence', 'an.baseN': 'Base: n ≤', 'an.baseV': 'then T(n) =', 'an.int': 'Numeric integral',
    'an.recHint': 'Use T(...) in the expression. Arguments are floored, e.g. T(n/2) means T(⌊n/2⌋).',
    'ms.c': 'c = log_b(a)', 'ms.case': 'Case', 'ms.result': 'Result', 'ms.T': 'T(n) evaluated',
    'ms.case1': '1: f(n) = O(n^(c−ε)), the leaves dominate', 'ms.case2': '2: f(n) = Θ(n^c·log^p n), every level costs the same',
    'ms.case3': '3: f(n) = Ω(n^(c+ε)), the root dominates (regularity holds)', 'ms.case2b': '2 extended (p = −1)', 'ms.case2c': '2 extended (p < −1)',
    'ms.badAB': 'Needs a ≥ 1 and b > 1', 'ab.p': 'p with Σ aᵢ·bᵢ^(−p) = 1', 'ab.badTerms': 'Each line needs 2 numbers: a > 0 and b > 1',
    're.value': 'T(N)', 're.calls': 'States computed', 're.tooDeep': 'Recursion too deep. Reduce N (at most 2e6 for T(n−1) style).',
    're.selfRef': 'T(n) calls T with an argument ≥ n, so the recurrence never ends.',
    'ig.value': 'Integral value', 'ig.bad': 'The integral diverges or the function is undefined on the interval',
    'nt.title': 'Number theory', 'nt.desc': 'Factorization (Pollard-rho, up to 1e30), divisor count and sum, maximum divisor count, prime counting.',
    'nt.one': 'Factor a number', 'nt.fac': 'Factorization', 'nt.d': 'd(n) divisor count', 'nt.sigma': 'σ(n) divisor sum', 'nt.phi': 'φ(n)', 'nt.prime': 'Prime?',
    'nt.yes': 'Yes', 'nt.no': 'No', 'nt.maxdiv': 'Most divisors', 'nt.maxdivCount': 'Max divisor count for x ≤ N', 'nt.maxdivNum': 'Reached at x =',
    'nt.omegaN': 'ω(n): distinct prime factors', 'nt.bigOmega': 'Ω(n): prime factors with repetition', 'nt.spf': 'Smallest / largest prime factor',
    'nt.kind': 'Properties', 'nt.squarefree': 'squarefree', 'nt.power': 'perfect power: {b}^{g}', 'nt.rad': 'rad(n): product of the prime factors',
    'nt.divs': 'Divisors', 'nt.divsMany': '{n} divisors, listed only when ≤ 5000', 'nt.copyPlain': 'Copy as p^e', 'nt.copyLines': 'Copy as "p e" lines', 'nt.copyDivs': 'Copy divisors',
    'fb.title': 'Factor many numbers', 'fb.in': 'Numbers (separated by spaces or new lines; expressions like 2^61-1, 1e18+9 work)', 'fb.copy': 'Copy results',
    'fb.colN': 'n', 'fb.colF': 'Factorization', 'fb.colD': 'd(n)', 'fb.colW': 'ω', 'fb.info': '{n} numbers · {ms} ms', 'fb.max': 'Only the first 300 numbers are factored',
    'est.title': 'Quick estimates', 'est.hint': 'Numbers you often need when choosing an algorithm or array sizes. Values marked "≈" are estimates, the rest are exact.',
    'est.div': 'Divisors', 'est.prime': 'Primes', 'est.maxd': 'Max divisor count for x ≤ N', 'est.maxdAt': 'reached at x = {x}', 'est.cbrt': 'Rule of thumb: d(x) is usually ≤ about 2·∛x (∛N = {v})',
    'est.avgd': 'Average divisor count (x ≤ N)', 'est.avgdSub': '≈ ln N', 'est.maxw': 'Max number of distinct prime factors', 'est.maxW': 'Max number of prime factors (with repetition)', 'est.maxWSub': '⌊log₂ N⌋, reached at 2^k',
    'est.pi': 'π(N): number of primes ≤ N', 'est.piApprox': 'no exact value for this N; ≈ li(N)', 'est.piBounds': 'Guaranteed bounds (Dusart)', 'est.nln': 'N / ln N', 'est.li': 'li(N)',
    'est.density': 'Prime density around N', 'est.densitySub': '≈ 1 / ln N: on average one prime every {g} numbers',
    'est.prev': 'Largest prime ≤ N', 'est.next': 'Smallest prime > N', 'est.nth': 'N-th prime (p_N)', 'est.nthApprox': 'N > 1e6, estimate only; bounds: {lo} < p_N < {hi}',
    'est.sqfree': 'Squarefree numbers ≤ N', 'est.sqfreeSub': '≈ 6/π² · N',
    'nt.colPi': 'π(N)',
    'nt.omega': 'Max number of distinct prime factors', 'nt.omegaNum': 'Reached at (product of first primes)', 'nt.colN': 'N', 'nt.colD': 'max d(x)', 'nt.colX': 'x', 'nt.colW': 'max ω(x)',
    'nt.pi': 'Prime counting', 'nt.piExact': 'π(n) exact', 'nt.piBig': 'exact only for n ≤ 1e11 or n = 10^k ≤ 1e18 (see Quick estimates)', 'nt.nln': 'n / ln n', 'nt.li': 'li(n)',
    'nt.sumd': 'Sums of divisor functions', 'nt.sumD': 'Σ d(i), i ≤ n', 'nt.sumS': 'Σ σ(i), i ≤ n', 'nt.sumSApprox': 'approx. π²/12·n² (n > 1e12)',
    'nt.sumDApprox': 'approx. n·ln n + (2γ − 1)·n (n > 1e14)',
    'cb.title': 'Combinatorics', 'cb.desc': 'Exact values with big integers, and a quick check of whether brute force fits the time limit.',
    'cb.values': 'Values', 'cb.feas': 'Will brute force pass?', 'cb.colF': 'Function', 'cb.colV': 'Value', 'cb.colD': 'Digits',
    'cb.skip': '(n too large)', 'cb.colPat': 'Brute force', 'cb.colOps': 'Operations', 'cb.colT': 'Time', 'cb.colVd': 'Verdict',
    'fs.perm': 'All permutations', 'fs.permn': 'Permutations, O(n) each', 'fs.subset': 'All subsets', 'fs.subsetn': 'Subsets, O(n) each',
    'fs.bitdp': 'Bitmask DP 2ⁿ·n²', 'fs.submask': 'Submask enumeration 3ⁿ', 'fs.choose': 'Choose k items C(n,k)', 'fs.choosek': 'C(n,k), O(k) each',
    'fs.power': 'k choices per position… nᵏ', 'fs.mitm': 'Meet in the middle 2^(n/2)·n',
  },
});

const FNREF = [
  ['+ − * / % ^', 'Cộng, trừ, nhân, chia, chia lấy dư, lũy thừa. Viết 2n, 3(n+1) cũng được', 'Arithmetic. Implicit multiplication like 2n, 3(n+1) works'],
  ['a // b', 'Chia lấy phần nguyên (làm tròn xuống)', 'Floor division'],
  ['2e5 · 1e9+7 · 10^18 · 1\'000\'000', 'Cách viết số kiểu CP, đều là số nguyên chính xác', 'CP-style numbers, all exact integers'],
  ['n!  fact(n)', 'Giai thừa (chính xác đến 20000!, sau đó xấp xỉ)', 'Factorial (exact up to 20000!, then approximate)'],
  ['log(x)  log2(x)  lg(x)', 'Log cơ số 2 (quy ước CP)', 'Base-2 logarithm (CP convention)'],
  ['log(x, b)  ln(x)  log10(x)', 'Log cơ số b, tự nhiên, cơ số 10', 'Log base b, natural log, log base 10'],
  ['sqrt  isqrt  cbrt  exp  pow', 'Căn, căn nguyên, căn bậc 3, eˣ, lũy thừa', 'Root, integer root, cube root, eˣ, power'],
  ['floor ceil round abs', 'Làm tròn, trị tuyệt đối', 'Rounding, absolute value'],
  ['min max gcd lcm', 'Nhận nhiều tham số', 'Take any number of arguments'],
  ['C(n,k)  P(n,k)', 'Tổ hợp, chỉnh hợp', 'Binomial, permutations'],
  ['catalan fib partitions bell', 'Catalan, Fibonacci, phân hoạch p(n), Bell', 'Catalan, Fibonacci, partitions p(n), Bell'],
  ['S1(n,k)  S2(n,k)', 'Stirling loại 1 (không dấu), loại 2', 'Stirling numbers of the 1st (unsigned) and 2nd kind'],
  ['d sigma isprime', 'Số ước, tổng ước, kiểm tra nguyên tố', 'Divisor count, divisor sum, primality'],
  ['factor(n)', 'Phân tích thừa số nguyên tố, vd factor(360) = 2³ · 3² · 5', 'Prime factorization, e.g. factor(360) = 2³ · 3² · 5'],
  ['omega bigomega spf lpf', 'Số ước nguyên tố phân biệt, tính lặp; ước nguyên tố nhỏ nhất, lớn nhất', 'Distinct / total prime factors; smallest / largest prime factor'],
  ['phi(n)  totient(n)', 'Phi Euler: số số từ 1 đến n nguyên tố cùng nhau với n', 'Euler phi: how many of 1..n are coprime to n'],
  ['ackinv(n)  alpha(n)', 'Nghịch đảo Ackermann α(n) (độ phức tạp DSU). α(n) ≤ 4 với mọi n thực tế', 'Inverse Ackermann α(n) (DSU complexity). α(n) ≤ 4 for every practical n'],
  ['nextprime prevprime nthprime', 'Số nguyên tố kế tiếp (> n), liền trước (< n), thứ n (n ≤ 1e6)', 'Next prime (> n), previous prime (< n), n-th prime (n ≤ 1e6)'],
  ['maxomega(N)', 'Số ước nguyên tố phân biệt nhiều nhất của x ≤ N', 'Max number of distinct prime factors for x ≤ N'],
  ['primepi(n)  maxdiv(N)', 'Số lượng số nguyên tố ≤ n, số ước lớn nhất của x ≤ N', 'Primes ≤ n, max divisor count for x ≤ N'],
  ['H(n)  sumfloor(n)  sumsigma(n)', 'Σ 1/i,  Σ ⌊n/i⌋,  Σ σ(i)', 'Σ 1/i,  Σ ⌊n/i⌋,  Σ σ(i)'],
  ['sin cos tan cot', 'Lượng giác. Đơn vị góc (Rad / Độ) chọn ở nút phía trên sổ tay', 'Trigonometry. Pick the angle unit (Rad / Deg) above the notebook'],
  ['asin acos atan atan2(y, x)', 'Lượng giác ngược, kết quả theo đơn vị góc đang chọn', 'Inverse trig, result in the selected angle unit'],
  ['sinh cosh tanh  deg(x) rad(x)', 'Hàm hyperbolic; đổi rad → độ, độ → rad', 'Hyperbolic functions; convert rad → deg, deg → rad'],
  ['pi  e  inf', 'Hằng số π, e, vô cùng', 'Constants π, e, infinity'],
];

/* ================================================= Notebook */
const EXAMPLE = [
  'n = 2e5', 'q = 1e5', '(n + q) * log(n)', 'n * sqrt(n)', 'C(40, 20)', 'd(735134400)', '2^62 + 2^62', 'MOD = 1e9 + 7', '(MOD - 1)^2', '25!',
];
const nb = $('#nb');
function nbRow(text) {
  const row = document.createElement('div');
  row.className = 'nb-row';
  row.innerHTML = '<span class="nb-idx"></span><input class="nb-in" spellcheck="false" autocomplete="off"><div class="nb-out"></div>';
  const inp = row.querySelector('input');
  inp.value = text || '';
  inp.placeholder = t('nb.ph');
  return row;
}
function nbSet(lines) { nb.innerHTML = ''; lines.forEach((l) => nb.appendChild(nbRow(l))); nbCompute(); }
function nbCompute() {
  const env = {};
  $$('.nb-row', nb).forEach((row, i) => {
    row.querySelector('.nb-idx').textContent = i + 1;
    const inp = row.querySelector('input'), o = row.querySelector('.nb-out');
    inp.placeholder = t('nb.ph');
    const text = inp.value.trim();
    o.className = 'nb-out'; delete o.dataset.copy;
    if (!text || text.startsWith('#')) { o.innerHTML = ''; return; }
    try {
      const { assign, ast } = CP.parseLine(text);
      const v = CP.evaluate(ast, env);
      const isDisplay = v && typeof v === 'object' && 'display' in v;
      if (!isDisplay && (CP.isBig(CP.unwrap(v)) || typeof CP.unwrap(v) === 'number')) {
        if (assign) env[assign] = CP.unwrap(v) === v ? v : CP.unwrap(v);
      }
      const f = CP.formatValue(v);
      o.innerHTML = (assign ? `<span class="eq">${esc(assign)} = </span>` : '') + esc(f.main) + (f.sub ? `<small>${esc(f.sub)}</small>` : '');
      o.dataset.copy = f.copy;
    } catch (e) {
      o.className = 'nb-out err';
      o.textContent = UI.errMsg(e);
    }
  });
}
const nbComputeD = UI.debounce(nbCompute, 80);
nb.addEventListener('input', nbComputeD);
nb.addEventListener('keydown', (e) => {
  const inp = e.target.closest('.nb-in'); if (!inp) return;
  const row = inp.parentElement;
  if (e.key === 'Enter') {
    e.preventDefault();
    const nr = nbRow(''); row.after(nr); nr.querySelector('input').focus(); nbCompute();
  } else if (e.key === 'Backspace' && inp.value === '' && nb.children.length > 1) {
    e.preventDefault();
    const prev = row.previousElementSibling || row.nextElementSibling;
    row.remove(); prev.querySelector('input').focus(); nbCompute();
  } else if (e.key === 'ArrowUp' && row.previousElementSibling) {
    e.preventDefault(); row.previousElementSibling.querySelector('input').focus();
  } else if (e.key === 'ArrowDown' && row.nextElementSibling) {
    e.preventDefault(); row.nextElementSibling.querySelector('input').focus();
  }
});
$('#nbAdd').onclick = () => { const r = nbRow(''); nb.appendChild(r); r.querySelector('input').focus(); nbCompute(); };
$('#nbClear').onclick = () => { nbSet(['']); nb.querySelector('input').focus(); };
$('#nbExample').onclick = () => nbSet(EXAMPLE);
function setAngle(m) {
  CP.ANGLE.mode = m;
  $$('#nbAngle button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.a === m)));
  try { localStorage.setItem('cpcalc.angle', m); } catch (e) { /* ignore */ }
  nbCompute();
}
$('#nbAngle').addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (b) setAngle(b.dataset.a); });
try { const m = localStorage.getItem('cpcalc.angle'); if (m === 'deg') setAngle('deg'); } catch (e) { /* ignore */ }
nbSet(EXAMPLE);
I18N.onChange(nbCompute);

function renderFnRef() {
  const L = I18N.lang === 'en' ? 2 : 1;
  $('#fnref').innerHTML = FNREF.map((r) => `<div><code>${esc(r[0])}</code><span>${esc(r[L])}</span></div>`).join('');
}
renderFnRef(); I18N.onChange(renderFnRef);

/* ================================================= Complexity */
const TEMPLATES = [
  ['tpl.dsu', '(n + q) * ackinv(n)', 2], ['tpl.seg', '(n + q) * log(n)', 3], ['tpl.bit', '(n + q) * log(n)', 1], ['tpl.mo', '(n + q) * sqrt(n)', 1],
  ['tpl.sqrt', 'q * sqrt(n)', 1], ['tpl.dij', '(n + m) * log(n)', 2], ['tpl.lca', '(n + q) * log(n)', 1],
  ['tpl.floyd', 'n^3', 1], ['tpl.bf', 'n * m', 1], ['tpl.bitmask', '2^n * n^2', 1], ['tpl.submask', '3^n', 1],
  ['tpl.fft', 'n * log(n)', 5], ['tpl.sort', 'n * log(n)', 1], ['tpl.sparse', 'n * log(n) + q', 1],
  ['tpl.sieve', 'n * ln(ln(n))', 1], ['tpl.bs', 'n * log(1e18)', 1], ['tpl.mat', 'k^3 * log(n)', 1],
];
function renderTpl() {
  const sel = $('#cxTpl'), cur = sel.value;
  sel.innerHTML = `<option value="">${esc(t('cx.tplNone'))}</option>` + TEMPLATES.map((x, i) => `<option value="${i}">${esc(t(x[0]))}</option>`).join('');
  sel.value = cur;
}
renderTpl(); I18N.onChange(renderTpl);
$('#cxTpl').addEventListener('change', (e) => {
  const tp = TEMPLATES[e.target.value]; if (!tp) return;
  $('#cxExpr').value = tp[1]; $('#cxConst').value = tp[2];
  runCx();
});
$('#cxExpr').addEventListener('input', () => { $('#cxTpl').value = ''; });

function cxEnv() { return CP.parseVars($('#cxVars').value); }

function verdictBlock(ops, c) {
  const vd = verdict(ops, c);
  const pct = vd.ratio * 100;
  return kv(t('cx.time'), esc(CP.fmtTime(vd.time)), esc(t('cx.ofTL', { p: pct < 0.1 ? '<0.1' : pct < 10 ? pct.toFixed(1) : Math.round(pct).toLocaleString() })), { big: true }) +
    kv(t('cx.verdict'), chip(vd.cls) + `<div class="meter ${vd.cls}" style="margin-top:8px"><span style="width:${Math.min(100, Math.max(1, pct))}%"></span></div>`);
}

function runCx() {
  const o = $('#cxOut');
  try {
    const env = cxEnv();
    const ops = CP.unwrap(CP.evaluate(CP.parse($('#cxExpr').value), env));
    const c = numField($('#cxConst').value);
    const opsN = CP.toNum(ops);
    o.innerHTML = out(
      kv(t('cx.ops'), esc(CP.fmtCount(ops)), CP.isBig(ops) && ops >= 1000000n ? esc(ops.toString()) : (c !== 1 ? '× ' + c + ' = ' + esc(CP.fmtCount(opsN * c)) : ''), { big: true, copy: String(ops) }) +
      verdictBlock(opsN, c));
  } catch (e) { o.innerHTML = errBox(e); }
  runCmp(); runInv();
}

const STD = [
  ['1', '1'], ['log n', 'log(n)'], ['√n', 'sqrt(n)'], ['n', 'n'], ['n α(n)', 'n*ackinv(n)'], ['n log n', 'n*log(n)'], ['n √n', 'n*sqrt(n)'],
  ['n log² n', 'n*log(n)^2'], ['n²', 'n^2'], ['n² log n', 'n^2*log(n)'], ['n³', 'n^3'], ['2ⁿ', '2^n'], ['2ⁿ·n', '2^n*n'], ['2ⁿ·n²', '2^n*n^2'], ['3ⁿ', '3^n'], ['n!', 'n!'],
];
const STD_AST = STD.map(([, e]) => CP.parse(e));

function runCmp() {
  const box = $('#cmpTable');
  let env;
  try { env = cxEnv(); } catch (e) { box.innerHTML = errBox(e); return; }
  const n = env.n !== undefined ? env.n : env[Object.keys(env)[0]];
  if (n === undefined) { box.innerHTML = errBox({ key: 'err.unknownVar', params: { name: 'n' } }); return; }
  $('#cmpTag').textContent = t('cx.cmpTag', { n: CP.formatValue(n).main });
  const target = targetOps(1);
  const rows = STD.map(([label], i) => {
    let ops;
    try { ops = CP.toNum(CP.unwrap(CP.evaluate(STD_AST[i], { n }))); } catch (e) { ops = Infinity; }
    const vd = verdict(ops, 1);
    const nmax = maxN(STD_AST[i], {}, target);
    return `<tr><td class="mono">O(${esc(label)})</td><td class="num">${esc(CP.fmtCount(ops))}</td><td class="num">${esc(CP.fmtTime(vd.time))}</td><td>${chip(vd.cls)}</td><td class="num">${esc(nmax)}</td></tr>`;
  });
  box.innerHTML = `<table class="tbl"><thead><tr><th>${t('cx.colCx')}</th><th class="num">${t('cx.colOps')}</th><th class="num">${t('cx.colTime')}</th><th>${t('cx.colV')}</th><th class="num">${t('cx.colNmax')}</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
}

function targetOps(c) { const j = UI.judge(); return j.tl * j.speed / (c || 1); }
/* largest integer n >= 1 with f(n) <= target; returns display string */
function maxNValue(ast, env, target) {
  const f = (n) => {
    try { return CP.toNum(CP.unwrap(CP.evaluate(ast, Object.assign({}, env, { n: n <= 9e15 ? BigInt(Math.floor(n)) : n })))); } catch (e) { return NaN; }
  };
  if (!(f(1) <= target)) return null;
  let lo = 1, hi = 2;
  while (hi <= 1e18 && f(hi) <= target) { lo = hi; hi *= 2; }
  if (hi > 1e18) return Infinity;
  for (let it = 0; it < 200 && hi - lo > 1 && hi / lo > 1 + 1e-12; it++) {
    const mid = Math.floor((lo + hi) / 2);
    if (f(mid) <= target) lo = mid; else hi = mid;
  }
  return lo;
}
function maxN(ast, env, target) {
  const v = maxNValue(ast, env, target);
  if (v === null) return '—';
  if (v === Infinity) return '> 1e18';
  return v < 1e6 ? String(v) : CP.sciNum(v, 2);
}
function runInv() {
  const o = $('#invOut');
  try {
    const env = cxEnv(); delete env.n;
    const c = numField($('#cxConst').value);
    const target = targetOps(c);
    const ast = CP.parse($('#invExpr').value);
    const v = maxNValue(ast, env, target);
    let main;
    if (v === null) main = esc(t('cx.none'));
    else if (v === Infinity) main = '&gt; 1e18';
    else main = esc(v.toLocaleString('en-US').replace(/,/g, ' ')) + (v >= 1e4 ? `<small>≈ ${esc(CP.sciNum(v, 3))}</small>` : '');
    o.innerHTML = out(kv(t('cx.nmax'), main, '', { big: true, copy: v === null ? '' : String(v) }) +
      kv(t('cx.budget'), esc(CP.sciNum(target, 2)), c !== 1 ? esc(t('cx.const') + ' = ' + c) : ''));
  } catch (e) { o.innerHTML = errBox(e); }
}
wire(['cxExpr', 'cxVars', 'cxConst'], runCx);
wire(['invExpr'], runInv);

/* ================================================= Sums */
const GAMMA = 0.5772156649015329;
function runHarm() {
  const o = $('#hOut');
  try {
    const nv = evalField($('#hN').value);
    const n = CP.toNum(nv);
    if (!(n >= 1)) throw { key: 'err.needPositive', params: { fn: 'n' } };
    const H = CP.harmonic(n);
    let rows = kv(t('h.H'), esc(CP.plainNum(H))) +
      kv(t('h.sum'), esc(CP.fmtCount(n * H)), '', { big: true }) +
      kv(t('h.approx'), esc(CP.fmtCount(n * Math.log(n))));
    if (Number.isInteger(n) && n <= CP.SUMFLOOR_LIMIT) {
      const s = CP.sumFloor(n);
      rows += kvVal(t('h.floor'), s, t('exact'));
    } else {
      rows += kv(t('h.floor'), esc(CP.fmtCount(n * Math.log(n) + (2 * GAMMA - 1) * n)), esc(t('h.floorApprox')));
    }
    if (CP.isBig(nv) || Number.isInteger(n)) rows += kvVal(t('h.distinct'), CP.distinctFloor(CP.toBigInt(nv)), '≈ 2√n');
    const vd = verdict(n * H, 1);
    rows += kv(t('h.verdict'), chip(vd.cls) + ' ' + esc(CP.fmtTime(vd.time)));
    o.innerHTML = out(rows);
  } catch (e) { o.innerHTML = errBox(e); }
}
function runPrimes() {
  const o = $('#pOut');
  try {
    const n = Math.floor(numField($('#pN').value));
    if (!(n >= 2)) throw { key: 'err.needPositive', params: { fn: 'n' } };
    const s = CP.sumInvPrimes(n);
    let rows = kv(t('p.sum'), esc(CP.plainNum(s.value)), s.exact ? t('exact') : esc(t('p.approxNote'))) +
      kv(t('p.ops'), esc(CP.fmtCount(n * s.value)), '', { big: true }) +
      kv(t('p.approx'), esc(CP.fmtCount(n * Math.log(Math.log(n)))));
    if (n <= CP.PRIMEPI_LIMIT) rows += kv(t('p.pi'), esc(String(CP.primePiExact(n))), t('exact'));
    else rows += kv(t('p.pi'), '≈ ' + esc(CP.sciNum(CP.li(n), 4)), 'li(n)');
    const vd = verdict(n * s.value, 1);
    rows += kv(t('cx.verdict'), chip(vd.cls) + ' ' + esc(CP.fmtTime(vd.time)));
    o.innerHTML = out(rows);
  } catch (e) { o.innerHTML = errBox(e); }
}

/* adaptive Simpson */
function simpson(f, a, b, eps, depthMax) {
  const fa = f(a), fb = f(b), m = (a + b) / 2, fm = f(m);
  const whole = (b - a) / 6 * (fa + 4 * fm + fb);
  let evals = 0;
  function rec(a, b, fa, fm, fb, whole, eps, depth) {
    const m = (a + b) / 2, lm = (a + m) / 2, rm = (m + b) / 2;
    const flm = f(lm), frm = f(rm); evals += 2;
    const left = (m - a) / 6 * (fa + 4 * flm + fm), right = (b - m) / 6 * (fm + 4 * frm + fb);
    const diff = left + right - whole;
    if (depth <= 0 || evals > 2e6 || Math.abs(diff) <= 15 * eps) return left + right + diff / 15;
    return rec(a, m, fa, flm, fm, left, eps / 2, depth - 1) + rec(m, b, fm, frm, fb, right, eps / 2, depth - 1);
  }
  return rec(a, b, fa, fm, fb, whole, eps, depthMax || 40);
}
/* ∫ f over [a,b]; uses x = e^u when the range spans many magnitudes */
function integrate(f, a, b) {
  if (a === b) return 0;
  if (a > b) return -integrate(f, b, a);
  if (a > 0 && b / a > 1e3) {
    const g = (u) => { const x = Math.exp(u); return f(x) * x; };
    const la = Math.log(a), lb = Math.log(b);
    let s = 0; const k = 64;
    for (let i = 0; i < k; i++) s += simpson(g, la + (lb - la) * i / k, la + (lb - la) * (i + 1) / k, 1e-10, 30);
    return s;
  }
  let s = 0; const k = 16;
  for (let i = 0; i < k; i++) s += simpson(f, a + (b - a) * i / k, a + (b - a) * (i + 1) / k, 1e-10, 40);
  return s;
}

function runCustomSum() {
  const o = $('#csOut');
  try {
    const env = CP.parseVars($('#csVars').value);
    const ast = CP.parse($('#csF').value);
    const a = evalField($('#csA').value, env), b = evalField($('#csB').value, env);
    const aN = Math.ceil(CP.toNum(a)), bN = Math.floor(CP.toNum(b));
    const count = Math.max(0, bN - aN + 1);
    const names = Object.keys(env);
    let rows = kv(t('cs.count'), esc(CP.fmtCount(count)));
    if (count === 0) { o.innerHTML = out(rows + kv(t('cs.value'), '0')); return; }
    if (count <= 2e5) {
      // exact (BigInt when every term is an integer)
      let acc = 0n, isInt = true, fl = 0;
      const e2 = Object.assign({}, env);
      for (let i = aN; i <= bN; i++) {
        e2.i = BigInt(i);
        const v = CP.unwrap(CP.evaluate(ast, e2));
        if (isInt && CP.isBig(v)) acc += v; else { if (isInt) { fl = Number(acc); isInt = false; } fl += CP.toNum(v); }
      }
      rows += isInt ? kvVal(t('cs.value'), acc, t('cs.exactLoop'), { big: true }) : kv(t('cs.value'), esc(CP.plainNum(fl)), esc(t('cs.exactLoop')), { big: true });
    } else {
      const f = CP.compileFloat(ast, ['i', ...names]);
      const vals = names.map((k) => CP.toNum(env[k]));
      const fi = (x) => f(x, ...vals);
      if (count <= 2e7) {
        let s = 0; for (let i = aN; i <= bN; i++) s += fi(i);
        rows += kv(t('cs.value'), esc(CP.plainNum(s)), esc(t('cs.exactLoop')), { big: true });
      } else {
        const s = integrate(fi, aN, bN) + (fi(aN) + fi(bN)) / 2;
        if (!Number.isFinite(s)) throw { key: 'ig.bad' };
        rows += kv(t('cs.value'), '≈ ' + esc(CP.sciNum(s, 5)), esc(t('cs.em')), { big: true });
      }
    }
    o.innerHTML = out(rows);
  } catch (e) { o.innerHTML = errBox(e); }
}

/* ---------------- Nested loops ---------------- */
const loopState = [
  { v: 'i', from: '1', cmp: '<=', to: 'n', op: '+=', step: '1' },
  { v: 'j', from: 'i', cmp: '<=', to: 'n', op: '+=', step: '1' },
  { v: 'k', from: 'j', cmp: '<=', to: 'n', op: '+=', step: '1' },
];
const LOOP_VARS = 'ijklmpqrst';
function renderLoops() {
  const box = $('#loops');
  box.innerHTML = loopState.map((L, d) => `
    <div class="loop-row" data-d="${d}" style="padding-left:${d * 16}px">
      <span class="kw">for</span>(<input class="input mono v" data-k="v" value="${esc(L.v)}" aria-label="var">=
      <input class="input mono" data-k="from" value="${esc(L.from)}" aria-label="from">;
      ${esc(L.v)}<select class="input mono" data-k="cmp"><option${L.cmp === '<=' ? ' selected' : ''}>&lt;=</option><option${L.cmp === '<' ? ' selected' : ''}>&lt;</option></select>
      <input class="input mono" data-k="to" value="${esc(L.to)}" aria-label="to">;
      ${esc(L.v)}<select class="input mono" data-k="op"><option${L.op === '+=' ? ' selected' : ''}>+=</option><option${L.op === '*=' ? ' selected' : ''}>*=</option></select>
      <input class="input mono" data-k="step" value="${esc(L.step)}" aria-label="step" style="width:52px">)
    </div>`).join('');
}
$('#loops').addEventListener('input', (e) => {
  const row = e.target.closest('.loop-row'); if (!row) return;
  loopState[+row.dataset.d][e.target.dataset.k] = e.target.value;
  if (e.target.dataset.k === 'v') renderLoopsKeepFocus(e.target);
  runLoopsD();
});
$('#loops').addEventListener('change', (e) => {
  const row = e.target.closest('.loop-row'); if (!row) return;
  loopState[+row.dataset.d][e.target.dataset.k] = e.target.value; runLoops();
});
function renderLoopsKeepFocus(input) {
  const d = input.closest('.loop-row').dataset.d, pos = input.selectionStart;
  renderLoops();
  const el = $(`.loop-row[data-d="${d}"] [data-k="v"]`); el.focus(); el.setSelectionRange(pos, pos);
}
$('#loopAdd').onclick = () => {
  if (loopState.length >= 6) return;
  const prev = loopState[loopState.length - 1];
  const used = new Set(loopState.map((l) => l.v));
  const v = [...LOOP_VARS].find((c) => !used.has(c)) || 'z';
  loopState.push({ v, from: prev ? prev.v : '1', cmp: '<=', to: 'n', op: '+=', step: '1' });
  renderLoops(); runLoops();
};
$('#loopDel').onclick = () => { if (loopState.length > 1) { loopState.pop(); renderLoops(); runLoops(); } };

/* Count iterations with given env (Numbers). Throws 'budget' if outer iterations exceed limit. */
function makeLoopCounter() {
  const env0 = CP.parseVars($('#loopVars').value);
  const envNames = Object.keys(env0);
  const loopVars = loopState.map((l) => l.v.trim());
  loopVars.forEach((v) => { if (!/^[A-Za-z_]\w*$/.test(v)) throw { key: 'err.varFormat', params: { part: v } }; });
  const names = [...envNames, ...loopVars];
  const comp = loopState.map((L) => ({
    from: CP.compileFloat(CP.parse(L.from), names), to: CP.compileFloat(CP.parse(L.to), names),
    step: CP.compileFloat(CP.parse(L.step), names), lt: L.cmp === '<', mul: L.op === '*=',
  }));
  const D = comp.length;
  function count(envVals, budget) {
    const vals = new Float64Array(names.length);
    envVals.forEach((v, i) => (vals[i] = v));
    let used = 0;
    const base = envNames.length;
    const args = () => Array.from(vals);
    function rec(d) {
      const c = comp[d], a = args();
      const from = c.from(...a), to = c.to(...a), step = c.step(...a);
      if (!(c.mul ? step > 1 : step > 0) || !Number.isFinite(step)) throw { key: 'loop.badStep' };
      if (d === D - 1) {
        if (c.mul) {
          if (from <= 0) throw { key: 'loop.badStep' };
          let k = 0; for (let x = from; c.lt ? x < to : x <= to; x *= step) k++;
          return k;
        }
        if (c.lt) return to > from ? Math.ceil((to - from) / step - 1e-12) : 0;
        return to >= from ? Math.floor((to - from) / step + 1e-12) + 1 : 0;
      }
      let total = 0;
      if (c.mul && from <= 0) throw { key: 'loop.badStep' };
      for (let x = from; c.lt ? x < to : x <= to; x = c.mul ? x * step : x + step) {
        if (++used > budget) throw { budget: true };
        vals[base + d] = x;
        total += rec(d + 1);
      }
      return total;
    }
    return rec(0);
  }
  return { env0, envNames, count, D };
}

function fracStr(x) {
  // express x as p/q with small q when possible
  for (const q of [1, 2, 3, 4, 6, 8, 12, 24, 30, 120, 720]) {
    const p = Math.round(x * q);
    if (Math.abs(p / q - x) < 1e-7 * Math.max(1, Math.abs(x))) return q === 1 ? String(p) : `${p}/${q}`;
  }
  return x.toPrecision(5);
}
function polyStr(coefs, v) {
  const sup = { 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷' };
  const terms = [];
  for (let k = coefs.length - 1; k >= 0; k--) {
    const c = coefs[k];
    if (Math.abs(c) < 1e-9) continue;
    const fs = fracStr(Math.abs(c));
    const mono = k === 0 ? '' : v + (k > 1 ? (sup[k] || '^' + k) : '');
    let term;
    if (k === 0) term = fs;
    else if (fs === '1') term = mono;
    else if (fs.includes('/')) { const [p, q] = fs.split('/'); term = (p === '1' ? '' : p) + mono + '/' + q; }
    else term = fs + mono;
    terms.push({ neg: c < 0, term });
  }
  if (!terms.length) return '0';
  return terms.map((x, i) => (i === 0 ? (x.neg ? '−' : '') : (x.neg ? ' − ' : ' + ')) + x.term).join('');
}
/* Fit polynomial of degree D through points (x_i, y_i) → monomial coefficients */
function polyFit(xs, ys) {
  const n = xs.length;
  const M = xs.map((x, i) => { const r = []; for (let k = 0; k < n; k++) r.push(Math.pow(x, k)); r.push(ys[i]); return r; });
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((r, i) => r[n] / r[i]);
}
const evalPoly = (co, x) => co.reduceRight((acc, c) => acc * x + c, 0);

function runLoops() {
  const o = $('#loopOut');
  try {
    const L = makeLoopCounter();
    const envVals = L.envNames.map((k) => CP.toNum(L.env0[k]));
    const sv = L.envNames[0];
    let total = null, how = '', formula = '';
    try { total = L.count(envVals, 3e6); how = t('loop.direct'); } catch (e) { if (!e.budget) throw e; }
    if (sv) {
      // polynomial fit over the first variable
      const D = L.D;
      const idx = 0;
      const tryFit = (m) => {
        const xs = [], ys = [];
        for (let j = 1; j <= D + 2; j++) {
          const vals = envVals.slice(); vals[idx] = m * j;
          xs.push(m * j); ys.push(L.count(vals, 2e6));
        }
        const co = polyFit(xs.slice(0, D + 1), ys.slice(0, D + 1));
        const check = evalPoly(co, xs[D + 1]);
        const ok = Math.abs(check - ys[D + 1]) <= 1e-6 * Math.max(1, ys[D + 1]);
        return { co, ok, xs, ys };
      };
      let fit = null;
      for (const m of [60, 24, 12, 6]) { try { fit = tryFit(m); break; } catch (e) { if (!e.budget) throw e; } }
      if (fit && fit.ok) {
        const co = fit.co.map((c) => { const r = Math.round(c * 720) / 720; return Math.abs(r - c) < 1e-6 ? r : c; });
        formula = polyStr(co, sv);
        if (total === null) { total = evalPoly(co, envVals[idx]); how = t('loop.fit', { v: sv }); }
      } else if (fit && total === null) {
        const { xs, ys } = fit;
        const k = xs.length - 1;
        const e = Math.log(ys[k] / ys[k - 1]) / Math.log(xs[k] / xs[k - 1]);
        total = ys[k] * Math.pow(envVals[idx] / xs[k], e);
        how = t('loop.trend');
        formula = '≈ ' + sv + '^' + e.toFixed(2);
      }
    }
    if (total === null) { o.innerHTML = `<div class="msg err">${esc(t('loop.tooMany'))}</div>`; return; }
    const vd = verdict(total, 1);
    o.innerHTML = out(
      kv(t('loop.count'), esc(Number.isInteger(total) && total < 1e15 ? total.toLocaleString('en-US').replace(/,/g, ' ') : CP.sciNum(total, 4)), esc(how), { big: true, copy: String(total) }) +
      (formula ? kv(t('loop.formula', { v: sv }), esc(formula)) : '') +
      kv(t('cx.verdict'), chip(vd.cls) + ' ' + esc(CP.fmtTime(vd.time))));
  } catch (e) { o.innerHTML = errBox(e); }
}
const runLoopsD = UI.debounce(runLoops, 200);
renderLoops();
wire(['hN'], runHarm);
wire(['pN'], runPrimes, 250);
wire(['csF', 'csA', 'csB', 'csVars'], runCustomSum, 250);
wire(['loopVars'], runLoops, 250);

/* ================================================= Analysis */
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '.': '·', '-': '⁻' };
function fmtExp(x) {
  const r = Math.round(x * 1000) / 1000;
  return String(r).split('').map((c) => SUP[c] || c).join('');
}
function powStr(base, e) {
  if (Math.abs(e) < 1e-9) return '';
  if (Math.abs(e - 1) < 1e-9) return base;
  return base + fmtExp(e);
}
function growth(c, k, p) {
  // Θ(n^c · log^p n) display
  const parts = [];
  const np = powStr('n', c); if (np) parts.push(np);
  if (Math.abs(p) > 1e-9) parts.push(Math.abs(p - 1) < 1e-9 ? 'log n' : 'log' + fmtExp(p) + ' n');
  return 'Θ(' + (parts.join(' · ') || '1') + ')';
}
function masterLike(c, k, p) {
  const eps = 1e-9;
  if (k < c - eps) return { cs: 'ms.case1', res: growth(c, 0, 0) };
  if (k > c + eps) return { cs: 'ms.case3', res: growth(k, 0, p) };
  if (p > -1 + eps) return { cs: 'ms.case2', res: growth(c, 0, p + 1) };
  if (Math.abs(p + 1) <= eps) return { cs: 'ms.case2b', res: 'Θ(' + (powStr('n', c) || '1') + ' · log log n)' };
  return { cs: 'ms.case2c', res: growth(c, 0, 0) };
}
function fEval(k, p) { return (n) => Math.pow(n, k) * (p ? Math.pow(Math.max(Math.log2(n), 1), p) : 1); }

function runMaster() {
  const o = $('#msOut');
  try {
    const a = numField($('#msA').value), b = numField($('#msB').value);
    const k = numField($('#msK').value), p = numField($('#msP').value);
    const N = numField($('#msN').value);
    if (!(a >= 1 && b > 1)) { o.innerHTML = `<div class="msg err">${esc(t('ms.badAB'))}</div>`; return; }
    const c = Math.log(a) / Math.log(b);
    const r = masterLike(c, k, p);
    const f = fEval(k, p);
    const memo = new Map();
    const T = (n) => {
      if (n <= 1) return 1;
      if (memo.has(n)) return memo.get(n);
      const v = a * T(Math.floor(n / b)) + f(n);
      memo.set(n, v); return v;
    };
    const tv = Number.isFinite(N) && N >= 1 ? T(Math.floor(N)) : NaN;
    o.innerHTML = out(
      kv(t('ms.c'), esc(CP.plainNum(Math.round(c * 1e6) / 1e6))) +
      kv(t('ms.case'), esc(t(r.cs))) +
      kv(t('ms.result'), esc(r.res), '', { big: true }) +
      kv(t('ms.T') + ' (n = ' + esc(CP.fmtCount(N)) + ')', esc(CP.fmtCount(tv)), 'T(1) = 1, T(n) = a·T(⌊n/b⌋) + f(n)'));
  } catch (e) { o.innerHTML = errBox(e); }
}
function runAkra() {
  const o = $('#abOut');
  try {
    const terms = $('#abTerms').value.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.split(/[\s,]+/).map((x) => numField(x)));
    if (!terms.length || terms.some((x) => x.length !== 2 || !(x[0] > 0) || !(x[1] > 1))) { o.innerHTML = `<div class="msg err">${esc(t('ab.badTerms'))}</div>`; return; }
    const k = numField($('#abK').value), p = numField($('#abP').value);
    const g = (q) => terms.reduce((s, [a, b]) => s + a * Math.pow(b, -q), 0) - 1;
    let lo = -50, hi = 50;
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (g(m) > 0) lo = m; else hi = m; }
    const pp = (lo + hi) / 2;
    const r = masterLike(pp, k, p);
    o.innerHTML = out(
      kv(t('ab.p'), esc(CP.plainNum(Math.round(pp * 1e6) / 1e6))) +
      kv(t('ms.case'), esc(t(r.cs))) +
      kv(t('ms.result'), esc(r.res), '', { big: true }));
  } catch (e) { o.innerHTML = errBox(e); }
}
function runRec() {
  const o = $('#reOut');
  try {
    const ast = CP.parse($('#reExpr').value);
    const n0 = numField($('#reN0').value);
    const baseAst = CP.parse($('#reBase').value);
    const N = Math.floor(numField($('#reN').value));
    const memo = new Map();
    let cur = null, depth = 0;
    const baseVal = (n) => CP.toNum(CP.unwrap(CP.evaluate(baseAst, { n: BigInt(n) })));
    const T = (n) => {
      if (n <= n0) return baseVal(n);
      const m = memo.get(n); if (m !== undefined) return m;
      if (++depth > 6000) throw { deep: true };
      const prev = cur; cur = n;
      const v = CP.toNum(CP.unwrap(CP.evaluate(ast, { n: BigInt(n), __funcs: { T: (args) => {
        const x = Math.floor(CP.toNum(CP.unwrap(args[0])));
        if (x >= cur) throw { key: 're.selfRef' };
        return T(x);
      } } })));
      cur = prev; depth--;
      memo.set(n, v); return v;
    };
    let v;
    try { v = T(N); } catch (e) {
      if (!e.deep) throw e;
      // bottom-up for T(n-1)-style recurrences
      if (N > 2e6) { o.innerHTML = `<div class="msg err">${esc(t('re.tooDeep'))}</div>`; return; }
      memo.clear(); depth = 0;
      for (let i = Math.max(0, Math.floor(n0) + 1); i <= N; i++) T(i);
      v = T(N);
    }
    const fv = CP.formatValue(Number.isInteger(v) && Math.abs(v) < 9e15 ? BigInt(v) : v);
    o.innerHTML = out(kv(t('re.value'), esc(fv.main), esc(fv.sub), { big: true, copy: fv.copy }) +
      kv(t('re.calls'), esc(String(memo.size))));
  } catch (e) { o.innerHTML = errBox(e); }
}
function runIntegral() {
  const o = $('#igOut');
  try {
    const env = CP.parseVars($('#igVars').value);
    const names = Object.keys(env);
    const f = CP.compileFloat(CP.parse($('#igF').value), ['x', ...names]);
    const vals = names.map((k) => CP.toNum(env[k]));
    const a = numField($('#igA').value, env), b = numField($('#igB').value, env);
    const v = integrate((x) => f(x, ...vals), a, b);
    if (!Number.isFinite(v)) { o.innerHTML = `<div class="msg err">${esc(t('ig.bad'))}</div>`; return; }
    const fv = CP.formatValue(v);
    o.innerHTML = out(kv(t('ig.value'), esc(fv.main), esc(fv.sub), { big: true, copy: fv.copy }));
  } catch (e) { o.innerHTML = errBox(e); }
}
wire(['msA', 'msB', 'msK', 'msP', 'msN'], runMaster);
wire(['abTerms', 'abK', 'abP'], runAkra);
wire(['reExpr', 'reN0', 'reBase', 'reN'], runRec, 300);
wire(['igF', 'igA', 'igB', 'igVars'], runIntegral, 250);

/* ================================================= Number theory */
function facStr(f) {
  return f.map(([p, e]) => p.toString() + (e > 1 ? fmtExp(e) : '')).join(' · ') || '1';
}
function runNt() {
  const o = $('#ntOut');
  try {
    const n = CP.toBigInt(evalField($('#ntN').value), 'n');
    if (n < 1n) throw { key: 'err.needPositive', params: { fn: 'n' } };
    const f = CP.factorize(n);
    const ft = CP.factorText(f);
    const d = f.reduce((a, [, e]) => a * BigInt(e + 1), 1n);
    const s = f.reduce((a, [p, e]) => a * ((p ** BigInt(e + 1) - 1n) / (p - 1n)), 1n);
    const ph = f.reduce((a, [p, e]) => a * (p - 1n) * p ** BigInt(e - 1), 1n);
    const prime = f.length === 1 && f[0][1] === 1;
    const bigO = f.reduce((a, [, e]) => a + e, 0);
    const rad = f.reduce((a, [p]) => a * p, 1n);
    // n = b^g with g = gcd of the exponents
    const gcd = (x, y) => (y ? gcd(y, x % y) : x);
    const g = f.reduce((a, [, e]) => gcd(a, e), 0);
    const kinds = [];
    if (prime) kinds.push(chip('ok', t('nt.yes') + ' · ' + t('nt.prime').replace('?', '')));
    if (n > 1n && f.every(([, e]) => e === 1)) kinds.push(chip('neutral', t('nt.squarefree')));
    if (g > 1) kinds.push(chip('neutral', t('nt.power', { b: f.reduce((a, [p, e]) => a * p ** BigInt(e / g), 1n).toString(), g })));
    const lines = f.map(([p, e]) => p + ' ' + e).join('\n');
    let divBox;
    if (d <= 5000n) {
      const ds = CP.divisors(f).map(String);
      divBox = `<div class="ge-order" style="max-height:110px">${esc(ds.join(' '))}</div><div class="row"><button class="btn sm" data-copy="${esc(ds.join(' '))}">${esc(t('nt.copyDivs'))}</button></div>`;
    } else divBox = `<span class="hint">${esc(t('nt.divsMany', { n: d.toString() }))}</span>`;
    o.innerHTML = out(
      kv(t('nt.fac'), esc(ft.pretty), '', { big: true, copy: ft.plain }) +
      kvVal(t('nt.d'), d) + kvVal(t('nt.sigma'), s) + kvVal(t('nt.phi'), ph) +
      kv(t('nt.omegaN'), esc(String(f.length))) + kv(t('nt.bigOmega'), esc(String(bigO))) +
      (f.length ? kv(t('nt.spf'), esc(f[0][0].toString() + ' / ' + f[f.length - 1][0].toString())) : '') +
      kvVal(t('nt.rad'), rad) +
      kv(t('nt.kind'), kinds.length ? kinds.join(' ') : '—')) +
      `<div class="row"><button class="btn sm" data-copy="${esc(ft.plain)}">${esc(t('nt.copyPlain'))}</button><button class="btn sm" data-copy="${esc(lines)}">${esc(t('nt.copyLines'))}</button></div>` +
      `<div class="lbl">${esc(t('nt.divs'))}</div>${divBox}`;
  } catch (e) { o.innerHTML = errBox(e); }
}
let fbText = '';
function runFactorBatch() {
  const box = $('#fbOut');
  const toks = $('#fbIn').value.split(/[\s,;]+/).filter(Boolean);
  const t0 = performance.now();
  const rows = [], lines = [];
  for (const tok of toks.slice(0, 300)) {
    try {
      const n = CP.toBigInt(evalField(tok), 'n');
      if (n < 1n) throw { key: 'err.needPositive', params: { fn: 'n' } };
      const f = CP.factorize(n), ft = CP.factorText(f);
      const d = f.reduce((a, [, e]) => a * BigInt(e + 1), 1n);
      rows.push(`<tr><td class="num">${esc(n.toString())}</td><td class="mono" data-copy="${esc(ft.plain)}" style="cursor:copy;white-space:normal">${esc(ft.pretty)}${f.length === 1 && f[0][1] === 1 ? ' ' + chip('ok', 'prime') : ''}</td><td class="num">${esc(d.toString())}</td><td class="num">${f.length}</td></tr>`);
      lines.push(n.toString() + ' = ' + ft.plain);
    } catch (e) {
      rows.push(`<tr><td class="mono">${esc(tok)}</td><td colspan="3" style="color:var(--bad);white-space:normal">${esc(UI.errMsg(e))}</td></tr>`);
    }
  }
  fbText = lines.join('\n');
  const ms = Math.round(performance.now() - t0);
  $('#fbInfo').textContent = t('fb.info', { n: Math.min(toks.length, 300), ms }) + (toks.length > 300 ? ' · ' + t('fb.max') : '');
  box.innerHTML = `<table class="tbl"><thead><tr><th class="num">${t('fb.colN')}</th><th>${t('fb.colF')}</th><th class="num">${t('fb.colD')}</th><th class="num">${t('fb.colW')}</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
}
$('#fbCopy').onclick = () => { if (fbText) UI.copy(fbText); };
let mdCache = null;
function runMaxdiv() {
  const o = $('#mdOut');
  let N = null;
  try {
    N = CP.toBigInt(evalField($('#mdN').value), 'N');
    const r = CP.maxDivisors(N), w = CP.maxDistinctPrimes(N);
    o.innerHTML = out(
      kvVal(t('nt.maxdivCount'), r.count, '', { big: true }) + kvVal(t('nt.maxdivNum'), r.number, esc(facStr(CP.factorize(r.number)))) +
      kv(t('nt.omega'), esc(String(w.count))) + kvVal(t('nt.omegaNum'), w.number));
  } catch (e) { o.innerHTML = errBox(e); }
  if (!mdCache) {
    mdCache = [];
    for (let k = 1; k <= 18; k++) {
      const M = 10n ** BigInt(k);
      mdCache.push({ k, M, r: CP.maxDivisors(M), w: CP.maxDistinctPrimes(M) });
    }
  }
  $('#mdTable').innerHTML = `<table class="tbl"><thead><tr><th>${t('nt.colN')}</th><th class="num">${t('nt.colD')}</th><th class="num">${t('nt.colX')}</th><th class="num">${t('nt.colW')}</th><th class="num">${t('nt.colPi')}</th></tr></thead><tbody>` +
    mdCache.map((x) => `<tr${N !== null && x.M === N ? ' class="hl"' : ''}><td class="mono">1e${x.k}</td><td class="num">${x.r.count}</td><td class="num">${x.r.number}</td><td class="num">${x.w.count}</td><td class="num">${CP.PI_POW10[x.k]}</td></tr>`).join('') + '</tbody></table>';
}
function runEst() {
  const o = $('#estOut');
  try {
    const N = CP.toBigInt(evalField($('#estN').value), 'N');
    if (N < 2n) throw { key: 'err.needPositive', params: { fn: 'N' } };
    const n = Number(N), L = Math.log(n);
    // divisors
    let div = '';
    if (N <= 10n ** 24n) {
      const r = CP.maxDivisors(N);
      div += kvVal(t('est.maxd'), r.count, t('est.maxdAt', { x: r.number.toString() }), { big: true });
    }
    div += kv(t('est.avgd'), esc(CP.plainNum(Math.round(L * 100) / 100)), esc(t('est.avgdSub')));
    div += kv(t('est.maxw'), esc(String(CP.maxDistinctPrimes(N).count)));
    div += kv(t('est.maxW'), esc(String(CP.bitLen(N) - 1)), esc(t('est.maxWSub')));
    div += kv(t('est.sqfree'), '≈ ' + esc(CP.fmtCount(6 / (Math.PI * Math.PI) * n)), esc(t('est.sqfreeSub')));
    div += `<div class="msg note">${esc(t('est.cbrt', { v: CP.fmtCount(Math.cbrt(n)) }))}</div>`;
    // primes
    let pr = '';
    const pi = CP.primePi(N);
    if (pi !== null) pr += kvVal(t('est.pi'), pi, t('exact'), { big: true });
    else pr += kv(t('est.pi'), '≈ ' + esc(CP.fmtCount(CP.li(n))), esc(t('est.piApprox')), { big: true });
    const bd = CP.primePiBounds(n);
    if (bd.valid) pr += kv(t('est.piBounds'), esc(CP.fmtCount(Math.ceil(bd.lo)) + ' … ' + CP.fmtCount(Math.floor(bd.hi))));
    pr += kv(t('est.nln'), esc(CP.fmtCount(n / L))) + kv(t('est.li'), esc(CP.fmtCount(CP.li(n))));
    pr += kv(t('est.density'), esc(CP.sciNum(1 / L, 3)), esc(t('est.densitySub', { g: Math.round(L) })));
    if (N <= 10n ** 30n) {
      pr += kvVal(t('est.prev'), CP.prevPrime(N + 1n)) + kvVal(t('est.next'), CP.nextPrime(N));
    }
    if (N <= BigInt(CP.NTHPRIME_LIMIT)) pr += kvVal(t('est.nth'), CP.nthPrime(N), t('exact'));
    else {
      const nb = CP.nthPrimeBounds(n);
      pr += kv(t('est.nth'), '≈ ' + esc(CP.fmtCount(nb.approx)), esc(t('est.nthApprox', { lo: CP.fmtCount(nb.lo), hi: CP.fmtCount(nb.hi) })));
    }
    o.innerHTML = `<div><p class="out-title">${esc(t('est.div'))}</p>${out(div)}</div><div><p class="out-title">${esc(t('est.prime'))}</p>${out(pr)}</div>`;
  } catch (e) { o.innerHTML = errBox(e); }
}
function runPi() {
  const o = $('#ppOut');
  try {
    const n = Math.floor(numField($('#ppN').value));
    if (!(n >= 1)) throw { key: 'err.needPositive', params: { fn: 'n' } };
    let rows = '';
    const pe = CP.primePi(CP.toBigInt(evalField($('#ppN').value), 'n'));
    if (pe !== null) rows += kvVal(t('nt.piExact'), pe, '', { big: true });
    else rows += kv(t('nt.piExact'), '—', esc(t('nt.piBig')));
    rows += kv(t('nt.nln'), esc(CP.fmtCount(n / Math.log(n)))) + kv(t('nt.li'), esc(CP.fmtCount(CP.li(n))));
    o.innerHTML = out(rows);
  } catch (e) { o.innerHTML = errBox(e); }
}
function runSumd() {
  const o = $('#sdOut');
  try {
    const n = Math.floor(numField($('#sdN').value));
    if (!(n >= 1)) throw { key: 'err.needPositive', params: { fn: 'n' } };
    let rows = '';
    if (n <= CP.SUMFLOOR_LIMIT) rows += kvVal(t('nt.sumD'), CP.sumFloor(n), t('exact'), { big: true });
    else rows += kv(t('nt.sumD'), esc(CP.fmtCount(n * Math.log(n) + (2 * GAMMA - 1) * n)), esc(t('nt.sumDApprox')));
    if (n <= CP.SUMSIGMA_LIMIT) rows += kvVal(t('nt.sumS'), CP.sumSigma(n), t('exact'));
    else rows += kv(t('nt.sumS'), esc(CP.fmtCount(Math.PI * Math.PI / 12 * n * n)), esc(t('nt.sumSApprox')));
    o.innerHTML = out(rows);
  } catch (e) { o.innerHTML = errBox(e); }
}
wire(['estN'], runEst, 250);
wire(['ntN'], runNt, 250);
wire(['fbIn'], runFactorBatch, 400);
wire(['mdN'], runMaxdiv, 250);
wire(['ppN'], runPi, 300);
wire(['sdN'], runSumd, 300);

/* ================================================= Combinatorics */
function runComb() {
  const box = $('#cbTable');
  let n, k;
  try { n = CP.toBigInt(evalField($('#cbN').value), 'n'); k = CP.toBigInt(evalField($('#cbK').value), 'k'); } catch (e) { box.innerHTML = errBox(e); return; }
  const N = Number(n);
  const rows = [
    ['n!', () => CP.factorial(n)], ['2ⁿ', () => CP.A.pow(2n, n)], ['3ⁿ', () => CP.A.pow(3n, n)], ['nᵏ', () => CP.A.pow(n, k)],
    ['C(n, k)', () => CP.binom(n, k)], ['P(n, k)', () => CP.perm(n, k)], ['Catalan(n)', () => CP.catalan(n)],
    ['p(n)', () => (N <= 5000 ? CP.partitions(n) : null)], ['Bell(n)', () => (N <= 800 ? CP.bell(n) : null)],
    ['S2(n, k)', () => (N <= 800 ? CP.stirling2(n, k) : null)], ['S1(n, k)', () => (N <= 800 ? CP.stirling1(n, k) : null)],
    ['Fib(n)', () => (N <= 200000 ? CP.fib(n) : null)],
  ];
  box.innerHTML = `<table class="tbl"><thead><tr><th>${t('cb.colF')}</th><th>${t('cb.colV')}</th><th class="num">${t('cb.colD')}</th></tr></thead><tbody>` +
    rows.map(([label, fn]) => {
      let cell = '', digits = '';
      try {
        const v = fn();
        if (v === null) cell = `<span class="hint">${esc(t('cb.skip'))}</span>`;
        else {
          const f = CP.formatValue(v);
          cell = `<span class="mono" data-copy="${esc(f.copy)}" style="cursor:copy">${esc(f.main)}</span>` + (f.sub ? ` <span class="hint">${esc(f.sub.split(' · ')[0])}</span>` : '');
          digits = CP.isBig(v) ? String(v.toString().replace('-', '').length) : (v && v.approxLog10 ? String(Math.floor(v.approxLog10) + 1) : '');
        }
      } catch (e) { cell = `<span class="hint">${esc(UI.errMsg(e))}</span>`; }
      return `<tr><td class="mono">${label}</td><td style="white-space:normal;overflow-wrap:anywhere">${cell}</td><td class="num">${digits}</td></tr>`;
    }).join('') + '</tbody></table>';
}
function runFeas() {
  const box = $('#fsTable');
  let n, k;
  try { n = numField($('#fsN').value); k = numField($('#fsK').value); } catch (e) { box.innerHTML = errBox(e); return; }
  const lf = (x) => CP.lgammaApprox(x + 1) / Math.LN10; // log10 x!
  const l2 = Math.log10(2), l3 = Math.log10(3), ln = Math.log10(Math.max(n, 1));
  const lC = n >= k && k >= 0 ? lf(n) - lf(k) - lf(n - k) : -Infinity;
  const rows = [
    ['fs.perm', lf(n)], ['fs.permn', lf(n) + ln], ['fs.subset', n * l2], ['fs.subsetn', n * l2 + ln],
    ['fs.bitdp', n * l2 + 2 * ln], ['fs.submask', n * l3], ['fs.choose', lC], ['fs.choosek', lC + Math.log10(Math.max(k, 1))],
    ['fs.power', k * ln], ['fs.mitm', n / 2 * l2 + ln],
  ];
  box.innerHTML = `<table class="tbl"><thead><tr><th>${t('cb.colPat')}</th><th class="num">${t('cb.colOps')}</th><th class="num">${t('cb.colT')}</th><th>${t('cb.colVd')}</th></tr></thead><tbody>` +
    rows.map(([key, lg]) => {
      const ops = Math.pow(10, lg);
      const vd = verdict(ops, 1);
      const opsS = lg > 300 ? '≈ 1e' + Math.floor(lg) : CP.fmtCount(Math.round(ops));
      return `<tr><td>${esc(t(key))}</td><td class="num">${esc(opsS)}</td><td class="num">${esc(lg > 300 ? '∞' : CP.fmtTime(vd.time))}</td><td>${chip(vd.cls)}</td></tr>`;
    }).join('') + '</tbody></table>';
}
wire(['cbN', 'cbK'], runComb, 250);
wire(['fsN', 'fsK'], runFeas);
})();
