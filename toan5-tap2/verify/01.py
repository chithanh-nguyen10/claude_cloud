#!/usr/bin/env python3
"""Answer checks for chapter 01 (Working with Percentages)."""
import sys
from fractions import Fraction as F

P = lambda x: F(str(x)) / 100          # percentage -> number
D = lambda x: F(str(x))                # decimal string -> exact
ok = True


def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (expected {want})")


# Examples
check("Ex1 0.36", D(0.36) * 100, 36)
check("Ex1 7/20", F(7, 20) * 100, 35)
check("Ex1 1.075", D(1.075) * 100, D(107.5))
check("Ex1b 6.5%", P(6.5), F(13, 200))
check("Ex1b 160%", P(160), F(8, 5))
check("Ex1b 45%", P(45), F(9, 20))
check("Ex2d", P(40) * P(15), P(6))
check("Ex2e", P(72) / P(9), 8)
check("Ex2c", P(15.5) * 6, P(93))
A = D(4.5) - F(7, 4) + P(63) / P(18)
check("Ex3", A, F(25, 4))
x = (D(9) / D(0.5) - D(1.6)) * P(25)
check("Ex4", x, D(4.1)); check("Ex4 back", x / P(25) + D(1.6), 18)
lan = 72 / (1 + P(80)); check("Ex5 Lan", lan, 40); check("Ex5 Hoa", lan * P(80), 32)

# Practice
for v, w in [(0.47, 47), (1.36, 136), (0.209, 20.9), (0.8, 80), (2.5, 250), (0.035, 3.5)]:
    check(f"P1 {v}", D(v) * 100, D(w))
for fr, w in [(F(3, 5), 60), (F(9, 20), 45), (F(21, 30), 70), (F(7, 8), 87.5), (F(13, 4), 325), (F(33, 40), 82.5)]:
    check(f"P2 {fr}", fr * 100, D(w))
for p, w in [(38, 0.38), (4, 0.04), (215, 2.15), (9.6, 0.096), (300, 3), (0.5, 0.005)]:
    check(f"P3 {p}%", P(p), D(w))
for p, w in [(40, F(2, 5)), (85, F(17, 20)), (64, F(16, 25)), (150, F(3, 2)), (2.5, F(1, 40)), (62.5, F(5, 8))]:
    check(f"P4 {p}%", P(p), w)
check("P5a", D(0.7) > P(69), True); check("P5b", F(3, 8) == P(37.5), True)
check("P5c", P(125) > F(6, 5), True); check("P5d", F(2, 3) > P(66), True)
vals = {"0.43": D(0.43), "2/5": F(2, 5), "41.5%": P(41.5), "9/20": F(9, 20), "39%": P(39)}
check("P6", sorted(vals, key=vals.get), ["39%", "2/5", "41.5%", "0.43", "9/20"])
check("P7a", P(28) + P(56), P(84)); check("P7b", P(143) - P(67), P(76))
check("P7c", P(12.5) + P(7.25) + P(30.25), P(50)); check("P7d", P(90) - P(45) + P(15), P(60))
check("P8a", P(23.4) * 5, P(117)); check("P8b", P(252) / 12, P(21))
check("P8c", P(6.8) * 15, P(102)); check("P8d", P(99) / D(4.5), P(22))
check("P9a", P(60) * P(35), D(0.21)); check("P9b", P(140) * P(25), D(0.35))
check("P9c", P(3.5) * P(80), D(0.028)); check("P9d", P(84) / P(12), 7)
check("P9e", P(45) / P(0.5), 90); check("P9g", P(7.2) / P(16), D(0.45))
check("P10a", D(2.4) + P(35) - F(3, 4), 2)
check("P10b", F(3, 2) * P(40) + D(2.8) / P(70), D(4.6))
check("P11a", P(25) * 8 + D(13.5) / D(4.5) - F(12, 5), D(2.6))
check("P11b", D(4.8) - F(5, 4) + P(36) / P(144), D(3.8))
check("P12a", P(37) * D(2.5) + P(63) * D(2.5), D(2.5))
check("P12b", P(125) * D(4.7) * P(80), D(4.7))
check("P12c", D(6.4) * P(45) + D(6.4) * P(55), D(6.4))
x = (D(1.35) + D(0.25)) / P(20); check("P13a", x, 8)
x = (D(7.5) / D(1.5) + D(2.5)) * P(40); check("P13b", x, 3)
x = (D(4.2) - D(1.8)) / P(150); check("P14a", x, D(1.6))
x = (D(0.75) * 21 - D(0.75)) * P(25); check("P14b", x, D(3.75))
check("P15a", D(5.4) / (1 + P(35)), 4); check("P15b", 22 / (1 - P(12)), 25)
check("P16", 1 - P(30) - (P(30) + P(12)), P(28))
check("P17", 1 - P(45) - P(45) * F(2, 3), P(25))
k = F(50, 5); check("P18", (k, 4 * k, 4 * k * P(175)), (10, 40, 70))
part = F(16, 8); L, W = 5 * part, 3 * part; check("P19 W=60%L", W == L * P(60), True); check("P19", L * W, 60)
r = F(120, 3); check("P20", (r + 10, 2 * r + 20), (50, 100)); check("P20 sum", r + 10 + 2 * r + 20, 150)
a = 36 / P(80); b = 72 - a; check("P21", (a, b), (45, 27)); check("P21 eq", a - a * P(20), b + a * P(20))
A, B = 8, 4; check("P22 move A->B", A - 2 == B + 2, True); check("P22 move B->A", F(A + 1) / (B - 1), P(300))
g = 2 / P(10); check("P23", g + g * P(80), 36); check("P23 after", (g * P(80) + 2) / g, P(90))
check("P24", 1 - 2 * (P(18.5) + P(26.5)), P(10))
check("P25a", D(3.6) / (P(75) + F(1, 4)), D(3.6)); check("P25b", F(12) / (1 / P(20) - 1), 3)
check("P26", (P(45) + D(0.55)) * D(3.7) - P(75) * 4, D(0.7))
check("P27", P(60) * P(25), P(15))
s = D(2.7) / (1 + P(125)); check("P28", (s * P(125), s), (D(1.5), D(1.2)))
big = D(3.6) / (1 - P(40)); check("P29", (big * P(40), big), (D(2.4), 6))
left = (1 - P(35)) * (1 - P(40)); check("P30a", left, P(39)); check("P30b", D(7.8) / left, 20)

