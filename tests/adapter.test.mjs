import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { uitApiRespons } from '../src/adapter.js';
import { parseAdvies } from '../src/parse.js';

/**
 * Getoetst tegen een echte respons van de open data v2 API (data/voorbeeld/CZE.xml),
 * opgehaald door de probe-workflow. De API levert XML met de HTML in CDATA-blokken.
 */
const CZE = readFileSync(new URL('../data/voorbeeld/CZE.xml', import.meta.url), 'utf8');

test('de kopvelden komen uit de juiste XML-elementen', () => {
  const v = uitApiRespons(CZE);
  assert.equal(v.land, 'Tsjechië');
  assert.equal(v.isocode, 'CZE');
  assert.equal(v.locationKey, 'tsjechie');
  assert.equal(v.url, 'https://www.nederlandwereldwijd.nl/reisadvies/tsjechie');
});

test('de titel wordt losgeknipt van de ministerienaam', () => {
  assert.equal(uitApiRespons(CZE).titel, 'Reisadvies Tsjechië');
});

test('categorieën worden h2 en contentblocks worden h3', () => {
  const doc = parseAdvies(uitApiRespons(CZE).html);
  const h2 = doc.koppen.filter((k) => k.niveau === 2).map((k) => k.tekst);
  const h3 = doc.koppen.filter((k) => k.niveau === 3).map((k) => k.tekst);
  assert.ok(h2.includes('In het kort'));
  assert.ok(h2.includes("Welke veiligheidsrisico's zijn er in Tsjechië?"));
  assert.ok(h3.includes('Criminaliteit'));
  assert.ok(h3.includes('Reisverzekering'));
});

test('de inhoud van de paragrafen blijft behouden', () => {
  const doc = parseAdvies(uitApiRespons(CZE).html);
  assert.ok(doc.woorden > 800, `verwachtte een volledig advies, kreeg ${doc.woorden} woorden`);
  assert.match(doc.volledigeTekst, /zakkenrollers/);
});

test('de kleurcode wordt uit de vaste formulering gehaald', () => {
  assert.deepEqual(uitApiRespons(CZE).kleurcodes, ['groen']);
});

test('links uit de CDATA-blokken komen mee', () => {
  const doc = parseAdvies(uitApiRespons(CZE).html);
  assert.ok(doc.links.length > 3, `verwachtte links, kreeg er ${doc.links.length}`);
  assert.ok(doc.links.some((l) => /informatieservice/i.test(l.href || '')));
});

test('een niet-XML invoer wordt geweigerd in plaats van stil verkeerd gelezen', () => {
  assert.throws(() => uitApiRespons({ data: 'geen string' }), TypeError);
});
