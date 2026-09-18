/**
 * Haalt de OpenTaal-woordenlijst op en zet hem klaar voor de tool.
 *
 *   node scripts/haal-woordenlijst.mjs
 *
 * Uitvoer: docs/woordenlijst.txt.gz — één bestand, dat zowel de gepubliceerde pagina (met
 * DecompressionStream) als Node (met zlib) leest. Ingepakt is het 1,3 MB in plaats van 5,1 MB;
 * dat scheelt in de repository én in wat een redacteur download.
 *
 * De sha256 van de opgehaalde lijst wordt vergeleken met data/opentaal.sha256. Wijkt die af, dan
 * stopt het script: je toetst dan aan een andere spelling dan de vorige keer, en dat hoort een
 * bewuste keuze te zijn.
 *
 * Bronvermelding: OpenTaal-woordenlijst van stichting OpenTaal, met het Keurmerk Spelling van de
 * Nederlandse Taalunie. Licentie: Revised BSD en/of CC BY 3.0.
 * https://github.com/OpenTaal/opentaal-wordlist
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const ref = process.argv.includes('--ref') ? process.argv[process.argv.indexOf('--ref') + 1] : 'master';
const bron = `https://raw.githubusercontent.com/OpenTaal/opentaal-wordlist/${ref}/wordlist.txt`;

const antwoord = await fetch(bron);
if (!antwoord.ok) throw new Error(`${bron} gaf ${antwoord.status}`);
const tekst = await antwoord.text();
const sha = createHash('sha256').update(tekst).digest('hex');

const verwacht = readFileSync(join(wortel, 'data', 'opentaal.sha256'), 'utf8')
  .split('\n').find((r) => r.trim() && !r.startsWith('#')).trim();

if (sha !== verwacht) {
  console.error(`De woordenlijst is gewijzigd.\n  verwacht: ${verwacht}\n  opgehaald: ${sha}\n`);
  console.error('Klopt de nieuwe lijst? Werk dan data/opentaal.sha256 bij en draai opnieuw.');
  process.exit(1);
}

// Alles naar kleine letters en ontdubbeld. De toets vergelijkt toch op kleine letters, en zo
// staat elk woord één keer in het bestand.
const woorden = [...new Set(tekst.split('\n').map((w) => w.trim().toLowerCase()).filter(Boolean))].sort();
const uit = join(wortel, 'docs', 'woordenlijst.txt.gz');
const pak = gzipSync(Buffer.from(woorden.join('\n'), 'utf8'), { level: 9 });
writeFileSync(uit, pak);
console.log(`${woorden.length} woorden, sha256 ${sha.slice(0, 12)}…`);
console.log(`docs/woordenlijst.txt.gz geschreven — ${(pak.length / 1024 / 1024).toFixed(2)} MB ingepakt`);
