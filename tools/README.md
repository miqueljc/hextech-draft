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
