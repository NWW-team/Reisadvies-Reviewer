# Ter bespreking

Drie lijsten voor het gesprek met de manager en de coördinator van de reisadviezen. De aantallen
komen uit [`data/totaaloverzicht.md`](../data/totaaloverzicht.md), gemeten op 24 november 2026 over
alle 226 reisadviezen. De bespreekpunten volgen dezelfde indeling als het overzicht: inhoudelijke
keuzes over het format, en taalkeuzes.

1. **Bespreekpunten**: waar format en praktijk uit elkaar lopen. Per punt is de vraag: houden we
   de regel aan en passen we de adviezen aan? Of passen we de regel aan en leggen we dat vast?
2. **Nog vastleggen?**: wat de tool al goedkeurt, maar wat nog niet in de matrix of het sjabloon
   staat. Per punt een advies of het in de richtlijnen hoort.
3. **Later**: wat bewust nog even blijft liggen.

Zodra een bron is bijgewerkt en de tool de nieuwe versie gebruikt, toetst de tool vanzelf mee.

## 1. Bespreekpunten

## 1A. Inhoudelijke keuzes over het format

### Onderwerpen die volgens de matrix niet in een reisadvies horen

De tool meldt deze. Ze staan in de adviezen, terwijl de afspraak is dat ze er niet of alleen bij
uitzondering in komen.

| onderwerp | in hoeveel adviezen |
|---|---:|
| Foto's maken | 66 |
| Verkeersongevallen | 41 |
| Geldzaken | 23 |
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

### Lengte

| | in hoeveel adviezen |
|---|---:|
| Advies boven de woordenlimiet (1500 bij één kleurcode, 2000 bij meer) | 47 |
| Meer dan 6 rubrieken onder de veiligheidsrisico's of de reisvoorbereiding | 39 |
| Actualiteit in "In het kort" boven 25 woorden | 11 |

Vraag: houden we deze grenzen aan? Bij de woordenlimiet wijst de tool de langste rubrieken aan; vaak
zit de ruimte in Regionale risico's.

### "In het kort": de actualiteit

Afgesproken: de bullets leggen de kleurcode uit, één kleurcode per bullet. Een actualiteit staat in
bullet 1 en verwijst naar Actueel. Bij uitzondering verwijst hij rechtstreeks naar een rubriek:
Natuurgeweld bij een groot risico in een bepaalde periode, of een rubriek waar veel klantvragen over
komen (de ETA voor het VK).

| | in hoeveel adviezen |
|---|---:|
| Meer dan één actualiteit | 8 |
| Actualiteit verwijst naar een andere rubriek dan Actueel | 10 |
| Actualiteit staat niet in bullet 1 | 1 |

Vraag: is dit de afspraak, en zo ja, moet dat in de matrix? Die zegt nu alleen "actuele ontwikkeling
… met verwijzing naar Actueel", zonder de uitzonderingen.

## 1B. Taalkeuzes

### Vaste zinnen uit het sjabloon die zelf boven de norm zitten

Deze formuleringen uit het sjabloon zijn zelf langer dan de schrijfwijzer toestaat: 15 woorden, of
20 als er een link in de zin staat. De tool meldt ze niet, want de redacteur volgt het sjabloon. Op
volgorde van hoe vaak ze voorkomen:

