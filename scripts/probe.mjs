/**
 * Haalt één reisadvies op en legt de echte responsvorm vast.
 *
 * De ontwikkelomgeving kan de host niet bereiken, een Actions-runner wel. Het ruwe antwoord
 * wordt naar data/voorbeeld/ geschreven en door de workflow teruggecommit, zodat de adapter
 * op de echte vorm gebouwd kan worden in plaats van op een aanname.
 *
 *   node scripts/probe.mjs [ISO-code]
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const code = process.argv[2] || 'CZE';
const url = `https://opendata.nederlandwereldwijd.nl/v2/sources/nederlandwereldwijd/infotypes/countries/${code}/traveladvice`;

const start = Date.now();
let r;
try {
  r = await fetch(url);
} catch (e) {
  console.log(`NIET BEREIKBAAR — ${e.message}`);
  process.exit(1);
}

const tekst = await r.text();
console.log(`url:     ${url}`);
console.log(`status:  ${r.status} ${r.statusText}`);
console.log(`type:    ${r.headers.get('content-type')}`);
console.log(`tijd:    ${Date.now() - start} ms`);
console.log(`lengte:  ${tekst.length} tekens`);

if (!r.ok) {
  console.log('\n' + tekst.slice(0, 800));
  process.exit(1);
}

mkdirSync(join(wortel, 'data', 'voorbeeld'), { recursive: true });
const bestand = join(wortel, 'data', 'voorbeeld', `${code}.xml`);
writeFileSync(bestand, tekst);
console.log(`\nOpgeslagen: data/voorbeeld/${code}.xml`);

// Welke elementen zitten erin, hoe groot zijn ze, en zit er HTML in?
console.log('\n=== ELEMENTEN OP HET HOOFDNIVEAU ===');
const elementRe = /<([a-zA-Z][\w.-]*)\b[^>]*>([\s\S]*?)<\/\1>/g;
const gezien = new Map();
for (const m of tekst.matchAll(elementRe)) {
  const naam = m[1];
  if (gezien.has(naam)) { gezien.get(naam).aantal++; continue; }
  const inhoud = m[2];
  const kaal = inhoud.replace(/<!\[CDATA\[|\]\]>/g, '');
  gezien.set(naam, {
    aantal: 1,
    lengte: kaal.length,
    cdata: /<!\[CDATA\[/.test(inhoud),
    html: /<(p|h2|h3|ul|li|a)\b/i.test(kaal),
    begin: kaal.replace(/\s+/g, ' ').trim().slice(0, 150),
  });
}
for (const [naam, v] of gezien) {
  console.log(`\n<${naam}>  ×${v.aantal}  ${v.lengte} tekens${v.cdata ? '  [CDATA]' : ''}${v.html ? '  [HTML]' : ''}`);
  console.log(`   ${JSON.stringify(v.begin)}`);
}

console.log('\n=== EERSTE 4000 TEKENS RUW ===');
console.log(tekst.slice(0, 4000));
