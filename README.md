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

**Eén of meerdere kleurcodes.** Geldt er één kleurcode, dan staat in *In het kort* de volledige
uitleg. Zijn het er meer, dan staat daar per gebied de verkorte variant en volgt de volledige uitleg
onder *Regionale risico's*, onder een vast kopje per kleur. De tool toetst welke variant hoort en of
*In het kort* doorverwijst met "Lees meer onder Regionale risico's". Welke kleuren een advies heeft
komt uit het cms-veld, niet uit de lopende tekst — een advies kan een ánder land noemen.

Elke bevinding draagt zijn bron mee: **SW** = schrijfwijzer, **MX** = format-matrix,
**SJ** = sjabloon. `regels/HERKOMST.md` legt per regel-id de vindplaats vast — een bevinding
zonder bron hoort de tool niet te geven, en een test bewaakt dat.

Vaste formuleringen uit het sjabloon zijn vrijgesteld van de schrijfregels: een zin die te lang is
omdat het sjabloon hem zo voorschrijft, is geen fout van de redacteur. Dat de vaste teksten zelf
soms boven de norm liggen is een gesprek over het sjabloon; `data/vaste-teksten-boven-de-norm.md`
zet die zinnen op een rij.

Steunt een bevinding op een woord dat de tool zelf heeft toegevoegd in plaats van op een geciteerde
regel, dan staat dat erbij als **aanvulling**. Zo is bij de review te zien welk deel van het oordeel
uit de bron komt en welk deel een keuze van de bouwer is.

## In de tool

**De lijst met reisadviezen.** Op de Pages-versie staan alle 226 reisadviezen in het keuzemenu.
Ze staan niet in de pagina zelf — dat zou hem een paar megabytes groot maken — maar als losse
bestanden ernaast in `docs/adviezen/`, gemaakt met `node scripts/bouw-adviezen.mjs`. De pagina
haalt `adviezen/index.json` op om de lijst te vullen en pas bij het kiezen het advies zelf.
Lukt dat ophalen niet (de Artifact-versie mag geen verzoeken doen), dan blijven de drie
voorbeelden staan die wél in de pagina zijn gevouwen. Zo is er één pagina voor beide plekken.

**Wat er getoetst wordt.** De introductiezin hoort erbij: die komt uit het cms-veld
*Inhoudelijke wijzigingen* (in de API `modifications`) en heeft een eigen vaste formulering, met
een aparte variant voor een advies dat alleen kleurcode rood kent. De intro en *In het kort* zijn
twee verschillende dingen met elk hun eigen regels; wordt een advies zonder opmaak geplakt, dan
ziet de parser geen koppen en herkent de tool dat het introveld ontbreekt in plaats van *In het
kort* als intro te toetsen.

**Markering.** Een bevinding die een plek in de tekst heeft, kleurt die zin in het linkerpaneel;
klikken op de zin of op het citaat springt naar de andere kant. Een fragment hoeft niet precies
één zin te zijn: valt een zin binnen het fragment of omgekeerd, dan kleurt hij mee. Bevindingen
over iets dat *ontbreekt* hebben niets om aan te wijzen en blijven ongemarkeerd — die staan
alleen in de lijst, met de verwachte formulering erbij.

**Vijf kleuren, vaste volgorde.** De ernst van een bevinding is een *soort*, geen rangorde van
erg naar minder erg. De lijst staat altijd in deze volgorde, zodat je hem van boven naar beneden
kunt aflopen:

| kleur | soort | waarvoor |
| --- | --- | --- |
| rood | **Fout** | het mag echt niet: een onderwerp dat er niet hoort, een vaste formulering die niet is aangehouden |
| geel/oranje | **Let op** | te lange zin zonder link, te lange linktekst, lijdende vorm |
| lichtblauw | **Lange zin met link** | meer dan 15 woorden *en* een link in de zin — vaak op te lossen door de linktekst in te korten |
| grijs | **Ter overweging** | de rest: notatieregels en signalen om over na te denken |
| roze | **Twijfeltaal** | misschien, vaak, mogelijk, bijna … — onderaan, want het is bijna altijd een stapel losse woorden die je in één ronde wegwerkt |

