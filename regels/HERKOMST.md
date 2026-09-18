# Herkomst van de regels

Elke regel die de tool toetst is hier herleidbaar naar zijn bron. Dat is geen administratie om de
administratie: `STRATEGY.md` stelt dat de discussie achteraf ontstaat doordat de toets nu smaak is.
Een bevinding zonder bron is daarom een bevinding die de tool niet hoort te geven.

Twee bronnen:

- **SW** — `Schrijfwijzer Nederland Wereldwijd - website.docx`
- **MX** — `Matrix nieuwe format Reisadviezen (1).xlsx`
- **SJ** — `Sjabloon Reisadviezen - nieuwe format.docx`

## Harde regels (laag 1, in code)

| regel-id | bron | wat |
|---|---|---|
| `doc-woordenaantal` | MX, tab *Richtlijn woordenaantal* | <1500 woorden bij 1 kleurcode, <2000 bij meerdere |
| `kleur-vaste-tekst` | MX, tab *Kleurcode-teksten* | vaste formulering per kleurcode, volledig én deels |
| `kleur-volgorde` | MX, tab *Kleurcode-teksten*, kolom NB | volgorde altijd rood → groen |
| `kleur-eerste-bullet-voluit` | MX, tab *Kleurcode-teksten*, kolom NB | eerste bullet voluit, vervolgbullets verkort |
| `actueel-max-woorden` | MX, tab *Koppen*, rij *In het kort* | de bullet die naar Actueel verwijst: max 25 woorden — niet de rubriek Actueel zelf |
| `kort-informatieservice-onderaan` | MX, tab *Koppen*, rij *In het kort* | "Daaronder in Let op: Aanmelden Informatieservice": onderaan het blok |
| `gebieden-max-drie` | MX, tab *Koppen*, rij *In het kort* | max 3 gebieden/plaatsen noemen, daarna verwijzen |
| `h2-vast` | MX, tab *Uitleg* | H2-koppen zijn vast |
| `h3-niet-melden` | MX, tab *Koppen*, richtlijn *Niet melden* | onderwerp hoort niet in het reisadvies |
| `h3-regionaal-alleen-bij-meerdere` | MX, tab *Koppen*, rij *Regionale risico's* | alleen bij meer dan 1 kleurcode |
| `zin-max-woorden` | SW, *Begrijpelijkheid > B1* | max 15 woorden per zin; met een link erin een eigen ernst |
| `zin-twijfeltaal` | SW, *Begrijpelijkheid > B1* | misschien, vaak, mogelijk, bijna … |
| `zin-lijdende-vorm` | SW, *Begrijpelijkheid > B1* | schrijf actief |
| `tekst-negatieve-lading` | SW, *Begrijpelijkheid > Positieve taal* | dichtheidstoets, geen fout per woord |
| `vragen-opeenvolgend` | SW, *Begrijpelijkheid > Vraagvorm* | max 2 vragen achter elkaar |
| `titel-max-tekens` | SW, *Gebruiksvriendelijkheid > Titel* | max 70 tekens |
| `titel-leestekens` | SW, *Gebruiksvriendelijkheid > Titel* | geen leestekens, behalve vraagvorm |
| `intro-max-woorden` | SW, *Gebruiksvriendelijkheid > Intro* | max 50 woorden |
| `intro-geen-vraag-na-vraagtitel` | SW, *Gebruiksvriendelijkheid > Intro* | intro begint niet met een vraag als de titel al een vraag is |
| `alinea-max-woorden` | SW, *Gebruiksvriendelijkheid > Alinea's* | max 80 woorden |
| `tussenkop-max-woorden` | SW, *Gebruiksvriendelijkheid > (Tussen)koppen* | max 5 woorden |
| `tussenkop-lidwoord` | SW, *Gebruiksvriendelijkheid > (Tussen)koppen* | geen lidwoord aan het begin |
| `tussenkop-leestekens` | SW, *Gebruiksvriendelijkheid > (Tussen)koppen* | geen leestekens, behalve vraag |
| `tussenkop-vraagvorm` | SW, *Begrijpelijkheid > Vraagvorm* | titel is vraag → tussenkoppen niet |
| `link-tekstlengte` | SW, *Gebruiksvriendelijkheid > Lengte linkteksten* | max 70 tekens |
| `link-ook-nuttig-max` | SW, *Gebruiksvriendelijkheid > Links onderaan* | max 3 links |
| `link-verboden-partij` | SW, *Relevantie > Naar wie linken we niet?* | commercieel, politiek, media, belangenbehartiger |
| `opsomming-puntkomma` | SW, *Schrijfregels > Opsommingen* | nooit puntkomma's in opsommingen |
| `opmaak-vet-onderstreept` | SW, *Schrijfregels > Vet, Onderstrepen* | geen vet, geen onderstreping |
| `opmaak-cursief` | SW, *Schrijfregels > Cursief* | alleen bij laatste update en anderstalig woord |
| `aanhalingstekens` | SW, *Schrijfregels > Aanhalingstekens* | geen aanhalingstekens |
| `afkortingen-uitschrijven` | SW, *Schrijfregels > Afkortingen* | bijv. → bijvoorbeeld |
| `eenheden-voluit` | SW, *Schrijfregels > Afstanden/Gewicht/Hoeveelheden* | km → kilometer |
| `getallen-cijfers` | SW, *Schrijfregels > Getallen / Cijfers* | cijfer, duizendtal met punt; telefoon- en alarmnummers uitgezonderd |
| `percentage-notatie` | SW, *Schrijfregels > Percentages* | `5%`, zonder spatie |
| `valuta-notatie` | SW, *Schrijfregels > Euro's / Valuta* | `€ 9`, buitenlandse valuta als woord |
| `tijd-notatie` | SW, *Schrijfregels > Tijd* | `8.00 uur`, geen voorloopnul |
| `datum-notatie` | SW, *Schrijfregels > Datum* | `3 januari 2021`, altijd met jaartal |
| `telefoon-notatie` | SW, *Schrijfregels > Telefoonnummers* | `+31` en groepjes van 2 |
| `rangtelwoord-notatie` | SW, *Schrijfregels > Rangtelwoorden* | `1e`, `2e` |
| `schuine-streep` | SW, *Schrijfregels > Schuine streep* | geen spaties eromheen |
| `schrijfwijze-vast` | SW, *Schrijfregels* | u heeft, u wilt, Caribisch, geen ID-bewijs |
| `genderneutraal` | SW, *Schrijfregels > Gender(neutraal) / lhbtiq+* | geen hij/zij, echtgenoot/echtgenote |
| `lhbtiq-schrijfwijze` | SW, *Schrijfregels > Gender(neutraal) / lhbtiq+* | `lhbtiq+ personen` vs `lhbtiq+-rechten` |

