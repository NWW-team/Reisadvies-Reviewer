/**
 * De harde regels (laag 1) uit de schrijfwijzer, de format-matrix en het sjabloon.
 *
 * Elke regel is een pure functie: document in, bevindingen uit. Geen model, geen netwerk,
 * volledig reproduceerbaar. De regeldata komt van buiten (regels/*.json) zodat dezelfde
 * code in Node draait voor de tests en de bulkslag, en in de Artifact voor de redacteur.
 *
 * Bronafkortingen in een bevinding: SW = schrijfwijzer, MX = format-matrix, SJ = sjabloon.
 *
 * Wat de tool bewust NIET doet, conform STRATEGY.md:
 *  - geen uitspraak over politieke gevoeligheden
 *  - niet zelf inkorten: wel de overschrijding melden en de langste blokken aanwijzen
 */

import { telWoorden, splitsZinnen } from './parse.js';

/**
 * De ernst van een bevinding bepaalt de kleur en de volgorde in het paneel, en is een soort
 * fout, niet een rangorde van erg naar minder erg:
 *
 *   fout     rood         het mag echt niet: een onderwerp dat er niet hoort, of een vaste
 *                         formulering die niet is aangehouden
 *   let-op   geel/oranje  te lang of te passief geschreven: zinnen, linkteksten, lijdende vorm
 *   link-zin lichtblauw   te lange zin waarin een link staat — vaak los te maken door de
 *                         linktekst in te korten, dus een ander gesprek dan een lange lopende zin
 *   info     grijs        de rest: notatieregels en signalen om over na te denken
 *   twijfel  roze         twijfeltaal — onderaan, want het is bijna altijd een stapel losse
 *                         woorden ("vaak", "misschien") die je in één ronde wegwerkt
 */
const ERNST = { fout: 'fout', letop: 'let-op', linkzin: 'link-zin', twijfel: 'twijfel', info: 'info' };

/** De volgorde waarin bevindingen worden getoond en geteld. */
const ERNST_VOLGORDE = [ERNST.fout, ERNST.letop, ERNST.linkzin, ERNST.info, ERNST.twijfel];

