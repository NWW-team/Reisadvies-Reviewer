/**
 * Haalt de goedgekeurde woorden en namen uit SpellingSpeurneus op en zet ze in regels/speurneus.json.
 *
 * SpellingSpeurneus (https://github.com/NWW-team/SpellingSpeurneus) is het spellingtooltje van de
 * redactie. Daar keurt een collega woorden en namen goed in het scherm; die lijst staat sinds
 * oktober 2026 alleen nog in Supabase, in de tabel `goedgekeurd`. Daarnaast is er `naam_is_spelfout`:
 * namen die de redactie juist als verkeerd gespeld heeft aangewezen. Beide tabellen zijn voor
 * iedereen leesbaar met de publieke sleutel, die SpellingSpeurneus zelf in docs/index.html heeft
 * staan. Schrijven doen we hier niet.
 *
 * Draait elke ochtend in de workflow "Corpus ophalen". De Claude Code-omgeving kan *.supabase.co
 * niet bereiken; een Actions-runner wel.
 *
 * Lukt het ophalen niet, of komt er verdacht weinig terug, dan blijft het bestaande bestand staan
 * en eindigt het script met een fout. Een lege lijst zou honderden goede woorden weer als fout
 * melden, en dat zou er uitzien als een gewone toetsronde.
 *
 *   node scripts/haal-speurneus.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const uit = join(wortel, 'regels', 'speurneus.json');

// Uit docs/index.html van SpellingSpeurneus. Wisselt die van sleutel of project, dan hier aanpassen.
const BASIS = process.env.SPEURNEUS_URL || 'https://riwznqurcluudvyrkwxe.supabase.co';
const SLEUTEL = process.env.SPEURNEUS_KEY || 'sb_publishable_8D0tbPlRD5eWqjIJDdQgKg_BxKn2Knx';
const BLOK = 1000; // PostgREST geeft er standaard niet meer dan duizend per verzoek

/** Alle actieve rijen van een tabel. `actief` is de kolom die leeg is zolang de rij geldt. */
async function haal(tabel, kolommen, actief) {
  const rijen = [];
  for (let van = 0; ; van += BLOK) {
    const url = `${BASIS}/rest/v1/${tabel}?select=${kolommen}&${actief}=is.null`
      + `&order=id&limit=${BLOK}&offset=${van}`;
    const r = await fetch(url, {
      headers: { apikey: SLEUTEL, Authorization: `Bearer ${SLEUTEL}` },
      signal: AbortSignal.timeout(60_000),
    });
    if (!r.ok) throw new Error(`${tabel}: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
    const blok = await r.json();
    rijen.push(...blok);
    if (blok.length < BLOK) return rijen;
  }
}

const uniek = (lijst) => [...new Set(lijst.map((w) => String(w).trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, 'nl'));

const vorige = existsSync(uit) ? JSON.parse(readFileSync(uit, 'utf8')) : null;

let goedgekeurd;
let spelfout;
try {
  goedgekeurd = await haal('goedgekeurd', 'woord,soort', 'ingetrokken_op');
  spelfout = await haal('naam_is_spelfout', 'woord', 'teruggezet_op');
} catch (e) {
  console.error(`SpellingSpeurneus niet op te halen (${e.message}). regels/speurneus.json blijft `
    + 'zoals hij was.');
  process.exit(1);
}

const nieuw = {
  woorden: uniek(goedgekeurd.filter((r) => r.soort === 'woord').map((r) => r.woord)),
  namen: uniek(goedgekeurd.filter((r) => r.soort === 'naam').map((r) => r.woord)),
  naam_is_spelfout: uniek(spelfout.map((r) => r.woord)),
};

// Een lijst die ineens minder dan de helft zo lang is, wijst eerder op een kapotte koppeling
// (rechten ingetrokken, andere tabel) dan op een redactie die alles heeft ingetrokken.
const telVorig = vorige ? vorige.woorden.length + vorige.namen.length : 0;
const telNieuw = nieuw.woorden.length + nieuw.namen.length;
if (telNieuw === 0 || telNieuw < telVorig / 2) {
  console.error(`SpellingSpeurneus gaf ${telNieuw} goedgekeurde woorden en namen, vorige keer `
    + `${telVorig}. Dat lijkt op een fout bij het ophalen; regels/speurneus.json blijft staan.`);
  process.exit(1);
}

const telling = `${nieuw.woorden.length} woorden, ${nieuw.namen.length} namen, `
  + `${nieuw.naam_is_spelfout.length} namen als spelfout aangewezen`;
const gelijk = vorige && ['woorden', 'namen', 'naam_is_spelfout']
  .every((k) => JSON.stringify(vorige[k]) === JSON.stringify(nieuw[k]));
if (gelijk) {
  console.log(`SpellingSpeurneus ongewijzigd (${telling}).`);
  process.exit(0);
}

if (vorige) {
  for (const k of ['woorden', 'namen', 'naam_is_spelfout']) {
    const oud = new Set(vorige[k]);
    const erbij = nieuw[k].filter((w) => !oud.has(w));
    const eraf = vorige[k].filter((w) => !nieuw[k].includes(w));
    if (erbij.length) console.log(`${k} erbij: ${erbij.join(', ')}`);
    if (eraf.length) console.log(`${k} eraf: ${eraf.join(', ')}`);
  }
}

writeFileSync(uit, JSON.stringify({
  _bron: 'SpellingSpeurneus (NWW-team), tabellen goedgekeurd en naam_is_spelfout in Supabase. '
    + 'Opgehaald met scripts/haal-speurneus.mjs; niet met de hand bewerken, de volgende ronde '
    + 'overschrijft het. Eigen aanvullingen horen in regels/uitzonderingen.txt.',
  _toelichting: 'woorden en namen tellen als goed gespeld, net als regels/uitzonderingen.txt. '
    + 'naam_is_spelfout wint van allebei: een naam die de redactie als fout heeft aangewezen, '
    + 'telt hier nooit als goed, ook niet als hij in uitzonderingen.txt staat.',
  _opgehaald: new Date().toISOString().slice(0, 10),
  ...nieuw,
}, null, 2) + '\n');
console.log(`regels/speurneus.json bijgewerkt (${telling}).`);