## Oordeelsregels (laag 2, via het model)

| regel-id | bron | wat |
|---|---|---|
| `b1-woordmoeilijkheid` | SW, *Begrijpelijkheid > B1* | moeilijke woorden, met alternatief op zinsniveau |
| `begrijpelijkheid` | SW, *Begrijpelijkheid* | leest de tekst als B1-niveau |
| `naamwoordstijl` | SW, *Schrijfstijl/tone of voice* | 'de doelstelling is uitvoering van' → 'wil uitvoeren' |
| `jargon` | SW, *Schrijfstijl/tone of voice* | vakterm zonder uitleg in simpele taal |
| `subjectieve-taal` | SW, *Schrijfstijl/tone of voice* | 'kan lang duren' → concreet maken |
| `matrix-verwijzen-vs-uitschrijven` | MX, tab *Koppen*, kolom Richtlijn | onderwerp met richtlijn *Verwijzen* is te ver uitgeschreven |
| `matrix-niet-melden-in-tekst` | MX, tab *Koppen*, richtlijn *Niet melden* | onderwerp zit zonder eigen kopje in de lopende tekst |
| `handelingsperspectief` | MX, tab *Koppen*, kolom Toelichting | blok mist het handelingsperspectief dat de matrix vraagt |

## Buiten scope

Uit `STRATEGY.md`, *Niet aan werken*:

- **politieke gevoeligheden** — de tool doet hier geen uitspraak over
- **inkorten** — wel de overschrijding signaleren en de langste blokken aanwijzen, niet zelf schrappen
- **SharePoint-koppeling** — Word-concepten gaan handmatig in en uit

## Vaste teksten en vorm uit het sjabloon (SJ)

Het sjabloon legt per rubriek letterlijke teksten vast. De tool meldt alleen *dat* een vaste tekst
ontbreekt of afwijkt en toont de verwachte formulering; invullen blijft aan de redacteur, want welke
variant klopt hangt van het land af. Teksten die het sjabloon als voorbeeld geeft (`[Bijv.] …`) zijn
geen vaste formulering en worden niet getoetst.

`informatieservice-vaste-tekst` verving `kort-informatieservice`: die MX-regel keek alleen of het
woord *informatieservice* ergens stond, het sjabloon legt de hele oproep vast.

