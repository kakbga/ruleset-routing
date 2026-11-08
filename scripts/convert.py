from pathlib import Path
from urllib.request import Request, urlopen
import re
import json


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'scripts/.managed-rules.json'
# Blackmatrix7 sets are downloaded for both Clash and Quantumult X.
BLACKMATRIX7_BASE = 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/{client}/{name}/{name}.list'
BLACKMATRIX7_NAMES = ['Lan', 'Direct', 'Advertising', 'Privacy', 'OpenAI', 'Claude', 'Gemini', 'TikTok', 'Google', 'SteamCN', 'Telegram', 'GlobalMedia', 'BiliBili', 'Proxy', 'Apple', 'China', 'WeChat',]
# Loyalsoldier text rules. Each name produces {name}.yaml in the Clash ruleset folder.
LOYALSOLDIER_BASE = 'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/{name}.txt'
LOYALSOLDIER_NAMES = ['applications','cncidr',]


def fetch_url(url):
    req = Request(url, headers={'User-Agent': 'ruleset-routing'})
    with urlopen(req, timeout=40) as response:
        return response.read().decode('utf-8-sig')


def fetch(client, name):
    return fetch_url(BLACKMATRIX7_BASE.format(client=client, name=name))


def clean(text):
    out, seen = [], set()
    for line in text.splitlines():
        rule = line.strip()
        if not rule or rule.startswith('#') or rule == 'payload:':
            continue
        if rule.startswith('- '):
            rule = rule[2:].strip()
        if len(rule) >= 2 and rule[0] == rule[-1] and rule[0] in "'\"":
            rule = rule[1:-1]
        if not rule:
            continue
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

    # Prevent two upstream sources from writing the same output filename.
    name_overlap = set(BLACKMATRIX7_NAMES) & set(LOYALSOLDIER_NAMES)
    if name_overlap:
        raise ValueError(f'Rule names overlap between sources: {sorted(name_overlap)}')

    # Download and validate all selected sources before deleting or replacing files.
    previous_files = []
    custom_files = []
    if MANIFEST.exists():
        previous_manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
        expected_categories = {'Blackmatrix7', 'Loyalsoldier', 'CustomSource'}
        if (
            not isinstance(previous_manifest, dict)
            or set(previous_manifest) != expected_categories
            or not all(
                isinstance(paths, list) and all(isinstance(path, str) for path in paths)
                for paths in previous_manifest.values()
            )
        ):
            raise ValueError(f'Invalid managed-rules manifest: {MANIFEST}')
        custom_files = previous_manifest['CustomSource']
        previous_files = [
            path
            for category in ('Blackmatrix7', 'Loyalsoldier')
            for path in previous_manifest[category]
        ]

    generated = {}
    for name in BLACKMATRIX7_NAMES:
        clash = clean(fetch('Clash', name))
        qx = clean(fetch('QuantumultX', name))
        if not clash or not qx:
            raise RuntimeError(f'Empty source for {name}; no cleanup performed')
        generated[(name, 'yaml')] = 'payload:\n' + ''.join(f'  - {rule}\n' for rule in clash)
        generated[(name, 'list')] = '\n'.join(qx) + '\n'
        print(f'{name}: Clash {len(clash)}, QuantumultX {len(qx)}')

    for name in LOYALSOLDIER_NAMES:
        url = LOYALSOLDIER_BASE.format(name=name)
        source_rules = clean(fetch_url(url))
        if not source_rules:
            raise RuntimeError(f'Empty Loyalsoldier source for {name}; no cleanup performed')
        generated[(name, 'yaml')] = 'payload:\n' + ''.join(
            f'  - {rule}\n' for rule in source_rules
        )
        print(f'{name}: Loyalsoldier {len(source_rules)}')

    current_manifest = {
        'Blackmatrix7': [],
        'Loyalsoldier': [],
        'CustomSource': custom_files,
    }
    for (name, extension), content in generated.items():
        directory = clash_dir if extension == 'yaml' else qx_dir
        output = directory / f'{name}.{extension}'
        output.write_text(content, encoding='utf-8')
        category = 'Loyalsoldier' if name in LOYALSOLDIER_NAMES and extension == 'yaml' else 'Blackmatrix7'
        current_manifest[category].append(output.relative_to(ROOT).as_posix())

    current_files = [path for paths in current_manifest.values() for path in paths]

    # Clean only paths recorded by the previous run; custom files remain untouched.
    for relative_path in sorted(set(previous_files) - set(current_files)):
        path = (ROOT / relative_path).resolve()
        if ROOT.resolve() not in path.parents:
            raise ValueError(f'Unsafe path in managed-rules manifest: {relative_path}')
        if path.name.lower() in {'ai.yaml'}:
            continue
        if path.is_file():
            path.unlink()
            print(f'Removed obsolete generated file: {relative_path}')

    MANIFEST.write_text(json.dumps(current_manifest, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()

