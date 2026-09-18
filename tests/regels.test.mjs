import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { advies, idsVan, bevindingenVan, regeldata,
  idsVanMetSpelling, bevindingenMetSpelling } from './helpers.mjs';
import { ERNST_VOLGORDE } from '../src/regels.js';

/**
 * Per regel één fragment dat de regel moet laten afgaan en één dat dat niet mag.
 * Zo blijft zichtbaar dat een regel echt iets toetst en niet altijd (of nooit) aanslaat.
 */
const gevallen = [
  {
    regel: 'doc-woordenaantal',
    faalt: '<p>' + ('woord '.repeat(1600)) + '</p>',
    slaagt: '<p>Een kort reisadvies met weinig woorden.</p>',
  },
  {
    regel: 'kleur-vaste-tekst',
    faalt: '<h2>In het kort</h2><ul><li>Tsjechië heeft kleurcode groen, ga gerust.</li></ul>',
    slaagt: null, // gedekt door schoon.test.mjs
  },
  {
    regel: 'h3-niet-melden',
    faalt: "<h2>Veiligheidsrisico’s</h2><h3>Wilde dieren</h3><p>Er zijn beren.</p>",
    slaagt: "<h2>Veiligheidsrisico’s</h2><h3>Criminaliteit</h3><p>Er zijn zakkenrollers.</p>",
  },
  {
    // Bij een kleurcode geldt de kleur voor het hele land: dan hoort de volledige uitleg in
    // "In het kort". De verkorte variant is voor een advies met meer dan een kleurcode.
    regel: 'kleur-variant',
    faalt: '<h2>In het kort</h2><ul><li>De kleurcode van het reisadvies voor Tsjechi\u00eb is groen. '
      + 'U kunt hierheen reizen. Lees welke veiligheidsrisico&#39;s er zijn.</li></ul>',
    slaagt: null, // gedekt door schoon.test.mjs
  },
  {
    // Bij meerdere kleurcodes staat de volledige uitleg onder Regionale risico&#39;s, onder een vast
    // kopje per kleur.
    regel: 'regionaal-kleur-kop',
    faalt: '<h2>In het kort</h2><ul>'
      + '<li>De kleurcode van het reisadvies is oranje voor het noorden. Reis alleen hierheen als het '
      + 'noodzakelijk is. Het is niet veilig er op vakantie te gaan.</li>'
      + '<li>Voor de rest van Tsjechi\u00eb geldt kleurcode groen. U kunt hierheen reizen. '
      + 'Lees welke veiligheidsrisico&#39;s er zijn.</li>'
      + '<li>Lees meer onder Regionale risico&#39;s.</li></ul>'
      + "<h2>Welke veiligheidsrisico&#39;s zijn er in Tsjechi\u00eb?</h2><h3>Regionale risico&#39;s</h3>"
      + '<h4>Oranje: hier niet heen</h4><p>Reis alleen naar gebieden met kleurcode oranje als dit '
      + 'noodzakelijk is. Bijvoorbeeld voor de uitvaart van een familielid. Of als u er dringend heen '
      + 'moet voor uw werk. Het is niet veilig er op vakantie te gaan. De Nederlandse ambassade kan u '
      + 'minder goed helpen als u in de problemen komt.</p>'
      + '<h4>Groen: u kunt erheen reizen</h4><p>U kunt reizen naar gebieden met kleurcode groen. '
      + 'Lees welke veiligheidsrisico&#39;s er zijn.</p>',
    slaagt: null,
    meta: { kleurcodes: ['oranje', 'groen'] },
  },
  {
    // En onder dat kopje hoort de volledige uitleg voor die kleur.
    regel: 'regionaal-kleur-tekst',
    faalt: '<h2>In het kort</h2><ul>'
      + '<li>De kleurcode van het reisadvies is oranje voor het noorden. Reis alleen hierheen als het '
      + 'noodzakelijk is. Het is niet veilig er op vakantie te gaan.</li>'
      + '<li>Voor de rest van Tsjechi\u00eb geldt kleurcode groen. U kunt hierheen reizen. '
      + 'Lees welke veiligheidsrisico&#39;s er zijn.</li>'
      + '<li>Lees meer onder Regionale risico&#39;s.</li></ul>'
      + "<h2>Welke veiligheidsrisico&#39;s zijn er in Tsjechi\u00eb?</h2><h3>Regionale risico&#39;s</h3>"
      + '<h4>Oranje: alleen noodzakelijke reizen</h4><p>Ga hier liever niet heen.</p>'
      + '<h4>Groen: u kunt erheen reizen</h4><p>U kunt reizen naar gebieden met kleurcode groen. '
      + 'Lees welke veiligheidsrisico&#39;s er zijn.</p>',
    slaagt: null,
    meta: { kleurcodes: ['oranje', 'groen'] },
  },
  {
    // Elke verwijzing vanuit "In het kort" heeft de vorm "Lees meer onder X".
    regel: 'kort-verwijzing-vorm',
    faalt: '<h2>In het kort</h2><ul><li>De kleurcode van het reisadvies voor Tsjechi\u00eb is groen. '
      + 'U kunt erheen reizen. Lees welke veiligheidsrisico&#39;s er zijn.</li>'
      + '<li>Zie onder Actueel wat er speelt.</li></ul>',
    slaagt: null,
  },
  {
    // Bij meerdere kleurcodes moet "In het kort" naar Regionale risico&#39;s verwijzen, want daar
    // staat de volledige uitleg.
    regel: 'kort-verwijst-regionaal',
    faalt: '<h2>In het kort</h2><ul>'
      + '<li>De kleurcode van het reisadvies is oranje voor het noorden. Reis alleen hierheen als het '
      + 'noodzakelijk is. Het is niet veilig er op vakantie te gaan.</li>'
      + '<li>Voor de rest van Tsjechi\u00eb geldt kleurcode groen. U kunt hierheen reizen. '
      + 'Lees welke veiligheidsrisico&#39;s er zijn.</li></ul>',
    slaagt: null,
    meta: { kleurcodes: ['oranje', 'groen'] },
  },
  {
    // Het sjabloon schrijft de tussenkoppen letterlijk voor.
    regel: 'h3-vaste-kop',
    faalt: "<h2>Veiligheidsrisico’s</h2><h3>Terroristische aanslagen</h3><p>Er is dreiging.</p>",
    slaagt: "<h2>Veiligheidsrisico’s</h2><h3>Terrorisme</h3><p>Er is dreiging.</p>",
  },
  {
    // "Paspoort, visum, rijbewijs" noemt de documenten die voor dit land gelden. Een land zonder
    // visumplicht laat dat element weg; dat mag, een andere volgorde niet.
    regel: 'h3-vaste-kop',
    faalt: '<h2>Hoe bereid ik mijn reis voor?</h2><h3>Rijbewijs, paspoort</h3><p>Tekst.</p>',
    slaagt: '<h2>Hoe bereid ik mijn reis voor?</h2><h3>Paspoort, rijbewijs</h3><p>Tekst.</p>',
  },
  {
    regel: 'h3-alleen-bij-uitzondering',
    faalt: "<h2>Veiligheidsrisico’s</h2><h3>Verkeersongevallen</h3><p>Er vallen doden.</p>",
    slaagt: "<h2>Veiligheidsrisico’s</h2><h3>Criminaliteit</h3><p>Er zijn zakkenrollers.</p>",
  },
  {
    // De eerste kleurbullet staat voluit; beide voluit-vormen uit de matrix zijn geldig.
    regel: 'kleur-eerste-bullet-voluit',
    faalt: '<h2>In het kort</h2><ul><li>Kleurcode groen geldt voor Tsjechië.</li></ul>',
    slaagt: null, // gedekt door schoon.test.mjs
  },
  {
    // Alleen de eerste bullet staat voluit; een vervolgbullet die dat herhaalt maakt het blok lang.
    regel: 'kleur-vervolg-bullet-kort',
    faalt: '<h2>In het kort</h2><ul>'
      + '<li>De kleurcode van het reisadvies voor Tsjechië is groen.</li>'
      + '<li>De kleurcode van het reisadvies voor de gebieden Noord is oranje.</li></ul>',
    slaagt: null, // gedekt door schoon.test.mjs
  },
  {
    regel: 'h2-vast',
    faalt: '<h2>Handige tips</h2><p>Tekst.</p>',
    // De vaste H2's staan in vraagvorm; zie regels/matrix.json en data/voorbeeld/CZE.xml.
    slaagt: '<h2>Wat kan ik doen in een noodsituatie?</h2><p>Tekst.</p>',
  },
  {
    regel: 'zin-max-woorden',
    faalt: '<p>Dit is een zin die bewust veel te lang is gemaakt en daardoor ruim over de vijftien woorden heen gaat.</p>',
    slaagt: '<p>Dit is een korte zin.</p>',
  },
  {
    // "Contactgegevens Nederlandse ambassade" staat in 6 adviezen, de volledige vorm in 208.
    // Dan is die laatste de huisstijl en is de korte een afwijking.
    regel: 'h4-kop-variant',
    faalt: "<h2>Wat kan ik doen in een noodsituatie?</h2><h3>In geval van nood</h3>"
      + '<h4>Contactgegevens Nederlandse ambassade</h4><p>Bel de ambassade.</p>',
    slaagt: "<h2>Wat kan ik doen in een noodsituatie?</h2><h3>In geval van nood</h3>"
      + '<h4>Contactgegevens Nederlandse ambassade in geval van nood</h4><p>Bel de ambassade.</p>',
  },
  {
    // Onder Natuurgeweld hoeft de kop niet vast te liggen, maar moet hij wel een risico benoemen.
    regel: 'h4-natuurrisico',
    faalt: "<h2>Welke veiligheidsrisico&#39;s zijn er in Tsjechi\u00eb?</h2><h3>Natuurgeweld</h3>"
      + '<h4>Bergen</h4><p>Wees voorzichtig in het hooggebergte.</p>',
    slaagt: "<h2>Welke veiligheidsrisico&#39;s zijn er in Tsjechi\u00eb?</h2><h3>Natuurgeweld</h3>"
      + '<h4>Slecht weer in de bergen</h4><p>Wees voorzichtig in het hooggebergte.</p>',
  },
  {
    // Een onderwerp dat de matrix als niet-melden aanmerkt, hoort er ook niet als tussenkop te staan.
    regel: 'h4-niet-melden',
    faalt: "<h2>Welke veiligheidsrisico&#39;s zijn er in Tsjechi\u00eb?</h2><h3>Natuurgeweld</h3>"
      + '<h4>IJsberen</h4><p>Er leven ijsberen in dit gebied.</p>',
    slaagt: "<h2>Welke veiligheidsrisico&#39;s zijn er in Tsjechi\u00eb?</h2><h3>Natuurgeweld</h3>"
      + '<h4>Lawines</h4><p>In de winter vallen er lawines.</p>',
  },
  {
    // Overgenomen uit SpellingSpeurneus: het CMS lekt zijn eigen resten de pagina op.
    regel: 'tekst-cms-rest',
    faalt: '<p>De Estse reddingsbrigade helpt u. undefined</p>',
    slaagt: '<p>De Estse reddingsbrigade helpt u.</p>',
  },
  {
    regel: 'tekst-plakfout',
    faalt: '<p>Vermijd demonstraties.Volg het nieuws via de lokale media.</p>',
    slaagt: '<p>Vermijd demonstraties. Volg het nieuws via de lokale media.</p>',
  },
  {
    // Een woord joiner, hier expres in de zin gezet. In de tool niet te zien, in de tekst wel aanwezig.
    regel: 'tekst-onzichtbaar-teken',
    faalt: '<p>Blijf uit de buurt van de grens.\u2060 Volg het nieuws.</p>',
    slaagt: '<p>Blijf uit de buurt van de grens. Volg het nieuws.</p>',
  },
  {
    // Niet alleen in een kop: een niet-melden-onderwerp in de lopende tekst telt ook.
    regel: 'tekst-niet-melden',
    faalt: '<p>In zee zwemmen haaien.</p>',
    slaagt: '<p>In zee zwemmen dolfijnen.</p>',
  },
  {
    // Zelfde regel, ander gesprek: dit woord zegt hoe vaak iets gebeurt.
    regel: 'zin-frequentiewoord',
    faalt: '<p>In dit gebied komen regelmatig overvallen voor.</p>',
    slaagt: '<p>In dit gebied komen overvallen voor.</p>',
  },
  {
    regel: 'zin-twijfeltaal',
    faalt: '<p>U heeft misschien een visum nodig.</p>',
    slaagt: '<p>U heeft een visum nodig.</p>',
  },
  {
    regel: 'zin-lijdende-vorm',
    faalt: '<p>Het formulier wordt opgestuurd.</p>',
    slaagt: '<p>Het CAK stuurt het formulier op.</p>',
  },
  {
    regel: 'alinea-max-woorden',
    faalt: '<p>' + ('woord '.repeat(90)) + '</p>',
    slaagt: '<p>Een alinea van normale lengte.</p>',
  },
  {
    regel: 'tussenkop-max-woorden',
    faalt: '<h3>Wat moet u doen als er een noodsituatie ontstaat</h3><p>Tekst.</p>',
    slaagt: '<h3>Criminaliteit</h3><p>Tekst.</p>',
  },
  {
    regel: 'tussenkop-lidwoord',
    faalt: '<h3>De criminaliteit</h3><p>Tekst.</p>',
    slaagt: '<h3>Criminaliteit</h3><p>Tekst.</p>',
  },
  {
    regel: 'vragen-opeenvolgend',
    faalt: '<p>Reist u alleen? Heeft u een visum? Gaat u lang weg?</p>',
    slaagt: '<p>Reist u alleen? Heeft u een visum?</p>',
  },
  {
    regel: 'link-tekstlengte',
    faalt: '<p>Zie <a href="https://www.ggd.nl">hoe geef ik het overlijden door van iemand die in de RNI staat ingeschreven</a>.</p>',
    slaagt: '<p>Zie <a href="https://www.ggd.nl">vaccinaties per land</a>.</p>',
  },
  {
    regel: 'link-verboden-partij',
    faalt: '<p>Lees meer op <a href="https://www.nu.nl/artikel">het nieuwsbericht</a>.</p>',
    slaagt: '<p>Lees meer op <a href="https://www.rijksoverheid.nl">Rijksoverheid</a>.</p>',
  },
  {
    regel: 'opsomming-puntkomma',
    faalt: '<ul><li>een paspoort; een visum</li></ul>',
    slaagt: '<ul><li>een paspoort</li><li>een visum</li></ul>',
  },
  {
    regel: 'opmaak-vet-onderstreept',
    faalt: '<p>Let op: <strong>reis niet naar het grensgebied</strong>.</p>',
    slaagt: '<p>Let op: reis niet naar het grensgebied.</p>',
  },
  {
    regel: 'aanhalingstekens',
    faalt: '<p>Dit heet een “rode zone”.</p>',
    slaagt: '<p>Dit heet een rode zone.</p>',
  },
  {
    regel: 'afkortingen-uitschrijven',
    faalt: '<p>Neem documenten mee, bijv. uw paspoort.</p>',
    slaagt: '<p>Neem documenten mee, bijvoorbeeld uw paspoort.</p>',
  },
  {
    regel: 'schrijfwijze-vast',
    faalt: '<p>U hebt een visum nodig.</p>',
    slaagt: '<p>U heeft een visum nodig.</p>',
  },
  {
    regel: 'genderneutraal',
    faalt: '<p>De reiziger neemt zijn/haar paspoort mee.</p>',
    slaagt: '<p>U neemt uw paspoort mee.</p>',
  },
  {
    regel: 'percentage-notatie',
    faalt: '<p>Dit geldt voor 5 procent van de reizigers.</p>',
    slaagt: '<p>Dit geldt voor 5% van de reizigers.</p>',
  },
  {
    regel: 'valuta-notatie',
    faalt: '<p>Een visum kost 25 euro.</p>',
    slaagt: '<p>Een visum kost € 25.</p>',
  },
  {
    regel: 'tijd-notatie',
    faalt: '<p>De balie is open vanaf 08.30 uur.</p>',
    slaagt: '<p>De balie is open vanaf 8.30 uur.</p>',
  },
  {
    regel: 'datum-notatie',
    faalt: '<p>Dit geldt sinds 01-01-2026.</p>',
    slaagt: '<p>Dit geldt sinds 1 januari 2026.</p>',
  },
  {
    regel: 'telefoon-notatie',
    faalt: '<p>Bel 0031 6 12 34 56 78 voor hulp.</p>',
    slaagt: '<p>Bel +31 6 12 34 56 78 voor hulp.</p>',
  },
  {
    regel: 'schuine-streep',
    faalt: '<p>Neem uw paspoort / ID-kaart mee.</p>',
    slaagt: '<p>Neem uw paspoort/identiteitskaart mee.</p>',
  },
  {
    regel: 'getallen-cijfers',
    faalt: '<p>Er waren 12500 aanvragen.</p>',
    slaagt: '<p>Er waren 12.500 aanvragen.</p>',
  },
  {
    // Heette kort-informatieservice zolang de regel alleen op het woord "informatieservice"
    // lette. Het sjabloon legt de hele oproep vast, dus toetst de tool nu op die vaste tekst.
    regel: 'informatieservice-vaste-tekst',
    faalt: '<h2>In het kort</h2><ul><li>Tekst zonder de standaardtekst.</li></ul>',
    slaagt: null, // de advies()-wrapper bevat de standaardtekst al
  },
];

