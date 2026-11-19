/**
 * Totaaloverzicht voor het gesprek met de manager en de coördinator van de reisadviezen: in
 * hoeveel adviezen staat iets niet volgens het format, toen en nu? In twee delen: inhoudelijke
 * keuzes over het format (wat erin hoort, hoe lang, hoe opgebouwd) en taalkeuzes (de vaste zinnen
 * uit het sjabloon en de schrijfregels uit de schrijfwijzer).
 *
 * "Toen" is het eerste corpus (commit 3fd493fa). Het is op 18 september 2026 vastgelegd, maar de
 * teksten zijn van 14 september: alle 226 zeggen "Nog steeds geldig op: 14-09-2026". "Nu" is
 * data/corpus. Beide gaan door dezelfde, huidige regels, zodat het verschil alleen zegt wat er in
 * de teksten is veranderd en niet wat er aan de tool is veranderd.
 *
 *   node scripts/totaaloverzicht.mjs
 *
 * Uitvoer: data/totaaloverzicht.md. Draait eerst scripts/vaste-teksten-boven-de-norm.mjs, want
 * de tabel met te lange sjabloonzinnen komt daaruit.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { uitApiRespons } from '../src/adapter.js';
import { laadWoordenlijst } from '../src/woordenlijst.mjs';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const EERSTE = { commit: '3fd493fa', datum: '14 september 2026' };

execFileSync('node', [join(wortel, 'scripts', 'vaste-teksten-boven-de-norm.mjs')], { cwd: wortel });

const laadPagina = createRequire(import.meta.url)('../test/harnas.cjs');
const { Parse, Regels, REGELDATA } = laadPagina(join(wortel, 'dist', 'app.html'));
const toets = Regels.maakToetser({ ...REGELDATA, woordenlijst: laadWoordenlijst() });

function draai(bestanden, lees) {
  return bestanden.map((f) => {
    const v = uitApiRespons(lees(f));
    const doc = Parse.parseAdvies(v.html, { land: v.land, titel: v.titel, url: v.url, kleurcodes: v.kleurcodes });
    const r = toets(doc);
    return { iso: v.isocode || f.replace('.xml', ''), land: v.land, ...r };
  });
}

const corpusMap = join(wortel, 'data', 'corpus');
const nu = draai(readdirSync(corpusMap).filter((f) => f.endsWith('.xml')).sort(),
  (f) => readFileSync(join(corpusMap, f), 'utf8'));
const git = (...a) => execFileSync('git', a, { cwd: wortel, encoding: 'utf8', maxBuffer: 64 << 20 });
const toen = draai(git('ls-tree', '--name-only', EERSTE.commit, 'data/corpus/').split('\n')
  .filter((f) => f.endsWith('.xml')).map((f) => f.replace('data/corpus/', '')).sort(),
(f) => git('show', `${EERSTE.commit}:data/corpus/${f}`));

// ---------- tellen ----------

/** Welke adviezen en hoeveel meldingen voldoen aan `past`? */
function tel(resultaten, past) {
  let meldingen = 0;
  const adviezen = new Set();
  for (const r of resultaten) for (const b of r.bevindingen) {
    if (past(b)) { meldingen++; adviezen.add(r.iso); }
  }
  return { adviezen: adviezen.size, meldingen };
}
const rij = (wat, past) => ({ wat, toen: tel(toen, past), nu: tel(nu, past) });
const regel = (...ids) => (b) => ids.includes(b.regel);

/** Het onderwerp uit een melding over iets dat er niet in hoort. */
function onderwerp(b) {
  const m = /gaat over (.+?)(?:, en dat|\.)/.exec(b.boodschap) || /^"([^"]+)"/.exec(b.boodschap);
  const s = m ? m[1].replace(/[‘’]/g, "'") : b.boodschap;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ================= Deel 1: inhoudelijke keuzes over het format =================

