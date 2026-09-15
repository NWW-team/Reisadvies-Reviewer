# Reisadvies-Reviewer

Toetst een reisadvies van Nederlandwereldwijd.nl op wat objectief te toetsen is: de
schrijfwijzer, de onderwerpen-matrix, de vaste formuleringen uit het sjabloon, B1 en
begrijpelijkheid. Zie [STRATEGY.md](STRATEGY.md) voor het doel en de afbakening.

## De tool

`reisadvies-reviewer.html` is de hele tool: één bestand, geen build, geen dependencies.
Het is ook de pagina die als Artifact gepubliceerd staat. De pagina bevat drie modules:

| module | wat het doet |
| --- | --- |
| `Parse` | zet HTML of platte tekst om naar een genormaliseerd document (blokken, zinnen, links, opmaak) |
| `Regels` | de harde regels: pure functies, document in, bevindingen uit |
| `REGELDATA` | de regels als data — matrix, kleurcodes, woordenlijsten, limieten, sjabloon |

Een bevinding noemt altijd zijn bron: **SW** = schrijfwijzer, **MX** = format-matrix,
**SJ** = sjabloon.

De vaste teksten uit het sjabloon gelden als waarheid: de schrijfregels gaan er niet
overheen. De tool meldt alleen dát een vaste tekst ontbreekt, en toont de verwachte
formulering — invullen blijft aan de redacteur, want welke variant klopt hangt van het
land af.

Naast de pagina publiceert de Artifact `corpus.js` met alle 226 live reisadviezen (~2,8 MB).
Dat bestand staat niet in de repo; zonder corpus valt de pagina terug op de drie
ingebouwde voorbeelden, en daar draaien ook de tests op.

De oordeelstoets (B1-woordmoeilijkheid, begrijpelijkheid, herschrijfvoorstellen) draait op
een model en werkt alleen in de gepubliceerde Artifact. De harde regels draaien in de pagina
zelf en in Node.

## Tests

`Parse` en `Regels` draaien ongewijzigd in Node, zodat dezelfde regels de tests en een
bulkslag over alle live adviezen kunnen voeden:

```sh
node test/toets.js            # samenvatting per voorbeeldadvies
node test/toets-sjabloon.js   # welke sjabloonregels vuren, en waarom
node test/toets-dekking.js    # dekking van de vaste teksten + een advies dat alles overtreedt
```

## Bronnen

- `Schrijfwijzer Nederland Wereldwijd - website.docx`
- `Matrix nieuwe format Reisadviezen (1).xlsx`
- `Sjabloon Reisadviezen - nieuwe format.docx`
- `Kopie van ISO Landenlijst.xlsx`
