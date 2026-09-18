import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { maakToetser } from '../src/regels.js';
import { parseAdvies } from '../src/parse.js';
import { laadWoordenlijst } from '../src/woordenlijst.mjs';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const laad = (naam) => JSON.parse(readFileSync(join(wortel, 'regels', naam), 'utf8'));

export const regeldata = {
  matrix: laad('matrix.json'),
  kleurcodes: laad('kleurcodes.json'),
  woordenlijsten: laad('woordenlijsten.json'),
  limieten: laad('limieten.json'),
  sjabloon: laad('sjabloon.json'),
  tekstcontrole: laad('tekstcontrole.json'),
  landen: laad('landen.json'),
  koppenInGebruik: laad('koppen-in-gebruik.json'),
  groepen: laad('groepen.json'),
};

const toetser = maakToetser(regeldata);

/**
 * Een tweede toetser mét de woordenlijst, voor de spellingtoets. Die staat los omdat de lijst
 * 409.487 woorden is en de andere tests hem niet nodig hebben. Ontbreekt docs/woordenlijst.txt.gz,
 * dan is dit null en slaan de spellingtests zichzelf over — draai scripts/haal-woordenlijst.mjs.
 */
export const woordenlijst = laadWoordenlijst();
const spellingToetser = woordenlijst ? maakToetser({ ...regeldata, woordenlijst }) : null;

/** Toetst mét de woordenlijst en geeft de regel-ids terug. Null als de lijst ontbreekt. */
export function idsVanMetSpelling(invoer, meta = {}) {
  if (!spellingToetser) return null;
  return spellingToetser(parseAdvies(invoer, meta)).bevindingen.map((x) => x.regel);
}

/** Zoals hierboven, maar met de hele bevinding, zodat een test het gemelde woord kan nakijken. */
export function bevindingenMetSpelling(invoer, meta = {}) {
  if (!spellingToetser) return null;
  return spellingToetser(parseAdvies(invoer, meta)).bevindingen;
}

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
