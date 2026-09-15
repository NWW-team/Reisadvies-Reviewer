import test from 'node:test';
import assert from 'node:assert/strict';
import { advies, idsVan, bevindingenVan, regeldata } from './helpers.mjs';

/**
 * De regels uit "Sjabloon Reisadviezen - nieuwe format.docx".
 *
 * Deze regels toetsen letterlijke teksten. De tool meldt alleen dát een vaste tekst ontbreekt en
 * toont de verwachte formulering; invullen blijft aan de redacteur, want welke variant klopt
 * hangt van het land af. Elke regel heeft daarom een fixture die faalt en een die slaagt.
 */

const SJ = regeldata.sjabloon;

/** Een advies met een introveld ervóór, zoals het cms het aanlevert (veld-0). */
function metIntro(intro, binnenwerk = '') {
  return '<p>' + intro + '</p>' + advies(binnenwerk);
}

// ---------- In het kort ----------

test('kort-max-bullets — meer dan 4 bullets', () => {
  const bullets = ['<li>een</li>', '<li>twee</li>', '<li>drie</li>', '<li>vier</li>', '<li>vijf</li>'].join('');
  const html = '<h2>In het kort</h2><ul>' + bullets + '</ul><p>Meld u aan voor de Informatieservice.</p>';
  assert.ok(idsVan(html, { land: 'Tsjechië' }).includes('kort-max-bullets'));
});

test('kort-max-bullets — vier bullets is toegestaan', () => {
  const bullets = ['<li>een</li>', '<li>twee</li>', '<li>drie</li>', '<li>vier</li>'].join('');
  const html = '<h2>In het kort</h2><ul>' + bullets + '</ul><p>Meld u aan voor de Informatieservice.</p>';
  assert.ok(!idsVan(html, { land: 'Tsjechië' }).includes('kort-max-bullets'));
});

// ---------- kleurformulering ----------

test('kleur-formulering-verboden — "gele gebieden"', () => {
  const b = bevindingenVan(advies('<p>Reis niet naar de gele gebieden.</p>'), { land: 'Tsjechië' })
    .filter((x) => x.regel === 'kleur-formulering-verboden');
  assert.ok(b.length >= 1);
  assert.match(b[0].verwacht, /gebieden met kleurcode geel/);
});

test('kleur-formulering-verboden — "de hoofdstad is oranje"', () => {
  const ids = idsVan(advies('<p>De hoofdstad is oranje.</p>'), { land: 'Tsjechië' });
  assert.ok(ids.includes('kleur-formulering-verboden'));
});

test('kleur-formulering-verboden — de juiste formulering gaat vrijuit', () => {
  const ids = idsVan(advies('<p>Reis niet naar gebieden met kleurcode geel.</p>'), { land: 'Tsjechië' });
  assert.ok(!ids.includes('kleur-formulering-verboden'));
});

test('kleur-formulering-verboden — de vaste kleurcodezin gaat vrijuit', () => {
  // "De kleurcode van het reisadvies voor Spanje is groen" is juist: het woord kleurcode staat er.
  const ids = idsVan(advies('<p>De kleurcode van het reisadvies voor Spanje is groen.</p>'), { land: 'Spanje' });
  assert.ok(!ids.includes('kleur-formulering-verboden'));
});

// ---------- introductie (veld-0) ----------

test('intro-vaste-tekst — een eigen intro wijkt af', () => {
  const ids = idsVan(metIntro('Tsjechië is een mooi land om te bezoeken.'), { land: 'Tsjechië' });
  assert.ok(ids.includes('intro-vaste-tekst'));
});

test('intro-vaste-tekst — de standaardintro gaat vrijuit', () => {
  const intro = SJ.intro.standaard.replace('{land}', 'Tsjechië');
  const ids = idsVan(metIntro(intro), { land: 'Tsjechië' });
  assert.ok(!ids.includes('intro-vaste-tekst'));
});

test('intro-vaste-tekst — bij alleen rood geldt de afwijkende intro', () => {
  const rood = regeldata.kleurcodes.kleuren.rood.in_het_kort_volledig.replace('{land}', 'Mali');
  const standaard = SJ.intro.standaard.replace('{land}', 'Mali');
  const html = '<p>' + standaard + '</p><h2>In het kort</h2><ul><li>' + rood
    + '</li></ul><p>Meld u aan voor de Informatieservice.</p>';
  const b = bevindingenVan(html, { land: 'Mali' }).filter((x) => x.regel === 'intro-vaste-tekst');
  assert.equal(b.length, 1, 'verwachtte een melding over de rood-variant');
  assert.match(b[0].verwacht, /Lees het reisadvies/);
});

