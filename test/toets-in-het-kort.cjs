/**
 * "In het kort" heeft twee regels die over de plek gaan, niet over de tekst:
 * de 25 woorden gelden voor de bullet die naar Actueel verwijst (niet voor de rubriek Actueel
 * zelf), en de oproep voor de Informatieservice hoort onderaan het blok.
 */
const assert = require('node:assert');
const { test } = require('node:test');
const laad = require('./harnas.cjs');
const { Parse, Regels, REGELDATA } = laad(require('path').join(__dirname, '..', 'dist', 'app.html'));
const toetser = Regels.maakToetser(REGELDATA);

const INFO = '<div>E-mail ontvangen als het reisadvies wijzigt en bij (dreigende) crisis? '
  + 'Meld u aan voor de Informatieservice</div>';
const LANG = 'Door aanhoudende gevechten tussen gewapende groepen is het in grote delen van het land '
  + 'onrustig en onvoorspelbaar geworden, ook in gebieden die eerder rustig waren. Lees meer onder Actueel.';

const ids = (html) => toetser(Parse.parseAdvies(html, { land: 'Testland' })).bevindingen.map((x) => x.regel);
const bevinding = (html, id) => toetser(Parse.parseAdvies(html, { land: 'Testland' }))
  .bevindingen.find((x) => x.regel === id);

test('de 25 woorden gelden voor de actualiteit bovenaan "In het kort"', () => {
  const html = `<h2>In het kort</h2><ul><li>${LANG}</li></ul>${INFO}`;
  const b = bevinding(html, 'actueel-max-woorden');
  assert.ok(b, 'een actualiteit van meer dan 25 woorden hoort gemeld te worden');
  assert.match(b.boodschap, /actualiteit in "In het kort" telt/);
  assert.ok(b.fragment, 'de bullet hoort aanwijsbaar te zijn in de tekst');
});

test('een actualiteit zonder verwijzing naar Actueel: ook 25 woorden, en een melding over de verwijzing', () => {
  const html = `<h2>In het kort</h2><ul><li>${LANG.replace('Lees meer onder Actueel.', 'Lees meer hieronder.')}</li></ul>${INFO}`;
  assert.ok(ids(html).includes('actueel-max-woorden'));
  const v = bevinding(html, 'kort-actualiteit-verwijzing');
  assert.ok(v);
  assert.strictEqual(v.ernst, Regels.ERNST.letop);
});

test('een actualiteit die naar een andere rubriek verwijst, is een vraag onder let op', () => {
  const html = '<h2>In het kort</h2><ul><li>In de zomer zijn er bosbranden. Lees meer onder Natuurgeweld.</li>'
    + '<li>De kleurcode van het reisadvies voor Testland is geel.</li></ul>' + INFO;
  const v = bevinding(html, 'kort-actualiteit-verwijzing');
  assert.ok(v);
  assert.strictEqual(v.ernst, Regels.ERNST.letop);
  assert.match(v.boodschap, /"Natuurgeweld" in plaats van naar Actueel/);
  assert.match(v.boodschap, /Klopt het/);
});

test('de actualiteit hoort in bullet 1, en er is er maar één', () => {
  const html = '<h2>In het kort</h2><ul>'
    + '<li>Onlangs is in Testland de doodstraf ingevoerd. Lees meer onder Wetten en gebruiken.</li>'
    + '<li>In Testland kunt u zonder reden worden gearresteerd. Lees meer onder Actueel.</li>'
    + '<li>De kleurcode van het reisadvies voor Testland is rood.</li></ul>' + INFO;
  // De bullet die naar Actueel verwijst is de actualiteit; de andere is er een te veel, ook al
  // staat hij bovenaan (Burkina Faso).
  const extra = toetser(Parse.parseAdvies(html, { land: 'Testland' })).bevindingen
    .filter((x) => x.regel === 'kort-een-actualiteit');
  assert.strictEqual(extra.length, 1);
  assert.match(extra[0].fragment, /doodstraf/);
  assert.ok(!ids(html).includes('kort-actualiteit-eerste'), 'alleen een overbodige bullet staat erboven');
  assert.ok(!ids(html).includes('kort-actualiteit-verwijzing'), 'de actualiteit verwijst naar Actueel');

  const laat = '<h2>In het kort</h2><ul><li>De kleurcode van het reisadvies voor Testland is geel.</li>'
    + '<li>Er zijn overstromingen geweest. Lees meer onder Actueel.</li></ul>' + INFO;
  assert.ok(ids(laat).includes('kort-actualiteit-eerste'));

  const goed = '<h2>In het kort</h2><ul><li>Er zijn overstromingen geweest. Lees meer onder Actueel.</li>'
    + '<li>De kleurcode van het reisadvies voor Testland is geel.</li></ul>' + INFO;
  for (const id of ['kort-actualiteit-eerste', 'kort-een-actualiteit', 'kort-actualiteit-verwijzing']) {
    assert.ok(!ids(goed).includes(id), id + ' hoort hier niet af te gaan');
  }
});