| woorden | in hoeveel adviezen | zin |
|---:|---:|---|
| 21 (met link) | 219 | Bekijk wat u vanuit [land] mee terug mag nemen naar Nederland op de pagina Wat mag ik meenemen naar Nederland? |
| 32 (met link) | 192 | Nederlandse ambassades en consulaten-generaal zijn 24 uur per dag, 7 dagen per week bereikbaar via het contactcenter van NederlandWereldwijd op telefoonnummer +31 247 247 247 of via WhatsApp: +31 857 737 400. |
| 18 of 16 | 157 | (Let op:) Bij een oranje of rood reisadvies passen veel Nederlandse verzekeraars de voorwaarden van hun reisverzekeringen aan. *(18 woorden met "Let op:", zoals in het sjabloon; 16 zonder. 76 adviezen hebben "Let op:", 81 niet.)* |
| 20 | 128 | Neem contact op met de lokale autoriteiten, uw accommodatie of reisorganisatie als u een vraag heeft over de actuele situatie. *(sinds november 2026 "accommodatie" in plaats van "hotel"; de tool meldt de oude vorm als afwijking)* |
| 16 tot 25 | 110 | U leest op de website van de GGD ook meer over ziektes die er voorkomen, zoals dengue (knokkelkoorts), chikungunya … (de lijst verschilt per land) |
| 18 | 97 | Als u in het ziekenhuis belandt, moet u mogelijk naar een ander land worden overgebracht voor medische zorg. *(ook lijdende vorm en twijfeltaal)* |
| 17 | 68 | In [land] is uw Nederlandse rijbewijs alleen geldig als u ook een geldig internationaal rijbewijs heeft. |
| 16 | 58 | Kinderen hebben ook een geldig paspoort en een visum nodig voor een reis naar [land]. |
| 18 | 55 | U heeft geen visum nodig voor [land] als u met een Nederlands paspoort of Nederlandse ID-kaart reist. |
| 16 of 18 | ongeveer 50 | Uw Nederlandse paspoort (of ID-kaart) moet geldig zijn tijdens de hele periode dat u in het land bent. |
| 16 | 42 | Kinderen hebben ook een geldig paspoort of geldige ID-kaart nodig voor een reis naar [land]. |
| 17 | 20 | De wetten en de gebruiken in dit land tegenover lhbtiq+ personen zijn vergelijkbaar met die van Nederland. |
| 21 | 5 | In een noodgeval kunt u ook terecht bij de ambassade van een ander land dat lid is van de Europese Unie. |
| 18 | 3 | Dan moet u een bewijs van vaccinatie tegen gele koorts laten zien als u naar [land] reist. |

Is een zin ingekort in het sjabloon, dan is het daarna geen punt meer: de tool toetst de nieuwe
formulering gewoon mee.

Vraag: kunnen we deze zinnen zo herschrijven dat ze binnen de richtlijn vallen? Vooral de zin over
het contactcenter (32 woorden, met twee telefoonnummers) zou je kunnen opknippen.

### Verwijzingen naar de themapagina's bij natuurrisico's

Het sjabloon van november 2026 heeft bij de voorbeelden onder *Natuurgeweld* een verwijzing naar een
themapagina gekregen:

> Lees wat u verder kunt doen bij een bosbrand in het buitenland.
> Lees wat u verder kunt doen bij een overstroming in het buitenland.
> Lees wat u verder kunt doen bij een aardbeving in het buitenland.

In de adviezen staan ze nu bij de bosbranden 10 keer, de overstromingen 10 keer en de aardbevingen
9 keer, plus 3 keer *"bij een natuurbrand"*. Ze staan in het sjabloon onder *[Bijv.]*, dus de tool
eist ze niet.

Vraag: zijn dit voorbeelden, of moet elk advies dat een van deze risico's noemt de verwijzing
hebben? In het tweede geval worden het vaste teksten en gaat de tool ze controleren.

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

### Linken naar sociale media van een overheid

De schrijfwijzer zegt: we linken naar overheidsinstanties, en niet naar commerciële partijen en media.
Sociale media zijn een commercieel platform, maar het account kan van een overheid zijn. Zes adviezen
linken naar zo'n account:

| advies | link |
|---|---|
| Japan | Facebookpagina van de Nederlandse ambassade in Tokio |
| Rwanda | X-account van de Rwandese Nationale Politie |
| Guatemala | Facebookpagina met verkeersinformatie van de overheid; X-account van het toeristenbureau INGUAT |
| Portugal | X-account met actuele adviezen |
| Tonga | Facebookpagina met informatie over actieve vulkanen |

De tool meldt dit nu als vraag (*let op*): is dit het account van een overheid, en is er geen eigen
website met dezelfde informatie?

