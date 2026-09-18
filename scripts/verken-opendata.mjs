/**
 * Zoekt uit welke infotypes de open data van Nederland Wereldwijd aanbiedt, en of daar de
 * ambassades en consulaten-generaal bij zitten.
 *
 *   node scripts/verken-opendata.mjs
 *
 * Alleen lezen: dit script schrijft niets en verandert niets. Het drukt per geprobeerde url de
 * status af en een stukje van het antwoord, zodat te zien is wat er achter zit.
 *
 * Draait NIET in de Claude Code-omgeving — die zit achter een netwerk-allowlist. Draai het op een
 * Actions-runner (.github/workflows/corpus.yml) en lees de uitkomst in de stapsamenvatting.
 *
 * De reisadviezen zitten op:
 *   /v2/sources/nederlandwereldwijd/infotypes/countries/{locationKey}/traveladvice
 * De website zet de posten op:
 *   /contact/ambassades-consulaten-generaal/{land}/{ambassade-stad}
 * Dus er is een tweede infotype; welke naam die heeft moet hieruit blijken.
 */
const BASIS = 'https://opendata.nederlandwereldwijd.nl';

const paden = [
  '/v2/sources',
  '/v2/sources/nederlandwereldwijd',
  '/v2/sources/nederlandwereldwijd/infotypes',
  // Gokken op de naam, in de volgorde waarin ik ze waarschijnlijk acht.
  '/v2/sources/nederlandwereldwijd/infotypes/embassies',
  '/v2/sources/nederlandwereldwijd/infotypes/missions',
  '/v2/sources/nederlandwereldwijd/infotypes/posts',
  '/v2/sources/nederlandwereldwijd/infotypes/contacts',
  '/v2/sources/nederlandwereldwijd/infotypes/ambassades',
  '/v2/sources/nederlandwereldwijd/infotypes/locations',
  '/v2/sources/nederlandwereldwijd/infotypes/organisations',
  // Hangt een post misschien onder het land, net als het reisadvies?
  '/v2/sources/nederlandwereldwijd/infotypes/countries/tsjechie',
  '/v2/sources/nederlandwereldwijd/infotypes/countries/tsjechie/embassies',
  '/v2/sources/nederlandwereldwijd/infotypes/countries/tsjechie/contact',
];

for (const pad of paden) {
  const url = BASIS + pad;
  try {
    const r = await fetch(url, { headers: { accept: 'application/json, application/xml;q=0.9' } });
    const soort = r.headers.get('content-type') || '';
    const tekst = r.ok ? (await r.text()).slice(0, 900) : '';
    console.log(`\n=== ${r.status}  ${pad}`);
    if (r.ok) {
      console.log(`    ${soort}`);
      console.log(tekst.replace(/\n/g, '\n    ').replace(/^/, '    '));
    }
  } catch (e) {
    console.log(`\n=== FOUT ${pad}: ${e.message}`);
  }
}