| regel-id | bron | wat |
|---|---|---|
| `informatieservice-vaste-tekst` | SJ, blok Oproep registratie Informatieservice | De standaardoproep om u aan te melden voor de Informatieservice ontbreekt. |
| `nood-contactcenter` | SJ, blok In geval van nood | De vaste tekst over de bereikbaarheid van het contactcenter ontbreekt. |
| `nood-lokale-hulpdiensten` | SJ, blok In geval van nood | De vaste aanhef boven de alarmnummers ontbreekt. |
| `nood-verwijzing-nood` | SJ, blok In geval van nood | De vaste verwijzing naar de pagina over nood ontbreekt. |
| `nood-verwijzing-crisis` | SJ, blok In geval van nood | De vaste verwijzing naar de pagina over een crisissituatie ontbreekt. |
| `reisverzekering-vaste-tekst` | SJ, blok Reisverzekering | De vaste openingstekst over de reisverzekering ontbreekt. |
| `reisverzekering-oranje-rood` | SJ, blok Reisverzekering | Dit advies heeft kleurcode oranje of rood; dan hoort de waarschuwing over de dekkingsvoorwaarden erbij. |
| `reisverzekering-familie` | SJ, blok Reisverzekering, let-op-tekst | De vaste let-op-tekst over familie en de verzekeraar ontbreekt. |
| `vaccinaties-ggd` | SJ, blok Reisvaccinaties | De vaste verwijzing naar GGD Reisvaccinaties ontbreekt. |
| `vaccinaties-lcr` | SJ, blok Reisvaccinaties | De vaste verwijzing naar het LCR ontbreekt. |
| `medicijnen-verklaring` | SJ, blok Medicijnen | De vaste tekst over de medicijnverklaring ontbreekt. |
| `medicijnen-verpakking` | SJ, blok Medicijnen | De vaste tekst over de originele verpakking ontbreekt. |
| `medicijnen-voldoende` | SJ, blok Medicijnen | De vaste tekst over voldoende medicijnen ontbreekt. |
| `bagage-heen` | SJ, blok Bagageregels | De vaste tekst over de douaneregels van het land zelf ontbreekt. |
| `bagage-terug` | SJ, blok Bagageregels | De vaste verwijzing naar 'Wat mag ik meenemen naar Nederland?' ontbreekt. |
| `criminaliteit-themapagina` | SJ, blok Criminaliteit | Na het maatwerk hoort de vaste verwijzing naar de themapagina over criminaliteit. |
| `lhbtiq-verwijzing` | SJ, blok Wetten en gebruiken | Waar lhbtiq+ aan de orde komt, hoort de vaste verwijzing naar de themapagina erbij. |
| `paspoort-kopie` | SJ, blok Paspoort, visum, rijbewijs | De vaste tekst over het delen van een kopie van het paspoort ontbreekt. |
| `rijbewijs-anwb` | SJ, blok Paspoort, visum, rijbewijs | Waar het rijbewijs aan de orde komt, hoort de vaste verwijzing naar de ANWB erbij. |
| `kinderen-documenten` | SJ, blok Paspoort, visum, rijbewijs | De vaste verwijzing over reizen met een minderjarig kind ontbreekt. |
| `regionaal-gebiedenzin` | SJ, blok Regionale risico’s | De vaste aanhef boven de opsomming van gebieden ontbreekt. |
| `rood-herhaling-voorbereiding` | SJ, boven de blokken onder reisvoorbereiding | Bij een volledig rood reisadvies herhalen we de waarschuwing onder de reisvoorbereiding. |

Daarnaast toetst de tool op vorm die het sjabloon voorschrijft:

| regel-id | bron | wat |
|---|---|---|
| `intro-vaste-tekst` | SJ, blok *Introductie* | de vaste introductiezin, met een eigen variant voor een advies met alleen kleurcode rood |
| `kort-max-bullets` | SJ, blok *In het kort*: "Maximaal 4 bullets" | max 4 bullets onder *In het kort* |
| `kleur-formulering-verboden` | SJ, blok *In het kort* | niet "gele gebieden" of "de hoofdstad is oranje", maar "gebieden met kleurcode geel" |
| `rubrieken-max` | SJ, richtlijn boven de rubrieken | max 6 rubrieken onder veiligheidsrisico's en onder reisvoorbereiding |
| `rubrieken-volgorde` | SJ, blok *Risico dat van toepassing is, in volgorde van relevantie* | de vaste volgorde van de rubrieken onder veiligheidsrisico's |
| `nood-contactnummer` | SJ, blok *In geval van nood* | alleen de vaste nummers van het contactcenter |
| `h3-vaste-kop` | SJ, blok *Risico dat van toepassing is*; MX, tab *Koppen* | de tussenkoppen liggen letterlijk vast: "Terrorisme", niet "Terroristische aanslagen" |

## Tussenkoppen op h4-niveau (18 september 2026)

Sinds de parser h4 kent, kunnen de tussenkoppen op dat niveau getoetst worden. Er staan er 4331 in
de 226 adviezen, verdeeld over 996 verschillende koppen — waarvan 839 precies één keer. Een gesloten
lijst kan dat nooit dekken, want een kop heet vaak naar zijn eigen onderwerp.

| regel-id | vindplaats |
|---|---|
| `h4-kop-variant` | SJ, de blokken *In geval van nood* en *Bagageregels*; `regels/koppen-in-gebruik.json` |
| `h4-niet-melden` | MX, tab *Koppen*, richtlijn *Niet melden*, kolom trefwoorden |
| `tekst-niet-melden` | MX, tab *Koppen*, richtlijn *Niet melden*, kolom trefwoorden |
| `h4-natuurrisico` | **Geen letterlijke vindplaats.** Instructie van de opdrachtgever, 18 september 2026: een tussenkop onder Natuurgeweld moet een risico benoemen zoals vulkanen, orkanen of overstromingen — niet de plaats of de activiteit. |

**Niet "staat niet op de lijst", maar "heet elders anders" (18 september 2026).** De regel heette
eerst `h4-vaste-kop` en meldde elke kop die niet in het sjabloon stond. Dat klopte niet, en de
opdrachtgever wees erop waarom: niet elk land heeft dezelfde informatie. *Achtergelaten of gedwongen
te trouwen* hoort bij Somalië en nergens anders; dat de tool dat als afwijking meldt, is de regel
die het mis heeft. Wat wél misgaat is hetzelfde onderwerp in het ene land anders noemen dan in het
andere — dan zie je als lezer twee dingen waar er één is.

