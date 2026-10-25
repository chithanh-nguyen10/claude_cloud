#!/usr/bin/env python3
"""Answer checks for chapter 02 (Percentage Word Problems)."""
import sys
from fractions import Fraction as F

P = lambda x: F(str(x)) / 100          # percentage -> number
D = lambda x: F(str(x))                # decimal -> exact
ok = True


def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (expected {want})")


pct = lambda a, b: F(a) / F(b) * 100   # percentage of a compared with b (as number of %)

# Examples
check("Ex1a", pct(D(0.6), D(2.4)), 25); check("Ex1b", pct(7, 4), 175)
check("Ex2 boys", pct(18, 40), 45); check("Ex2 girls", pct(22, 40), 55)
check("Ex3", 240 * P(35), 84)
check("Ex4", pct(290, 250), 116)
check("Ex5", 180000 * (1 - P(15)), 153000)

# Practice
for (a, b), w in [((18, 24), 75), ((D(4.5), D(12.5)), 36), ((D(0.9), D(3.6)), 25), ((27, 15), 180), ((D(3.4), 8), D(42.5)), ((F(1, 4), 5), 5)]:
    check(f"P1 {a}/{b}", pct(a, b), w)
for (p, m), w in [((15, 60), 9), ((8, 450), 36), ((25, D(7.2)), D(1.8)), ((40, D(3.5)), D(1.4)), ((120, 85), 102), ((12.5, 96), 12)]:
    check(f"P2 {p}% of {m}", m * P(p), w)
check("P3a", pct(30, 48), D(62.5)); check("P3b", pct(18, 30), 60)
check("P4", pct(34, 40), 85)
check("P5", pct(460, 400), 115)
check("P6", pct(1000, 1250), 80)
check("P7", pct(D(2.7), 12), D(22.5))
check("P8", 38 * (1 + P(10)), D(41.8))
check("P9", 50 * (50 * P(60)) * (1 - P(45) - P(35)), 300)
check("P10", 1200 * (1 - P(35)), 780)
check("P11", 640 - 640 * P(55), 288)
check("P12", pct(30000, 150000), 20)
check("P13", 60000 * (1 - P(10)), 54000)
check("P14", (20000000 * P(0.6), 20000000 * (1 + P(0.6))), (120000, 20120000))
check("P15", 40 * P(3.5), D(1.4))
check("P16", pct(1000, 8000), D(12.5))
check("P17", pct(50000, 250000), 20)
check("P18", (pct(16, 25), pct(4, 25), pct(5, 25)), (64, 16, 20))
check("P19", 240 * (1 - P(30) - P(45)), 60)
check("P20", pct(432, 450), 96)
check("P21", 500 - 500 * P(92), 40)
check("P22", 35 - 35 * P(40), 21)
pears = 80 * P(40); check("P23", pct(80 - pears, pears), 150)
check("P24", (pct(32, 40), pct(27, 30)), (80, 90))
check("P25", 2400 * P(115), 2760)
check("P26", 2 * 40000 + 3 * 40000 * (1 - P(25)), 170000)
check("P27", (30 * 16, pct(30 * 16 - 400, 400)), (480, 20)); check("P27 L", 25 * P(120), 30)
check("P28", 3000 * P(4), 120)
check("P29", 240 * (1 - P(35) - P(40)), 60)
m = 1500000 * (1 - P(40)); check("P30", m * (1 - P(30)), 630000)

# Challenge
check("C31", 18 / P(25), 72)
check("C32", 1380 / P(115), 1200)
check("C33", 240000 / P(120), 200000)
check("C34", 360000 / P(75), 480000)
check("C35", pct(P(20), 1 - P(20)), 25)
check("C36", pct(P(95) - P(80), P(80)), D(18.75))
check("C37", 10000000 * (1 + P(0.5)) ** 2, 10100250)
check("C38", 300 * P(6) / P(4) - 300, 150)
check("C39", pct(200 * P(10) + 300 * P(5), 500), 7)
boys = 6 / (F(3, 2) - 1); N = boys / P(40); check("C40", N, 30); check("C40 after", boys / (N - 6), P(50))
check("C41", 1 - 1 / P(125), P(20))
check("C42", (200000 * P(85), 180000 * P(95)), (170000, 171000))
cost = 240000 / P(120) + 240000 / P(80); check("C43", cost - 480000, 20000)
check("C44", P(80) * P(130) - 1, P(4))
check("C45", P(110) ** 2 - 1, P(21))
check("C46", 5000 * (1 + P(2)) ** 2, 5202)
tin = 500 * P(20); check("C47", tin / P(10) - 500, 500)
check("C48", pct(1, 5), 20)
check("C49", (8500000 - 6000000) / P(5), 50000000)
check("C50", P(60) * P(25) + P(40) * P(40), P(31))

print("ALL OK" if ok else "MISMATCH")
sys.exit(0 if ok else 1)
