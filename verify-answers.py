from fractions import Fraction as F

ok = True
def check(name, got, want, tol=1e-9):
    global ok
    g = float(got); w = float(want)
    good = abs(g-w) <= tol*max(1,abs(w)) or abs(g-w) < 5e-2  # allow 1 d.p rounding display checks separately
    status = "OK " if good else "XX "
    if not good: ok=False
    print(f"{status}{name}: got {g:.6g}  want {w:.6g}")

print("="*60); print("CHAPTER 8"); print("="*60)
# Half-journey: whole = 2 * speed * time
def half(hm_min, spd): 
    t = F(hm_min,60); return 2*spd*t
for (name,mins,spd,want) in [
 ("WE1 3h22@30",202,30,202),("P1 4h44@15",284,15,142),
 ("P2 1h38@30",98,30,98),("P3 3h46@30",226,30,226),
 ("P4 2h20@36",140,36,168),
 ("P14 1h12@25",72,25,60),("P15 2h15@24",135,24,108)]:
    check(name, half(mins,spd), want)

# Units + average
def units(frac_covered_time_h, covered_num, covered_den, rem_km, rem_time_h):
    # covered fraction = num/den covered in given time; remaining (den-num)/den = rem_km in rem_time
    rem_units = covered_den - covered_num
    unit = F(rem_km, rem_units)
    whole = unit*covered_den
    total_t = F(frac_covered_time_h) + F(rem_time_h)
    avg = whole/total_t
    return whole, avg

for (name, ct, num, den, rem, rt, w_whole, w_avg) in [
 ("WE2 1h 1/8;840/4h", 1,1,8,840,4, 960,192),
 ("P5 4h 4/7;870/1h", 4,4,7,870,1, 2030,406),
 ("P6 3h 3/7;880/7h", 3,3,7,880,7, 1540,154),
 ("P7 3h 5/8;810/9h", 3,5,8,810,9, 2160,180),
 ("P8 3h 3/8;1040/5h",3,3,8,1040,5,1664,208),
 ("P9 3/5@40min;80/(4/3h)", F(40,60),3,5,80,F(4,3), 200,100),
 ("P17 2h 2/5;360/3h",2,2,5,360,3, 600,120),
 ("P18 1h 1/6;500/5h",1,1,6,500,5, 600,100),
 ("P20 2h 1/4;720/4h",2,1,4,720,4, 960,160),
]:
    whole, avg = units(ct,num,den,rem,rt)
    check(name+" whole", whole, w_whole); check(name+" avg", avg, w_avg)

# P10 City B: last 3/5 = 72 @60; first 2/5 @80
whole = F(72,3)*5; first = whole*F(2,5); tt = first/80 + F(72,1)/60
check("P10 first leg", first, 48); check("P10 total time", tt, 1.8)
# P11 0.6h 1/6 @30
unit = F(30)*F(6,10); whole=unit*6; check("P11 whole", whole, 108)
# P12 walk 30min @40 m/min = 3/5
covered = 40*30; unit=F(covered,3); whole=unit*5; check("P12 whole m", whole, 2000)
# P13 busA 1.2h @70 =1/4 ; busB 3h rest
unitA = F(70)*F(12,10); whole=unitA*4; tt=F(12,10)+3; avg=whole/tt
check("P13 whole", whole, 336); check("P13 avg", avg, 80)
# P16 0.5h 1/4 @48
unit=F(48)*F(1,2); whole=unit*4; check("P16 whole", whole, 96)
# P19 1.5h 3/8 @16
d=F(16)*F(3,2); unit=d/3; whole=unit*8; check("P19 whole", whole, 64)

print("="*60); print("CHAPTER 9"); print("="*60)
# Times with dot helper -> minutes
def hm(t): 
    h=int(t); m=round((t-h)*100); return h*60+m
def tod(mins): 
    mins%=24*60; return f"{mins//60:02d}.{mins%60:02d}"

# WE1 there-and-back 10.25->12.10 @96 ; return -16 ; depart return 13.15
go_t = (hm(12.10)-hm(10.25))/60  # hours
dist = 96*go_t
check("WE1 go dist", dist, 168)
ret_spd=96-16; ret_t=F(int(dist),ret_spd)
check("WE1 return time h", ret_t, 2.1)
arr = hm(13.15)+float(ret_t)*60
print("    WE1 arrive", tod(round(arr)), "(want 15.21)")
assert tod(round(arr))=="15.21"

# there-and-back practice
for (name, t0,t1,spd,dec,wt) in [
 ("A1 11.40->13.10@80 -5",11.40,13.10,80,5,1.6),
 ("A2 12.14->15.44@60 -10",12.14,15.44,60,10,4.2),
 ("A3 16.22->17.52@92 -23",16.22,17.52,92,23,2.0),
 ("A4 11.40->12.25@64 -4",11.40,12.25,64,4,0.8)]:
    gt=(hm(t1)-hm(t0))/60; d=spd*gt; rt=d/(spd-dec)
    check(name+" return h", rt, wt)

# partial leg: total Th@S avg; first dist@spd ; find remaining speed
for (name,T,S,fd,fs,wrem) in [
 ("B1 6h@90 f168@80",6,90,168,80,95.4),
 ("B2 4h@110 f126@84",4,110,126,84,125.6),
 ("B3 8h@100 f124@80",8,100,124,80,104.8),
 ("B4 5h@90 f168@80",5,90,168,80,97.2)]:
    tot=T*S; rem=tot-fd; rt=T-fd/fs; sp=rem/rt
    check(name+" rem speed(1dp)", round(sp,1), wrem)

# difference round trip: go Th@S (dist), return RTh -> diff
for (name,T,S,RT,wdiff) in [
 ("C1 6h@56 ret4h",6,56,4,28),
 ("C2 6h@32 ret8h",6,32,8,8),
 ("C3 5h@48 ret4h",5,48,4,12),
 ("C4 6h@40 ret5h",6,40,5,8)]:
    d=T*S; rs=d/RT; check(name+" diff", rs-S, wdiff)

# percentage+speed: 50% in Tmin@v (=half dist), rest same dist @v2 -> total min
for (name,Tm,v,v2,wtot) in [
 ("D1 33@20 r80",33,20,80,41.3),
 ("D2 9@40 r160",9,40,160,11.3),
 ("D3 10@36 r288",10,36,288,11.3),
 ("D4 51@40 r160",51,40,160,63.8)]:
    d=v*Tm/60; t2=d/v2*60; check(name+" total min(1dp)", round(Tm+t2,1), wtot)

# fraction + % change
# E1 dec: 5/9@80, remaining 4/9 @64 in 2.5h -> whole time
rem_d=64*2.5; whole=rem_d/F(4,9); first=whole*F(5,9); ft=first/80
check("E1 remaining dist", rem_d, 160); check("E1 whole dist", whole, 360)
check("E1 total time", ft+F(5,2), 5)
# E2 inc: 5/9@80, remaining 4/9 @96 in 2.5h -> whole time
rem_d=96*2.5; whole=rem_d/F(4,9); first=whole*F(5,9); ft=first/80
check("E2 whole dist", whole, 540); check("E2 total time", ft+F(5,2), 6.25)

# F1 6h@110 return @90
d=6*110; check("F1 return time", F(d,90), F(22,3))
# F2 van@60, car +1.5h later @75 arrive together
# 60*(t+1.5)=75t
t=F(60*3,2)/F(75-60)  # 90/15
check("F2 car time", t, 6)

print("="*60)
print("ALL OK" if ok else "SOME FAILED")
