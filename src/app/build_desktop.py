"""Munta pc.html: plantilla HTML + mòduls de src/app (en l'ordre de modules.txt) + dades de reserva.

Les dades de reserva (per quan no hi ha connexió) surten de data.json, que és l'única font: no n'hi ha cap còpia
al codi. Només el catàleg d'icones (src/data/ddcat.json) no és a data.json.
  python3 src/app/build_desktop.py               munta pc.html
  python3 src/app/build_desktop.py --data-block  escriu només el bloc de dades (el fa servir tests/engine/harness.js)
"""
import json
import os
import sys
APP = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(APP)
ROOT = os.path.dirname(SRC)


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


# constant del codi <- clau de data.json (i camp, si cal)
FROM_DATA_JSON = [
    ('OP_PICKS_DEFAULT', 'hextech_oppicks_v1', None),
    ('MATCHUPS_DEFAULT', 'hextech_matchups_v1', None),
    ('DUOWR_DEFAULT', 'hextech_duowr_v1', None),
    ('ROLE_RATES_DEFAULT', 'hextech_rolerates_v1', None),
    ('REAL_BUILDS_DEFAULT', 'hextech_builds_v1', 'builds'),
    ('REAL_BUILDS_PATCH_DEFAULT', 'hextech_builds_v1', 'patch'),
    ('REAL_BUILDS_SRC_DEFAULT', 'hextech_builds_v1', 'source'),
]


def data_block():
    data = json.loads(read(os.path.join(ROOT, 'data.json')))['data']
    out = 'const DD_CAT_DEFAULT = ' + read(os.path.join(SRC, 'data', 'ddcat.json')).strip() + ';\n'
    for const, key, field in FROM_DATA_JSON:
        v = data[key] if field is None else data[key][field]
        out += 'const %s = %s;\n' % (const, json.dumps(v, ensure_ascii=False, separators=(',', ':')))
    return out


def build():
    order = [l.strip() for l in read(os.path.join(APP, 'modules.txt')).splitlines() if l.strip() and not l.startswith('#')]
    js = ''.join(read(os.path.join(APP, f)) for f in order)
    assert js.count('/*@DATA@*/\n') == 1
    js = js.replace('/*@DATA@*/\n', data_block())
    tpl = read(os.path.join(APP, 'template.html'))
    assert tpl.count('/*@APP@*/') == 1
    html = tpl.replace('/*@APP@*/', js)
    with open(os.path.join(ROOT, 'pc.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    print('pc.html', len(html))


if __name__ == '__main__':
    if '--data-block' in sys.argv:
        sys.stdout.write(data_block())
    else:
        build()