test('"voor het grootste deel rood" is een geldige eerste kleurbullet', () => {
  const html = '<h2>In het kort</h2><ul><li>De kleurcode van het reisadvies voor Testland is voor het grootste deel rood.</li></ul>' + INFO;
  const r = toetser(Parse.parseAdvies(html, { land: 'Testland', kleurcodes: ['rood'] })).bevindingen.map((x) => x.regel);
  assert.ok(!r.includes('kleur-aanduiding'));
  assert.ok(!r.includes('kleur-eerste-bullet-voluit'));
});

test('de uitleg onder de kop Actueel mag langer zijn dan 25 woorden', () => {
  const html = `<h2>In het kort</h2><ul><li>Er is onrust. Lees meer onder Actueel.</li></ul>${INFO}`
    + `<h2>Welke veiligheidsrisico's zijn er in Testland?</h2><h3>Actueel</h3><p>${LANG}</p>`;
  assert.ok(!ids(html).includes('actueel-max-woorden'),
    'de rubriek Actueel zelf kent deze limiet niet; die hoort bij de bullet in "In het kort"');
});

test('de Informatieservice hoort onderaan "In het kort"', () => {
  const boven = `<h2>In het kort</h2>${INFO}<ul><li>De kleurcode van het reisadvies voor Testland is groen.</li></ul>`;
  const b = bevinding(boven, 'kort-informatieservice-onderaan');
  assert.ok(b, 'staat de oproep boven de bullets, dan hoort dat gemeld te worden');
  assert.ok(b.fragment, 'de zin hoort aanwijsbaar te zijn in de tekst');

  const onder = `<h2>In het kort</h2><ul><li>De kleurcode van het reisadvies voor Testland is groen.</li></ul>${INFO}`;
  assert.ok(!ids(onder).includes('kort-informatieservice-onderaan'),
    'onderaan is precies waar hij hoort');
});

test('de Informatieservice buiten "In het kort" wordt ook gemeld', () => {
  const elders = '<h2>In het kort</h2><ul><li>De kleurcode van het reisadvies voor Testland is groen.</li></ul>'
    + `<h2>Ook nuttig</h2>${INFO}`;
  const b = bevinding(elders, 'kort-informatieservice-onderaan');
  assert.ok(b, 'de oproep hoort in "In het kort", niet ergens anders');
  assert.match(b.boodschap, /niet in "In het kort"/);
});

test('"In het kort" is geen introductie', () => {
  // Zonder opmaak geplakt wordt het hele blok één alinea, op de plek van het introveld.
  const geplakt = 'In het kort Vanaf 15 september 2026 wordt de visumvrije periode verkort van 60 naar '
    + '30 dagen. De kleurcode is rood voor de strook van 5 kilometer vanaf de grens met Cambodja. '
    + 'Het is er te gevaarlijk.';
  const gemeld = ids(geplakt).filter((x) => x.startsWith('intro'));
  assert.deepStrictEqual(gemeld.join(', '), '',
    'de intro staat vóór "In het kort" en heeft een eigen vaste tekst; dit blok is de intro niet');
});

test('een echte intro wordt wel getoetst', () => {
  const advies = '<p>Reist u naar Testland? Dit is niet de vaste introductietekst.</p>'
    + '<h2>In het kort</h2><ul><li>De kleurcode van het reisadvies voor Testland is groen.</li></ul>';
  const b = bevinding(advies, 'intro-vaste-tekst');
  assert.ok(b, 'een afwijkende introductietekst hoort gemeld te worden');
  assert.match(b.verwacht, /Reist u naar Testland\?/);
});

test('een vervolgbullet die met "Kleurcode" begint, wordt gemeld; de vorm uit de matrix niet', () => {
  const kort = (b2) => '<h2>In het kort</h2><ul><li>De kleurcode van het reisadvies voor Testland is geel. '
    + 'U kunt hierheen reizen.</li><li>' + b2 + '</li></ul>' + INFO;
  const r = (html) => toetser(Parse.parseAdvies(html, { land: 'Testland', kleurcodes: ['oranje', 'geel'] }))
    .bevindingen.filter((x) => x.regel === 'kleur-vervolg-bullet-kort');
  const omgedraaid = r(kort('Kleurcode oranje geldt voor het noorden. Reis alleen hierheen als het noodzakelijk is.'));
  assert.strictEqual(omgedraaid.length, 1);
  assert.match(omgedraaid[0].boodschap, /begint met "Kleurcode"/);
  assert.strictEqual(r(kort('Voor het noorden geldt kleurcode oranje. Reis alleen hierheen als het noodzakelijk is.')).length, 0);
  // Bij een opsomming van meer dan twee gebieden mag de kleur vooraan.
  assert.strictEqual(r(kort('Kleurcode oranje geldt voor de regio Nord, de regio Adamaoua en de provincie Est. '
    + 'Reis alleen hierheen als het noodzakelijk is.')).length, 0);
  // "Tussen A en B" is één gebied: dan hoort de vorm uit de matrix.
  assert.strictEqual(r(kort('Kleurcode oranje geldt voor het grensgebied tussen Testland en Buurland. '
    + 'Reis alleen hierheen als het noodzakelijk is.')).length, 1);
});