Staan er meer bevindingen op één zin, dan wint de eerste uit die volgorde: een fout moet je hoe
dan ook zien. Een vaste formulering uit het sjabloon telt nergens mee — die is zo vastgesteld.

**Filteren.** Boven de bevindingen staat per groep een vinkje met een teller: *Fout en format*,
*Te lange zinnen*, *Te lange zinnen incl. link*, *Tekstfouten*, *Mogelijke spelfouten*,
*Linkteksten*, *Lijdende vorm*, *Twijfeltaal: misschien, mogelijk*, *Twijfeltaal: vaak, soms*,
*Volgorde van de rubrieken* en *Notatie en stijl*. Alles staat aan; een klik zet een soort weg. Een aangevinkte knop is gevuld
met een vinkje, een uitgezette is doorgestreept met een kruisje, zodat je ziet wat een klik doet. De indeling staat in
`regels/groepen.json`; een test faalt als er een regel bij komt die er niet in staat.

Te lange zinnen staan in twee filters, want het zijn twee klussen: zit de lengte in de linktekst,
dan kort je die in; is het een lange lopende zin, dan splits je hem. Ze komen uit dezelfde regel,
dus een filtergroep mag zich met het veld `ernst` beperken tot bevindingen van die soort.

Kleur en groep zijn met opzet twee verschillende dingen. De **kleur** zegt hoe ernstig een bevinding
is en bepaalt de volgorde. De **groep** zegt wat voor soort het is en bepaalt alleen wat je opzij
zet. Daarom valt *te veel rubrieken* onder *Fout en format* terwijl het geel blijft.

Filteren verbergt, het schrapt niet. Elk advies begint met alles aan, er staat altijd bij hoeveel er
buiten beeld is, en het rapport vermeldt de filterstand — het gaat naar iemand die hem niet ziet.
Vier groepen zijn samen ruim 70% van alle bevindingen; met die uit ga je van bijna 17 naar krap 5
bevindingen per advies, zonder dat er één regel verdwijnt.

**Melding en zin naast elkaar.** Op een breed scherm heeft elk paneel zijn eigen scroll. Klik je een
bevinding aan, dan schuiven beide panelen zo dat de melding en de gemarkeerde zin op dezelfde hoogte
staan. Staat de pagina in één kolom, dan kan dat niet en springt hij naar de andere kant.

**De drie oordelen** bij elke bevinding zeggen elk iets anders, en dat is met opzet:

| oordeel | betekenis | wat het over de tool zegt |
| --- | --- | --- |
| Eens | de bevinding klopt; de tekst gaat hierop aan | niets, de regel deed zijn werk |
| Oneens | de regel klopt, maar in dit advies wijken we er bewust van af | niets; het is een uitzondering in de tekst |
| Onterecht | de bevinding zelf deugt niet: de tool ziet iets dat er niet staat | de regel of de parser moet bijgesteld |

Kort: *oneens* gaat over het advies, *onterecht* gaat over de tool. Een regel die vaak
"onterecht" krijgt, hoort bijgesteld te worden; zie "Over de regels" hieronder.

**Delen met een collega.** Twee knoppen boven de panelen:

- **Printen / pdf** zet het rapport klaar en opent het printvenster; kies daar "Opslaan als pdf".
  In het rapport staan de samenvatting, alle bevindingen met bron en oordeel, en het hele advies
  met de gemarkeerde zinnen onderstreept, zodat het ook zwart-wit leesbaar blijft.
- **Kopiëren voor Word** zet hetzelfde rapport op het klembord, als opgemaakte tekst én als platte
  tekst. Plakken in Word of Outlook houdt de koppen en de onderstrepingen; plakken in een
  chatvenster levert de platte versie op. Mag de klembord-api niet in de omgeving waar de pagina
  draait, dan valt de knop terug op platte tekst en anders op de printknop.

Beide werken zonder bibliotheek, zonder server en zonder download — dat laatste met opzet, want
de Artifact-omgeving blokkeert downloads die een pagina zelf start.

