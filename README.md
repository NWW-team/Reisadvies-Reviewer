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

Elke bevinding draagt zijn bron mee: **SW** = schrijfwijzer, **MX** = format-matrix,
**SJ** = sjabloon. `regels/HERKOMST.md` legt per regel-id de vindplaats vast — een bevinding
zonder bron hoort de tool niet te geven, en een test bewaakt dat.

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
| `regels/HERKOMST.md` | per regel-id de vindplaats in de schrijfwijzer of de matrix |
| `src/parse.js` | reisadvies naar een genormaliseerd document (koppen, alinea's, zinnen, links) |
| `src/regels.js` | de harde regels, als pure functies |
| `src/adapter.js` | ruwe API-respons naar de velden die de toetser nodig heeft |
| `src/app.html` | de paginasjabloon; `scripts/bouw-pagina.mjs` vouwt de regels erin |
| `dist/app.html` | de gebouwde tool als één bestand — gegenereerd, niet met de hand bijwerken |
| `scripts/fetch-corpus.mjs` | ophalen van de reisadviezen |
| `scripts/bulk.mjs` | alle adviezen toetsen en een rapport schrijven |
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
gepubliceerde pagina): 46 zitten boven de woordenlimiet, 119 hebben geen enkele rode fout, en
25 adviezen bevatten een onderwerp dat de matrix als *niet melden* aanmerkt. Een flink deel van de overige bevindingen komt uit de standaardtekst: acht zinnen die in
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