// ---------- rubrieken ----------

const veiligheidsH2 = "<h2>Welke veiligheidsrisico's zijn er in Tsjechië?</h2>";

test('rubrieken-max — meer dan 6 rubrieken', () => {
  const koppen = ['Terrorisme', 'Criminaliteit', 'Wetten en gebruiken', 'Natuurgeweld',
    'Landmijnen', 'Demonstraties', 'Verkeersongevallen']
    .map((k) => '<h3>' + k + '</h3><p>Tekst.</p>').join('');
  const ids = idsVan(advies(veiligheidsH2 + koppen), { land: 'Tsjechië' });
  assert.ok(ids.includes('rubrieken-max'));
});

test('rubrieken-max — zes rubrieken is toegestaan', () => {
  const koppen = ['Terrorisme', 'Criminaliteit', 'Wetten en gebruiken', 'Natuurgeweld',
    'Landmijnen', 'Demonstraties']
    .map((k) => '<h3>' + k + '</h3><p>Tekst.</p>').join('');
  const ids = idsVan(advies(veiligheidsH2 + koppen), { land: 'Tsjechië' });
  assert.ok(!ids.includes('rubrieken-max'));
});

test('rubrieken-volgorde — Criminaliteit vóór Terrorisme', () => {
  const html = advies(veiligheidsH2 + '<h3>Criminaliteit</h3><p>Tekst.</p><h3>Terrorisme</h3><p>Tekst.</p>');
  const b = bevindingenVan(html, { land: 'Tsjechië' }).filter((x) => x.regel === 'rubrieken-volgorde');
  assert.equal(b.length, 1);
  assert.match(b[0].boodschap, /Terrorisme.*na.*Criminaliteit/);
});

test('rubrieken-volgorde — de voorgeschreven volgorde gaat vrijuit', () => {
  const html = advies(veiligheidsH2 + '<h3>Terrorisme</h3><p>Tekst.</p><h3>Criminaliteit</h3><p>Tekst.</p>');
  assert.ok(!idsVan(html, { land: 'Tsjechië' }).includes('rubrieken-volgorde'));
});

test('rubrieken-volgorde — een rubriek met variabele naam verstoort de volgorde niet', () => {
  // Een ziekterubriek heet naar het virus en heeft geen vaste plek in de lijst.
  const html = advies(veiligheidsH2 + '<h3>Terrorisme</h3><p>Tekst.</p><h3>Denguekoorts</h3><p>Tekst.</p>'
    + '<h3>Criminaliteit</h3><p>Tekst.</p>');
  assert.ok(!idsVan(html, { land: 'Tsjechië' }).includes('rubrieken-volgorde'));
});

// ---------- noodsituatie ----------

const noodH2 = '<h2>Wat kan ik doen in een noodsituatie?</h2><h3>In geval van nood</h3>';

test('nood-contactnummer — een ander Nederlands nummer', () => {
  const html = advies(noodH2 + '<p>Bel de ambassade op +31 70 348 6486 voor hulp.</p>');
  const b = bevindingenVan(html, { land: 'Tsjechië' }).filter((x) => x.regel === 'nood-contactnummer');
  assert.equal(b.length, 1);
  assert.equal(b[0].ernst, 'fout');
  assert.match(b[0].verwacht, /\+31 247 247 247/);
});

test('nood-contactnummer — de vaste nummers gaan vrijuit', () => {
  const html = advies(noodH2 + '<p>Bereikbaar via het contactcenter van NederlandWereldwijd op '
    + 'telefoonnummer +31 247 247 247 of via WhatsApp: +31 857 737 400.</p>');
  assert.ok(!idsVan(html, { land: 'Tsjechië' }).includes('nood-contactnummer'));
});

test('nood-contactcenter — de vaste tekst ontbreekt', () => {
  const html = advies(noodH2 + '<p>Neem contact op met de ambassade.</p>');
  assert.ok(idsVan(html, { land: 'Tsjechië' }).includes('nood-contactcenter'));
});

test('vaste teksten worden niet getoetst als de rubriek er niet in staat', () => {
  // Zonder noodrubriek mag er geen enkele nood-bevinding zijn: de tool verwijt een advies niet
  // dat een tekst ontbreekt in een blok dat er helemaal niet is.
  const ids = idsVan(advies('<p>Een advies zonder noodrubriek.</p>'), { land: 'Tsjechië' });
  assert.ok(!ids.some((x) => x.startsWith('nood-')));
});