## Eén bron, twee bouwstappen

De regels staan op één plek: `src/` voor de code, `regels/*.json` voor de data. Alles wat
gepubliceerd wordt, komt daaruit:

```
src/ + regels/  --bouw-pagina.mjs-->  dist/app.html  --bouw-site.mjs-->  docs/index.html
                                      (de Artifact)                      (GitHub Pages)
```

`dist/app.html` is de tool als één bestand, met parser, regels, regeldata en drie echte adviezen
erin gevouwen — nodig omdat de Artifact-omgeving geen externe verzoeken mag doen. `bouw-site.mjs`
zet daar alleen een compleet html-document omheen, met `config.js` en `toegang.js` ervoor.

Beide zijn gegenereerd. Wijzig ze nooit met de hand: een aanpassing hoort in `src/` of `regels/`,
daarna opnieuw bouwen. De tests en de bulkslag draaien tegen `dist/app.html`, zodat ze meten wat
een redacteur werkelijk in de tool ziet.

Tot september 2026 stond hier een tweede, losse variant (`reisadvies-reviewer.html`) die als enige
de sjabloonregels had. Die is samengevoegd en vervallen; de SJ-regels zitten nu in `regels/sjabloon.json`
en `src/regels.js`. Over alle 226 adviezen geeft de gebouwde pagina exact dezelfde bevindingen als
de losse variant daarvoor.

## Toegang (de Pages-versie)

`docs/` is de versie die op GitHub Pages draait, gebouwd uit `dist/app.html`
met `node scripts/bouw-site.mjs`. De bronpagina wordt daarbij niet aangepast.

Wat wel en niet is afgeschermd:

- **Niet afgeschermd:** `docs/index.html`, de regelset die erin gevouwen zit, en alles
  in deze repo. Die zijn publiek. Een inlogscherm verandert daar niets aan.
- **Wel afgeschermd:** de oordelen, in Supabase achter row level security. De pagina
  stuurt een verzoek, de database beslist. Een rechtstreeks verzoek aan de REST-API
  buiten de pagina om loopt tegen dezelfde policies aan.

`docs/config.js` bevat alleen de projecturl en de publishable key. Die twee zijn publiek
bedoeld. De secret key, de service-role key en het databasewachtwoord horen hier niet,
en staan er ook niet in.

De toegangsregels staan in `supabase/migrations/`. Toevoegen aan de allowlist gebeurt met
de hand in de database; de tabel heeft bewust geen insert-policy, dus niemand kan zichzelf
toegang geven.


## Gebruik

