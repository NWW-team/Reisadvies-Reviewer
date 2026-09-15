/**
 * Zet het corpus klaar als losse bestanden naast de Pages-versie, zodat de tool alle
 * reisadviezen in de lijst kan zetten in plaats van de drie voorbeelden die in de pagina zelf
 * zijn gevouwen.
 *
 *   docs/adviezen/index.json   [{iso, land, kleurcodes}]  — één keer opgehaald, vult de lijst
 *   docs/adviezen/<ISO>.json   {iso, land, titel, url, html, gewijzigd}  — pas bij het kiezen
 *
 * Bewust naast index.html en niet erin: 226 adviezen in de pagina zelf zou hem een paar
 * megabytes groot maken, en bewust binnen docs/ zodat het werkt of Pages nu op de repowortel
 * of op /docs staat. Lukt het ophalen niet (de Artifact-versie mag geen verzoeken doen), dan
 * valt de pagina terug op de drie meegeleverde voorbeelden.
 *
 *   node scripts/bouw-adviezen.mjs
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { uitApiRespons } from '../src/adapter.js';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const corpus = join(wortel, 'data', 'corpus');
const doel = join(wortel, 'docs', 'adviezen');

if (!existsSync(corpus)) {
  console.error('Geen corpus in data/corpus/. Draai eerst de workflow "Corpus ophalen".');
  process.exit(1);
}

// Schoon beginnen: een land dat uit het corpus verdwijnt hoort ook uit de lijst te verdwijnen.
rmSync(doel, { recursive: true, force: true });
mkdirSync(doel, { recursive: true });

const index = [];
let bytes = 0;
for (const bestand of readdirSync(corpus).filter((f) => f.endsWith('.xml'))) {
  const v = uitApiRespons(readFileSync(join(corpus, bestand), 'utf8'));
  const iso = v.isocode || bestand.replace(/\.xml$/, '');
  if (!v.land || !v.html) {
    console.warn(`overgeslagen: ${bestand} (land of inhoud ontbreekt)`);
    continue;
  }
  const advies = {
    iso, land: v.land, titel: v.titel, url: v.url, gewijzigd: v.gewijzigd, html: v.html,
  };
  const json = JSON.stringify(advies);
  writeFileSync(join(doel, `${iso}.json`), json);
  bytes += json.length;
  index.push({ iso, land: v.land, kleurcodes: v.kleurcodes });
}

index.sort((a, b) => a.land.localeCompare(b.land, 'nl'));
writeFileSync(join(doel, 'index.json'), JSON.stringify(index));

console.log(`docs/adviezen/: ${index.length} reisadviezen, ${(bytes / 1024 / 1024).toFixed(1)} MB in totaal `
  + `(gemiddeld ${Math.round(bytes / index.length / 1024)} kB per advies).`);
