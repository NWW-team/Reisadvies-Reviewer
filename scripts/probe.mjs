/**
 * Eenmalige verkenning: kan deze machine bij de open data v2 API, en hoe ziet een respons eruit?
 *
 * De ontwikkelomgeving kan de host niet bereiken, dus src/adapter.js is geschreven zonder de
 * echte responsvorm te kennen. Dit script draait op een runner en drukt de structuur af, zodat
 * de adapter een directe mapping kan worden in plaats van een zoektocht.
 *
 *   node scripts/probe.mjs [ISO-code]
 */

const code = process.argv[2] || 'CZE';
const url = `https://opendata.nederlandwereldwijd.nl/v2/sources/nederlandwereldwijd/infotypes/countries/${code}/traveladvice`;

/** Beschrijft de vorm van een JSON-boom zonder de hele inhoud af te drukken. */
function vorm(node, diepte = 0, pad = '') {
  const inspring = '  '.repeat(diepte);
  if (node === null) return `${inspring}${pad}: null`;
  if (Array.isArray(node)) {
    const regels = [`${inspring}${pad}: array(${node.length})`];
    if (node.length && diepte < 4) regels.push(vorm(node[0], diepte + 1, '[0]'));
    return regels.join('\n');
  }
  if (typeof node === 'object') {
    const regels = [`${inspring}${pad}: object {${Object.keys(node).join(', ')}}`];
    if (diepte < 4) for (const [k, v] of Object.entries(node)) regels.push(vorm(v, diepte + 1, k));
    return regels.join('\n');
  }
  if (typeof node === 'string') {
    const html = /<(p|h2|h3|ul|li)\b/i.test(node);
    const knip = node.length > 120 ? node.slice(0, 120) + '…' : node;
    return `${inspring}${pad}: string(${node.length})${html ? ' [HTML]' : ''} ${JSON.stringify(knip)}`;
  }
  return `${inspring}${pad}: ${typeof node} ${JSON.stringify(node)}`;
}

const start = Date.now();
let r;
try {
  r = await fetch(url, { headers: { accept: 'application/json' } });
} catch (e) {
  console.log(`NIET BEREIKBAAR — ${e.message}`);
  console.log(`url: ${url}`);
  process.exit(1);
}

console.log(`url:     ${url}`);
console.log(`status:  ${r.status} ${r.statusText}`);
console.log(`type:    ${r.headers.get('content-type')}`);
console.log(`tijd:    ${Date.now() - start} ms`);

if (!r.ok) {
  console.log('\nBody (eerste 800 tekens):');
  console.log((await r.text()).slice(0, 800));
  process.exit(1);
}

const body = await r.json();
console.log('\n=== STRUCTUUR ===');
console.log(vorm(body, 0, '(root)'));

console.log('\n=== EERSTE 3000 TEKENS RUW ===');
console.log(JSON.stringify(body, null, 2).slice(0, 3000));

// Meteen door de bestaande adapter halen, zodat zichtbaar is of die het goed raadt.
const { uitApiRespons } = await import('../src/adapter.js');
const velden = uitApiRespons({ iso: code, data: body });
console.log('\n=== WAT DE ADAPTER ERVAN MAAKT ===');
console.log(JSON.stringify({
  land: velden.land, titel: velden.titel, url: velden.url,
  kleurcodes: velden.kleurcodes, htmlLengte: velden.html.length, herkomst: velden.herkomst,
}, null, 2));
console.log('\n=== EERSTE 1500 TEKENS VAN DE GEVONDEN TEKST ===');
console.log(velden.html.slice(0, 1500));
