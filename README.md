# Reisadvies-Reviewer

Toetst reisadviezen van Nederlandwereldwijd.nl op de dingen die objectief te toetsen zijn:
de schrijfwijzer, de onderwerpen-matrix, de vaste formuleringen uit het sjabloon, B1 en
begrijpelijkheid. Over politieke gevoeligheden doet de tool geen uitspraak — die weging blijft
mensenwerk. Zie `STRATEGY.md`.

## Twee lagen

**Harde regels** draaien in code, zonder model. Woordenaantallen, de vaste kleurcode-formuleringen,
de koppen uit de matrix, zinslengte, en de schrijfregels uit de schrijfwijzer. Reproduceerbaar en
gratis, dus bruikbaar over alle 226 adviezen tegelijk.

**Oordeelsregels** vragen een model: B1-woordmoeilijkheid, begrijpelijkheid, en of een onderwerp
dat de matrix als *verwijzen* aanmerkt niet te ver is uitgeschreven. Deze laag draait per advies,
op verzoek, en doet een herschrijfvoorstel op zinsniveau.

Elke bevinding draagt zijn bron mee: **SW** = schrijfwijzer, **MX** = format-matrix,
**SJ** = sjabloon. `regels/HERKOMST.md` legt per regel-id de vindplaats vast — een bevinding
zonder bron hoort de tool niet te geven.

## Let op: twee varianten van de pagina naast elkaar

Deze main bevat het resultaat van twee parallel ontwikkelde takken. Ze overlappen:

| pad | wat | stand |
| --- | --- | --- |
| `reisadvies-reviewer.html` | de hele tool in één bestand, zonder build | **nieuwst** — bevat als enige de sjabloonregels (SJ) |
| `src/` + `regels/` + `scripts/bouw-pagina.mjs` → `dist/app.html` | dezelfde tool, opgesplitst in modules en regeldata | heeft als enige het corpus, de bulkslag en de tests per regel |

`reisadvies-reviewer.html` is opgebouwd uit `dist/app.html` (ruim duizend regels zijn woordelijk
gelijk) met de sjabloonregels erbij. De twee zijn nog niet samengevoegd: de SJ-regels zitten
alleen in het losse bestand en nog niet in `regels/*.json` en `src/regels.js`.

**Nog te doen:** de SJ-regels terugbrengen naar `regels/` en `src/regels.js`, `dist/app.html`
opnieuw bouwen met `scripts/bouw-pagina.mjs`, en daarna `reisadvies-reviewer.html` laten vervallen
of juist tot enige bron maken. Kies één van beide voordat er nieuwe regels bij komen.

## Gebruik

```bash
node --test                      # de regels testen (tests/)
node test/toets.js               # samenvatting per voorbeeldadvies
node test/toets-sjabloon.js      # welke sjabloonregels vuren, en waarom
node test/toets-dekking.js       # dekking van de vaste teksten
node scripts/fetch-corpus.mjs    # reisadviezen ophalen (zie hieronder)
node scripts/bulk.mjs            # alle adviezen toetsen -> data/bulkrapport.md
node scripts/bouw-pagina.mjs     # vouwt regels, parser en 3 echte adviezen in dist/app.html
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
| `reisadvies-reviewer.html` | de tool als één bestand, inclusief de sjabloonregels |
| `regels/*.json` | de regelset als data: matrix, kleurcode-teksten, woordenlijsten, limieten, landen |
| `regels/HERKOMST.md` | per regel-id de vindplaats in de schrijfwijzer of de matrix |
| `src/parse.js` | reisadvies naar een genormaliseerd document (koppen, alinea's, zinnen, links) |
| `src/regels.js` | de harde regels, als pure functies |
| `src/adapter.js` | ruwe API-respons naar de velden die de toetser nodig heeft |
| `src/app.html` | de paginasjabloon; `scripts/bouw-pagina.mjs` vouwt de regels erin |
| `scripts/fetch-corpus.mjs` | ophalen van de reisadviezen |
| `scripts/bulk.mjs` | alle adviezen toetsen en een rapport schrijven |
| `data/corpus/` | 226 opgehaalde reisadviezen als XML |
| `tests/` | per regel een fixture die faalt en een die slaagt |
| `test/` | toetsloops over de voorbeeldadviezen en de sjabloonregels |
| `datastromen.html` | overzicht van de datastromen en de opslagkeuzes |

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

## Bronnen

- `Schrijfwijzer Nederland Wereldwijd - website.docx`
- `Matrix nieuwe format Reisadviezen (1).xlsx`
- `Sjabloon Reisadviezen - nieuwe format.docx`
- `Kopie van ISO Landenlijst.xlsx`
