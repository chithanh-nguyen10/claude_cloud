#!/usr/bin/env python3
"""Answer checks for chapter 05 (Building with cubes, painting faces). Brute force where possible."""
import sys
from fractions import Fraction as F
from itertools import product

bad = 0
def check(tag, got, want):
    global bad
    ok = got == want
    print("%-8s %-40s %s" % (tag, repr(got), "ok" if ok else "MISMATCH (want %r)" % (want,)))
    if not ok:
        bad += 1

def box(a, b, c):
    return {(x, y, z) for x in range(a) for y in range(b) for z in range(c)}

def painted(cells, faces=("x0", "x1", "y0", "y1", "z0", "z1")):
    """count painted faces per cube: a cube face is painted if it lies on the bounding box face listed."""
    xs = [c[0] for c in cells]; ys = [c[1] for c in cells]; zs = [c[2] for c in cells]
    lim = {"x0": min(xs), "x1": max(xs), "y0": min(ys), "y1": max(ys), "z0": min(zs), "z1": max(zs)}
    res = {}
    for (x, y, z) in cells:
        k = 0
        for f in faces:
            v = {"x": x, "y": y, "z": z}[f[0]]
            if v == lim[f]:
                k += 1
        res[(x, y, z)] = k
    return res

def tally(cells, faces=("x0", "x1", "y0", "y1", "z0", "z1")):
    p = painted(cells, faces)
    t = [0] * 4
    for v in p.values():
        t[v] += 1
    return t  # t[k] = cubes with exactly k painted faces