De regel heet nu `h4-kop-variant` en meldt een kop alleen als er elders een andere formulering
rondgaat die duidelijk de huisstijl is. Twee voorwaarden, allebei nodig:

1. **Genoeg gelijkenis** — 60% woordoverlap, dezelfde maat die `dichtstbijKop` gebruikt. Minder is
   een ander onderwerp.
2. **Genoeg adviezen** — de andere formulering staat in minstens 20 adviezen (`variant_drempel` in
   `sjabloon.json`). Anders is het geen huisstijl maar toeval: *Geen Nederlandse ambassade of
   consulaat op Antarctica* lijkt op *Geen Nederlandse ambassade op Aruba*, maar die staat zelf ook
   maar in één advies, en dan zegt de gelijkenis niets.

`regels/koppen-in-gebruik.json` bevat de 468 h4-koppen die onder deze rubrieken in gebruik zijn, met
hoe vaak. Gemaakt met `scripts/bouw-koppenlijst.mjs` uit het corpus; na een nieuwe ophaalronde
opnieuw draaien. Het is géén norm: een kop die daar vaak in staat is de gangbare formulering, niet
per se de juiste — dat is ook precies waarom de regel *let op* geeft en geen fout.

Wat dat oplevert, gemeten over 226 adviezen: van de 22 meldingen blijven er dertien over. Die
dertien zijn terecht, en laten zien hoe scheef het staat:

| gemeld | wat elders staat |
|---|---|
| *Wat mag mee terugnemen naar Nederland?* | *Wat mag ik mee terugnemen naar Nederland?* (224×) — er mist een woord |
| *Nood- of crisissituatie?* (3×) | *Nood- of crisissituatie* (222×) — een vraagteken te veel |
| *Contactgegevens Nederlandse ambassade* (6×), *Contactgegevens ambassade*, *Contactgegevens in geval van nood*, *Contactgegevens ambassade in geval van nood*, *Contactgegevens Nederlandse vertegenwoordiging in geval van nood* | *Contactgegevens Nederlandse ambassade in geval van nood* (208×) — vijf namen voor één ding |

Eén melding valt weg die wel klopte: *Contactgegevens ambassade* in Bahrein. De volledige vorm
heeft te weinig woordoverlap met die korte kop om de drempel te halen. Dat is de prijs van een maat
die streng genoeg is om de rest buiten de deur te houden.

De negen die wegvallen zijn verder terecht landspecifiek: *Achtergelaten of gedwongen te trouwen*
(Somalië), *Beperkte consulaire hulp in het noorden van Cyprus*, *Geen Nederlandse ambassade of
consulaat op Antarctica*, *Geen Nederlands consulaat-generaal in Macau SAR*, *Wat mag ik niet
meenemen naar Thailand?*.

**Wat deze regel niet meer vangt.** Drie koppen met een de/het-fout — *Nederlandse consulaat-generaal
in Australië*, *Nederlandse consulaat-generaal in Turkije*, *Nederlandse ambassadekantoor in Tsjaad*
(alle drie horen *Nederlands* te zijn). Die vielen eerder mee omdat ze niet op de lijst stonden, niet
omdat de tool de fout zag. Dat is een taalregel over lidwoord en bijvoeglijk naamwoord, en die hoort
in een eigen regel thuis, niet hier.

**Alleen nood en bagage.** Onder *Paspoort, visum, rijbewijs* en *Regionale risico's* voegen
redacteuren terecht landspecifieke kopjes toe (*Inreisstempel*, *De provincie Cabinda*, *Grens met
Mali*). Gemeten: die twee rubrieken leverden 85 meldingen op die inhoudelijk allemaal klopten, dus
daar geldt geen vaste lijst.

**De landnaam in een kop wordt soepel vergeleken.** Adviezen schrijven *"naar de Bahama's"*, *"naar
het VK"*, *"op de Seychellen"*, terwijl het sjabloon `{land}` zegt. Zonder die soepelheid gaf de
regel 198 meldingen in plaats van 22, vrijwel allemaal onterecht. Dit is dezelfde aanpak die
`isVasteH2` al gebruikte voor de H2-koppen.

`vaste_koppen` is aangevuld met de vertegenwoordigingsvarianten: niet elk land heeft een ambassade,
sommige hebben een consulaat-generaal, een ambassadekantoor of alleen een honorair consul. Dat is
een feit over het land, geen afwijking van het format.

**`beren` en `ijsberen`** zijn op verzoek toegevoegd aan de trefwoorden van *Wilde dieren*. Ze staan
als tussenkop in reisadviezen terwijl de matrix dat onderwerp als niet-melden aanmerkt.

**Ook in de lopende tekst (`tekst-niet-melden`).** Op verzoek van de opdrachtgever, 18 september
2026: staat een niet-melden-onderwerp in de tekst zelf, dan is dat ook een melding. Eerst was dit
afgeraden, omdat een eerste meting *Gezondheidszorg* in alle 226 adviezen liet afgaan: het trefwoord
*ziekenhuis* staat in de voorgeschreven noodtekst (*"u bent opgenomen in het ziekenhuis"*). Drie
dingen maken de regel alsnog bruikbaar, en samen brengen ze hem van 226 naar 39 meldingen:

1. **Vaste teksten tellen niet mee.** Wat het sjabloon voorschrijft, kan de redacteur niet
   veranderen. Gezondheidszorg ging daarmee van 226 naar 3.
2. **Staat er al een kop over, dan is dat de melding.** `h3-niet-melden` en `h4-niet-melden` melden
   het blok; de tool zegt niet twee keer hetzelfde. Dat halveerde de rest, van 121 naar 50.
3. **Op hele woorden, niet op deelstrings.** *beren* zit in *proberen*: zonder woordgrenzen werd
   *"automobilisten proberen af te persen"* een zin over wilde dieren.

**De matrix wijst sommige onderwerpen zelf een plek aan (`mag_onder`).** Bij vier niet-melden-koppen
staat in de toelichting wáár het onderwerp wél mag staan:

| onderwerp | wat de matrix zegt | mag onder |
|---|---|---|
| Foto's maken | "Kan evt. bij lokale wetten als het echt moet." | Wetten en gebruiken |
| Gezondheidszorg | "Evt. tekst opnemen bij Reisverzekering." | Reisverzekering |
| Thuisblijvers | "Evt. deels overhevelen naar In geval van nood." | In geval van nood |
| Smog | "Is het gevolg van bosbrand, plaats het dan bij Natuurgeweld." | Natuurgeweld |

Staat het onderwerp daar, dan meldt de tool het niet. De afweging *is het hier echt nodig* kan een
harde regel niet maken; die hoort bij de oordeelstoets. Zonder deze uitzondering ging
`h4-niet-melden` in 49 adviezen af op precies de kop die de matrix toestaat: *Foto's maken* onder
*Wetten en gebruiken*. Daarmee gaat de regel van 69 naar 4 meldingen en `tekst-niet-melden` van 39
naar 23.

**Samenstellingen bij `h4-natuurrisico`.** Nederlands plakt woorden aan elkaar: *zandstormen* en
*zeestromingen* benoemen een risico, maar het risicowoord staat niet vooraan. Een stam van vijf
letters of meer mag daarom ook middenin een woord staan; kortere stammen moeten aan het woordbegin
staan, anders valt *ijs* in *prijs*.

Een kop blijft een zwaarder signaal dan een woord in een zin — een kop is een bewuste keuze om een
blok aan een onderwerp te wijden. Daarom is dit *let op* en geen fout: de redacteur kijkt ernaar en
beslist zelf.

## Twijfeltaal gesplitst in twee regels (18 september 2026)

| regel-id | vindplaats |
|---|---|
| `zin-twijfeltaal` | SW, *Begrijpelijkheid > B1*: "Vermijd twijfeltaal. Denk aan woorden zoals: misschien, vaak, mogelijk, bijna, etc." |
| `zin-frequentiewoord` | Dezelfde vindplaats. Alleen de indeling is nieuw. |

Beide regels komen uit dezelfde zin in de schrijfwijzer en melden allebei nog steeds. Wat verandert
is dat je ze apart kunt filteren, omdat het twee verschillende gesprekken zijn:

- **Verzwakkers** (*misschien, mogelijk, waarschijnlijk*) verzwakken de bewering zelf. Daar is bijna
  altijd een stelliger formulering voor.
- **Frequentiewoorden** (*vaak, soms, regelmatig*) zeggen hoe váák iets gebeurt. Dat is soms
  feitelijke nuance: over terroristische groepen kun je niet schrijven dát ze aanslagen plegen — ze
  doen het regelmatig of soms.

**Let op bij het lezen van deze indeling.** De schrijfwijzer noemt *"vaak"* letterlijk als voorbeeld
van twijfeltaal. Het onderscheid hierboven is dus een hulpmiddel bij het nalopen en géén uitspraak
dat frequentiewoorden buiten de regel vallen. De boodschap bij een frequentiewoord is daarom een
vraag — *"klopt dat hier, of kan het stelliger?"* — en geen constatering.

Gemeten op 18 september 2026 over 226 reisadviezen: regelmatig 153, vaak 129, soms 107 — samen 389
van de 473 twijfeltaal-bevindingen (82%). De verzwakkers samen 58.

## Vaste formuleringen zijn vrijgesteld van de schrijfregels (18 september 2026)

Het sjabloon legt formuleringen vast die zelf niet binnen de schrijfwijzer passen. *"Check welke
documenten u nodig heeft om te reizen met een minderjarig kind"* is 74 tekens waar 70 de norm is;
*"U heeft geen visum nodig voor X als u met een Nederlands paspoort of Nederlandse ID-kaart reist"*
telt 18 woorden waar 15 de norm is. Daar valt niets aan in te korten zonder van het format af te
wijken — de *of ID-kaart* moet er staan voor de feitelijke juistheid.

Een redacteur die het format keurig volgt hoort daar geen fout voor te krijgen. Daarom zijn ze
vrijgesteld, net als de al bestaande vaste teksten.

`regels/sjabloon.json` heeft daarvoor een aparte ingang: **`vrijgestelde_formuleringen`**. Het
verschil met `vaste_teksten` is dat deze niet verplicht zijn — welke visumvariant geldt, hangt van
het land af. Ze leveren dus geen *"ontbreekt"*-bevinding op; ze staan er alleen om ze vrij te
stellen. Elke zin is op 18 september 2026 woordelijk teruggevonden in het sjabloon.