# Challenge
T = 45; bank, water = 9, 36; check("C31 start", F(bank, water), P(25)); check("C31 end", F(bank - 4, water + 4), P(12.5)); check("C31 sum", bank + water, T)
a, b = 30, 40; check("C32 now", F(a, b), P(75)); check("C32 later", F(a + 10, b + 10), P(80))
check("C33", P(120) * P(80), P(96))
check("C34", P(125) * P(80), 1)
p = F(108, 6); check("C35", (p, 2 * p, 3 * p), (18, 36, 54)); check("C35 rel", (p == 2 * p * P(50), 3 * p == 2 * p * P(150)), (True, True))
x = P(30) * D(1.7) / (1 - P(15)); check("C36", x, D(0.6))
check("C37", sum(P(i) for i in range(1, 100)), D(49.5))
check("C38", P(12.5) * D(0.25) * D(7.9) * 8 * P(400), D(7.9))
R = 20 / (F(3, 2) - F(2, 3)); check("C39", R, 24); check("C39 a", R / (R + R * F(2, 3)), P(60)); check("C39 b", R / (R + R * F(2, 3) + 20), P(40))
tank = 54 / (P(40) - (1 - P(40) - P(40) * P(75))); check("C40", tank, 540)
check("C41", 48 / P(50) / (1 - P(40)), 160)
check("C42", D(3.4) / (P(125) + F(1, 4) + D(0.5)), D(1.7))
c, m = 12, 48; check("C43 now", F(c, m), P(25)); check("C43 later", F(c + 6, m + 6), F(1, 3))
check("C44", 200 * P(5) / P(4) - 200, 50)
check("C45", 1 - 1 / P(125), P(20))
check("C46", 6 / (P(55) - P(45)), 60)
check("C47", 100 * P(8) / P(80), 10)
p = F(168, 7); check("C48", (3 * p, 4 * p), (72, 96)); check("C48 rel", 3 * p * P(40), 4 * p * P(30))
check("C49", 1 / (1 - P(25)) - 1, F(1, 3)); check("C49 pct", F(1, 3) * 100, F(100, 3))
cost = 14000 / ((1 - P(30)) * (1 - P(40)) - (1 - P(30)) * P(40)); check("C50", cost, 100000)
check("C50 parts", (cost * P(30), cost * P(70) * P(40), cost * P(70) * P(60)), (30000, 28000, 42000))

print("ALL OK" if ok else "MISMATCH")
sys.exit(0 if ok else 1)
