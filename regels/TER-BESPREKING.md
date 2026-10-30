# Ter bespreking

Werklijst voor het gesprek met de manager en de coördinator van de reisadviezen. Hier staan de
punten waar de tool en de praktijk uit elkaar lopen. Per punt is de vraag:

- **Eens met de regel?** Dan gaat het uit de reisadviezen.
- **Niet eens?** Dan passen we de regel aan en leggen we dat vast in de schrijfwijzer, de matrix
  of het sjabloon. Zodra die bron is bijgewerkt en de tool de nieuwe versie gebruikt, verdwijnt
  de melding vanzelf uit de tool.

Dit is nog niet het overzicht zelf. Het overzicht met aantallen per advies volgt; deze lijst
verzamelt alvast wat erin moet.

## Onderwerpen die volgens het format niet in een reisadvies horen

### Verkeersongevallen

Afgesproken was: alleen bij uitzondering. Nu heeft 41 van de 226 reisadviezen er een eigen kop
voor (gemeten 30 oktober 2026).

De argumenten om het niet op te nemen (Martijn, 30 oktober 2026):

- We richten ons op de allerbelangrijkste veiligheidsrisico's. Verkeersrisico is per land
  arbitrair: het hangt sterk af van waar je rijdt (stad of platteland).
- In bijna elk land valt er iets over verkeer te zeggen. Ook in Nederland moet je opletten, en
  als onervaren bestuurder misschien niet zelf rijden.
- De ANWB heeft deze informatie al: de staat van het wegdek, afwijkende verkeersregels,
  chaotisch verkeer. Dat hoeven we niet nog eens te bieden.
- Een reisadvies moet compact blijven; niet alle informatie over een land past erin.
- Uitklapblokken als deze werden in het verleden weinig geopend. Dat is te meten.

Wanneer wel: als er een aantoonbare reden is, een soort business case. Voorbeeld: Thailand en
Indonesië. Daar gaan veel Nederlanders heen, ze huren een "brommer" die eigenlijk een motor is,
rijden zonder helm en vallen. Daar zijn aantoonbaar veel slachtoffers, ook Nederlandse
toeristen.

Vraag: houden we de afspraak aan (alleen bij uitzondering, met onderbouwing) en halen we het uit
de andere adviezen?

### Geldzaken

Ook alleen in heel uitzonderlijke gevallen, bijvoorbeeld als je nergens kunt pinnen en dus veel
contant geld moet meenemen. Een kop *Geldzaken* hoort er volgens het format niet in. Nu staat
hij in 24 van de 226 reisadviezen (gemeten 30 oktober 2026).

## Schrijfregels die knellen

### Lange zinnen met een link

De schrijfwijzer houdt 15 woorden per zin aan. In een zin met een link zit de lengte vaak in de
linktekst. Voorstel: voor zinnen met een link een ruimere grens, bijvoorbeeld 25 woorden. In de
tool staan ze sinds 30 oktober 2026 onder *Ter overweging*, met een eigen filter.

### Vaste sjabloonzinnen boven de norm

Dertien vaste formuleringen uit het sjabloon zijn zelf langer dan 15 woorden; zie
[`data/vaste-teksten-boven-de-norm.md`](../data/vaste-teksten-boven-de-norm.md). De tool meldt
ze niet, want de redacteur volgt het sjabloon. De langste is de zin over het contactcenter
(32 woorden, met twee telefoonnummers). Vraag: kan die worden opgeknipt?

### Twijfeltaal in het sjabloon

Een paar voorbeeldzinnen in het sjabloon bevatten zelf twijfeltaal. De tool meldt die niet meer
als een advies het voorbeeld volgt (`voorbeeld_twijfeltaal` in `regels/sjabloon.json`). In de
meeste gevallen mogen ze blijven, maar ze zijn het waard om nog eens kritisch naar te kijken:

| zin uit het sjabloon | blok |
|---|---|
| In [NAAM LAND] zijn **regelmatig** demonstraties, vooral in de grotere steden. | Demonstraties |
| Als u in het ziekenhuis belandt, moet u **mogelijk** naar een ander land worden overgebracht voor medische zorg. | Reisverzekering |
| Heeft u geen bewijs van vaccinatie tegen gele koorts? Dan komt u **mogelijk** het land niet in. | Reisvaccinaties |
| Dieven proberen **vaak** hun slachtoffers af te leiden. | Criminaliteit (voorbeeld Argentinië) |

De zin over demonstraties staat in 42 adviezen; die meldingen zijn daarmee uit de tool.
