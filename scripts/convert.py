from pathlib import Path
from urllib.request import Request, urlopen
import re

ROOT = Path(__file__).resolve().parents[1]
NAMES = ['Lan','Direct','Advertising','Privacy','OpenAI','Claude','Gemini','TikTok','Google','SteamCN','Telegram','GlobalMedia','BiliBili','Proxy','Apple','China','WeChat']
BASE = 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/{client}/{name}/{name}.list'


def fetch(client, name):
    req = Request(BASE.format(client=client, name=name), headers={'User-Agent':'ruleset-routing'})
    with urlopen(req, timeout=40) as r:
        return r.read().decode('utf-8-sig')


def clean(text):
    out, seen = [], set()
    for line in text.splitlines():
        s=line.strip()
        if not s or s.startswith('#'): continue
        s=re.sub(r',\s*(no-resolve|extended-matching)\s*$', '', s, flags=re.I)
        k=s.casefold()
        if k not in seen:
            seen.add(k); out.append(s)
    return out

for name in NAMES:
    clash=clean(fetch('Clash',name))
    if not clash: raise RuntimeError(f'Empty Clash source: {name}')
    (ROOT/'clash-verge-rev/ruleset'/f'{name}.yaml').write_text('payload:\n'+''.join(f'  - {x}\n' for x in clash),encoding='utf-8')
    qx=clean(fetch('QuantumultX',name))
    if not qx: raise RuntimeError(f'Empty QuantumultX source: {name}')
    (ROOT/'quantumultx/ruleset'/f'{name}.list').write_text('\n'.join(qx)+'\n',encoding='utf-8')
    print(f'{name}: Clash {len(clash)}, QuantumultX {len(qx)}')
