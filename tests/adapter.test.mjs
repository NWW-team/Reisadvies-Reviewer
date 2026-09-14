import test from 'node:test';
import assert from 'node:assert/strict';
import { uitApiRespons } from '../src/adapter.js';

/**
 * De responsvorm van de open data v2 API is nog niet waargenomen. Deze tests leggen vast dat
 * de adapter tegen verschillende plausibele vormen bestand is en altijd verantwoordt waar hij
 * een veld vandaan haalde. Zodra de echte vorm bekend is hoort daar een fixture bij.
 */

test('platte vorm met content-veld', () => {
  const r = uitApiRespons({
    iso: 'CZE',
    data: { title: 'Reisadvies Tsjechië', url: 'https://www.nederlandwereldwijd.nl/reisadvies/tsjechie',
      country: 'Tsjechië', content: '<h2>In het kort</h2><p>De kleurcode is groen.</p>' },
  });
  assert.equal(r.titel, 'Reisadvies Tsjechië');
  assert.equal(r.land, 'Tsjechië');
  assert.match(r.html, /In het kort/);
  assert.equal(r.herkomst.html[0], 'content');
});

test('genest met meerdere secties houdt alle tekst vast', () => {
  const r = uitApiRespons({
    data: { travelAdvice: { country: 'Frankrijk', sections: [
      { heading: 'In het kort', body: '<p>De kleurcode van het reisadvies voor Frankrijk is geel.</p>' },
      { heading: 'Criminaliteit', body: '<p>Er zijn zakkenrollers in Parijs.</p>' },
    ] } },
  });
  assert.match(r.html, /zakkenrollers/);
  assert.match(r.html, /kleurcode/);
  assert.equal(r.herkomst.html.length, 2);
});

test('kleurcode uit een expliciet veld gaat voor op de lopende tekst', () => {
  const r = uitApiRespons({ data: { colour: 'oranje', content: '<p>Ooit was de kleurcode groen.</p>' } });
  assert.deepEqual(r.kleurcodes, ['oranje']);
  assert.ok(!r.herkomst.kleurcodes[0].startsWith('(afgeleid'));
});

test('kleurcode wordt afgeleid uit de tekst als er geen veld is', () => {
  const r = uitApiRespons({ data: { content: '<p>De kleurcode van het reisadvies is rood.</p>' } });
  assert.deepEqual(r.kleurcodes, ['rood']);
  assert.match(r.herkomst.kleurcodes[0], /afgeleid/);
});

test('zonder herkenbare HTML wordt dat gemeld in plaats van stil geraden', () => {
  const r = uitApiRespons({ data: { omschrijving: 'Een lange platte tekst zonder opmaak. '.repeat(20) } });
  assert.ok(r.html.length > 100);
  assert.match(r.herkomst.html_waarschuwing, /Controleer dit veld/);
});
