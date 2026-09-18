import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { maakToetser } from '../src/regels.js';
import { parseAdvies } from '../src/parse.js';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const laad = (naam) => JSON.parse(readFileSync(join(wortel, 'regels', naam), 'utf8'));

export const regeldata = {
  matrix: laad('matrix.json'),
  kleurcodes: laad('kleurcodes.json'),
  woordenlijsten: laad('woordenlijsten.json'),
  limieten: laad('limieten.json'),
  sjabloon: laad('sjabloon.json'),
  groepen: laad('groepen.json'),
};

const toetser = maakToetser(regeldata);

/** Toetst een stuk HTML of tekst en geeft de regel-ids terug die afgingen. */
export function idsVan(invoer, meta = {}) {
  return toetser(parseAdvies(invoer, meta)).bevindingen.map((x) => x.regel);
}

export function bevindingenVan(invoer, meta = {}) {
  return toetser(parseAdvies(invoer, meta)).bevindingen;
}

export function toetsVan(invoer, meta = {}) {
  return toetser(parseAdvies(invoer, meta));
}

/** Wikkelt een fragment in een minimaal maar regelconform advies, zodat alleen de
 *  regel die we testen kan afgaan en niet de vaste-tekst- of informatieservice-regel. */
export function advies(binnenwerk, { land = 'Tsjechië', kleur = 'groen' } = {}) {
  const vast = regeldata.kleurcodes.kleuren[kleur].in_het_kort_volledig.replace('{land}', land);
  return [
    '<h2>In het kort</h2>',
    '<ul><li>' + vast + '</li></ul>',
    '<p>Let op: meld u aan voor de informatieservice.</p>',
    binnenwerk,
  ].join('');
}
