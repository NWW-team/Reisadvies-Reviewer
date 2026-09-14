/**
 * Draait de harde regels over het hele corpus en schrijft een rapport.
 * Dit is de bulkslag uit fase 1: hoe groot is de achterstand werkelijk?
 *
 *   node scripts/bulk.mjs
 *
 * Uitvoer: data/bevindingen.json (alles) en data/bulkrapport.md (leesbaar).
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseAdvies } from '../src/parse.js';
import { maakToetser } from '../src/regels.js';
import { uitApiRespons } from '../src/adapter.js';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const laad = (n) => JSON.parse(readFileSync(join(wortel, 'regels', n), 'utf8'));
const toets = maakToetser({
  matrix: laad('matrix.json'),
  kleurcodes: laad('kleurcodes.json'),
  woordenlijsten: laad('woordenlijsten.json'),
  limieten: laad('limieten.json'),
});

const corpusMap = join(wortel, 'data', 'corpus');
if (!existsSync(corpusMap) || readdirSync(corpusMap).filter((f) => f.endsWith('.xml')).length === 0) {
  console.error('Geen corpus gevonden in data/corpus/. Draai eerst scripts/fetch-corpus.mjs '
    + '(op een machine met toegang tot opendata.nederlandwereldwijd.nl, of via de workflow Corpus ophalen).');
  process.exit(1);
}

const resultaten = [];
for (const bestand of readdirSync(corpusMap).filter((f) => f.endsWith('.xml')).sort()) {
  const velden = uitApiRespons(readFileSync(join(corpusMap, bestand), 'utf8'));
  const doc = parseAdvies(velden.html, {
    land: velden.land, titel: velden.titel, url: velden.url, kleurcodes: velden.kleurcodes,
  });
  const r = toets(doc);
  resultaten.push({ bestand, iso: velden.isocode || bestand.replace('.xml', ''), ...r.samenvatting,
    bevindingen: r.bevindingen, gewijzigd: velden.gewijzigd });
}

writeFileSync(join(wortel, 'data', 'bevindingen.json'), JSON.stringify(resultaten, null, 2));

const perRegel = {};
for (const r of resultaten) for (const [id, n] of Object.entries(r.perRegel)) {
  perRegel[id] = perRegel[id] || { adviezen: 0, bevindingen: 0 };
  perRegel[id].adviezen++;
  perRegel[id].bevindingen += n;
}

const teLang = resultaten.filter((r) => r.perRegel['doc-woordenaantal']);
const zonderFouten = resultaten.filter((r) => r.fout === 0);

const regels = [
  '# Bulkrapport reisadviezen',
  '',
  `Gedraaid op ${new Date().toISOString().slice(0, 10)} over ${resultaten.length} reisadviezen.`,
  '',
  '## Hoe groot is de achterstand',
  '',
  `- **${zonderFouten.length}** van de ${resultaten.length} adviezen hebben geen enkele harde fout.`,
  `- **${teLang.length}** adviezen zitten boven de woordenlimiet.`,
  `- Gemiddeld ${(resultaten.reduce((s, r) => s + r.fout, 0) / resultaten.length).toFixed(1)} fouten per advies.`,
  '',
  '## Per regel',
  '',
  '| regel | adviezen | bevindingen |',
  '|---|---:|---:|',
  ...Object.entries(perRegel).sort((a, b) => b[1].adviezen - a[1].adviezen)
    .map(([id, v]) => `| \`${id}\` | ${v.adviezen} | ${v.bevindingen} |`),
  '',
  '## Langste adviezen',
  '',
  '| land | woorden | limiet |',
  '|---|---:|---:|',
  ...resultaten.slice().sort((a, b) => b.woorden - a.woorden).slice(0, 15)
    .map((r) => `| ${r.land || r.iso} | ${r.woorden} | ${r.woordenlimiet} |`),
  '',
  '---',
  '',
  'Dit rapport gaat alleen over objectief toetsbare regels. Politieke gevoeligheden staan er',
  'bewust niet in, en de tool kort niets in: bij een overschrijding wijst hij de langste blokken',
  'aan, maar wat weg kan is een inhoudelijke keuze.',
];
writeFileSync(join(wortel, 'data', 'bulkrapport.md'), regels.join('\n') + '\n');

console.log(`${resultaten.length} adviezen getoetst.`);
console.log(`Zonder harde fouten: ${zonderFouten.length}. Boven de woordenlimiet: ${teLang.length}.`);
console.log('Rapport: data/bulkrapport.md');