Vraag: mag een link naar sociale media van een overheid of de eigen ambassade? Zo ja, dan kan dat in
de schrijfwijzer bij *Naar wie linken we?*

## 2. Nog vastleggen?

De tool keurt deze vormen goed, maar ze staan niet (letterlijk) in de matrix of het sjabloon. Per punt
de vraag: nemen we het op in de richtlijnen, of laten we het alleen in de tool? Opnemen helpt als het
vaak voorkomt en een nieuwe redacteur het anders niet weet.

**1. Een verwijzing vanuit *In het kort* begint altijd met "Lees meer onder …"**
Voorbeeld: *"Lees meer onder Actueel."* of *"Lees meer onder Regionale risico's."*
De matrix zegt alleen *dat* je verwijst, niet *hoe*. Alle 149 verwijzingen in de adviezen doen het al zo.
Advies: **opnemen** in de matrix (tabblad Koppen). Eén zin, en de lezer herkent de verwijzing meteen.

**2. De volgorde van de rubrieken mag afwijken als een risico zwaarder weegt**
Voorbeeld: in de zomer *Natuurgeweld* hoger vanwege bosbranden.
Het sjabloon noemt de volgorde nu dwingend. De tool vraagt alleen of het bewust is.
Advies: **opnemen** in het sjabloon (blok Risico dat van toepassing is): "in volgorde van relevantie;
afwijken mag als een risico in dit land zwaarder weegt".

**3. Een tussenkop onder *Natuurgeweld* noemt het risico, niet de plaats of de activiteit**
Voorbeeld: *"Vulkanen"* of *"Orkanen"*, niet *"Risico's bij sporten of wandelen"*.
Advies: **opnemen** in het sjabloon (blok Natuurgeweld).

**4. De kinderzin: twee varianten**
Voorbeeld: *"Kinderen hebben ook een geldig paspoort en **eventueel** een visum nodig voor een reis naar
[land]."* en *"Kinderen hebben ook een geldig paspoort of geldige ID-kaart nodig **om naar [land] te
reizen**."* (Spanje)
Het sjabloon heeft op die plek het markeringetje `[evt.:]` en alleen *"nodig voor een reis naar"*.
Advies: **opnemen** in het sjabloon (blok Paspoort, visum, rijbewijs): beide varianten zijn correct en
komen vaak voor.

**5. De aanhef boven de gebieden onder Regionale risico's: "eilanden" of "steden" mag ook**
Voorbeeld: *"Voor de volgende eilanden geldt kleurcode rood:"* (de VAE). Vast is *"gebieden"*.
Advies: **opnemen** in het sjabloon (blok Regionale risico's), als korte uitzondering.

**6. "Voor het grootste deel rood"**
Voorbeeld: *"De kleurcode van het reisadvies voor Burkina Faso is voor het grootste deel rood."* Voor als
bijna het hele land één kleur heeft. Komt nu één keer voor.
Advies: **kort noemen** in de matrix (tabblad Kleurcode-teksten, kolom NB), want het wordt af en toe gebruikt.

**7. Een gebied op de plek van het land**
Voorbeeld: *"De kleurcode van het reisadvies voor het zuidoosten van Fukushima is rood."* (Japan)
Advies: **niet opnemen**. Het is één uitzondering in één advies; de tool keurt het al goed.

## 3. Later

- **Namen in de spellingtoets.** Plaatsen, provincies en vulkanen staan niet in de woordenlijst. De tool
  meldt ze als *ter overweging* ("waarschijnlijk een naam"); in het totaaloverzicht tellen ze niet mee
  als spelfout. Hoe we hiermee omgaan, bijvoorbeeld een eigen lijst met goedgekeurde plaatsnamen, besluiten
  we later.

- **Een Word-document uploaden** en de bevindingen als markeringen of track changes in de tekst
  terugzien. Eerst moet de tool zelf goed werken; ook losgeplakte tekst gaat nog niet goed.
