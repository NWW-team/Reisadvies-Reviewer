/**
 * Haalt de standplaatsen van de Nederlandse posten uit data/posten/ en zet ze in
 * regels/postplaatsen.json.
 *
 *   node scripts/bouw-postplaatsen.mjs
 *
 * Waarvoor: net als bij de landnamen weet de tool hiervan hoe het hoort. Staat er "Bogota" waar
 * "Bogotá" hoort, dan is dat een fout, en namen worden verder niet beoordeeld.
 *
 * Alleen plaatsen met een trema of accent komen in de lijst. Bij de rest valt niets te
 * vergelijken: de toets kijkt of het accent klopt, niet of de naam bestaat.
 *
 * Draait over data/posten/, dus na scripts/fetch-posten.mjs opnieuw draaien.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const map = join(wortel, 'data', 'posten');
if (!existsSync(map)) {
  console.error('Geen data/posten/ gevonden. Draai eerst scripts/fetch-posten.mjs.');
  process.exit(1);
}

const ontsnap = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, c) => String.fromCharCode(c));
const kaal = (s) => s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();

// Dezelfde verbuigingsregel als in src/regels.js, hier op de brondata zelf. De open data is de
// norm voor de standplaatsen, maar dat maakt hem niet foutloos: op 18 september 2026 stond er
// "Nederlandse ambassadekantoor in Minsk", waar "Nederlands" hoort. Dat staat op de contactpagina
// van de site en niet in een reisadvies, dus de tool komt het nooit tegen — vandaar hier.
const HET_WOORDEN = ['consulaat-generaal', 'consulaat', 'ambassadekantoor'];
const verbuigingsfout = (titel) => {
  const m = titel.match(/^Nederlands(e)?\s+([\w-]+)/);
  if (!m) return null;
  const hetWoord = HET_WOORDEN.includes(m[2].toLowerCase());
  // Zonder lidwoord — en een titel begint nooit met een lidwoord — krijgt een het-woord geen -e.
  if (hetWoord && m[1]) return `"Nederlandse ${m[2]}" hoort "Nederlands ${m[2]}" te zijn`;
  if (!hetWoord && !m[1]) return `"Nederlands ${m[2]}" hoort "Nederlandse ${m[2]}" te zijn`;
  return null;
};

const plaatsen = new Map();
const fouten = [];
let posten = 0;
for (const f of readdirSync(map).filter((x) => x.endsWith('.xml'))) {
  const xml = readFileSync(join(map, f), 'utf8');
  for (const m of xml.matchAll(/<title>([^<]*)<\/title>/g)) {
    const titel = ontsnap(m[1]).trim();
    posten += 1;
    const fout = verbuigingsfout(titel);
    if (fout) fouten.push(`${f.slice(0, 3)}  ${titel}\n        ${fout}`);
    // "Nederlandse ambassade in Praag, Tsjechië" — de standplaats staat tussen " in " en de komma.
    const plaats = (titel.match(/ in (.+?)(?:,|$)/) || [])[1];
    if (!plaats) continue;
    const naam = plaats.trim();
    // Alleen namen met een trema of accent: bij de rest valt niets te vergelijken.
    if (kaal(naam) === naam.toLowerCase()) continue;
    plaatsen.set(kaal(naam), naam);
  }
}

const lijst = [...plaatsen.values()].sort((a, b) => a.localeCompare(b, 'nl'));
const uit = {
  _bron: 'Open data Nederland Wereldwijd, infotype nl-representation (ConsularData). Opgehaald met '
    + 'scripts/fetch-posten.mjs, uitgelezen met scripts/bouw-postplaatsen.mjs.',
  _toelichting: 'De standplaatsen van de Nederlandse ambassades en consulaten-generaal, voor zover '
    + 'hun naam een trema of accent heeft. Hiermee kan postplaats-schrijfwijze zien of de naam goed '
    + 'staat. Bij plaatsen zonder trema of accent valt niets te vergelijken: de toets kijkt of het '
    + 'accent klopt, niet of de naam bestaat.',
  _gedraaid: new Date().toISOString().slice(0, 10),
  _posten: posten,
  plaatsen: lijst,
};
writeFileSync(join(wortel, 'regels', 'postplaatsen.json'), JSON.stringify(uit, null, 2) + '\n');
console.log(`${posten} posten, ${lijst.length} standplaatsen met een trema of accent: ${lijst.join(', ')}`);

// De brondata is niet foutloos, en dat hoort zichtbaar te zijn: deze titels staan op de
// contactpagina's van de site, waar de tool ze nooit tegenkomt.
if (fouten.length) {
  console.log(`\n${fouten.length} post${fouten.length === 1 ? '' : 'en'} met een verbuigingsfout in de open data:`);
  for (const f of fouten) console.log('  ' + f);
  console.log('\n  Dit staat op de contactpagina, niet in een reisadvies. De tool komt het dus niet');
  console.log('  tegen; corrigeren gebeurt in de content achter de open data.');
}
