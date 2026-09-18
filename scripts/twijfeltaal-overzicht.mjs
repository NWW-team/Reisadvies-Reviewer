/**
 * Waar staat welke twijfeltaal in de reisadviezen?
 *
 * De schrijfwijzer wil stellige taal, maar niet elke nuance is twijfel. "Terroristische groepen
 * plegen aanslagen" is feitelijk onjuist; "plegen regelmatig aanslagen" is precies wat je bedoelt.
 * De tool splitst die twee daarom in twee filters. Dit overzicht laat per woord zien waar het staat
 * en hoe vaak, zodat je die afweging één keer voor de hele redactie kunt maken.
 *
 *   node scripts/twijfeltaal-overzicht.mjs
 *
 * Uitvoer: data/twijfeltaal-overzicht.md
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const bevindingen = JSON.parse(readFileSync(join(wortel, 'data', 'bevindingen.json'), 'utf8'));
const woordenlijsten = JSON.parse(readFileSync(join(wortel, 'regels', 'woordenlijsten.json'), 'utf8'));
const frequentie = new Set((woordenlijsten.twijfeltaal.frequentie || []).map((w) => w.toLowerCase()));

// Het gemelde woord staat tussen aanhalingstekens in de boodschap.
const woordUit = (b) => ((b.boodschap || '').match(/"([^"]+)"/) || [])[1] || '?';

const perWoord = new Map();
for (const advies of bevindingen) {
  for (const b of advies.bevindingen || []) {
    if (b.regel !== 'zin-twijfeltaal' && b.regel !== 'zin-frequentiewoord') continue;
    const w = woordUit(b).toLowerCase();
    if (!perWoord.has(w)) {
      perWoord.set(w, { woord: w, soort: b.regel === 'zin-frequentiewoord' ? 'frequentie' : 'verzwakker',
        aantal: 0, adviezen: new Set(), rubrieken: new Map(), voorbeelden: [] });
    }
    const r = perWoord.get(w);
    r.aantal += 1;
    r.adviezen.add(advies.iso);
    const rub = b.kop || '(geen rubriek)';
    r.rubrieken.set(rub, (r.rubrieken.get(rub) || 0) + 1);
    if (r.voorbeelden.length < 3 && b.fragment) r.voorbeelden.push({ iso: advies.iso, zin: b.fragment });
  }
}

const lijst = [...perWoord.values()].sort((a, b) => b.aantal - a.aantal);
const som = (s) => lijst.filter((r) => r.soort === s).reduce((n, r) => n + r.aantal, 0);
const top = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n)
  .map(([k, v]) => `${k} (${v})`).join(', ');
const veilig = (s) => String(s).replace(/\|/g, '\\|');

const uit = ['# Twijfeltaal in de reisadviezen', '',
  `Gedraaid op ${new Date().toISOString().slice(0, 10)} over ${bevindingen.length} reisadviezen.`, '',
  'De schrijfwijzer vraagt stellige taal. Maar twijfeltaal is niet één ding. Er zitten twee soorten',
  'woorden in, en die vragen een ander gesprek:', '',
  `- **Verzwakkers** (${som('verzwakker')}×) — *misschien*, *mogelijk*, *waarschijnlijk*. Die verzwakken de`,
  '  bewering zelf. Bijna altijd is er een stelliger formulering, of hoort er te staan wat je wél weet.',
  `- **Frequentiewoorden** (${som('frequentie')}×) — *vaak*, *soms*, *regelmatig*. Die zeggen hoe váák iets`,
  '  gebeurt, en dat is feitelijke informatie. "Terroristische groepen plegen aanslagen" is stelliger',
  '  dan "plegen regelmatig aanslagen", maar ook onjuist.',
  '',
  'In de tool staan ze daarom in twee losse filters. Dit overzicht is om de afweging één keer voor de',
  'hele redactie te maken: welke woorden wil je echt weg, en welke horen bij het onderwerp?', '',
  '## Per woord', '',
  '| woord | soort | keer | in hoeveel adviezen | meest voorkomende rubrieken |',
  '|---|---|---:|---:|---|',
  ...lijst.map((r) => `| ${veilig(r.woord)} | ${r.soort} | ${r.aantal} | ${r.adviezen.size} | ${veilig(top(r.rubrieken, 3))} |`),
  '', '## Voorbeeldzinnen', '',
  'Per woord de eerste drie zinnen uit het corpus, zodat te zien is waar het woord voor gebruikt wordt.',
  ''];

for (const r of lijst) {
  uit.push(`### ${r.woord} — ${r.soort}, ${r.aantal}× in ${r.adviezen.size} adviezen`, '');
  for (const v of r.voorbeelden) uit.push(`- **${v.iso}** — ${v.zin}`);
  uit.push('');
}

writeFileSync(join(wortel, 'data', 'twijfeltaal-overzicht.md'), uit.join('\n'));
console.log(`${lijst.length} woorden, ${som('verzwakker') + som('frequentie')} meldingen — data/twijfeltaal-overzicht.md geschreven`);