const NIET_IN_ADVIES = ['h3-niet-melden', 'h3-alleen-bij-uitzondering', 'h4-niet-melden', 'tekst-niet-melden'];
const onderwerpen = new Set();
for (const r of [...toen, ...nu]) for (const b of r.bevindingen) {
  if (NIET_IN_ADVIES.includes(b.regel)) onderwerpen.add(onderwerp(b));
}
const perOnderwerp = [...onderwerpen].map((o) =>
  rij(o, (b) => NIET_IN_ADVIES.includes(b.regel) && onderwerp(b) === o));

const LENGTE = [
  ['doc-woordenaantal', 'Advies boven de woordenlimiet (1500 bij één kleurcode, 2000 bij meer)'],
  ['rubrieken-max', 'Meer dan 6 rubrieken onder de veiligheidsrisico\'s of de reisvoorbereiding'],
  ['kort-max-bullets', '"In het kort" meer dan 4 bullets'],
  ['actueel-max-woorden', 'Actualiteit in "In het kort" boven 25 woorden'],
  ['kleur-gebieden-max', 'Meer dan 5 gebieden per kleur'],
  ['gebieden-max', 'Meer dan 5 gebieden genoemd buiten een kleurbullet'],
];

const IN_HET_KORT = [
  ['kort-een-actualiteit', 'Meer dan één actualiteit (bullet die geen kleurcode uitlegt)'],
  ['kort-actualiteit-eerste', 'Actualiteit staat niet in bullet 1'],
  ['kort-actualiteit-verwijzing', 'Actualiteit verwijst niet naar Actueel (of naar een andere rubriek: ter overweging)'],
  ['kort-verwijst-regionaal', "Meerdere kleurcodes, maar geen verwijzing naar Regionale risico's"],
  ['kort-verwijzing-hoogste-kleur', "Verwijzing naar Regionale risico's niet bij de hoogste kleur"],
  ['kort-verwijzing-vorm', 'Verwijzing niet in de vorm "Lees meer onder …"'],
  ['kort-informatieservice-onderaan', 'Oproep Informatieservice niet onderaan'],
];

const KLEUR = [
  ['kleur-variant', 'Volledige of verkorte kleurtekst niet zoals de matrix voorschrijft (erheen/hierheen)'],
  ['kleur-aanduiding', 'Kleurcode niet op een van de vaste manieren aangeduid'],
  ['kleur-eerste-bullet-voluit', 'Eerste kleurbullet niet voluit'],
  ['kleur-vervolg-bullet-kort', 'Vervolgbullet voluit in plaats van verkort'],
  ['kleur-vaste-tekst', 'Vaste handelingsinstructie bij een kleur ontbreekt'],
  ['kleur-formulering-verboden', 'Kleur genoemd zonder het woord kleurcode'],
  ['kleur-volgorde', 'Kleurcodes niet van rood naar groen'],
  ['regionaal-kleur-kop', "Vast kopje per kleur onder Regionale risico's ontbreekt"],
  ['regionaal-kleur-tekst', "Vaste uitleg per kleur onder Regionale risico's wijkt af"],
  ['h3-regionaal-alleen-bij-meerdere', "Regionale risico's bij maar één kleurcode"],
];

const OPBOUW = [
  ['h2-ontbreekt', 'Vaste H2 ontbreekt'],
  ['h2-vast', 'H2 die geen vaste kop is'],
  ['h3-vaste-kop', 'Rubriek die geen vaste kop is'],
  ['h4-kop-variant', 'Tussenkop heet elders anders'],
  ['h4-natuurrisico', 'Tussenkop onder Natuurgeweld noemt geen risico'],
  ['rubriek-bovenaan', "Actueel of Regionale risico's niet bovenaan"],
  ['rubrieken-volgorde', 'Volgorde van de vaste rubrieken anders (ter overweging)'],
  ['rubriek-vrij-te-hoog', 'Vrije rubriek boven Wetten en gebruiken (ter overweging)'],
];

// ================= Deel 2: taalkeuzes =================

