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
| `tests/` | per regel een fixture die faalt en een die slaagt |

`src/parse.js` en `src/regels.js` hebben geen dependencies en geen buildstap, zodat dezelfde
code in Node draait (tests, bulkslag) en in de browser (de deelbare prototypepagina).

## Bekende beperking

De responsvorm van de open data API is nog niet waargenomen; `src/adapter.js` zoekt de velden
daarom op en rapporteert per veld waar hij ze vond. Zodra één echte respons bekend is hoort daar
een fixture bij in `tests/adapter.test.mjs` en kan de adapter een directe mapping worden.