Wat dit opleverde over het corpus: 597 meldingen over zinslengte, 434 over de lengte van een
linktekst en 54 over twijfeltaal vervielen — samen 1085 van de 3845. Twee linkteksten alleen al
waren goed voor 429 meldingen.

**Eén kandidaat is bewust níét vrijgesteld.** *"Lees informatie over aardbevingen op de website van
…"* staat in 31 adviezen woordelijk hetzelfde, maar komt niet in het sjabloon voor. Dat is een
gewoonte, geen voorgeschreven tekst, en blijft dus een bevinding. Vaak voorkomen is niet hetzelfde
als vastgesteld zijn.

Dat de vaste teksten zelf boven de norm liggen is een gesprek over het sjabloon, niet over een
advies. `data/vaste-teksten-boven-de-norm.md` zet die dertien zinnen op een rij, met hoe vaak ze
voorkomen; `node scripts/vaste-teksten-boven-de-norm.mjs` maakt dat overzicht opnieuw.

## Eén versus meerdere kleurcodes (18 september 2026)

De matrix schrijft twee manieren voor om de kleurcode in *In het kort* te zetten. Bij **één**
kleurcode geldt de kleur voor het hele land en staat daar de volledige uitleg. Bij **meerdere**
kleurcodes staat per gebied de verkorte variant, en volgt de volledige uitleg onder *Regionale
risico's* — zo blijft *In het kort* kort en staat hetzelfde niet twee keer.

| regel-id | vindplaats |
|---|---|
| `kleur-variant` | Matrix, tabblad *Kleurcode-teksten*: de kolommen voor de volledige en de verkorte formulering per kleur. In de regeldata `in_het_kort_volledig` en `in_het_kort_deels`. |
| `regionaal-kleur-kop` | Matrix, tabblad *Kleurcode-teksten*, het vaste kopje per kleur onder *Regionale risico's*. In de regeldata `regionaal_kop`. |
| `regionaal-kleur-tekst` | Idem, de vaste uitleg onder dat kopje. In de regeldata `regionaal_tekst`. |
| `kort-verwijst-regionaal` | Matrix, tabblad *Koppen*, rij *In het kort*: "Bij het noemen van meerdere gebieden/plaatsen max. 3 noemen en verwijzen." |
| `kort-verwijzing-vorm` | **Geen letterlijke vindplaats.** Instructie van de opdrachtgever, 18 september 2026: elke verwijzing vanuit *In het kort* heeft de vorm "Lees meer onder X". De matrix schrijft wel voor *dát* er verwezen wordt, niet hoe. Gemeten: alle 149 verwijzingen in het corpus gebruiken deze vorm al. |

Twee dingen om te weten bij deze regels:

- **Het verschil tussen de varianten is niet één woord.** Groen en geel zetten "erheen" tegenover
  "hierheen", rood zet "reis er niet heen" tegenover "reis niet hierheen", en bij oranje is de
  handelingsinstructie in beide varianten gelijk. Daarom toetst `kleur-variant` de hele instructie
  en niet dat ene woord.
- **Welke kleuren een advies heeft, komt uit het cms-veld**, niet uit de lopende tekst. Een advies
  kan een ánder land noemen ("de kleurcode van het reisadvies voor Jemen is rood") en dan zou die
  kleur ten onrechte meetellen. Alleen bij geplakte tekst, waar het veld ontbreekt, valt de tool
  terug op wat er in de tekst staat.

## Aangevuld na de review van 18 september 2026

| regel-id | vindplaats |
|---|---|
| `kleur-vervolg-bullet-kort` | Matrix, tabblad *Kleurcode-teksten*, kolom NB: "de eerste bullet voluit, vervolgbullets verkort" |
| `h3-alleen-bij-uitzondering` | Matrix, tabblad *Koppen*, kolom Toelichting bij *Verkeersongevallen* ("Alleen in uitzonderlijke gevallen als het risico groot is voor een grote groep Nederlanders") en bij *Coronaregels*. In de regeldata het veld `alleen_bij_uitzondering`. |

Drie keuzes bij deze ronde zijn **geen** letterlijke vindplaats maar een besluit, en horen daarom
hier vermeld:

- **`kleur-eerste-bullet-voluit` accepteert nu twee vormen.** De NB-kolom noemt naast
  "De kleurcode van het reisadvies voor X is KLEUR" ook de aanpassing "De kleurcode van het
  reisadvies is KLEUR voor gebieden X, Y en Z". Die tweede stond niet in de regel, terwijl 66 van
  de 68 eerste bullets in het corpus hem gebruiken. Uitbreiding, geen versoepeling.
- **De omgedraaide vervolgbullet** ("Kleurcode oranje geldt voor …", 23× in het corpus) staat niet
  letterlijk in de matrix. Op 18 september 2026 goedgekeurd als geldige variant.
