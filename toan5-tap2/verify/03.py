#!/usr/bin/env python3
"""Answer checks for chapter 03 (Cuboids and cubes: lateral and total surface area)."""
import sys
from fractions import Fraction as F

ok = True


def chk(label, got, exp):
    global ok
    got, exp = F(got), F(exp)
    good = got == exp
    ok &= good
    print("%-10s %-14s %-14s %s" % (label, got, exp, "OK" if good else "MISMATCH"))


def lat(a, b, c):
    return (F(a) + F(b)) * 2 * F(c)


def tot(a, b, c):
    return lat(a, b, c) + F(a) * F(b) * 2


def cube_lat(a):
    return F(a) * F(a) * 4


def cube_tot(a):
    return F(a) * F(a) * 6


# Examples
chk("Ex1a", lat(8, 5, 6), 156); chk("Ex1b", 8 * 5, 40); chk("Ex1c", tot(8, 5, 6), 236)
chk("Ex2 edge", 7 * 7 * 6, 294); chk("Ex2 lat", cube_lat(7), 196)
h = F(8) / 2; l = 3 * h; w = F(60) / l
chk("Ex3 h", h, 4); chk("Ex3 w", w, 5); chk("Ex3 lat", lat(l, w, h), 136); chk("Ex3 tot", tot(l, w, h), 256)
chk("Ex4", lat(50, 30, 20) + 50 * 30, 4700)
chk("Ex5", lat(6, F("4.5"), F("3.5")) + 6 * F("4.5") - F("7.5"), 93)
# Practice
chk("1b", 7 * 4, 28); chk("1b", 7 * 5, 35); chk("1b", 4 * 5, 20)
chk("1c lat", lat(7, 4, 5), 110); chk("1c tot", tot(7, 4, 5), 166)
chk("3a", lat(9, 6, 5), 150); chk("3a", tot(9, 6, 5), 258)
chk("3b", lat(F("2.5"), F("1.5"), F("1.2")), F("9.6")); chk("3b", tot(F("2.5"), F("1.5"), F("1.2")), F("17.1"))
chk("3c", lat(F(4, 5), F(1, 2), F(1, 3)), F(13, 15)); chk("3c", tot(F(4, 5), F(1, 2), F(1, 3)), F(5, 3))
chk("3d", lat(12, 8, 5), 200); chk("3d", tot(12, 8, 5), 392)
chk("4a", cube_lat(6), 144); chk("4a", cube_tot(6), 216)
chk("4b", cube_lat(F("2.5")), 25); chk("4b", cube_tot(F("2.5")), F("37.5"))
chk("4c", cube_lat(F(3, 4)), F(9, 4)); chk("4c", cube_tot(F(3, 4)), F(27, 8))
chk("5a", (15 + 10) * 2, 50); chk("5b", lat(15, 10, 8), 400); chk("5c", tot(15, 10, 8), 700)
chk("6", tot(24, 16, 10), 1568)
chk("7", lat(40, 25, 20) - 40 * 25 * 2, 600)
chk("8", lat(60, 40, 30) + 60 * 40, 8400)
chk("9", lat(8, 6, F("3.5")) + 48 - F("9.5"), F("136.5"))
chk("10", F("1.5") ** 2 * 5, F("11.25"))
chk("11 edge", 5 * 5 * 4, 100); chk("11 tot", cube_tot(5), 150)
chk("12", F(600) / 6 * 4, 400)
chk("13 edge", cube_lat(F("0.6")), F("1.44")); chk("13 tot", cube_tot(F("0.6")), F("2.16"))
chk("14", lat(12, 8, 9), 360); chk("14 diff", 12 - 8, 4)
chk("15", F(36) * 7, 252)
chk("16", F(480) / 48, 10)
chk("17", tot(F("2.4"), F("1.6"), F("1.5")), F("19.68"))
chk("18", F("0.25") * tot(F("1.2"), F("0.8"), F("0.6")), F("1.08"))
chk("19", (lat(25, 10, F("1.6")) + 250) / F("0.05"), 7240)
chk("20", (lat(3, 2, F("0.8")) + 6) * 100 / 4, 350)
chk("21 dims", (9 + 6) * 2, 30); chk("21 h", 9 * F(2, 3), 6)
chk("21", lat(9, 6, 6), 180); chk("21", tot(9, 6, 6), 288)
chk("22", cube_tot(6) - tot(8, 6, 4), 8)
chk("23", lat(5, 5, 12), 240); chk("23", tot(5, 5, 12), 290)
chk("24", (lat(20, 20, 35) + 400) / 100, 32)
chk("25", F("2.5") ** 2 * 5, F("31.25"))
chk("26", F("1.2") ** 2 * 10 / 3, F("4.8"))
chk("27 h", 4 * (12 + 8 + 4), 96); chk("27", tot(12, 8, 4), 352)
chk("28", cube_tot(F(72) / 12), 216)
chk("29", (lat(80, 40, 50) + 80 * 40) / 100, 152)
chk("30", cube_tot(5) - cube_lat(5), 50); chk("30", cube_lat(5), 100)
# Challenge
chk("31 dims", 15 - 6, 9); chk("31 h", F(2, 5) * 15, 6); chk("31 base", 15 * 8, 120)
chk("31", lat(15, 8, 6), 276); chk("31", tot(15, 8, 6), 516)
chk("32", lat(F("2.25"), F("1.25"), F("1.5")), F("10.5")); chk("32 diff", F("2.25") - F("1.25"), 1)
chk("33 w", F(3, 4) * 2, F("1.5")); chk("33 diff", 2 - F("1.5"), F("0.5"))
chk("33a", tot(2, F("1.5"), F("1.2")), F("14.4")); chk("33b", tot(2, F("1.5"), F("1.2")) * 3 / 4, F("10.8"))
chk("34", cube_tot(6) - cube_tot(4), 120)
chk("35", tot(10, 5, 5), 250); chk("35 diff", 2 * cube_tot(5) - tot(10, 5, 5), 50)
chk("36", tot(12, 4, 4), 224); chk("36 faces", 14 * 16, 224)
chk("37", tot(10, 6, 4), 248); chk("37 halves", 2 * tot(10, 6, 2), 368)
chk("38", lat(4, 4, 10), 160); chk("38", tot(4, 4, 10), 192)
chk("39", cube_tot(F("0.5")), F("1.5")); chk("39", cube_lat(F("0.5")), 1)
chk("40", lat(30, 20, 5) + 30 * 20, 1100); chk("40 card", 40 * 30 - 4 * 25, 1100)
chk("41", (lat(5, 4, 3) + 20 - 4) * 25000, 1750000)
chk("42 sum", 4 * (15 + 5 + 10), 120); chk("42", tot(15, 5, 10), 550)
chk("43", (12 + 15 + 20) * 2, 94); chk("43 dims", tot(3, 4, 5), 94)
chk("44", 15 * 15 * 5 * 2, 2250)
chk("45 lat", lat(6, 6, 9), 3 * 72); chk("45", tot(6, 6, 9), 288)
chk("46", tot(8, 5, 6), 236); chk("46 b", 2 * tot(8, 5, 3) - 80, 236)
tiles = (lat(F("12.5"), 6, F("1.4")) + F("12.5") * 6) / F("0.05")
chk("47 tiles", tiles, 2536); chk("47 boxes", -(-tiles // 12), 212)
chk("48", tot(12, 9, 4), 384); chk("48", cube_tot(8), 384)
chk("49", tot(8, 8, 5) - tot(11, 5, 5), 18)
chk("50", 8 * cube_tot(3), 432); chk("50", F(8 * cube_tot(3)) / cube_tot(6), 2)

print("ALL OK" if ok else "SOME CHECKS FAILED")
sys.exit(0 if ok else 1)