const VAST = [
  ['natuurgeweld-contact', 'Contact met de lokale autoriteiten ("uw hotel" is "uw accommodatie" geworden)'],
  ['regionaal-gebiedenzin', "Aanhef boven de gebieden in Regionale risico's"],
  ['reisverzekering-vaste-tekst', 'Openingstekst reisverzekering'],
  ['kinderen-paspoort', 'Zin over paspoort voor kinderen'],
  ['nood-contactcenter', 'Contactcenter (24/7 bereikbaar)'],
  ['bagage-heen', 'Douaneregels van het land zelf'],
  ['rijbewijs-anwb', 'Verwijzing naar de ANWB bij rijbewijs'],
  ['bagage-terug', "Verwijzing 'Wat mag ik meenemen naar Nederland?'"],
  ['intro-vaste-tekst', 'Vaste introductietekst'],
  ['nood-lokale-hulpdiensten', 'Aanhef boven de alarmnummers'],
  ['nood-verwijzing-nood', 'Verwijzing naar de pagina over nood'],
  ['nood-verwijzing-crisis', 'Verwijzing naar de pagina over een crisis'],
  ['nood-contactnummer', 'Contactnummer in geval van nood'],
  ['medicijnen-voldoende', 'Voldoende medicijnen meenemen'],
  ['medicijnen-verklaring', 'Medicijnverklaring'],
  ['medicijnen-verpakking', 'Originele verpakking medicijnen'],
  ['kinderen-documenten', 'Verwijzing reizen met minderjarig kind'],
  ['reisverzekering-oranje-rood', 'Waarschuwing dekking bij oranje/rood'],
  ['reisverzekering-familie', 'Familie laten weten hoe u verzekerd bent'],
  ['criminaliteit-themapagina', 'Verwijzing themapagina criminaliteit'],
  ['lhbtiq-verwijzing', 'Verwijzing themapagina lhbtiq+'],
  ['vaccinaties-ggd', 'Verwijzing GGD Reisvaccinaties'],
  ['vaccinaties-lcr', 'Verwijzing LCR'],
  ['paspoort-kopie', 'Kopie van het paspoort delen'],
  ['informatieservice-vaste-tekst', 'Oproep Informatieservice'],
  ['rood-herhaling-voorbereiding', 'Herhaling waarschuwing bij volledig rood'],
  ['vaste-tekst-land-leeg', 'Landnaam niet ingevuld in een vaste tekst'],
];

const isLinkZin = (b) => b.regel === 'zin-max-woorden' && /met link/.test(b.boodschap);
const SCHRIJF = [
  ['Te lange zin, zonder link (max. 15 woorden)', (b) => b.regel === 'zin-max-woorden' && !isLinkZin(b)],
  ['Te lange zin, met link (max. 20 woorden)', isLinkZin],
  ['Lijdende vorm', regel('zin-lijdende-vorm')],
  ['Twijfeltaal: misschien, mogelijk …', regel('zin-twijfeltaal')],
  ['Twijfeltaal: vaak, soms, regelmatig …', regel('zin-frequentiewoord')],
  ['Alinea boven 80 woorden', regel('alinea-max-woorden')],
  ['Meer dan 2 vragen achter elkaar', regel('vragen-opeenvolgend')],
];

const LINKS = [
  ['link-tekstlengte', 'Linktekst boven 70 tekens'],
  ['link-plakt-aan-woord', 'Link plakt aan het woord ervoor'],
  ['url-lengte', 'Url te lang'],
  ['link-ook-nuttig-max', 'Te veel links onder Ook nuttig'],
  ['link-verboden-partij', 'Link naar een partij waar we niet naar linken'],
];

