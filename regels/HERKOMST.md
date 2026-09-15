# Herkomst van de regels

Elke regel die de tool toetst is hier herleidbaar naar zijn bron. Dat is geen administratie om de
administratie: `STRATEGY.md` stelt dat de discussie achteraf ontstaat doordat de toets nu smaak is.
Een bevinding zonder bron is daarom een bevinding die de tool niet hoort te geven.

Twee bronnen:

- **SW** — `Schrijfwijzer Nederland Wereldwijd - website.docx`
- **MX** — `Matrix nieuwe format Reisadviezen (1).xlsx`

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

## Buiten scope

Uit `STRATEGY.md`, *Niet aan werken*:

- **politieke gevoeligheden** — de tool doet hier geen uitspraak over
- **inkorten** — wel de overschrijding signaleren en de langste blokken aanwijzen, niet zelf schrappen
- **SharePoint-koppeling** — Word-concepten gaan handmatig in en uit

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
