import test from 'node:test';
import assert from 'node:assert/strict';
import { advies, idsVan, toetsVan } from './helpers.mjs';

test('een regelconform advies levert geen fouten op', () => {
  const html = advies('<h2>Veiligheidsrisico’s</h2><h3>Criminaliteit</h3>'
    + '<p>In Praag zijn zakkenrollers actief. Let op uw tas in het openbaar vervoer.</p>');
  const r = toetsVan(html, { land: 'Tsjechië' });
  assert.equal(r.samenvatting.fout, 0, 'onverwachte fouten: '
    + JSON.stringify(r.bevindingen.filter((x) => x.ernst === 'fout'), null, 1));
});

test('de vaste kleurcodetekst zelf wordt niet als te lange zin gemeld', () => {
  const html = advies('', { kleur: 'oranje' });
  assert.ok(!idsVan(html, { land: 'Tsjechië' }).includes('zin-max-woorden'));
});

test('het buiten-scope-voorbehoud staat altijd in de uitkomst', () => {
  const r = toetsVan(advies(''), { land: 'Tsjechië' });
  assert.equal(r.buitenScope.length, 2);
  assert.match(r.buitenScope[0], /politieke gevoeligheden/i);
  assert.match(r.buitenScope[1], /schrapt niet/i);
});
