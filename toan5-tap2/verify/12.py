#!/usr/bin/env python3
"""Check every answer of chapter 12 (Venn diagrams, working backwards) with exact fractions."""
import sys
from fractions import Fraction as F

bad = 0


def chk(name, got, want):
    global bad
    ok = got == want
    print("%-8s %-44s %s" % (name, str(got), "ok" if ok else "MISMATCH (want %s)" % (want,)))
    if not ok:
        bad += 1


def give(state, a, b, n):
    s = list(state)
    s[a] -= n
    s[b] += n
    return s


def double_others(state, giver):
    """giver gives every other person as many as that person has"""
    s = list(state)
    for j in range(len(s)):
        if j != giver:
            s[giver] -= s[j]
            s[j] *= 2
    return s


def double_one(state, giver, recv):
    s = list(state)
    s[giver] -= s[recv]
    s[recv] *= 2
    return s


# ---- examples ----
chk("Ex1", (18 + 19 - 30, 18 - 7 + 19 - 7), (7, 23))
chk("Ex2", 36 - (20 + 15 - 8), 9)
fs, sc, fc, all3 = 8 - 3, 6 - 3, 7 - 3, 3
onlyF = 25 - fs - fc - all3
onlyS = 20 - fs - sc - all3
onlyC = 18 - fc - sc - all3
chk("Ex3", (onlyF, onlyF + onlyS + onlyC + fs + sc + fc + all3, 25 + 20 + 18 - 8 - 6 - 7 + 3), (13, 45, 45))
s = [27, 28, 20]
s = give(s, 0, 1, 6); s = give(s, 1, 2, 9); s = give(s, 2, 0, 4)
chk("Ex4", s, [25, 25, 25])
s = [65, 35, 20]
for g in range(3):
    s = double_others(s, g)
chk("Ex5", s, [40, 40, 40])

# ---- practice ----
chk("P1", 21 + 17 - 6, 32)
chk("P2", 28 + 22 - 40, 10)
b3 = 30 + 20 - (45 - 5)
chk("P3", (b3, 30 - b3, 20 - b3), (10, 20, 10))
chk("P4", (14 + 6, 6 + 9, 14 + 6 + 9 + 3), (20, 15, 32))
chk("P5", (12 + 4 + 9, 4 + 9), (25, 13))
chk("P6", 20 - 3 - 5, 12)
chk("P7", 38 - (15 + 20 - 7), 10)
chk("P8", 35 - (14 + 11 - 5), 15)
b9 = 42 + 35 - 60
chk("P9", (b9, 42 - b9, 35 - b9), (17, 25, 18))
chk("P10", sum(1 for n in range(1, 31) if n % 2 == 0 or n % 3 == 0), 20)
chk("P11", sum(1 for n in range(1, 51) if n % 2 and n % 5), 20)
chk("P12", (16 + 10 - 22, 16 - (16 + 10 - 22)), (4, 12))
chk("P13", 25 - (18 + 13 - 25), 19)
chk("P14", 58 + 47 - (100 - 15), 20)
chk("P15", (8 + 3 + 2 + 1, 8 + 7 + 6, 8 + 7 + 6 + 3 + 2 + 4 + 1 + 5), (14, 21, 36))
chk("P16", 25 + 20 + 15 - 6 - 4 - 5, 45)
chk("P17", 40 - (20 + 18 + 16 - 7 - 6 - 5 + 2), 2)
chk("P18", (15 - (5 - 1) - (3 - 1) - 1, 30 - (15 + 12 + 10 - 5 - 4 - 3 + 1)), (8, 4))
v = F(30 + 6, 3)
chk("P19", (2 * v, v, 2 * v + v - 6), (24, 12, 30))
s = [22, 23, 15]
s = give(s, 0, 1, 5); s = give(s, 1, 2, 8); s = give(s, 2, 0, 3)
chk("P20", s, [20, 20, 20])
chk("P21", give([31, 17], 0, 1, 7), [24, 24])
s = [33, 34, 23]
s = give(s, 0, 1, 8); s = give(s, 1, 2, 12); s = give(s, 2, 0, 5)
chk("P22", s, [30, 30, 30])
s = give(give([20, 24], 0, 1, 4), 1, 0, 10)
chk("P23", s, [26, 18])
chk("P24", double_one([45, 15], 0, 1), [30, 30])
chk("P25", double_one(double_one([50, 30], 0, 1), 1, 0), [40, 40])
chk("P26", double_one(double_one([21, 9, 6], 0, 1), 1, 2), [12, 12, 12])
s = [24, 30, 16]
s = give(s, 0, 1, 5); s = give(s, 1, 2, 7); s = give(s, 2, 0, 9)
chk("P27", (s, s[0] == s[1] == 2 * s[2]), ([28, 28, 14], True))
m = F(36); m = m - (m / 2 + 2); m = m - (m / 2 + 3)
chk("P28", m, 5)
s = [44, 20]
s = double_one(s, 0, 1); s = double_one(s, 1, 0); s = double_one(s, 0, 1)
chk("P29", s, [32, 32])
w = F(120); w -= w / 4; w -= w / 3
chk("P30", w, 60)

