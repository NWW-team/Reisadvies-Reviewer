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
| `gebieden-max` | MX, tab *Koppen*, rij *In het kort* | max 5 gebieden/plaatsen noemen, daarna verwijzen (was 3; zie 19 september 2026) |
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

## De volgorde van de rubrieken, in drie lagen (19 september 2026)

| regel-id | vindplaats | ernst |
|---|---|---|
| `rubriek-bovenaan` | SJ, blok *Risico dat van toepassing is*; indeling op instructie van de opdrachtgever | fout |
| `rubrieken-volgorde` | idem | ter overweging |
| `rubriek-vrij-te-hoog` | idem | ter overweging |

Het sjabloonblok heet *"Risico dat van toepassing is, **in volgorde van relevantie**"*, en dat woord
relevantie is de kern: de volgorde mág schuiven als een risico in dit land zwaarder weegt. Is
terrorisme de reden voor kleurcode oranje, dan hoort terrorisme bovenaan. Eén vaste rij van elf
rubrieken kon dat niet uitdrukken; daarom zijn het er nu drie lagen.

| laag | rubrieken | wat de tool doet |
|---|---|---|
| **bovenaan** | Actueel, Regionale risico's | **fout** als het anders is |
| **vast** | Terrorisme, Oorlog en conflict, Criminaliteit, Wetten en gebruiken, Natuurgeweld | *ter overweging* bij een andere volgorde |
| **vrij** | Demonstraties, Landmijnen, Verkeersongevallen, Willekeurige arrestaties | onderling geen volgorde; wel onder *Wetten en gebruiken* |

**Waarom Natuurgeweld in de vaste laag staat.** De meting zei eerst iets anders: over 226 adviezen
staat Natuurgeweld gemiddeld op 0,82 (waarbij 1 onderaan is), dus in de praktijk bijna onderaan. Op
grond daarvan stelde ik voor hem naar de vrije laag te doen. De opdrachtgever koos anders, met een
reden die de meting niet kent: Natuurgeweld staat in ruim 200 van de 226 adviezen, terwijl
Landmijnen er 19 heeft. Wat bijna altijd voorkomt hoort een vaste plek te hebben.

**En waarom Demonstraties er dan bóven mag staan.** Natuurgeweld staat onderaan de vaste laag, en de
ondergrens voor de vrije rubrieken ligt bij *Wetten en gebruiken* — niet bij het einde van de vaste
laag. Demonstraties sluit logisch aan op Wetten en gebruiken; Natuurgeweld staat meer op zichzelf.
Zonder die grens gaf de regel 35 meldingen, waarvan 22 over *Demonstraties boven Natuurgeweld*, en
die zijn juist goed. Met de grens: 23, en die kloppen.

**De bovenste laag is een vangnet.** Gemeten over 226 adviezen: **0 meldingen**. Alle adviezen zetten
Actueel en Regionale risico's al precies goed. Dat is hoe een harde regel eruit hoort te zien — hij
bewaakt iets wat niemand mag verschuiven, en gaat daarom nooit af.

| | voor | na |
|---|---:|---:|
| `rubrieken-volgorde` | 53 | 22 |
| `rubriek-vrij-te-hoog` | — | 23 |
| `rubriek-bovenaan` | — | 0 |

## Linkteksten: twee dingen rechtgezet (19 september 2026)

**De vrijstelling was te smal.** `isVasteLinktekst` stelde een linktekst alleen vrij als hij
letterlijk in een vaste zin zát. Twee soorten vielen daardoor buiten de boot:

1. **De vaste zin met de landnaam erin.** *"Check welke vaccinaties u nodig heeft voor de
   Centraal-Afrikaanse Republiek"* is 75 tekens. De vaste zinnen werden rond `{land}` opgeknipt, dus
   de hele zin stond nergens in de lijst. Nu staat hij er ook heel in, met de landnaam ingevuld.
2. **Het lidwoord bij de landnaam.** *"voor de Centraal-Afrikaanse Republiek"* tegenover *"voor
   Saint Vincent en de Grenadines"*: dat lidwoord is grammatica, geen keuze. `{land}` mag daarom
   worden ingevuld met de landnaam, met of zonder *de* of *het*.

**Verder niets — en dat is een bewuste grens.** Eerst stond hier een soepeler regel: een linktekst
die voor minstens 85% uit een vaste zin bestond, telde als vast. Dat ving ook Venezuela's *"Check
welke documenten u **nog meer** nodig heeft…"*, waar die twee woorden nodig zijn omdat de zin ervoor
al een document noemt.

De opdrachtgever wees die regel af, met een argument dat sterker is: *"kleine aanpassing"* is niet te
definiëren, en een woord te veel is soms jüist de fout. Bij Venezuela is het nodig, bij een ander
advies misschien niet — en met een soepele regel zie je dat verschil nooit. Beter laten oppoppen en
per geval oordelen, met de knop *Onterecht*, dan stilletjes slikken en de echte gevallen missen.

Gemeten over 226 adviezen: van de 52 meldingen vallen er 3 weg (Saint Vincent, de Centraal-Afrikaanse
Republiek en de Amerikaanse Maagdeneilanden — de kale landnaam, met of zonder lidwoord). Blijven
staan: 49, waaronder *"de Verenigde Arabische Emiraten (VAE)"* en *"de Democratische Republiek Congo
(DRC)"*, want die afkorting is een toevoeging van de redacteur.