/** Normaliseert voor tekstvergelijking: kleine letters, rechte apostrof, enkele spaties. */
export function norm(s) {
  return (s || '')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Haalt apostroffen weg die onderdeel van een woord zijn (Bahama's, 's avonds). */
const zonderApostrof = (s) => s.replace(/[\u2019']/g, (m, i, str) =>
      (/\w/.test(str[i - 1] || '') && /\w/.test(str[i + 1] || '')) || /^s\b/.test(str.slice(i + 1)) ? '' : m);


/**
 * Het patroon voor {land}: hoe een advies zijn eigen land in een vaste zin mag noemen.
 *
 * Het cms-veld draagt de administratieve naam, de tekst gebruikt de leesbare. Drie verschillen zijn
 * administratie of grammatica en geen keuze van de redacteur, en die staan we toe:
 *
 *   het lidwoord   "voor de Bahama's", "voor de Seychellen", "voor het VK"
 *   de haakjes     "Eswatini (Swaziland)" in het cms, "Eswatini" in de tekst
 *   de komma       "Congo, de Republiek" in het cms, "de Republiek Congo" in de tekst
 *
 * Die komma is een sorteerkunstje van de landenlijst: het land staat onder de C. Draai de twee
 * delen om en je hebt de naam zoals een mens hem schrijft. Het raakt twee landen, allebei Congo.
 *
 * Daarnaast de vier afkortingen die de adviezen echt gebruiken, uit het veld `kort` in
 * regels/landen.json: VK, VS, VAE en DRC. Dat is een gesloten lijst, geen jokerteken.
 *
 * Verder niets. Wijkt de naam zelf af, dan is dat een keuze van iemand en die hoort gemeld te
 * worden -- al is de melding dan wel een andere; zie landnaamAfwijking hieronder.
 */
function landPatroon(land, kort) {
  const kaal = norm(land).replace(/\s*\([^)]*\)\s*$/, '').trim();
  const komma = kaal.match(/^([^,]+),\s*(.+)$/);
  const omgedraaid = komma ? komma[2] + ' ' + komma[1] : '';
  const afk = (kort || []).map(norm);
  const vormen = [...new Set([norm(land), kaal, omgedraaid, ...afk].filter(Boolean))].map(esc);
  return '(?:de |het )?(?:' + vormen.join('|') + ')';
}

/**
 * Het gebiedendeel opent vaak een opsomming: "Kleurcode rood geldt voor:" met de gebieden eronder
 * als bullets. Die dubbele punt is leesteken, geen andere formulering, dus we laten hem toe.
 */
const gebiedenPatroon = (body) => ':? ' + body;

/**
 * Hoeveel tekens mag een gebiedenopsomming zijn? Geteld over 230 opsommingen in het corpus: de
 * langste is die van Irak met 211 tekens, daarna Armenië met 155 en Jordanië met 151. Op 120
 * tekens -- de oude grens -- viel Jordanië buiten de boot en kreeg een melding voor een zin die
 * gewoon klopt. 220 haalt ze allemaal binnen.
 *
 * Dit jokerteken is iets anders dan dat voor {land}. Daar zou het een verkeerde landnaam
 * verbergen, en daarom staat daar een gesloten lijst. Hier zijn de gebieden per definitie vrije
 * tekst: de matrix schrijft ze als "gebieden X en Y". Het patroon kan toch geen punt passeren,
 * dus het blijft binnen één zin.
 */
const GEBIEDEN_MAX = 220;

/**
 * Woorden waaraan je ziet dat een stuk tekst een gebied aanduidt en geen land: een windrichting,
 * of een zelfstandig naamwoord dat een gebied benoemt.
 *
 * Japan schrijft "De kleurcode van het reisadvies voor het zuidoosten van Fukushima is rood". Dat
 * is de landvorm van de zin met een gebied erin, en Martijn rekent dat goed. Nauru schrijft
 * "voor Naoero" -- een kale naam die niet die van het land is -- en dat blijft wel een melding.
 * Dit is het verschil tussen die twee.
 */
const GEBIEDWOORD_BRON = '\\b(?:noord|zuid|oost|west)(?:en|elijk\\w*)?\\b'
  + '|\\b(?:noord|zuid)(?:oost|west)(?:en|elijk\\w*)?\\b'
  + "|\\b(?:gebied|gebieden|grensgebied|grensgebieden|grensstrook|strook|regio|regio'?s|provincie"
  + '|provincies|deelstaat|deelstaten|staat|staten|stad|steden|eiland|eilanden|district|districten'
  + '|departement|departementen|gouvernement|gouvernementen|kust|vallei|delta|meer|schiereiland'
  + '|hooglanden|driehoek|wijk|wijken|vulkaan|rest|deel|delen|omgeving)\\b';
const GEBIEDWOORD = new RegExp(GEBIEDWOORD_BRON, 'i');

/**
 * Het patroon voor {gebied}: vrije tekst die ergens een gebiedwoord moet bevatten. Daarmee is
 * "het zuidoosten van Fukushima" een gebied en "Naoero" niet, en kan de landvorm van de zin met
 * een gebied erin worden toegestaan zonder dat een verkeerde landnaam meelift.
 */
const gebiedPatroon = () => "[^.?!]{0,60}?(?:" + GEBIEDWOORD_BRON + ")[^.?!]{0,120}?";

/**
 * De vormen waarin een kleurbullet zijn gebieden noemt. Alleen deze vier; de rest van de zin doet
 * er voor het tellen niet toe.
 */
const GEBIEDSVORMEN = [
  /kleurcode van het reisadvies is (?:rood|oranje|geel|groen) voor (.+)/i,
  /kleurcode van het reisadvies voor (?:de gebieden )?(.+) is (?:rood|oranje|geel|groen)/i,
  /^voor (.+?) geldt (?:grotendeels )?kleurcode (?:rood|oranje|geel|groen)/i,
  /^kleurcode (?:rood|oranje|geel|groen) geldt voor (.+)/i,
];

/**
 * Hoeveel gebieden noemt deze opsomming?
 *
 * Niet door op komma's en "en" te splitsen: dat telt namen en geen gebieden. Er tellen alleen
 * delen mee die zélf een gebied benoemen -- "de provincie Mafraq", "het grensgebied met India".
 * Namen die achter zo'n deel hangen tellen niet apart; die horen bij het gebied dat er al staat.
 *
 * Dat vangt twee dingen tegelijk:
 *
 *   Benin schrijft "de noordelijke regio's van Benin die grenzen aan Togo, Burkina Faso, Niger en
 *   Nigeria". Dat is één gebied met vier buurlanden als oriëntatiepunt, geen vijf gebieden.
 *
 *   Tsjaad schrijft "de regio's Kanem, Ouaddai, Tibesti, Borkou en Ennedi". Dat is één opsomming
 *   achter één kopwoord, en Martijn rekent die op 19 september 2026 acceptabel.
 *
 * Wat wél oploopt is "de provincie A, de provincie B, de stad C, het eiland D, de regio E en het
 * district F": zes keer een eigen kopwoord, zes gebieden. Dat is het geval uit de matrixregel --
 * niet gebied 1, 2, 3, 4, 5, 6.
 *
 * Windrichtingen tellen met opzet niet als apart gebied: "het noorden en oosten" is juist de vorm
 * die de matrix aanraadt boven een opsomming, dus die mag hier niet tegen een advies werken.
 *
 * De telling is met opzet voorzichtig: bij twijfel telt hij laag. Liever een opsomming van zes
 * missen dan er een van vier melden.
 */
const EIGEN_GEBIED = new RegExp("\\b(?:gebied|gebieden|grensgebied|grensgebieden|grensstrook|strook|regio|regio'?s"
  + '|provincie|provincies|deelstaat|deelstaten|stad|steden|eiland|eilanden|district|districten'
  + '|departement|departementen|gouvernement|gouvernementen|kust|vallei|delta|schiereiland'
  + '|hooglanden|driehoek|wijk|wijken|deel|delen)\\b', 'i');

function telGebieden(ruw) {
  const delen = ruw.replace(/\u2019/g, "'").split(/,\s*|\s+en\s+/).map((x) => x.trim()).filter(Boolean);
  const n = delen.filter((deel) => EIGEN_GEBIED.test(deel)).length;
  return Math.max(n, 1);
}

/**
 * Zoekt de landnaam zoals een advies hem zelf schrijft: hetzelfde sjabloon, maar met een vangnet
 * op de plek van {land}. Slaat dit wel aan waar sjabloonRegex faalde, dan staat de vaste zin er
 * gewoon en zit het verschil alleen in de naam. Dat is een andere melding dan een zin die niet
 * klopt, en de redacteur heeft er ook iets anders aan.
 *
 * Alleen de vormen met {land} doen mee: een sjabloon met {gebieden} noemt geen land.
 */
function landnaamAfwijking(sjablonen, tekst) {
  for (const sj of sjablonen) {
    if (!sj.includes('{land}') || sj.includes('{gebieden}') || sj.includes('{gebied}')) continue;
    let p = esc(norm(sj));
    p = p.replace(/\\\{land\\\}/g, "((?:de |het )?[a-z\\u00c0-\\u017f'. -]{2,40}?)");
    const m = tekst.match(new RegExp(p));
    if (m) return m[1].trim();
  }
  return null;
}

/** Maakt van een sjabloon met {land}/{gebieden} een regex die tegen genormaliseerde tekst matcht. */
function sjabloonRegex(sjabloon, land, kort) {
  let p = esc(norm(sjabloon));
  p = p.replace(/\\\{land\\\}/g, land ? landPatroon(land, kort) : "[a-z\\u00c0-\\u017f' -]{2,40}");
  p = p.replace(/\\\{gebied\\\}/g, gebiedPatroon());
  p = p.replace(/ \\\{gebieden\\\}/g, gebiedenPatroon('[^.]{2,' + GEBIEDEN_MAX + '}'));
  p = p.replace(/\\\{gebieden\\\}/g, "[^.]{2," + GEBIEDEN_MAX + "}");
  return new RegExp(p);
}

/**
 * Als sjabloonRegex, maar zonder ankers: toetst of een vaste tekst érgens in een stuk tekst
 * voorkomt. Kent naast {land} en {gebieden} ook {kleur}, want het sjabloon gebruikt die.
 */
function vasteTekstRegex(sjabloon, land, kort) {
  let p = esc(norm(sjabloon));
  p = p.replace(/\\\{land\\\}/g, land ? landPatroon(land, kort) : "[^.?!]{2,45}");
  p = p.replace(/\\\{kleur\\\}/g, '(?:rood|oranje|geel|groen)');
  p = p.replace(/\\\{gebied\\\}/g, gebiedPatroon());
  p = p.replace(/ \\\{gebieden\\\}/g, gebiedenPatroon('[^.?!]{2,' + GEBIEDEN_MAX + '}'));
  p = p.replace(/\\\{gebieden\\\}/g, '[^.?!]{2,' + GEBIEDEN_MAX + '}');
  return new RegExp(p);
}

/**
 * De tekst van een rubriek: de kop plus alles wat eronder staat. Een rubriek is soms een H3
 * ("Reisverzekering") en soms een hele H2-sectie ("Wat kan ik doen in een noodsituatie?"),
 * daarom kijken we naar allebei.
 *
 * Een rubriek loopt door tot en met haar h4-subkopjes: "Bagageregels" bevat "Wat mag ik meenemen
 * naar {land}?". Daarom kijken we ook naar h3 — anders valt alles onder een h4 buiten de rubriek en
 * lijkt elke vaste tekst te ontbreken.
 *
 * @returns {string|null} null als de rubriek niet in dit advies staat — dan toetsen we niet.
 */
function rubriekTekst(doc, patroon) {
  const re = new RegExp(patroon, 'i');
  const blokken = doc.blokken.filter((x) => re.test(x.kop || '') || re.test(x.h2 || '') || re.test(x.h3 || ''));
  if (!blokken.length) return null;
  return blokken
    .flatMap((x) => [x.kop || '', ...x.alineas.map((a) => a.tekst), ...x.opsommingen.flatMap((o) => o.items)])
    .join(' ');
}

/**
 * De losse eenheden van een rubriek zoals de pagina ze toont: per alinea de zinnen, en de
 * items van een opsomming. rubriekTekst plakt ze aaneen om op te toetsen; deze lijst dient om
 * de plek van een treffer terug te vinden, zodat een bevinding de zin kan aanwijzen die de
 * markering in het advies nodig heeft. Zonder patroon: het hele advies.
 */
function rubriekEenheden(doc, patroon) {
  const re = patroon ? new RegExp(patroon, 'i') : null;
  const blokken = re
    ? doc.blokken.filter((x) => re.test(x.kop || '') || re.test(x.h2 || '') || re.test(x.h3 || ''))
    : doc.blokken;
  return blokken.flatMap((x) => [
    ...x.alineas.flatMap((a) => a.zinnen),
    ...x.opsommingen.flatMap((o) => o.items),
  ]);
}

/**
 * De handelingsinstructie van een vaste kleurtekst: alles ná de openingszin. De openingszin noemt
 * het land of het gebied en wisselt dus per advies; de instructie erachter ligt vast.
 *
 * Het slotpunt van de laatste zin telt niet mee. rubriekTekst plakt blokken aan elkaar met een
 * enkele spatie, punt of geen punt maakt dan geen verschil voor de vergelijking -- en mist het
 * origineel dat laatste punt (Mozambique, Angola: "... in de problemen komt" zonder punt), dan
 * moet dat als "los te winnen puntje" gemeld worden, niet als "wijkt af van de vaste tekst". Dat
 * laatste doet de tool niet; dat is aan de redactie om alsnog te herstellen.
 */
function instructieVan(vasteTekst) {
  const zinnen = norm(vasteTekst || '').split(/(?<=\.)\s+/);
  return zinnen.slice(1).join(' ').replace(/\{land\}|\{gebieden\}/g, '').trim().replace(/\.$/, '');
}

/**
 * Het verschil tussen twee vaste instructies, als dat een kwestie van losse woorden is.
 *
 * Bij geel en groen scheelt de volledige variant maar een woord van de verkorte -- "erheen" tegen
 * "hierheen" -- en dan is "de volledige uitleg staat er" een raadsel voor wie het moet herstellen.
 * Staan er evenveel woorden en verschillen er hoogstens twee, dan noemen we ze. Loopt het verder
 * uiteen (rood, waar de hele zin anders loopt), dan geeft dit niets terug en blijft de melding
 * zoals hij was.
 */
function woordverschil(er, hoort) {
  const a = (er || '').split(' ');
  const c = (hoort || '').split(' ');
  if (a.length !== c.length) return null;
  const anders = a.map((w, i) => [w, c[i]]).filter(([x, y]) => x !== y);
  return anders.length && anders.length <= 2 ? anders : null;
}

function bevinding(regel, ernst, bron, boodschap, extra = {}) {
  return { regel, ernst, bron, boodschap, ...extra };
}

/**
 * @param {object} data  {matrix, kleurcodes, woordenlijsten, limieten}
 */
export function maakToetser(data) {
  const { matrix, kleurcodes, woordenlijsten: wl, limieten: lim, sjabloon: sj,
    tekstcontrole: tc } = data;

  /**
   * De spellingtoets, overgenomen uit SpellingSpeurneus. Optioneel: `data.woordenlijst` is een Set
   * met kleine letters, of hij ontbreekt. De OpenTaal-lijst is 409.487 woorden en past niet in de
   * pagina zelf, dus die wordt pas opgehaald als een redacteur de toets aanzet. Ontbreekt hij, dan
   * vuren deze twee regels niet en werkt de rest van de tool gewoon.
   */
  // Op gedrag toetsen, niet met instanceof: de gebouwde pagina draait in het testharnas in een
  // eigen realm, en een Set van daar is geen `instanceof Set` van hier.
  const wlijst = data.woordenlijst;
  const spelling = wlijst && typeof wlijst.has === 'function' && wlijst.size ? wlijst : null;

  // De leestekens die niet achter een spatie horen. Een eigen const, niet in de regeldata
  // terugschrijven: die is gedeeld en maakToetser kan meer dan een keer worden aangeroepen.
  const spatieRe = tc && tc.spatie_leesteken
    ? new RegExp('\\s+[' + tc.spatie_leesteken.leestekens.map(esc).join('') + ']', 'g')
    : null;

  /**
   * "Nederlands(e)" gevolgd door een van de vaste termen voor een post. Het woord ervoor wordt
   * meegevangen, want daar hangt de verbuiging aan. Langste zelfstandige naamwoorden eerst, anders
   * wint "consulaat" van "consulaat-generaal".
   */
  const nvRegex = (() => {
    const nv = tc && tc.nederlands_verbuiging;
    if (!nv) return null;
    const namen = [...nv.de_woorden, ...nv.het_woorden, ...nv.meervouden]
      .sort((a, b) => b.length - a.length).map(esc);
    return new RegExp('(\\b[\\p{L}]+\\s+)?\\b(' + esc(nv.bijvoeglijk.zonder_e) + '|'
      + esc(nv.bijvoeglijk.met_e) + ')\\s+(' + namen.join('|') + ')\\b', 'giu');
  })();

  // De tekens zonder breedte uit tekstcontrole.json, als regex. Ze moeten uit een woord voordat
  // het tegen de woordenlijst gaat: onzichtbaar of niet, ze maken er een onbekend woord van.
  const onzichtbaarRe = new RegExp('[' + Object.keys((tc && tc.onzichtbare_tekens.tekens) || {})
    .map((t) => '\\u' + t.charCodeAt(0).toString(16).padStart(4, '0')).join('') + ']', 'g');

  /**
   * Een ruw stuk tekst tot een woord terugbrengen, of tot een lege string als er geen woord in zit.
   *
   * Twee dingen die bij snel lezen misgaan. Een aanhalingsteken aan het eind is een citaatteken en
   * geen apostrof (‘bagsnatching’), maar bij "foto's" hoort hij er wél bij — en daar staat hij niet
   * aan het eind. En een woord dat op een streepje eindigt is een weglating, geen woord:
   * "identiteits- en reisdocumenten".
   */
  const schoonWoord = (ruw) => {
    const kaal = ruw.replace(onzichtbaarRe, '').replace(/’/g, "'");
    if (/^\p{L}+-$/u.test(kaal)) return '';
    return kaal.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}']+$/gu, '').replace(/'$/, '');
  };

  /** Zonder accenten en trema's, voor het vergelijken van een landnaam met hoe hij er staat. */
  const zonderTekens = (x) => x.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();

  /**
   * De landnamen waarvan de tool de schrijfwijze kent, op hun vorm zonder trema's en accenten.
   * Alleen namen die een trema of accent hébben: bij de rest valt niets te vergelijken. Dit is het
   * enige stuk namen waarvan de tool weet hoe het hoort, want het staat in de landenlijst van de
   * open data. Alle andere namen — plaatsen, instituten, buitenlandse bronnen — worden niet
   * beoordeeld; zie HERKOMST.md.
   */
  const landOpKale = new Map();
  for (const l of ((data.landen && data.landen.landen) || [])) {
    if (l.naam && zonderTekens(l.naam) !== l.naam.toLowerCase()) landOpKale.set(zonderTekens(l.naam), l.naam);
  }

  /**
   * De afkortingen die een advies voor zijn eigen land mag gebruiken, op de naam uit het cms-veld.
   * Zie landPatroon: een gesloten lijstje van vier, niet een jokerteken.
   */
  const kortOpLand = new Map();
  for (const l of ((data.landen && data.landen.landen) || [])) {
    if (l.naam && l.kort && l.kort.length) kortOpLand.set(norm(l.naam), l.kort);
  }

  /**
   * Hetzelfde voor de standplaatsen van de posten, uit de open data. Ook hiervan weet de tool hoe
   * het hoort; verder worden namen niet beoordeeld.
   */
  const plaatsOpKale = new Map();
  for (const naam of ((data.postplaatsen && data.postplaatsen.plaatsen) || [])) {
    if (zonderTekens(naam) !== naam.toLowerCase()) plaatsOpKale.set(zonderTekens(naam), naam);
  }

  /** Bekend als het woord in de lijst staat, of als alle delen dat doen. Dat tweede vangt
   *  samenstellingen met een koppelteken of apostrof ('consulaat-generaal', "euro's") die niet
   *  altijd los in de lijst staan. */
  const isBekendWoord = (w) => {
    const k = w.toLowerCase();
    if (spelling.has(k)) return true;
    const zonderS = k.replace(/'s$/, '');
    if (zonderS !== k && spelling.has(zonderS)) return true;
    const delen = k.split(/['-]/).filter(Boolean);
    return delen.length > 1 && delen.every((d) => spelling.has(d));
  };

  const koppenOpNaam = new Map(matrix.koppen.filter((k) => k.h3).map((k) => [norm(k.h3), k]));

  // Lijdende vorm: hulpwerkwoord + voltooid deelwoord in dezelfde zin. Het deelwoord-patroon
  // vangt ook scheidbare werkwoorden ("wordt opgestuurd"); zelfstandige naamwoorden die
  // toevallig op een deelwoord lijken ("gebied", "verkeer") staan op een uitzonderingslijst.
  const hulpRe = new RegExp('\\b(' + wl.lijdende_vorm.hulpwerkwoorden.join('|') + ')\\b', 'iu');
  const deelwoordRe = new RegExp('\\b(' + wl.lijdende_vorm.deelwoord_patroon + ')\\b', 'giu');
  const geenDeelwoord = new Set((wl.lijdende_vorm.geen_deelwoord || []).map((w) => w.toLowerCase()));

  // Ingangen die niet letterlijk in de brondocumenten staan. Een bevinding die daarop
  // steunt krijgt herkomst 'aanvulling', zodat bij de review zichtbaar is dat de regel
  // wel wordt toegepast maar het woord niet geciteerd is.
  const alsSet = (lijst) => new Set((lijst || []).map((x) => String(x).toLowerCase()));
  const extraTwijfel = alsSet(wl.twijfeltaal._aanvullingen);
  const frequentieWoorden = alsSet(wl.twijfeltaal.frequentie);
  const extraGender = alsSet(wl.genderneutraal._aanvullingen);
  const extraAfk = alsSet(wl.afkortingen._aanvullingen);
  const extraEenheid = alsSet(wl.eenheden_voluit._aanvullingen);
  const extraDomein = alsSet(wl.niet_linken_naar._aanvullingen);
  const herkomst = (set, x) => (set.has(String(x).toLowerCase()) ? { herkomst: 'aanvulling' } : {});


  /** @returns {[hulpwerkwoord, deelwoord]|null} — zoekt door tot een echt deelwoord, zodat
   *  "er wordt een gebied afgesloten" niet op "gebied" blijft hangen. */
  function lijdendeVorm(zin) {
    const h = zin.match(hulpRe);
    if (!h) return null;
    const staart = zin.slice(h.index + h[0].length);
    for (const m of staart.matchAll(deelwoordRe)) {
      if (!geenDeelwoord.has(m[0].toLowerCase())) return [h[0], m[0]];
    }
    return null;
  }

  /** Koppen die de matrix letterlijk voorschrijft, inclusief de toegestane varianten. */
  const matrixKoppen = new Set(matrix.koppen.filter((k) => !k.kop_is_variabel).flatMap((k) =>
    [k.h3, ...(k.kop_varianten || [])].filter(Boolean).map(norm)));
  // Het sjabloon schrijft daarnaast tussenkoppen letterlijk voor ("Lokale hulpdiensten",
  // "Wat mag ik meenemen naar {land}?"). Die toetsen we net zomin op woordenaantal of
  // leestekens: de richtlijn is daar het sjabloon zelf.
  /**
   * Sommige koppen zijn een opsomming in plaats van een vaste zin: "Paspoort, visum, rijbewijs"
   * noemt de documenten die voor dít land gelden. Niet elk land kent een visum of een ETA, dus
   * een kop mag elementen overslaan — maar niet van volgorde wisselen en niets anders noemen.
   */
  const elementenKoppen = matrix.koppen.filter((k) => k.kop_elementen);
  function isElementenKop(kop) {
    return elementenKoppen.some((k) => {
      const toegestaan = k.kop_elementen.map(norm);
      const delen = norm(kop).split(',').map((x) => x.trim()).filter(Boolean);
      if (!delen.length) return false;
      let vorige = -1;
      for (const deel of delen) {
        const plek = toegestaan.indexOf(deel);
        if (plek <= vorige) return false;          // onbekend, of niet in de vaste volgorde
        vorige = plek;
      }
      return true;
    });
  }

  /**
   * De bekende kop die het dichtst bij deze afwijkende kop ligt, op gedeelde woorden. Bedoeld om
   * de bevinding bruikbaar te maken ("Conflict" -> "Oorlog en conflict"); vindt de tool niets dat
   * genoeg lijkt, dan noemt de bevinding geen verwachte kop in plaats van een gok.
   */
  /** De inhoudswoorden van een kop; korte woorden zeggen te weinig om op te vergelijken. */
  const kopWoorden = (t) => new Set(norm(t).split(/[^a-z0-9\u00c0-\u017f]+/).filter((w) => w.length > 3));

  function dichtstbijKop(kop) {
    const woorden = kopWoorden;
    const doel = woorden(kop);
    if (!doel.size) return null;
    let beste = null;
    let besteScore = 0;
    for (const k of matrix.koppen) {
      if (!k.h3 || k.kop_is_variabel) continue;
      const kandidaat = woorden(k.h3);
      const gedeeld = [...doel].filter((w) => kandidaat.has(w)).length;
      const score = gedeeld / Math.max(doel.size, kandidaat.size);
      if (score > besteScore) { besteScore = score; beste = k.h3; }
    }
    return besteScore >= 0.5 ? beste : null;
  }

  /**
   * Een vaste kop met een landnaam erin. De naam in de kop wijkt legitiem af van het location-veld:
   * adviezen gebruiken lidwoorden ("de Bahama's", "het VK"), afkortingen ("de VAE") en de
   * schrijfwijzer laat per (ei)land in of op toe. Daarom een jokerteken in plaats van de exacte
   * naam — net als isVasteH2 dat voor de H2-koppen doet.
   */
  const vasteKopPatronen = (sj.vaste_koppen || []).map((s) => esc(norm(s))
    .replace(/\b(in|op|naar) \\\{land\\\}/g, '(?:in|op|naar) .{2,45}')
    .replace(/\\\{land\\\}/g, '.{2,45}'));

  /** De trefwoorden van onderwerpen die de matrix als "niet melden" aanmerkt, plat en genormaliseerd. */
  // Op hele woorden vergelijken, niet op deelstrings: "beren" zit in "proberen" en zou anders
  // een zin over afpersing als een zin over wilde dieren aanmerken.
  const nietMeldenTref = matrix.koppen
    .filter((k) => k.richtlijn === 'niet-melden' && (k.trefwoorden || []).length)
    .flatMap((k) => k.trefwoorden.map((t) => ({
      re: new RegExp('\\b' + esc(norm(t)) + '\\b'), woord: norm(t),
      onderwerp: (k.h3 || '').toLowerCase(), toelichting: k.toelichting,
      magOnder: (k.mag_onder || []).map(norm), alleenAlsKop: !!k.alleen_als_kop })));

  /**
   * De matrix noemt bij sommige niet-melden-onderwerpen zelf de rubriek waar het wél mag staan:
   * foto's maken "kan evt. bij lokale wetten", gezondheidszorg "evt. bij Reisverzekering". Staat
   * het daar, dan is het geen formatfout maar een afweging, en die hoort bij de oordeelstoets.
   * Zonder deze uitzondering ging `h4-niet-melden` in 49 adviezen af op precies de kop die de
   * matrix toestaat.
   */
  const magHierStaan = (tref, rubriek) => (tref.magOnder || [])
    .some((r) => norm(rubriek || '').includes(r));

  /**
   * Zoekt of deze tussenkop elders onder een andere naam rondgaat, en geeft de gangbaarste terug.
   *
   * Op woordoverlap, dezelfde maat die dichtstbijKop gebruikt. Twee voorwaarden, allebei nodig:
   * de andere kop moet genoeg lijken (anders is het een ander onderwerp), en hij moet in genoeg
   * adviezen staan (anders is het geen huisstijl maar toeval — twee landspecifieke koppen lijken
   * ook op elkaar). De drempel staat in sjabloon.json.
   */
  const koppenInGebruik = ((data.koppenInGebruik && data.koppenInGebruik.koppen) || [])
    .map((k) => ({ ...k, w: kopWoorden(k.kop) }));
  const drempel = (sj.h4_toetsen && sj.h4_toetsen.variant_drempel) || 20;

  function gangbareKop(kop) {
    const doel = kopWoorden(kop);
    if (!doel.size) return null;
    let beste = null;
    for (const k of koppenInGebruik) {
      if (k.adviezen < drempel || norm(k.kop) === norm(kop) || !k.w.size) continue;
      const gedeeld = [...doel].filter((w) => k.w.has(w)).length;
      if (gedeeld / Math.max(doel.size, k.w.size) < 0.6) continue;
      if (!beste || k.adviezen > beste.adviezen) beste = k;
    }
    return beste;
  }

  const isVasteKop = (kop) => matrixKoppen.has(norm(kop))
    || isElementenKop(kop)
    || vasteKopPatronen.some((p) => new RegExp('^' + p + '$').test(norm(kop)));

  /** De vaste H2's staan in vraagvorm met de landnaam erin; 'in {land}' mag ook 'op {land}'
   *  zijn, want de schrijfwijzer kent die keuze per (ei)land. */
  // De landnaam in de kop wijkt legitiem af van het location-veld: adviezen gebruiken
  // afkortingen ("de VAE") en lidwoorden ("op de Bahama's"), en de schrijfwijzer laat per
  // (ei)land in of op toe. Daarom een jokerteken in plaats van de exacte naam. Drie plekken
  // hebben dit patroon nodig — isVasteH2, beginMetVasteH2 en de check dat alle vijf er zijn —
  // en het staat daarom hier één keer.
  function h2Patroon(sjabloon) {
    return esc(norm(sjabloon))
      .replace(/\\\?/g, '\\?')
      .replace(/\b(in|naar) \\\{land\\\}/g, '(?:in|op|naar) [^?]{2,45}')
      .replace(/\\\{land\\\}/g, '[^?]{2,45}');
  }

  function isVasteH2(kop, land) {
    const n = norm(kop);
    return matrix.h2_vast.some((sjabloon) => new RegExp('^' + h2Patroon(sjabloon) + '$').test(n));
  }

  /**
   * Begint deze tekst met een van de vaste H2's? Wordt een advies als platte tekst geplakt, dan
   * ziet de parser de koppen niet en wordt "In het kort" plus alles eronder één alinea. Die
   * alinea staat op de plek van het introveld, maar is de intro niet: de intro staat ervóór en
   * heeft een eigen vaste tekst, afhankelijk van de kleurcode. Dit herkent dat geval.
   */
  function beginMetVasteH2(tekst) {
    const n = norm(tekst);
    return matrix.h2_vast.some((sjabloon) => {
      const p = h2Patroon(sjabloon);
      // Geen \b: een vaste kop kan op een vraagteken eindigen, en daarna is er geen
      // woordgrens. Wel eisen dat er geen letter of cijfer op volgt, zodat "in het korter"
      // niet meetelt.
      return new RegExp('^' + p + '(?![a-z0-9])').test(n);
    });
  }

  /** @returns {{bevindingen: Array, samenvatting: object}} */
  return function toets(doc, opties = {}) {
    const b = [];
    const tekst = doc.volledigeTekst || '';
    const genorm = norm(tekst);
    // De afkortingen die dit land in een vaste zin mag dragen ("het VK", "de VAE"); meestal geen.
    const kortLand = kortOpLand.get(norm(doc.land || '')) || [];

    // "In het kort" is geen introductie: daar gelden eigen regels voor. Staat de eerste alinea
    // op de plek van het introveld maar begint hij met een vaste kop, dan hebben we het
    // introveld niet meegekregen en toetsen we er ook niet op.
    const introIsKop = !!doc.intro && beginMetVasteH2(doc.intro);
    const intro = introIsKop ? null : doc.intro;
    const introIsVeld0 = doc.introIsVeld0 && !introIsKop;
    // "kleurcode groen" en "de kleurcode van het reisadvies voor X is groen" tellen allebei;
    // [^.] houdt de match binnen één zin, zodat twee kleuren niet in elkaar overlopen.
    const kleurenInTekst = kleurcodes.volgorde.filter((k) =>
      new RegExp('kleurcode[^.]{0,80}\\b' + k + '\\b').test(genorm));
    // De kleuren uit de lopende tekst zijn niet betrouwbaar genoeg om een regel op te bouwen: een
    // advies kan een ánder land noemen ("de kleurcode van het reisadvies voor Jemen is rood") en
    // dan telt die kleur ten onrechte mee. Het cms-veld is hier de bron; alleen als dat ontbreekt
    // (geplakte tekst) vallen we terug op wat er in de tekst staat.
    const kleurenVanAdvies = (doc.kleurcodes && doc.kleurcodes.length)
      ? kleurcodes.volgorde.filter((k) => doc.kleurcodes.includes(k))
      : kleurenInTekst;
    const aantalKleuren = doc.kleurcodes ? doc.kleurcodes.length : kleurenInTekst.length;
    const meerdereKleuren = aantalKleuren > 1;

    // ---------- document ----------
    const limiet = meerdereKleuren ? lim.document.woorden_meerdere_kleurcodes : lim.document.woorden_1_kleurcode;
    if (doc.woorden >= limiet) {
      // Per rubriek, niet per blok. Een rubriek als "Regionale risico's" bestaat op de pagina uit
      // een H3-kop zonder eigen tekst en daaronder een H4 per kleur ("Rood: niet reizen", "Oranje:
      // alleen noodzakelijke reizen"). Telde de tool per blok, dan stond de rubriek zelf met 0
      // woorden in de lijst en concurreerden de H4's los van elkaar met complete rubrieken als
      // "Reisverzekering" -- appels tegen peren, en de rubriek die je juist wilt zien (vaak de
      // grootste) viel eruit.
      //
      // "Regionale risico's" hoort in dit rijtje thuis. Het grootste deel is weliswaar de vaste
      // kleurtekst, maar de rubriek bevat ook vrije tekst: welke gebieden vallen onder een kleur,
      // en waarom. Dat is precies waar in te korten valt, dus deze rubriek uitsluiten zou verkeerd
      // zijn -- de tool wijst aan waar de meeste woorden zitten, niet wat daarvan vast staat.
      const perRubriek = new Map();
      for (const blok of doc.blokken) {
        const sleutel = blok.h3 || blok.kop;              // de rubriek, of de H2-sectie zelf
        if (!sleutel) continue;                            // tekst zonder een eigen kop (zeldzaam)
        const woorden = blok.alineas.reduce((n, a) => n + a.woorden, 0)
          + blok.opsommingen.reduce((n, o) => n + o.items.reduce((m, i) => m + telWoorden(i), 0), 0);
        perRubriek.set(sleutel, (perRubriek.get(sleutel) || 0) + woorden);
      }
      const langste = [...perRubriek.entries()]
        .map(([kop, woorden]) => ({ kop, woorden }))
        .sort((x, y) => y.woorden - x.woorden)
        .slice(0, 3);
      // Staat Regionale risico's in het rijtje, dan verdient dat een eigen zin: het grootste deel
      // is de vaste kleurtekst, maar de rubriek bevat ook vrije tekst - welke gebieden vallen
      // onder een kleur, en waarom - en juist dáár kan een redacteur wat inkorten.
      const heeftRegionaal = langste.some((x) => new RegExp(sj.rubriek_patronen.regionaal, 'i').test(x.kop));
      b.push(bevinding('doc-woordenaantal', ERNST.fout, 'MX, tab Richtlijn woordenaantal',
        `Het advies telt ${doc.woorden} woorden. De richtlijn is minder dan ${limiet} bij ${meerdereKleuren ? 'meerdere kleurcodes' : '1 kleurcode'}.`,
        { detail: langste.map((x) => `${x.kop} (${x.woorden} woorden)`),
          notitie: 'De tool wijst de langste blokken aan maar schrapt niet zelf: wat weg kan is een inhoudelijke keuze.'
            + (heeftRegionaal ? ' Bij Regionale risico\'s staat naast de vaste kleurtekst ook vrije '
              + 'tekst: welke gebieden onder een kleur vallen, en waarom. Daar zit vaak ruimte.' : '') }));
    }

    // De matrix heeft voor de kleurcodes twee kolommen die niet door elkaar mogen lopen. Kolom
    // "In het kort" legt de bullets bovenaan vast; kolom "Regionale risico's" legt de definitie
    // vast die daar onder een h4-kopje per kleur staat, waarbij het kopje zelf de kleur is
    // ("Geel: let op, er zijn risico's"). Twee verschillende teksten voor twee verschillende
    // plekken. De toetsen hieronder gaan over de eerste kolom en kijken daarom alleen in dat
    // blok; regionaal-kleur-kop en regionaal-kleur-tekst verderop doen de tweede.
    //
    // Dat is niet theoretisch. Marokko schrijft "Vor de rest van Marokko geldt kleurcode geel" --
    // een typefout in de bullet -- maar had verderop wel een goede zin staan, en daar zweeg de
    // tool op. Zo bleven vijf echte fouten onzichtbaar.
    //
    // Heeft een advies geen blok "In het kort" (geplakte tekst), dan valt de toets terug op de
    // hele tekst; anders zou hij helemaal niets meer zeggen.
    const kortTekst = kortBlokTekst(doc);
    const kortGenorm = norm(kortTekst) || genorm;

    // ---------- kleurcodes ----------
    // De matrix laat meerdere manieren toe om de kleur aan te duiden (kolom NB), maar de
    // handelingsinstructie erachter ligt vast. Die twee toetsen we daarom apart.
    //
    // We lopen langs de kleuren van het advies zelf, niet langs de kleuren die ergens in de tekst
    // staan. Oman verwijst naar het rode reisadvies voor Jemen; dat is de kleur van de buurman, en
    // Oman hoort daar geen vaste rode tekst bij te zetten. Ontbreekt het cms-veld (geplakte tekst),
    // dan valt kleurenVanAdvies terug op wat er in de tekst staat en blijft de toets wat hij was.
    for (const kleur of kleurenVanAdvies) {
      const k = kleurcodes.kleuren[kleur];
      if (!k) continue;

      const metKleur = (kleurcodes.aanduiding_sjablonen || []).map((sj) => sj.replace(/\{kleur\}/g, kleur));
      const aangeduid = metKleur.some((sj) => sjabloonRegex(sj, doc.land, kortLand).test(kortGenorm));
      if (!aangeduid) {
        // Staat de vaste zin er wel, maar heet het land er anders? Dan is dát de melding.
        // genorm is kleine letters; voor de melding halen we de naam op zoals hij er echt staat.
        // Staat er een gebied in de landplek ("het zuidoosten van Fukushima"), dan is dat de
        // gebiedsvorm van de zin en geen andere landnaam. Alleen een kale naam telt.
        const gevonden = doc.land ? landnaamAfwijking(metKleur, kortGenorm) : null;
        const kaleNaam = gevonden && !GEBIEDWOORD.test(gevonden) ? gevonden : null;
        const anders = kaleNaam
          && (tekst.match(new RegExp(esc(kaleNaam).replace(/ /g, '\\s+'), 'i')) || [kaleNaam])[0];
        b.push(anders
          ? bevinding('kleur-aanduiding', ERNST.letop, 'MX, tab Kleurcode-teksten, kolom NB',
            `De vaste zin bij kleurcode ${kleur} staat er, maar noemt het land "${anders}". `
            + `In het cms heet dit advies "${doc.land}".`,
            { verwacht: `De kleurcode van het reisadvies voor ${doc.land} is ${kleur}.`,
              notitie: 'Of de tekst of de landenlijst loopt achter. De tool weet niet welke van de '
                + 'twee; hij meldt alleen dat ze niet hetzelfde zeggen.' })
          : bevinding('kleur-aanduiding', ERNST.letop, 'MX, tab Kleurcode-teksten, kolom NB',
            `Kleurcode ${kleur} wordt niet op een van de vaste manieren aangeduid.`,
            { verwacht: `De kleurcode van het reisadvies voor ${doc.land || 'land X'} is ${kleur}.` }));
      }

      const heeftActie = (k.actiezinnen || []).some((z) => kortGenorm.includes(norm(z)));
      if (!heeftActie) {
        b.push(bevinding('kleur-vaste-tekst', ERNST.fout, 'MX, tab Kleurcode-teksten',
          `Bij kleurcode ${kleur} ontbreekt de vaste handelingsinstructie.`,
          { verwacht: k.in_het_kort_volledig.replace('{land}', doc.land || 'land X') }));
        continue;                            // dan is de variant toetsen dubbelop
      }

      // Welke variant hoort hier? Eén kleurcode betekent: het hele land, dus de volledige uitleg.
      // Meerdere kleurcodes betekent: per gebied de verkorte variant, en de volledige uitleg volgt
      // onder Regionale risico's. Zo blijft "In het kort" kort en staat hetzelfde niet twee keer.
      //
      // We vergelijken de handelingsinstructie: alles ná de openingszin. De openingszin zelf is al
      // gedekt door kleur-eerste-bullet-voluit en kleur-vervolg-bullet-kort. Let op dat het
      // verschil niet één woord is: groen en geel zetten "erheen" tegenover "hierheen", rood zet
      // "er niet heen" tegenover "niet hierheen", en bij oranje is de instructie in beide
      // varianten gelijk. Daarom toetsen we de hele instructie en niet dat ene woord.
      if (!kleurenVanAdvies.includes(kleur)) continue;   // kleur van een ánder land
      const hoortVolledig = kleurenVanAdvies.length === 1;
      const verwachteTekst = hoortVolledig ? k.in_het_kort_volledig : k.in_het_kort_deels;
      const andereTekst = hoortVolledig ? k.in_het_kort_deels : k.in_het_kort_volledig;
      if (instructieVan(verwachteTekst) && !kortGenorm.includes(instructieVan(verwachteTekst))) {
        const staatDeAndere = instructieVan(andereTekst) && kortGenorm.includes(instructieVan(andereTekst));
        // Scheelt het maar een woord of twee, noem ze dan: dat is wat er hersteld moet worden.
        const verschil = staatDeAndere
          ? woordverschil(instructieVan(andereTekst), instructieVan(verwachteTekst)) : null;
        const preciezer = verschil
          ? ' ' + verschil.map(([x, y]) => `Er staat "${x}", er hoort "${y}" te staan.`).join(' ') : '';
        // De bullet waar het om gaat, zodat de pagina hem kan markeren en je erheen kunt springen.
        // Zonder dit stond er wel een melding maar werd er niets onderstreept.
        const kleurRe = new RegExp('\\b' + kleur + '\\b');
        const bullet = kortBlokStukken(doc).find((x) => kleurRe.test(norm(x)));
        b.push(bevinding('kleur-variant', ERNST.fout, 'MX, tab Kleurcode-teksten',
          staatDeAndere
            ? (hoortVolledig
                ? `Dit advies heeft één kleurcode, dus bij ${kleur} hoort de volledige uitleg. Nu staat de verkorte variant er.${preciezer}`
                : `Dit advies heeft meerdere kleurcodes, dus bij ${kleur} hoort de verkorte variant. Nu staat de volledige uitleg er.${preciezer}`)
            : `De uitleg bij kleurcode ${kleur} wijkt af van de vaste tekst.`,
          { ...(bullet ? { fragment: bullet } : {}),
            verwacht: verwachteTekst.replace(/\{land\}/g, doc.land || 'land X')
              // Alleen de gebieden zelf: het sjabloon heeft "Voor de gebieden {gebieden}", dus
              // "de gebieden" staat er al. Anders leest de suggestie als "Voor de gebieden de
              // gebieden X en Y".
              .replace(/\{gebieden\}/g, 'X en Y'),
            notitie: hoortVolledig
              ? 'Bij één kleurcode geldt de kleur voor het hele land; dan staat de volledige uitleg in "In het kort".'
              : 'Bij meerdere kleurcodes staat per gebied de verkorte uitleg; de volledige uitleg volgt onder Regionale risico\'s.' }));
      }
    }

    // ---------- hoeveel gebieden noemt een kleurbullet? ----------
    // De matrix: "Maximaal 5 gebieden per kleur noemen, anders een windrichting noemen. Dus niet
    // gebied 1, 2, 3, 4, 5, 6, maar liever gebieden in het noorden en oosten."
    //
    // Alleen in "In het kort". Onder Regionale risico's mag de opsomming juist wel lang zijn:
    // daar staat de uitwerking.
    // Per bullet, niet over de samengevoegde tekst: dan blijft het fragment de bullet zelf.
    for (const bullet of kortBlokStukken(doc)) {
      const stuk = bullet.split(/(?<=\.)\s+/)[0];
      for (const vorm of GEBIEDSVORMEN) {
        const m = stuk.match(vorm);
        if (!m) continue;
        const lijst = m[1].replace(/\.$/, '').trim();
        // "de rest van X" en "het hele land" zijn geen opsomming.
        if (!/^(?:de rest van|het hele)\b/i.test(lijst)) {
          const aantal = telGebieden(lijst);
          if (aantal > lim.gebieden.max_per_kleur) {
            b.push(bevinding('kleur-gebieden-max', ERNST.letop, 'MX, tab Kleurcode-teksten',
              `Deze kleurcode noemt ${aantal} gebieden. De richtlijn is maximaal `
              + `${lim.gebieden.max_per_kleur}; noem er anders een windrichting bij.`,
              { fragment: stuk.trim(),
                notitie: 'Niet gebied 1, 2, 3, 4, 5, 6, maar liever gebieden in het noorden en '
                  + 'oosten. De uitwerking per gebied hoort onder Regionale risico\'s.' }));
          }
        }
        break;
      }
    }

    // ---------- Regionale risico's: de volledige uitleg per kleur ----------
    // Bij meerdere kleurcodes houdt "In het kort" het kort en volgt de volledige uitleg hier, onder
    // een vast kopje per kleur ("Oranje: alleen noodzakelijke reizen"). De kop en de tekst staan in
    // regels/kleurcodes.json. Staat de rubriek er niet, dan toetsen we niet: dat is de zaak van
    // h3-regionaal-alleen-bij-meerdere.
    const regioPatroon = sj.rubriek_patronen && sj.rubriek_patronen.regionaal;
    const regioTekst = regioPatroon ? rubriekTekst(doc, regioPatroon) : null;
    if (regioTekst && kleurenVanAdvies.length > 1) {
      const regioRe = new RegExp(regioPatroon, 'i');
      const regioKoppen = doc.koppen
        .filter((k) => k.niveau === 4 && regioRe.test(k.h3 || ''))
        .map((k) => norm(k.tekst));
      const regioGenorm = norm(regioTekst);
      // De H3-kop "Regionale risico's" zelf, letterlijk zoals dit advies hem schrijft (rechte of
      // gekrulde apostrof) -- de enige plek die met zekerheid bestaat, ook als een kleurkopje
      // eronder ontbreekt. Wijst een melding niets specifiekers aan, dan wijst hij dit aan: beter
      // naar de juiste rubriek springen dan nergens heen.
      const regioSectieKop = doc.koppen.find((k) => k.niveau === 3 && regioRe.test(k.tekst || ''));

      for (const kleur of kleurenVanAdvies) {
        const k = kleurcodes.kleuren[kleur];
        if (!k) continue;

        const heeftKop = k.regionaal_kop && regioKoppen.some((x) => x === norm(k.regionaal_kop));
        if (k.regionaal_kop && !heeftKop) {
          b.push(bevinding('regionaal-kleur-kop', ERNST.letop, 'MX, tab Kleurcode-teksten',
            `Onder "Regionale risico's" ontbreekt het vaste kopje voor kleurcode ${kleur}.`,
            { ...(regioSectieKop ? { fragment: regioSectieKop.tekst } : {}), verwacht: k.regionaal_kop }));
        }

        const instructie = instructieVan(k.regionaal_tekst);
        if (instructie && !regioGenorm.includes(instructie)) {
          // Staat het kleurkopje er wel, dan staat er ook een blok met eigen tekst -- alleen niet
          // de juiste. Dat is een andere melding dan "ontbreekt", en de tool kan de zin aanwijzen
          // die er wél staat. Ontbreekt het kopje ook (heeftKop is dan false), dan is er niets
          // onder deze kleur om aan te wijzen; regionaal-kleur-kop meldt dat al apart.
          const kleurBlok = heeftKop
            ? doc.blokken.find((x) => x.niveau === 4 && regioRe.test(x.h3 || '')
                && norm(x.kop || '') === norm(k.regionaal_kop))
            : null;
          const fragment = kleurBlok
            ? [...kleurBlok.alineas.flatMap((a) => a.zinnen), ...kleurBlok.opsommingen.flatMap((o) => o.items)][0]
            : null;
          b.push(bevinding('regionaal-kleur-tekst', ERNST.fout, 'MX, tab Kleurcode-teksten',
            heeftKop
              ? `Onder "Regionale risico's" wijkt de uitleg bij kleurcode ${kleur} af van de vaste tekst.`
              : `Onder "Regionale risico's" ontbreekt de vaste uitleg bij kleurcode ${kleur}.`,
            { ...(fragment ? { fragment } : (regioSectieKop ? { fragment: regioSectieKop.tekst } : {})),
              verwacht: k.regionaal_tekst,
              notitie: 'Dit is de plek waar de volledige uitleg hoort te staan, omdat "In het kort" '
                + 'bij meerdere kleurcodes alleen de verkorte variant geeft.' }));
        }
      }
    }

    // De volgorde rood-naar-groen geldt voor de opsomming in "In het kort", niet voor elke
    // vermelding van een kleur verderop in het advies.
    if (kortTekst) {
      const posities = kleurcodes.volgorde
        .map((k) => ({ k, i: norm(kortTekst).search(new RegExp('kleurcode[^.]{0,80}\\b' + k + '\\b|\\b' + k + '\\b(?=[^.]{0,40}kleurcode)')) }))
        .filter((x) => x.i >= 0).sort((x, y) => x.i - y.i).map((x) => x.k);
      if (posities.length > 1) {
        const verwacht = kleurcodes.volgorde.filter((k) => posities.includes(k));
        if (posities.join('>') !== verwacht.join('>')) {
          b.push(bevinding('kleur-volgorde', ERNST.fout, 'MX, tab Kleurcode-teksten, kolom NB',
            `In "In het kort" staan de kleurcodes in de volgorde ${posities.join(' > ')}. De volgorde is altijd van rood naar groen: ${verwacht.join(' > ')}.`));
        }
      }
    }

    const kortBlok = doc.blokken.find((x) => norm(x.kop || '') === norm('In het kort'));
    if (kortBlok) {
      const bullets = kortBlok.opsommingen.flatMap((o) => o.items);

      // De 25 woorden uit de matrix horen bij de bullet in "In het kort" die naar Actueel
      // verwijst — de rij zegt "actuele ontwikkeling … met verwijzing naar Actueel" — en niet
      // bij de rubriek Actueel zelf. De uitleg ónder die kop mag langer zijn: daar staat wat er
      // speelt, waar, en wat de reiziger kan doen.
      const actueelBullet = bullets.find((i) => /\bactueel\b/i.test(i));
      if (actueelBullet) {
        const nActueel = telWoorden(actueelBullet);
        if (nActueel > lim.actueel.max_woorden) {
          b.push(bevinding('actueel-max-woorden', ERNST.fout, 'MX, tab Koppen, rij In het kort',
            `De bullet die naar Actueel verwijst telt ${nActueel} woorden. Maximaal ${lim.actueel.max_woorden}.`,
            { fragment: actueelBullet }));
        }
      }

      // De oproep voor de Informatieservice hoort onder de bullets, als laatste onderdeel van
      // "In het kort" ("Daaronder in Let op: Aanmelden Informatieservice"). Of de tekst er staat
      // en klopt toetst een andere regel; deze gaat alleen over de plek. Daarvoor is de
      // documentvolgorde nodig, en die staat in blok.onderdelen.
      const infoRe = /informatieservice/i;
      const infoTekst = (o) => (o.soort === 'alinea' ? o.alinea.tekst : o.opsomming.items.join(' '));
      const infoFragment = (o) => (o.soort === 'alinea'
        ? o.alinea.tekst
        : o.opsomming.items.find((i) => infoRe.test(i)) || o.opsomming.items.join(' '));
      const kortOnderdelen = kortBlok.onderdelen || [];
      const infoPlek = kortOnderdelen.findIndex((o) => infoRe.test(infoTekst(o)));
      if (infoRe.test(genorm) && kortOnderdelen.length && infoPlek !== kortOnderdelen.length - 1) {
        b.push(bevinding('kort-informatieservice-onderaan', ERNST.fout, 'MX, tab Koppen, rij In het kort',
          infoPlek < 0
            ? 'De oproep voor de Informatieservice staat niet in "In het kort". Hij hoort daar onderaan.'
            : 'De oproep voor de Informatieservice staat niet onderaan "In het kort".',
          infoPlek < 0 ? {} : { fragment: infoFragment(kortOnderdelen[infoPlek]) }));
      }
      if (bullets.length > sj.limieten.in_het_kort.max_bullets) {
        b.push(bevinding('kort-max-bullets', ERNST.fout, 'SJ, blok In het kort',
          `"In het kort" heeft ${bullets.length} bullets. Het sjabloon staat er maximaal ${sj.limieten.in_het_kort.max_bullets} toe.`));
      }
      // De eerste bullet over de kleurcode staat voluit, de vervolgbullets verkort. Voor beide
      // posities zijn twee formuleringen geldig; ze staan als patroon in regels/kleurcodes.json,
      // zodat een nieuwe toegestane vorm geen codewijziging is.
      const bv = kleurcodes.bullet_vormen;
      const kleurBullets = bullets.filter((i) => new RegExp(bv._herkennen_als_kleurbullet, 'i').test(i));
      const past = (tekst, patronen) => patronen.some((pat) => new RegExp(pat).test(norm(tekst)));
      if (kleurBullets.length && !past(kleurBullets[0], bv.eerste_voluit)) {
        b.push(bevinding('kleur-eerste-bullet-voluit', ERNST.letop, 'MX, tab Kleurcode-teksten, kolom NB',
          'De eerste bullet over de kleurcode staat niet voluit.',
          { fragment: kleurBullets[0],
            verwacht: `De kleurcode van het reisadvies voor ${doc.land || 'land X'} is … `
              + '(of: De kleurcode van het reisadvies is … voor …)' }));
      }
      // Een vervolgbullet die de volledige vorm herhaalt maakt "In het kort" onnodig lang; het is
      // juist de bedoeling dat alleen de eerste voluit staat.
      for (const vervolg of kleurBullets.slice(1)) {
        if (past(vervolg, bv.vervolg_kort)) continue;
        b.push(bevinding('kleur-vervolg-bullet-kort', ERNST.letop, 'MX, tab Kleurcode-teksten, kolom NB',
          past(vervolg, bv.eerste_voluit)
            ? 'Deze vervolgbullet staat voluit. Alleen de eerste bullet over de kleurcode staat voluit.'
            : 'Deze vervolgbullet over de kleurcode heeft niet de verkorte vaste vorm.',
          { fragment: vervolg, verwacht: 'Voor … geldt kleurcode … (of: Kleurcode … geldt voor …)' }));
      }
      // ---------- verwijzingen vanuit "In het kort" ----------
      // Elke verwijzing heeft dezelfde vorm: "Lees meer onder X". Bij meerdere kleurcodes hoort
      // daar in elk geval "Lees meer onder Regionale risico's" bij, want daar staat de volledige
      // uitleg die "In het kort" juist weglaat.
      const vw = sj.verwijzing;
      if (vw) {
        const kortGenorm = norm([...kortBlok.alineas.map((a) => a.tekst),
          ...kortBlok.opsommingen.flatMap((o) => o.items)].join(' '));
        for (const fout of vw.afwijkende_vormen || []) {
          const plek = kortGenorm.indexOf(norm(fout) + ' ');
          if (plek < 0) continue;
          b.push(bevinding('kort-verwijzing-vorm', ERNST.letop, 'SJ, vaste vorm van de verwijzing',
            `Een verwijzing in "In het kort" begint met "${fout}".`,
            { fragment: contextVan(kortGenorm, plek),
              verwacht: vw.vorm.replace('{rubriek}', 'de rubriek') }));
          break;                                     // één melding per advies is genoeg
        }
        // De verwijzing hoort bij de hoogste kleurcode van het advies, en daar alleen. Staat hij
        // ook onder een lagere kleur, dan wordt "In het kort" een tweede keer naar hetzelfde blok
        // gestuurd. Papoea-Nieuw-Guinea zet hem bij rood en bij oranje; dat is een keer te veel.
        if (vw.alleen_bij_hoogste_kleur && kleurenVanAdvies.length > 1) {
          const hoogste = kleurenVanAdvies[0];
          const doel = norm(vw.patroon + (vw.verplicht_bij_meerdere_kleurcodes || ''));
          for (const bullet of kortBlokStukken(doc)) {
            const g = norm(bullet);
            if (!g.includes(doel)) continue;
            // Welke kleur draagt deze bullet? De eerste die erin voorkomt.
            const kleur = kleurcodes.volgorde.find((k) => new RegExp('\\b' + k + '\\b').test(g));
            if (!kleur || kleur === hoogste) continue;
            b.push(bevinding('kort-verwijzing-hoogste-kleur', ERNST.letop, 'SJ, vaste vorm van de verwijzing',
              `De verwijzing naar ${vw.verplicht_bij_meerdere_kleurcodes} staat bij kleurcode `
              + `${kleur}. Hij hoort alleen bij de hoogste kleurcode van dit advies, ${hoogste}.`,
              { fragment: bullet,
                notitie: 'Anders wordt de lezer vanuit "In het kort" twee keer naar hetzelfde blok '
                  + 'gestuurd.' }));
          }
        }
        const doelRubriek = vw.verplicht_bij_meerdere_kleurcodes;
        if (kleurenVanAdvies.length > 1 && doelRubriek
            && !kortGenorm.includes(norm(vw.patroon + doelRubriek))) {
          b.push(bevinding('kort-verwijst-regionaal', ERNST.letop, 'MX, tab Koppen, rij In het kort',
            `Dit advies heeft meerdere kleurcodes, maar "In het kort" verwijst niet naar ${doelRubriek}.`,
            { verwacht: vw.vorm.replace('{rubriek}', doelRubriek) + '.',
              notitie: 'Bij meerdere kleurcodes staat in "In het kort" alleen de verkorte uitleg; '
                + 'de lezer moet weten waar de volledige uitleg staat.' }));
        }
      }

      // Deze regel gaat over "In het kort", dus alleen die tekst doorzoeken.
      // Een opsomming van gebieden onder Regionale risico's mag juist wel lang zijn.
      const kortEigen = [...kortBlok.alineas.map((a) => a.tekst),
        ...kortBlok.opsommingen.flatMap((o) => o.items)].join(' ');
      const gebiedenMatch = kortEigen.match(/gebieden\s+((?:[A-Z][\wÀ-ſ-]*(?:,\s*|\s+en\s+)){2,}[A-Z][\wÀ-ſ-]*)/);
      if (gebiedenMatch) {
        const n = gebiedenMatch[1].split(/,|\sen\s/).map((s) => s.trim()).filter(Boolean).length;
        if (n > lim.gebieden.max_noemen) {
          b.push(bevinding('gebieden-max', ERNST.letop, 'MX, tab Koppen, rij In het kort',
            `Er worden ${n} gebieden genoemd. Noem er maximaal ${lim.gebieden.max_noemen} en verwijs daarna.`,
            { fragment: gebiedenMatch[0] }));
        }
      }
    }

    // Welke niet-melden-onderwerpen al via een kop zijn gemeld. Staat er een blok over, dan is dat
    // de melding; elke zin daarbinnen nog eens noemen voegt niets toe.
    const nmGemeld = new Set();

    // ---------- de vijf vaste H2's zijn er allemaal ----------
    // h2-vast hieronder toetst of een aanwézige H2 klopt, maar zegt niets als een H2 er
    // helemaal niet is. Bij geplakte platte tekst zonder opmaak ziet de parser geen koppen
    // (doc.koppen is dan leeg) en bleef de tool stil, terwijl de matrix deze vijf koppen net zo
    // vast voorschrijft als hun inhoud. Deze toets is dus juist bedoeld voor dat geval.
    //
    // Alleen als er ook echt minder H2's zijn dan de vijf vereiste: staan er al vijf, dan is een
    // "ontbrekende" kop in werkelijkheid een aanwezige kop met de verkeerde tekst, en dat is het
    // terrein van h2-vast hieronder — die geeft de precieze foutieve tekst als fragment, wat
    // bruikbaarder is dan hier nog eens "ontbreekt" roepen over hetzelfde probleem. Gemeten:
    // Amerikaans-Samoa schrijft "Wat kunt u doen" i.p.v. "Wat kan ik doen", Mauritius "Hoe bereid
    // ik mijn reis voor naar Mauritius?" i.p.v. "... naar Mauritius voor?" -- zonder deze grens
    // meldden beide regels hetzelfde tweemaal.
    const h2Koppen = doc.koppen.filter((k) => k.niveau === 2).map((k) => k.tekst);
    if (h2Koppen.length < matrix.h2_vast.length) {
      for (const sjabloon of matrix.h2_vast) {
        if (!h2Koppen.some((h) => new RegExp('^' + h2Patroon(sjabloon) + '$').test(norm(h)))) {
          b.push(bevinding('h2-ontbreekt', ERNST.letop, 'MX, tab Uitleg',
            `De vaste kop "${sjabloon.replace('{land}', doc.land || 'land X')}" ontbreekt.`,
            { verwacht: sjabloon.replace('{land}', doc.land || 'land X') }));
        }
      }
    }

    // ---------- koppen tegen de matrix ----------
    for (const kop of doc.koppen) {
      if (kop.niveau === 2 && !isVasteH2(kop.tekst, doc.land)) {
        b.push(bevinding('h2-vast', ERNST.letop, 'MX, tab Uitleg',
          `"${kop.tekst}" is geen vaste H2. Vast zijn: ${matrix.h2_vast.map((h) => h.replace('{land}', doc.land || 'land X')).join(' / ')}.`,
          { fragment: kop.tekst }));
      }
      // ---------- tussenkoppen op h4-niveau ----------
      // Alleen onder de rubrieken waar het sjabloon ze voorschrijft. Elders heet een kop naar zijn
      // eigen onderwerp - een ziekte, een gebeurtenis - en valt er niets te toetsen: van de 996
      // verschillende h4-koppen in het corpus komen er 839 precies een keer voor.
      if (kop.niveau === 4 && sj.h4_toetsen) {
        const hoortBij = (sleutel) => {
          const patroon = sj.rubriek_patronen[sleutel];
          return patroon && new RegExp(patroon, 'i').test(kop.h3 || '');
        };
        // Een eigen tussenkop is hier geen fout. Niet elk land heeft dezelfde informatie:
        // "Achtergelaten of gedwongen te trouwen" hoort bij Soemalieë en nergens anders, en dat
        // hoort de tool niet te bestrijden. Wél fout is hetzelfde onderwerp in het ene land anders
        // noemen dan in het andere. Daarom meldt de regel alleen een kop waarvan elders een andere
        // formulering rondgaat die duidelijk de huisstijl is.
        if ((sj.h4_toetsen.rubrieken || []).some(hoortBij) && !isVasteKop(kop.tekst)) {
          const gangbaar = gangbareKop(kop.tekst);
          if (gangbaar) {
            b.push(bevinding('h4-kop-variant', ERNST.letop, 'SJ, de blokken met voorgeschreven tussenkoppen',
              `"${kop.tekst}" heet in ${gangbaar.adviezen} andere adviezen "${gangbaar.kop}".`,
              { fragment: kop.tekst, verwacht: gangbaar.kop,
                notitie: 'Een eigen kop mag hier — niet elk land heeft dezelfde informatie. Maar '
                  + 'staat hetzelfde onderwerp elders onder een andere naam, dan is dat verwarrend.' }));
          }
        }
        // Een onderwerp dat de matrix als "niet melden" aanmerkt, hoort er ook niet als tussenkop
        // te staan. Een kop is een bewuste keuze om er een blok aan te wijden, dus dat weegt
        // even zwaar als bij een H3.
        const nmKop = nietMeldenTref.find((t) => t.re.test(norm(kop.tekst))
          && !magHierStaan(t, kop.h3));
        if (nmKop) {
          nmGemeld.add(nmKop.onderwerp);
          b.push(bevinding('h4-niet-melden', ERNST.fout, 'MX, tab Koppen, richtlijn Niet melden',
            `"${kop.tekst}" gaat over ${nmKop.onderwerp}, en dat hoort niet in een reisadvies.`,
            { fragment: kop.tekst, notitie: nmKop.toelichting || undefined }));
        }

        // Onder Natuurgeweld liggen de koppen niet vast, maar ze horen wel een risico te benoemen.
        // "Bergen" of "Slecht weer in de bergen" zegt niet welk risico er speelt.
        // Is de kop al gemeld omdat het onderwerp er niet in hoort, dan is "benoemt geen risico"
        // een overbodige tweede melding over dezelfde kop.
        const ng = sj.h4_toetsen.natuurgeweld;
        if (ng && !nmKop && hoortBij(ng.rubriek)) {
          const n = norm(kop.tekst);
          // Nederlands plakt woorden aan elkaar: "zandstormen" en "zeestromingen" benoemen wel
          // degelijk een risico, maar het risicowoord staat niet vooraan. Een stam van vijf letters
          // of meer mag daarom ook middenin een woord staan; bij kortere stammen zou dat misgaan
          // ("ijs" zit in "prijs"), dus die moeten aan het woordbegin.
          const benoemtRisico = (ng.risicowoorden || []).some((x) => {
            const stam = esc(norm(x));
            return new RegExp(norm(x).length >= 5 ? stam : '\\b' + stam).test(n);
          });
          if (!isVasteKop(kop.tekst) && !benoemtRisico) {
            b.push(bevinding('h4-natuurrisico', ERNST.letop, 'SJ, blok Natuurgeweld',
              `"${kop.tekst}" benoemt geen natuurrisico.`,
              { fragment: kop.tekst,
                notitie: 'Een tussenkop onder Natuurgeweld noemt het risico zelf, zoals '
                  + 'Vulkanen, Orkanen of Overstromingen — niet de plaats of de activiteit.' }));
          }
        }
      }

      if (kop.niveau === 3) {
        const regel = koppenOpNaam.get(norm(kop.tekst));
        if (regel && regel.richtlijn === 'niet-melden') {
          nmGemeld.add((regel.h3 || '').toLowerCase());
          b.push(bevinding('h3-niet-melden', ERNST.fout, 'MX, tab Koppen, richtlijn Niet melden',
            `"${kop.tekst}" hoort niet in een reisadvies.`, { fragment: kop.tekst, notitie: regel.toelichting }));
        }
        // De matrix merkt een paar rubrieken aan als uitzonderingsgeval. Ze mogen er dus staan,
        // maar niet standaard: de redacteur hoort te wegen of dit advies die uitzondering is.
        if (regel && regel.alleen_bij_uitzondering) {
          b.push(bevinding('h3-alleen-bij-uitzondering', ERNST.info, 'MX, tab Koppen, kolom Toelichting',
            `"${kop.tekst}" is bedoeld voor uitzonderingsgevallen. Klopt het dat dat hier zo is?`,
            { fragment: kop.tekst, notitie: regel.toelichting }));
        }
        // Het sjabloon schrijft de tussenkoppen letterlijk voor: "Terrorisme", niet "Terroristische
        // aanslagen". Een afwijkende kop is niet alleen zelf een formatbreuk — de vaste teksten
        // worden per rubriek op de kop gezocht, dus een kop die de tool niet kent zet de controles
        // eronder stil. Daarom melden we hem, met die waarschuwing erbij.
        if (!isVasteKop(kop.tekst)) {
          b.push(bevinding('h3-vaste-kop', ERNST.fout, 'SJ, blok Risico dat van toepassing is; MX, tab Koppen',
            `"${kop.tekst}" is geen vaste tussenkop.`,
            { fragment: kop.tekst,
              ...(dichtstbijKop(kop.tekst) ? { verwacht: dichtstbijKop(kop.tekst) } : {}),
              notitie: 'Heet deze rubriek naar zijn eigen onderwerp (een ziekte bijvoorbeeld), dan mag '
                + 'de kop vrij zijn; kies dan "oneens". Zo niet: de vaste teksten onder deze rubriek '
                + 'worden niet getoetst zolang de kop afwijkt.' }));
        }
      }
    }

    const heeftRegionaal = doc.koppen.some((k) => norm(k.tekst) === norm("Regionale risico's"));
    if (heeftRegionaal && !meerdereKleuren) {
      b.push(bevinding('h3-regionaal-alleen-bij-meerdere', ERNST.letop, 'MX, tab Koppen, rij Regionale risico\'s',
        'Regionale risico\'s hoort er alleen te staan bij meer dan 1 kleurcode.'));
    }

    // ---------- vaste formuleringen bij de kleuruitleg ----------
    // Het sjabloon schaft de oude manier van kleuren benoemen af: niet "gele gebieden" of
    // "de hoofdstad is oranje", maar "gebieden met kleurcode geel" en "de kleurcode voor de
    // hoofdstad X is oranje". Twee vormen dus: het bijvoeglijk naamwoord vóór een plaatsaanduiding,
    // en een koppelwerkwoord met een kleur zonder dat het woord kleurcode in de zin staat.
    const kfNaamwoorden = sj.kleurformulering.zelfstandig_naamwoorden.map(esc).join('|');
    for (const [kleur, bijvoeglijk] of Object.entries(sj.kleurformulering.bijvoeglijk)) {
      const re = new RegExp('\\b' + esc(bijvoeglijk) + '\\s+(' + kfNaamwoorden + ')\\b', 'gi');
      const gezienKf = new Set();
      for (const m of tekst.matchAll(re)) {
        const sleutel = m[0].toLowerCase();
        if (gezienKf.has(sleutel)) continue;
        gezienKf.add(sleutel);
        b.push(bevinding('kleur-formulering-verboden', ERNST.fout, 'SJ, blok In het kort',
          `"${m[0]}" gebruiken we niet meer.`,
          { fragment: contextVan(tekst, m.index), verwacht: `${m[1]} met kleurcode ${kleur}` }));
      }
    }
    // De bullets staan niet in doc.zinnen — dat zijn de alinea's — en juist onder "In het kort"
    // staat de kleuruitleg in bullets. Voor deze regel tellen ze dus wel mee.
    const zinnenMetBullets = [
      ...doc.zinnen,
      ...doc.opsommingen.flatMap((o) => o.items.flatMap((item) =>
        splitsZinnen(item).map((t) => ({ tekst: t, h2: o.h2, h3: o.h3 })))),
    ];
    for (const z of zinnenMetBullets) {
      const m = z.tekst.match(/\b(is|zijn)\s+(rood|oranje|geel|groen)\b/i);
      // "De kleurcode van het reisadvies voor Spanje is groen" is juist; het gaat mis zodra de
      // kleur zonder het woord kleurcode aan een plaats wordt gehangen.
      if (!m || /kleurcode/i.test(z.tekst.slice(0, m.index))) continue;
      b.push(bevinding('kleur-formulering-verboden', ERNST.fout, 'SJ, blok In het kort',
        `"${m[0]}" benoemt de kleur zonder het woord kleurcode.`,
        { fragment: z.tekst, kop: z.h3 || z.h2,
          verwacht: `de kleurcode voor … is ${m[2].toLowerCase()}` }));
    }

    // ---------- vaste teksten uit het sjabloon ----------
    // Per rubriek legt het sjabloon letterlijke teksten vast. De tool meldt alleen dát een vaste
    // tekst ontbreekt of afwijkt en toont de verwachte formulering. Invullen blijft aan de
    // redacteur: welke variant klopt, hangt af van het land.
    const alleenRood = kleurenInTekst.length === 1 && kleurenInTekst[0] === 'rood';

    if (introIsVeld0 && intro) {
      const introGenorm = norm(intro);
      const heeftStandaard = vasteTekstRegex(sj.intro.standaard, doc.land, kortLand).test(introGenorm);
      const heeftRood = vasteTekstRegex(sj.intro.alleen_rood, doc.land, kortLand).test(introGenorm);
      const verwachteIntro = (alleenRood ? sj.intro.alleen_rood : sj.intro.standaard)
        .replace(/\{land\}/g, doc.land || 'land X');
      if (!heeftStandaard && !heeftRood) {
        b.push(bevinding('intro-vaste-tekst', ERNST.fout, 'SJ, blok Introductie',
          'De intro wijkt af van de vaste introductietekst.', { fragment: intro, verwacht: verwachteIntro }));
      } else if (alleenRood && !heeftRood) {
        b.push(bevinding('intro-vaste-tekst', ERNST.letop, 'SJ, blok Introductie',
          'Dit advies heeft alleen kleurcode rood; daarvoor geldt de afwijkende intro.',
          { fragment: intro, verwacht: verwachteIntro }));
      } else if (!alleenRood && heeftRood) {
        b.push(bevinding('intro-vaste-tekst', ERNST.letop, 'SJ, blok Introductie',
          'De intro is de uitzonderingsvariant voor volledig rode adviezen, maar dit advies heeft meer dan kleurcode rood.',
          { fragment: intro, verwacht: verwachteIntro }));
      }
    }

    // Alles wat de bezoeker leest, niet alleen de lopende zinnen: Estland had "undefined" als
    // H2 staan en vijf Golfstaten hebben een word joiner in een opsommingsregel. Beide vallen
    // buiten doc.zinnen. Zowel de tekstfouten als de spellingtoets lopen hierover.
    const teLezen = [
      ...doc.zinnen.map((z) => ({ tekst: z.tekst, kop: z.h3 || z.h2 })),
      ...doc.koppen.map((k) => ({ tekst: k.tekst, kop: k.h3 || k.h2 })),
      ...doc.opsommingen.flatMap((o) => o.items.map((i) => ({ tekst: i, kop: o.h3 || o.h2 }))),
    ].filter((x) => x.tekst);

    // Een vaste tekst waarin {land} staat, maar waar de landnaam niet is ingevuld. Denemarken en
    // Ierland hebben allebei "Heeft u direct hulp nodig in ?" staan.
    //
    // Dit valt buiten de lus hieronder, en dat is geen toeval: die toetst op `kern`, en dat is met
    // opzet het stuk zonder landnaam ("neem contact op met de lokale hulpdiensten"). Anders zou
    // elke legitieme afkorting — "de VS", "het VK" — een melding geven. Daardoor werd de helft
    // mét de landnaam nooit getoetst.
    //
    // De toets vraagt dus niet "staat hier precies deze landnaam?" maar "staat hier überhaupt
    // iets?". Een lege plek is altijd fout, hoe het land ook wordt afgekort.
    for (const vt of sj.vaste_teksten.filter((v) => v.zin.includes('{land}'))) {
      const voorLand = norm(vt.zin.split('{land}')[0]).trim();
      if (voorLand.length < 12) continue;                 // te kort om op te herkennen
      for (const e of teLezen) {
        const n = norm(e.tekst);
        const i = n.indexOf(voorLand);
        if (i < 0) continue;
        const staart = n.slice(i + voorLand.length).replace(/^[\s,]+/, '');
        if (/^\p{L}/u.test(staart)) continue;              // er staat een naam, welke dan ook
        b.push(bevinding('vaste-tekst-land-leeg', ERNST.fout, 'SJ, de vaste teksten met {land}',
          'De naam van het land is hier niet ingevuld.',
          { fragment: e.tekst, kop: e.kop,
            verwacht: vt.zin.replace('{land}', doc.land || 'land X'),
            notitie: 'Het sjabloon zet hier de landnaam neer. Waarschijnlijk is die bij het '
              + 'samenstellen van de pagina weggevallen.' }));
        break;                                            // één melding per vaste tekst is genoeg
      }
    }

    for (const vt of sj.vaste_teksten) {
      const bereik = vt.rubriek ? rubriekTekst(doc, sj.rubriek_patronen[vt.rubriek]) : tekst;
      if (bereik === null) continue;                                   // rubriek staat niet in dit advies
      const bereikGenorm = norm(bereik);
      if (vt.alleen_als && !new RegExp(vt.alleen_als, 'i').test(bereikGenorm)) continue;
      if (vt.kleur && !vt.kleur.some((k) => kleurenInTekst.includes(k))) continue;
      if (vt.alleen_rood && !alleenRood) continue;

      const kern = vt.kern ? new RegExp(vt.kern, 'i') : vasteTekstRegex(vt.zin, doc.land, kortLand);
      if (kern.test(bereikGenorm)) continue;

      // Wijkt de tekst af, dan staat er dus wél iets — alleen anders. Zoek de zin op waar de
      // herkenning op aanslaat en geef die mee als fragment, zodat de pagina hem in het advies
      // kan markeren. Ontbreekt de vaste tekst helemaal, dan is er niets aan te wijzen en
      // blijft het fragment leeg: de bevinding meldt dan alleen de verwachte formulering.
      const herkenRe = vt.herken ? new RegExp(vt.herken, 'i') : null;
      const wijktAf = !!herkenRe && herkenRe.test(bereikGenorm);
      const fragment = wijktAf
        ? rubriekEenheden(doc, vt.rubriek ? sj.rubriek_patronen[vt.rubriek] : null)
            .find((e) => herkenRe.test(norm(e)))
        : null;
      b.push(bevinding(vt.id, vt.ernst, vt.bron,
        wijktAf ? (vt.boodschap_afwijkend || vt.boodschap) : vt.boodschap,
        { ...(fragment ? { fragment } : {}),
          verwacht: vt.zin.replace(/\{land\}/g, doc.land || 'land X')
            .replace(/\{kleur\}|\{gebieden\}/g, '…') }));
    }

    // ---------- aantal en volgorde van de rubrieken ----------
    for (const [sleutel, label] of [['veiligheidsrisicos', "Welke veiligheidsrisico's zijn er"],
      ['reisvoorbereiding', 'Hoe bereid ik mijn reis voor']]) {
      const re = new RegExp(sj.rubriek_patronen[sleutel], 'i');
      const rubrieken = doc.koppen.filter((k) => k.niveau === 3 && re.test(k.h2 || ''));
      if (rubrieken.length > sj.limieten.rubrieken.max_per_h2) {
        b.push(bevinding('rubrieken-max', ERNST.letop, 'SJ, richtlijn boven de rubrieken',
          `Onder "${label}" staan ${rubrieken.length} rubrieken. De richtlijn is maximaal ${sj.limieten.rubrieken.max_per_h2}.`,
          { notitie: 'De rubrieken: ' + rubrieken.map((k) => k.tekst).join(', ') }));
      }
    }

    // De rubrieken onder veiligheidsrisico's staan in volgorde van relevantie. Koppen die het
    // sjabloon niet noemt (een ziekte bijvoorbeeld, die heet naar het virus) laten we staan waar
    // ze staan; die hebben geen vaste plek.
    //
    // Drie lagen, want niet alles ligt even vast:
    //   bovenaan  Actueel en Regionale risico's, in die volgorde. Dat is een fout als het anders is.
    //   vast      de voorgeschreven volgorde, maar afwijken mag als een risico zwaarder weegt.
    //   vrij      geen volgorde onderling; ze horen wel onder de vaste laag.
    const volgordeRe = new RegExp(sj.rubriek_patronen.veiligheidsrisicos, 'i');
    const rv = sj.rubriek_volgorde;
    const bovenaan = rv.bovenaan.map(norm);
    const vast = rv.vast.map(norm);
    const vrij = rv.vrij.map(norm);
    const laagVan = (r) => (bovenaan.includes(r) ? 0 : vast.includes(r) ? 1 : vrij.includes(r) ? 2 : -1);

    const rij = doc.koppen
      .filter((k) => k.niveau === 3 && volgordeRe.test(k.h2 || ''))
      .map((k) => ({ tekst: k.tekst, n: norm(k.tekst) }))
      .filter((x) => laagVan(x.n) >= 0);

    // 1. Actueel en Regionale risico's horen bovenaan, in die volgorde. Geen aandachtspunt maar
    //    een fout: hier is de lezer naar op zoek, en de volgorde ligt vast.
    const bovenIn = rij.filter((x) => laagVan(x.n) === 0);
    if (bovenIn.length) {
      const hoort = bovenaan.filter((r) => bovenIn.some((x) => x.n === r));
      const staat = rij.slice(0, bovenIn.length).map((x) => x.n);
      if (hoort.join('|') !== staat.join('|')) {
        b.push(bevinding('rubriek-bovenaan', ERNST.fout, 'SJ, blok Risico dat van toepassing is',
          `${bovenIn.map((x) => `"${x.tekst}"`).join(' en ')} ${bovenIn.length > 1 ? 'horen' : 'hoort'} bovenaan te staan.`,
          { fragment: bovenIn[0].tekst,
            verwacht: hoort.map((r) => rv.bovenaan[bovenaan.indexOf(r)]).join(' > '),
            notitie: 'Staat er een Actueel, dan komt die eerst en Regionale risico\'s daarna. '
              + 'Is er geen Actueel, dan staat Regionale risico\'s bovenaan.' }));
      }
    }

    // 2. Binnen de vaste laag de voorgeschreven volgorde. Afwijken mag als een risico in dit land
    //    zwaarder weegt — dat is juist wat "in volgorde van relevantie" betekent — dus dit is een
    //    aandachtspunt.
    const vastIn = rij.filter((x) => laagVan(x.n) === 1);
    for (let i = 1; i < vastIn.length; i++) {
      if (vast.indexOf(vastIn[i].n) < vast.indexOf(vastIn[i - 1].n)) {
        b.push(bevinding('rubrieken-volgorde', ERNST.info, 'SJ, blok Risico dat van toepassing is',
          `Weet je zeker dat je hier van de standaardvolgorde wilt afwijken? "${vastIn[i].tekst}" `
            + `staat na "${vastIn[i - 1].tekst}".`,
          { fragment: vastIn[i].tekst,
            notitie: 'Afwijken kan goed zijn: is een risico de reden voor de kleurcode, dan hoort dat '
              + 'bovenaan. De standaardvolgorde is: ' + rv.vast.join(' > ') + '.' }));
        break;
      }
    }

    // 3. De vrije rubrieken horen onder Wetten en gebruiken en alles wat daarboven staat.
    //    Onderling ligt hun volgorde niet vast, en boven Natuurgeweld mógen ze staan: dat staat
    //    meer op zichzelf, en Demonstraties sluit juist aan op Wetten en gebruiken.
    const grens = vast.indexOf(norm(rv.vrij_onder));
    const bindend = (x) => laagVan(x.n) === 1 && vast.indexOf(x.n) <= grens;
    const eersteVrij = rij.findIndex((x) => laagVan(x.n) === 2);
    if (eersteVrij >= 0) {
      const onder = rij.slice(eersteVrij + 1).find(bindend);
      if (onder) {
        b.push(bevinding('rubriek-vrij-te-hoog', ERNST.info, 'SJ, blok Risico dat van toepassing is',
          `"${rij[eersteVrij].tekst}" staat boven "${onder.tekst}".`,
          { fragment: rij[eersteVrij].tekst,
            notitie: `Deze rubriek hoort onder "${rv.vrij_onder}" te staan, en onder alles wat daarboven `
              + 'komt: ' + rv.vast.slice(0, grens + 1).join(' > ') + '. Boven Natuurgeweld mag hij wel, '
              + 'en onderling ligt de volgorde van de vrije rubrieken niet vast.' }));
      }
    }

    // De nummers van het contactcenter liggen vast. Een ander Nederlands nummer in deze rubriek
    // is een fout, geen stijlkwestie — daar belt iemand in nood mee.
    const noodTekst = rubriekTekst(doc, sj.rubriek_patronen.nood);
    if (noodTekst) {
      const vasteNummers = new Set([sj.contactcenter.telefoon, sj.contactcenter.whatsapp]
        .map((x) => x.replace(/\D/g, '')));
      const gezienNr = new Set();
      for (const m of noodTekst.matchAll(/\+31[\s\d]{7,}\d/g)) {
        const cijfers = m[0].replace(/\D/g, '');
        if (vasteNummers.has(cijfers) || gezienNr.has(cijfers)) continue;
        gezienNr.add(cijfers);
        b.push(bevinding('nood-contactnummer', ERNST.fout, 'SJ, blok In geval van nood',
          `"${m[0].trim()}" is niet een van de vaste nummers van het contactcenter.`,
          { fragment: contextVan(noodTekst, m.index),
            verwacht: `${sj.contactcenter.telefoon} (telefoon) of ${sj.contactcenter.whatsapp} (WhatsApp)` }));
      }
    }

    // ---------- titel en intro ----------
    if (doc.titel) {
      if (doc.titel.length > lim.titel.max_tekens) {
        b.push(bevinding('titel-max-tekens', ERNST.fout, 'SW, Gebruiksvriendelijkheid > Titel',
          `De titel is ${doc.titel.length} tekens. Maximaal ${lim.titel.max_tekens}.`, { fragment: doc.titel }));
      }
      // Een apostrof in "Bahama's" is geen leesteken maar onderdeel van de naam.
      // De tussenkop-regel hieronder deed dit al wel; de titel-regel niet.
      const leestekens = [...zonderApostrof(doc.titel)].filter((c) => /[.,;:!"'()]/.test(c));
      if (leestekens.length) {
        b.push(bevinding('titel-leestekens', ERNST.letop, 'SW, Gebruiksvriendelijkheid > Titel',
          'De titel bevat leestekens. Dat mag alleen bij de vraagvorm.', { fragment: doc.titel }));
      }
    }
    const titelIsVraag = !!doc.titel && doc.titel.trim().endsWith('?');
    if (intro) {
      const n = telWoorden(intro);
      if (n > lim.intro.max_woorden) {
        b.push(bevinding('intro-max-woorden', ERNST.letop, 'SW, Gebruiksvriendelijkheid > Intro',
          `De intro telt ${n} woorden. Richtlijn is maximaal ${lim.intro.max_woorden}.`, { fragment: intro }));
      }
      if (titelIsVraag && intro.trim().split(/(?<=[.?!])\s/)[0].endsWith('?')) {
        b.push(bevinding('intro-geen-vraag-na-vraagtitel', ERNST.letop, 'SW, Gebruiksvriendelijkheid > Intro',
          'De titel is al een vraag, begin de intro dan niet met een vraag.', { fragment: intro }));
      }
    }

    // ---------- tussenkoppen ----------
    // Alleen H3: de H2's zijn door de matrix voorgeschreven vraagvormen en mogen langer zijn.
    // Koppen die de matrix letterlijk voorschrijft ("Paspoort, ID-kaart, rijbewijs") toetsen we
    // niet op woordenaantal of leestekens — de richtlijn is daar de matrix zelf.
    for (const kop of doc.koppen.filter((k) => k.niveau === 3 && !isVasteKop(k.tekst))) {
      const w = telWoorden(kop.tekst);
      if (w > lim.tussenkop.max_woorden) {
        b.push(bevinding('tussenkop-max-woorden', ERNST.letop, 'SW, Gebruiksvriendelijkheid > (Tussen)koppen',
          `"${kop.tekst}" telt ${w} woorden. Maximaal ${lim.tussenkop.max_woorden}.`, { fragment: kop.tekst }));
      }
      const eerste = (kop.tekst.match(/^\s*([\p{L}]+)/u) || [])[1];
      if (eerste && wl.lidwoorden.includes(eerste.toLowerCase())) {
        b.push(bevinding('tussenkop-lidwoord', ERNST.letop, 'SW, Gebruiksvriendelijkheid > (Tussen)koppen',
          `"${kop.tekst}" begint met een lidwoord.`, { fragment: kop.tekst }));
      }
      if (/[.,;:!"'()]/.test(kop.tekst.replace(/'(?=s\b)|(?<=\w)'(?=\w)/g, ''))) {
        b.push(bevinding('tussenkop-leestekens', ERNST.info, 'SW, Gebruiksvriendelijkheid > (Tussen)koppen',
          `"${kop.tekst}" bevat een leesteken. Alleen een vraagteken mag.`, { fragment: kop.tekst }));
      }
      if (titelIsVraag && kop.tekst.trim().endsWith('?')) {
        b.push(bevinding('tussenkop-vraagvorm', ERNST.letop, 'SW, Begrijpelijkheid > Vraagvorm',
          `De titel is al een vraag, zet tussenkop "${kop.tekst}" dan niet in vraagvorm.`, { fragment: kop.tekst }));
      }
    }

    // ---------- alinea's en zinnen ----------
    for (const a of doc.alineas) {
      if (a.woorden > lim.alinea.max_woorden) {
        b.push(bevinding('alinea-max-woorden', ERNST.letop, "SW, Gebruiksvriendelijkheid > Alinea's",
          `Deze alinea telt ${a.woorden} woorden. Maximaal ${lim.alinea.max_woorden}.`,
          { fragment: a.tekst.slice(0, 120) + (a.tekst.length > 120 ? '…' : ''), kop: a.kop }));
      }
    }

    const vasteZinnen = new Set();
    for (const k of Object.values(kleurcodes.kleuren)) {
      for (const veld of ['in_het_kort_volledig', 'in_het_kort_deels', 'regionaal_tekst']) {
        if (k[veld]) for (const z of k[veld].split(/(?<=\.)\s+/)) vasteZinnen.add(norm(z).replace(/\{land\}|\{gebieden\}/g, ''));
      }
    }
    // Ook de vaste teksten uit het sjabloon zijn vaste formulering: die mogen langer zijn dan
    // 15 woorden en de schrijfregels erover zijn al afgewogen toen de tekst werd vastgesteld
    // ("Uw basiszorgverzekering vergoedt deze kosten niet altijd 100 procent"). We knippen elke
    // vaste tekst op de plaatshouders, zodat het herkenbare deel overblijft.
    // Naast de verplichte vaste teksten staan er in het sjabloon formuleringen die je alléén
    // gebruikt als ze van toepassing zijn — welk visumverhaal geldt, hangt van het land af. Die
    // zijn niet verplicht (dus geen "ontbreekt"-melding), maar ze zijn wél vastgesteld, en dus
    // net zomin onze schrijfregel als de rest.
    const sjabloonZinnen = [];
    const vrijgesteld = (sj.vrijgestelde_formuleringen && sj.vrijgestelde_formuleringen.zinnen) || [];
    for (const bronTekst of [...sj.vaste_teksten.map((x) => x.zin), ...vrijgesteld, sj.intro.standaard,
      sj.intro.alleen_rood, sj.contactcenter.zin, sj.regionaal.afsluiter, sj.regionaal.gebiedenzin]) {
      for (const vasteZin of norm(bronTekst).split(/(?<=[.?!])\s+/)) {
        for (const deel of vasteZin.split(/\{land\}|\{gebieden\}|\{kleur\}|\{vrij\}/)) {
          const kern = deel.replace(/\s+/g, ' ').trim();
          if (kern.length > 25) sjabloonZinnen.push(kern);
        }
      }
    }
    const isVasteZin = (z) => {
      const n = norm(z);
      for (const v of vasteZinnen) {
        const kern = v.replace(/^de kleurcode van het reisadvies voor\s*/, '').trim();
        if (kern.length > 12 && n.includes(kern)) return true;
      }
      return sjabloonZinnen.some((kern) => n.includes(kern));
    };

    /**
     * Dezelfde vaste zinnen, maar heel gelaten en met {land} ingevuld. Nodig voor de linkteksten:
     * "Check welke vaccinaties u nodig heeft voor de Centraal-Afrikaanse Republiek" is de vaste
     * zin met een lange landnaam erin, en die staat niet in de opgeknipte stukken hierboven.
     */
    // {land} mag met of zonder lidwoord zijn ingevuld: "voor de Centraal-Afrikaanse Republiek"
    // naast "voor Saint Vincent en de Grenadines". Dat lidwoord is grammatica, geen keuze van de
    // redacteur. Verder niets: schrijft iemand "de Verenigde Arabische Emiraten (VAE)", dan is die
    // afkorting wél een keuze, en dan hoort de linktekst gewoon gemeld te worden.
    const sjabloonHeel = [];
    for (const bronTekst of [...sj.vaste_teksten.map((x) => x.zin), ...vrijgesteld, sj.intro.standaard,
      sj.intro.alleen_rood, sj.contactcenter.zin]) {
      for (const zin of norm(bronTekst).split(/(?<=[.?!])\s+/)) {
        for (const lidwoord of ['', 'de ', 'het ']) {
          const heel = norm(zin.replace(/\{land\}/g, lidwoord + norm(doc.land || ''))
            .replace(/\{gebieden\}|\{kleur\}|\{vrij\}/g, ' '));
          if (heel.length > 25) sjabloonHeel.push(heel);
          if (!zin.includes('{land}')) break;            // zonder {land} is er niets te variëren
        }
      }
    }

    /**
     * Andersom dan isVasteZin: een linktekst is een stúk van een vaste tekst, niet omgekeerd.
     * "Check welke documenten u nodig heeft om te reizen met een minderjarig kind" is 74 tekens en
     * dus te lang volgens de schrijfwijzer, maar staat zo in het sjabloon. Daar valt niets aan in
     * te korten zonder van het format af te wijken, dus meldt de tool het niet.
     */
    const isVasteLinktekst = (t) => {
      const n = norm(t).replace(/[?.!]\s*$/, '');
      if (n.length <= 20) return false;
      if (sjabloonZinnen.some((kern) => kern.includes(n))) return true;
      return sjabloonHeel.some((z) => z.includes(n));
    };

    // ---------- tekstfouten ----------
    // Overgenomen uit SpellingSpeurneus, het spellingtooltje van de redactie. Dit zijn de drie
    // controles die daar geen woordenlijst voor nodig hebben; die passen hier, want de regellaag
    // draait zonder dependencies. Het zijn geen schrijfregels: er is iets misgegaan tussen het CMS
    // en de pagina, of er staat een tikfout die je bij snel lezen niet ziet.
    // Wat de tekstfouten hierboven al melden, meldt de spellingtoets niet nog een keer: "undefined"
    // en "demonstraties.Volg" zijn geen onbekende woorden maar een CMS-rest en een vergeten spatie,
    // en dat is de nuttiger boodschap.
    const alGemeldWoord = new Set();

    if (tc) {
      const resten = new RegExp(tc.cms_resten.patroon, 'g');
      const gezienRest = new Set();
      for (const z of teLezen) {
        for (const m of z.tekst.matchAll(resten)) {
          if (gezienRest.has(m[0])) continue;
          gezienRest.add(m[0]);
          alGemeldWoord.add(m[0].toLowerCase());
          b.push(bevinding('tekst-cms-rest', ERNST.fout, 'Tekstcontrole (SpellingSpeurneus)',
            `"${m[0]}" hoort niet in de tekst te staan: dit is een rest van het CMS of het sjabloon.`,
            { fragment: z.tekst, kop: z.kop, herkomst: 'aanvulling',
              notitie: 'Een bezoeker ziet dit letterlijk op de pagina staan.' }));
        }
      }

      // Een punt middenin een woord wijst op een vergeten spatie. Een webadres en een afkorting
      // van losse letters ("U.S") zijn dat niet.
      const isPlakfout = (w) => {
        const delen = w.split('.').filter(Boolean);
        if (delen.length < 2) return false;
        if ((tc.plakfout.domeinen || []).some((d) => w.toLowerCase().endsWith(d))) return false;
        return !delen.every((d) => d.length === 1);
      };
      const gezienPlak = new Set();
      for (const z of teLezen) {
        for (const ruw of z.tekst.split(/[\s/()[\]]+/)) {
          const w = ruw.replace(/[\u2019]/g, "'").replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}']+$/gu, '');
          if (!w || !/\p{L}/u.test(w) || /\d/.test(w) || w.includes('@')) continue;
          if (!isPlakfout(w) || gezienPlak.has(w)) continue;
          gezienPlak.add(w);
          alGemeldWoord.add(w.toLowerCase());
          // Alleen een suggestie doen als beide kanten een woord zijn. Bij "invullen.n" is een
          // spatie niet de oplossing - daar staat een losse letter die weg moet - en dan is een
          // verkeerde suggestie erger dan geen.
          const beideWoorden = w.split('.').filter(Boolean).every((d) => d.length > 1);
          b.push(bevinding('tekst-plakfout', ERNST.fout, 'Tekstcontrole (SpellingSpeurneus)',
            `"${w}": hier is een spatie vergeten.`,
            { fragment: z.tekst, kop: z.kop, herkomst: 'aanvulling',
              ...(beideWoorden ? { verwacht: w.replace(/\.(?=\S)/g, '. ') } : {}),
              ...(beideWoorden ? {} : { notitie: 'Let op: hier staat een los teken tegen het '
                + 'woord aan. Kijk of dat weg moet in plaats van dat er een spatie bij komt.' }) }));
        }
      }

      // Hetzelfde woord twee keer achter elkaar. Klassieke tikfout bij het herschrijven van een
      // zin: het nieuwe woord staat er, het oude is blijven staan.
      if (tc.dubbel_woord) {
        const gezienDubbel = new Set();
        for (const z of teLezen) {
          // Het tweede woord staat in een vooruitblik, niet in de match zelf. Anders wordt het
          // meegeconsumeerd en mist de volgende ronde het: in "naar het het noorden" verbruikt
          // "naar het" de eerste "het", en dan ziet de lus "het het" nooit.
          for (const m of z.tekst.matchAll(/\b(\p{L}{2,})(\s+)(?=(\p{L}{2,})\b)/gu)) {
            const [, een, , twee] = m;
            if (een.toLowerCase() !== twee.toLowerCase()) continue;
            // Een eigennaam herhaalt zichzelf: "Pom Pom", "Tawi Tawi". Twee hoofdletters achter
            // elkaar is dus een naam. Aan het zinsbegin telt dat niet, want daar zegt een
            // hoofdletter niets — "Het het departement" hoort wél gemeld te worden.
            if (/^\p{Lu}/u.test(een) && /^\p{Lu}/u.test(twee)) continue;
            // Een aangehaalde vreemde term: ‘boda boda’s’.
            const eind = m.index + m[0].length + twee.length;
            const voor = z.tekst.slice(Math.max(0, m.index - 2), m.index);
            const na = z.tekst.slice(eind, eind + 3);
            if (/["'\u2018\u201c]/.test(voor) && /["'\u2019\u201d]/.test(na)) continue;
            const paar = een + m[2] + twee;
            if (gezienDubbel.has(paar)) continue;
            gezienDubbel.add(paar);
            b.push(bevinding('tekst-dubbel-woord', ERNST.fout, 'Tekstcontrole (SpellingSpeurneus)',
              `"${een}" staat er twee keer achter elkaar.`,
              { fragment: z.tekst, kop: z.kop, verwacht: een, herkomst: 'aanvulling',
                notitie: 'Meestal blijft bij het herschrijven van een zin het oude woord staan.' }));
          }
        }
      }

      // Een spatie voor een leesteken. Geen bewaking nodig: er is geen Nederlandse zin waarin dat
      // goed is.
      if (spatieRe) {
        const gezienSp = new Set();
        for (const z of teLezen) {
          for (const m of z.tekst.matchAll(spatieRe)) {
            const teken = m[0].trim();
            if (gezienSp.has(teken)) continue;
            gezienSp.add(teken);
            b.push(bevinding('tekst-spatie-leesteken', ERNST.fout, 'Tekstcontrole (SpellingSpeurneus)',
              `Er staat een spatie v\u00f3\u00f3r "${teken}".`,
              { fragment: z.tekst.replace(m[0], '\u2423' + teken), kop: z.kop, herkomst: 'aanvulling',
                notitie: 'Een leesteken sluit aan op het woord ervoor. In dit fragment staat er '
                  + '\u2423 op de plek van de spatie.' }));
          }
        }
      }

      // Nederlands of Nederlandse? Een de-woord krijgt altijd -e; een het-woord alleen na een
      // bepaald lidwoord. Dit is met opzet geen grammaticacontrole maar een gesloten verzameling:
      // vijf zelfstandige naamwoorden waarvan het geslacht vaststaat. Daarvoor klopt de regel
      // altijd, en daarbuiten zwijgt hij.
      if (nvRegex) {
        const nv = tc.nederlands_verbuiging;
        const bepaald = new Set(nv.bepaalde_bepalers.map((w) => w.toLowerCase()));
        const meervoud = new Set(nv.meervouden.map((w) => w.toLowerCase()));
        const deWoord = new Set(nv.de_woorden.map((w) => w.toLowerCase()));
        const gezienNv = new Set();
        for (const z of teLezen) {
          for (const m of z.tekst.matchAll(nvRegex)) {
            const ervoor = (m[1] || '').trim().toLowerCase();
            const vorm = m[2];
            const nw = m[3].toLowerCase();
            // Meervoud en de-woorden krijgen altijd -e. Bij een het-woord hangt het af van wat
            // ervoor staat: na "het" of "dit" wél, na "een" of niets niet.
            const zonderLidwoord = !bepaald.has(ervoor);
            const hoort = (meervoud.has(nw) || deWoord.has(nw) || !zonderLidwoord)
              ? nv.bijvoeglijk.met_e : nv.bijvoeglijk.zonder_e;
            if (vorm.toLowerCase() === hoort.toLowerCase()) continue;
            const gevonden = `${vorm} ${m[3]}`;
            if (gezienNv.has(gevonden)) continue;
            gezienNv.add(gevonden);
            b.push(bevinding('nederlands-verbuiging', ERNST.fout, 'Tekstcontrole (SpellingSpeurneus)',
              `"${gevonden}" hoort "${hoort} ${m[3]}" te zijn.`,
              { fragment: z.tekst, kop: z.kop, verwacht: `${hoort} ${m[3]}`, herkomst: 'aanvulling',
                notitie: hoort === nv.bijvoeglijk.zonder_e
                  ? `"${m[3]}" is een het-woord. Zonder lidwoord krijgt het bijvoeglijk naamwoord `
                    + 'geen -e. Staat er een lidwoord te weinig, dan is "het ' + vorm.toLowerCase()
                    + ' ' + m[3] + '" ook goed.'
                  : `Na "${ervoor}" krijgt het bijvoeglijk naamwoord een -e.` }));
          }
        }
      }

      // De naam van het land zelf is het één woord waarvan de tool wél weet hoe het hoort: die
      // staat in het cms-veld. Staat er "Tsjechie" waar "Tsjechië" hoort, dan is dat een fout, en
      // zonder deze regel zou niemand hem vinden — namen worden verder niet gemeld.
      //
      // Alleen als het trema of accent het enige verschil is. En niet in een reeks hoofdletters:
      // "the Israel Population & Immigration Authority" is de juiste Engelse naam van een
      // instituut, geen verkeerd gespeld Israël.
      if (landOpKale.size) {
        const gezienLand = new Set();
        for (const z of teLezen) {
          const stukken = z.tekst.split(/[\s/()[\]]+/).map(schoonWoord);
          for (let i = 0; i < stukken.length; i += 1) {
            const w = stukken[i];
            if (!w) continue;
            const hoort = landOpKale.get(zonderTekens(w));
            if (!hoort || hoort === w) continue;
            if ([stukken[i - 1], stukken[i + 1]].some((x) => x && /^\p{Lu}/u.test(x))) continue;
            if (gezienLand.has(w)) continue;
            gezienLand.add(w);
            b.push(bevinding('landnaam-schrijfwijze', ERNST.fout, 'Tekstcontrole (SpellingSpeurneus)',
              `"${w}" hoort "${hoort}" te zijn.`,
              { fragment: z.tekst, kop: z.kop, verwacht: hoort, herkomst: 'aanvulling',
                notitie: 'Deze schrijfwijze komt uit de landenlijst van de open data.' }));
          }
        }
      }

      // Dezelfde toets voor de standplaatsen van de posten: Bogotá, Caïro, Chișinău.
      if (plaatsOpKale.size) {
        const gezienPlaats = new Set();
        for (const z of teLezen) {
          const stukken = z.tekst.split(/[\s/()[\]]+/).map(schoonWoord);
          for (let i = 0; i < stukken.length; i += 1) {
            const w = stukken[i];
            if (!w) continue;
            const hoort = plaatsOpKale.get(zonderTekens(w));
            if (!hoort || hoort === w) continue;
            if ([stukken[i - 1], stukken[i + 1]].some((x) => x && /^\p{Lu}/u.test(x))) continue;
            if (gezienPlaats.has(w)) continue;
            gezienPlaats.add(w);
            b.push(bevinding('postplaats-schrijfwijze', ERNST.fout, 'Tekstcontrole (SpellingSpeurneus)',
              `"${w}" hoort "${hoort}" te zijn.`,
              { fragment: z.tekst, kop: z.kop, verwacht: hoort, herkomst: 'aanvulling',
                notitie: 'Zo schrijft de open data de standplaats van de Nederlandse post daar.' }));
          }
        }
      }

      // Tekens zonder breedte. Niet te zien in de tekst, maar ze breken het zoeken, het kopieren
      // en de schermlezer. Hier kan een redacteur niet zelf overheen lezen.
      const gezienTeken = new Set();
      for (const z of teLezen) {
        for (const [teken, naam] of Object.entries(tc.onzichtbare_tekens.tekens || {})) {
          if (!z.tekst.includes(teken) || gezienTeken.has(teken)) continue;
          gezienTeken.add(teken);
          b.push(bevinding('tekst-onzichtbaar-teken', ERNST.letop, 'Tekstcontrole (SpellingSpeurneus)',
            `Er staat een ${naam} in de tekst.`,
            { fragment: z.tekst.replace(new RegExp(teken, 'g'), '\u2423'), kop: z.kop,
              herkomst: 'aanvulling',
              notitie: 'Dit teken is niet te zien maar staat er wel. Het hoort hier weg; '
                + 'in dit fragment staat er \u2423 op de plek waar het stond.' }));
        }
      }
    }

    // ---------- spelling ----------
    // Overgenomen uit SpellingSpeurneus. Draait alleen als de woordenlijst geladen is.
    //
    // De woordenlijst kent geen plaats- en organisatienamen, en in reisadviezen staan die overal:
    // National Hurricane Center, EMSC, Boko Haram. Zonder scheiding verdrinken de echte fouten
    // daarin. Daarom deelt de tool elke melding in, net als SpellingSpeurneus dat doet, en staan
    // namen in een eigen filter.
    if (spelling) {
      const gezienWoord = new Set();
      for (const z of teLezen) {
        // De zin één keer in woorden knippen, met de plek erbij. Daarmee is te zien of er naast
        // een woord nóg een hoofdletterwoord staat, en dat is wat een naam een naam maakt.
        const stukken = z.tekst.split(/[\s/()[\]]+/).map(schoonWoord);
        const beginWoord = schoonWoord(
          z.tekst.replace(/^[“‘'"([\s]+/, '').split(/[\s/()[\]]+/)[0] || '');

        for (let i = 0; i < stukken.length; i += 1) {
          const w = stukken[i];
          if (!w || !/\p{L}/u.test(w)) continue;
          if (/\d/.test(w) || w.includes('@')) continue;   // jaartallen, codes, e-mailadressen
          if (isBekendWoord(w)) continue;
          if (alGemeldWoord.has(w.toLowerCase()) || gezienWoord.has(w)) continue;
          gezienWoord.add(w);

          // Namen worden herkend en daarna overgeslagen. Een hoofdletter middenin een zin is
          // vrijwel altijd een naam; aan het zinsbegin zegt een hoofdletter niets — zo blijft
          // "Registeer" een spelfout. Namen komen bovendien in reeksen ("National Hurricane
          // Center"), dus staat er direct naast nog een woord met een hoofdletter, dan is het
          // ook aan het zinsbegin een naam.
          //
          // Ze worden niet gemeld. Instructie van de opdrachtgever, 18 september 2026: in 226
          // reisadviezen staan zoveel plaatsnamen, buitenlandse namen en instituten dat er geen
          // woordenlijst voor is aan te leggen, en ze staan vrijwel altijd goed. Over het corpus
          // waren het 1974 meldingen tegen 146 mogelijke spelfouten; die zouden de echte fouten
          // wegdrukken. De herkenning blijft wél staan: zonder dat zou "European" in "European
          // Avalanche Warning Service" als spelfout worden gemeld.
          const metHoofd = /^\p{Lu}/u.test(w);
          const buurHoofd = [stukken[i - 1], stukken[i + 1]].some((x) => x && /^\p{Lu}/u.test(x));
          if (metHoofd && (w !== beginWoord || buurHoofd)) continue;

          b.push(bevinding('woord-onbekend', ERNST.letop, 'Tekstcontrole (SpellingSpeurneus)',
            `"${w}" staat niet in de woordenlijst.`,
            { fragment: z.tekst, kop: z.kop, herkomst: 'aanvulling',
              notitie: 'Klopt het woord wel? Zet het dan in regels/uitzonderingen.txt, '
                + 'dan meldt de tool het niet meer.' }));
        }
      }
    }

    // Een onderwerp dat de matrix als "niet melden" aanmerkt, hoort ook niet in de lopende tekst.
    // Vaste teksten tellen niet mee: het trefwoord "ziekenhuis" staat in de voorgeschreven noodzin
    // ("u bent opgenomen in het ziekenhuis"), en daar kan een redacteur niets aan doen.
    const gezienNm = new Set();
    for (const z of doc.zinnen) {
      if (isVasteZin(z.tekst)) continue;
      const n = norm(z.tekst);
      for (const tref of nietMeldenTref) {
        if (tref.alleenAlsKop) continue;                  // te alledaagse woorden voor de lopende tekst
        if (nmGemeld.has(tref.onderwerp)) continue;      // er staat al een blok over; dat is de melding
        if (magHierStaan(tref, z.h3 || z.h2)) continue;   // de matrix noemt deze rubriek zelf
        if (!tref.re.test(n) || gezienNm.has(tref.onderwerp + '::' + tref.woord)) continue;
        gezienNm.add(tref.onderwerp + '::' + tref.woord);
        b.push(bevinding('tekst-niet-melden', ERNST.letop, 'MX, tab Koppen, richtlijn Niet melden',
          `"${tref.woord}" gaat over ${tref.onderwerp}, en dat onderwerp hoort niet in een reisadvies.`,
          { fragment: z.tekst, kop: z.h3 || z.h2, notitie: tref.toelichting || undefined }));
      }
    }

    for (const z of doc.zinnen) {
      if (isVasteZin(z.tekst)) continue;
      if (z.woorden > lim.zin.max_woorden) {
        // Zit er een link in, dan zit de lengte vaak in de linktekst. Dat los je op door de
        // linktekst in te korten, niet door de zin te splitsen — een eigen kleur dus, zodat de
        // redacteur die twee apart kan aflopen.
        const metLink = doc.links.some((l) => l.tekst && z.tekst.includes(l.tekst));
        b.push(bevinding('zin-max-woorden', metLink ? ERNST.linkzin : ERNST.letop,
          'SW, Begrijpelijkheid > B1',
          `Deze zin telt ${z.woorden} woorden. Maximaal ${lim.zin.max_woorden}.`
            + (metLink ? ' De linktekst telt mee — kort die eerst in.' : ''),
          { fragment: z.tekst, kop: z.h3 || z.h2 }));
      }
      for (const w of wl.twijfeltaal.woorden) {
        if (!new RegExp('\\b' + esc(w) + '\\b', 'i').test(z.tekst)) continue;
        // Twee soorten twijfeltaal, met dezelfde herkomst maar een ander gesprek. "Misschien" en
        // "mogelijk" verzwakken de bewering zelf; daar is bijna altijd een stelliger zin voor.
        // "Regelmatig" en "soms" zeggen hoe váák iets gebeurt, en dat is soms feitelijke nuance:
        // over terroristische groepen kun je niet schrijven dát ze aanslagen plegen. Ze blijven
        // allebei gemeld — de schrijfwijzer noemt "vaak" letterlijk — maar apart te filteren.
        const isFrequentie = frequentieWoorden.has(w.toLowerCase());
        b.push(bevinding(isFrequentie ? 'zin-frequentiewoord' : 'zin-twijfeltaal',
          ERNST.twijfel, 'SW, Begrijpelijkheid > B1',
          isFrequentie
            ? `"${w}" zegt hoe vaak iets gebeurt. Klopt dat hier, of kan het stelliger?`
            : `Twijfeltaal: "${w}".`,
          { fragment: z.tekst, kop: z.h3 || z.h2, ...herkomst(extraTwijfel, w) }));
      }
      const lv = lijdendeVorm(z.tekst);
      if (lv) {
        b.push(bevinding('zin-lijdende-vorm', ERNST.letop, 'SW, Begrijpelijkheid > B1',
          `Lijdende vorm: "${lv[0]} … ${lv[1]}". Schrijf actief.`, { fragment: z.tekst, kop: z.h3 || z.h2 }));
      }
    }

    let reeks = 0;
    for (const z of doc.zinnen) {
      reeks = z.tekst.trim().endsWith('?') ? reeks + 1 : 0;
      if (reeks === lim.vragen.max_opeenvolgend + 1) {
        b.push(bevinding('vragen-opeenvolgend', ERNST.letop, 'SW, Begrijpelijkheid > Vraagvorm',
          `Meer dan ${lim.vragen.max_opeenvolgend} vragen achter elkaar.`, { fragment: z.tekst }));
      }
    }

    const negRe = new RegExp('\\b(' + wl.negatieve_lading.woorden.map(esc).join('|') + ')\\b', 'gi');
    const negTekst = doc.zinnen.filter((z) => !isVasteZin(z.tekst)).map((z) => z.tekst).join(' ');
    const negAantal = (negTekst.match(negRe) || []).length;
    const negWoorden = telWoorden(negTekst);
    if (negWoorden > 100) {
      const dichtheid = (negAantal / negWoorden) * 100;
      if (dichtheid > wl.negatieve_lading.drempel_per_100_woorden) {
        b.push(bevinding('tekst-negatieve-lading', ERNST.info, 'SW, Begrijpelijkheid > Positieve taal',
          `${negAantal} woorden met negatieve lading op ${negWoorden} woorden (${dichtheid.toFixed(1)} per 100). Richtlijn is maximaal ${wl.negatieve_lading.drempel_per_100_woorden}.`,
          { notitie: 'Vaste kleurcode-formuleringen tellen niet mee.', herkomst: 'aanvulling' }));
      }
    }

    // ---------- links ----------
    for (const l of doc.links) {
      // Een link hoort niet tegen het woord ervoor aan te plakken. Dat gaat op drie manieren mis,
      // en alle drie zijn ze alleen hier te zien — in de gelezen tekst is er niets van te merken.
      if (l.plakt) {
        b.push(bevinding('link-plakt-aan-woord', ERNST.fout, 'Tekstcontrole (SpellingSpeurneus)',
          l.spatieBinnen
            ? `De spatie vóór de link staat er binnenin: "${l.tekst.slice(0, 40)}…".`
            : `De link plakt aan het woord ervoor: "${l.tekst.slice(0, 40)}…".`,
          { fragment: l.tekst, herkomst: 'aanvulling',
            notitie: l.spatieBinnen
              ? 'De link begint met een spatie. Op de pagina ziet niemand dat, maar het klikvlak '
                + 'loopt een teken te ver naar links.'
              : 'Er staat geen spatie tussen het woord en de link. Soms valt daardoor de eerste '
                + 'letter van een woord buiten de link ("K" en dan "ijk op de website"), soms '
                + 'plakken twee woorden aan elkaar.' }));
      }
      if (l.tekst.length > lim.link.max_tekens_linktekst && !isVasteLinktekst(l.tekst)) {
        b.push(bevinding('link-tekstlengte', ERNST.letop, 'SW, Gebruiksvriendelijkheid > Lengte linkteksten',
          `Linktekst is ${l.tekst.length} tekens. Maximaal ${lim.link.max_tekens_linktekst}.`, { fragment: l.tekst }));
      }
      const host = (l.href || '').replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
      const verboden = wl.niet_linken_naar.domeinen.find((d) => host === d || host.endsWith('.' + d));
      if (verboden) {
        b.push(bevinding('link-verboden-partij', ERNST.fout, 'SW, Relevantie > Naar wie linken we niet?',
          `Link naar ${host}. We linken niet naar commerciële partijen, politieke partijen, belangenbehartigers of media.`,
          { fragment: l.tekst, ...herkomst(extraDomein, verboden) }));
      }
    }
    const ookNuttig = doc.blokken.find((x) => /ook nuttig/i.test(x.kop || ''));
    if (ookNuttig) {
      const n = ookNuttig.opsommingen.reduce((s, o) => s + o.items.length, 0);
      if (n > lim.ook_nuttig.max_links) {
        b.push(bevinding('link-ook-nuttig-max', ERNST.letop, 'SW, Gebruiksvriendelijkheid > Links onderaan',
          `"Ook nuttig" bevat ${n} links. Richtlijn is maximaal ${lim.ook_nuttig.max_links}.`));
      }
    }

    // ---------- opsommingen en opmaak ----------
    for (const o of doc.opsommingen) {
      for (const item of o.items) {
        if (item.includes(';')) {
          b.push(bevinding('opsomming-puntkomma', ERNST.fout, 'SW, Schrijfregels > Opsommingen',
            'We gebruiken nooit puntkomma\'s in opsommingen.', { fragment: item }));
        }
      }
    }
    for (const t of doc.opmaak.vet) {
      if (t) b.push(bevinding('opmaak-vet-onderstreept', ERNST.letop, 'SW, Schrijfregels > Vet',
        'We maken tekst niet vet.', { fragment: t }));
    }
    for (const t of doc.opmaak.onderstreept) {
      if (t) b.push(bevinding('opmaak-vet-onderstreept', ERNST.letop, 'SW, Schrijfregels > Onderstrepen',
        'We onderstrepen tekst niet.', { fragment: t }));
    }
    for (const t of doc.opmaak.cursief) {
      if (!t) continue;
      const toegestaan = /^laatste update/i.test(t) || telWoorden(t) <= 3;
      if (!toegestaan) {
        b.push(bevinding('opmaak-cursief', ERNST.letop, 'SW, Schrijfregels > Cursief',
          'Cursief mag alleen bij een laatste update en bij een woord in een andere taal.', { fragment: t }));
      }
    }

    // ---------- schrijfregels op tekstniveau ----------
    const regelChecks = [
      // Alleen echte paren tellen: 'veiligheidsrisico's' en 'Bahama's' bevatten een apostrof,
      // geen aanhalingsteken.
      ['aanhalingstekens', ERNST.letop, 'SW, Schrijfregels > Aanhalingstekens',
        /“[^”]{1,200}”|‘[^’]{1,200}’|"[^"]{1,200}"/g,
        (m) => `Aanhalingstekens om ${m.length > 40 ? m.slice(0, 40) + '…' : m}. Gebruik geen aanhalingstekens.`],
      ['percentage-notatie', ERNST.letop, 'SW, Schrijfregels > Percentages',
        /\d+\s+%|\d+\s*procent/gi, (m) => `"${m}" moet als 5% — symbool, zonder spatie.`],
      ['valuta-notatie', ERNST.letop, "SW, Schrijfregels > Euro's / Valuta",
        /€\d[\d.,]*|\d+\s*euro\b|EUR\s*\d[\d.,]*|€\s?\d+,-/gi,
        (m) => `"${m}" schrijven als € met spatie en hele getallen zonder nullen of streepjes, bijvoorbeeld € 9 of € 15,86.`],
      ['tijd-notatie', ERNST.letop, 'SW, Schrijfregels > Tijd',
        /\b0\d\.\d{2}\b|\b\d{1,2}:\d{2}\b/g, (m) => `"${m}" moet als 8.00 uur — punt, geen voorloopnul.`],
      ['datum-notatie', ERNST.letop, 'SW, Schrijfregels > Datum',
        /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g, (m) => `"${m}" moet voluit: 3 januari 2021.`],
      ['telefoon-notatie', ERNST.letop, 'SW, Schrijfregels > Telefoonnummers',
        /\b00\d{2}[\s-]?\d|\(0\)\s?\d/g, (m) => `"${m}" moet met plusteken en landcode: +31 …`],
      ['rangtelwoord-notatie', ERNST.info, 'SW, Schrijfregels > Rangtelwoorden',
        /\b\d+(ste|de)\b/g, (m) => `"${m}" moet als 1e, 2e.`],
      ['schuine-streep', ERNST.info, 'SW, Schrijfregels > Schuine streep',
        /\s\/\s/g, () => 'Gebruik voor en na een schuine streep geen spatie.'],
      ['getallen-cijfers', ERNST.info, 'SW, Schrijfregels > Getallen / Cijfers',
        /\b(twee|drie|vier|vijf|zes|zeven|acht|negen|tien|elf|twaalf|dertien|veertien|vijftien|zestien|zeventien|achttien|negentien|twintig)\b/gi,
        (m) => `"${m}" als cijfer schrijven.`],
    ];
    for (const [id, ernst, bron, re, maakBoodschap] of regelChecks) {
      const gezien = new Set();
      for (const m of tekst.matchAll(re)) {
        if (gezien.has(m[0])) continue;
        const fragment = contextVan(tekst, m.index);
        // Staat de treffer in een vaste formulering, dan is het onze schrijfregel niet: die tekst
        // is zo vastgesteld. Pas als dezelfde notatie elders in eigen tekst staat, melden we hem.
        if (isVasteZin(fragment)) continue;
        gezien.add(m[0]);
        b.push(bevinding(id, ernst, bron, maakBoodschap(m[0]), { fragment }));
      }
    }

    // Duizendtallen apart: telefoonnummers en jaartallen zijn geen "grote getallen".
    const zonderTelefoon = tekst.replace(/(\+|00)\d[\d\s().-]{6,}/g, (m) => ' '.repeat(m.length));
    // Alarm- en servicenummers zijn geen grote getallen: 1155 hoort niet als 1.155 geschreven te
    // worden. Internationale nummers vallen hierboven al weg; lokale nummers herkennen we aan
    // wat er in dezelfde zin vóór staat ("Algemeen alarmnummer: 191 (Toeristen)politie: 1155").
    // Bewust op woorddelen: "alarmnummers" en "Toeristenpolitie" horen er net zo goed bij.
    const TELEFOONWOORDEN = /nummer|number|politie|brandweer|ambulance|hulpdienst|noodgeval|alarm|helpline|hotline|whatsapp|\bbel(t|len)?\b|\bsms\b/i;
    const isTelefoonnummer = (index) => {
      const voor = zonderTelefoon.slice(Math.max(0, index - 80), index);
      const zinDeel = voor.slice(Math.max(voor.lastIndexOf('.'), voor.lastIndexOf('\n')) + 1);
      // Een getal direct achter een dubbele punt is een opgegeven nummer, geen hoeveelheid:
      // "Toeristenpolitie (alleen bereikbaar in New Delhi): 8750871111".
      return /:\s*$/.test(zinDeel) || TELEFOONWOORDEN.test(zinDeel);
    };
    const gezienGetal = new Set();
    for (const m of zonderTelefoon.matchAll(/(?<![\d.,+])[1-9]\d{3,}(?![\d.,])/g)) {
      const n = Number(m[0]);
      if (n >= 1900 && n <= 2100 && m[0].length === 4) continue;   // jaartal
      if (isTelefoonnummer(m.index)) continue;                     // alarm- of servicenummer
      if (gezienGetal.has(m[0])) continue;
      const fragmentGetal = contextVan(tekst, m.index);
      if (isVasteZin(fragmentGetal)) continue;
      gezienGetal.add(m[0]);
      b.push(bevinding('getallen-cijfers', ERNST.info, 'SW, Schrijfregels > Getallen / Cijfers',
        `"${m[0]}" scheiden met een punt per 3 cijfers: ${n.toLocaleString('nl-NL')}.`,
        { fragment: fragmentGetal }));
    }

    for (const [fout, goed] of Object.entries(wl.afkortingen.vervang)) {
      const re = new RegExp('(^|[\\s(])' + esc(fout).replace(/\\\./g, '\\.') + '(?=[\\s,)]|$)', 'gi');
      const m = tekst.match(re);
      if (m) {
        b.push(bevinding('afkortingen-uitschrijven', ERNST.letop, 'SW, Schrijfregels > Afkortingen',
          `"${fout}" uitschrijven als "${goed}" (${m.length}×).`, herkomst(extraAfk, fout)));
      }
    }
    for (const [fout, goed] of Object.entries(wl.eenheden_voluit.vervang)) {
      const re = new RegExp('\\b\\d+\\s?' + esc(fout) + '\\b', 'g');
      const m = tekst.match(re);
      if (m) {
        b.push(bevinding('eenheden-voluit', ERNST.info, 'SW, Schrijfregels > Afstanden/Gewicht/Hoeveelheden',
          `"${m[0]}" voluit schrijven als ${goed}.`,
          { fragment: contextVan(tekst, tekst.indexOf(m[0])), ...herkomst(extraEenheid, fout) }));
      }
    }
    for (const [fout, goed] of Object.entries(wl.vaste_schrijfwijze.vervang)) {
      const re = new RegExp('\\b' + esc(fout.trim()) + '\\b', 'i');
      const m = tekst.match(re);
      if (m) {
        b.push(bevinding('schrijfwijze-vast', ERNST.fout, 'SW, Schrijfregels',
          `"${m[0]}" schrijven we als "${goed.trim()}".`, { fragment: contextVan(tekst, m.index) }));
      }
    }
    for (const w of wl.genderneutraal.woorden) {
      const re = new RegExp('\\b' + esc(w) + '\\b', 'i');
      if (re.test(tekst)) {
        b.push(bevinding('genderneutraal', ERNST.letop, 'SW, Schrijfregels > Gender(neutraal) / lhbtiq+',
          `"${w}" is niet genderneutraal.`,
          { fragment: contextVan(tekst, tekst.search(re)), ...herkomst(extraGender, w) }));
      }
    }
    for (const { patroon, boodschap } of wl.genderneutraal.lhbtiq.patronen) {
      const m = tekst.match(new RegExp(patroon, 'u'));
      if (m) {
        b.push(bevinding('lhbtiq-schrijfwijze', ERNST.letop, 'SW, Schrijfregels > Gender(neutraal) / lhbtiq+',
          boodschap, { fragment: contextVan(tekst, m.index) }));
      }
    }

    // ---------- metadescription en url ----------
    if (doc.metadescription) {
      const n = doc.metadescription.length;
      if (n < lim.metadescription.min_tekens || n > lim.metadescription.max_tekens) {
        b.push(bevinding('metadescription-lengte', ERNST.letop, 'SW, Vindbaarheid > Metadescriptions',
          `De metadescription is ${n} tekens. Richtlijn is ${lim.metadescription.min_tekens}–${lim.metadescription.max_tekens}.`));
      }
    }
    if (doc.url && doc.url.length > lim.url.max_tekens) {
      b.push(bevinding('url-lengte', ERNST.info, 'SW, Schrijfregels > url',
        `De URL is ${doc.url.length} tekens. Richtlijn is maximaal ${lim.url.max_tekens}.`));
    }

    const perRegel = {};
    for (const x of b) perRegel[x.regel] = (perRegel[x.regel] || 0) + 1;

    return {
      bevindingen: b,
      samenvatting: {
        land: doc.land,
        woorden: doc.woorden,
        woordenlimiet: limiet,
        kleurcodes: kleurenInTekst,
        zinnen: doc.zinnen.length,
        fout: b.filter((x) => x.ernst === ERNST.fout).length,
        letop: b.filter((x) => x.ernst === ERNST.letop).length,
        linkzin: b.filter((x) => x.ernst === ERNST.linkzin).length,
        twijfel: b.filter((x) => x.ernst === ERNST.twijfel).length,
        info: b.filter((x) => x.ernst === ERNST.info).length,
        // Hetzelfde nog eens, maar op volgorde en met de ernst als sleutel: daar tekent de
        // pagina de balk mee, zonder de namen nog een keer te hoeven kennen.
        perErnst: Object.fromEntries(ERNST_VOLGORDE.map((e) => [e, b.filter((x) => x.ernst === e).length])),
        perRegel,
      },
      buitenScope: [
        'Politieke gevoeligheden: daar doet de tool geen uitspraak over.',
        'Inkorten: de tool signaleert de overschrijding en wijst de langste blokken aan, maar schrapt niet.',
      ],
    };
  };
}

/** De tekst onder "In het kort": daar geldt de volgorde-regel voor de kleurcodes. */
function kortBlokStukken(doc) {
  const blok = doc.blokken.find((x) => (x.kop || '').trim().toLowerCase() === 'in het kort');
  if (!blok) return [];
  return [...blok.alineas.map((a) => a.tekst), ...blok.opsommingen.flatMap((o) => o.items)];
}

function kortBlokTekst(doc) {
  const stukken = kortBlokStukken(doc);
  return stukken.length ? stukken.join(' ') : null;
}

/** De zin waarin de treffer staat. Een hele zin is bruikbaarder voor de redacteur dan een
 *  afgeknipt tekenvenster, en het maakt bevindingen vergelijkbaar tussen adviezen: dezelfde
 *  standaardzin levert dan letterlijk hetzelfde fragment op. */
function contextVan(tekst, index, marge = 220) {
  if (index == null || index < 0) return '';
  const vanaf = Math.max(0, index - marge);
  const tot = Math.min(tekst.length, index + marge);
  const venster = tekst.slice(vanaf, tot);
  const positie = index - vanaf;

  // Een regeleinde scheidt blokken en lijstitems en knipt dus altijd, ook zonder spatie erachter.
  // Stond dat er niet, dan liep een fragment door in de alinea ervoor: een treffer vlak na een
  // vaste tekst werd dan onterecht als vaste formulering weggestreept.
  let start = 0;
  for (const m of venster.slice(0, positie).matchAll(/[.!?]\s+|\n\s*/g)) start = m.index + m[0].length;
  let eind = venster.length;
  const staart = venster.slice(positie).match(/[.!?\n]/);
  if (staart) eind = positie + staart.index + 1;

  const zin = venster.slice(start, eind).replace(/\s+/g, ' ').trim();
  return zin || venster.replace(/\s+/g, ' ').trim();
}



export { ERNST, ERNST_VOLGORDE };
export default { maakToetser, norm, ERNST, ERNST_VOLGORDE };
