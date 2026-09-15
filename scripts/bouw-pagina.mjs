/**
 * Bouwt dist/app.html: de deelbare pagina met de regels erin.
 *
 * De Artifact-omgeving kan geen externe verzoeken doen, dus parser, regels, regeldata en een
 * paar echte reisadviezen gaan mee in de pagina zelf. src/ blijft de enige bron van waarheid;
 * dit script vouwt het samen zodat er geen tweede kopie van de regels ontstaat.
 *
 *   node scripts/bouw-pagina.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { uitApiRespons } from '../src/adapter.js';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const lees = (...p) => readFileSync(join(wortel, ...p), 'utf8');

/** ES-module naar een klassieke namespace, zodat de pagina geen modulesysteem nodig heeft. */
function alsNamespace(bron, naam, exports, vervang = []) {
  let code = bron;
  for (const [van, naar] of vervang) code = code.replace(van, naar);
  code = code
    .replace(/^import[^;]+;$/gm, '')
    .replace(/^export default [^;]+;$/gm, '')
    .replace(/^export \{[^}]*\};$/gm, '')
    .replace(/^export (function|const|class) /gm, '$1 ');
  return `const ${naam} = (function () {\n${code}\nreturn { ${exports.join(', ')} };\n})();`;
}

const parse = alsNamespace(lees('src', 'parse.js'), 'Parse', ['parseAdvies', 'splitsZinnen', 'telWoorden']);
const regels = alsNamespace(lees('src', 'regels.js'), 'Regels', ['maakToetser', 'norm', 'ERNST'],
  [[/^import \{ telWoorden \} from '\.\/parse\.js';$/m, 'const telWoorden = Parse.telWoorden;']]);

const regeldata = {
  matrix: JSON.parse(lees('regels', 'matrix.json')),
  kleurcodes: JSON.parse(lees('regels', 'kleurcodes.json')),
  woordenlijsten: JSON.parse(lees('regels', 'woordenlijsten.json')),
  limieten: JSON.parse(lees('regels', 'limieten.json')),
  sjabloon: JSON.parse(lees('regels', 'sjabloon.json')),
};

// Drie echte adviezen, gekozen om verschillende situaties te laten zien.
const keuze = [
  ['CZE', '1 kleurcode, kort'],
  ['AGO', 'meerdere kleurcodes'],
  ['THA', 'langste advies'],
];
const voorbeelden = [];
for (const [iso, kenmerk] of keuze) {
  const pad = join(wortel, 'data', 'corpus', `${iso}.xml`);
  if (!existsSync(pad)) {
    console.warn(`overgeslagen: data/corpus/${iso}.xml ontbreekt`);
    continue;
  }
  const v = uitApiRespons(readFileSync(pad, 'utf8'));
  voorbeelden.push({ iso, land: v.land, kenmerk, html: v.html });
}
if (!voorbeelden.length) {
  console.error('Geen voorbeelden gevonden. Draai eerst de workflow "Corpus ophalen".');
  process.exit(1);
}

const pagina = lees('src', 'app.html')
  .replace('/*__PARSE__*/', () => parse)
  .replace('/*__REGELS__*/', () => regels)
  .replace('/*__REGELDATA__*/', () => JSON.stringify(regeldata))
  .replace('/*__VOORBEELDEN__*/', () => JSON.stringify(voorbeelden));

mkdirSync(join(wortel, 'dist'), { recursive: true });
writeFileSync(join(wortel, 'dist', 'app.html'), pagina);
console.log(`dist/app.html geschreven — ${(pagina.length / 1024).toFixed(0)} kB, `
  + `${voorbeelden.length} voorbeelden (${voorbeelden.map((v) => v.land).join(', ')})`);
