/**
 * Welke vaste formuleringen uit sjabloon en matrix passen zelf niet binnen de schrijfwijzer?
 *
 * De tool meldt die niet — de tekst volgt keurig het format, dus daar kan een redacteur niets aan
 * doen. Maar het is wél iets om een keer over te hebben: als een voorgeschreven zin structureel te
 * lang is, is dat een gesprek over het sjabloon, niet over het advies.
 *
 *   node scripts/vaste-teksten-boven-de-norm.mjs
 *
 * Uitvoer: data/vaste-teksten-boven-de-norm.md
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { uitApiRespons } from '../src/adapter.js';
import { parseAdvies, telWoorden } from '../src/parse.js';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const laad = (n) => JSON.parse(readFileSync(join(wortel, 'regels', n), 'utf8'));
const sj = laad('sjabloon.json');
const lim = laad('limieten.json');
const norm = (s) => (s || '').replace(/[‘’ʼ]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

// Hoe vaak komt een formulering in het corpus voor? Op het langste herkenbare deel zoeken.
const corpus = [];
for (const f of readdirSync(join(wortel, 'data', 'corpus')).filter((x) => x.endsWith('.xml'))) {
  const v = uitApiRespons(readFileSync(join(wortel, 'data', 'corpus', f), 'utf8'));
  corpus.push(norm(parseAdvies(v.html, { land: v.land }).volledigeTekst));
}
const telAdviezen = (kern) => corpus.filter((t) => t.includes(kern)).length;

const bronnen = [
  ...sj.vaste_teksten.map((v) => ({ id: v.id, zin: v.zin, soort: 'verplicht' })),
  ...((sj.vrijgestelde_formuleringen && sj.vrijgestelde_formuleringen.zinnen) || [])
    .map((z, i) => ({ id: 'vrijgesteld-' + (i + 1), zin: z, soort: 'als van toepassing' })),
];

const rijen = [];
for (const b of bronnen) {
  for (const zin of b.zin.split(/(?<=[.?!])\s+/)) {
    const schoon = zin.replace(/\{land\}/g, 'Land X').replace(/\{vrij\}|\{gebieden\}|\{kleur\}/g, '…').trim();
    if (!schoon) continue;
    const woorden = telWoorden(schoon);
    if (woorden <= lim.zin.max_woorden) continue;
    const kern = norm(zin.split(/\{land\}|\{vrij\}|\{gebieden\}|\{kleur\}/)[0]).trim();
    rijen.push({ id: b.id, soort: b.soort, woorden, zin: schoon,
      adviezen: kern.length > 20 ? telAdviezen(kern) : null });
  }
}
// Een zin kan in beide lijsten staan (verplicht én als variant). Voor dit overzicht telt hij één keer.
const uniek = new Map();
for (const r of rijen) {
  const bestaand = uniek.get(r.zin);
  if (!bestaand) uniek.set(r.zin, r);
  else if (bestaand.soort !== 'verplicht' && r.soort === 'verplicht') uniek.set(r.zin, r);
}
const lijst = [...uniek.values()].sort((a, b) => (b.adviezen || 0) - (a.adviezen || 0) || b.woorden - a.woorden);

const uit = [`# Vaste teksten die zelf boven de norm zitten`, '',
  `Gedraaid op ${new Date().toISOString().slice(0, 10)} over ${corpus.length} reisadviezen.`, '',
  `De schrijfwijzer houdt **maximaal ${lim.zin.max_woorden} woorden per zin** aan. De formuleringen`,
  'hieronder liggen vast in het sjabloon of de matrix en komen daar zelf overheen. De tool meldt ze',
  'niet: een redacteur die het format keurig volgt hoort geen fout te krijgen. Maar als een',
  'voorgeschreven zin structureel te lang is, is dat een gesprek over het sjabloon.', '',
  `**${lijst.length} zinnen** zitten boven de norm.`, '',
  '| woorden | in hoeveel adviezen | soort | zin |', '|---:|---:|---|---|',
  ...lijst.map((r) => `| ${r.woorden} | ${r.adviezen === null ? '–' : r.adviezen} | ${r.soort} | ${r.zin.replace(/\|/g, '\\|')} |`),
  '', '## Linkteksten', '',
  `De schrijfwijzer houdt **maximaal ${lim.link.max_tekens_linktekst} tekens** aan voor een linktekst.`,
  'Twee linkteksten uit het sjabloon komen daaroverheen:', '',
  '| tekens | linktekst |', '|---:|---|',
  '| 75 | Hoe voorkom ik dat ik slachtoffer word van criminaliteit in het buitenland? |',
  '| 74 | Check welke documenten u nodig heeft om te reizen met een minderjarig kind |', '',
  'Bij de eerste zou *in het buitenland* weggelaten kunnen worden (dan 58 tekens). Bij de tweede is',
  'moeilijk iets te schrappen zonder de zin onduidelijk te maken.', ''];
writeFileSync(join(wortel, 'data', 'vaste-teksten-boven-de-norm.md'), uit.join('\n'));
console.log(`${lijst.length} zinnen boven de norm — data/vaste-teksten-boven-de-norm.md geschreven`);