# ---- challenge ----
cnt = sum(1 for n in range(1, 31) if n % 2 == 0 or n % 3 == 0 or n % 5 == 0)
chk("P31", (cnt, 30 - cnt), (22, 8))
regions = {}
for n in range(1, 31):
    key = (n % 2 == 0, n % 3 == 0, n % 5 == 0)
    regions[key] = regions.get(key, 0) + 1
chk("P31fig", [regions[k] for k in [(1, 0, 0), (0, 1, 0), (0, 0, 1), (1, 1, 0), (1, 0, 1), (0, 1, 1), (1, 1, 1), (0, 0, 0)]],
    [8, 4, 2, 4, 2, 1, 1, 8])
chk("P32", (25 + 28 - 40, min(25, 28)), (13, 25))
x33 = 45 - (24 + 22 + 20 - 9 - 7 - 8)
chk("P33", x33, 3)
chk("P33ok", min(9, 7, 8) >= x33 and 24 - (9 - 3) - (8 - 3) - 3 > 0, True)
me, es, sm = 30 + 24 - 46, 24 + 20 - 38, 20 + 30 - 42
chk("P34", (me, es, sm, 30 + 24 + 20 - me - es - sm), (8, 6, 8, 52))
chk("P34ok", (30 - me - sm, 24 - me - es, 20 - es - sm), (14, 10, 6))
od = 14 - 8
chk("P35", (od + 2 * od + 8 + 5, 2 * od + 8), (31, 20))
chk("P36", sum(1 for n in range(1, 101) if n % 3 == 0 and n % 4), 25)
e1 = 55 + 45 + 40 - 2 * 20 - 3 * 5
chk("P37", e1 + 20 + 5, 110)
chk("P38", (35 + 30 - 50, 35 + 30 - (50 - 4)), (15, 19))
s = [F(8), F(14), F(26)]
for g in range(3):
    h = s[g] / 2
    s = [s[j] + h / 2 if j != g else s[j] - h for j in range(3)]
chk("P39", s, [16, 16, 16])
A, B, C = F(24), F(48), F(32)
p = A / 3; A, B, C = p, B + p, C + p
p = B / 4; A, B, C = A + p, B - 2 * p, C + p
p = C / 3; A, B, C = A + p, B + p, C - 2 * p
chk("P40", (A, B, C), (40, 46, 18))
pg = F(96); left = pg - (pg / 3 + 4); left = left - (left / 2 + 6)
chk("P41", left, 24)
s = [50, 30, 10]
s = double_one(s, 0, 1); s = double_one(s, 0, 2)
s = double_one(s, 1, 0); s = double_one(s, 1, 2)
chk("P42", s, [20, 30, 40])
mo = F(100000); mo -= mo / 4; mo -= mo * F(2, 5); mo -= 15000
chk("P43", mo, 30000)
chk("P44", F(11 * 3 + 12, 5) - 4, 5)
e2 = (22 + 18 + 20 - 3 * 3) - (40 - 3)
chk("P45", (e2, 40 - 3 - e2), (14, 23))
chk("P46", 6 / (1 - (F(3, 5) + F(1, 2) - F(1, 4))), 40)
r = F(220); r -= r * F(40, 100); r -= r * F(50, 100)
chk("P47", r, 66)
s = [19, 27, 27, 27]
s = give(s, 0, 1, 3); s = give(s, 1, 2, 5); s = give(s, 2, 3, 7); s = give(s, 3, 0, 9)
chk("P48", s, [25, 25, 25, 25])
chk("P49", sum(1 for n in range(10, 100) if "5" in str(n)), 18)
s = [38, 21, 13]
for g in range(3):
    s = double_others(s, g)
chk("P50", s, [16, 24, 32])

print("\n%s" % ("ALL OK" if not bad else "%d MISMATCH(ES)" % bad))
sys.exit(1 if bad else 0)
