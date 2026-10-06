import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseAdvies } from '../src/parse.js';

const koppen = JSON.parse(readFileSync(new URL('../regels/koppen-plat.json', import.meta.url), 'utf8')).koppen;

// Zo komt een advies binnen als je het van de site kopieert en als platte tekst plakt: elke kop,
// bullet en alinea op een eigen regel, geen lege regels, geen bullettekens, en het label
// "Let op:" van de site tegen de eerste zin aan.
const BURKINA = [
  'In het kort',
  'In Burkina Faso kunt u zonder duidelijke reden worden gearresteerd. Lees meer onder Actueel.',
  'De kleurcode van het reisadvies voor Burkina Faso is voor het grootste deel rood. Wat uw situatie ook is: reis er niet heen. Het is er te gevaarlijk. Lees meer onder Regionale risico’s.',
  'Voor de steden Ouagadougou en Bobo-Dioulasso geldt kleurcode oranje. Reis alleen hierheen als het noodzakelijk is. Het is niet veilig er op vakantie te gaan.',
  'Let op:E-mail ontvangen als het reisadvies wijzigt en bij (dreigende) crisis? Meld u aan voor de Informatieservice',
  'Welke veiligheidsrisico’s zijn er in Burkina Faso?',
  'Regionale risico’s',
  'Rood: niet reizen',
  'Wat uw situatie ook is: reis niet naar gebieden met kleurcode rood.',
].join('\n');

test('platte tekst: bekende koppen worden weer koppen, op hun eigen niveau', () => {
  const doc = parseAdvies(BURKINA, { koppen });
  assert.deepEqual(doc.koppen.map((k) => [k.niveau, k.tekst]), [
    [2, 'In het kort'],
    [2, 'Welke veiligheidsrisico’s zijn er in Burkina Faso?'],
    [3, 'Regionale risico’s'],
    [4, 'Rood: niet reizen'],
  ]);
});

test('platte tekst: onder "In het kort" zijn de regels bullets, de Informatieservice niet', () => {
  const kort = parseAdvies(BURKINA, { koppen }).blokken.find((b) => b.kop === 'In het kort');
  assert.equal(kort.opsommingen.length, 1);
  assert.equal(kort.opsommingen[0].items.length, 3);
  assert.equal(kort.alineas.length, 1);
  // Het label van de site hoort niet bij de tekst.
  assert.match(kort.alineas[0].tekst, /^E-mail ontvangen/);
});

test('platte tekst: zonder koppenlijst wordt niets een kop', () => {
  assert.equal(parseAdvies(BURKINA).koppen.length, 0);
});

test('platte tekst: een afgebroken regel hoort bij dezelfde alinea', () => {
  const doc = parseAdvies('Dit is een zin die\nhalverwege is afgebroken.\nDit is een nieuwe alinea.', { koppen });
  assert.deepEqual(doc.alineas.map((a) => a.tekst),
    ['Dit is een zin die halverwege is afgebroken.', 'Dit is een nieuwe alinea.']);
});

test('platte tekst: een regel met een bulletteken is een bullet, ook buiten "In het kort"', () => {
  const doc = parseAdvies('Criminaliteit\nLet hierop:\n• uw tas\n• uw telefoon', { koppen });
  const blok = doc.blokken.find((b) => b.kop === 'Criminaliteit');
  assert.deepEqual(blok.opsommingen[0].items, ['uw tas', 'uw telefoon']);
});