// ---------- overige vaste teksten ----------

test('reisverzekering-oranje-rood — waarschuwing ontbreekt bij oranje', () => {
  const oranje = regeldata.kleurcodes.kleuren.oranje.in_het_kort_volledig.replace('{land}', 'Mali');
  const html = '<h2>In het kort</h2><ul><li>' + oranje + '</li></ul>'
    + '<p>Meld u aan voor de Informatieservice.</p>'
    + '<h2>Hoe bereid ik mijn reis naar Mali voor?</h2><h3>Reisverzekering</h3>'
    + '<p>Sluit altijd een goede reisverzekering af die extra kosten dekt.</p>';
  const b = bevindingenVan(html, { land: 'Mali' }).filter((x) => x.regel === 'reisverzekering-oranje-rood');
  assert.equal(b.length, 1);
  assert.equal(b[0].ernst, 'fout');
});

test('reisverzekering-oranje-rood — niet van toepassing bij groen', () => {
  const html = advies('<h3>Reisverzekering</h3><p>Sluit altijd een goede reisverzekering af die extra kosten dekt.</p>');
  assert.ok(!idsVan(html, { land: 'Tsjechië' }).includes('reisverzekering-oranje-rood'));
});

test('lhbtiq-verwijzing — alleen waar lhbtiq+ aan de orde komt', () => {
  const zonder = idsVan(advies('<p>Er zijn strenge drugswetten.</p>'), { land: 'Tsjechië' });
  assert.ok(!zonder.includes('lhbtiq-verwijzing'));

  const met = idsVan(advies('<p>Bent u een lhbtiq+ persoon? Houd rekening met discriminatie.</p>'), { land: 'Tsjechië' });
  assert.ok(met.includes('lhbtiq-verwijzing'));
});

test('vaccinaties-ggd — verwijzing ontbreekt', () => {
  const html = advies('<h3>Reisvaccinaties</h3><p>U heeft geen vaccinaties nodig.</p>');
  assert.ok(idsVan(html, { land: 'Tsjechië' }).includes('vaccinaties-ggd'));
});

test('vaccinaties-ggd — verwijzing aanwezig', () => {
  const html = advies('<h3>Reisvaccinaties</h3><p>Check welke vaccinaties u nodig heeft voor Tsjechië '
    + 'op de website van GGD Reisvaccinaties.</p>');
  assert.ok(!idsVan(html, { land: 'Tsjechië' }).includes('vaccinaties-ggd'));
});

// ---------- botsing tussen de bronnen ----------

test('Geldzaken: matrix en sjabloon spreken elkaar tegen, dus let op in plaats van fout', () => {
  const b = bevindingenVan(advies('<h3>Geldzaken</h3><p>Pinnen is niet mogelijk.</p>'), { land: 'Tsjechië' })
    .filter((x) => x.regel === 'h3-niet-melden');
  assert.equal(b.length, 1);
  assert.equal(b[0].ernst, 'let-op', 'bij een botsing tussen de bronnen hoort geen harde fout');
  assert.match(b[0].boodschap, /matrix zegt/);
  assert.match(b[0].boodschap, /sjabloon zegt/);
});

test('een onderwerp zonder botsing blijft een fout', () => {
  const b = bevindingenVan(advies('<h3>Wilde dieren</h3><p>Er zijn beren.</p>'), { land: 'Tsjechië' })
    .filter((x) => x.regel === 'h3-niet-melden');
  assert.equal(b.length, 1);
  assert.equal(b[0].ernst, 'fout');
});

// ---------- vaste koppen ----------

test('koppen die het sjabloon voorschrijft worden niet op lengte getoetst', () => {
  const ids = idsVan(advies('<h3>Contactgegevens Nederlandse ambassade in geval van nood</h3><p>Tekst.</p>'),
    { land: 'Tsjechië' });
  assert.ok(!ids.includes('tussenkop-max-woorden'));
});

test('elke sjabloonregel staat in HERKOMST.md', async () => {
  const { readFileSync } = await import('node:fs');
  const herkomst = readFileSync(new URL('../regels/HERKOMST.md', import.meta.url), 'utf8');
  for (const vt of SJ.vaste_teksten) {
    assert.ok(herkomst.includes('`' + vt.id + '`'), `${vt.id} ontbreekt in HERKOMST.md`);
  }
});
