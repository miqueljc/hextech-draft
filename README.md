# Hextech Draft

Assistent de draft de League of Legends per a l'equip. Funciona com una sola pàgina HTML, també sense connexió.

- **Mòbil (PWA):** https://miqueljc.github.io/hextech-draft/ (`index.html`)
- **Escriptori:** https://miqueljc.github.io/hextech-draft/pc.html (`pc.html`)

## Com està fet

`pc.html` i `index.html` **es generen**: no s'han d'editar a mà.

| Carpeta / fitxer | Què hi ha |
| --- | --- |
| `src/app/template.html` | HTML i estils de l'escriptori |
| `src/app/modules.txt` | Ordre de càrrega dels mòduls JS |
| `src/app/data/` | Dades de l'app: roster i pools, etiquetes dels campions, context del parc, dades compartides |
| `src/app/engine/` | Motor: rols i assignació, recomanació de picks i bans, predicció del rival, matchups, aprenentatge |
| `src/app/builds/` | Runes i objectes: plantilles, builds reals i personalització per a cada partida |
| `src/app/plan/` | Anàlisi del draft i pla de partida |
| `src/app/ui/` | Pantalles: tot el que toca l'HTML (render, filtres, mode partida, icones, estils, accions dels botons) |
| `src/mobile/` | Versió mòbil (es munta a partir de l'escriptori) |
| `src/data/*.json` | Còpia de les dades que l'app porta per funcionar sense connexió |
| `data.json` | Dades compartides que l'app descarrega en obrir-se (pools, matchups, builds, rivals, historial...) |
| `tools/` | Eines per actualitzar `data.json` (vegeu `tools/README.md`) |
| `tests/` | Proves automàtiques (inclosa la de referència, `tests/golden`) |

El motor (`data/`, `engine/`, `builds/`, `plan/`) no toca la pantalla: es pot carregar sol en Node (`tests/engine/harness.js`). Cada funció es defineix una sola vegada. Les funcions es poden moure entre mòduls; el codi de primer nivell (variables, estils injectats, crides d'inici) depèn de l'ordre de `modules.txt`.

## Treballar-hi

```bash
python3 build.py      # genera pc.html i index.html
npm install           # només la primera vegada (Playwright)
npx playwright install chromium
npm run test:engine   # proves del motor en Node, sense navegador (~45 s)
npm test              # totes les proves (~4 min, la de referència juga 210 drafts)
```

A cada `git push`, GitHub executa les proves (`.github/workflows/test.yml`): primer comprova que `pc.html` i `index.html` estan muntats amb el codi actual i passa les proves del motor; després, les de pantalla amb Chromium.

Després de canviar l'app, cal pujar la versió de la memòria cau a `sw.js` (`hextech-draft-vNN`) perquè els mòbils agafin la nova.
