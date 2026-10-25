#!/usr/bin/env python3
"""Chapter 13 -- supposition method: check every answer with exact fractions."""
import sys
from fractions import Fraction as F

bad = 0


def check(name, got, want):
    global bad
    ok = got == want
    print("%-6s %-40s %s" % (name, "%s == %s" % (got, want), "ok" if ok else "MISMATCH"))
    if not ok:
        bad += 1


def two(n, a, b, total):
    """n objects worth a or b each (a<b), total value -> (#a, #b) by supposition (all a)."""
    nb = F(total - a * n, b - a)
    return n - nb, nb


def penalty(n, plus, minus, score):
    """all answered: right +plus, wrong -minus -> (#right, #wrong)."""
    w = F(plus * n - score, plus + minus)
    return n - w, w


def diff(n, a, b, d):
    """n objects, kind1 worth a, kind2 worth b; total of kind1 minus total of kind2 = d."""
    k2 = F(a * n - d, a + b)
    return n - k2, k2

# ---- examples
check("Ex1", two(32, 2, 4, 94), (17, 15))
check("Ex1b", F(4 * 32 - 94, 2), 17)
check("Ex2", two(45, 18000, 30000, 954000), (33, 12))
check("Ex3", penalty(25, 4, 2, 64), (19, 6))
check("Ex4", diff(30, 2, 4, 6), (21, 9))
# Ex5: pairs (bicycle+tricycle) = 2 vehicles 5 wheels, cars 4 wheels; 36 vehicles, 114 wheels
g = 36 // 2; swaps = F(114 - 5 * g, 8 - 5); cars = 2 * swaps; pairs = g - swaps
check("Ex5", (pairs, pairs, cars), (10, 10, 16))
check("Ex5c", 2 * pairs + cars == 36 and 5 * pairs + 4 * cars == 114, True)

# ---- practice
check("P1", two(25, 2, 4, 70), (15, 10))
check("P2", two(40, 2, 4, 104), (28, 12))
check("P3", two(18, 10000, 20000, 250000), (11, 7))
check("P4", two(12, 4, 6, 58), (7, 5))
check("P5", two(36, 3, 4, 120), (24, 12))
check("P6", two(15, 3, 5, 59), (8, 7))
check("P7", two(48, 2, 4, 136), (28, 20))
check("P8", penalty(20, 5, 1, 76), (16, 4))
check("P9", two(30, F(1, 2), F(3, 2), 27), (18, 12))
check("P10", two(24, 3000, 5000, 92000), (14, 10))
check("P11", two(21, 2, 3, 50), (13, 8))
check("P12", two(22, 6, 8, 152), (12, 10))
check("P13", two(30, 500, 1000, 21000), (18, 12))
check("P14", two(26, 2, 3, 60), (18, 8))
check("P15", penalty(24, 250000, 50000, 5100000), (21, 3))
check("P16", diff(40, 2, 4, 32), (32, 8))
check("P17", penalty(500, 2000, 8000, 940000), (494, 6))
check("P18", two(15, 12, 20, 236), (8, 7))
check("P19", two(F(5, 2), 4, 8, 14), (F(3, 2), 1))
check("P20", two(8, 30000, 45000, 315000), (3, 5))
check("P21", two(9, 7, 16, 99), (5, 4))
r = penalty(26, 4, 2, 74); check("P22", r, (21, 5))
check("P23", diff(34, 2000, 5000, 12000), (26, 8))
check("P24", two(15, 3, 4, 52), (8, 7))
check("P25", two(12, 3000, 7000, 64000), (5, 7))
check("P26", penalty(12, 3, -1, 28), (8, 4))   # draw = 1 point: each draw loses 3-1 = 2
check("P27", two(20, 8, 12, 196), (11, 9))
check("P28", two(50, 25000, 40000, 1520000), (32, 18))
check("P29", penalty(30, 6, 3, 126), (24, 6))
check("P30", diff(26, 2, 4, 4), (18, 8))

# ---- challenge
# 31: 24 vehicles; motorbikes 2 wheels 2 seats; cars 4 wheels (7 or 16 seats); 64 wheels, 133 people
m, c = two(24, 2, 4, 64); check("C31a", (m, c), (16, 8))
s7, s16 = two(c, 7, 16, 133 - 2 * m); check("C31", (m, s7, s16), (16, 3, 5))
# 32: 20 trucks: A 4 wheels 3 t; B 6 wheels 6 t; C 10 wheels 6 t; 96 t; 124 wheels
a, bc = two(20, 3, 6, 96); check("C32a", (a, bc), (8, 12))
b, cc = two(bc, 6, 10, 124 - 4 * a); check("C32", (a, b, cc), (8, 7, 5))
# 33: 40 q, +5 right, -2 wrong, 0 skip; wrong = skipped; score 128
blocks = F(5 * 40 - 128, (5 + 2) + 5); check("C33", 40 - 2 * blocks, 28)
check("C34", diff(30, 8000, 5000, 45000), (15, 15))
# 35: legs 100; swapped 80 -> heads 30
heads = F(100 + 80, 6); check("C35", two(heads, 2, 4, 100), (10, 20))
check("C36", two(100, F(1, 3), 3, 100), (75, 25))
check("C37", two(5, 30, 50, 230), (1, 4))
check("C38", penalty(1200, 300, 2700, 330000), (1190, 10))
check("C39", two(30, 2000, 5000, 117000), (11, 19))
# 40: 6 teams round robin: 15 matches, win/loss 3 points total, draw 2 points total; 41 points
check("C40", two(6 * 5 // 2, 2, 3, 41), (4, 11))
rt, wr = penalty(25, 4, 1, 65); check("C41a", (rt, wr), (18, 7))
check("C41", 4 * rt - (wr - 3), 68)
x12, x20 = two(25, 12000, 20000, 380000); check("C42a", (x12, x20), (15, 10))
check("C42", x20 * 12000 + x12 * 20000, 420000)
# 43: chickens 6 more than rabbits, 84 legs
pairs = F(84 - 2 * 6, 6); check("C43", (pairs + 6, pairs), (18, 12))
check("C44", two(40, 120000, 150000, 5520000), (16, 24))
check("C44p", F(120000, 150000), F(80, 100))
tb, tc = two(4, 15, 45, 120); check("C45", (tb, tc, tb * 15), (2, 2, 30))
sp_ins = two(18, 6, 8, 118); check("C46a", sp_ins, (13, 5))
check("C46", two(13, 1, 2, 20), (6, 7))
check("C47", F(45, 10 + 5), 3)
check("C48", two(22, 10, 15, 300), (6, 16))
check("C49", two(48, F(1, 4), F(1, 3), 14), (24, 24))
# 50: notes 10k (twice the 20k ones), 50k; 23 notes, 600 000 dong. group = 2x10k + 1x20k = 3 notes, 40 000
k = F(50000 * 23 - 600000, 150000 - 40000); f = 23 - 3 * k
check("C50", (2 * k, k, f), (10, 5, 8))
check("C50c", 10000 * 2 * k + 20000 * k + 50000 * f, 600000)

print("FAILED: %d" % bad if bad else "all chapter 13 checks passed")
sys.exit(1 if bad else 0)
