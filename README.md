# Reisadvies-Reviewer

Toetst reisadviezen van Nederlandwereldwijd.nl op de dingen die objectief te toetsen zijn:
de schrijfwijzer, de onderwerpen-matrix, B1 en begrijpelijkheid. Over politieke gevoeligheden
doet de tool geen uitspraak — die weging blijft mensenwerk. Zie `STRATEGY.md`.

## Twee lagen

**Harde regels** (`src/regels.js`) draaien in code, zonder model. Woordenaantallen, de vaste
kleurcode-formuleringen, de koppen uit de matrix, zinslengte, en de schrijfregels uit de
schrijfwijzer. Reproduceerbaar en gratis, dus bruikbaar over alle 227 adviezen tegelijk.

**Oordeelsregels** vragen een model: B1-woordmoeilijkheid, begrijpelijkheid, en of een
onderwerp dat de matrix als *verwijzen* aanmerkt niet te ver is uitgeschreven. Deze laag draait
per advies, op verzoek, en doet een herschrijfvoorstel op zinsniveau.

Elke bevinding draagt zijn bron mee. `regels/HERKOMST.md` legt per regel-id vast waar in de
schrijfwijzer of de matrix hij vandaan komt — een bevinding zonder bron hoort de tool niet te geven.

## De pagina

Het prototype is een gepubliceerde Artifact: geen installatie, deelbaar via een link, geen
interne hosting nodig. De harde regels draaien in de pagina zelf; de oordeelstoets vraagt Claude,
waarbij de kijker toestemming geeft. Werkt de oordeelstoets niet, dan blijft de rest gewoon werken.

```bash
node scripts/bouw-pagina.mjs     # vouwt regels, parser en 3 echte adviezen in dist/app.html
```

## Gebruik

```bash
node --test                      # de regels testen
node scripts/fetch-corpus.mjs    # reisadviezen ophalen (zie hieronder)
node scripts/bulk.mjs            # alle adviezen toetsen -> data/bulkrapport.md
```

## Het corpus ophalen

De open data v2 API zit op
`https://opendata.nederlandwereldwijd.nl/v2/sources/nederlandwereldwijd/infotypes/countries/<code>/traveladvice`,
met de ISO-code of de `locationKey` uit `regels/landen.json` (227 landen; vier codes zijn geen
ISO-3166 alfa-3 en gaan via de locationKey).

De Claude Code-ontwikkelomgeving zit achter een netwerk-allowlist die alleen GitHub en de
package-registries doorlaat, dus het ophalen gebeurt op een GitHub Actions-runner:
workflow **Corpus ophalen** (`.github/workflows/corpus.yml`), handmatig te starten of wekelijks.
De runner commit het corpus terug naar de repo, zodat het daarna voor iedereen beschikbaar is.

## Bestanden

| pad | wat |
|---|---|
| `regels/*.json` | de regelset als data: matrix, kleurcode-teksten, woordenlijsten, limieten, landen |
| `regels/HERKOMST.md` | per regel-id de vindplaats in de schrijfwijzer of de matrix |
| `src/parse.js` | reisadvies naar een genormaliseerd document (koppen, alinea's, zinnen, links) |
| `src/regels.js` | de harde regels, als pure functies |
| `src/adapter.js` | ruwe API-respons naar de velden die de toetser nodig heeft |
| `scripts/fetch-corpus.mjs` | ophalen van de reisadviezen |
| `scripts/bulk.mjs` | alle adviezen toetsen en een rapport schrijven |
| `src/app.html` | de paginasjabloon; `scripts/bouw-pagina.mjs` vouwt de regels erin |
| `tests/` | per regel een fixture die faalt en een die slaagt |

`src/parse.js` en `src/regels.js` hebben geen dependencies en geen buildstap, zodat dezelfde
code in Node draait (tests, bulkslag) en in de browser (de deelbare prototypepagina).

## Wat de bulkslag oplevert

Over 226 live reisadviezen (`data/bulkrapport.md`): 41 zitten boven de woordenlimiet, gemiddeld
9 eigen fouten per advies, en 25 adviezen bevatten een onderwerp dat de matrix als *niet melden*
aanmerkt. Een flink deel van de overige bevindingen komt uit de standaardtekst: acht zinnen die in
ruim 200 adviezen woordelijk hetzelfde staan. Die zijn met één aanpassing tegelijk opgelost, en
het rapport zet ze daarom apart.

## Over de regels

Een regel die op bijna elk advies afgaat is vrijwel altijd de regel, niet de tekst. Vier regels
gingen zo de eerste keer onderuit en zijn bijgesteld; de geschiedenis daarvan staat in de
commits. Houd die norm aan bij nieuwe regels: toets een nieuwe regel eerst tegen het hele corpus
voordat je hem gelooft.