**Nieuw: `link-plakt-aan-woord`.** Bij het meten hierboven viel een linktekst op die met een kleine
letter begon: *"ijk op de website van de Arubaanse overheid"*. In de bron staat:

    Dit is verplicht. K<a href="...">ijk op de website van de Arubaanse overheid</a>.

De **K** staat buiten de link. Op de pagina lees je gewoon "Kijk", maar alleen *"ijk op de website"*
is klikbaar. Dat is bij het opmaken misgegaan en is alleen aan de opmaak te zien — in de gelezen
tekst is er niets van te merken, dus geen mens vindt dit.

De parser onthoudt nu of er een letter of cijfer direct vóór een link staat. Gemeten: **5 meldingen,
alle vijf terecht**, in drie vormen:

| vorm | waar | wat er staat |
|---|---|---|
| eerste letter buiten de link | Aruba, Turks- en Caicos | `K` + *ijk op de website* |
| geen spatie tussen woord en link | Burundi, Finland | *telefoonnummer* + `+31 247 247 247` |
| spatie bínnen de link | Mozambique | *via de* + ` ambassade van Mozambique` |

Die laatste krijgt een eigen boodschap, want de correctie is een andere: daar moet de spatie náár
buiten, niet erbij.

Een link kan nooit legitiem middenin een woord beginnen, dus deze regel heeft geen bewaking nodig.

## Gemeten en niet gebouwd: het posttype (18 september 2026)

De open data weet per land welke post er zit: een ambassade, een consulaat-generaal of een
ambassadekantoor. De verleiding is om te toetsen of het advies de juiste noemt. **Gemeten: 8
meldingen, alle acht onterecht.** Daarom niet gebouwd.

Waarom het niet kan, in twee soorten:

1. **Het advies zegt juist dat er géén post is.** *"Geen Nederlandse ambassade op de Bahama's"*,
   gevolgd door een verwijzing naar het consulaat-generaal in Miami. Dat klopt precies; de tool zou
   het woord *ambassade* zien en een fout melden op een zin die zegt dat die er niet is. Zo ook bij
   de Kaaimaneilanden, Puerto Rico, Martinique, de Turks- en Caicoseilanden en de Amerikaanse
   Maagdeneilanden.
2. **Het is de voorgeschreven kleurcodetekst.** *"De Nederlandse ambassade kan u minder goed helpen
   als u in de problemen komt"* staat zo in de matrix, ongeacht welke post het land heeft. Bij
   Tsjaad en Belarus komt de melding daarvandaan. Daar kan een redacteur niets aan doen zonder van
   het format af te wijken.

Dit is precies de ruis waar de opdrachtgever voor waarschuwde: meldingen op tekst die gewoon goed
is, kosten vertrouwen, en een tool die je niet gelooft is geen tool.

**Wel zichtbaar gemaakt: een fout in de brondata.** De open data zelf schrijft *"Nederlandse
ambassadekantoor in Minsk"*, waar *Nederlands* hoort — dezelfde fout die `nederlands-verbuiging` in
de adviezen vindt. Die titel staat op de contactpagina van de site en niet in een reisadvies, dus de
tool komt hem nooit tegen. `scripts/bouw-postplaatsen.mjs` toetst de brondata daarom met dezelfde
regel en drukt af wat er misgaat. Het Belarus-advies zelf schrijft het wél goed
(*Nederlands ambassadekantoor in Belarus*), dus dit is alleen een kwestie van de contactpagina.

## Nog drie waterdichte controles (18 september 2026)

| regel-id | vindplaats | ernst |
|---|---|---|
| `tekst-dubbel-woord` | **Geen brondocument.** Tikfout | fout |
| `tekst-spatie-leesteken` | **Geen brondocument.** Leestekenregel | fout |
| `postplaats-schrijfwijze` | `regels/postplaatsen.json`, uit de open data (ConsularData) | fout |
| `vaste-tekst-land-leeg` | SJ, de vaste teksten waarin `{land}` staat | fout |

Alle vier gekozen op hetzelfde criterium: het antwoord staat vast, dus de tool kan niet gokken.

**`tekst-dubbel-woord`** — hetzelfde woord twee keer achter elkaar. Twee dingen herhalen zichzelf
wél legitiem, en daar staat bewaking op: een eigennaam (*Pom Pom*, *Tawi Tawi* — twee hoofdletters
achter elkaar) en een aangehaalde vreemde term (‘boda boda’s’). Aan het zinsbegin telt een hoofdletter
niet mee, anders zou *Het het departement* wegvallen. 3 meldingen: *Het het departement*, *via via*
en *u de de Thailand Digital Arrival Card*.

Bij het bouwen bleek een valkuil die het noteren waard is: `matchAll` verbruikt wat het matcht. Met
het patroon `(woord)(spatie)(woord)` mist de lus *"naar het het noorden"*, want *"naar het"* eet de
eerste *het* op. Het tweede woord staat daarom in een vooruitblik en niet in de match zelf.

**`tekst-spatie-leesteken`** — een spatie voor `, . ; : ! ?`. Geen bewaking nodig: er is geen
Nederlandse zin waarin dat goed is. 11 meldingen, waaronder *"Algemeen alarmnummer : 101"* en
*"Bel het lokale nummer van de Nederlandse ambassade ."*.

