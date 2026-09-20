/**
 * Waar staat "erheen" en waar "hierheen"?
 *
 * De matrix (tabblad Kleurcode-teksten, kolom In het kort) zet bij groen en geel twee bijna
 * gelijke zinnen tegenover elkaar. Het echte onderscheid zit niet in het aantal kleurcodes van het
 * advies, maar in de bullet zelf (Martijn, 20 september 2026): wijst de bullet terug naar een
 * eerder genoemd, specifiek deelgebied ("voor de gebieden X en Y"), dan hoort daar "hierheen" bij.
 * Gaat het om een groter, abstracter geheel -- het hele land, of "de rest van" het land -- dan
 * hoort daar "erheen" bij, ook al heeft het advies als geheel meerdere kleurcodes. Dat is dezelfde
 * afweging als de regel kleur-variant maakt.
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
  // Eén kleurcode: de kleur geldt voor het hele land, dus overal "erheen". Meerdere kleurcodes:
  // per bullet hangt het af van hoe die zijn gebied noemt.
  const heel = (velden.kleurcodes || []).length === 1;
  const plat = (velden.html || '').replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&').replace(/\s+/g, ' ');
  for (const m of plat.matchAll(/([^.!?]{10,140})\.\s*U kunt (er|hier)heen reizen/g)) {
    const aanduiding = m[1].trim().replace(/^In het kort\s+/, '');
    // "de rest van" of "het hele land" is geen gerichte verwijzing naar een deelgebied, ook al
    // heeft het advies meerdere kleurcodes.
    const wijstNaarGeheel = /\b(?:de rest van|het hele)\b/i.test(aanduiding);
    const hoort = heel || wijstNaarGeheel ? 'erheen' : 'hierheen';
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
  'Het onderscheid dat de tool toetst, wijkt hier inmiddels van af (Martijn, 20 september 2026):',
  '"hierheen" hoort bij een gerichte verwijzing naar een eerder genoemd deelgebied ("de gebieden X ',
  'en Y"); "erheen" bij een groter, abstracter geheel -- het hele land, of "de rest van" het land --',
  'ook als het advies als geheel meerdere kleurcodes heeft. De matrix zelf zet "de rest van land X"',
  'nog onder "Deels"/"hierheen"; dat cel-voorbeeld staat dus op dit punt haaks op de nieuwe regel en',
  'verdient een update.',
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
