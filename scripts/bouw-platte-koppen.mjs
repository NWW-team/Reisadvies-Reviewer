/**
 * Verzamelt alle koppen die de reisadviezen gebruiken, met hun niveau (h2, h3 of h4).
 *
 *   node scripts/bouw-platte-koppen.mjs
 *
 * Uitvoer: regels/koppen-plat.json
 *
 * Waarvoor: wie de tekst van een advies als platte tekst plakt, verliest de opmaak. Een kop is
 * dan een regel als alle andere, en de tool meldt dat "In het kort" of "Welke
 * veiligheidsrisico's zijn er in ...?" ontbreekt terwijl het er gewoon staat. Met deze lijst
 * herkent de parser zo'n regel weer als kop, op het niveau waarop hij in de echte adviezen staat.
 *
 * De landnaam wordt {land}: "Hoe bereid ik mijn reis naar Cambodja voor?" en die naar Peru zijn
 * dezelfde kop. Een kop telt mee als hij in minstens twee adviezen staat; een kop die maar één
 * land heeft ("Achtergelaten of gedwongen te trouwen") is geen patroon maar toeval.
 *
 * Draait over data/corpus/, dus na scripts/fetch-corpus.mjs opnieuw draaien.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { uitApiRespons } from '../src/adapter.js';
import { parseAdvies } from '../src/parse.js';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const norm = (s) => (s || '').replace(/[‘’ʼ]/g, "'").replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const corpusMap = join(wortel, 'data', 'corpus');
if (!existsSync(corpusMap)) {
  console.error('Geen corpus gevonden in data/corpus/. Draai eerst scripts/fetch-corpus.mjs.');
  process.exit(1);
}

const telling = new Map();          // kleine letters -> { kop, niveaus: {2: n, 3: n, 4: n}, adviezen:Set }
let adviezen = 0;
for (const f of readdirSync(corpusMap).filter((x) => x.endsWith('.xml'))) {
  const v = uitApiRespons(readFileSync(join(corpusMap, f), 'utf8'));
  adviezen += 1;
  const landRe = v.land ? new RegExp('\\b' + esc(v.land) + '\\b', 'g') : null;
  for (const k of parseAdvies(v.html, { land: v.land }).koppen) {
    const kop = norm(landRe ? k.tekst.replace(landRe, '{land}') : k.tekst);
    if (!kop) continue;
    const n = kop.toLowerCase();
    if (!telling.has(n)) telling.set(n, { kop, niveaus: {}, adviezen: new Set() });
    const t = telling.get(n);
    t.niveaus[k.niveau] = (t.niveaus[k.niveau] || 0) + 1;
    t.adviezen.add(v.isocode || f);
  }
}

const koppen = [...telling.values()]
  .filter((x) => x.adviezen.size >= 2)
  .map((x) => ({
    kop: x.kop,
    niveau: Number(Object.entries(x.niveaus).sort((a, b) => b[1] - a[1])[0][0]),
    adviezen: x.adviezen.size,
  }))
  .sort((a, b) => b.adviezen - a.adviezen || a.kop.localeCompare(b.kop, 'nl'));

const uit = {
  _bron: 'Afgeleid uit data/corpus/: de koppen die de reisadviezen zelf gebruiken, met het niveau '
    + 'waarop ze het vaakst staan. De landnaam is vervangen door {land}.',
  _toelichting: 'Alleen voor geplakte platte tekst: daar is de opmaak weg en herkent de parser een '
    + 'kop aan deze lijst. Geen norm; de regels toetsen hier niet op.',
  _gedraaid: new Date().toISOString().slice(0, 10),
  _adviezen: adviezen,
  koppen,
};
writeFileSync(join(wortel, 'regels', 'koppen-plat.json'), JSON.stringify(uit, null, 2) + '\n');
console.log(`${koppen.length} koppen (in minstens twee adviezen) over ${adviezen} adviezen`);