const groep = (id) => (REGELDATA.groepen.groepen.find((g) => g.id === id) || { regels: [] }).regels;
const NOTATIE = groep('notatie').filter((id) => !['alinea-max-woorden', 'vragen-opeenvolgend'].includes(id));
const NOTATIE_NAAM = {
  'aanhalingstekens': 'Aanhalingstekens', 'opmaak-vet-onderstreept': 'Vet of onderstreept',
  'opmaak-cursief': 'Cursief', 'titel-leestekens': 'Leestekens in de titel', 'titel-max-tekens': 'Titel te lang',
  'eenheden-voluit': 'Eenheden voluit (kilometer)', 'schuine-streep': 'Spaties rond een schuine streep',
  'genderneutraal': 'Niet genderneutraal', 'telefoon-notatie': 'Notatie telefoonnummer',
  'getallen-cijfers': 'Getallen in cijfers', 'percentage-notatie': 'Notatie percentage',
  'valuta-notatie': 'Notatie bedragen', 'tijd-notatie': 'Notatie tijd', 'datum-notatie': 'Notatie datum',
  'afkortingen-uitschrijven': 'Afkortingen uitschrijven', 'tussenkop-leestekens': 'Leestekens in een tussenkop',
  'tussenkop-lidwoord': 'Tussenkop begint met een lidwoord', 'tussenkop-max-woorden': 'Tussenkop te lang',
  'tussenkop-vraagvorm': 'Tussenkop in vraagvorm na een vraagtitel', 'intro-max-woorden': 'Intro te lang',
  'intro-geen-vraag-na-vraagtitel': 'Intro begint met een vraag na een vraagtitel',
  'lhbtiq-schrijfwijze': 'Schrijfwijze lhbtiq+', 'metadescription-lengte': 'Metadescription te lang',
  'opsomming-puntkomma': 'Puntkomma in een opsomming', 'rangtelwoord-notatie': 'Notatie rangtelwoord',
  'schrijfwijze-vast': 'Vaste schrijfwijze van een woord', 'tekst-negatieve-lading': 'Woord met een negatieve lading',
};

const SPEURNEUS = [
  ['tekst-spatie-leesteken', 'Spatie voor een leesteken'],
  ['tekst-onzichtbaar-teken', 'Onzichtbaar teken in de tekst'],
  ['nederlands-verbuiging', 'Nederlands/Nederlandse'],
  ['tekst-dubbel-woord', 'Woord twee keer achter elkaar'],
  ['tekst-plakfout', 'Spatie vergeten na een punt'],
  ['postplaats-schrijfwijze', 'Schrijfwijze van een postplaats'],
  ['landnaam-schrijfwijze', 'Schrijfwijze van een landnaam'],
  ['tekst-cms-rest', 'Rest van het CMS in de tekst'],
  ['woord-onbekend', 'Mogelijke spelfout (woordenlijst)'],
];
const speurneusRegels = [...groep('tekstfouten'), ...groep('spelling')];

// Elke regel hoort in precies één deel. Komt er een regel bij die hier nergens staat, dan zegt het
// script dat, in plaats van hem stilletjes weg te laten.
const ids = (lijst) => lijst.map(([id]) => id);
const deel1 = [...NIET_IN_ADVIES, ...ids(LENGTE), ...ids(IN_HET_KORT), ...ids(KLEUR), ...ids(OPBOUW)];
const deel2 = [...ids(VAST), 'zin-max-woorden', 'zin-lijdende-vorm', 'zin-twijfeltaal', 'zin-frequentiewoord',
  'alinea-max-woorden', 'vragen-opeenvolgend', ...ids(LINKS), ...NOTATIE, ...speurneusRegels];
const ingedeeld = new Set([...deel1, ...deel2]);
const nietIngedeeld = [...new Set(nu.flatMap((r) => r.bevindingen.map((b) => b.regel)))].filter((id) => !ingedeeld.has(id));
if (nietIngedeeld.length) console.warn('Niet ingedeeld in het overzicht:', nietIngedeeld.join(', '));

// ---------- schrijven ----------

