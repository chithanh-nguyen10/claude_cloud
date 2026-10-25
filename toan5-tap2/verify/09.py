#!/usr/bin/env python3
"""Answer checks for chapter 09 (boats on a river; trains with length). Exact Fractions."""
import sys
from fractions import Fraction as F

bad = 0


def check(label, got, want):
    global bad
    ok = F(got) == F(want)
    print("%-8s %-28s got %-10s want %-10s %s" % (label, "", got, want, "OK" if ok else "MISMATCH"))
    if not ok:
        bad += 1


def kmh(v):          # km/h -> m/s
    return F(v) * 1000 / 3600


def river_raft_time(t_down, t_up):     # AB = 1: hours for a raft
    t_down, t_up = F(t_down), F(t_up)
    return 1 / ((1 / t_down - 1 / t_up) / 2)


# ---------- examples ----------
# Ex1: 6:30 + 36/18 + 0.5 + 36/12 -> 12:00
check("Ex1", F(13, 2) + F(36, 18) + F(1, 2) + F(36, 12), 12)
check("Ex2", river_raft_time(4, 6), 24)
check("Ex3a", kmh(54) * 8, 120)
check("Ex3b", (120 + 330) / kmh(54), 30)
check("Ex4a", F(300, 30), 10)
check("Ex4b", F(300, 10), 30)
v = F(150 + 210, 24)
check("Ex5 v", v, 15)
check("Ex5 m1", (v * 12 - 150) / 12, F(5, 2))
check("Ex5 m2", v - F(150, 12), F(5, 2))
check("Ex5 kmh", F(5, 2) * F(36, 10), 9)

# ---------- practice ----------
check("P1d", 16 + 2, 18); check("P1u", 16 - 2, 14)
check("P2", (21 + 3) * (F(9 * 60 + 45 - 7 * 60 - 15, 60)), 60)
vd, vu = 45 / F(3, 2), 45 / F(9, 4)
check("P3 boat", (vd + vu) / 2, 25); check("P3 cur", (vd - vu) / 2, 5)
check("P4", 48 / ((F(48, 3) - F(48, 4)) / 2), 24)
check("P5 b", F(22 + 16, 2), 19); check("P5 c", F(22 - 16, 2), 3)
check("P6", 38 / (12 - F(5, 2)), 4)
AB = (18 + 3) * 2
check("P7", F(AB, 15) * 60, 2 * 60 + 48)
check("P8", 36 / (15 - F(15, 2) / F(5, 2)), 3)
check("P9", F(48, 24) + F(48, 16), 5)
up = F(4) / F(1, 2); check("P10", (up + up * F(3, 2)) / 2, 10)
# P11: down*3 = up*4, down-up = 4
down = F(4) * 4; check("P11 ab", down * 3, 48); check("P11 up", down * 3 / (down - 4), 4)
down = F(15); up = F(10)
check("P12 ratio", down * 2, up * 3); check("P12 cur", (down - up) / 2, F(5, 2)); check("P12", (down + up) / 2, F(25, 2))
check("P13", river_raft_time(5, 7), 35)
check("P14", F(36, 18) + F(36, 12), 5)
check("P15", (F(6, 3) + F(6, 5)) * 60, 3 * 60 + 12)
check("P16", kmh(72) * 9, 180)
check("P17", F(240, 16), 15); check("P17k", F(15) * F(36, 10), 54)
check("P18", F(150 + 300, 15), 30)
check("P19", kmh(54) * 48 - 600, 120)
v = F(360, 34 - 10); check("P20 v", v, 15); check("P20 L", v * 10, 150)
check("P21a", F(1000 + 200, 20), 60); check("P21b", F(1000 - 200, 20), 40)
check("P22", (F(180, 9) - kmh(18)) * F(36, 10), 54)
check("P23", (F(200, 25) + 2) * F(36, 10), 36)
check("P24", F(120 + 180) / (kmh(54) + kmh(36)), 12)
check("P25", F(160 + 140, 20 - 15), 60)
check("P26", (kmh(72) - kmh(54)) * 40, 200)
check("P27", (15 + 10) * 9, 225)
v = F(150, 16 - 10); check("P28 v", v, 25); check("P28 L", v * 10, 250)
check("P29", 15 * 40 - 150, 450)
v = F(420 - 240, 37 - 25); check("P30 v", v, 15); check("P30 L", v * 25 - 240, 135)

# ---------- challenge ----------
check("C31", 20 * 2, 40); check("C31 t", F(40, 20) + F(40, 16), F(9, 2))
t = F(60, 23 + 17); check("C32 t", t, F(3, 2)); check("C32 d", 23 * t, F(69, 2))
t1 = F(30, 15); gap = 30 - 3 * t1; check("C33", t1 + gap / (9 + 3), 4)
check("C34", 2 / F(40, 60), 3)
# verify C34 by simulation: drop at x=0, rower up at speed (u - c) for 1/3 h, then down at (u + c)
for u in (F(5), F(7)):
    c = F(3); x = -(u - c) * F(1, 3); hat = c * F(1, 3); tb = (hat - x) / ((u + c) - c)
    check("C34 sim", c * (F(1, 3) + tb), 2)
check("C35", 20 * F(4 * 3, 8), 30); check("C35 t", F(30, 20) + F(30, 12) + F(1, 2), F(9, 2))
check("C36", F(2 * 5, 3) * 60, 200)
check("C37", river_raft_time(3, F(9, 2)), 18)
up = F(4) * 2; check("C38", up * 3, 24); check("C38 d", (up + 4) * 2, 24)
t = F(6, 12 - 3); check("C39 t", t * 60, 40); check("C39 d", 12 * t, 8)
v = F(10); L = (v - 1) * 22; check("C40 L", L, 198); check("C40 opp", L / (v + 1), 18)
v = F(3000, 150); check("C41 v", v, 20); check("C41 L", v * 90 - 1500, 300); check("C41 in", (1500 - 300) / v, 60)
vs = F(16); tot = (24 + vs) * 10; check("C42 L", tot - 180, 220); check("C42 over", tot / (24 - vs), 50)
check("C43", (F(300, 12) - kmh(54)) * F(36, 10), 36)
L = F(20 * 25, 5); check("C44 L", L, 100); check("C44 B", 4 * L, 400)
s = F(300, 10); check("C45 a", s / F(5, 2), 12); check("C45 b", s / F(5, 2) * F(3, 2), 18)
check("C46", (kmh(72) - kmh(54)) * 90 - 240, 210)
check("C47", F(150, (6 + 1) + (4 - 1)), 15)
check("C48", F(300, 3) + F(300, 6), 150)
check("C49", kmh(72) * 100 - 250, 1750)
c = F(1, 30)            # raft: AB = 1, current = 1/30 AB per hour
part = 2 * c            # downstream 3 parts, upstream 2 parts, difference = 2c
check("C50 down", 1 / (3 * part), 5); check("C50 up", 1 / (2 * part), F(15, 2))

print("ALL OK" if bad == 0 else "%d MISMATCH(ES)" % bad)
sys.exit(1 if bad else 0)
