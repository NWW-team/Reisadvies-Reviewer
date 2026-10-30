# Ter bespreking

Drie lijsten voor het gesprek met de manager en de coördinator van de reisadviezen. De aantallen
komen uit [`data/totaaloverzicht.md`](../data/totaaloverzicht.md), gemeten op 30 oktober 2026 over
alle 226 reisadviezen.

1. **Bespreekpunten**: waar format en praktijk uit elkaar lopen. Per punt is de vraag: houden we
   de regel aan en passen we de adviezen aan? Of passen we de regel aan en leggen we dat vast?
2. **Nog vastleggen**: wat al besloten is en wat de tool al zo toetst, maar wat nog niet in de
   matrix, het sjabloon of de schrijfwijzer staat.
3. **Later**: wat bewust nog even blijft liggen.

Zodra een bron is bijgewerkt en de tool de nieuwe versie gebruikt, toetst de tool vanzelf mee.

## 1. Bespreekpunten

### Onderwerpen die volgens de matrix niet in een reisadvies horen

De tool meldt deze. Ze staan in de adviezen, terwijl de afspraak is dat ze er niet of alleen bij
uitzondering in komen.

| onderwerp | in hoeveel adviezen |
|---|---:|
| Foto's maken | 66 |
| Verkeersongevallen | 41 |
| Geldzaken | 24 |
| Wilde dieren | 6 |
| Kledingvoorschriften, smog, gezondheidszorg | elk 3 |

**Verkeersongevallen.** Afgesproken was: alleen bij uitzondering. De argumenten om het niet op te
nemen:

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
rijden zonder helm en vallen. Daar zijn aantoonbaar veel slachtoffers, ook Nederlandse toeristen.

**Geldzaken.** Alleen in heel uitzonderlijke gevallen, bijvoorbeeld als je nergens kunt pinnen en
dus veel contant geld moet meenemen.

**Foto's maken.** De matrix zegt: liever niet opnemen. Foto's maken van militairen en dergelijke
moet je nergens doen, dus het is erg algemeen. Alleen opnemen als het een aanzienlijk risico is,
met relatief hoge straffen.

Vraag: houden we deze afspraken aan en halen we deze onderwerpen uit de adviezen waar ze geen
uitzondering zijn?

### Lange zinnen met een link

De schrijfwijzer houdt maximaal 15 woorden per zin aan. **200 adviezen** hebben samen 547 zinnen
die langer zijn én een link bevatten. Daar zit de lengte vaak in de linktekst. De tool meldt ze
niet meer.

Vraag: geldt voor een zin met een link een ruimere grens, bijvoorbeeld 25 woorden? Of geen grens?

### Vaste zinnen uit het sjabloon die zelf boven de 15 woorden zitten

Vijftien formuleringen uit het sjabloon zijn zelf langer dan de schrijfwijzer toestaat. De tool
meldt ze niet, want de redacteur volgt het sjabloon. De meest gebruikte:

| woorden | in hoeveel adviezen | zin |
|---:|---:|---|
| 32 | 192 | Nederlandse ambassades en consulaten-generaal zijn 24 uur per dag, 7 dagen per week bereikbaar via het contactcenter van NederlandWereldwijd op telefoonnummer +31 247 247 247 of via WhatsApp: +31 857 737 400. |
| 17 | 224 | Check of u een medicijnverklaring nodig heeft om uw medicijnen mee te mogen nemen naar [land]. |
| 17 | 222 | Check welke documenten u nodig heeft om te reizen met een minderjarig kind en neem die mee. |
| 17 | 213 | Lees meer op de pagina Hoe voorkom ik dat ik slachtoffer word van criminaliteit in het buitenland? |
| 16 | 179 | Lees hoe u een veilige kopie maakt van uw paspoort op de website van de Rijksoverheid. |
| 18 | 77 | Let op: Bij een oranje of rood reisadvies passen veel Nederlandse verzekeraars de voorwaarden van hun reisverzekeringen aan. |

De volledige lijst staat in [`data/vaste-teksten-boven-de-norm.md`](../data/vaste-teksten-boven-de-norm.md).

Vraag: kunnen we deze zinnen zo herschrijven dat ze binnen de richtlijn vallen? Vooral de zin over
het contactcenter (32 woorden, met twee telefoonnummers) zou je kunnen opknippen.

### Twijfeltaal in de voorbeeldzinnen van het sjabloon

Een paar voorbeeldzinnen in het sjabloon bevatten zelf twijfeltaal. Een redacteur die het voorbeeld
volgt, doet het goed; de tool meldt het daarom niet. In de meeste gevallen mogen ze blijven, maar
ze zijn het waard om nog eens kritisch naar te kijken.

| zin uit het sjabloon | blok | in hoeveel adviezen |
|---|---|---:|
| In [land] zijn **regelmatig** demonstraties, vooral in de grotere steden. | Demonstraties | 42 |
| Als u in het ziekenhuis belandt, moet u **mogelijk** naar een ander land worden overgebracht voor medische zorg. | Reisverzekering | 0 |
| Heeft u geen bewijs van vaccinatie tegen gele koorts? Dan komt u **mogelijk** het land niet in. | Reisvaccinaties | 0 |
| Dieven proberen **vaak** hun slachtoffers af te leiden. | Criminaliteit (voorbeeld Argentinië) | 0 |

## 2. Nog vastleggen

Al besloten, en de tool toetst al zo. Maar het staat nog niet (letterlijk) in de bron, dus wie de
matrix of het sjabloon leest, ziet iets anders dan wat de tool goedkeurt.

| besluit | vastleggen in |
|---|---|
| De omgedraaide vervolgbullet *"Kleurcode oranje geldt voor …"* is een geldige vorm (23 keer gebruikt, gemeten in september). | matrix, tabblad Kleurcode-teksten |
| *"De kleurcode van het reisadvies voor [gebied] is [kleur]"* mag, met een gebied op de plek van het land (Japan: *het zuidoosten van Fukushima*). | matrix, tabblad Kleurcode-teksten |
| Een verwijzing vanuit *In het kort* heeft altijd de vorm *"Lees meer onder …"*. | matrix, tabblad Koppen |
| Een tussenkop onder *Natuurgeweld* noemt het risico (vulkanen, orkanen, overstromingen), niet de plaats of de activiteit. | sjabloon, blok Natuurgeweld |
| In de kinderzin mag *"eventueel"* staan (*"… en eventueel een visum"*), terwijl het sjabloon daar het markeringetje `[evt.:]` heeft. | sjabloon, blok Paspoort, visum, rijbewijs |
| De volgorde van de rubrieken mag afwijken als een risico zwaarder weegt (bijvoorbeeld natuurgeweld in de zomer); de tool vraagt alleen of dat bewust is. Het sjabloon noemt de volgorde nu dwingend. | sjabloon, blok Risico dat van toepassing is |
| Erheen of hierheen: we houden aan wat de matrix zegt (één kleurcode: *erheen*, meer kleurcodes: *hierheen*, ook bij *"de rest van [land]"*). Dat stond op *voorlopig* en is nu definitief. | staat al in de matrix; alleen bevestigen |

## 3. Later

- **Een Word-document uploaden** en de bevindingen als markeringen of track changes in de tekst
  terugzien. Eerst moet de tool zelf goed werken; ook losgeplakte tekst gaat nog niet goed.
