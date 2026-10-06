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

/**
 * De lijst uit SpellingSpeurneus, elke ochtend opgehaald door scripts/haal-speurneus.mjs.
 * `goed` zijn de goedgekeurde woorden en namen, `fout` de namen die de redactie daar als verkeerd
 * gespeld heeft aangewezen. Allebei kleine letters. Ontbreekt het bestand, dan zijn ze leeg.
 * @returns {{goed: string[], fout: string[]}}
 */
export function leesSpeurneus(pad = join(wortel, 'regels', 'speurneus.json')) {
  if (!existsSync(pad)) return { goed: [], fout: [] };
  const d = JSON.parse(readFileSync(pad, 'utf8'));
  const klein = (l) => (l || []).map((w) => w.trim().toLowerCase()).filter(Boolean);
  return { goed: [...klein(d.woorden), ...klein(d.namen)], fout: klein(d.naam_is_spelfout) };
}

/**
 * @returns {string[]} de woorden uit regels/uitzonderingen.txt plus de goedgekeurde uit
 * SpellingSpeurneus, kleine letters. Wat SpellingSpeurneus als spelfout aanwijst, valt eruit.
 */
export function leesUitzonderingen(pad = join(wortel, 'regels', 'uitzonderingen.txt'),
  speurneus = leesSpeurneus()) {
  const eigen = existsSync(pad)
    ? readFileSync(pad, 'utf8').split('\n')
      .map((r) => r.trim().toLowerCase())
      .filter((r) => r && !r.startsWith('#'))
    : [];
  const fout = new Set(speurneus.fout);
  return [...new Set([...eigen, ...speurneus.goed])].filter((w) => !fout.has(w));
}

/** @returns {Set<string>|null} */
export function laadWoordenlijst(pad = join(wortel, 'docs', 'woordenlijst.txt.gz')) {
  if (!existsSync(pad)) return null;
  const woorden = gunzipSync(readFileSync(pad)).toString('utf8').split('\n');
  const set = new Set();
  for (const w of woorden) if (w) set.add(w);
  for (const w of leesUitzonderingen()) set.add(w);
  for (const w of leesSpeurneus().fout) set.delete(w);
  return set;
}

export default { laadWoordenlijst, leesUitzonderingen, leesSpeurneus };
