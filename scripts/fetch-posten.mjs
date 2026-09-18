/**
 * Haalt de Nederlandse vertegenwoordigingen op uit de open data en schrijft ze naar
 * data/posten/<iso>.xml.
 *
 *   node scripts/fetch-posten.mjs                 alle landen
 *   node scripts/fetch-posten.mjs CZE FRA         alleen deze
 *   node scripts/fetch-posten.mjs --limiet 5      eerste 5 (rooktest)
 *
 * Draait NIET in de Claude Code-omgeving: die zit achter een netwerk-allowlist die alleen GitHub
 * en de package-registries doorlaat. Draai dit op een Actions-runner (.github/workflows/corpus.yml).
 *
 * Waarom: de ambassades, consulaten-generaal en de plaatsen waar die zitten staan op de site goed
 * gespeld. Daarmee kan `landnaam-schrijfwijze` straks ook een verkeerd gespelde postnaam vangen,
 * op dezelfde manier als hij dat nu voor de landnaam doet.
 *
 * Het endpoint staat in het landdocument zelf, als veld nlRepresentation:
 *   /v2/sources/nederlandwereldwijd/infotypes/countries/{iso}/nl-representation
 * In de API-documentatie heet dit ConsularData, "contact information for all representations
 * abroad".
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASIS = 'https://opendata.nederlandwereldwijd.nl/v2/sources/nederlandwereldwijd/infotypes/countries';
const UITVOER = join(wortel, 'data', 'posten');
const GELIJKTIJDIG = 6;
const POGINGEN = 3;

const landen = JSON.parse(readFileSync(join(wortel, 'regels', 'landen.json'), 'utf8')).landen;

const codes = [];
let limiet = null;
for (let i = 0; i < process.argv.slice(2).length; i++) {
  const a = process.argv.slice(2)[i];
  if (a === '--limiet') limiet = Number(process.argv.slice(2)[++i]);
  else codes.push(a);
}

async function haal(url) {
  for (let p = 1; p <= POGINGEN; p++) {
    try {
      const r = await fetch(url, { headers: { accept: 'application/xml' } });
      if (r.status === 404) return { status: 404 };
      if (!r.ok) throw new Error('status ' + r.status);
      return { status: 200, tekst: await r.text() };
    } catch (e) {
      if (p === POGINGEN) return { status: 0, fout: e.message };
      await new Promise((r) => setTimeout(r, 400 * p));
    }
  }
  return { status: 0 };
}

let kies = landen;
if (codes.length) kies = landen.filter((l) => codes.includes(l.iso));
if (limiet) kies = kies.slice(0, limiet);

mkdirSync(UITVOER, { recursive: true });
console.log(`Ophalen van ${kies.length} vertegenwoordigingen…`);

const rapport = { gelukt: 0, leeg: 0, mislukt: [] };
let eerste = null;

for (let i = 0; i < kies.length; i += GELIJKTIJDIG) {
  await Promise.all(kies.slice(i, i + GELIJKTIJDIG).map(async (l) => {
    // De ISO-code werkt als pad-segment; de locationKey is de terugval, net als bij de reisadviezen.
    let r = await haal(`${BASIS}/${l.iso.toLowerCase()}/nl-representation`);
    if (r.status === 404) r = await haal(`${BASIS}/${l.locationKey}/nl-representation`);
    if (r.status === 200 && r.tekst && r.tekst.trim()) {
      writeFileSync(join(UITVOER, l.iso + '.xml'), r.tekst);
      rapport.gelukt += 1;
      if (!eerste) eerste = { iso: l.iso, tekst: r.tekst };
      process.stdout.write('.');
    } else if (r.status === 404) {
      rapport.leeg += 1;
      process.stdout.write('-');
    } else {
      rapport.mislukt.push(`${l.iso}: ${r.fout || r.status}`);
      process.stdout.write('x');
    }
  }));
}

console.log(`\nGelukt: ${rapport.gelukt} — geen post: ${rapport.leeg} — mislukt: ${rapport.mislukt.length}`);
for (const m of rapport.mislukt.slice(0, 10)) console.log('  ' + m);

// Eén voorbeeld in het log, zodat te zien is hoe het antwoord eruitziet zonder de repo te openen.
if (eerste) {
  console.log(`\n--- voorbeeld (${eerste.iso}), eerste 2500 tekens ---`);
  console.log(eerste.tekst.slice(0, 2500));
}