for (const g of gevallen) {
  test(`${g.regel} — gaat af bij een overtreding`, () => {
    const ids = idsVan(g.faalt.startsWith('<h2>In het kort</h2>') ? g.faalt : advies(g.faalt),
      { land: 'Tsjechië', ...(g.meta || {}) });
    assert.ok(ids.includes(g.regel), `verwachtte ${g.regel}, kreeg: ${[...new Set(ids)].join(', ')}`);
  });

  if (g.slaagt) {
    test(`${g.regel} — gaat niet af bij een correcte tekst`, () => {
      const ids = idsVan(advies(g.slaagt), { land: 'Tsjechië' });
      assert.ok(!ids.includes(g.regel), `${g.regel} ging onterecht af`);
    });
  }
}

test('elke bevinding draagt een bron mee', () => {
  const b = bevindingenVan(advies('<p>U hebt misschien 25 euro nodig, bijv. voor het visum.</p>'), { land: 'Tsjechië' });
  assert.ok(b.length > 0);
  for (const x of b) {
    assert.ok(x.bron && x.bron.length > 3, `bevinding zonder bron: ${x.regel}`);
    assert.ok(ERNST_VOLGORDE.includes(x.ernst), `onbekende ernst: ${x.ernst}`);
  }
});

test('elke regel-id uit de tests staat ook in HERKOMST.md', async () => {
  const { readFileSync } = await import('node:fs');
  const herkomst = readFileSync(new URL('../regels/HERKOMST.md', import.meta.url), 'utf8');
  for (const g of gevallen) {
    assert.ok(herkomst.includes('`' + g.regel + '`'), `${g.regel} ontbreekt in HERKOMST.md`);
  }
});

