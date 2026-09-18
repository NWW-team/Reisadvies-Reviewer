/**
 * Laadt de OpenTaal-woordenlijst plus onze eigen uitzonderingen als één Set met kleine letters.
 *
 * Alleen voor Node: de gepubliceerde pagina haalt hetzelfde bestand zelf op met fetch en pakt het
 * uit met DecompressionStream. Eén bestand dus, docs/woordenlijst.txt.gz, voor allebei.
 *
 * Ontbreekt het bestand, dan geeft dit null terug in plaats van te struikelen. De spellingtoets
 * vuurt dan niet en de rest van de tool werkt gewoon door — draai scripts/haal-woordenlijst.mjs
 * om hem op te halen.
 */
import { readFileSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');

/** @returns {string[]} de woorden uit regels/uitzonderingen.txt, kleine letters */
export function leesUitzonderingen(pad = join(wortel, 'regels', 'uitzonderingen.txt')) {
  if (!existsSync(pad)) return [];
  return readFileSync(pad, 'utf8').split('\n')
    .map((r) => r.trim().toLowerCase())
    .filter((r) => r && !r.startsWith('#'));
}

/** @returns {Set<string>|null} */
export function laadWoordenlijst(pad = join(wortel, 'docs', 'woordenlijst.txt.gz')) {
  if (!existsSync(pad)) return null;
  const woorden = gunzipSync(readFileSync(pad)).toString('utf8').split('\n');
  const set = new Set();
  for (const w of woorden) if (w) set.add(w);
  for (const w of leesUitzonderingen()) set.add(w);
  return set;
}

export default { laadWoordenlijst, leesUitzonderingen };
