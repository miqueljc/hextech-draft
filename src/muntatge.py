"""Munta les dues versions de l'app a partir del mateix codi:

  pc.html     escriptori  = src/app/escriptori.html
  index.html  mòbil       = src/mobile/mobil.html

Totes dues comparteixen els estils (src/app/estils.css), les seccions HTML (src/app/html/) i els mòduls JS
(src/app/modules.txt, amb les línies @escriptori / @mobil només per a una de les dues). La plantilla de cada
versió diu on va cada peça amb {{nom}}.

Les dades de reserva (per quan no hi ha connexió) surten de data.json, que és l'única font: no n'hi ha cap còpia
al codi. Només el catàleg d'icones (src/data/ddcat.json) no és a data.json.

  python3 src/muntatge.py               munta pc.html i index.html
  python3 src/muntatge.py --data-block  escriu només el bloc de dades (el fa servir tests/engine/harness.js)
"""
import json
import os
import re
import sys

SRC = os.path.dirname(os.path.abspath(__file__))
APP = os.path.join(SRC, 'app')
MOBILE = os.path.join(SRC, 'mobile')
ROOT = os.path.dirname(SRC)

VERSIONS = {
    'escriptori': {
        'sortida': 'pc.html',
        'plantilla': os.path.join(APP, 'escriptori.html'),
        'boto_analitzar': '<button class="btn btn-primary" onclick="generateStrategy()">⚡ Analitzar Pla de Partida</button>',
    },
    'mobil': {
        'sortida': 'index.html',
        'plantilla': os.path.join(MOBILE, 'mobil.html'),
        'boto_analitzar': '<button class="btn btn-primary" onclick="switchTab(\'analysis\')">⚡ Analitzar draft</button>',
        'estils_mobil': os.path.join(MOBILE, 'estils-mobil.css'),
    },
}

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


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def data_block():
    data = json.loads(read(os.path.join(ROOT, 'data.json')))['data']
    out = 'const DD_CAT_DEFAULT = ' + read(os.path.join(SRC, 'data', 'ddcat.json')).strip() + ';\n'
    for const, key, field in FROM_DATA_JSON:
        v = data[key] if field is None else data[key][field]
        out += 'const %s = %s;\n' % (const, json.dumps(v, ensure_ascii=False, separators=(',', ':')))
    return out


def modules(version):
    """Mòduls de la versió, en ordre (camins relatius a src/app)."""
    out = []
    for line in read(os.path.join(APP, 'modules.txt')).splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if line.startswith('@'):
            only, line = line[1:].split(None, 1)
            assert only in VERSIONS, 'versió desconeguda a modules.txt: ' + only
            if only != version:
                continue
        out.append(line)
    return out


def fill(template, parts):
    """Substitueix cada {{nom}} de la plantilla (una sola passada: el contingut inserit no es torna a mirar)."""
    used = set()

    def rep(m):
        assert m.group(1) in parts, 'peça desconeguda: ' + m.group(1)
        used.add(m.group(1))
        return parts[m.group(1)]
    out = re.sub(r'\{\{(\w+)\}\}', rep, template)
    assert used == set(parts), 'peces sense lloc a la plantilla: %s' % (set(parts) - used)
    return out


def build(version):
    cfg = VERSIONS[version]
    js = ''.join(read(os.path.join(APP, f)) for f in modules(version))
    assert js.count('/*@DATA@*/\n') == 1
    js = js.replace('/*@DATA@*/\n', data_block())
    html_dir = os.path.join(APP, 'html')
    parts = {
        'estils': read(os.path.join(APP, 'estils.css')),
        'draft': fill(read(os.path.join(html_dir, 'draft.html')), {'boto_analitzar': cfg['boto_analitzar']}),
        'analisi': read(os.path.join(html_dir, 'analisi.html')),
        'pestanyes': read(os.path.join(html_dir, 'pestanyes.html')),
        'app': js,
    }
    if 'estils_mobil' in cfg:
        parts['estils_mobil'] = read(cfg['estils_mobil'])
    html = fill(read(cfg['plantilla']), parts)
    with open(os.path.join(ROOT, cfg['sortida']), 'w', encoding='utf-8') as f:
        f.write(html)
    print(cfg['sortida'], len(html))


if __name__ == '__main__':
    if '--data-block' in sys.argv:
        sys.stdout.write(data_block())
    else:
        for v in VERSIONS:
            build(v)
