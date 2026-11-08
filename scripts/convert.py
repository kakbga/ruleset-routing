from pathlib import Path
from urllib.request import Request, urlopen
import re
import json


ROOT = Path(__file__).resolve().parents[1]
# Remove a name from NAMES to stop syncing it and remove its generated files.
NAMES = [
    'Lan', 'Direct', 'Advertising', 'Privacy', 'OpenAI', 'Claude', 'Gemini',
    'TikTok', 'Google', 'SteamCN', 'Telegram', 'GlobalMedia', 'BiliBili',
    'Proxy', 'Apple', 'China', 'WeChat',
]
PRESERVED_NAMES = {'AI', 'applications'}
MANIFEST = ROOT / 'scripts/.managed-rules.json'
BASE = 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/{client}/{name}/{name}.list'


def fetch(client, name):
    req = Request(BASE.format(client=client, name=name), headers={'User-Agent': 'ruleset-routing'})
    with urlopen(req, timeout=40) as response:
        return response.read().decode('utf-8-sig')


def clean(text):
    out, seen = [], set()
    for line in text.splitlines():
        rule = line.strip()
        if not rule or rule.startswith('#'):
            continue
        rule = re.sub(r',\s*(no-resolve|extended-matching)\s*$', '', rule, flags=re.I)
        key = rule.casefold()
        if key not in seen:
            seen.add(key)
            out.append(rule)
    return out


def main():
    clash_dir = ROOT / 'clash-verge-rev/ruleset'
    qx_dir = ROOT / 'quantumultx/ruleset'
    clash_dir.mkdir(parents=True, exist_ok=True)
    qx_dir.mkdir(parents=True, exist_ok=True)

    # Download and validate all selected sources before deleting or replacing files.
    previous_names = set()
    if MANIFEST.exists():
        previous_names = set(json.loads(MANIFEST.read_text(encoding='utf-8')))

    generated = {}
    for name in NAMES:
        clash = clean(fetch('Clash', name))
        qx = clean(fetch('QuantumultX', name))
        if not clash or not qx:
            raise RuntimeError(f'Empty source for {name}; no cleanup performed')
        generated[(name, 'yaml')] = 'payload:\n' + ''.join(f'  - {rule}\n' for rule in clash)
        generated[(name, 'list')] = '\n'.join(qx) + '\n'
        print(f'{name}: Clash {len(clash)}, QuantumultX {len(qx)}')

    for (name, extension), content in generated.items():
        directory = clash_dir if extension == 'yaml' else qx_dir
        (directory / f'{name}.{extension}').write_text(content, encoding='utf-8')

    # Clean only files recorded by the previous successful run. Preserve user files.
    removed = previous_names - set(NAMES)
    for name in sorted(removed - PRESERVED_NAMES):
        if not re.fullmatch(r'[A-Za-z0-9_-]+', name):
            continue
        for path in (clash_dir / f'{name}.yaml', qx_dir / f'{name}.list'):
            if path.is_file():
                path.unlink()
                print(f'Removed obsolete generated file: {path.relative_to(ROOT)}')

    MANIFEST.write_text(json.dumps(sorted(set(NAMES)), indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
