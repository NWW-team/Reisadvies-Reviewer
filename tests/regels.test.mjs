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
    regel: 'tekst-dubbel-woord',
    faalt: '<p>Reis niet naar het het noorden van het land.</p>',
    slaagt: '<p>Reis niet naar het noorden van het land.</p>',
  },
  {
    regel: 'tekst-spatie-leesteken',
    faalt: '<p>Bel het alarmnummer : 112 als u hulp nodig heeft.</p>',
    slaagt: '<p>Bel het alarmnummer: 112 als u hulp nodig heeft.</p>',
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

test('Nederlands of Nederlandse: de verbuiging hangt aan lidwoord en geslacht', () => {
  const ids = (t) => idsVan(advies('<p>' + t + '</p>'), { land: 'Tsjechi\u00eb' });
  const regel = 'nederlands-verbuiging';

  // Een het-woord zonder lidwoord: geen -e.
  assert.ok(ids('Bel het nummer van Nederlandse consulaat-generaal.').includes(regel));
  assert.ok(!ids('Bel het nummer van Nederlands consulaat-generaal.').includes(regel));

  // Hetzelfde het-woord m\u00e9t bepaald lidwoord: w\u00e9l -e.
  assert.ok(ids('Bel het Nederlands consulaat-generaal in Dubai.').includes(regel));
  assert.ok(!ids('Bel het Nederlandse consulaat-generaal in Dubai.').includes(regel));

  // Na "een" blijft het een het-woord zonder -e.
  assert.ok(!ids('In dit land is een Nederlands consulaat-generaal.').includes(regel));
  assert.ok(ids('In dit land is een Nederlandse consulaat-generaal.').includes(regel));

  // Een de-woord krijgt altijd -e, met of zonder lidwoord.
  assert.ok(!ids('Neem contact op met de Nederlandse ambassade.').includes(regel));
  assert.ok(!ids('Neem contact op met Nederlandse ambassade.').includes(regel));
  assert.ok(ids('Neem contact op met de Nederlands ambassade.').includes(regel));

  // Meervoud is altijd -e.
  assert.ok(!ids('De Nederlandse consulaten-generaal zijn gesloten.').includes(regel));
  assert.ok(ids('De Nederlands consulaten-generaal zijn gesloten.').includes(regel));

  // En buiten deze woorden zwijgt de regel: dit is geen grammaticacontrole.
  assert.ok(!ids('De informatie staat in het Nederlands op de website.').includes(regel),
    '"Nederlands" als taalnaam hoort de regel niet te raken');
  assert.ok(!ids('Het Nederlands elftal speelt daar.').includes(regel),
    'een woord buiten de gesloten lijst hoort de regel niet te raken');
});

test('een herhaalde eigennaam is geen dubbel woord', () => {
  const ids = (t) => idsVan(advies('<p>' + t + '</p>'), { land: 'Tsjechi\u00eb' });

  // Twee hoofdletters achter elkaar is een naam: Pom Pom, Tawi Tawi.
  assert.ok(!ids('Vermijd de eilanden Pom Pom en Sipadan.').includes('tekst-dubbel-woord'));
  // Een aangehaalde vreemde term telt ook niet.
  assert.ok(!ids('Pas op met \u2018boda boda\u2019s\u2019 in het verkeer.').includes('tekst-dubbel-woord'));
  // Maar aan het zinsbegin zegt een hoofdletter niets, dus dit hoort w\u00e9l gemeld te worden.
  assert.ok(ids('Het het departement is afgesloten.').includes('tekst-dubbel-woord'));
});

test('de standplaats van een post wordt getoetst', () => {
  const ids = (t) => idsVan(advies('<p>' + t + '</p>'), { land: 'Colombia' });
  assert.ok(ids('In hooggelegen steden zoals Bogota krijgt u hoogteziekte.')
    .includes('postplaats-schrijfwijze'), 'Bogota zonder accent hoort gemeld te worden');
  assert.ok(!ids('In hooggelegen steden zoals Bogot\u00e1 krijgt u hoogteziekte.')
    .includes('postplaats-schrijfwijze'), 'goed geschreven hoort niets te geven');
});

test('een vaste tekst zonder ingevulde landnaam wordt gemeld', () => {
  const ids = (t) => idsVan(advies('<h2>Wat kan ik doen in een noodsituatie?</h2>'
    + '<h3>In geval van nood</h3><p>' + t + '</p>'), { land: 'Denemarken' });

  assert.ok(ids('Heeft u direct hulp nodig in ? Neem contact op met de lokale hulpdiensten:')
    .includes('vaste-tekst-land-leeg'), 'een lege plek hoort gemeld te worden');
  assert.ok(!ids('Heeft u direct hulp nodig in Denemarken? Neem contact op met de lokale hulpdiensten:')
    .includes('vaste-tekst-land-leeg'), 'ingevuld hoort niets te geven');

  // Een afkorting is geen lege plek. De toets vraagt niet welke naam er staat, alleen of er iets
  // staat \u2014 anders zou "de VS" of "het VK" onterecht afgaan.
  assert.ok(!idsVan(advies('<h2>Wat kan ik doen in een noodsituatie?</h2><h3>In geval van nood</h3>'
    + '<p>Heeft u direct hulp nodig in de VS? Neem contact op met de lokale hulpdiensten:</p>'),
  { land: 'Verenigde Staten van Amerika' }).includes('vaste-tekst-land-leeg'),
  'een legitieme afkorting hoort niets te geven');
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

test('een link die aan het woord ervoor plakt wordt gemeld', () => {
  const ids = (t) => idsVan(advies('<p>' + t + '</p>'), { land: 'Tsjechi\u00eb' });
  const regel = 'link-plakt-aan-woord';

  // De eerste letter valt buiten de link: op de pagina lees je "Kijk", maar alleen "ijk" is
  // klikbaar.
  assert.ok(ids('Dit is verplicht. K<a href="https://example.org/x">ijk op de website</a>.')
    .includes(regel));
  assert.ok(!ids('Dit is verplicht. <a href="https://example.org/x">Kijk op de website</a>.')
    .includes(regel), 'een normale link hoort niets te geven');

  // Geen spatie tussen woord en link.
  assert.ok(ids('Bel het telefoonnummer<a href="tel:+31247247247">+31 247 247 247</a>.')
    .includes(regel));

  // En de spatie die binnen de link staat in plaats van ervoor.
  const b = bevindingenVan(advies('<p>Vraag dit aan via de<a href="https://example.org/x"> '
    + 'ambassade in Brussel</a>.</p>'), { land: 'Tsjechi\u00eb' });
  assert.ok(b.some((x) => x.regel === regel && x.boodschap.includes('binnenin')),
    'een spatie binnen de link hoort een eigen boodschap te geven');
});

test('een vaste linktekst blijft vrijgesteld, ook met de landnaam of een invoeging erin', () => {
  const link = (t) => idsVan(advies('<p>Kijk hier. <a href="https://example.org/x">' + t + '</a></p>'),
    { land: 'Centraal-Afrikaanse Republiek' }).includes('link-tekstlengte');

  // De vaste zin met een lange landnaam erin komt over de 70 tekens, maar daar kan een
  // redacteur niets aan doen.
  assert.ok(!link('Check welke vaccinaties u nodig heeft voor de Centraal-Afrikaanse Republiek'),
    'de vaste zin met de landnaam erin hoort vrijgesteld te blijven');

  // Maar alleen de landnaam met zijn lidwoord. Voegt een redacteur iets toe, dan is dat een
  // keuze en hoort de linktekst gewoon gemeld te worden — anders mis je een woord te veel.
  assert.ok(link('Check welke vaccinaties u nodig heeft voor de Centraal-Afrikaanse Republiek (CAR)'),
    'een toevoeging van de redacteur hoort wel gemeld te worden');

  // Tegenproef: een te lange linktekst in eigen woorden hoort w\u00e9l gemeld te worden.
  assert.ok(link('Bekijk hier de uitgebreide toelichting op alle regels die op dit moment gelden'),
    'een eigen te lange linktekst hoort wel gemeld te worden');
});

test('de rubrieken kennen drie lagen: bovenaan vast, daarna vrijer', () => {
  const risico = (koppen) => advies("<h2>Welke veiligheidsrisico&#39;s zijn er in Tsjechi\u00eb?</h2>"
    + koppen.map((k) => `<h3>${k}</h3><p>Tekst over dit risico.</p>`).join(''));
  const ids = (koppen) => idsVan(risico(koppen), { land: 'Tsjechi\u00eb' });

  // 1. Actueel en Regionale risico's horen bovenaan, in die volgorde. Dat is een fout.
  assert.ok(!ids(['Actueel', "Regionale risico's", 'Terrorisme']).includes('rubriek-bovenaan'));
  assert.ok(ids([ "Regionale risico's", 'Actueel', 'Terrorisme']).includes('rubriek-bovenaan'),
    'Actueel hoort v\u00f3\u00f3r Regionale risico\'s');
  assert.ok(ids(['Terrorisme', 'Actueel']).includes('rubriek-bovenaan'),
    'Actueel hoort bovenaan, niet na een risico');
  // Zonder Actueel staat Regionale risico's bovenaan, en dat is goed.
  assert.ok(!ids([ "Regionale risico's", 'Terrorisme', 'Criminaliteit']).includes('rubriek-bovenaan'));

  // 2. Binnen de vaste laag is afwijken een aandachtspunt, geen fout.
  assert.ok(ids(['Criminaliteit', 'Terrorisme']).includes('rubrieken-volgorde'));
  assert.ok(!ids(['Terrorisme', 'Criminaliteit']).includes('rubrieken-volgorde'));

  // 3. Een vrije rubriek hoort onder Wetten en gebruiken \u2014 maar b\u00f3ven Natuurgeweld mag.
  assert.ok(ids(['Demonstraties', 'Wetten en gebruiken']).includes('rubriek-vrij-te-hoog'));
  assert.ok(!ids(['Wetten en gebruiken', 'Demonstraties', 'Natuurgeweld'])
    .includes('rubriek-vrij-te-hoog'),
  'Demonstraties mag boven Natuurgeweld staan: dat staat meer op zichzelf');
  // En onderling ligt de volgorde van de vrije rubrieken niet vast.
  assert.ok(!ids(['Wetten en gebruiken', 'Verkeersongevallen', 'Demonstraties'])
    .includes('rubriek-vrij-te-hoog'));
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

/**
 * Hoe een advies zijn eigen land mag noemen. Het cms-veld draagt de administratieve naam; de tekst
 * mag daar op drie manieren van afwijken (lidwoord, haakjes, afkorting) en verder niet.
 */
test('kleuraanduiding: een lidwoord voor de landnaam mag', () => {
  const ids = idsVan('<h2>In het kort</h2><ul><li>De kleurcode van het reisadvies voor de Seychellen '
    + 'is groen. U kunt hierheen reizen. Let op: reizen brengt altijd risico&#39;s met zich mee.</li></ul>',
  { land: 'Seychellen', kleurcodes: ['groen'] });
  assert.ok(!ids.includes('kleur-aanduiding'));
});

test('kleuraanduiding: de afkorting uit de landenlijst mag', () => {
  const ids = idsVan('<h2>In het kort</h2><ul><li>De kleurcode van het reisadvies voor het VK '
    + 'is groen. U kunt hierheen reizen. Let op: reizen brengt altijd risico&#39;s met zich mee.</li></ul>',
  { land: 'Verenigd Koninkrijk', kleurcodes: ['groen'] });
  assert.ok(!ids.includes('kleur-aanduiding'));
});

test('kleuraanduiding: een andere schrijfwijze van de landnaam blijft een melding', () => {
  const b = bevindingenVan('<h2>In het kort</h2><ul><li>De kleurcode van het reisadvies voor Naoero '
    + 'is groen. U kunt hierheen reizen. Let op: reizen brengt altijd risico&#39;s met zich mee.</li></ul>',
  { land: 'Nauru', kleurcodes: ['groen'] }).filter((x) => x.regel === 'kleur-aanduiding');
  assert.equal(b.length, 1, 'Naoero wijkt af van Nauru en hoort gemeld te worden');
  // En de melding zegt wat er aan de hand is: de zin klopt, de naam niet.
  assert.match(b[0].boodschap, /Naoero/);
  assert.match(b[0].boodschap, /Nauru/);
});

test('kleuraanduiding: de omgedraaide naam uit de landenlijst mag', () => {
  // Het cms sorteert onder de C; een mens schrijft "de Republiek Congo".
  const ids = idsVan('<h2>In het kort</h2><ul><li>De kleurcode van het reisadvies voor de Republiek '
    + 'Congo is groen. U kunt hierheen reizen. Let op: reizen brengt altijd risico&#39;s met zich '
    + 'mee.</li></ul>', { land: 'Congo, de Republiek', kleurcodes: ['groen'] });
  assert.ok(!ids.includes('kleur-aanduiding'));
});

test('kleuraanduiding: een zin die anders loopt krijgt niet de landnaam-melding', () => {
  // Zuid-Afrika schrijft "de kleurcode voor het reisadvies"; dat verschil zit niet in de naam.
  const b = bevindingenVan('<h2>In het kort</h2><ul><li>De kleurcode voor het reisadvies voor '
    + 'Zuid-Afrika is groen. U kunt hierheen reizen. Let op: reizen brengt altijd risico&#39;s met '
    + 'zich mee.</li></ul>', { land: 'Zuid-Afrika', kleurcodes: ['groen'] })
    .filter((x) => x.regel === 'kleur-aanduiding');
  assert.equal(b.length, 1);
  assert.match(b[0].boodschap, /niet op een van de vaste manieren/);
});

test('kleuraanduiding: een dubbele punt voor de opsomming van gebieden mag', () => {
  const ids = idsVan('<h2>In het kort</h2><ul><li>Kleurcode groen geldt voor: het hele land. '
    + 'U kunt hierheen reizen. Let op: reizen brengt altijd risico&#39;s met zich mee.</li></ul>',
  { land: 'Tsjechië', kleurcodes: ['groen'] });
  assert.ok(!ids.includes('kleur-aanduiding'));
});

test('de kleur van een ander land telt niet als kleurcode van dit advies', () => {
  const ids = idsVan(advies('<p>Het reisadvies voor Jemen is rood: reis hier niet naartoe.</p>',
    { land: 'Oman' }), { land: 'Oman', kleurcodes: ['groen'] });
  assert.ok(!ids.includes('kleur-aanduiding'), 'rood is de kleur van de buurman, niet van dit advies');
  assert.ok(!ids.includes('kleur-vaste-tekst'));
});

test('kleurvariant: scheelt het een woord, dan noemt de melding dat woord', () => {
  // Bij geel is het verschil tussen de volledige en de verkorte uitleg "erheen" / "hierheen". Dit
  // is een genoemd deelgebied ("het oosten"), geen "de rest van" of "het hele land" -- dus hoort
  // hier de verkorte variant met "hierheen".
  const b = bevindingenVan('<h2>In het kort</h2><ul>'
    + '<li>De kleurcode van het reisadvies is oranje voor het noorden. Reis alleen hierheen als het '
    + 'noodzakelijk is. Het is niet veilig er op vakantie te gaan.</li>'
    + '<li>Voor het oosten van Tsjechië geldt kleurcode geel. U kunt erheen reizen. Maar let op: er '
    + 'zijn bijzondere veiligheidsrisico&#39;s.</li></ul>'
    + '<p>Let op: meld u aan voor de informatieservice.</p>',
  { land: 'Tsjechië', kleurcodes: ['oranje', 'geel'] }).filter((x) => x.regel === 'kleur-variant');
  assert.equal(b.length, 1);
  assert.match(b[0].boodschap, /Er staat "erheen", er hoort "hierheen" te staan\./);
});

/**
 * Martijn, 20 september 2026: "hierheen" hoort bij een gerichte verwijzing naar een eerder
 * genoemd deelgebied; "erheen" bij een groter, abstracter geheel -- ook "de rest van" het land,
 * ook al heeft het advies als geheel meerdere kleurcodes. Dat onderscheid zit in de bullet zelf,
 * niet in het aantal kleuren van het advies.
 */
test('kleurvariant: "de rest van" het land is geen deelgebied, ook niet bij meerdere kleurcodes', () => {
  const ids = idsVan('<h2>In het kort</h2><ul>'
    + '<li>Voor het oosten van Tsjechië geldt kleurcode oranje. Reis alleen hierheen als het '
    + 'noodzakelijk is. Het is niet veilig er op vakantie te gaan.</li>'
    + '<li>Voor de rest van Tsjechië geldt kleurcode geel. U kunt erheen reizen. Maar let op: er '
    + 'zijn bijzondere veiligheidsrisico&#39;s.</li></ul>'
    + '<p>Let op: meld u aan voor de informatieservice.</p>',
  { land: 'Tsjechië', kleurcodes: ['oranje', 'geel'] });
  assert.ok(!ids.includes('kleur-variant'), '"de rest van" plus "erheen" is nu de juiste vorm');
});

test('kleurvariant: "de rest van" het land met "hierheen" is juist nu de fout', () => {
  const b = bevindingenVan('<h2>In het kort</h2><ul>'
    + '<li>Voor het oosten van Tsjechië geldt kleurcode oranje. Reis alleen hierheen als het '
    + 'noodzakelijk is. Het is niet veilig er op vakantie te gaan.</li>'
    + '<li>Voor de rest van Tsjechië geldt kleurcode geel. U kunt hierheen reizen. Maar let op: er '
    + 'zijn bijzondere veiligheidsrisico&#39;s.</li></ul>'
    + '<p>Let op: meld u aan voor de informatieservice.</p>',
  { land: 'Tsjechië', kleurcodes: ['oranje', 'geel'] }).filter((x) => x.regel === 'kleur-variant');
  assert.equal(b.length, 1);
  assert.match(b[0].boodschap, /Er staat "hierheen", er hoort "erheen" te staan\./);
});

test('kleurvariant: bij rood loopt de zin te ver uiteen voor een woordverschil', () => {
  // Daar blijft de melding zoals hij was: geen half diagnose-zinnetje erbij.
  const b = bevindingenVan('<h2>In het kort</h2><ul>'
    + '<li>De kleurcode van het reisadvies voor Tsjechië is rood. Wat uw situatie ook is: reis niet '
    + 'hierheen. Het is er te gevaarlijk.</li></ul>'
    + '<p>Let op: meld u aan voor de informatieservice.</p>',
  { land: 'Tsjechië', kleurcodes: ['rood'] }).filter((x) => x.regel === 'kleur-variant');
  assert.equal(b.length, 1);
  assert.ok(!/Er staat "/.test(b[0].boodschap));
});

test('de kleurbullets worden in "In het kort" getoetst, niet elders in het advies', () => {
  // Marokko-geval: de bullet bovenaan heeft een typefout, maar onder Regionale risico's staat
  // dezelfde zin wel goed. Dan hoort de tool die bullet nog steeds te melden.
  const ids = idsVan('<h2>In het kort</h2><ul><li>Vor Tsjechië geldt kleurcode groen. U kunt '
    + 'hierheen reizen. Lees welke veiligheidsrisico&#39;s er zijn.</li></ul>'
    + '<p>Let op: meld u aan voor de informatieservice.</p>'
    + '<h3>Regionale risico&#39;s</h3><h4>Groen: u kunt erheen reizen</h4>'
    + '<p>De kleurcode van het reisadvies voor Tsjechië is groen. U kunt reizen naar gebieden met '
    + 'kleurcode groen. Lees welke veiligheidsrisico&#39;s er zijn.</p>',
  { land: 'Tsjechië', kleurcodes: ['groen'] });
  assert.ok(ids.includes('kleur-aanduiding'), 'de goede zin verderop mag de bullet niet afdekken');
});

test('een lange gebiedenopsomming valt nog binnen het patroon', () => {
  // Jordanië somt 151 tekens aan gebieden op; op de oude grens van 120 gaf dat vals alarm.
  const gebieden = 'het grensgebied van Tsjechië met Polen en Duitsland (met uitzondering van '
    + 'Cheb), de provincie Zlín, de steden Brno en Ostrava en de omliggende gebieden';
  assert.ok(gebieden.length > 120 && gebieden.length < 220);
  const ids = idsVan(`<h2>In het kort</h2><ul><li>Voor ${gebieden} geldt kleurcode oranje. Reis `
    + 'alleen hierheen als het noodzakelijk is. Het is niet veilig er op vakantie te gaan.</li>'
    + '<li>Voor de rest van Tsjechië geldt kleurcode groen. U kunt hierheen reizen. Lees welke '
    + 'veiligheidsrisico&#39;s er zijn.</li></ul>'
    + '<p>Let op: meld u aan voor de informatieservice.</p>',
  { land: 'Tsjechië', kleurcodes: ['oranje', 'groen'] });
  assert.ok(!ids.includes('kleur-aanduiding'));
});

test('meer dan vijf gebieden bij een kleurcode wordt gemeld', () => {
  const b = bevindingenVan('<h2>In het kort</h2><ul>'
    + '<li>De kleurcode van het reisadvies is rood voor de provincie Noord, de provincie Zuid, de '
    + 'stad Brno, het eiland Rab, de regio Zlín en het district Cheb. Wat uw situatie ook is: reis '
    + 'niet hierheen. Het is er te gevaarlijk.</li>'
    + '<li>Voor de rest van Tsjechië geldt kleurcode groen. U kunt hierheen reizen. Lees welke '
    + 'veiligheidsrisico&#39;s er zijn.</li></ul>'
    + '<p>Let op: meld u aan voor de informatieservice.</p>',
  { land: 'Tsjechië', kleurcodes: ['rood', 'groen'] }).filter((x) => x.regel === 'kleur-gebieden-max');
  assert.equal(b.length, 1);
  assert.match(b[0].boodschap, /6 gebieden/);
});

test('buurlanden als oriëntatiepunt zijn geen losse gebieden', () => {
  // Benin: "de noordelijke regio's van Benin die grenzen aan Togo, Burkina Faso, Niger en Nigeria"
  // is één gebied met vier buurlanden erbij, geen vijf gebieden.
  const ids = idsVan('<h2>In het kort</h2><ul>'
    + '<li>De kleurcode van het reisadvies is rood voor de noordelijke regio&#39;s van Tsjechië die '
    + 'grenzen aan Polen, Duitsland, Oostenrijk en Slowakije. Wat uw situatie ook is: reis niet '
    + 'hierheen. Het is er te gevaarlijk.</li>'
    + '<li>Voor de rest van Tsjechië geldt kleurcode groen. U kunt hierheen reizen. Lees welke '
    + 'veiligheidsrisico&#39;s er zijn.</li></ul>'
    + '<p>Let op: meld u aan voor de informatieservice.</p>',
  { land: 'Tsjechië', kleurcodes: ['rood', 'groen'] });
  assert.ok(!ids.includes('kleur-gebieden-max'));
});

test('een windrichting telt niet als los gebied: dat is juist de aanbevolen vorm', () => {
  const ids = idsVan('<h2>In het kort</h2><ul>'
    + '<li>De kleurcode van het reisadvies is rood voor het noorden, het oosten, het zuiden en het '
    + 'westen van Tsjechië. Wat uw situatie ook is: reis niet hierheen. Het is er te '
    + 'gevaarlijk.</li>'
    + '<li>Voor de rest van Tsjechië geldt kleurcode groen. U kunt hierheen reizen. Lees welke '
    + 'veiligheidsrisico&#39;s er zijn.</li></ul>'
    + '<p>Let op: meld u aan voor de informatieservice.</p>',
  { land: 'Tsjechië', kleurcodes: ['rood', 'groen'] });
  assert.ok(!ids.includes('kleur-gebieden-max'));
});

test('de gebiedsvorm van de landzin mag, een andere landnaam niet', () => {
  // Japan: "voor het zuidoosten van Fukushima is rood" is goed; Nauru's "voor Naoero" niet.
  const japan = idsVan('<h2>In het kort</h2><ul><li>De kleurcode van het reisadvies voor het '
    + 'zuidoosten van Fukushima is rood. Wat uw situatie ook is: reis niet hierheen. Het is er te '
    + 'gevaarlijk.</li><li>Voor de rest van Tsjechië geldt kleurcode groen. U kunt hierheen reizen. '
    + 'Lees welke veiligheidsrisico&#39;s er zijn.</li></ul>'
    + '<p>Let op: meld u aan voor de informatieservice.</p>',
  { land: 'Tsjechië', kleurcodes: ['rood', 'groen'] });
  assert.ok(!japan.includes('kleur-aanduiding'));
});

/**
 * Staat een vaste tekst er wél maar anders, dan hoort de melding dat te zeggen en de zin aan te
 * wijzen. "Ontbreekt" stuurt de redacteur het bos in: hij ziet in het advies een zin staan die er
 * bijna hetzelfde uitziet en weet niet wat hij moet veranderen.
 */
test('bagage: een andere formulering heet afwijkend en wijst de zin aan', () => {
  const b = bevindingenVan(advies('<h3>Bagageregels</h3>'
    + '<h4>Wat mag ik meenemen naar Tsjechië?</h4>'
    + '<p>Check wat u mee mag nemen naar Tsjechië op de website van de Tsjechische overheid.</p>'),
  { land: 'Tsjechië' }).filter((x) => x.regel === 'bagage-heen');
  assert.equal(b.length, 1);
  assert.match(b[0].boodschap, /wijkt af/);
  assert.match(b[0].fragment, /Check wat u mee mag nemen naar Tsjechië/);
  assert.match(b[0].verwacht, /Check wat de regels zijn bij de lokale autoriteiten/);
});

test('bagage: staat er iets heel anders, dan ontbreekt de tekst echt', () => {
  const b = bevindingenVan(advies('<h3>Bagageregels</h3>'
    + '<h4>Wat mag ik meenemen naar Tsjechië?</h4>'
    + '<p>Neem geen resten van planten of dieren mee, ook niet per ongeluk.</p>'),
  { land: 'Tsjechië' }).filter((x) => x.regel === 'bagage-heen');
  assert.equal(b.length, 1);
  assert.match(b[0].boodschap, /ontbreekt/);
  assert.strictEqual(b[0].fragment, undefined, 'er is geen zin om aan te wijzen');
});

/**
 * De kinderzin staat op de vrijstellingslijst, maar het middenstuk verschilt per land: een visum,
 * een ESTA, een ID-kaart, een inreisvergunning. Stond hij er maar in één vorm, dan viel elke
 * andere alsnog over de schrijfregels — over "eventueel" bijvoorbeeld, terwijl dat woord er juist
 * hoort te staan: of je een visum nodig hebt, hangt af van de reden van het bezoek.
 */
test('de kinderzin is vrijgesteld, welke variant er ook staat', () => {
  const varianten = [
    'Kinderen hebben ook een geldig paspoort en eventueel een visum nodig voor een reis naar Tsjechië.',
    'Kinderen hebben ook een geldig paspoort, en eventueel een visum, nodig voor een reis naar Tsjechië.',
    'Kinderen hebben ook een geldig paspoort of geldige ID-kaart en eventueel een visum nodig voor een reis naar Tsjechië.',
    'Kinderen hebben ook een geldig paspoort, een ESTA of eventueel een visum nodig voor een reis naar Tsjechië.',
    'Kinderen hebben ook een geldig paspoort (en eventueel een inreisvergunning) nodig voor een reis naar Tsjechië.',
  ];
  for (const zin of varianten) {
    const ids = idsVan(advies('<h3>Paspoort, visum, rijbewijs</h3><p>' + zin + '</p>'), { land: 'Tsjechië' });
    assert.ok(!ids.includes('zin-twijfeltaal'), 'niet over twijfeltaal vallen bij: ' + zin);
    assert.ok(!ids.includes('zin-max-woorden'), 'niet over de lengte vallen bij: ' + zin);
  }
});

test('een eigen zin die toevallig zo begint blijft wel getoetst op wat eromheen staat', () => {
  // De vrijstelling geldt de zin zelf, niet de alinea: de zin erna wordt gewoon getoetst.
  const ids = idsVan(advies('<h3>Paspoort, visum, rijbewijs</h3>'
    + '<p>Kinderen hebben ook een geldig paspoort en eventueel een visum nodig voor een reis naar '
    + 'Tsjechië. Reizigers moeten er mogelijk rekening mee houden dat de wachttijden aan de grens '
    + 'bij drukte flink kunnen oplopen in de zomermaanden.</p>'), { land: 'Tsjechië' });
  assert.ok(ids.includes('zin-twijfeltaal'), 'de tweede zin bevat "mogelijk" en hoort gemeld te worden');
});

/**
 * De langste blokken tellen per rubriek (H3), niet per los blok. Anders staat een H3 zonder
 * eigen tekst met 0 woorden in het rijtje en concurreren zijn H4-kinderen los van elkaar met
 * complete rubrieken - appels tegen peren, en juist de rubriek die je wilt zien valt eruit.
 */
test('doc-woordenaantal: de langste blokken tellen per rubriek, met H4-kinderen opgeteld', () => {
  const html = '<h2>In het kort</h2><p>' + 'kort '.repeat(20) + '</p>'
    + '<h2>Welke veiligheidsrisico\'s zijn er in Testland?</h2>'
    + '<h3>Regionale risico\'s</h3>'
    + '<h4>Rood: niet reizen</h4><p>' + 'rood '.repeat(900) + '</p>'
    + '<h4>Oranje: alleen noodzakelijke reizen</h4><p>' + 'oranje '.repeat(900) + '</p>'
    + '<h3>Reisverzekering</h3><p>' + 'verzekering '.repeat(50) + '</p>';
  const b = bevindingenVan(html, { land: 'Testland' }).find((x) => x.regel === 'doc-woordenaantal');
  assert.ok(b, 'dit advies zit ruim boven de limiet');
  assert.match(b.detail[0], /^Regionale risico's \(1800 woorden\)$/,
    'de twee H4-kinderen (900 + 900) horen opgeteld onder hun rubriek te staan, niet los');
  assert.match(b.notitie, /vrije tekst.*welke gebieden/,
    'staat Regionale risico\'s in de lijst, dan hoort de tool te zeggen dat daar ook vrije tekst in zit');
});

/**
 * "Regionale risico's" heeft twee toetsen: het vaste kopje per kleur, en de vaste uitleg
 * eronder. Allebei zeiden altijd "ontbreekt" en gaven nooit een fragment, dus klikken sprong
 * nergens heen -- ook niet als er wel degelijk iets stond, alleen onvolledig.
 *
 * Elk advies hieronder is compleet met een eigen "In het kort" en informatieservice-oproep, zodat
 * alleen de rubriek Regionale risico's ter discussie staat en niet toevallig andere regels meedoen.
 */
function kortBlok(bullets) {
  return '<h2>In het kort</h2><ul>' + bullets.map((b) => '<li>' + b + '</li>').join('')
    + '</ul><p>Let op: meld u aan voor de informatieservice.</p>';
}

test('regionaal-kleur-tekst: een onvolledige zin heet "wijkt af" en wijst de zin aan', () => {
  const html = kortBlok([
    'De kleurcode van het reisadvies is rood voor het noorden. Wat uw situatie ook is: reis niet '
      + 'hierheen. Het is er te gevaarlijk.',
    'Voor de rest van Tsjechië geldt kleurcode oranje. Reis alleen hierheen als het noodzakelijk '
      + 'is. Het is niet veilig er op vakantie te gaan.',
  ]) + '<h3>Regionale risico&#39;s</h3>'
    + '<h4>Rood: niet reizen</h4><p>Wat uw situatie ook is: reis niet naar gebieden met kleurcode '
    + 'rood. Het is er te gevaarlijk.</p>'
    + '<h4>Oranje: alleen noodzakelijke reizen</h4><p>Reis alleen naar gebieden met kleurcode '
    + 'oranje als dit noodzakelijk is. Het is niet veilig er op vakantie te gaan. De Nederlandse '
    + 'ambassade kan u minder goed helpen als u in de problemen komt.</p>';
  const b = bevindingenVan(html, { land: 'Tsjechië', kleurcodes: ['rood', 'oranje'] })
    .filter((x) => x.regel === 'regionaal-kleur-tekst' && x.boodschap.includes('rood'));
  assert.equal(b.length, 1);
  assert.match(b[0].boodschap, /wijkt.*af van de vaste tekst/);
  assert.match(b[0].fragment, /Wat uw situatie ook is/);
});

test('regionaal-kleur-tekst: ontbreekt het hele kleurblok, dan blijft het "ontbreekt"', () => {
  const html = kortBlok([
    'De kleurcode van het reisadvies is rood voor het noorden. Wat uw situatie ook is: reis niet '
      + 'hierheen. Het is er te gevaarlijk.',
    'Voor de rest van Tsjechië geldt kleurcode oranje. Reis alleen hierheen als het noodzakelijk '
      + 'is. Het is niet veilig er op vakantie te gaan.',
  ]) + '<h3>Regionale risico&#39;s</h3>'
    + '<h4>Oranje: alleen noodzakelijke reizen</h4><p>Reis alleen naar gebieden met kleurcode '
    + 'oranje als dit noodzakelijk is. Het is niet veilig er op vakantie te gaan. De Nederlandse '
    + 'ambassade kan u minder goed helpen als u in de problemen komt.</p>';
  const b = bevindingenVan(html, { land: 'Tsjechië', kleurcodes: ['rood', 'oranje'] })
    .filter((x) => x.regel === 'regionaal-kleur-tekst' && x.boodschap.includes('rood'));
  assert.equal(b.length, 1);
  assert.match(b[0].boodschap, /ontbreekt/);
  // Er is niets specifieks onder deze kleur om aan te wijzen, dus valt de melding terug op de
  // sectiekop: beter naar "Regionale risico's" springen dan nergens heen.
  assert.equal(b[0].fragment, "Regionale risico's");
});

test('regionaal-kleur-kop: het echt ontbrekende kopje springt naar "Regionale risico\'s"', () => {
  const html = kortBlok([
    'De kleurcode van het reisadvies is rood voor het noorden. Wat uw situatie ook is: reis niet '
      + 'hierheen. Het is er te gevaarlijk.',
    'Voor de rest van Tsjechië geldt kleurcode geel. U kunt hierheen reizen. Maar let op: er zijn '
      + 'bijzondere veiligheidsrisico&#39;s.',
  ]) + '<h3>Regionale risico&#39;s</h3>'
    + '<h4>Rood: niet reizen</h4><p>Wat uw situatie ook is: reis niet naar gebieden met kleurcode '
    + 'rood. Het is er te gevaarlijk. De Nederlandse ambassade kan u niet helpen als u in de '
    + 'problemen komt.</p>';
  const b = bevindingenVan(html, { land: 'Tsjechië', kleurcodes: ['rood', 'geel'] })
    .filter((x) => x.regel === 'regionaal-kleur-kop');
  assert.equal(b.length, 1, 'het kopje voor geel ontbreekt echt');
  assert.equal(b[0].fragment, "Regionale risico's",
    'niets specifieks om aan te wijzen, dus springt de tool naar de sectiekop zelf');
});

/**
 * "Door een goede voorbereiding verkleint u de kans dat u wordt beroofd of opgelicht" staat
 * letterlijk in het sjabloon, blok Criminaliteit. De lijdende vorm zit in de constructie zelf --
 * bestolen worden overkomt je, het is geen keuze -- dus deze zin is vrijgesteld van de
 * schrijfregels, in twee vormen: met het punt uit het sjabloon, en met een dubbele punt als er
 * een opsomming op volgt (zoals Niger doet).
 */
test('de criminaliteit-themazin is vrijgesteld van de lijdende vorm, punt of dubbele punt', () => {
  for (const slot of ['.', ':']) {
    const ids = idsVan(advies('<h3>Criminaliteit</h3><p>Door een goede voorbereiding verkleint u '
      + 'de kans dat u wordt beroofd of opgelicht' + slot + ' Lees meer op de pagina Hoe voorkom ik '
      + 'dat ik slachtoffer word van criminaliteit in het buitenland?</p>'), { land: 'Tsjechië' });
    assert.ok(!ids.includes('zin-lijdende-vorm'), `moet vrijgesteld zijn met slotteken "${slot}"`);
  }
});

test('een herschreven variant van de criminaliteitzin blijft wel gemeld', () => {
  // Alleen de letterlijke sjabloonzin is vrijgesteld; een eigen formulering niet.
  const ids = idsVan(advies('<h3>Criminaliteit</h3><p>Hiermee verkleint u de kans dat u wordt '
    + 'beroofd of opgelicht.</p>'), { land: 'Tsjechië' });
  assert.ok(ids.includes('zin-lijdende-vorm'));
});

test('de dubbele-puntvorm blijft beperkt tot deze ene zin', () => {
  // Een andere vaste zin die toevallig ook met een punt eindigt, mag niet zomaar ook met een
  // dubbele punt goedgekeurd worden -- dat zou een zin met eigen tekst erachter (een citaat, een
  // verwijzing) in zijn geheel vrijstellen. Getest op de ANWB-rijbewijszin plus een toevoeging.
  const ids = idsVan(advies('<h3>Rijbewijs</h3><p>Uw Nederlandse rijbewijs is geldig in Tsjechië. '
    + 'Lees meer over rijden in Tsjechië op de website van de ANWB onder \u2018Praag\u2019.</p>'),
  { land: 'Tsjechië' });
  assert.ok(ids.includes('aanhalingstekens'), 'de toegevoegde verwijzing met aanhalingstekens hoort gemeld te worden');
});

/**
 * "Eventueel" in de kinderzin is alsnog goedgekeurd, in elke vorm: of je een visum nodig hebt
 * hangt af van de reden van je bezoek, en zonder dat woord wordt de zin feitelijk onjuist. Wat
 * wel gemeld blijft: een heel ander document (ESTA, immigratiekaart) in plaats van het visum --
 * dat is geen kwestie van "eventueel" maar van andere inhoud.
 */
test('kinderen-paspoort: "eventueel" is goedgekeurd, met of zonder komma of haakjes', () => {
  const varianten = [
    'Kinderen hebben ook een geldig paspoort en eventueel een visum nodig voor een reis naar Tsjechië.',
    'Kinderen hebben ook een geldig paspoort, en eventueel een visum, nodig voor een reis naar Tsjechië.',
    'Kinderen hebben ook een geldig paspoort of geldige ID-kaart en eventueel een visum nodig voor '
      + 'een reis naar Tsjechië.',
    'Kinderen hebben ook een geldig paspoort en (eventueel) een visum nodig voor een reis naar Tsjechië.',
  ];
  for (const zin of varianten) {
    const ids = idsVan(advies('<h3>Paspoort, visum, rijbewijs</h3><p>' + zin + '</p>'), { land: 'Tsjechië' });
    assert.ok(!ids.includes('kinderen-paspoort'), 'mag niet meer oppoppen: ' + zin);
  }
});

test('kinderen-paspoort: een heel ander document blijft wel gemeld', () => {
  const ids = idsVan(advies('<h3>Paspoort, visum, rijbewijs</h3><p>Kinderen hebben ook een geldig paspoort '
    + 'en een ESTA nodig voor een reis naar Tsjechië.</p>'), { land: 'Tsjechië' });
  assert.ok(ids.includes('kinderen-paspoort'), 'een ESTA is geen visum, dus dit is echt andere inhoud');
});

/**
 * De vijf vaste H2's uit de matrix moeten er allemaal zijn, niet alleen kloppen als ze er zijn.
 * Wordt een advies als platte tekst geplakt zonder opmaak, dan ziet de parser geen koppen -- en
 * bleef de tool tot 19 september 2026 stil, terwijl de matrix deze vijf koppen net zo vast
 * voorschrijft als hun inhoud.
 */
test('h2-ontbreekt: platte tekst zonder koppen mist alle vijf', () => {
  const html = '<p>Reist u naar Testland? Lees welke veiligheidsrisico\'s er zijn.</p>'
    + '<p>In het kort De kleurcode van het reisadvies voor Testland is groen. U kunt erheen '
    + 'reizen. Lees welke veiligheidsrisico\'s er zijn.</p>';
  const ids = idsVan(html, { land: 'Testland' });
  const missend = ids.filter((r) => r === 'h2-ontbreekt').length;
  assert.equal(missend, 5, 'alle vijf vaste H2\'s ontbreken in platte tekst zonder koppen');
});

test('h2-ontbreekt: een goed opgemaakt advies met alle vijf koppen geeft geen melding', () => {
  const html = '<h2>In het kort</h2><p>' + 'kort '.repeat(10) + '</p>'
    + '<h2>Welke veiligheidsrisico\'s zijn er in Testland?</h2><p>tekst</p>'
    + '<h2>Wat kan ik doen in een noodsituatie?</h2><p>tekst</p>'
    + '<h2>Hoe bereid ik mijn reis naar Testland voor?</h2><p>tekst</p>'
    + '<h2>Ook nuttig</h2><p>tekst</p>';
  const ids = idsVan(html, { land: 'Testland' });
  assert.ok(!ids.includes('h2-ontbreekt'));
});

test('h2-ontbreekt blijft stil als alle vijf er staan maar één verkeerd is geformuleerd', () => {
  // Dat is het terrein van h2-vast: die geeft de precieze foutieve tekst als fragment. Zonder
  // deze grens meldden beide regels hetzelfde probleem (gemeten bij Amerikaans-Samoa en
  // Mauritius, die allebei zo'n H2 net anders formuleren).
  const html = '<h2>In het kort</h2><p>' + 'kort '.repeat(10) + '</p>'
    + '<h2>Welke veiligheidsrisico\'s zijn er in Testland?</h2><p>tekst</p>'
    + '<h2>Wat kunt u doen in een noodsituatie?</h2><p>tekst</p>'
    + '<h2>Hoe bereid ik mijn reis naar Testland voor?</h2><p>tekst</p>'
    + '<h2>Ook nuttig</h2><p>tekst</p>';
  const ids = idsVan(html, { land: 'Testland' });
  assert.ok(!ids.includes('h2-ontbreekt'), 'vijf koppen aanwezig, dus geen "ontbreekt"-melding');
  assert.ok(ids.includes('h2-vast'), 'de verkeerde formulering hoort wel gemeld te worden, door h2-vast');
});
