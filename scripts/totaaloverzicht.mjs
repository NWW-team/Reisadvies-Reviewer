/**
 * Totaaloverzicht voor het gesprek met de manager en de coördinator van de reisadviezen: in
 * hoeveel adviezen staat iets niet volgens het format, toen en nu?
 *
 * "Toen" is het eerste corpus (commit 3fd493fa). Het is op 18 september 2026 vastgelegd, maar de
 * teksten zijn van 14 september: alle 226 zeggen "Nog steeds geldig op: 14-09-2026". "Nu" is
 * data/corpus. Beide gaan door dezelfde, huidige regels, zodat het verschil alleen zegt wat er in
 * de teksten is veranderd en niet wat er aan de tool is veranderd.
 *
 *   node scripts/totaaloverzicht.mjs
 *
 * Uitvoer: data/totaaloverzicht.md
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

const NIET_IN_ADVIES = ['h3-niet-melden', 'h3-alleen-bij-uitzondering', 'h4-niet-melden', 'tekst-niet-melden'];
const onderwerpen = new Set();
for (const r of [...toen, ...nu]) for (const b of r.bevindingen) {
  if (NIET_IN_ADVIES.includes(b.regel)) onderwerpen.add(onderwerp(b));
}
const perOnderwerp = [...onderwerpen].map((o) =>
  rij(o, (b) => NIET_IN_ADVIES.includes(b.regel) && onderwerp(b) === o));

const KLEUR = [
  ['kleur-variant', 'Volledige of verkorte kleurtekst niet zoals de matrix voorschrijft (erheen/hierheen)'],
  ['kleur-aanduiding', 'Kleurcode niet op een van de vaste manieren aangeduid'],
  ['kleur-eerste-bullet-voluit', 'Eerste kleurbullet niet voluit'],
  ['kleur-vervolg-bullet-kort', 'Vervolgbullet voluit in plaats van verkort'],
  ['kleur-vaste-tekst', 'Vaste handelingsinstructie bij een kleur ontbreekt'],
  ['kleur-formulering-verboden', 'Kleur genoemd zonder het woord kleurcode'],
  ['regionaal-kleur-kop', "Vast kopje per kleur onder Regionale risico's ontbreekt"],
  ['regionaal-kleur-tekst', "Vaste uitleg per kleur onder Regionale risico's wijkt af"],
  ['kort-verwijzing-hoogste-kleur', "Verwijzing naar Regionale risico's niet bij de hoogste kleur"],
  ['kort-verwijst-regionaal', "In het kort verwijst niet naar Regionale risico's"],
  ['kort-verwijzing-vorm', 'Verwijzing niet in de vorm "Lees meer onder …"'],
  ['kleur-gebieden-max', 'Meer dan 5 gebieden per kleur'],
];

const VAST = [
  ['nood-contactcenter', 'Contactcenter (24/7 bereikbaar)'],
  ['reisverzekering-vaste-tekst', 'Openingstekst reisverzekering'],
  ['reisverzekering-oranje-rood', 'Waarschuwing dekking bij oranje/rood'],
  ['regionaal-gebiedenzin', "Aanhef boven de gebieden in Regionale risico's"],
  ['kinderen-paspoort', 'Zin over paspoort voor kinderen'],
  ['kinderen-documenten', 'Verwijzing reizen met minderjarig kind'],
  ['bagage-heen', 'Douaneregels van het land zelf'],
  ['bagage-terug', "Verwijzing 'Wat mag ik meenemen naar Nederland?'"],
  ['rijbewijs-anwb', 'Verwijzing naar de ANWB bij rijbewijs'],
  ['intro-vaste-tekst', 'Vaste introductietekst'],
  ['nood-lokale-hulpdiensten', 'Aanhef boven de alarmnummers'],
  ['nood-verwijzing-nood', 'Verwijzing naar de pagina over nood'],
  ['nood-verwijzing-crisis', 'Verwijzing naar de pagina over een crisis'],
  ['medicijnen-voldoende', 'Voldoende medicijnen meenemen'],
  ['medicijnen-verklaring', 'Medicijnverklaring'],
  ['medicijnen-verpakking', 'Originele verpakking medicijnen'],
  ['vaccinaties-ggd', 'Verwijzing GGD Reisvaccinaties'],
  ['vaccinaties-lcr', 'Verwijzing LCR'],
  ['criminaliteit-themapagina', 'Verwijzing themapagina criminaliteit'],
  ['lhbtiq-verwijzing', 'Verwijzing themapagina lhbtiq+'],
  ['paspoort-kopie', 'Kopie van het paspoort delen'],
  ['informatieservice-vaste-tekst', 'Oproep Informatieservice'],
  ['rood-herhaling-voorbereiding', 'Herhaling waarschuwing bij volledig rood'],
  ['vaste-tekst-land-leeg', 'Landnaam niet ingevuld in een vaste tekst'],
];

const OPBOUW = [
  ['doc-woordenaantal', 'Boven de woordenlimiet'],
  ['rubrieken-max', 'Meer rubrieken dan toegestaan (max. 6)'],
  ['actueel-max-woorden', 'Actueel-bullet boven 25 woorden'],
  ['kort-max-bullets', 'In het kort meer dan 4 bullets'],
  ['h2-ontbreekt', 'Vaste H2 ontbreekt'],
  ['h2-vast', 'H2 die geen vaste kop is'],
  ['h3-vaste-kop', 'Rubriek die geen vaste kop is'],
  ['h4-kop-variant', 'Tussenkop heet elders anders'],
  ['h4-natuurrisico', 'Tussenkop onder Natuurgeweld noemt geen risico'],
  ['link-verboden-partij', 'Link naar een partij waar we niet naar linken'],
  ['rubriek-bovenaan', "Actueel of Regionale risico's niet bovenaan"],
];

// SpellingSpeurneus: de filters Tekstfouten en Mogelijke spelfouten.
const groep = (id) => (REGELDATA.groepen.groepen.find((g) => g.id === id) || { regels: [] }).regels;
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

const SCHRIJF = [
  ['zin-max-woorden', 'Zin boven 15 woorden (zonder link)'],
  ['zin-lijdende-vorm', 'Lijdende vorm'],
  ['link-tekstlengte', 'Linktekst boven 70 tekens'],
  ['zin-twijfeltaal', 'Twijfeltaal: misschien, mogelijk …'],
  ['zin-frequentiewoord', 'Twijfeltaal: vaak, soms, regelmatig …'],
  ['aanhalingstekens', 'Aanhalingstekens'],
  ['rubrieken-volgorde', 'Volgorde van de rubrieken (ter overweging)'],
  ['rubriek-vrij-te-hoog', 'Vrije rubriek te hoog (ter overweging)'],
];

// ---------- schrijven ----------

const fmt = (x) => `${x.adviezen} (${x.meldingen})`;
const tabel = (rijen, { metToen = true } = {}) => [
  metToen ? `| | ${EERSTE.datum} | nu |` : '| | nu |',
  metToen ? '|---|---:|---:|' : '|---|---:|',
  ...rijen.filter((r) => r.toen.meldingen || r.nu.meldingen)
    .sort((a, b) => b.nu.adviezen - a.nu.adviezen || b.toen.adviezen - a.toen.adviezen)
    .map((r) => metToen ? `| ${r.wat} | ${fmt(r.toen)} | ${fmt(r.nu)} |` : `| ${r.wat} | ${fmt(r.nu)} |`),
];
const totaalRij = (wat, ids) => rij(wat, (b) => ids.includes(b.regel));
const metIets = (res, past) => res.filter((r) => r.bevindingen.some(past)).length;

const formatRegels = [...NIET_IN_ADVIES, ...KLEUR.map(([id]) => id), ...VAST.map(([id]) => id),
  ...OPBOUW.map(([id]) => id)];
const isFormat = (b) => formatRegels.includes(b.regel);

const teBespreken = (res, sleutel) => ({
  adviezen: res.filter((r) => r.samenvatting.teBespreken[sleutel].length).length,
  meldingen: res.reduce((s, r) => s + r.samenvatting.teBespreken[sleutel].length, 0),
});

const regels = [
  '# Totaaloverzicht reisadviezen',
  '',
  `Gedraaid op ${new Date().toISOString().slice(0, 10)} over ${nu.length} reisadviezen. De kolom`,
  `*${EERSTE.datum}* is de eerste meting: de teksten van toen, door de regels van nu. Zo zegt het`,
  'verschil alleen wat er in de adviezen is veranderd.',
  '',
  'Elke cel: **in hoeveel adviezen** (hoeveel meldingen in totaal).',
  '',
  '## In één oogopslag',
  '',
  `| | ${EERSTE.datum} | nu |`,
  '|---|---:|---:|',
  `| Adviezen met minstens één afwijking van het format | ${metIets(toen, isFormat)} | ${metIets(nu, isFormat)} |`,
  `| Adviezen met een onderwerp dat er niet in hoort | ${metIets(toen, regel(...NIET_IN_ADVIES))} | ${metIets(nu, regel(...NIET_IN_ADVIES))} |`,
  `| Adviezen met een kleurformulering die niet klopt | ${metIets(toen, regel(...KLEUR.map(([id]) => id)))} | ${metIets(nu, regel(...KLEUR.map(([id]) => id)))} |`,
  `| Adviezen waar een vaste tekst ontbreekt of afwijkt | ${metIets(toen, regel(...VAST.map(([id]) => id)))} | ${metIets(nu, regel(...VAST.map(([id]) => id)))} |`,
  `| Adviezen boven de woordenlimiet | ${metIets(toen, regel('doc-woordenaantal'))} | ${metIets(nu, regel('doc-woordenaantal'))} |`,
  `| Adviezen met een fout uit SpellingSpeurneus | ${metIets(toen, regel(...speurneusRegels))} | ${metIets(nu, regel(...speurneusRegels))} |`,
  `| Adviezen met een zin boven 15 woorden (zonder link) | ${metIets(toen, regel('zin-max-woorden'))} | ${metIets(nu, regel('zin-max-woorden'))} |`,
  '',
  '## Onderwerpen die volgens de matrix niet in een reisadvies horen',
  '',
  'Als eigen kop (H3 of H4) of in de lopende tekst. *Verkeersongevallen* mag alleen bij uitzondering;',
  'de tool vraagt dan of dat hier zo is.',
  '',
  ...tabel(perOnderwerp),
  '',
  '## Kleurcodes: formulering niet volgens de matrix',
  '',
  ...tabel(KLEUR.map(([id, wat]) => rij(wat, regel(id)))),
  '',
  '## Vaste teksten uit het sjabloon die ontbreken of afwijken',
  '',
  ...tabel(VAST.map(([id, wat]) => rij(wat, regel(id)))),
  '',
  '## Opbouw en lengte',
  '',
  ...tabel(OPBOUW.map(([id, wat]) => rij(wat, regel(id)))),
  '',
  '## Fouten uit SpellingSpeurneus',
  '',
  'De controles die de tool van SpellingSpeurneus heeft overgenomen. Veel daarvan zijn sinds de eerste',
  'meting al opgelost.',
  '',
  ...tabel([...SPEURNEUS.map(([id, wat]) => rij(wat, regel(id))),
    totaalRij('**Samen**', speurneusRegels)]),
  '',
  '## Schrijfregels',
  '',
  ...tabel(SCHRIJF.map(([id, wat]) => rij(wat, regel(id)))),
  '',
  '## Niet in de tool, wel ter bespreking',
  '',
  'Deze meldt de tool met opzet niet: ze liggen ter bespreking (zie `regels/TER-BESPREKING.md`).',
  '',
  `| | ${EERSTE.datum} | nu |`,
  '|---|---:|---:|',
  `| Zin boven 15 woorden mét een link erin | ${fmt(teBespreken(toen, 'langeZinMetLink'))} | ${fmt(teBespreken(nu, 'langeZinMetLink'))} |`,
  `| Twijfeltaal uit een voorbeeldzin van het sjabloon | ${fmt(teBespreken(toen, 'twijfelUitSjabloon'))} | ${fmt(teBespreken(nu, 'twijfelUitSjabloon'))} |`,
  '',
  'De vaste sjabloonzinnen die zelf langer zijn dan 15 woorden staan in',
  '[`vaste-teksten-boven-de-norm.md`](vaste-teksten-boven-de-norm.md).',
  '',
];

writeFileSync(join(wortel, 'data', 'totaaloverzicht.md'), regels.join('\n'));
console.log(`Toen ${toen.length}, nu ${nu.length} adviezen. Rapport: data/totaaloverzicht.md`);