def area(cells):
    s = 0
    for (x, y, z) in cells:
        for d in [(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]:
            if (x+d[0], y+d[1], z+d[2]) not in cells:
                s += 1
    return s

def hm(rows):
    D = len(rows); cells = set()
    for i, r in enumerate(rows):
        for x, h in enumerate(r):
            for z in range(h):
                cells.add((x, D-1-i, z))
    return cells

def isq(n):
    r = int(round(n ** 0.5)); assert r * r == n; return r
def icb(n):
    r = int(round(n ** (1/3))); assert r ** 3 == n; return r

# ---- Examples
L, W, H = 24, 12*2, 6*3
check("Ex1a", ((L+W)*2*H, (L+W)*2*H + 2*L*W), (1728, 2880))
check("Ex1b", (L*W*H, 24*12*6*6), (10368, 10368))
e = isq(864 // 6); check("Ex2", (e // 2) ** 3, 216); check("Ex2b", e**3 // 8, 216)
check("Ex3a", 12*8*5, 480); check("Ex3b", (12//3)*(8//3)*(5//3), 8)
t = tally(box(5,5,5)); check("Ex4", (125, t[3], t[2], t[1], t[0]), (125, 8, 36, 54, 27))
c = hm([[2,3,1],[1,2,1]]); check("Ex5", (len(c), [max(z for (x,y,z) in c if x==i)+1 for i in range(3)], 18-len(c)), (10, [2,3,1], 8))

# ---- Practice
check("P1", len(box(6,6,6)), 216)
check("P2", (12//3)**3, 64)
check("P3", (10//2)*(8//2)*(6//2), 60)
check("P4", (12//2)*(6//2)*(4//2), 36)
n = icb(64); check("P5", (4*n*n, 6*n*n, n**3), (64, 96, 64))
s = icb(27); n = icb(125); E = s*n; check("P6", (6*E*E, E**3), (1350, 3375))
e = isq(216 // 6); check("P7", e**3, 216)
e = isq(400 // 4); check("P8", (e//2)**3, 125)
l, w, h = 20, 10, 25; check("P9", ((l+w)*2*h, (l+w)*2*h+2*l*w, l*w*h), (1500, 1900, 5000))
a = 16 // 2; check("P10", ((a+a)*2*16, (a+a)*2*16 + 2*a*a), (512, 640))
a = 7; check("P11", area(box(3,1,1)) * a * a, 686)
check("P12", 6*4*3, 72)
check("P13", (50//10)*(35//10)*(22//10), 30)
k = (9//3)*(6//3)*(4//3); check("P14", (k, 9*6*4 - k*27), (6, 54))
t = tally(box(3,3,3)); check("P15", (t[3], t[2], t[1], t[0]), (8, 12, 6, 1))
t = tally(box(6,6,6)); check("P16", (t[2], t[1]), (48, 96))
t = tally(box(7,7,7)); check("P17", t[0], 125)
t = tally(box(10,10,10)); check("P18", t[2] + t[3], 104)
t = tally(box(5,4,3)); check("P19", (t[3], t[2], t[1], t[0]), (8, 24, 22, 6))
t = tally(box(7,5,3)); check("P20", (t[2], t[1], t[0]), (36, 46, 15))
n = [m for m in range(3, 30) if (m-2)**3 == 64][0]; t = tally(box(n,n,n)); check("P21", (n**3, t[1]), (216, 96))
n = [m for m in range(3, 30) if 6*(m-2)**2 == 150][0]; check("P22", n**3, 343)
n = [m for m in range(3, 30) if 12*(m-2) == 84][0]; check("P23", n**3, 729)
c = box(5,5,4); check("P24", (len(c), area(c)), (100, 130))
c = box(4,4,4) - {(3,3,3)}; check("P25", area(c), 96)
check("P26", len(hm([[1,2,3],[1,2,3]])), 12)
c = hm([[3,1,2],[2,2,1]]); check("P27", (len(c), [max(z for (x,y,z) in c if x==i)+1 for i in range(3)]), (11, [3,2,2]))
c = box(3,2,2) | {(x,1,2) for x in range(3)}; check("P28", (len(c), 27-len(c)), (15, 12))
n = icb(64); E = 2*n; check("P29", (6*E*E, E**3), (384, 512))
t = tally(box(6,4,3)); check("P30", (72, t[0], t[1]), (sum(t), 8, 28))

# ---- Challenge
n = [m for m in range(3, 30) if tally(box(m,m,m))[1] == tally(box(m,m,m))[2]][0]; check("P31", n**3, 64)
n = [m for m in range(3, 12) if tally(box(m,m,m))[0] == tally(box(m,m,m))[1]][0]; check("P32", n**3, 512)
check("P33", F(area(box(4,4,4)), 64*6), F(1, 4))
t = tally(box(5,5,5), ("x0","x1","y0","y1")); check("P34", (t[2], t[1], t[0]), (20, 60, 45))
c = box(6,6,6)
both = sum(1 for (x,y,z) in c if z in (0,5) and (x in (0,5) or y in (0,5)))
check("P35", both, 40)
n = icb(343); c = box(n, n, n-1); check("P36", area(c) * 4, 1064)
c = box(5,5,5) - {(2,y,2) for y in range(5)}; check("P37", (len(c), area(c)), (120, 168))
from math import gcd
g = gcd(gcd(20,12),8); check("P38", (20//g)*(12//g)*(8//g), 30)
g = gcd(gcd(6,4),2); check("P39", (6*4*2, (6//g)*(4//g)*(2//g)), (48, 6))
check("P40", (area(box(10,1,1)), [m for m in range(1,100) if area(box(m,1,1)) == 82][0]), (42, 20))
c = hm([[1,2,3,4]]); check("P41", (len(c), area(c)), (10, 36))
c = hm([[3,2,1],[2,2,1],[1,1,1]]); check("P42", (len(c), 27-len(c)), (14, 13))
check("P43", (area(box(6,6,6)), 216*6 - area(box(6,6,6))), (216, 1080))
h = [m for m in range(3, 20) if tally(box(6,5,m))[0] == 24][0]; check("P44", (h, tally(box(6,5,h))[1]), (4, 52))
from math import lcm
E = lcm(12, 8, 6); check("P45", (E//12)*(E//8)*(E//6), 24)
n = [m for m in range(3, 20) if m**3 - (m-2)**3 == 98][0]; check("P46", n, 5)
c = box(4,4,4) - {(x,y,z) for x in (0,3) for y in (0,3) for z in (0,3)}; check("P47", (len(c), area(c)), (56, 96))
t = tally(box(8,6,4), ("x0","x1","y0","y1","z1")); check("P48", t[1], 84)
check("P49", sum((3-k+1)**3 for k in (1,2,3)), 36)
# P50: enumerate heights 1..3 on 3x2 base matching front view [3,1,2] and right view front=2, back=3
sols = []
for hs in product(range(1, 4), repeat=6):
    g = [hs[0:3], hs[3:6]]  # g[0]=front row, g[1]=back row
    if [max(g[0][i], g[1][i]) for i in range(3)] == [3,1,2] and (max(g[0]), max(g[1])) == (2, 3):
        sols.append(sum(hs))
check("P50", (max(sols), min(sols)), (11, 9))

print("FAILED: %d" % bad if bad else "ALL OK")
sys.exit(1 if bad else 0)