- **`rubrieken-volgorde` is verzacht** van *let op* naar *ter overweging*, met een vragende
  formulering. Het sjabloon noemt de volgorde dwingend; de praktijk kent goede redenen om af te
  wijken (in de zomer natuurgeweld bovenaan vanwege bosbranden). Dit is dus een keuze, geen bron.

De kop *Paspoort, visum, rijbewijs* is in `matrix.json` omgezet van een lijst vaste varianten naar
`kop_elementen`: de documenten die voor dit land gelden, in vaste volgorde, waarbij een land mag
overslaan wat het niet kent. Daarmee vervielen ook elf onterechte `tussenkop-leestekens`-meldingen
over de komma in die kop — een komma die de matrix zelf voorschrijft.

## Aangevuld na de review van 15 september 2026

Deze drie regels vuurden al wel, maar hadden hier geen vindplaats. Dat is in strijd met de
norm uit de README: een bevinding zonder bron hoort de tool niet te geven.

| regel-id | vindplaats |
|---|---|
| `kleur-aanduiding` | Matrix, tabblad *Kleurcode-teksten*, kolom NB: "Bij de eerste bullet over kleurcode altijd voluit schrijven: De kleurcode van het reisadvies voor land X is ..." |
| `metadescription-lengte` | Schrijfwijzer, *Vindbaarheid > SEO > Metadescriptions* |
| `url-lengte` | Schrijfwijzer, *Schrijfregels in alfabetische volgorde > url* |

De overige acht id's in dit document (`b1-woordmoeilijkheid`, `begrijpelijkheid`,
`naamwoordstijl`, `jargon`, `subjectieve-taal`, `matrix-verwijzen-vs-uitschrijven`,
`matrix-niet-melden-in-tekst`, `handelingsperspectief`) horen bij laag 2, de oordeelstoets.
Die draait op een model en niet in `src/regels.js`; dat is met opzet zo.

## Tekstfouten, overgenomen uit SpellingSpeurneus (18 september 2026)

