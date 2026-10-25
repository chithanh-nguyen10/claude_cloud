#!/usr/bin/env python3
"""Mixed Review 1, Mixed Review 2, End-of-Book 2 Test: check every answer with exact fractions."""
import sys
from fractions import Fraction as F

bad = 0


def check(name, got, want):
    global bad
    ok = got == want
    print("%-10s %-44s %s" % (name, "%s == %s" % (got, want), "ok" if ok else "MISMATCH"))
    if not ok:
        bad += 1


def paint(a, b, c):
    """a x b x c block painted outside, cut into unit cubes -> (3 faces, 2 faces, 1 face, 0 faces)."""
    three = 8
    two = 4 * ((a - 2) + (b - 2) + (c - 2))
    one = 2 * ((a - 2) * (b - 2) + (b - 2) * (c - 2) + (a - 2) * (c - 2))
    zero = (a - 2) * (b - 2) * (c - 2)
    assert three + two + one + zero == a * b * c
    return three, two, one, zero


P = F(1, 100)
# ================= Review 1
check("R1.1a", 240 * 35 * P, 84)
check("R1.1b", F(27, 45) / P, 60)
check("R1.1c", 27 / (15 * P), 180)
cost = F(1800000) / (1 + 20 * P); check("R1.2", (cost, 1800000 - cost), (1500000, 300000))
p = 500000 * (1 - 10 * P) * (1 + 10 * P); check("R1.3", (p, (500000 - p) / 500000 / P), (495000, 1))
check("R1.4", (2 * (8 + 5) * 4, 2 * (8 + 5) * 4 + 2 * 8 * 5), (104, 184))
check("R1.5", (F(294, 6), 7 ** 3), (49, 343))     # edge^2 = 49 -> edge 7
check("R1.6", F(15, 10) * F(8, 10) * 1 * 75 * P * 1000, 900)
check("R1.7", (50 * 40 * 3, F(50 * 40 * 3, 1000)), (6000, 6))
check("R1.8", paint(4, 4, 4), (8, 24, 24, 8))
t = 2 + F(20, 60); check("R1.9", (45 * t, F(7 * 60 + 15) + t * 60), (105, 9 * 60 + 35))
tm = F(150, 40 + 35); check("R1.10", (tm, 7 + tm, 40 * tm), (2, 9, 80))
tc = F(12 * 1, 36 - 12); check("R1.11", (tc, 36 * tc), (F(1, 2), 18))   # catches at 7:30, 18 km
check("R1.12", F(2) / (F(1, 12) + F(1, 24)), 16)
check("R1.13", F(40 * 3) / F(5, 2), 48)
check("R1.14", (F(18 - 12, 2), F(18 + 12, 2)), (3, 15))
v = F(180, 12); check("R1.15", (v, v * 3600 / 1000, F(180 + 420) / v), (15, 54, 40))
check("R1.16", (F(400, 3 + 5), F(400, 5 - 3)), (50, 200))
check("R1.17a", F(84, 10) * 5 - (8 + 7 + 9 + 10), 8)
check("R1.17b", (F(18, 40), F(18, 40) / P), (F(9, 20), 45))
check("R1.18", 40 - (25 + 18 - 7), 4)
x = F(40000) / (F(1, 2) * F(2, 3)); check("R1.19", x, 120000)
rab = F(94 - 2 * 35, 2); check("R1.20", (35 - rab, rab), (23, 12))

# ================= Review 2
check("R2.1", (F(25, 40) / P, F(15, 25) / P), (F(125, 2), 60))
check("R2.2", (5000000 * F(5, 1000), 5000000 * (1 + F(5, 1000))), (25000, 5025000))
check("R2.3", F(75) / (1 - 40 * P - 35 * P), 300)
salt = 200 * 5 * P; check("R2.4", (salt, salt / (4 * P) - 200), (10, 50))
check("R2.5", 2 * (30 + 20) * 15 + 30 * 20, 2100)
perim = F(200, 5); L = (perim / 2 + 4) / 2; W = L - 4
check("R2.6", (perim, L, W, L * W * 5), (40, 12, 8, 480))
vol = 25 * 10 * F(16, 10) * 80 * P; check("R2.7", (vol, vol / 50, (vol / 50 - 6) * 60), (320, F(32, 5), 24))
check("R2.8", paint(3, 4, 5), (8, 24, 22, 6))
check("R2.9", (5 ** 3, 5 ** 3 - 3 ** 3), (125, 98))
tw = F(45, 10) / 5; check("R2.10", (tw * 60, 6 * 60 + 45 + tw * 60), (54, 7 * 60 + 39))
check("R2.11", (F(27, 4 + 5), 10 * F(27, 9)), (3, 30))
check("R2.12", F(60, 55 - 40), 4)
check("R2.13", F(120) / (F(60, 30) + F(60, 60)), 40)
check("R2.14", (F(48, 14 + 2), F(48, 14 - 2), F(48, 16) + F(48, 12)), (3, 4, 7))
check("R2.15", F(150 + 130, 20 + 15), 8)
check("R2.16", (1 / (F(1, 6) - F(1, 10)), F(15, 6)), (15, F(5, 2)))
tot = 3 * 6 + 5 * 7 + 8 * 8 + 4 * 9; n = 3 + 5 + 8 + 4
check("R2.17a", (tot, n, F(tot, n)), (153, 20, F(765, 100)))
check("R2.17b", F(8, 50) / P, 16)
check("R2.18", 30 + 26 - (50 - 10), 16)
b2 = (50 + 10) * 2; check("R2.19", (b2, (b2 + 20) * 2), (120, 280))
w = F(4 * 30 - 95, 4 + 1); check("R2.20", (30 - w, w), (25, 5))

# ================= Test
check("T1", 80 * F(125, 1000), 10)
check("T2", F(3, 8) / P, F(75, 2))
check("T3", 4 ** 3, 64)
check("T4", F(25, 10) * 1000, 2500)
check("T5", 2 * (6 * 4 + 6 * 3 + 4 * 3), 108)
check("T6", 48 * F(45, 60), 36)
check("T7", (F(9, 4), F(9, 4) * 60), (F(9, 4), 135))
check("T8", 10 - 2, 8)
check("T9", F(12, 25) / P, 48)
check("T10", (10 - F(28 - 20, 2), F(28 - 20, 2)), (6, 4))
check("T11", 240000 / (1 - 20 * P), 300000)
check("T12", F(12, 10) * F(5, 10) * F(8, 10) * 1000, 480)
check("T13", (4 * 49, 6 * 49), (196, 294))
tt = F(210, 45 + 60); check("T14", (tt, 8 + tt), (2, 10))
v = F(200 + 300, 25); check("T15", (v, v * 3600 / 1000), (20, 72))
check("T16", 20 + 17 - (35 - 5), 7)
check("T17", paint(5, 5, 5), (8, 36, 54, 27))
r = (22 + 3) * 2; s = (r + 4) / (1 - F(1, 3)); check("T18", (r, s), (50, 81))
v = F(3 * 3 + 3 * 2, 3 - 2); check("T19", (v, (v + 3) * 2, (v - 3) * 3), (15, 36, 36))
wr = F(5 * 36 - 124, 5 + 2); check("T20", (wr, 36 - wr), (8, 28))

print("FAILED: %d" % bad if bad else "all review/test checks passed")
sys.exit(1 if bad else 0)
