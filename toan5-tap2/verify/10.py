#!/usr/bin/env python3
"""Answer checks for chapter 10 (circular track; back-and-forth meetings). Exact Fractions."""
import sys
from fractions import Fraction as F

bad = 0


def check(label, got, want):
    global bad
    ok = F(got) == F(want)
    print("%-10s got %-10s want %-10s %s" % (label, got, want, "OK" if ok else "MISMATCH"))
    if not ok:
        bad += 1


PI = F(314, 100)


def second_meeting(ab, va, vb, steps=200000):
    """Simulate two walkers going back and forth on [0, ab] (A at 0, B at ab).
    Returns (time, position) of the first two meetings (including catch-ups)."""
    va, vb, ab = F(va), F(vb), F(ab)
    # event-driven: positions are piecewise linear; check each interval between turn events
    xa, da, xb, db, t = F(0), 1, ab, -1, F(0)
    meets = []
    for _ in range(100):
        # time to next wall for each
        ta = (ab - xa) / va if da == 1 else xa / va
        tb = (ab - xb) / vb if db == 1 else xb / vb
        dt = min(ta, tb)
        # relative motion within this interval
        rel = da * va - db * vb
        if rel != 0:
            tm = (xb - xa) / rel
            if 0 < tm <= dt and (not meets or t + tm > meets[-1][0]):
                meets.append((t + tm, xa + da * va * tm))
        xa += da * va * dt; xb += db * vb * dt; t += dt
        if dt == ta: da = -da
        if dt == tb: db = -db
        if len(meets) >= 2:
            return meets[:2]
    return meets


# ---------- examples ----------
check("Ex1", F(3, 2) / (15 - 12) * 60, 30)
check("Ex2a", F(400, 8), 50); check("Ex2b", 3 * 50, 150); check("Ex2c", F(600, 50), 12)
s = 8 * F(3, 4); laps = s // F(9, 5); rem = s - laps * F(9, 5)
check("Ex3 laps", laps, 3); check("Ex3 rem", rem, F(3, 5)); check("Ex3", F(9, 5) - rem, F(6, 5))
check("Ex4", 100 * PI / (F(9, 2) - F(5, 2)), 157)
m = second_meeting(34, 14, 20)
check("Ex5 m1", m[0][1], 14); check("Ex5 m2", 34 - m[1][1], 8)

# ---------- practice ----------
check("P1", F(400, 10), 40)
check("P2", F(400, 2), 200)
check("P3", F(3, 30) * 60, 6)
check("P4", F(3, 6) * 60, 30)
check("P5 t", F(900, 30), 30); check("P5 L", F(60 * 30, 900), 2); check("P5 M", F(90 * 30, 900), 3)
d = 150 * 14; check("P6 laps", d // 800, 2); check("P6 more", 800 - d % 800, 300)
check("P7", 50 * PI * 5, 785)
check("P8", 100 * PI / 8, F(3925, 100))
check("P9", F((25 - 20) * 2, 2), 5)
check("P10", F(600) / (F(500) / 5), 6)
check("P11", 250 - F(1000, 10), 150)
check("P12", F(600, 2) - 140, 160)
check("P13", F(100, 2), 50)
check("P14", 1 / (F(1, 4) - F(1, 6)), 12)
check("P15", 1 / (F(1, 4) + F(1, 6)) * 60, 144)
check("P16", 15, min(t for t in range(1, 100) if t % 3 == 0 and t % 5 == 0))
check("P17", F(2000, 10), 200); check("P17k", F(200 * 60, 1000), 12)
m = second_meeting(30, 12, 18)
check("P18a", m[0][1], 12); check("P18b", m[1][1], 24)
m = second_meeting(22, 9, 13)
check("P19 m1", m[0][1], 9); check("P19 m2", 22 - m[1][1], 5)
m = second_meeting(60, 2, 3)
check("P20", m[1][1] - m[0][1], 24)
check("P21", 942 / (F(6, 10) * PI), 500)
check("P22a", 10 * 2 * PI, F(628, 10)); check("P22b", 10 * 2 * PI * 3, F(1884, 10))
check("P23 m", 6 * F(400, 2), 1200); check("P23 laps", F(1200, 400), 3)
check("P24", 1 / (F(1, 80) + F(1, 120)), 48)
check("P25", F(1200, 3), 400)
check("P26", 3 / (F(25, 100) + F(35, 100)), 5)
check("P27", (4 + 6) * 40, 400)
check("P28", (260 - 180) * 6, 480)
d = F(9); lap = F(5, 2); rem = d - (d // lap) * lap
check("P29", lap - rem, 1)
m = second_meeting(50, 1, F(3, 2))
check("P30a", m[0][0], 20); check("P30b", m[1][0], 60)

# ---------- challenge ----------
t = next(t for t in range(1, 10000) if (3 * t) % 300 == (4 * t) % 300 == (5 * t) % 300)
check("C31", t, 300)
check("C32 start", next(t for t in range(1, 10000) if t % 100 == 0 and t % 80 == 0), 400)
check("C32 meet", F(400, 1), 400)
k = next(k for k in range(1, 100) if (150 * k) % 400 == 0)
check("C33 k", k, 8); check("C33 t", 50 * k, 400)
check("C34", 15 / (1 - F(1, 12)), F(180, 11))
check("C35", 12 / (60 / (1 - F(1, 12)) / 60), 11)
check("C36a", F(200, 2), 100); check("C36b", 100 + F(600, 2), 400)
s, d = F(400, 40), F(400, 200)
check("C37a", (s + d) / 2, 6); check("C37b", (s - d) / 2, 4)
check("C38", 1 / (1 / F(12, 5) - F(1, 6)), 4)
check("C39", 12 * F(6, 8), 9)
m = second_meeting(180, 4, 5)
check("C40", m[1][1] - m[0][1], 40)
m = second_meeting(70, 4, 3)
check("C41 m1", m[0][1], 40); check("C41 m2", m[1][1], 20)
check("C42 t", 3 * F(500, 5), 300); check("C42 d", (3 * 300) % 500, 400)
check("C43", F(1600, F(2000, 5)), 4)
check("C44", F(400 - 160, F(160, 4)), 6)
check("C45", 40 * PI / 8, F(157, 10))
check("C46", F(5, 10) * PI * 200 * 60 / 1000, F(1884, 100))
check("C47", F(200, 2), 100)
check("C48", F(200, 8) + 2 * F(400, 8), 125)
m = second_meeting(1200, 70, 50)
check("C49", m[1][0], 30)
fast = (F(1, 30) + F(1, 150)) / 2; slow = F(1, 30) - fast
check("C50a", 1 / fast, 50); check("C50b", 1 / slow, 75)

print("ALL OK" if bad == 0 else "%d MISMATCH(ES)" % bad)
sys.exit(1 if bad else 0)