De redactie heeft een tweede tooltje: [SpellingSpeurneus](https://github.com/NWW-team/SpellingSpeurneus),
dat nederlandwereldwijd.nl langsloopt met de OpenTaal-woordenlijst. Drie van zijn controles hebben
die lijst helemaal niet nodig, en die horen hier thuis — zonder dependency, zonder buildstap.

| regel-id | vindplaats | wat |
|---|---|---|
| `tekst-cms-rest` | **Geen brondocument.** `scripts/crawl.py`, `SJABLOONRESTEN` | `undefined`, `[object Object]`, `{{titel}}`, `&#39;`: resten van het CMS die de bezoeker ziet staan |
| `tekst-plakfout` | **Geen brondocument.** `scripts/crawl.py`, `is_plakfout` | een punt middenin een woord: "demonstraties.Volg het nieuws" |
| `tekst-onzichtbaar-teken` | **Geen brondocument.** `scripts/crawl.py`, `ONZICHTBAAR` | tekens zonder breedte, uit Word of een ander CMS |

Ze dragen `herkomst: 'aanvulling'`, want ze staan niet in schrijfwijzer, matrix of sjabloon. Het zijn
ook geen schrijfregels: er is iets misgegaan tussen het CMS en de pagina. Daarom een eigen
filtergroep — dat is een ander gesprek dan *kan deze zin korter*.

Gemeten op 18 september 2026 over 226 adviezen: **3 + 4 + 7 = 14 meldingen, alle veertien terecht.**
Estland had letterlijk het woord *undefined* boven een kop staan, Congo en Mali tonen `&#39;` in de
introzin (die tekst is dubbel ge-escaped), en vier adviezen missen een spatie na een punt.

**Wat hier níét uit is overgenomen: de spellingtoets zelf.** Die draait op de OpenTaal-lijst van
ruim 413.000 woorden. Die lijst bij de pagina insluiten kan niet — `dist/app.html` is nu 238 kB — en
hem apart lazy laden is een keuze die de opdrachtgever moet maken, niet de bouwer. De indeling die
SpellingSpeurneus daarvoor bedacht (een hoofdletter middenin een zin is een naam, aan het zinsbegin
niet, en een vergeten spatie gaat voor) is wel het overnemen waard als dat een keer gebeurt: die
haalt 87% van de meldingen uit beeld zonder ze weg te gooien.

## De spellingtoets zelf, alsnog overgenomen (18 september 2026)

Op verzoek van de opdrachtgever is ook de spellingtoets uit SpellingSpeurneus overgenomen.

| regel-id | vindplaats | ernst |
|---|---|---|
| `woord-onbekend` | **Geen brondocument.** OpenTaal-woordenlijst + `regels/uitzonderingen.txt` | let op |

**Waar de woordenlijst staat.** `docs/woordenlijst.txt.gz`: 409.487 woorden van OpenTaal, kleine
letters, ontdubbeld, 1,3 MB ingepakt. `scripts/haal-woordenlijst.mjs` haalt hem op en vergelijkt de
sha256 met `data/opentaal.sha256` — wijkt die af, dan stopt het script, want dan toets je aan een
andere spelling dan de vorige keer. Diezelfde sha256 staat in SpellingSpeurneus; nagetoetst en
gelijk, dus beide tools oordelen over dezelfde spelling.

**Hij wordt pas opgehaald als een redacteur hem aanzet.** In de pagina vouwen kan niet: die is
259 kB en zou vertienvoudigen. Dus staat er een knop, en pas daarna draait de toets. Lukt ophalen
niet — geen internet, of de pagina staat los op schijf — dan zegt de knop dat en werkt de rest
gewoon door. De eigen uitzonderingen zitten wél in de pagina: dat zijn een paar honderd woorden en
ze horen bij elke herbouw mee te komen.

**Namen worden herkend en overgeslagen.** De woordenlijst kent geen plaats- en organisatienamen, en
in reisadviezen staan die overal: *National Hurricane Center*, *EMSC*, *Boko Haram*. De regel van
SpellingSpeurneus: een hoofdletter middenin een zin is een naam, aan het zinsbegin zegt een
hoofdletter niets. Hier is er één ding bij gekomen: **namen komen in reeksen**. Zonder dat werd
*European* in "European Avalanche Warning Service" als spelfout gemeld, want het staat vooraan.
Staat er direct naast nóg een woord met een hoofdletter, dan is het ook aan het zinsbegin een naam.
Dat scheelde 51 onterechte spelfouten.

**Ze worden niet gemeld.** Eerst stonden ze in een eigen filter, naar het voorbeeld van het tweede
tabblad in SpellingSpeurneus. Instructie van de opdrachtgever, 18 september 2026: eruit. In 226
reisadviezen staan zoveel plaatsnamen, buitenlandse namen en instituten dat er geen woordenlijst
voor is aan te leggen, en ze staan vrijwel altijd goed. Het waren 1974 meldingen tegen 146 mogelijke
spelfouten; die zouden de echte fouten wegdrukken. De herkenning blijft wél staan — zonder dat komt
elke naam als spelfout binnen.

**Gemeten op 18 september 2026 over 226 adviezen.** 146 mogelijke spelfouten, 0,6 per advies.

Drie dingen die de meting nodig had voordat de toets bruikbaar was:

1. **`lhbtiq` in de uitzonderingen.** Dat woord staat twee keer in bijna elk reisadvies en de
   schrijfwijzer schrijft die schrijfwijze voor. Goed voor 395 van de eerste 686 meldingen.
2. **Een aanhalingsteken aan het eind is een citaatteken, geen apostrof.** ‘bagsnatching’ werd
   *bagsnatching'* en dus onbekend. Bij "foto's" hoort de apostrof er wél bij, maar die staat niet
   aan het eind.
3. **Een woord dat op een streepje eindigt is een weglating, geen woord**: "identiteits- en
   reisdocumenten".

Wat de tekstfouten hierboven al melden, meldt de spellingtoets niet nog een keer: *undefined* is
een CMS-rest en *demonstraties.Volg* een vergeten spatie, en dat is telkens de nuttiger boodschap.

**Wat de toets níét kan.** Beoordelen of een naam goed gespeld is. *Cochabamba* en een verkeerd
gespelde variant staan geen van beide in de woordenlijst, dus de tool ziet geen verschil. Dat
nakijken blijft mensenwerk — met één uitzondering, hieronder: de naam van het land zelf.

## De naam van het land (18 september 2026)

| regel-id | vindplaats | ernst |
|---|---|---|
| `landnaam-schrijfwijze` | `regels/landen.json`, veld `naam` — uit de landenlijst van de open data | fout |

Namen worden verder niet beoordeeld, maar van één groep weet de tool wél hoe het hoort: de landen
zelf. Hun schrijfwijze staat in het `location`-veld van de open data. Staat er *Tsjechie* waar
*Tsjechië* hoort, dan is dat een fout, en zonder deze regel zou niemand hem vinden.

De toets vergelijkt alleen op **trema's en accenten**. Wijkt er meer af, dan is het een ander woord
en niet aan de tool om daar iets van te vinden. Van de 227 landen hebben er 40 een trema of accent;
bij de rest valt niets te vergelijken.

**Niet in een reeks hoofdletters.** *"the Israel Population & Immigration Authority"* is de juiste
Engelse naam van een instituut, geen verkeerd gespeld *Israël*. Staat er direct naast een ander
woord met een hoofdletter, dan slaat de regel over — dezelfde afspraak als bij de spellingtoets.

**Gemeten over 226 adviezen: één treffer, en die klopt.** Op het Tsjechië-advies staat *"Bent u in
Tsjechie en bent u in nood?"*. De regel is uitgebreid van alleen het land van het advies naar de
hele landenlijst; dat leverde geen extra treffers op, maar vangt voortaan ook een verkeerd gespeld
buurland.

**Wat hier nog bij kan.** De open data bevat ook de namen van ambassades, consulaten-generaal en de
plaatsen waar die zitten. Die staan op de site goed, dus daarmee zou dezelfde toets ook een
verkeerd gespelde postnaam vangen. Nog niet gebouwd: dat vraagt een ophaalronde langs een ander
deel van de open data.

**Vals alarm.** Klopt een woord wel? Dan hoort het in `regels/uitzonderingen.txt`. Die lijst hoort
bij de webredactie, niet bij de techniek, en groeit met het gebruik. De basis komt uit
SpellingSpeurneus; wat daarna is gemeten over de reisadviezen staat er onderaan bij.
