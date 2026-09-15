/**
 * Haalt de reisadviezen op uit de open data v2 API van Nederland Wereldwijd en schrijft
 * ze naar data/corpus/<iso>.xml. De API levert XML, geen JSON — zie src/adapter.js.
 *
 * Draait NIET in de Claude Code-omgeving: die zit achter een netwerk-allowlist die alleen
 * GitHub en de package-registries doorlaat. Draai dit op een GitHub Actions-runner
 * (.github/workflows/corpus.yml) of lokaal, en commit de uitkomst naar de repo.
 *
 *   node scripts/fetch-corpus.mjs                 alle landen
 *   node scripts/fetch-corpus.mjs CZE FRA         alleen deze
 *   node scripts/fetch-corpus.mjs --limiet 5      eerste 5 (rooktest)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASIS = 'https://opendata.nederlandwereldwijd.nl/v2/sources/nederlandwereldwijd/infotypes/countries';
const UITVOER = join(wortel, 'data', 'corpus');
const GELIJKTIJDIG = 6;
const POGINGEN = 3;

const landen = JSON.parse(readFileSync(join(wortel, 'regels', 'landen.json'), 'utf8')).landen;

function argumenten(argv) {
  const codes = [];
  let limiet = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limiet') limiet = Number(argv[++i]);
    else codes.push(argv[i]);
  }
  return { codes, limiet };
}

async function haal(url, pogingen = POGINGEN) {
  for (let p = 1; p <= pogingen; p++) {
    try {
      const r = await fetch(url, { headers: { accept: 'application/xml' } });
      if (r.status === 404) return { status: 404 };
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const tekst = await r.text();
      if (!tekst.includes('<document')) return { status: 0, fout: 'antwoord is geen <document>-XML' };
      return { status: 200, body: tekst };
    } catch (e) {
      if (p === pogingen) return { status: 0, fout: e.message };
      await new Promise((r) => setTimeout(r, 2 ** p * 500));
    }
  }
}

/** Probeert eerst de ISO-code, daarna de locationKey — 4 codes zijn geen ISO-3166 alfa-3. */
async function haalLand({ iso, locationKey }) {
  for (const sleutel of [iso, locationKey]) {
    const url = `${BASIS}/${encodeURIComponent(sleutel)}/traveladvice`;
    const r = await haal(url);
    if (r.status === 200) return { ok: true, sleutel, url, body: r.body };
    if (r.status === 0) return { ok: false, sleutel, url, fout: r.fout };
  }
  return { ok: false, sleutel: iso, fout: '404 op zowel ISO-code als locationKey' };
}

async function main() {
  const { codes, limiet } = argumenten(process.argv.slice(2));
  let werk = codes.length
    ? landen.filter((l) => codes.includes(l.iso) || codes.includes(l.locationKey))
    : landen;
  if (limiet) werk = werk.slice(0, limiet);

  mkdirSync(UITVOER, { recursive: true });
  console.log(`Ophalen van ${werk.length} reisadviezen…`);

  const gelukt = [];
  const mislukt = [];
  let volgende = 0;

  async function werker() {
    while (volgende < werk.length) {
      const land = werk[volgende++];
      const r = await haalLand(land);
      if (r.ok) {
        writeFileSync(join(UITVOER, `${land.iso}.xml`), r.body);
        gelukt.push(land.iso);
        process.stdout.write('.');
      } else {
        mislukt.push({ iso: land.iso, reden: r.fout });
        process.stdout.write('x');
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(GELIJKTIJDIG, werk.length) }, werker));
  process.stdout.write('\n');

  const rapport = {
    uitgevoerd: new Date().toISOString(),
    gevraagd: werk.length,
    gelukt: gelukt.length,
    mislukt,
  };
  writeFileSync(join(wortel, 'data', 'ophaalrapport.json'), JSON.stringify(rapport, null, 2));
  console.log(`Gelukt: ${gelukt.length} — mislukt: ${mislukt.length}`);
  for (const m of mislukt) console.log(`  ${m.iso}: ${m.reden}`);
  if (gelukt.length === 0) {
    console.error('\nGeen enkel advies opgehaald. Draait dit op een machine met toegang tot opendata.nederlandwereldwijd.nl?');
    process.exit(1);
  }
}

main();
