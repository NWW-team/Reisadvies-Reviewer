/**
 * De ernst van een bevinding is een soort, geen rangorde: hij bepaalt welke kleur de redacteur
 * ziet en in welke volgorde hij de lijst afloopt. Deze toets legt de indeling vast die daarbij
 * hoort, plus de uitzondering voor telefoonnummers bij de getallenregel.
 */
const assert = require('node:assert');
const { test } = require('node:test');
const laad = require('./harnas.cjs');
const { Parse, Regels, REGELDATA } = laad(require('path').join(__dirname, '..', 'dist', 'app.html'));
const toetser = Regels.maakToetser(REGELDATA);

const bevindingen = (html) => toetser(Parse.parseAdvies(html, { land: 'Testland' })).bevindingen;
const eerste = (html, id) => bevindingen(html).find((x) => x.regel === id);

const LANGE_ZIN = 'De autoriteiten van Testland kunnen bij onrust besluiten om wegen af te sluiten '
  + 'en het openbaar vervoer in de hoofdstad stil te leggen.';

test('een zin zonder link mag 15 woorden, met link 20, en de taaltoevoeging telt niet mee', () => {
  const zonder = eerste(`<p>${LANGE_ZIN}</p>`, 'zin-max-woorden');
  assert.ok(zonder);
  assert.strictEqual(zonder.ernst, Regels.ERNST.letop);

  // 18 woorden met een link: binnen de 20.
  const kort = `<p>De autoriteiten van Testland kunnen bij onrust besluiten om wegen af te sluiten, `
    + `<a href="https://www.nederlandwereldwijd.nl/">lees meer over de gevolgen</a>.</p>`;
  assert.strictEqual(eerste(kort, 'zin-max-woorden'), undefined);

  // 24 woorden met een link: te lang.
  const lang = `<p>De autoriteiten van Testland kunnen bij onrust in de hoofdstad besluiten om alle wegen `
    + `af te sluiten, <a href="https://www.nederlandwereldwijd.nl/">lees meer over de gevolgen voor reizigers</a>.</p>`;
  const b = eerste(lang, 'zin-max-woorden');
  assert.ok(b);
  assert.match(b.boodschap, /met link telt 24 woorden\. Maximaal 20/);

  // 20 woorden plus "(informatie in het Engels)": de toevoeging telt niet mee.
  const engels = `<p>Lees meer over de regels voor het meenemen van medicijnen en andere producten `
    + `<a href="https://example.org/">op de website van de douane</a> (informatie in het Engels).</p>`;
  assert.strictEqual(eerste(engels, 'zin-max-woorden'), undefined);
});

test('ook zinnen in bullets worden getoetst, behalve sjabloonzinnen en de Actueel-bullet', () => {
  const html = '<h2>In het kort</h2><ul><li>De situatie in Testland is onrustig door hevige gevechten tussen het leger '
    + 'en rebellen in het noorden. Lees meer onder Actueel.</li></ul>'
    + '<h3>Natuurgeweld</h3><ul>'
    + `<li>${LANGE_ZIN}</li>`
    + '<li>Neem contact op met de lokale autoriteiten, uw hotel of reisorganisatie als u een vraag heeft over de actuele situatie.</li>'
    + '</ul>';
  const lang = bevindingen(html).filter((x) => x.regel === 'zin-max-woorden');
  assert.strictEqual(lang.length, 1, 'alleen de eigen lange zin in de bullet');
  assert.strictEqual(lang[0].fragment, LANGE_ZIN);
});

test('de oude contactzin met "uw hotel" wijkt af van het sjabloon, de nieuwe niet', () => {
  const blok = (z) => '<h2>Welke veiligheidsrisico\'s zijn er in Testland?</h2><h3>Natuurgeweld</h3><ul><li>' + z + '</li></ul>';
  const oud = bevindingen(blok('Neem contact op met de lokale autoriteiten, uw hotel of reisorganisatie als u een vraag heeft over de actuele situatie.'));
  const melding = oud.find((x) => x.regel === 'natuurgeweld-contact');
  assert.ok(melding);
  assert.match(melding.verwacht, /uw accommodatie/);
  assert.ok(melding.fragment, 'de zin die er staat hoort aanwijsbaar te zijn');
  assert.ok(!oud.some((x) => x.regel === 'zin-max-woorden'), 'geen tweede melding over de lengte');
  const nieuw = bevindingen(blok('Neem contact op met de lokale autoriteiten, uw accommodatie of reisorganisatie als u een vraag heeft over de actuele situatie.'));
  assert.ok(!nieuw.some((x) => x.regel === 'natuurgeweld-contact' || x.regel === 'zin-max-woorden'));
});

test('twijfeltaal is ter overweging', () => {
  const b = eerste('<p>Het is misschien verstandig om contant geld mee te nemen.</p>', 'zin-twijfeltaal');
  assert.ok(b);
  assert.strictEqual(b.ernst, Regels.ERNST.info);
});

test('twijfeltaal uit een voorbeeldzin van het sjabloon wordt niet gemeld', () => {
  const b = bevindingen('<p>In Testland zijn regelmatig demonstraties, vooral in de grotere steden.</p>'
    + '<p>Heeft u geen bewijs van vaccinatie tegen gele koorts? Dan komt u mogelijk het land niet in.</p>');
  assert.strictEqual(b.filter((x) => x.regel === 'zin-frequentiewoord' || x.regel === 'zin-twijfeltaal').length, 0);
  // Buiten de voorbeeldzin blijft hetzelfde woord gewoon gemeld.
  assert.ok(eerste('<p>Er vallen regelmatig stroomstoringen in Testland.</p>', 'zin-frequentiewoord'));
});

test('elke ernst die een regel geeft staat in de vaste volgorde', () => {
  for (const soort of Object.values(Regels.ERNST)) {
    assert.ok(Regels.ERNST_VOLGORDE.includes(soort), `${soort} ontbreekt in ERNST_VOLGORDE`);
  }
  assert.strictEqual(Regels.ERNST_VOLGORDE[0], Regels.ERNST.fout, 'een echte fout staat bovenaan');
});

test('een telefoonnummer is geen groot getal', () => {
  const nood = '<h2>Wat kan ik doen in een noodsituatie?</h2><h3>In geval van nood</h3>'
    + '<ul><li>Algemeen alarmnummer: 191</li><li>(Toeristen)politie: 1155</li>'
    + '<li>Medische bereikbaarheidsdienst: 116117</li></ul>';
  // strictEqual op de lengte, niet deepStrictEqual op de array: het harnas draait de pagina in
  // een vm-context, dus arrays van daar hebben een ander Array-prototype.
  const b = bevindingen(nood).filter((x) => x.regel === 'getallen-cijfers');
  assert.strictEqual(b.length, 0,
    'alarm- en servicenummers krijgen geen duizendtalpunt, maar gemeld werd: '
      + b.map((x) => x.boodschap).join(' / '));
});

test('een echt groot getal wordt nog steeds gemeld', () => {
  const b = eerste('<p>In de hoofdstad wonen 4500 Nederlanders.</p>', 'getallen-cijfers');
  assert.ok(b, 'buiten een nummerlijst geldt de schrijfregel gewoon');
  assert.match(b.boodschap, /4\.500/);
});
