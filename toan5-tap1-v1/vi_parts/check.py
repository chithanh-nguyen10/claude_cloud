#!/usr/bin/env python3
r"""Check a Vietnamese translation part against its English source.
Usage: python3 check.py N      (compares pN_en.tex with pN_vi.tex)
Checks: every math segment ($...$, \[...\]) and every LaTeX command sequence is preserved,
up to decimal separator (2.5 -> 2{,}5) . Prints differences; exit 1 on any."""
import re,sys,os
d=os.path.dirname(os.path.abspath(__file__)); n=sys.argv[1]
en=open(f'{d}/p{n}_en.tex',encoding='utf8').read(); vi=open(f'{d}/p{n}_vi.tex',encoding='utf8').read()
def math(s):
    s=re.sub(r'(?<!\\)%.*','',s)
    segs=re.findall(r'\$\$.*?\$\$|\$[^$]*\$|\\\[.*?\\\]',s,re.S)
    out=[]
    for m in segs:
        m=re.sub(r'\\text\{(?:[^{}]|\{[^{}]*\})*\}','T',m)          # words inside math may be translated
        m=re.sub(r'\\(?:mbox|textbf|emph|textit)\{[^{}]*\}','T',m)
        m=m.replace('{,}','.').replace(';',',')   # VI lists use ';' (decimal comma)
        m=re.sub(r'\s+','',m)
        out.append(m)
    return out
def nums(s):
    s=re.sub(r'(?<!\\)%.*','',s).replace('{,}','.')
    s=re.sub(r'(\d),(\d)',r'\1.\2',s)
    return re.findall(r'\d+(?:\.\d+)?',s)
def envs(s): return re.findall(r'\\(?:begin|end)\{[a-zA-Z0-9*]+\}|\\(?:probsol|dapso|guide|shead|chapterhead|gap|pa|probbox|dividerbar\w*)\b',s)
bad=0
for name,f in (('math',math),('numbers',nums),('structure',envs)):
    a,b=f(en),f(vi)
    if a!=b:
        bad+=1
        import difflib
        print(f'== {name} differs ({len(a)} vs {len(b)}):')
        for l in list(difflib.unified_diff(a,b,'en','vi',n=1,lineterm=''))[:40]: print('  ',l)
# leftover English words heuristic
eng=re.findall(r'\b(?:the|and|of|is|are|how many|answer|Find|Solution|Problem)\b',re.sub(r'\$[^$]*\$','',vi))
if len(eng)>5: print(f'warning: {len(eng)} English-looking words remain, e.g. {eng[:8]}')
print('OK' if not bad else f'{bad} check(s) failed'); sys.exit(1 if bad else 0)
