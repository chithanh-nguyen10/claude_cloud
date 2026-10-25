#!/usr/bin/env python3
"""Check every answer of chapter 11 (Statistics and Probability) with exact fractions."""
import sys
from fractions import Fraction as F
from itertools import permutations, product

bad = 0


def chk(name, got, want):
    global bad
    ok = got == want
    print("%-8s %-40s %s" % (name, str(got), "ok" if ok else "MISMATCH (want %s)" % (want,)))
    if not ok:
        bad += 1


def mean(xs):
    return F(sum(xs), len(xs))


def pct(total, p):
    return F(total) / 100 * p


# ---- examples ----
pages = [18, 25, 20, 32, 15, 30, 28]
chk("Ex1a", (pages.index(max(pages)), pages.index(min(pages))), (3, 4))
chk("Ex1b", mean(pages), 24)
chk("Ex1c", sum(1 for x in pages if x > mean(pages)), 4)
books = [45, 60, 35, 70, 40]
chk("Ex2", (sum(books), mean(books), max(books) - min(books)), (250, 50, 35))
chk("Ex3", (100 - 35 - 20 - 25, pct(400, 35), pct(400, 35) - pct(400, 20), pct(400, 15)), (20, 140, 60, 60))
die = [6, 8, 5, 7, 9, 5]
chk("Ex4", (F(die[5], 40), F(die[1] + die[3] + die[5], 40), F(die[4] + die[5], 40)), (F(1, 8), F(1, 2), F(7, 20)))
outs = [a + b for a in (1, 2, 3) for b in (4, 5)]
chk("Ex5", (len(outs), F(outs.count(7), len(outs))), (6, F(1, 3)))

# ---- practice ----
t = [31, 29, 33, 30, 32]
chk("P1", (t.index(max(t)), t.index(min(t)), mean(t)), (2, 1, 31))
chk("P2", mean([7, 9, 8, 10, 6, 8]), 8)
chk("P3", mean([135, 142, 138, 145]), 140)
ic = [5, 3, 6, 4]
chk("P4", (4 * sum(ic), F(4 * sum(ic), 4)), (72, 18))
bk = [24, 30, 27, 39]
chk("P5", (sum(bk), mean(bk), sum(1 for x in bk if x > mean(bk))), (120, 30, 1))
g = [120, 135, 110, 140, 125]
chk("P6", (g.index(max(g)) + 1, g.index(min(g)) + 1, sum(g), g[3] - g[2]), (4, 3, 630, 30))
r = [80, 150, 210, 120]
chk("P7", (sum(r), mean(r)), (560, 140))
chk("P8", (pct(40, 30), pct(40, 45) - pct(40, 25)), (12, 8))
chk("P9", (pct(200, 40), pct(200, 15), pct(200, 60)), (80, 30, 120))
chk("P10", (100 - 30 - 25 - 20, pct(300, 25)), (25, 75))
chk("P11", (pct(12000000, 50), pct(12000000, 15)), (6000000, 1800000))
chk("P12", F(36, 30) * 100, 120)
chk("P13", 18 * 5 - (15 + 20 + 17 + 22), 16)
chk("P14", F(85, 10) * 4 - 8 * 3, 10)
chk("P15", F(25 * 3 + 33, 4), 27)
chk("P16", (F(28, 50), F(22, 50)), (F(14, 25), F(11, 25)))
chk("P17", (F(21, 60), F(15, 60), F(24, 60), F(39, 60)), (F(7, 20), F(1, 4), F(2, 5), F(13, 20)))
d = [4, 6, 5, 3, 7, 5]
assert sum(d) == 30
chk("P18", (F(d[0] + d[2] + d[4], 30), F(d[4] + d[5], 30)), (F(8, 15), F(2, 5)))
n19 = 9 / F(3, 20)
chk("P19", (n19, n19 - 9), (60, 51))
chk("P20", (25 * F(2, 5), 25 - 25 * F(2, 5)), (10, 15))
coins = list(product("HT", repeat=2))
chk("P21", (len(coins), sum(1 for c in coins if c[0] != c[1])), (4, 2))
chk("P22", 3 * 2, 6)
nums = [10 * a + b for a, b in permutations([1, 4, 7], 2)]
chk("P23", (len(nums), sum(1 for x in nums if x % 2 == 0)), (6, 2))
chk("P24", F(5, 10), F(1, 2))
gl = [2, 0, 3, 1, 4, 2, 1, 3]
chk("P25", (mean(gl), sum(1 for x in gl if x > mean(gl))), (2, 3))
h = [42, 45, 48, 50, 55]
chk("P26", (mean(h), h[-1] - h[0]), (48, 13))
chk("P27", (pct(1200, 25), pct(1200, 30) - pct(1200, 10)), (300, 240))
chk("P28", (pct(160000, 25), pct(160000, 50) - pct(160000, 15)), (40000, 56000))
chk("P29", F(32 * 5 + 36 * 3, 8), F(335, 10))
n30 = 14 / (1 - F(3, 5))
chk("P30", (n30, n30 - 14), (35, 21))

# ---- challenge ----
chk("P31", 15 * 6 - 14 * 5, 20)
chk("P32", 31 * 11 - 30 * 10, 41)
chk("P33", 8 * 5 - F(75, 10) * 4, 10)
p = F(35 * 3, 7)
chk("P34", (4 * p, 2 * p, p), (60, 30, 15))
chk("P35", max(range(36 - 4, 36 + 5, 2)), 40)
chk("P36", (F(825, 100) * 4 - 6 + 9) / 4, 9)
chk("P37", 160 * 5 - (120 + 150 + 180 + 210), 140)
n38 = F(12, 30) * 100
chk("P38", (n38, pct(n38, 40), pct(n38, 10)), (40, 16, 4))
chk("P39", pct(160, F(100 - 40 - 15, 3) * 2), 48)
chk("P40", pct(36, 50) - pct(40, 35), 4)
n41 = [10 * a + b for a, b in permutations([0, 3, 5, 8], 2) if a != 0]
chk("P41", (len(n41), sum(1 for x in n41 if x % 5 == 0)), (9, 5))
chk("P42", 6 * 5 // 2, 15)
dd = [a + b for a in range(1, 7) for b in range(1, 7)]
chk("P43", (len(dd), dd.count(7), F(dd.count(7), 36), F(dd.count(12), 36)), (36, 6, F(1, 6), F(1, 36)))
chk("P44", (F(4, 10), 6 - 4, F(4 + 2, 12)), (F(2, 5), 2, F(1, 2)))
chk("P45", (20 * F(1, 4), 20 * F(2, 5), 20 - 5 - 8), (5, 8, 7))
chk("P46", (F(4, 8), 80 * F(4, 8)), (F(1, 2), 40))
chk("P47", F(24 * 4 - 16, 4), 20)
chk("P48", (8 * 32 - F(83, 10) * 20) / 12, F(75, 10))
chk("P49", 12 * F(45, 60), 9)
perm = list(permutations("ABC"))
chk("P50", (len(perm), sum(1 for q in perm if q[1] == "A")), (6, 2))

print("\n%s" % ("ALL OK" if not bad else "%d MISMATCH(ES)" % bad))
sys.exit(1 if bad else 0)