/**
 * De filterindeling is bediening, geen toets: hij bepaalt alleen wat je met een vinkje opzij kunt
 * zetten. Maar hij moet wel volledig zijn, anders verdwijnt een nieuwe regel stilletjes uit beeld
 * zodra iemand filtert. Daarom leest deze test de regel-id's uit de code zelf.
 */
function alleRegelIds() {
  const bron = readFileSync(new URL('../src/regels.js', import.meta.url), 'utf8');
  const ids = new Set([...bron.matchAll(/bevinding\('([a-z0-9-]+)'/g)].map((m) => m[1]));
  // Een regel mag zijn id in een keuze-expressie bepalen: twijfeltaal splitst zo in verzwakkers
  // en frequentiewoorden. Beide takken tellen mee.
  for (const m of bron.matchAll(/bevinding\(\s*\w+\s*\?\s*'([a-z0-9-]+)'\s*:\s*'([a-z0-9-]+)'/g)) {
    ids.add(m[1]); ids.add(m[2]);
  }
  for (const m of bron.matchAll(/\[\s*'([a-z0-9-]+)',\s*ERNST\./g)) ids.add(m[1]);
  for (const v of regeldata.sjabloon.vaste_teksten) ids.add(v.id);
  return ids;
}

/**
 * Het sjabloon legt formuleringen vast die langer zijn dan de schrijfwijzer toestaat. Daar valt
 * niets aan in te korten zonder van het format af te wijken, dus de tool hoort te zwijgen. Zonder
 * deze twee tests kan die vrijstelling stilletjes sneuvelen bij een volgende wijziging.
 */
test('een vaste formulering uit het sjabloon telt niet als te lange zin', () => {
  const zin = 'U heeft geen visum nodig voor Sloveni\u00eb als u met een Nederlands paspoort '
    + 'of Nederlandse ID-kaart reist.';
  const ids = idsVan(advies('<p>' + zin + '</p>'), { land: 'Tsjechi\u00eb' });
  assert.ok(!ids.includes('zin-max-woorden'),
    'de visumzin staat letterlijk in het sjabloon en mag niet als te lang gelden');

  // Tegenproef: dezelfde lengte, maar eigen tekst. Dan gaat de regel wel af.
  const eigen = 'U heeft voor dit land geen enkel document nodig als u met de trein of met de '
    + 'boot naar het noorden reist.';
  assert.ok(idsVan(advies('<p>' + eigen + '</p>'), { land: 'Tsjechi\u00eb' }).includes('zin-max-woorden'),
    'een even lange zin in eigen woorden hoort wel gemeld te worden');
});

test('een vaste linktekst uit het sjabloon telt niet als te lang', () => {
  const vast = '<p>Reist u alleen met 1 of meer kinderen jonger dan 18 jaar? '
    + '<a href="https://www.rijksoverheid.nl/x">Check welke documenten u nodig heeft om te reizen '
    + 'met een minderjarig kind</a> en neem die mee.</p>';
  assert.ok(!idsVan(advies(vast), { land: 'Tsjechi\u00eb' }).includes('link-tekstlengte'),
    'deze linktekst staat zo in het sjabloon en is dus niet in te korten');

  const eigen = '<p>Meer weten? <a href="https://example.org/x">Bekijk de uitgebreide toelichting '
    + 'over de regels die op dit moment in dit gebied gelden</a>.</p>';
  assert.ok(idsVan(advies(eigen), { land: 'Tsjechi\u00eb' }).includes('link-tekstlengte'),
    'een te lange linktekst in eigen woorden hoort wel gemeld te worden');
});

test('een niet-melden-onderwerp mag staan in de rubriek die de matrix zelf noemt', () => {
  // De matrix zegt over Gezondheidszorg: "Evt. tekst opnemen bij Reisverzekering." Staat het daar,
  // dan is het geen formatfout maar een afweging, en die hoort bij de oordeelstoets.
  const bij = (h3) => '<h2>Hoe bereid ik mijn reis voor naar Tsjechi\u00eb?</h2><h3>' + h3 + '</h3>'
    + '<h4>Gezondheidszorg</h4><p>Regel dit vooraf.</p>';
  assert.ok(!idsVan(advies(bij('Reisverzekering')), { land: 'Tsjechi\u00eb' }).includes('h4-niet-melden'),
    'bij Reisverzekering wijst de matrix dit onderwerp zelf een plek toe');
  assert.ok(idsVan(advies(bij('Criminaliteit')), { land: 'Tsjechi\u00eb' }).includes('h4-niet-melden'),
    'buiten die rubriek blijft het een melding');
});

test("Foto's maken is overal een melding, ook onder Wetten en gebruiken", () => {
  // Instructie van de opdrachtgever, 18 september 2026: fotograferen van militaire objecten is
  // nergens slim en nergens toegestaan, dus het hoort niet in elk reisadvies herhaald te worden.
  const kop = "<h2>Welke veiligheidsrisico&#39;s zijn er in Tsjechi\u00eb?</h2>"
    + '<h3>Wetten en gebruiken</h3>'
    + "<h4>Foto\u2019s maken</h4><p>Fotografeer geen militaire installaties.</p>";
  assert.ok(idsVan(advies(kop), { land: 'Tsjechi\u00eb' }).includes('h4-niet-melden'),
    'ook onder lokale wetten hoort dit gemeld te worden');
});

test('alledaagse trefwoorden tellen alleen als kop, niet in de lopende tekst', () => {
  // "Gedwongen naar een pinautomaat rijden en geld pinnen" is een zin over ontvoering, niet over
  // geldzaken. Daarom staat er alleen_als_kop bij dat onderwerp in de matrix.
  const zin = '<p>Soms worden automobilisten ontvoerd en gedwongen geld te pinnen.</p>';
  assert.ok(!idsVan(advies(zin), { land: 'Tsjechi\u00eb' }).includes('tekst-niet-melden'),
    'een alledaags trefwoord in een zin over iets anders is geen melding');

  // Tegenproef: als kop wordt het onderwerp wel gemeld.
  const alsKop = '<h2>Hoe bereid ik mijn reis voor naar Tsjechi\u00eb?</h2><h3>Geldzaken</h3>'
    + '<p>Neem contant geld mee.</p>';
  assert.ok(idsVan(advies(alsKop), { land: 'Tsjechi\u00eb' }).includes('h3-niet-melden'),
    'als kop hoort Geldzaken wel gemeld te worden');
});

test('een natuurrisico telt ook als het achterin een samenstelling staat', () => {
  const kop = (t) => "<h2>Welke veiligheidsrisico&#39;s zijn er in Tsjechi\u00eb?</h2>"
    + '<h3>Natuurgeweld</h3><h4>' + t + '</h4><p>Wees voorzichtig.</p>';
  for (const t of ['Zandstormen', 'Zeestromingen']) {
    assert.ok(!idsVan(advies(kop(t)), { land: 'Tsjechi\u00eb' }).includes('h4-natuurrisico'),
      t + ' benoemt wel degelijk een risico');
  }
  assert.ok(idsVan(advies(kop('Bergen')), { land: 'Tsjechi\u00eb' }).includes('h4-natuurrisico'),
    'een plaats is geen risico');
});

test('een webadres en een letterafkorting zijn geen vergeten spatie', () => {
  // Overgenomen uit SpellingSpeurneus: zonder deze twee uitzonderingen meldt de regel elke url.
  for (const zin of ['Kijk op Windy.com voor het weer daar.', 'Dit geldt in de U.S voor iedereen.']) {
    assert.ok(!idsVan(advies('<p>' + zin + '</p>'), { land: 'Tsjechi\u00eb' }).includes('tekst-plakfout'),
      'geen plakfout: ' + zin);
  }
  assert.ok(idsVan(advies('<p>Let op de grens.Reis niet verder.</p>'), { land: 'Tsjechi\u00eb' })
    .includes('tekst-plakfout'), 'een echte vergeten spatie hoort wel gemeld te worden');
});

/**
 * De spellingtoets, overgenomen uit SpellingSpeurneus. Deze tests draaien alleen als de
 * woordenlijst is opgehaald; zonder lijst hoort de tool er niets over te zeggen.
 */
test('een spelfout wordt gemeld en een goed woord niet', () => {
  const ids = idsVanMetSpelling(advies('<p>Registeer u bij de ambassade.</p>'), { land: 'Tsjechi\u00eb' });
  if (ids === null) return;                       // geen woordenlijst opgehaald
  assert.ok(ids.includes('woord-onbekend'), '"Registeer" hoort een melding te geven');
  assert.ok(!idsVanMetSpelling(advies('<p>Registreer u bij de ambassade.</p>'), { land: 'Tsjechi\u00eb' })
    .includes('woord-onbekend'), 'het goed gespelde woord hoort niets te geven');
});

test('zonder woordenlijst zegt de tool niets over spelling', () => {
  // idsVan gebruikt de toetser zonder lijst. De regel hoort dan niet te vuren, en de rest wel.
  const ids = idsVan(advies('<p>Registeer u bij de ambassade.</p>'), { land: 'Tsjechi\u00eb' });
  assert.ok(!ids.includes('woord-onbekend') && !ids.includes('woord-naam'),
    'zonder lijst hoort de spellingtoets te zwijgen');
});

test('de naam van het land wordt wel getoetst', () => {
  // Namen worden niet beoordeeld, met \u00e9\u00e9n uitzondering: van de landen kent de tool de
  // schrijfwijze, want die staat in de landenlijst van de open data.
  const ids = idsVan(advies('<p>Bent u in Tsjechie en bent u in nood?</p>'), { land: 'Tsjechi\u00eb' });
  assert.ok(ids.includes('landnaam-schrijfwijze'), 'Tsjechie zonder trema hoort gemeld te worden');

  assert.ok(!idsVan(advies('<p>Bent u in Tsjechi\u00eb en bent u in nood?</p>'), { land: 'Tsjechi\u00eb' })
    .includes('landnaam-schrijfwijze'), 'goed gespeld hoort niets te geven');

  // Niet in een reeks hoofdletters: "the Israel Population & Immigration Authority" is de juiste
  // Engelse naam van een instituut, geen verkeerd gespeld Isra\u00ebl.
  assert.ok(!idsVan(advies('<p>Kijk op de site van de Israel Population Authority.</p>'),
    { land: 'Isra\u00ebl' }).includes('landnaam-schrijfwijze'),
    'een naam van een instituut is geen verkeerd gespeld land');

  // Ook een ander land uit de lijst dan dat van het advies zelf.
  assert.ok(idsVan(advies('<p>Reist u door naar Kroatie? Kijk dan ook daar.</p>'), { land: 'Tsjechi\u00eb' })
    .includes('landnaam-schrijfwijze'), 'ook een buurland telt mee');
});

test('een naam wordt herkend en niet gemeld', () => {
  // Namen worden overgeslagen: in 226 reisadviezen staan zoveel plaatsnamen, instituten en
  // buitenlandse bronnen dat er geen woordenlijst voor is aan te leggen. De herkenning blijft
  // staan, anders zou elke naam als spelfout binnenkomen.
  const midden = idsVanMetSpelling(advies('<p>Kijk op de site van Kanlaon voor meer.</p>'),
    { land: 'Tsjechi\u00eb' });
  if (midden === null) return;                    // geen woordenlijst opgehaald
  assert.ok(!midden.includes('woord-onbekend'),
    'een hoofdletterwoord middenin een zin is een naam en hoort niet gemeld te worden');

  // Aan het zinsbegin zegt een hoofdletter niets, dus daar blijft het een spelfout.
  assert.ok(idsVanMetSpelling(advies('<p>Registeer u vandaag.</p>'), { land: 'Tsjechi\u00eb' })
    .includes('woord-onbekend'), 'aan het zinsbegin telt de hoofdletter niet mee');

  // Maar namen komen in reeksen: dan is het ook aan het zinsbegin een naam. Zonder deze
  // uitzondering werd "European" in "European Avalanche Warning Service" een spelfout.
  assert.ok(!idsVanMetSpelling(advies('<p>European Avalanche Warning Service</p>'),
    { land: 'Tsjechi\u00eb' }).includes('woord-onbekend'),
    'een hoofdletterwoord naast een ander hoofdletterwoord is een naam');
});

test('de spellingtoets struikelt niet over samenstellingen en citaten', () => {
  const ids = idsVanMetSpelling(advies(
    "<p>Neem identiteits- en reisdocumenten mee. Pas op voor \u2018bagsnatching\u2019 "
    + "en bewaar uw foto's goed. Ga naar het consulaat-generaal.</p>"), { land: 'Tsjechi\u00eb' });
  if (ids === null) return;
  assert.ok(!ids.includes('woord-onbekend'),
    'een weggelaten samenstellingsdeel, een citaat en een apostrof-meervoud zijn geen spelfouten');
});

test('een vergeten spatie wordt niet twee keer gemeld', () => {
  const b = bevindingenMetSpelling(advies('<p>Vermijd demonstraties.Volg het nieuws.</p>'),
    { land: 'Tsjechi\u00eb' });
  if (b === null) return;
  assert.ok(b.some((x) => x.regel === 'tekst-plakfout'), 'de vergeten spatie hoort gemeld te worden');
  assert.ok(!b.some((x) => x.regel === 'woord-onbekend'),
    'maar niet nog een keer als onbekend woord: dat is de minder nuttige boodschap');
});

test('elke bevinding valt in precies een filtergroep', () => {
  const ids = alleRegelIds();
  // Een regel mag in meer dan een groep staan, mits die groepen zich op ernst onderscheiden: te
  // lange zinnen met en zonder link komen uit dezelfde regel maar zijn twee filters. Wat niet mag:
  // twee groepen die dezelfde bevinding claimen (dan valt hij in twee filters tegelijk), of een
  // regel die nergens staat (dan verdwijnt hij stilletjes zodra iemand filtert).
  const plek = new Map();                 // regel-id -> lijst van groepen die hem noemen
  for (const g of regeldata.groepen.groepen) {
    for (const id of g.regels) {
      if (!plek.has(id)) plek.set(id, []);
      plek.get(id).push(g);
    }
  }
  for (const [id, groepen] of plek) {
    if (groepen.length === 1) continue;
    const ernsten = groepen.map((g) => g.ernst);
    assert.ok(ernsten.every(Boolean),
      `${id} staat in ${groepen.length} groepen, maar niet elke groep bakent af op ernst`);
    assert.equal(new Set(ernsten).size, ernsten.length,
      `${id} staat in twee groepen met dezelfde ernst; een bevinding zou in beide filters vallen`);
  }
  for (const id of ids) {
    assert.ok(plek.has(id), `${id} heeft geen filtergroep in regels/groepen.json`);
  }
  for (const id of plek.keys()) {
    assert.ok(ids.has(id), `regels/groepen.json noemt ${id}, maar die regel bestaat niet (meer)`);
  }
});

test('elke ernst die een regel kan geven valt onder een filter', () => {
  // Bakent een groep af op ernst, dan moeten alle ernsten die die regel kan opleveren gedekt zijn.
  // Anders valt een bevinding buiten elk filter en is hij nooit uit te zetten.
  const zin = regeldata.groepen.groepen.filter((g) => g.regels.includes('zin-max-woorden'));
  assert.deepEqual(new Set(zin.map((g) => g.ernst)), new Set(['let-op', 'link-zin']),
    'zin-max-woorden geeft let-op en link-zin; beide horen een eigen filter te hebben');
});

test('elke filtergroep heeft een label en een toelichting', () => {
  for (const g of regeldata.groepen.groepen) {
    assert.ok(g.id && g.label && g.toelichting, `groep ${g.id || '(zonder id)'} is niet compleet`);
    assert.ok(g.regels.length > 0, `groep ${g.id} heeft geen regels`);
  }
});

test('de matrix kent alle koppen met een richtlijn', () => {
  for (const k of regeldata.matrix.koppen) {
    assert.ok(['uitschrijven', 'verwijzen', 'niet-melden', 'uitschrijven-verwijzen'].includes(k.richtlijn),
      `${k.id} heeft een onbekende richtlijn: ${k.richtlijn}`);
  }
});

test('lijdende vorm: een zelfstandig naamwoord dat op een deelwoord lijkt blokkeert de toets niet', () => {
  const ids = idsVan(advies('<p>Er wordt een gebied afgesloten.</p>'), { land: 'Tsjechië' });
  assert.ok(ids.includes('zin-lijdende-vorm'), 'afgesloten had gevonden moeten worden');
});

test('lijdende vorm: geen melding bij een actieve zin met het woord gebied', () => {
  const ids = idsVan(advies('<p>De politie sluit het gebied af.</p>'), { land: 'Tsjechië' });
  assert.ok(!ids.includes('zin-lijdende-vorm'));
});

test('lijdende vorm: scheidbaar werkwoord wordt herkend', () => {
  const b = bevindingenVan(advies('<p>Het formulier wordt opgestuurd.</p>'), { land: 'Tsjechië' })
    .filter((x) => x.regel === 'zin-lijdende-vorm');
  assert.equal(b.length, 1);
  assert.match(b[0].boodschap, /opgestuurd/);
});