**`postplaats-schrijfwijze`** — dezelfde opzet als `landnaam-schrijfwijze`, met de standplaatsen van
de posten in plaats van de landen. Bron: het infotype `nl-representation` uit de open data, in de
documentatie *ConsularData*, "contact information for all representations abroad". Opgehaald met
`scripts/fetch-posten.mjs`, uitgelezen met `scripts/bouw-postplaatsen.mjs`. Van de 143 standplaatsen
hebben er 8 een trema of accent; bij de rest valt niets te vergelijken. 3 meldingen: *Bogota* →
*Bogotá*, *Cairo* → *Caïro*, *Chisinau* → *Chișinău*.

**`vaste-tekst-land-leeg`** — dit dichtte een gat dat de tool zelf aan het licht bracht. Denemarken
en Ierland hebben allebei *"Heeft u direct hulp nodig in ?"* staan: de landnaam is niet ingevuld. De
bestaande regel `nood-lokale-hulpdiensten` zweeg daarover, en dat was geen fout maar een keuze met
een blinde vlek: die toetst op `kern`, en dat is met opzet het stuk zonder landnaam (*"neem contact
op met de lokale hulpdiensten"*). Anders zou elke legitieme afkorting — *de VS*, *het VK* — een
melding geven. Daardoor werd de helft mét de landnaam nooit getoetst.

De nieuwe regel vraagt daarom niet *staat hier precies deze landnaam?* maar *staat hier überhaupt
iets?*. Een lege plek is altijd fout, hoe het land ook wordt afgekort. Gemeten: 2 meldingen, allebei
terecht. De strengere variant — vergelijken met de volledige landnaam — gaf er 38, waarvan 36
onterecht, juist door die afkortingen.

**Wat is afgevallen.** Twee andere kandidaten zijn gemeten en niet gebouwd, omdat het corpus schoon
is: dubbele spaties (0 treffers) en een komma zonder spatie erachter (0). Een derde is afgevallen
omdat hij niet waterdicht te krijgen was: een zin die met een kleine letter begint. Dat gaf 2
treffers, allebei onterecht — *o.a. dengue* en *iPerú*, waar een afkorting en een merknaam de punt
veroorzaken.

## Nederlands of Nederlandse (18 september 2026)

| regel-id | vindplaats | ernst |
|---|---|---|
| `nederlands-verbuiging` | **Geen brondocument.** Nederlandse spellingregel; de woorden staan in `regels/tekstcontrole.json` | fout |

Een bijvoeglijk naamwoord voor een zelfstandig naamwoord krijgt wel of geen **-e**, en dat hangt van
twee dingen af:

| | de-woord | het-woord |
|---|---|---|
| **met** bepaald lidwoord | de Nederlands**e** ambassade | het Nederlands**e** consulaat-generaal |
| **een**, **geen** of geen lidwoord | een Nederlands**e** ambassade | een Nederlands consulaat-generaal |
| **meervoud** | de Nederlands**e** ambassades | de Nederlands**e** consulaten-generaal |

**Met opzet geen grammaticacontrole.** Het Nederlands volledig toetsen vraagt woordsoortherkenning
en zinsontleding — een ander soort programma, met een server erachter, en zelfs dan niet waterdicht.
Erger nog: een halfwerkende grammaticacontrole gaat op bijna elk advies af, en dan geldt de norm uit
de README — dan is de regel het probleem, niet de tekst.

Wat hier staat is daarom een **gesloten verzameling**: vijf zelfstandige naamwoorden waarvan het
geslacht vaststaat. *ambassade*, *vertegenwoordiging* en *post* zijn de-woorden; *consulaat*,
*consulaat-generaal* en *ambassadekantoor* zijn het-woorden. Daarvoor is de regel bewijsbaar
compleet, en daarbuiten zwijgt hij — ook bij *Nederlands* als taalnaam ("informatie in het
Nederlands") en bij woorden die niet in de lijst staan.

**Gemeten over 226 adviezen: 1478 keer staat "Nederlands(e)" voor een van deze woorden, en zes keer
staat het fout.** Drie in een kop: *Nederlandse consulaat-generaal in Australië*, *idem in Turkije*
en *Nederlandse ambassadekantoor in Tsjaad* — zonder lidwoord hoort daar *Nederlands*. Twee in de
lopende tekst, andersom: *van het Nederlands consulaat-generaal in Dubai* en *in Milaan* — daar
hoort na *het* juist wél een -e.

De zesde is Martinique: *"met de Nederlandse ambassade of Nederlandse consulaat-generaal"*. Daar
mist eigenlijk een lidwoord. De melding zegt dat er ook: staat er een lidwoord te weinig, dan is
*het Nederlandse consulaat-generaal* net zo goed.

Dat het in hetzelfde corpus ook goed staat — *Nederlands consulaat-generaal in Dubai*, als kop —
laat zien dat dit geen huisafspraak is maar slordigheid.

**Deze regel verving een toevalstreffer.** De drie koppen vielen eerder op omdat ze niet op de lijst
met vaste tussenkoppen stonden, niet omdat de tool de taalfout zag. Toen `h4-vaste-kop` werd
omgebouwd tot `h4-kop-variant` vielen ze weg. Nu worden ze gemeld om de juiste reden, en de twee in
de lopende tekst erbij — die zag de oude regel helemaal niet.

**Vals alarm.** Klopt een woord wel? Dan hoort het in `regels/uitzonderingen.txt`. Die lijst hoort
bij de webredactie, niet bij de techniek, en groeit met het gebruik. De basis komt uit
SpellingSpeurneus; wat daarna is gemeten over de reisadviezen staat er onderaan bij.

## Hoe een advies zijn eigen land mag noemen (19 september 2026)

Martijn stuurde het Verenigd Koninkrijk als voorbeeld: *"De kleurcode van het reisadvies voor het
VK is groen"* werd gemeld, terwijl die zin gewoon klopt. Zijn vraag: *"In sommige gevallen heeft
het land dus een lidwoord. Dus dan mag dat wel ervoor staan. Is daar iets op te bedenken?"*

De oorzaak zat niet in de zin maar in de vergelijking. Het cms-veld `location` draagt de
administratieve naam — *Verenigd Koninkrijk*, *Bahama's*, *Eswatini (Swaziland)* — en de tool eiste
die naam letterlijk in de vaste zin. Drie verschillen zijn daarom vrijgegeven, want het zijn
verschillen van taal en niet van redactie:

| wat | voorbeeld | waarom |
|---|---|---|
| het lidwoord | *voor de Seychellen*, *voor het VK* | grammatica; het cms-veld draagt nooit een lidwoord |
| de haakjes | cms *Eswatini (Swaziland)*, tekst *Eswatini* | de haakjes zijn een administratieve toevoeging |
| de afkorting | *het VK*, *de VS*, *de VAE*, *de DRC* | vier stuks, uit het nieuwe veld `kort` in `landen.json` |

Die vier afkortingen zijn geteld, niet bedacht: over het hele corpus staat *de VS* 54×, *de DRC*
47×, *het VK* 34× en *de VAE* 31×. Alle andere afkortingen achter een lidwoord zijn instanties —
*de ANWB* (225×), *de GGD* (140×), *het USGS* (53×), *het RIVM* (19×) — geen landen. De lijst is
met opzet gesloten: een land dat er niet in staat, hoort voluit in een vaste zin.

**Verder niets.** Schrijft Nauru *"voor Naoero"* waar het cms *Nauru* zegt, dan is dat een keuze van
een redacteur en geen taalregel, en die blijft gemeld. Dat is ook waarom hier géén jokerteken is
gebruikt: de vorm `De kleurcode van het reisadvies voor {gebieden} is {kleur}` bracht het aantal
meldingen in één klap van 32 naar 2, maar `{gebieden}` matcht álles — dus ook *Naoero* en ook een
verkeerd land. Dat is precies het bezwaar dat Martijn op 19 september tegen de ruime linktekst-
vrijstelling maakte, en het geldt hier net zo goed.

**Twee dingen die meeliften.**

*De dubbele punt.* De gebiedenopsomming opent vaak met een dubbele punt: *"Kleurcode rood geldt
voor:"* met de gebieden eronder als bullets (India). Dat is een leesteken, geen andere formulering,
dus het patroon laat hem toe waar `{gebieden}` op een spatie volgt.

*De kleur van de buurman.* Oman verwijst naar het rode reisadvies voor Jemen. De tool zag daar
kleurcode rood in de tekst en eiste vervolgens van Oman de hele rode vaste tekst. De kleurcodeloop
kijkt nu naar de kleuren van het advies zelf — het cms-veld — en niet naar elke kleur die ergens in
de lopende tekst valt. Ontbreekt dat veld (geplakte tekst), dan valt hij terug op de tekst en
verandert er niets. Dezelfde redenering stond al in de code voor `kleurenVanAdvies`; hij gold alleen
nog niet voor deze loop.

**Gemeten over 226 adviezen:** `kleur-aanduiding` gaat van 32 naar 2 meldingen, `intro-vaste-tekst`
van 26 naar 8, `kleur-vaste-tekst` van 2 naar 1. Totaal 3032 → 2983.

Wat overblijft is echt:

| land | wat er staat | wat eraan is |
|---|---|---|
| Nauru | *De kleurcode van het reisadvies voor Naoero is groen* | andere schrijfwijze dan het cms |
| Zuid-Afrika | *De kleurcode **voor** het reisadvies voor Zuid-Afrika is geel* | moet *van het reisadvies* zijn |
| VK / VS / VAE / DRC (intro) | *Reist u naar het Verenigd Koninkrijk (VK)? Bijvoorbeeld naar Engeland, Wales, Schotland of Noord-Ierland?* | een vaste zin met een toevoeging erin |
| Mali | *veiligheidsrisico&#39;s* | html-code in de tekst |
| Palau | *in geval van nood en hoe u zich voorbereidt* | komma ontbreekt |

De vier intro-meldingen blijven bewust staan. Het zijn vaste zinnen met een zelfbedachte toevoeging,
en dat is exact het geval waarvan Martijn zei: *"dan kan je beter maar die zin laten oppoppen. En
dan vervolgens zeggen, nou hier is het toegestaan."*

### Nagekomen op 19 september, na Martijns antwoord

**De komma is een sorteerkunstje.** Op *Congo, de Republiek* zei Martijn: *"De Republiek Congo is in
de tekst volgens mij wel de goede naam."* Dat klopt — de komma in de landenlijst zet het land onder
de C, meer is het niet. Draai de delen om en je hebt de naam zoals een mens hem schrijft. Het raakt
precies twee landen, allebei Congo, en allebei schrijven ze het in hun advies omgedraaid: *de
Republiek Congo* en *de Democratische Republiek Congo (DRC)*. Die vorm is nu toegestaan, net als de
haakjes en het lidwoord.

**Naoero is geen fout maar een achterstand.** Op Nauru zei Martijn: *"dat kan kloppen dat de
schrijfwijze van het land anders is en niet overal nog goed doorgevoerd, want dit is een recente
naamswijziging die we nog op bepaalde plekken moeten doorvoeren."* De melding blijft dus staan — er
ís iets recht te trekken — maar de tekst erbij deugde niet: *"Kleurcode groen wordt niet op een van
de vaste manieren aangeduid"* terwijl de zin woord voor woord het sjabloon volgt.

De regel kijkt nu twee keer. Faalt de strikte toets, dan gaat hetzelfde sjabloon er nog eens
overheen met een vangnet op de plek van `{land}`. Slaat dát wel aan, dan staat de vaste zin er en
zit het verschil alleen in de naam, en zegt de melding dat ook:

> De vaste zin bij kleurcode groen staat er, maar noemt het land "Naoero". In het cms heet dit
> advies "Nauru".
> *Of de tekst of de landenlijst loopt achter. De tool weet niet welke van de twee; hij meldt alleen
> dat ze niet hetzelfde zeggen.*

Zuid-Afrika houdt de oude melding, en dat is het bewijs dat de splitsing werkt: daar staat *de
kleurcode **voor** het reisadvies*, en dat verschil zit niet in de naam maar in de zin.

Stand na deze twee: `kleur-aanduiding` 32 → 2, totaal 3032 → 2982, 149 tests groen.

## "Erheen" of "hierheen": geen keuze maar een telling (19 september 2026)

Er lag een vraag bij Martijn over de eerste kleurbullet van een advies met meerdere kleurcodes. Die
vraag was verkeerd gesteld: het is geen kwestie van smaak, en de telling geeft antwoord.

Het sjabloon zet bij geel en groen twee bijna gelijke zinnen tegenover elkaar. Geldt de kleur voor
het hele land, dan *"U kunt **erheen** reizen"*. Geldt hij voor een deel, dan *"U kunt **hierheen**
reizen"*. Eén woord verschil.

**Over 226 adviezen, 203 keer geteld:**

| | erheen | hierheen |
|---|---:|---:|
| de kleur geldt voor het hele land | **136** | 3 |
| de kleur geldt voor een deel | 16 | **48** |

184 van de 203 volgen het sjabloon. Het onderscheid is dus echt en wordt breed aangehouden; de 19
die het anders doen hebben één woord verkeerd. Er valt hier niets te kiezen.

**Wat wél moest veranderen, is de melding.** Die zei *"Dit advies heeft meerdere kleurcodes, dus bij
geel hoort de verkorte variant. Nu staat de volledige uitleg er."* Feitelijk juist, maar wie het
moet herstellen ziet twee zinnen die identiek lijken. Scheelt het hoogstens twee woorden, dan noemt
de melding ze nu:

> Dit advies heeft meerdere kleurcodes, dus bij geel hoort de verkorte variant. Nu staat de
> volledige uitleg er. **Er staat "erheen", er hoort "hierheen" te staan.**

Bij rood loopt de hele zin anders (*"reis er niet heen"* tegen *"reis niet hierheen"*, en de
volledige variant heeft er een zin over de ambassade bij). Dan geeft de vergelijking niets terug en
blijft de melding zoals hij was — een half diagnose-zinnetje is erger dan geen.

Het aantal bevindingen verandert hier niet van: 2982 blijft 2982. Dit is alleen de melding die zegt
wat er aan de hand is.

**En passant gevonden:** Marokko schrijft *"Vor de rest van Marokko geldt kleurcode geel"*. Die
typefout stond al in de tool, via `woord-onbekend`.

### Nagekeken in de matrix zelf (19 september 2026)

Martijn wilde het nazoeken; de matrix staat in deze repo, dus dat kon meteen. Tabblad
*Kleurcode-teksten*, kolom *In het kort*, cel C3 (rij Geel):

> **Volledig geel:**
> De kleurcode van het reisadvies voor land X is geel. U kunt **erheen** reizen. Maar let op: er
> zijn bijzondere veiligheidsrisico's.
>
> **Deels geel:**
> Voor de gebieden X en Y/**de rest van land X** geldt kleurcode geel. U kunt **hierheen** reizen.
> Maar let op: er zijn bijzondere veiligheidsrisico's.

Cel C2 (Groen) is identiek opgebouwd. Dat beslist het, en scherper dan de telling alleen: de matrix
noemt *"de rest van land X"* met zoveel woorden als onderdeel van de **deels**-variant. Precies die
zin staat in de afwijkende adviezen — *"Voor de rest van Peru geldt kleurcode geel. U kunt erheen
reizen."* — en daar hoort dus *hierheen*.

De vier teksten in `regels/kleurcodes.json` zijn tegen de cellen C2 tot en met C5 gelegd en komen
woord voor woord overeen, inclusief het detail dat het alternatief *"/de rest van land X"* alleen
bij groen en geel staat en niet bij oranje en rood.

`scripts/erheen-hierheen.mjs` schrijft de opschoonlijst naar `data/erheen-hierheen.md`: **20 zinnen
in 19 adviezen**, één woord per zin. Het script leunt op hetzelfde cms-veld als de regel — één
kleurcode betekent het hele land, meer kleurcodes betekent dat elke bullet over een deel gaat — en
niet op hoe de zin toevallig loopt. Dat scheelt: de Verenigde Arabische Emiraten schrijven *"De
kleurcode van het reisadvies voor de VAE is geel. U kunt erheen reizen"* terwijl geel daar alleen
voor de rest van het land geldt. Op de zin alleen afgaand lijkt dat goed; met het cms-veld erbij is
het de verkeerde variant.

## De twee kolommen van de matrix uit elkaar (19 september 2026)

Martijn waarschuwde hiervoor: het tabblad *Kleurcode-teksten* heeft twee kolommen met kleurteksten
en die mogen niet door elkaar lopen.

| kolom | wat | waar in het advies |
|---|---|---|
| **In het kort** (C) | de bullets bovenaan, volledig of verkort | het blok "In het kort" |
| **Regionale risico's** (D) | de definitie per kleur, onder een h4-kopje dat zelf de kleur is | de rubriek Regionale risico's |

Die tweede is dus twee dingen: het kopje (*"Geel: let op, er zijn risico's"*) en de tekst eronder
(*"U kunt reizen naar gebieden met kleurcode geel. Maar let op: …"*). Ze staan als `regionaal_kop`
en `regionaal_tekst` in `regels/kleurcodes.json` en worden getoetst door `regionaal-kleur-kop` en
`regionaal-kleur-tekst`.

**Eerst nagekeken of onze data klopt.** De zestien velden — vier kleuren × `in_het_kort_volledig`,
`in_het_kort_deels`, `regionaal_kop`, `regionaal_tekst` — zijn tegen de cellen C2 tot en met D5
gelegd. Alle zestien komen letterlijk overeen. Het enige verschil is de apostrof: de matrix heeft de
gekrulde, onze data de rechte, en `norm()` maakt die gelijk.

**Toen bleek de code ze wél door elkaar te halen.** `kleur-aanduiding`, `kleur-vaste-tekst` en
`kleur-variant` zochten in de héle tekst van het advies in plaats van in het blok "In het kort". Een
goede zin verderop dekte daarmee een foute bullet af. Dat is niet theoretisch:

| land | wat er in de bullet staat | wat de tool zei |
|---|---|---|
| Marokko | *"**Vor** de rest van Marokko geldt kleurcode geel"* | niets |
| India | *"De kleurcode van het reisadvies **van** India is rood"* | niets |
| Burkina Faso | *"De kleurcode van het reisadvies voor Burkina Faso is **voor het grootste deel** rood"* | niets |
| Irak | *"geldt **grotendeels** kleurcode oranje"* | niets |
| Japan | *"De kleurcode van het reisadvies voor **het zuidoosten van Fukushima** is rood"* | niets |
| Cuba | *"**Reis er alleen heen als dit** noodzakelijk is"* | niets |
| Guinee | de handelingsinstructie bij oranje ontbreekt helemaal | *"wijkt af van de vaste tekst"* |

De drie toetsen kijken nu in `kortGenorm`, het blok "In het kort". Heeft een advies dat blok niet
(geplakte tekst), dan valt de toets terug op de hele tekst; anders zou hij helemaal niets meer
zeggen. Guinee verschuift van `kleur-variant` naar `kleur-vaste-tekst`, wat de juistere diagnose is:
de instructie ontbreekt, hij wijkt niet af.

**Eén vals alarm kwam mee, en dat had een andere oorzaak.** Jordanië somt 151 tekens aan gebieden
op en het jokerteken voor `{gebieden}` stopte bij 120. Geteld over 230 opsommingen in het corpus is
de langste die van Irak met 211 tekens, daarna Armenië (155) en Jordanië (151); zes zitten boven de
120. De grens staat nu op 220, als `GEBIEDEN_MAX`.

Dat is een ander soort jokerteken dan dat voor `{land}`. Daar zou het een verkeerde landnaam
verbergen, en daarom staat daar een gesloten lijst. De gebieden zijn per definitie vrije tekst — de
matrix schrijft ze als *"gebieden X en Y"* — en het patroon kan geen punt passeren, dus het blijft
binnen één zin.

**Stand:** 2982 → 2987 bevindingen over 226 adviezen, 153 tests groen. Vijf meldingen erbij die
allemaal een echte fout aanwijzen, en één betere diagnose.

## Maximaal vijf gebieden per kleur (19 september 2026)

Martijn heeft aan de matrix toegevoegd:

> Maximaal 5 gebieden per kleur noemen, anders een windrichting noemen. Dus niet gebied 1, 2, 3, 4,
> 5, 6, maar liever gebieden in het noorden en oosten.

**Het tellen was het moeilijke deel, niet de regel.** De voor de hand liggende manier — splitsen op
komma's en "en" — telt namen en geen gebieden, en dat levert precies de ruis op waar Martijn voor
waarschuwde:

| land | wat er staat | naïef geteld | werkelijk |
|---|---|---:|---:|
| Benin | *de noordelijke regio's van Benin die grenzen aan Togo, Burkina Faso, Niger en Nigeria* | 4 | **1** |
| Algerije | *de grensgebieden met Mauritanië, Mali, Niger en Libië en voor delen van de grensstrook met Marokko* | 5 | **2** |
| Senegal | *de grensgebieden tussen Senegal en Gambia, Guinee-Bissau, Mali en een deel van de grens met Mauritanië* | 5 | **2** |

Die landnamen zijn oriëntatiepunten, geen gebieden. Daarom telt een deel alleen mee als het zélf
een gebied benoemt (*de provincie Mafraq*, *het grensgebied met India*), of als het achter een deel
hangt dat een meervoud aankondigde (*de regio's Kanem, Ouaddai, Tibesti*). Hangt het achter een
oriëntatiewoord — *met*, *tussen*, *grenzen aan* — dan telt het niet.

**Windrichtingen tellen met opzet niet mee.** *"Het noorden en oosten"* is juist de vorm die de
matrix aanraadt boven een opsomming; die mag hier niet tegen een advies gaan werken. Zonder die
uitzondering telde Kameroen *"het oosten en zuiden van de regio Sud-Ouest"* als twee losse gebieden.

De telling is verder met opzet voorzichtig: bij twijfel telt hij laag. Liever een opsomming van zes
missen dan er een van vier melden.

**Gemeten over 226 adviezen: 252 kleuraanduidingen, waarvan één boven de vijf.**

| aantal gebieden | 1 | 2 | 3 | 4 | 5 | 7 |
|---|---:|---:|---:|---:|---:|---:|
| hoe vaak | 219 | 20 | 7 | 2 | 3 | 1 |

Die ene was Tsjaad — en daarover gaf Martijn meteen uitsluitsel: *"Dat voorbeeld van Tsjaad vind ik
wel acceptabel en mag dus wel 5 zijn."*

### Wat de eerste telling fout deed

*"alle grensgebieden van Tsjaad, het gebied rond het Tsjaadmeer, en de regio's Kanem, Ouaddai,
Tibesti, Borkou en Ennedi of delen daarvan"* telde als zeven, omdat de vijf regionamen achter *de
regio's* elk apart meetelden. Maar dat is één opsomming achter één kopwoord, en die rekent Martijn
goed.

De telling kijkt nu alleen naar delen die zélf een gebied benoemen. Namen die daarachter hangen
horen bij het gebied dat er al staat:

| zin | telt als | waarom |
|---|---:|---|
| *alle grensgebieden van Tsjaad, het gebied rond het Tsjaadmeer, en de regio's Kanem, Ouaddai, Tibesti, Borkou en Ennedi of delen daarvan* | **4** | drie kopwoorden plus *delen daarvan*; de vier losse regionamen horen bij *de regio's* |
| *de noordelijke regio's van Benin die grenzen aan Togo, Burkina Faso, Niger en Nigeria* | **1** | één gebied, vier buurlanden als oriëntatiepunt |
| *het noorden, het oosten, het zuiden en het westen van Tsjechië* | **1** | windrichtingen zijn juist de aanbevolen vorm |
| *de provincie A, de provincie B, de stad C, het eiland D, de regio E en het district F* | **6** | zes eigen kopwoorden — dit is het geval uit de matrixregel |

Daarmee gaat de regel over de 226 adviezen **geen enkele keer** af. Dat is hier het doel en geen
tekortkoming: hij bewaakt wat er morgen geschreven wordt, en het laatste geval hierboven laat zien
dat hij wel degelijk werkt.

### De interne regel van 3 is losgelaten

Martijn: *"betekent dat wij intern een regel moeten versoepelen van de 3."* De oude limiet uit
tabblad *Koppen* — *"Bij het noemen van meerdere gebieden/plaatsen max. 3 noemen en verwijzen"* —
staat nu ook op 5, zodat beide matrixregels hetzelfde getal aanhouden. De regel-id heet daarom niet
langer `gebieden-max-drie` maar `gebieden-max`.

Die oude regel gaf al nul treffers, omdat hij alleen zoekt naar het letterlijke woord *gebieden*
gevolgd door namen met hoofdletters. Hij blijft staan voor opsommingen buiten een kleurbullet; de
nieuwe regel dekt de kleurbullets zelf, met de betere telling.

## Fukushima mag wel (19 september 2026)

Japan schrijft *"De kleurcode van het reisadvies voor het zuidoosten van Fukushima is rood"* — de
landvorm van de zin met een gebied in de landplek. Martijn: *"alleen Fukushima hoeft niet op te
poppen."*

Eerder was die vorm bewust níét toegestaan, omdat `{gebieden}` een jokerteken is en dan ook
*"Naoero"* of een verkeerde landnaam erdoor zou glippen. Dat bezwaar blijft staan, dus de oplossing
is een aparte plaatshouder: **`{gebied}`** eist dat er werkelijk een gebied staat — een windrichting,
of een woord als *regio*, *provincie*, *eiland*, *grensgebied*, *kust*, *delta*.

Daarmee is *"het zuidoosten van Fukushima"* een gebied en *"Naoero"* niet:

| advies | in de landplek | uitkomst |
|---|---|---|
| Japan | *het zuidoosten van Fukushima* | gebied → geen melding |
| Nauru | *Naoero* | kale naam → blijft gemeld |
| Burkina Faso | *Burkina Faso is voor het grootste deel* | past niet op de zin → blijft gemeld |

De vorm staat nu als `"De kleurcode van het reisadvies voor {gebied} is {kleur}"` in
`aanduiding_sjablonen`, met `herkomst: aanvulling`: hij staat niet letterlijk in de NB-kolom, maar
is op 19 september goedgekeurd.

## "Ontbreekt" terwijl de zin er wél staat (19 september 2026)

Martijn wees bij Suriname op de melding *"De vaste tekst over de douaneregels van het land zelf
ontbreekt"* en vroeg wat er dan verwacht werd. De melding klopte niet: Suriname schrijft *"Check wat
u mee mag nemen naar Suriname op de website van de Surinaamse overheid"* — de tekst staat er, alleen
anders.

Het sjabloon kent hier al een mechanisme voor. Een vaste tekst kan naast `kern` (wat er letterlijk
moet staan) een veld `herken` dragen: slaat dát aan terwijl `kern` faalt, dan meldt de tool dat de
tekst *afwijkt* in plaats van *ontbreekt*, en geeft hij de gevonden zin mee als fragment — zodat de
pagina hem markeert en je erheen kunt springen. `bagage-terug` had dat; `bagage-heen` niet.

**Gemeten over de 21 adviezen die deze melding krijgen:**

| wat er staat | aantal |
|---|---:|
| *Check wat u **mee mag nemen** naar X* | 5 |
| *Lees wat u mag meenemen naar X* | 5 |
| *Check wat u mag meenemen **op** …* | 2 |
| Monaco: *Check wat u mag **meenenemen** naar Monaco* | 1 |
| Canada: *Check dit vooraf bij de lokale autoriteiten* | 1 |
| overige varianten op dezelfde zin | 4 |
| **de tekst ontbreekt echt** | **3** |

Die laatste drie zijn Antarctica (eigen regels over planten- en dierenresten), India (een verbodslijst)
en Thailand (dat de kop zelfs omdraait naar *"Wat mag ik **niet** meenemen naar Thailand?"*). Daar is
niets aan te wijzen en blijft de melding *ontbreekt*.

Het aantal bevindingen verandert hier niet van: 2986 blijft 2986. Wat verandert is dat achttien
ervan nu zeggen wat er aan de hand is en de zin aanwijzen.

**Wat hiernaast nog open ligt.** Zeven andere vaste teksten hebben nog geen `herken` en zeggen dus
altijd *ontbreekt*, samen 61 meldingen: `regionaal-gebiedenzin` (32), `nood-verwijzing-nood` (7),
`nood-verwijzing-crisis` (7), `medicijnen-voldoende` (7), `kinderen-documenten` (4),
`reisverzekering-oranje-rood` (3) en `rood-herhaling-voorbereiding` (1). Elk daarvan vraagt zijn
eigen meting — welke formuleringen komen er echt voor — dus dat is een aparte ronde.

## "Eventueel" in de kinderzin mag blijven (19 september 2026)

Martijn over de melding *Twijfeltaal: "eventueel"* bij Suriname: *"het woord eventueel zou hier wel
moeten blijven omdat je niet altijd een visum nodig hebt, hangt af van reden bezoek. Kan misschien
anders, maar dan wordt wel weer langere tekst. Dus ben geneigd uitzondering te maken en deze
variant goed te keuren."*

De zin stond al op de vrijstellingslijst — maar in één vorm, zonder komma's. Suriname schrijft hem
mét: *"Kinderen hebben ook een geldig paspoort, en eventueel een visum, nodig voor een reis naar
Suriname."* Daarmee sloeg de vrijstelling niet aan en viel de zin alsnog over de schrijfregels.

**Geteld over 226 adviezen komt de zin overal voor, in tien varianten die de tool niet herkende:**

| wat er in het midden staat | adviezen |
|---|---:|
| *, en eventueel een visum,* | BRA NIU SUR TON WSM |
| *of geldige ID-kaart en eventueel een visum* | ALB TUR |
| *, een ESTA of eventueel een visum* | PRI USA |
| *en (eventueel) een visum* | ARM |
| *of geldige ID-kaart, en eventueel een visum,* | BIH |
| *(en eventueel toestemming van de immigratiedienst)* | DMA |
| *(en eventueel een inreisvergunning)* | FSM |
| *en eventueel toestemming voor langer verblijf* | MSR |
| *, een Thailand Digital Arrival Card en eventueel een visum,* | THA |
| *en een ESTA, en eventueel een visum,* | VIR |

Wat al die varianten delen is het frame: *"Kinderen hebben ook een geldig paspoort … nodig voor een
reis naar {land}."* Het middenstuk hángt van het land af, en daar heeft de lijst al een
plaatshouder voor: `{vrij}`, *"een plek die het sjabloon openlaat"*. De regel luidt nu
`Kinderen hebben ook een geldig paspoort{vrij} nodig voor een reis naar {land}.`

**Dit is een ander soort jokerteken dan het afgewezen soort.** Bij de linkteksten wees Martijn een
ruime vergelijking af, en terecht: daar gaat het om een *voorgeschreven* zin, en dan is elke
afwijking het bekijken waard. Deze zin is niet voorgeschreven. Hij staat op de vrijstellingslijst,
en die lijst zegt in zijn eigen toelichting: *"welke variant geldt hangt van het land af"*. De
variatie is hier het uitgangspunt, niet de afwijking.

**Gemeten: 2986 → 2940 bevindingen.** 16 meldingen over twijfeltaal en 30 over zinslengte, alle 46
op dezelfde huiszin. Nagegaan of er iets anders meeviel: van de 30 verdwenen lengtemeldingen gaat
er geen enkele over een andere zin.