const fmt = (x) => `${x.adviezen} (${x.meldingen})`;
const tabel = (rijen) => [
  `| | ${EERSTE.datum} | nu |`,
  '|---|---:|---:|',
  ...rijen.filter((r) => r.toen.meldingen || r.nu.meldingen)
    .sort((a, b) => b.nu.adviezen - a.nu.adviezen || b.toen.adviezen - a.toen.adviezen)
    .map((r) => `| ${r.wat} | ${fmt(r.toen)} | ${fmt(r.nu)} |`),
];
const perRegel = (lijst) => tabel(lijst.map(([id, wat]) => rij(wat, regel(id))));
const metIets = (res, past) => res.filter((r) => r.bevindingen.some(past)).length;
const oogRij = (wat, past) => `| ${wat} | ${metIets(toen, past)} | ${metIets(nu, past)} |`;

const teBespreken = (res, sleutel) => ({
  adviezen: res.filter((r) => r.samenvatting.teBespreken[sleutel].length).length,
  meldingen: res.reduce((s, r) => s + r.samenvatting.teBespreken[sleutel].length, 0),
});

// De vaste sjabloonzinnen die zelf boven de norm zitten: uit het rapport daarover, dat hierboven
// opnieuw is gedraaid. Alleen de tabel, zonder de kolom "soort".
const normRapport = readFileSync(join(wortel, 'data', 'vaste-teksten-boven-de-norm.md'), 'utf8').split('\n');
const normRijen = normRapport.slice(normRapport.findIndex((l) => l.startsWith('| woorden')) + 2)
  .filter((l, i, a) => l.startsWith('|') && a.slice(0, i).every((x) => x.startsWith('|')))
  .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
  .map(([woorden, adviezen, , link, zin]) => `| ${woorden}${link === 'ja' ? ' (met link)' : ''} | ${adviezen} | ${zin} |`);