```bash
node --test                      # de regels testen (tests/)
node test/toets.cjs               # samenvatting per voorbeeldadvies
node test/toets-sjabloon.cjs      # welke sjabloonregels vuren, en waarom
node test/toets-dekking.cjs       # dekking van de vaste teksten
node --test test/toets-markering.cjs test/toets-in-het-kort.cjs test/toets-ernst.cjs
                                 # markering, de regels van In het kort, en de ernstindeling
node scripts/fetch-corpus.mjs    # reisadviezen ophalen (zie hieronder)
node scripts/bulk.mjs            # alle adviezen toetsen -> data/bulkrapport.md
node scripts/bouw-pagina.mjs     # vouwt regels, parser en 3 echte adviezen in dist/app.html
node scripts/bouw-adviezen.mjs   # zet alle 226 adviezen klaar in docs/adviezen/
node scripts/haal-woordenlijst.mjs  # haalt de OpenTaal-woordenlijst op voor de spellingtoets
node scripts/fetch-posten.mjs       # haalt de ambassades en consulaten op (alleen op een runner)
node scripts/bouw-postplaatsen.mjs  # leest daar de standplaatsen uit
node scripts/bouw-koppenlijst.mjs   # telt welke h4-koppen in gebruik zijn
node scripts/bouw-site.mjs       # bouwt docs/index.html uit dist/app.html
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
| `regels/*.json` | de regelset als data: matrix, kleurcode-teksten, sjabloon, woordenlijsten, limieten, landen |
| `regels/groepen.json` | de filterindeling: welke regel hoort bij welk vinkje boven de bevindingen |
| `regels/postplaatsen.json` | de standplaatsen van de posten, uit de open data; voor de schrijfwijzetoets |
| `regels/koppen-in-gebruik.json` | welke h4-tussenkoppen de adviezen gebruiken en hoe vaak; afgeleid uit het corpus, geen norm |
| `regels/tekstcontrole.json` | resten van het CMS, vergeten spaties en onzichtbare tekens — overgenomen uit SpellingSpeurneus |
| `regels/uitzonderingen.txt` | goedgekeurde woorden die niet in de OpenTaal-woordenlijst staan; deze lijst hoort bij de redactie |
| `docs/woordenlijst.txt.gz` | de OpenTaal-woordenlijst, ingepakt. Ophalen met `scripts/haal-woordenlijst.mjs` |
| `data/opentaal.sha256` | de versie van de woordenlijst waarop deze tool zich baseert |
| `regels/HERKOMST.md` | per regel-id de vindplaats in de schrijfwijzer of de matrix |
| `src/parse.js` | reisadvies naar een genormaliseerd document (koppen, alinea's, zinnen, links) |
| `src/regels.js` | de harde regels, als pure functies |
| `src/adapter.js` | ruwe API-respons naar de velden die de toetser nodig heeft |
| `src/app.html` | de paginasjabloon; `scripts/bouw-pagina.mjs` vouwt de regels erin |
| `dist/app.html` | de gebouwde tool als één bestand — gegenereerd, niet met de hand bijwerken |
| `scripts/fetch-corpus.mjs` | ophalen van de reisadviezen |
| `scripts/bulk.mjs` | alle adviezen toetsen en een rapport schrijven |
| `scripts/vaste-teksten-boven-de-norm.mjs` | welke voorgeschreven zinnen zelf niet binnen de schrijfwijzer passen |
| `scripts/bouw-adviezen.mjs` | het corpus klaarzetten als `docs/adviezen/`, zodat alle landen in de lijst staan |
| `data/corpus/` | 226 opgehaalde reisadviezen als XML |
| `tests/` | per regel een fixture die faalt en een die slaagt |
| `test/` | toetsloops over de voorbeeldadviezen en de sjabloonregels |
| `datastromen.html` | overzicht van de datastromen en de opslagkeuzes |
| `docs/` | de Pages-versie: index.html, config.js, toegang.js en `adviezen/` met alle 226 reisadviezen |
| `supabase/migrations/` | de toegangsregels: allowlist, oordelen, RLS-policies |

`src/parse.js` en `src/regels.js` hebben geen dependencies en geen buildstap, zodat dezelfde
code in Node draait (tests, bulkslag) en in de browser (de deelbare prototypepagina).

## Wat de bulkslag oplevert

Over 226 live reisadviezen (`data/bulkrapport.md`, gedraaid met dezelfde regelset als de
gepubliceerde pagina): 46 zitten boven de woordenlimiet, 96 hebben geen enkele rode fout, en
44 adviezen bevatten een onderwerp dat de matrix als *niet melden* aanmerkt — als tussenkop of in
de lopende tekst. Een flink deel van de overige bevindingen komt uit de standaardtekst: acht zinnen die in
ruim 200 adviezen woordelijk hetzelfde staan. Die zijn met één aanpassing tegelijk opgelost, en
het rapport zet ze daarom apart.

Let op bij het vergelijken met een ouder rapport. Twee dingen verschoven zonder dat er één advies
veranderde:

- Te lange zinnen tellen sinds de kleurindeling hierboven niet meer als *fout* maar als *let op*
  of *lange zin met link*. Het aantal "harde fouten" daalde daardoor scherp.
- Sinds 18 september 2026 vervielen 76 onterechte meldingen (65 over de eerste kleurbullet, 11 over
  de komma in "Paspoort, rijbewijs") en kwamen er 56 bij uit drie regels die er nog niet waren:
  afwijkende tussenkoppen, rubrieken die alleen bij uitzondering horen, en vervolgbullets over de
  kleurcode. Het totaal ging van 3812 naar 3792, maar de samenstelling is wezenlijk anders.
- Daarna kwam het onderscheid tussen één en meerdere kleurcodes erbij (60 bevindingen), en leerde de
  parser h4-koppen kennen. Het aantal adviezen zonder harde fout daalde van 119 naar 99; niet omdat
  er iets verslechterde, maar omdat de tool nu ziet of de juiste variant van de vaste kleurtekst is
  gebruikt.
- Ten slotte werden de vaste formuleringen uit het sjabloon vrijgesteld van de schrijfregels, zoals
  ze dat als vaste tekst al waren. Dat scheelde 1085 meldingen (3845 → 2760): zinnen en linkteksten
  die te lang zijn omdat het sjabloon ze zo voorschrijft. Twee linkteksten alleen al waren goed voor
  429 meldingen.
- Op 18 september 2026 kwamen daar de tussenkoppen op h4-niveau bij, werd twijfeltaal in twee
  filters gesplitst en gaat de tool nu ook af op niet-melden-onderwerpen in de lopende tekst. Het
  totaal staat op **2833** bevindingen. Drie meetronden waren nodig voordat die regels klopten:
  woordgrenzen (*beren* zit in *proberen*), de rubriek die de matrix zelf aanwijst (*Foto's maken*
  mag bij lokale wetten, 65 meldingen minder) en samenstellingen (*zandstormen* benoemt wel een
  risico).
- `link-plakt-aan-woord` vindt links die aan het woord ervoor vastplakken. Aruba heeft
  `K<a>ijk op de website…</a>`: op de pagina lees je "Kijk", maar alleen "ijk" is klikbaar. 5
  meldingen, alle vijf terecht. Tegelijk werd de vrijstelling voor vaste linkteksten verbreed: die
  gold niet voor de vaste zin met een lange landnaam erin. Nu mag `{land}` zijn ingevuld met de
  landnaam, met of zonder lidwoord — maar ook niet meer dan dat: voegt een redacteur iets toe, dan
  hoort dat gemeld te worden, want een woord te veel is soms jüist de fout.
- Vier controles erbij die op hetzelfde criterium zijn gekozen — het antwoord staat vast, dus de
  tool kan niet gokken: een dubbel woord (*Het het departement*), een spatie voor een leesteken
  (*Algemeen alarmnummer : 101*), de standplaats van een post (*Bogota* → *Bogotá*) en een vaste
  tekst waarin de landnaam niet is ingevuld. Die laatste dichtte een gat: Denemarken en Ierland
  hebben allebei *"Heeft u direct hulp nodig in ?"* staan, en daar zweeg de tool over. Samen 19
  meldingen, alle negentien terecht.
- `nederlands-verbuiging` kijkt of *Nederlands* of *Nederlandse* goed staat voor de vaste termen
  voor een post. Geen grammaticacontrole, maar een gesloten verzameling van vijf woorden waarvan het
  geslacht vaststaat — daarvoor klopt de regel altijd, en daarbuiten zwijgt hij. Over 226 adviezen:
  1478 keer komt die combinatie voor, 6 keer staat het fout.
- Uit [SpellingSpeurneus](https://github.com/NWW-team/SpellingSpeurneus), het spellingtooltje van
  de redactie, zijn de drie controles overgenomen die geen woordenlijst nodig hebben: resten van
  het CMS, een vergeten spatie na een punt, en tekens zonder breedte. Samen 17 meldingen over 226
  adviezen, alle zeventien terecht — Estland had letterlijk het woord *undefined* op de pagina
  staan.
- Daarna is ook de **spellingtoets** zelf overgenomen. Die staat uit tot je hem aanzet: de
  OpenTaal-woordenlijst is 409.487 woorden en wordt pas dan opgehaald (1,3 MB). Over 226 adviezen
  geeft hij 146 mogelijke spelfouten — met daarin achttien echte tikfouten die nu live staan,
  zoals *Registeer*, *doodstaf*, *riscio*, *prvincie* en *veiligsheidsrisico's* — en 1974 namen,
  die in een eigen filter staan omdat de woordenlijst geen plaatsnamen kent. Het totaal met de
  toets aan is **3037**; zonder blijft het 2891.
- Namen worden wél herkend maar niet gemeld. Dat waren 1974 meldingen tegen 146 mogelijke
  spelfouten: in 226 adviezen staan zoveel plaatsnamen, instituten en buitenlandse bronnen dat er
  geen woordenlijst voor is aan te leggen, en ze staan vrijwel altijd goed. Eén groep namen kent de
  tool wél: de landen zelf, uit de landenlijst van de open data. `landnaam-schrijfwijze` vond zo dat
  op het Tsjechië-advies *"Bent u in Tsjechie en bent u in nood?"* staat, zonder trema.

## Vals alarm in de spellingtoets wegwerken

Meldt de tool een woord dat gewoon goed is? Dat hoort in
[`regels/uitzonderingen.txt`](regels/uitzonderingen.txt). Die lijst hoort bij de webredactie, niet
bij de techniek: hij groeit met het gebruik.

De weg ernaartoe: zet de spellingtoets aan, en klik op **Kopieer deze N woorden als uitzondering**.
Die knop staat naast de spellingknop zodra er onbekende woorden zijn, en zet ze als lijst op het
klembord. Plak ze onderaan in `uitzonderingen.txt`, één woord per regel. Hoofdletters doen er niet
toe — de toets vergelijkt op kleine letters.

Dit staat los van de knoppen *Eens / Oneens / Onterecht* onder een bevinding. Die leggen een oordeel
vast over dít advies; de uitzonderingenlijst verandert de regel voor alle adviezen tegelijk.

## De volgorde van de rubrieken

Het sjabloon zet de rubrieken onder veiligheidsrisico's *"in volgorde van relevantie"*, en dat woord
doet er toe: de volgorde mág schuiven als een risico in dit land zwaarder weegt. Daarom drie lagen
in plaats van één vaste rij:

| laag | rubrieken | wat de tool doet |
|---|---|---|
| **bovenaan** | Actueel, Regionale risico's | **fout** als het anders is (0 meldingen: dit gaat altijd goed) |
| **vast** | Terrorisme, Oorlog en conflict, Criminaliteit, Wetten en gebruiken, Natuurgeweld | *ter overweging* bij een andere volgorde (22) |
| **vrij** | Demonstraties, Landmijnen, Verkeersongevallen, Willekeurige arrestaties | onderling niets; wel onder *Wetten en gebruiken* (23) |

Demonstraties mág boven Natuurgeweld staan: die sluit aan op Wetten en gebruiken, terwijl
Natuurgeweld meer op zichzelf staat. De lagen staan in `regels/sjabloon.json`, dus verschuiven is
data en geen code.

## Tussenkoppen: eenduidig, niet uniform

Onder *In geval van nood* en *Bagageregels* schrijft het sjabloon de tussenkoppen voor, maar niet
elk land heeft dezelfde informatie. *Achtergelaten of gedwongen te trouwen* hoort bij Somalië en
nergens anders — een eigen kop is daar geen fout.

Wat wél misgaat is hetzelfde onderwerp in het ene land anders noemen dan in het andere. `h4-kop-variant`
meldt daarom alleen een kop waarvan elders een andere formulering rondgaat die duidelijk de huisstijl
is: genoeg woordoverlap én in minstens 20 adviezen. Over het corpus geeft dat 13 meldingen, waaronder
vijf verschillende namen voor één ding:

> *Contactgegevens Nederlandse ambassade*, *Contactgegevens ambassade*, *Contactgegevens in geval van
> nood*, *Contactgegevens ambassade in geval van nood*, *Contactgegevens Nederlandse vertegenwoordiging
> in geval van nood* — tegen *Contactgegevens Nederlandse ambassade in geval van nood* in 208 adviezen.

De lijst met koppen die in gebruik zijn staat in `regels/koppen-in-gebruik.json`, gemaakt met
`scripts/bouw-koppenlijst.mjs` uit het corpus. Na een nieuwe ophaalronde opnieuw draaien.

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
