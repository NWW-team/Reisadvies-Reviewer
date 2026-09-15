# Herkomst van de regels

Elke regel die de tool toetst is hier herleidbaar naar zijn bron. Dat is geen administratie om de
administratie: `STRATEGY.md` stelt dat de discussie achteraf ontstaat doordat de toets nu smaak is.
Een bevinding zonder bron is daarom een bevinding die de tool niet hoort te geven.

Drie bronnen:

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
| `kort-informatieservice` | MX, tab *Koppen*, rij *In het kort* | standaardtekst Aanmelden Informatieservice aanwezig |
| `actueel-max-woorden` | MX, tab *Koppen*, rij *In het kort* | Actueel max 25 woorden |
| `gebieden-max-drie` | MX, tab *Koppen*, rij *In het kort* | max 3 gebieden/plaatsen noemen, daarna verwijzen |
| `h2-vast` | MX, tab *Uitleg* | H2-koppen zijn vast |
| `h3-niet-melden` | MX, tab *Koppen*, richtlijn *Niet melden* | onderwerp hoort niet in het reisadvies |
| `h3-regionaal-alleen-bij-meerdere` | MX, tab *Koppen*, rij *Regionale risico's* | alleen bij meer dan 1 kleurcode |
| `zin-max-woorden` | SW, *Begrijpelijkheid > B1* | max 15 woorden per zin |
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
| `getallen-cijfers` | SW, *Schrijfregels > Getallen / Cijfers* | cijfer, duizendtal met punt |
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

## Sjabloonregels (laag 1, bron SJ)

Uit `Sjabloon Reisadviezen - nieuwe format.docx`. Het sjabloon legt per rubriek letterlijke
teksten vast; de tool meldt alleen dát een vaste tekst ontbreekt en toont de verwachte
formulering. Invullen blijft aan de redacteur, want welke variant klopt hangt van het land af.

| regel-id | bron | wat |
|---|---|---|
| `kort-max-bullets` | SJ, blok In het kort | maximaal 4 bullets |
| `kleur-formulering-verboden` | SJ, blok In het kort | niet "gele gebieden" maar "gebieden met kleurcode geel" |
| `intro-vaste-tekst` | SJ, blok Introductie | de vaste intro, met een eigen variant bij alleen kleurcode rood |
| `rubrieken-max` | SJ, richtlijn boven de rubrieken | maximaal 6 rubrieken per H2 |
| `rubrieken-volgorde` | SJ, blok Risico dat van toepassing is | volgorde van relevantie |
| `nood-contactnummer` | SJ, blok In geval van nood | alleen de vaste nummers van het contactcenter |
| `informatieservice-vaste-tekst` | SJ, blok Oproep registratie Informatieservice | De standaardoproep om u aan te melden voor de Informatieservice ontbreekt of wijkt af. |
| `nood-contactcenter` | SJ, blok In geval van nood | De vaste tekst over de bereikbaarheid van het contactcenter ontbreekt. |
| `nood-lokale-hulpdiensten` | SJ, blok In geval van nood | De vaste aanhef boven de alarmnummers ontbreekt. |
| `nood-verwijzing-nood` | SJ, blok In geval van nood | De vaste verwijzing naar de pagina over nood ontbreekt. |
| `nood-verwijzing-crisis` | SJ, blok In geval van nood | De vaste verwijzing naar de pagina over een crisissituatie ontbreekt. |
| `reisverzekering-vaste-tekst` | SJ, blok Reisverzekering | De vaste openingstekst over de reisverzekering ontbreekt. |
| `reisverzekering-oranje-rood` | SJ, blok Reisverzekering | Dit advies heeft kleurcode oranje of rood; dan hoort de waarschuwing over de dekkingsvoorwaarden erbij. |
| `reisverzekering-familie` | SJ, blok Reisverzekering | De vaste let-op-tekst over familie en de verzekeraar ontbreekt. |
| `vaccinaties-ggd` | SJ, blok Reisvaccinaties | De vaste verwijzing naar GGD Reisvaccinaties ontbreekt. |
| `vaccinaties-lcr` | SJ, blok Reisvaccinaties | De vaste verwijzing naar het LCR ontbreekt. |
| `medicijnen-voldoende` | SJ, blok Medicijnen | De vaste tekst over voldoende medicijnen ontbreekt. |
| `medicijnen-verklaring` | SJ, blok Medicijnen | De vaste tekst over de medicijnverklaring ontbreekt. |
| `medicijnen-verpakking` | SJ, blok Medicijnen | De vaste tekst over de originele verpakking ontbreekt. |
| `bagage-heen` | SJ, blok Bagageregels | De vaste tekst over de douaneregels van het land zelf ontbreekt. |
| `bagage-terug` | SJ, blok Bagageregels | De vaste verwijzing naar 'Wat mag ik meenemen naar Nederland?' ontbreekt. |
| `criminaliteit-themapagina` | SJ, blok Criminaliteit | Na het maatwerk hoort de vaste verwijzing naar de themapagina over criminaliteit. |
| `lhbtiq-verwijzing` | SJ, blok Wetten en gebruiken | Waar lhbtiq+ aan de orde komt, hoort de vaste verwijzing naar de themapagina erbij. |
| `paspoort-kopie` | SJ, blok Paspoort, visum, rijbewijs | De vaste tekst over het delen van een kopie van het paspoort ontbreekt. |
| `rijbewijs-anwb` | SJ, blok Paspoort, visum, rijbewijs | Waar het rijbewijs aan de orde komt, hoort de vaste verwijzing naar de ANWB erbij. |
| `kinderen-documenten` | SJ, blok Paspoort, visum, rijbewijs | De vaste verwijzing over reizen met een minderjarig kind ontbreekt. |
| `regionaal-gebiedenzin` | SJ, blok Regionale risico's | De vaste aanhef boven de opsomming van gebieden ontbreekt. |
| `rood-herhaling-voorbereiding` | SJ, blok Hoe bereid ik mijn reis voor | Bij een volledig rood reisadvies herhalen we de waarschuwing onder de reisvoorbereiding. |

### Waar de bronnen elkaar tegenspreken

De matrix merkt **Geldzaken** aan als *niet melden*, het nieuwere sjabloon neemt het op als
rubriek "alleen indien noodzakelijk". De tool meldt dat als *let op* met beide bronnen erbij,
in plaats van één bron stil te laten winnen. Welke bron voorgaat is een redactionele keuze.

De regel `kort-informatieservice` is vervallen: `informatieservice-vaste-tekst` toetst nu de
hele standaardoproep in plaats van alleen of het woord "informatieservice" ergens voorkomt.

## Buiten scope

Uit `STRATEGY.md`, *Niet aan werken*:

- **politieke gevoeligheden** — de tool doet hier geen uitspraak over
- **inkorten** — wel de overschrijding signaleren en de langste blokken aanwijzen, niet zelf schrappen
- **SharePoint-koppeling** — Word-concepten gaan handmatig in en uit
