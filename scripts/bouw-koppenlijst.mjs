/**
 * Verzamelt welke tussenkoppen op h4-niveau de reisadviezen werkelijk gebruiken, en hoe vaak.
 *
 *   node scripts/bouw-koppenlijst.mjs
 *
 * Uitvoer: regels/koppen-in-gebruik.json
 *
 * Waarvoor: onder In geval van nood en Bagageregels schrijft het sjabloon de koppen voor, maar
 * niet elk land heeft dezelfde informatie. Een eigen kop is daar geen fout — "Achtergelaten of
 * gedwongen te trouwen" hoort bij Somalië en nergens anders. Wat wél fout is: hetzelfde onderwerp
 * in vijf landen vijf keer anders noemen. Deze lijst maakt dat verschil zichtbaar, doordat de regel
 * kan zien welke formulering de gangbare is.
 *
 * Draait over data/corpus/, dus na scripts/fetch-corpus.mjs opnieuw draaien.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { uitApiRespons } from '../src/adapter.js';
import { parseAdvies } from '../src/parse.js';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const sj = JSON.parse(readFileSync(join(wortel, 'regels', 'sjabloon.json'), 'utf8'));
const norm = (s) => (s || '').replace(/[‘’ʼ]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

const corpusMap = join(wortel, 'data', 'corpus');
if (!existsSync(corpusMap)) {
  console.error('Geen corpus gevonden in data/corpus/. Draai eerst scripts/fetch-corpus.mjs.');
  process.exit(1);
}

const hoortBij = (h3) => (sj.h4_toetsen.rubrieken || []).some((sleutel) => {
  const patroon = sj.rubriek_patronen[sleutel];
  return patroon && new RegExp(patroon, 'i').test(h3 || '');
});

const telling = new Map();          // genormaliseerde kop -> { kop, adviezen:Set }
let adviezen = 0;
for (const f of readdirSync(corpusMap).filter((x) => x.endsWith('.xml'))) {
  const v = uitApiRespons(readFileSync(join(corpusMap, f), 'utf8'));
  adviezen += 1;
  for (const k of parseAdvies(v.html, { land: v.land }).koppen) {
    if (k.niveau !== 4 || !hoortBij(k.h3)) continue;
    const n = norm(k.tekst);
    if (!n) continue;
    if (!telling.has(n)) telling.set(n, { kop: k.tekst, adviezen: new Set() });
    telling.get(n).adviezen.add(v.isocode);
  }
}

const koppen = [...telling.values()]
  .map((x) => ({ kop: x.kop, adviezen: x.adviezen.size }))
  .sort((a, b) => b.adviezen - a.adviezen || a.kop.localeCompare(b.kop, 'nl'));

const uit = {
  _bron: 'Afgeleid uit data/corpus/: de tussenkoppen die de reisadviezen zelf gebruiken. Geen '
    + 'brondocument, dus ook geen norm — een kop die hier vaak in staat is de gangbare formulering, '
    + 'niet per se de juiste.',
  _toelichting: 'Alleen h4-koppen onder de rubrieken uit sjabloon.json > h4_toetsen.rubrieken. '
    + 'Hiermee kan h4-kop-variant zien of een afwijkende kop landspecifiek is (dan zwijgt hij) of '
    + 'een andere formulering van iets wat elders anders heet (dan meldt hij het, met die andere '
    + 'formulering erbij).',
  _gedraaid: new Date().toISOString().slice(0, 10),
  _adviezen: adviezen,
  koppen,
};
writeFileSync(join(wortel, 'regels', 'koppen-in-gebruik.json'), JSON.stringify(uit, null, 2) + '\n');
console.log(`${koppen.length} verschillende h4-koppen over ${adviezen} adviezen`);
console.log('meest gebruikt: ' + koppen.slice(0, 3).map((k) => `${k.kop} (${k.adviezen}x)`).join(', '));
