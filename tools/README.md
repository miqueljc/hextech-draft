# Eines de dades

## Fitxes de rivals (`hextech_rivals_v1`)

La app llegeix les fitxes de rivals de `data.json` i les ofereix al selector **📥 Rivals preparats** de la fitxa del rival (pestanya Draft → Scouting rival). Si una fitxa carregada té una versió més nova, la app l'actualitza sola en obrir-se amb connexió.

### Procediment (a partir dels nicknames)

1. Per a cada jugador `Nom#TAG` (regió per defecte `euw`), obrir
   `https://op.gg/lol/summoners/euw/<Nom>-<TAG>/champions` al navegador
   (els espais del nom es codifiquen com `%20`).
2. Executar `tools/opgg_extract.js` a la pàgina. Retorna `{ name, updated, champs: [...] }`.
3. Muntar `rival.json`:
   ```json
   { "id": "rivals-fc", "name": "Rivals FC", "source": "op.gg temporada 2026",
     "players": [ { "name": "Nom#TAG", "role": "Top", "champs": [ { "champ": "Poppy", "w": 25, "l": 18, "wr": 58 } ] } ] }
   ```
   `role` és opcional: si no es coneix, l'script l'estima amb els campions jugats.
4. `node tools/update_rivals.mjs rival.json --dry` per revisar, i després sense `--dry` per escriure `data.json`.
5. Publicar `data.json` (commit + push). La app el carrega en obrir-se amb connexió.

### Notes

- Es guarden els 12 campions amb més partides (mínim 2) per jugador.
- Els noms de campió es normalitzen amb `tools/champions.json` (noms de l'app + àlies com `Dr. Mundo`).
- Tornar a executar l'script amb el mateix `id` substitueix la fitxa anterior.

## Builds reals i OP picks del parc (`hextech_builds_v1`, `hextech_oppicks_v1`)

La pestanya d'anàlisi agafa la base de cada build (runes, fragments, summoners, inici, botes i 3 objectes core) de `hextech_builds_v1`; si no hi ha connexió, fa servir la còpia que porta l'app.

1. Per a cada campió i rol, obrir `https://op.gg/lol/champions/<campió>/build/<rol>` (rols: `top`, `jungle`, `mid`, `adc`, `support`) i apuntar la build més jugada.
2. Muntar `builds.json` (format detallat a la capçalera de `tools/update_builds.mjs`).
3. `node tools/update_builds.mjs builds.json --dry` per validar (comprova que les runes existeixen i són de files compatibles) i després sense `--dry`.
4. Per als OP picks: `node tools/update_builds.mjs --oppicks op.json` amb `{ "patch": "26.24", "source": "Skill Capped", "roles": { "Top": [...], ... } }`.

## Matchups d'un parc nou (`hextech_matchups_v1`)

1. Per a cada campió, obrir `https://metabot.gg/en/league/champion/<campió>/counters` i comprovar que mostra el parc nou.
2. Desar a una carpeta un fitxer `<Campió>.txt` amb el winrate **del campió** contra cada rival: `Dr. Mundo 38.5% 122, Renekton 40.8% 76, ...`
3. `node tools/merge_matchups.mjs carpeta --dry` i després sense `--dry`. Les dades noves pesen 1 i les antigues 0,5.

## Historial compartit (`hextech_history_v1`)

Cada dispositiu desa els seus drafts amb resultat. Per compartir-los amb tot l'equip:

1. A l'app: pestanya Dades → «📋 Copia l'historial» i enganxar-ho en un fitxer `historial.json`.
2. `node tools/update_history.mjs historial.json` (fusiona sense duplicats; es poden passar diversos fitxers).

El motor fa servir l'historial compartit + el local per valorar cada jugador amb cada campió i les parelles de campions que heu jugat juntes.
