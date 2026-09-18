import test from 'node:test';
import assert from 'node:assert/strict';
import { advies, idsVan, bevindingenVan, regeldata } from './helpers.mjs';
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
    const ids = idsVan(g.faalt.startsWith('<h2>In het kort</h2>') ? g.faalt : advies(g.faalt), { land: 'Tsjechië' });
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
