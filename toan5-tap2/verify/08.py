#!/usr/bin/env python3
"""Answer checks for chapter 08 (speed-distance-time relations, average speed). Exact Fractions."""
import sys
from fractions import Fraction as F

bad = 0


def check(name, got, want):
    global bad
    ok = got == want
    print("%-8s %-44s %s" % (name, "%s == %s" % (got, want), "ok" if ok else "MISMATCH"))
    if not ok:
        bad += 1


def hm(h, m=0):
    return F(h) + F(m, 60)


def late(d, v_plan, v_real):          # minutes late (negative = early)
    return (F(d) / v_real - F(d) / v_plan) * 60


def avg(*legs):                       # legs = (distance, speed)
    return sum(F(d) for d, v in legs) / sum(F(d) / v for d, v in legs)


# ---- examples ----
check("Ex1", F(30) / (F(18) / hm(1, 30)), hm(2, 30))
check("Ex2", late(120, 60, 48), 30)
vc, vm = 45, 30; check("Ex3", (vc - vm, vc * 4, vm * 6), (15, 180, 180))
check("Ex4", (F(18 - 6) / 10 - F(18 - 6) / 12) * 60, 12)
check("Ex5a", F(45 * 2 + 60 * 1) / 3, 50); check("Ex5b", avg((12, 12), (12, 4)), 6)

# ---- practice ----
check("P1", 96 / hm(2, 40) * 4, 144)
check("P2", F(210) / (F(150) / F(5, 2)), hm(3, 30))
check("P3", 14 * F(5, 2), 35)
check("P4", 150 - 40 * F(150, 60), 50)
check("P5", 96 - 36 * F(96, 48), 24)
check("P6", F(40 * 3) / 60, 2)
check("P7", hm(6, 50) + F(42) * F(5, 2) / 60, hm(8, 35))
v = 50; d = (v - 10) * 4; check("P8", d / hm(3, 12), v)
check("P9", late(120, 50, 40), 36)
check("P10", late(90, 45, 54), -20)
check("P11", F(5, 2) / 15 + F(5, 2) / 5, F(2, 3))
check("P12", F(120) / 60 + F(120) / 40, 5)
check("P13", F(84) / 40 + F(84) / 60 + F(3, 4), hm(11, 30) - hm(7, 15))
check("P14", (F(120) / 2, F(120) / 48), (60, F(5, 2)))
check("P15", (hm(10, 12) - F(150) / 50, hm(9, 42) - F(150) / 60), (hm(7, 12), hm(7, 12)))
T = hm(2, 40); check("P16", (F(120) / 40 - T, T - F(120) / 50), (F(1, 3), F(16, 60)))
check("P17", (F(54) / 45 - F(54) / 54) * 60, 9 + 3)
check("P18", (F(6) / 12 - (F(2) / 12 + F(4) / 16)) * 60, 5)
x = 75; actual = F(x) / 50 + F(12, 60) + F(150 - x) / 60; check("P19", (3 - actual) * 60, 3)
check("P20", (F(150) / F(60), F(120) / 48), (F(5, 2), F(5, 2)))
check("P21", (60 - 36, 60 * 3, 36 * 5), (24, 180, 180))
check("P22", F(40 * F(3, 2) + 60 * F(1, 2)) / 2, 45)
check("P23", F(5) / hm(1, 15), 4)
check("P24", avg((80, 60), (80, 40)), 48)
check("P25", avg((60, 30), (60, 20)), 24)
check("P26", 50 * 3 - 45 * 2, 60)
check("P27", avg((6, 3), (6, 6)), 4)
check("P28", avg((60, 30), (60, 20), (60, 60)), 30)
check("P29", 4 * F(1500, 600), 10)
check("P30", (2 * F(5, 4) - 2) * 60, 30)

# ---- challenge ----
check("C31", 5 / (F(1, 4) + F(1, 6)), 12)
up, dn = 4, 8; check("C32", (F(up) / 4 + F(dn) / 6, F(up) / 6 + F(dn) / 4, up + dn), (hm(2, 20), hm(2, 40), 12))
check("C33", avg((240, 40), (240, 60)), 48)
check("C34", 60 * F(60, 60) - F(30) / 30, 0)       # time left for the second half = 0
check("C35", (F(18) / F(3, 2), F(18) / hm(1, 15)), (12, F(72, 5)))
d = 135; check("C36", (F(d) / 45 - F(d) / 60, hm(9, 15) - F(d) / 60), (F(3, 4), 7))
check("C37", (3 - (1 + F(80) / 50)) * 60, 24)
d = 130; check("C38", (1 + F(d - 50) / 40 - F(d) / 50) * 60, 24)
check("C39", F(180) / 5, 36)
check("C40", (F(40 + 60) / 2, avg((120, 40), (120, 60))), (50, 48))
T = hm(2, 30); check("C41", (T - T * F(4, 5)) * 60, 30)
check("C42", ((20 - 16) * F(3, 2), F(20) / 16), (6, F(5, 4)))
check("C43", (F(12) / 15 - F(12) / 18) * 60, 8)
check("C44", avg((180, 36), (180, 45)), 40)
check("C45", F(3, 2) / 5 + F(3, 2) / 3, F(48, 60))
check("C46", (F(120) / 40 - F(120) / 60, 7 + F(120) / 40, F(60, 40)), (1, 10, F(3, 2)))
check("C47", ((F(105, 2) - F(75, 2)) * 2, F(105, 2) / F(75, 2)), (30, F(7, 5)))
check("C48", (32 - 15 * F(4, 3)) / F(2, 3), 18)
check("C49", (F(6) / (F(3) / F(2, 3)) - F(6) / (F(12, 5) / F(1, 2))) * 60, 5)
t = 3; check("C50", F(120 + 40 * t) / (2 + t), 48)

if bad:
    print("%d mismatch(es)" % bad)
    sys.exit(1)
print("all checks passed")