const uit = [
  '# Totaaloverzicht reisadviezen',
  '',
  `Gedraaid op ${new Date().toISOString().slice(0, 10)} over ${nu.length} reisadviezen. De kolom`,
  `*${EERSTE.datum}* is de eerste meting: de teksten van toen, door de regels van nu. Zo zegt het`,
  'verschil alleen wat er in de adviezen is veranderd.',
  '',
  'Elke cel: **in hoeveel adviezen** (hoeveel meldingen in totaal).',
  '',
  'Het overzicht heeft twee delen:',
  '',
  '1. **Inhoudelijke keuzes over het format**: wat er in een reisadvies hoort, hoe lang het mag zijn',
  '   en hoe het is opgebouwd. Bron: de matrix en de opbouw uit het sjabloon.',
  '2. **Taalkeuzes**: de vaste zinnen uit het sjabloon, en de schrijfregels uit de schrijfwijzer.',
  '',
  'Wat besproken moet worden, staat in [`regels/TER-BESPREKING.md`](../regels/TER-BESPREKING.md).',
  '',
  '## In één oogopslag',
  '',
  `| aantal adviezen | ${EERSTE.datum} | nu |`,
  '|---|---:|---:|',
  `| **Format: minstens één afwijking** | **${metIets(toen, regel(...deel1))}** | **${metIets(nu, regel(...deel1))}** |`,
  oogRij('Onderwerp dat er niet in hoort', regel(...NIET_IN_ADVIES)),
  oogRij('Te lang (woorden, rubrieken, bullets, Actueel)', regel(...ids(LENGTE))),
  oogRij('"In het kort" niet volgens de opbouw', regel(...ids(IN_HET_KORT))),
  oogRij('Kleurcodeformulering niet volgens de matrix', regel(...ids(KLEUR))),
  `| **Taal: vaste zin uit het sjabloon ontbreekt of wijkt af** | **${metIets(toen, regel(...ids(VAST)))}** | **${metIets(nu, regel(...ids(VAST)))}** |`,
  `| **Taal: schrijfwijzer** | **${metIets(toen, regel(...deel2.filter((id) => !ids(VAST).includes(id))))}** | **${metIets(nu, regel(...deel2.filter((id) => !ids(VAST).includes(id))))}** |`,
  oogRij('Te lange zin', regel('zin-max-woorden')),
  oogRij('Lijdende vorm', regel('zin-lijdende-vorm')),
  oogRij('Twijfeltaal', regel('zin-twijfeltaal', 'zin-frequentiewoord')),
  oogRij('Tekst- of spelfout (SpellingSpeurneus)', regel(...speurneusRegels)),
  '',
  '---',
  '',
  '# Deel 1. Inhoudelijke keuzes over het format',
  '',
  '## 1.1 Onderwerpen die volgens de matrix niet in een reisadvies horen',
  '',
  'Als eigen kop (H3 of H4) of in de lopende tekst. *Verkeersongevallen* mag alleen bij uitzondering;',
  'de tool vraagt dan of dat hier zo is. De andere onderwerpen horen er niet in.',
  '',
  ...tabel(perOnderwerp),
  '',
  '## 1.2 Lengte',
  '',
  ...perRegel(LENGTE),
  '',
  '## 1.3 "In het kort"',
  '',
  'Bullets die elk één kleurcode uitleggen. Is er een actualiteit, dan staat die in bullet 1, verwijst',
  'hij naar Actueel en telt hij maximaal 25 woorden (zie 1.2). Bij uitzondering verwijst hij naar een',
  'andere rubriek, zoals Natuurgeweld bij bosbranden of Paspoort, visum bij veel klantvragen.',
  '',
  ...perRegel(IN_HET_KORT),
  '',
  '## 1.4 Kleurcodes',
  '',
  ...perRegel(KLEUR),
  '',
  '## 1.5 Rubrieken en koppen',
  '',
  ...perRegel(OPBOUW),
  '',
  '---',
  '',
  '# Deel 2. Taalkeuzes',
  '',
  '## 2.1 Sjabloon: vaste zinnen die ontbreken of afwijken',
  '',
  ...perRegel(VAST),
  '',
  '## 2.2 Sjabloon: vaste zinnen die zelf te lang zijn',
  '',
  'Deze zinnen staan zo in het sjabloon, maar komen boven de grens van de schrijfwijzer: 15 woorden,',
  'of 20 als er een link in staat. De tool meldt ze niet, want de redacteur volgt het sjabloon. Inkorten',
  'gebeurt in het sjabloon; daarna toetst de tool de nieuwe zin gewoon mee.',
  '',
  '| woorden | in hoeveel adviezen | zin |',
  '|---:|---:|---|',
  ...normRijen,
  '',
  `Daarnaast staat er twijfeltaal in een paar voorbeeldzinnen van het sjabloon, zoals "In … zijn `
    + `regelmatig demonstraties". Dat staat nu in ${teBespreken(nu, 'twijfelUitSjabloon').adviezen} adviezen `
    + `(${teBespreken(nu, 'twijfelUitSjabloon').meldingen} keer). Ook dat meldt de tool niet.`,
  '',
  '## 2.3 Schrijfwijzer: zinnen',
  '',
  'Zinnen in alinea\'s en in bullets. De actualiteit in "In het kort" heeft zijn eigen grens (zie 1.2).',
  '',
  ...tabel(SCHRIJF.map(([wat, past]) => rij(wat, past))),
  '',
  '## 2.4 Schrijfwijzer: links',
  '',
  ...perRegel(LINKS),
  '',
  '## 2.5 Schrijfwijzer: notatie en opmaak',
  '',
  ...tabel(NOTATIE.map((id) => rij(NOTATIE_NAAM[id] || id, regel(id)))),
  '',
  '## 2.6 Tekst- en spelfouten (SpellingSpeurneus)',
  '',
  'De controles die de tool van SpellingSpeurneus heeft overgenomen. Bij de spelfouten zijn de meeste',
  'meldingen plaatsnamen die niet in de woordenlijst staan.',
  '',
  ...tabel([...SPEURNEUS.map(([id, wat]) => rij(wat, regel(id))),
    rij('**Samen**', regel(...speurneusRegels))]),
  '',
];

writeFileSync(join(wortel, 'data', 'totaaloverzicht.md'), uit.join('\n'));
console.log(`Toen ${toen.length}, nu ${nu.length} adviezen. Rapport: data/totaaloverzicht.md`);
