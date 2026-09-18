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
