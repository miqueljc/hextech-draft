"""Munta pc.html: plantilla HTML + mòduls de src/app (en l'ordre de modules.txt) + dades de reserva de src/data."""
import os
APP = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(APP)
ROOT = os.path.dirname(SRC)


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def data_block():
    d = os.path.join(SRC, 'data')
    return ('const OP_PICKS_DEFAULT = ' + read(os.path.join(d, 'op2623.json')).strip() + ';\n'
            'const DD_CAT_DEFAULT = ' + read(os.path.join(d, 'ddcat.json')).strip() + ';\n'
            'const MATCHUPS_DEFAULT = ' + read(os.path.join(d, 'matchups.json')) + ';\n'
            'const DUOWR_DEFAULT = ' + read(os.path.join(d, 'duowr.json')) + ';\n'
            'const ROLE_RATES_DEFAULT = ' + read(os.path.join(d, 'rolerates.json')) + ';\n')


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
    build()
