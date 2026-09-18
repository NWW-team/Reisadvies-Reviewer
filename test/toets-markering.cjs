/**
 * Een bevinding over een vaste tekst uit het sjabloon moet de plek in het advies kunnen
 * aanwijzen zodra die tekst er wél staat maar afwijkt. Zonder fragment kan de pagina de zin
 * niet markeren, en dan ziet de redacteur alleen de melding en niet waar hij over gaat.
 */
const assert = require('node:assert');
const { test } = require('node:test');
const laad = require('./harnas.cjs');
const { Parse, Regels, REGELDATA } = laad(require('path').join(__dirname, '..', 'dist', 'app.html'));
const toetser = Regels.maakToetser(REGELDATA);

const AFWIJKEND = 'Sluit altijd een goede reisverzekering af die de extra kosten dekt van '
  + 'bijvoorbeeld ziekenhuisopname, of als u naar Nederland moet worden vervoerd (repatriëring).';

function advies(reisverzekering) {
  return `<p>Reist u naar Testland?</p>
<h2>Hoe bereid ik mijn reis naar Testland voor?</h2>
<h3>Reisverzekering</h3>
<p>${reisverzekering}</p>`;
}

function bevindingVoor(html, id) {
  const doc = Parse.parseAdvies(html, { land: 'Testland' });
  return { doc, bev: toetser(doc).bevindingen.find((x) => x.regel === id) };
}

/** Alles wat de pagina als losse zin of als opsommingsitem toont; daarop slaat de markering aan. */
function eenheden(doc) {
  return doc.blokken.flatMap((b) => [
    ...b.alineas.flatMap((a) => a.zinnen),
    ...b.opsommingen.flatMap((o) => o.items),
  ]);
}

test('een afwijkende vaste tekst wijst de zin aan waar hij staat', () => {
  const { doc, bev } = bevindingVoor(advies(AFWIJKEND), 'reisverzekering-vaste-tekst');
  assert.ok(bev, 'de afwijkende openingstekst hoort gemeld te worden');
  assert.match(bev.boodschap, /wijkt af/);
  assert.ok(bev.fragment, 'zonder fragment kan de pagina de zin niet markeren');
  assert.ok(eenheden(doc).includes(bev.fragment),
    'het fragment moet letterlijk een zin of opsommingsitem uit het advies zijn, anders vindt de markering hem niet');
  assert.match(bev.fragment, /sluit altijd een goede reisverzekering af/i);
});

test('een ontbrekende vaste tekst heeft niets om aan te wijzen', () => {
  const { bev } = bevindingVoor(advies('Regel iets voor uw reis.'), 'reisverzekering-vaste-tekst');
  assert.ok(bev, 'ook het ontbreken hoort gemeld te worden');
  assert.match(bev.boodschap, /ontbreekt/);
  assert.strictEqual(bev.fragment, undefined,
    'staat de tekst er niet, dan is er geen zin om te markeren en hoort het fragment weg te blijven');
  assert.ok(bev.verwacht, 'de verwachte formulering hoort er wel bij te staan');
});
