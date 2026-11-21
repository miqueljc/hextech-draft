# Hextech Draft

Assistent de draft de League of Legends per a l'equip. Funciona com una sola pàgina HTML, també sense connexió.

- **Mòbil (PWA):** https://miqueljc.github.io/hextech-draft/ (`index.html`)
- **Escriptori:** https://miqueljc.github.io/hextech-draft/pc.html (`pc.html`)

## Com està fet

`pc.html` i `index.html` **es generen**: no s'han d'editar a mà.

| Carpeta / fitxer | Què hi ha |
| --- | --- |
| `src/legacy/desk_v12pre.html` | Versió base de l'app (escriptori) |
| `src/blocks/block*.js` | Mòduls que s'hi afegeixen (motor, mode partida, builds, pla de partida...) |
| `src/data/*.json` | Còpia de les dades que l'app porta per funcionar sense connexió |
| `src/build_desktop.py`, `src/build_mobile.py` | Munten l'escriptori i, a partir d'ell, el mòbil |
| `data.json` | Dades compartides que l'app descarrega en obrir-se (pools, matchups, builds, rivals, historial...) |
| `tools/` | Eines per actualitzar `data.json` (vegeu `tools/README.md`) |
| `tests/` | Proves automàtiques |

## Treballar-hi

```bash
python3 build.py      # genera pc.html i index.html
npm install           # només la primera vegada (Playwright)
npx playwright install chromium
npm test              # totes les proves (~40 s)
```

Després de canviar l'app, cal pujar la versió de la memòria cau a `sw.js` (`hextech-draft-vNN`) perquè els mòbils agafin la nova.
