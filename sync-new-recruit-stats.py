#!/usr/bin/env python3
"""Generate pinned model characteristics from an HH3 BSData checkout (no network).
Usage: python3 scripts/sync-new-recruit-stats.py /path/to/horus-heresy-3rd-edition
The reviewed ID map is authoritative; fuzzy matching is deliberately not used.
"""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
mapping = json.loads((ROOT / 'scripts/new-recruit-unit-map.json').read_text())
profiles, nodes, parents, files = {}, {}, {}, {}

def walk(value, filename, lineage=()):
    if isinstance(value, list):
        for item in value:
            walk(item, filename, lineage)
    elif isinstance(value, dict):
        if 'id' in value:
            nodes[value['id']] = value
        if 'characteristics' in value:
            chars = {c['name']: c.get('$text', '') for c in value['characteristics']}
            if 'BS' in chars:
                profiles[value['id']] = {'id': value['id'], 'name': value['name'], 'file': filename, 'characteristics': chars}
                parents[value['id']] = lineage
        if value.get('type') in ('unit', 'model'):
            lineage += (value,)
        for item in value.values():
            if isinstance(item, (dict, list)):
                walk(item, filename, lineage)

for file in sorted(source.glob('*.json')):
    data = json.loads(file.read_text())
    cat = next(iter(data.values()))
    files[file.name] = {'revision': cat.get('revision'), 'sha256': hashlib.sha256(file.read_bytes()).hexdigest()}
    walk(data, file.name)

def rule_names(node, seen=None):
    seen = set() if seen is None else seen
    if node.get('id') in seen:
        return []
    seen.add(node.get('id'))
    names = [r['name'] for r in node.get('rules', [])]
    for link in node.get('infoLinks', []):
        target = nodes.get(link.get('targetId'), {})
        name = target.get('name', link.get('name', ''))
        conditional = False
        for mod in link.get('modifiers', []):
            if mod.get('conditions') or mod.get('conditionGroups'):
                conditional = True
            elif mod.get('field') == 'name' and mod.get('type') == 'set':
                name = mod['value']
        if not conditional and not link.get('hidden'):
            names.append(name)
    # Only compulsory equipment, never optional upgrades or Prime benefits.
    for link in node.get('entryLinks', []):
        if any(c.get('type') == 'min' and c.get('value', 0) > 0 for c in link.get('constraints', [])):
            names += rule_names(nodes.get(link.get('targetId'), {}), seen)
    return names

def numeric(s):
    if s in ('-', '', 'N/A'):
        return 0
    if re.fullmatch(r'\d+', str(s)):
        return int(s)
    raise ValueError('Non-numeric characteristic: ' + str(s))

def convert(profile):
    c = profile['characteristics']
    stats = {}
    for src, dst in {'M':'move','WS':'ws','BS':'bs','S':'s','T':'t','W':'w','I':'i','A':'a','LD':'ld','CL':'cl','WP':'wp','IN':'int','HP':'hp','Front Armour':'avF','Side Armour':'avS','Rear Armour':'avR','Armour':'armour','Primary':'primaryArmour','Exposed':'exposedArmour','Transport Capacity':'transportCapacity','Transport':'transportCapacity'}.items():
        if src in c:
            stats[dst] = numeric(c[src])
    for src, dst in [('SAV','sv'),('INV','inv')]:
        stats[dst] = c.get(src, '-').replace('+', '').strip() or '-'
    stats['modelType'] = c.get('Type', '')
    stats['isVehicle'] = 'HP' in c
    stats['isFlyer'] = 'Flyer' in c.get('Type', '')
    if stats['isVehicle']:
        stats.setdefault('move', 0)
        # Existing resolver aliases; source-specific armour is retained above.
        stats['avF'] = stats.get('avF', stats.get('armour', stats.get('primaryArmour', 0)))
        stats['avS'] = stats.get('avS', stats['avF'])
        stats['avR'] = stats.get('avR', stats.get('exposedArmour', stats['avF']))
        stats['t'], stats['w'] = stats['avF'], stats['hp']
    rules = []
    for parent in parents[profile['id']]:
        rules += rule_names(parent)
    stats['fnp'] = '-'
    for name in rules:
        match = re.search(r'Feel No Pain\s*\((\d)\+?\)', str(name), re.I)
        if match:
            stats['fnp'] = match[1]
    return stats

units = {}
used_profiles = {}
for uid, match in mapping.items():
    profile = profiles[match['profileId']]
    assert profile['file'] == match['file'] and profile['name'] == match['profileName'], uid
    lineage = parents[profile['id']]
    unit = next((p for p in lineage if p.get('type') == 'unit'), None)
    variants = [p for p in profiles.values() if p['file'] == profile['file'] and unit and any(n['id'] == unit['id'] for n in parents[p['id']])]
    for p in variants or [profile]:
        used_profiles[p['id']] = dict(p, stats=convert(p))
    units[uid] = {'profileId': profile['id'], 'variantIds': [p['id'] for p in variants or [profile]]}

commit = subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'], text=True).strip()
snapshot = {'source':'https://github.com/BSData/horus-heresy-3rd-edition', 'commit':commit, 'files':files, 'units':units, 'profiles':used_profiles}
(ROOT / 'docs/new-recruit-stats-reference.json').write_text(json.dumps(snapshot, indent=2, ensure_ascii=False)+'\n')
# One record per line keeps generated output reviewable and reasonably compact.
records = {uid:dict(used_profiles[u['profileId']]['stats'], sourceProfileId=u['profileId'], modelProfiles=[used_profiles[p] for p in u['variantIds']]) for uid,u in units.items()}
output = '// Generated by scripts/sync-new-recruit-stats.py. Do not edit.\n'
output += '// HH3 catalogue commit: '+commit+'\nvar NEW_RECRUIT_UNIT_STATS = {\n'
output += ',\n'.join('  '+json.dumps(k)+': '+json.dumps(v,ensure_ascii=False,separators=(',',':')) for k,v in records.items())
output += '\n};\n'
(ROOT / '27-new-recruit-stats-data.js').write_text(output)
print(f'Generated {len(units)} unit mappings and {len(used_profiles)} distinct model profiles at {commit}.')
melee_map = json.loads((ROOT / 'scripts/new-recruit-melee-map.json').read_text())
melee = {}
for label, candidates in melee_map.items():
    candidate = candidates[0]
    node = nodes[candidate['id']]
    chars = {c['name']: c.get('$text', '') for c in node['characteristics']}
    melee[label] = dict(chars, sourceProfileId=candidate['id'])
# The desecrated hammer is a distinct weapon, despite the old shared label.
for node in nodes.values():
    if node.get('name') == 'Forgebreaker Desecrated' and 'characteristics' in node:
        melee['perturabo:Forgebreaker'] = dict({c['name']: c.get('$text', '') for c in node['characteristics']}, sourceProfileId=node['id'])
with (ROOT / '27-new-recruit-stats-data.js').open('a') as out:
    out.write('\nvar NEW_RECRUIT_MELEE_STATS = '+json.dumps(melee,indent=2,ensure_ascii=False)+';\n')
snapshot['melee'] = melee
(ROOT / 'docs/new-recruit-stats-reference.json').write_text(json.dumps(snapshot, indent=2, ensure_ascii=False)+'\n')
