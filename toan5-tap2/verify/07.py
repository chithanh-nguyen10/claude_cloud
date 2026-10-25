#!/usr/bin/env python3
"""Answer checks for chapter 07 (meeting and catching up). Exact arithmetic with Fraction."""
import sys
from fractions import Fraction as F

bad = 0


def check(name, got, want):
    global bad
    ok = got == want
    print("%-8s %-40s %s" % (name, "%s == %s" % (got, want), "ok" if ok else "MISMATCH"))
    if not ok:
        bad += 1


def clk(h, m=0):          # clock time -> hours (Fraction)
    return F(h) + F(m, 60)


def hm(h, m=0):           # duration -> hours
    return F(h) + F(m, 60)


# ---- examples ----
t = F(225) / (48 + 42); check("Ex1 t", clk(6, 45) + t, clk(9, 15)); check("Ex1 d", 48 * t, 120)
t = 12 * F(1, 2) / (36 - 12); check("Ex2 t", clk(7, 40) + t, clk(7, 55)); check("Ex2 d", 36 * t, 9)
t = F(18) / (42 - 15); check("Ex3 t", clk(6, 30) + t, clk(7, 10)); check("Ex3 d", 42 * t, 28)
s = F(180) / 2; m = (s - 10) / 2; check("Ex4", (m + 10, m), (50, 40))
check("Ex5 a", clk(8) + F(150 - 30) / 75, clk(9, 36)); check("Ex5 b", clk(8) + F(150 + 30) / 75, clk(10, 24))

# ---- practice ----
check("P1", F(36) / 24, hm(1, 30))
check("P2", clk(7, 20) + F(279) / 124, clk(9, 35))
t = F(168) / 84; check("P3", (t, 38 * t), (2, 76))
t = F(210) / 84; check("P4", (clk(6, 30) + t, 45 * t), (clk(9), F(225, 2)))
s = 196 / hm(2, 20); m = (s - 12) / 2; check("P5", (m + 12, m), (48, 36))
check("P6", (105 / F(5, 2), (245 - 105) / F(5, 2)), (42, 56))
s = 288 / hm(3, 12); p = s / 5; check("P7", (3 * p, 2 * p), (54, 36))
h = F(5, 4); rem = 270 - 40 * h; t = rem / 100
check("P8", (clk(8, 15) + t, 40 * (h + t)), (clk(10, 27), 138)); check("P8 chk", 40 * (h + t) + 60 * t, 270)
check("P9", 50 * F(5, 2) + 45 * 2, 215)
check("P10", 160 - 80 * F(3, 2), 40)
check("P11", 30 / (1 - 2 * (F(1, 4) + F(1, 6))), 180)
check("P12", 1 / (F(1, 3) + F(1, 6)), 2)
t = F(24, 10) / 8; check("P13", (t * 60, clk(16, 40) + t), (18, clk(16, 58)))
check("P14", 4 * (F(24) / 16), 6)
check("P15", 132 / F(3, 2) - 52, 36)
t = F(48) / 16; check("P16", (t, 58 * t), (3, 174))
check("P17", clk(7, 10) + 14 * F(1, 2) / (35 - 14), clk(7, 30))
check("P18", 36 * hm(1, 45), 63)
check("P19", F(15) / 25 * 60, 36)
t = 45 * F(4, 3) / 30; check("P20", (clk(9, 20) + t, 75 * t), (clk(11, 20), 150))
d = F(36) / 3; check("P21", ((84 + d) / 2, (84 - d) / 2), (48, 36))
check("P22", 30 - 15 * F(4, 3), 10)
t = F(250 * 6) / 300; check("P23", (t, 550 * t), (5, 2750))
check("P24", F(250) / 100, hm(2, 30))
check("P25", clk(7) + F(15) / 12, clk(8, 15))
check("P26", 12 * F(3, 2) / F(1, 2), 36)
r = F(3, 10); t = (150 - 50 * r) / 90; check("P27", (clk(7) + t + r, 50 * (t + r)), (clk(8, 48), 90))
check("P28", clk(7) + F(120 - 25) / 95, clk(8))
check("P29", 60 * (F(40) / 20), 120)
t = F(4200) / 280; check("P30", (clk(6, 45) + t / 60, 80 * t), (clk(7), 1200))

# ---- challenge ----
t = F(240) / (80 + 40); check("C31", clk(7) + t, clk(9))
car, mb, lo = 80 * t, 240 - 30 * t, 240 - 50 * t; check("C31 chk", car, (mb + lo) / 2)
S, D = 150 / hm(1, 15), 150 / hm(7, 30); check("C32", ((S + D) / 2, (S - D) / 2), (70, 50))
S, D = 90 / F(3, 2), 90 / F(9, 2); check("C33", ((S + D) / 2, (S - D) / 2), (40, 20))
D = 60 / F(5, 2); check("C34", ((104 + D) / 2, (104 - D) / 2), (64, 40))
AB = 40 * 3 - 20; vA, vB = 40, AB - 40   # ratio of speeds = 40 : 60
tt = F(3 * AB, vA + vB); check("C35", (AB, vA * tt - AB), (100, 20))
S, D = F(210) / 2, F(30) / 2; check("C36", ((S + D) / 2, (S - D) / 2), (60, 45))
check("C37", clk(7) + F(15) / 45, clk(7, 20)); check("C37 rest", clk(6) + F(15) / 15 <= clk(7) + F(15) / 45 <= clk(7, 30), True)
check("C38", 15 * (F(6) / 9), 10)
check("C39", (clk(8) + F(30) / 20, clk(8) + F(50) / 20), (clk(9, 30), clk(10, 30)))
check("C40", clk(8) + F(108) / 36 - F(108) / 54, clk(9))
half = F(1, 2) / (F(1, 45) - F(1, 60)); check("C41", 2 * half, 180)
t = F(36) / 12; check("C42", 112 * t, 336); check("C42 chk", (112 * t) / 2 - 50 * t, 18)
d = 15 * F(2, 3); t = d / 10; check("C43", (t, 25 * t), (1, 25))
S = F(90) / 2; vA = 90 - S * F(8, 5); check("C44", (vA, S - vA), (18, 27))
check("C44 chk", vA * F(13, 5) + (S - vA) * F(8, 5), 90)
check("C45", 15 / (1 - F(1, 12)), F(180, 11))
p = F(240) / 2 / 8; check("C46", (3 * p, 5 * p, 3 * p * 2), (45, 75, 90))
check("C47", clk(8) + F(40 - 20) / 10, clk(10))
meet = 15 * (F(5) / 10); rest = 1 / (F(1, 5) - F(1, 15)); check("C48", meet + rest, 15)
check("C48 chk", F(15) / 5 - (1 + F(15) / 15), 1)
t = F(3400 - 400) / 150; check("C49", (clk(7, 5) + t / 60, 80 * (t + 5)), (clk(7, 25), 2000))
check("C50", (1 - F(1, 6)) / (F(1, 6) + F(1, 4)), 2)

if bad:
    print("%d mismatch(es)" % bad)
    sys.exit(1)
print("all checks passed")
