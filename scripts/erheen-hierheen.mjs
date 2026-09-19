/**
 * Waar staat "erheen" en waar "hierheen"?
 *
 * De matrix (tabblad Kleurcode-teksten, kolom In het kort) zet bij groen en geel twee bijna
 * gelijke zinnen tegenover elkaar. Geldt de kleur voor het hele land, dan "U kunt erheen reizen";
 * geldt hij voor de gebieden X en Y of voor de rest van het land, dan "U kunt hierheen reizen".
 *
 * Dit scriptje loopt het corpus langs en schrijft een lijstje van de adviezen die het andersom
 * doen, zodat de redactie ze kan nalopen.
 *
 *   node scripts/erheen-hierheen.mjs
 *
 * Uitvoer: data/erheen-hierheen.md
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { uitApiRespons } from '../src/adapter.js';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const corpusMap = join(wortel, 'data', 'corpus');

const fout = [];
for (const bestand of readdirSync(corpusMap).filter((f) => f.endsWith('.xml')).sort()) {
  const velden = uitApiRespons(readFileSync(join(corpusMap, bestand), 'utf8'));
  // Heeft het advies één kleurcode, dan geldt die voor het hele land en hoort overal "erheen".
  // Zijn het er meer, dan slaat elke bullet op een deel en hoort overal "hierheen". Dat is
  // dezelfde afweging als de regel kleur-variant maakt, en die leunt net als hier op het
  // cms-veld en niet op hoe de zin toevallig loopt.
  const heel = (velden.kleurcodes || []).length === 1;
  const hoort = heel ? 'erheen' : 'hierheen';
  const plat = (velden.html || '').replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&').replace(/\s+/g, ' ');
  for (const m of plat.matchAll(/([^.!?]{10,140})\.\s*U kunt (er|hier)heen reizen/g)) {
    const aanduiding = m[1].trim().replace(/^In het kort\s+/, '');
    if (m[2] + 'heen' !== hoort) {
      fout.push({ iso: velden.isocode || bestand.replace('.xml', ''), land: velden.land,
        zin: `${aanduiding}. U kunt ${m[2]}heen reizen.`, staat: `${m[2]}heen`, hoort });
    }
  }
}

const regels = [
  '# Erheen of hierheen',
  '',
  'De matrix, tabblad *Kleurcode-teksten*, kolom *In het kort*, rijen Groen en Geel:',
  '',
  '> **Volledig geel:** De kleurcode van het reisadvies voor land X is geel. U kunt **erheen** reizen. …',
  '>',
  '> **Deels geel:** Voor de gebieden X en Y/de rest van land X geldt kleurcode geel. U kunt **hierheen** reizen. …',
  '',
  'Welke van de twee het is, hangt aan het aantal kleurcodes van het advies: één kleurcode betekent',
  'het hele land, meer kleurcodes betekent dat elke bullet over een deel gaat.',
  '',
  `Over 226 reisadviezen staat dit ${fout.length} keer andersom. Eén woord per advies.`,
  '',
  '| land | wat er staat | moet zijn |',
  '|---|---|---|',
  ...fout.map((f) => `| ${f.land} | ${f.zin} | ${f.hoort} |`),
  '',
  `Gegenereerd met \`node scripts/erheen-hierheen.mjs\` op ${new Date().toISOString().slice(0, 10)}.`,
  '',
];
writeFileSync(join(wortel, 'data', 'erheen-hierheen.md'), regels.join('\n'));
console.log(`${fout.length} adviezen. Lijst: data/erheen-hierheen.md`);
