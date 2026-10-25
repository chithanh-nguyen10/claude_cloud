#!/usr/bin/env python3
"""Answer checks for chapter 06 (Uniform motion, basic s = v x t). Exact arithmetic with Fraction."""
import sys
from fractions import Fraction as F

bad = 0
def check(tag, got, want):
    global bad
    ok = got == want
    print("%-6s %-44s %s" % (tag, str(got), "ok" if ok else "MISMATCH (want %s)" % (want,)))
    if not ok:
        bad += 1

def T(h, m=0, s=0):            # duration / clock time -> hours (Fraction)
    return F(h) + F(m, 60) + F(s, 3600)
def hm(x):                      # hours -> (h, min) on a 24 h clock-free duration
    mins = x * 60
    assert mins.denominator == 1, x
    return (int(mins) // 60, int(mins) % 60)
def clock(x):                   # hours -> clock (h mod 24, min)
    h, m = hm(x)
    return (h % 24, m)
D = F

# Examples
check("Ex1", (D("0.75") * 60, T(2, 24), 3 * 60 + 12), (45, D("2.4"), 192))
check("Ex2", (D(72000, 3600), 15 * D("3.6"), D(800 * 60, 1000)), (20, 54, 48))
check("Ex3", 110 / (T(9, 15) - T(6, 45) - T(0, 30)), 55)
check("Ex4", 14 * (T(9, 5) - T(7, 20)), D("24.5"))
check("Ex5", clock(T(6, 30) + D(135, 45) + T(0, 40) + D(135, 54)), (12, 40))

# Practice
check("P1", (D("0.4") * 60, D("1.25") * 60, T(2, 18), T(0, 45)), (24, 75, D("2.3"), D("0.75")))
check("P2", (D("3.5") * 60, 2 * 60 + 15, D("1.5") * 24, D(150, 60)), (210, 135, 36, D("2.5")))
check("P3", (D(36000, 3600), 25 * D("3.6"), D(54000, 60), D(750 * 60, 1000)), (10, 90, 900, 45))
check("P4", (hm(T(3, 45) + T(2, 30)), hm(T(8, 10) - T(5, 35)), hm(T(1, 25) * 3), hm(T(7, 30) / 6)),
      ((6, 15), (2, 35), (4, 15), (1, 15)))
check("P5", D(150, 3), 50)
check("P6", D("31.5") / T(2, 15), 14)
check("P7", D(400, 50), 8)
check("P8", 48 * D("2.5"), 120)
check("P9", D("4.5") * T(1, 20), 6)
check("P10", hm(D(84, 35)), (2, 24))
check("P11", D(27, 108) * 60, 15)
check("P12", 125 / (T(9, 45) - T(7, 15)), 50)
check("P13", 42 * (T(15, 10) - T(13, 40)), 63)
check("P14", clock(T(6, 50) + D(96, 40)), (9, 14))
check("P15", clock(T(11) - D(150, 60)), (8, 30))
check("P16", 162 / (T(10, 20) - T(7) - T(0, 20)), 54)
check("P17", 36 * (T(11, 30) - T(8, 15) - T(0, 45)), 90)
v = D("37.5") / T(1, 15); check("P18", hm(51 / v), (1, 42))
check("P19", hm(40 * T(3, 30) / 56), (2, 30))
check("P20", (D("1.2") / T(0, 15), D(1200, 15)), (D("4.8"), 80))
check("P21", 12 * T(0, 15) / T(0, 10), 18)
check("P22", 340 * 5, 1700)
check("P23", clock(T(21, 30) + D(360, 72)), (2, 30))
check("P24", 15 * T(0, 40) + 5 * T(0, 18), D("11.5"))
check("P25", clock(T(7) + D(90, 45) + T(0, 30) + D(90, 60)), (11, 0))
check("P26", clock(T(7, 30) + 2 + T(0, 15) + D(120 - 40 * 2, 50)), (10, 33))
check("P27", 5 * (T(7, 6) - T(6, 30)) + 40 * (T(7, 51) - T(7, 6)), 33)
v = 180 / T(2, 30); check("P28", (v, v / D("3.6")), (72, 20))
check("P29", D(120, 15), 8)
check("P30", 132 / (T(24) - T(22, 45) + T(4, 15)), 24)

# Challenge
check("P31", clock(T(7, 30) + D(50, 40) + D(100, 50)), (10, 45))
s = 16 * T(2, 15) + 12 * T(1, 45); check("P32", (s, s / 4), (57, D("14.25")))
t = D(9, 12) + D(15, 30); check("P33", (hm(t), 24 / t), ((1, 15), D("19.2")))
s1 = 60 * T(2, 50); check("P34", (clock(T(23, 40) + T(2, 50) + T(0, 20) + D(75, 50)), s1 + 75), ((4, 20), 245))
check("P35", (D(1200, 6), D(1200, 6) * 60 / 1000), (200, 12))
check("P36", 15 * D("3.6") * T(1, 20), 72)
check("P37", 36 * (T(9, 35) - T(8, 15)) + 45 * (T(10, 55) - T(9, 35)), 108)
check("P38", (T(7) + D(108, 36)) - (T(7, 30) + D(108, 54)), T(0, 30))
sp = {"An": D(100, 16), "Binh": D(1000, 200), "Cuong": D("21.6") / D("3.6")}
check("P39", sorted(sp, key=lambda k: -sp[k]), ["An", "Cuong", "Binh"])
check("P40", ((T(7, 15) - T(6, 40) - D(4, 12)) * 60, 4 / (T(7, 15) - T(6, 59))), (15, 15))
check("P41", 45 * (T(9, 41) - T(7, 5) - T(0, 18)), D("103.5"))
check("P42", clock(T(6, 50) + D(1260, 840)), (8, 20))
v = D(3000) / (12 * 60 + 30); check("P43", (v, v * D("3.6")), (4, D("14.4")))
check("P44", (16 * T(0, 45) + D("2.4"), D("2.4") / T(0, 36)), (D("14.4"), 4))
half = D(60, 40 + 60); check("P45", (hm(2 * half), 40 * half + 60 * half), ((1, 12), 60))
t = D(30, 30) + D(30, 60); check("P46", (t, 60 / t), (D("1.5"), 40))
check("P47", D(3600, 48), 75)
check("P48", D(120) / D("0.2") - D(120, 6), 580)
check("P49", 570 / (T(24) - T(19, 20) + T(6, 5) - T(1, 15)), 60)
check("P50", (115 - 40 * T(1, 15)) / (T(9, 30) - T(7) - T(1, 15)), 52)

print("FAILED: %d" % bad if bad else "ALL OK")
sys.exit(1 if bad else 0)
