/**
 * De harde regels (laag 1) uit de schrijfwijzer, de format-matrix en het sjabloon.
 *
 * Bronafkortingen in een bevinding: SW = schrijfwijzer, MX = format-matrix, SJ = sjabloon.
 *
 * Elke regel is een pure functie: document in, bevindingen uit. Geen model, geen netwerk,
 * volledig reproduceerbaar. De regeldata komt van buiten (regels/*.json) zodat dezelfde
 * code in Node draait voor de tests en de bulkslag, en in de Artifact voor de redacteur.
 *
 * Wat de tool bewust NIET doet, conform STRATEGY.md:
 *  - geen uitspraak over politieke gevoeligheden
 *  - niet zelf inkorten: wel de overschrijding melden en de langste blokken aanwijzen
 */

import { telWoorden, splitsZinnen } from './parse.js';

const ERNST = { fout: 'fout', letop: 'let-op', info: 'info' };

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

/** Maakt van een sjabloon met {land}/{gebieden} een regex die tegen genormaliseerde tekst matcht. */
function sjabloonRegex(sjabloon, land) {
  let p = esc(norm(sjabloon));
  p = p.replace(/\\\{land\\\}/g, land ? esc(norm(land)) : "[a-z\\u00c0-\\u017f' -]{2,40}");
  p = p.replace(/\\\{gebieden\\\}/g, "[^.]{2,120}");
  return new RegExp(p);
}

/**
 * Als sjabloonRegex, maar zonder ankers: toetst of een vaste tekst érgens in een stuk tekst
 * voorkomt. Kent naast {land} en {gebieden} ook {kleur}, want het sjabloon gebruikt die.
 */
function vasteTekstRegex(sjabloon, land) {
  let p = esc(norm(sjabloon));
  p = p.replace(/\\\{land\\\}/g, land ? '(?:' + esc(norm(land)) + ')' : '[^.?!]{2,45}');
  p = p.replace(/\\\{kleur\\\}/g, '(?:rood|oranje|geel|groen)');
  p = p.replace(/\\\{gebieden\\\}/g, '[^.?!]{2,160}');
  return new RegExp(p);
}

/**
 * De tekst van een rubriek: de kop plus alles wat eronder staat. Een rubriek is soms een H3
 * ("Reisverzekering") en soms een hele H2-sectie ("Wat kan ik doen in een noodsituatie?"),
 * daarom kijken we naar allebei.
 *
 * @returns {string|null} null als de rubriek niet in dit advies staat — dan toetsen we niet.
 */
function rubriekTekst(doc, patroon) {
  const re = new RegExp(patroon, 'i');
  const blokken = doc.blokken.filter((x) => re.test(x.kop || '') || re.test(x.h2 || ''));
  if (!blokken.length) return null;
  return blokken
    .flatMap((x) => [x.kop || '', ...x.alineas.map((a) => a.tekst), ...x.opsommingen.flatMap((o) => o.items)])
    .join(' ');
}

function bevinding(regel, ernst, bron, boodschap, extra = {}) {
  return { regel, ernst, bron, boodschap, ...extra };
}

/**
 * @param {object} data  {matrix, kleurcodes, woordenlijsten, limieten}
 */
export function maakToetser(data) {
  const { matrix, kleurcodes, woordenlijsten: wl, limieten: lim, sjabloon: sj } = data;

  const koppenOpNaam = new Map(matrix.koppen.filter((k) => k.h3).map((k) => [norm(k.h3), k]));

  // Waar het sjabloon de matrix tegenspreekt, meldt de tool het met beide bronnen erbij in
  // plaats van één bron stil te laten winnen. Welke bron voorgaat is een redactionele keuze.
  const conflict = new Map((sj.conflicten_met_matrix || []).map((c) => [norm(c.onderwerp), c]));

  // Lijdende vorm: hulpwerkwoord + voltooid deelwoord in dezelfde zin. Het deelwoord-patroon
  // vangt ook scheidbare werkwoorden ("wordt opgestuurd"); zelfstandige naamwoorden die
  // toevallig op een deelwoord lijken ("gebied", "verkeer") staan op een uitzonderingslijst.
  const hulpRe = new RegExp('\\b(' + wl.lijdende_vorm.hulpwerkwoorden.join('|') + ')\\b', 'iu');
  const deelwoordRe = new RegExp('\\b(' + wl.lijdende_vorm.deelwoord_patroon + ')\\b', 'giu');
  const geenDeelwoord = new Set((wl.lijdende_vorm.geen_deelwoord || []).map((w) => w.toLowerCase()));

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
  const matrixKoppen = new Set(matrix.koppen.flatMap((k) =>
    [k.h3, ...(k.kop_varianten || [])].filter(Boolean).map(norm)));
  // Het sjabloon schrijft daarnaast tussenkoppen letterlijk voor ("Lokale hulpdiensten",
  // "Wat mag ik meenemen naar {land}?"). Die toetsen we net zomin op woordenaantal of
  // leestekens: de richtlijn is daar het sjabloon zelf.
  const isVasteKop = (kop, land) => matrixKoppen.has(norm(kop))
    || (sj.vaste_koppen || []).some((s) => new RegExp('^' + vasteTekstRegex(s, land).source + '$').test(norm(kop)));

  /** De vaste H2's staan in vraagvorm met de landnaam erin; 'in {land}' mag ook 'op {land}'
   *  zijn, want de schrijfwijzer kent die keuze per (ei)land. */
  function isVasteH2(kop, land) {
    const n = norm(kop);
    return matrix.h2_vast.some((sjabloon) => {
      // De landnaam in de kop wijkt legitiem af van het location-veld: adviezen gebruiken
      // afkortingen ("de VAE") en lidwoorden ("op de Bahama's"), en de schrijfwijzer laat
      // per (ei)land in of op toe. Daarom een jokerteken in plaats van de exacte naam.
      const p = esc(norm(sjabloon))
        .replace(/\\\?/g, '\\?')
        .replace(/\b(in|naar) \\\{land\\\}/g, '(?:in|op|naar) [^?]{2,45}')
        .replace(/\\\{land\\\}/g, '[^?]{2,45}');
      return new RegExp('^' + p + '$').test(n);
    });
  }

  /** @returns {{bevindingen: Array, samenvatting: object}} */
  return function toets(doc, opties = {}) {
    const b = [];
    const tekst = doc.volledigeTekst || '';
    const genorm = norm(tekst);
    // "kleurcode groen" en "de kleurcode van het reisadvies voor X is groen" tellen allebei;
    // [^.] houdt de match binnen één zin, zodat twee kleuren niet in elkaar overlopen.
    const kleurenInTekst = kleurcodes.volgorde.filter((k) =>
      new RegExp('kleurcode[^.]{0,80}\\b' + k + '\\b').test(genorm));
    const aantalKleuren = doc.kleurcodes ? doc.kleurcodes.length : kleurenInTekst.length;
    const meerdereKleuren = aantalKleuren > 1;

    // ---------- document ----------
    const limiet = meerdereKleuren ? lim.document.woorden_meerdere_kleurcodes : lim.document.woorden_1_kleurcode;
    if (doc.woorden >= limiet) {
      const langste = [...doc.blokken]
        .filter((x) => x.kop)
        .map((x) => ({
          kop: x.kop,
          woorden: x.alineas.reduce((n, a) => n + a.woorden, 0)
            + x.opsommingen.reduce((n, o) => n + o.items.reduce((m, i) => m + telWoorden(i), 0), 0),
        }))
        .sort((x, y) => y.woorden - x.woorden)
        .slice(0, 3);
      b.push(bevinding('doc-woordenaantal', ERNST.fout, 'MX, tab Richtlijn woordenaantal',
        `Het advies telt ${doc.woorden} woorden. De richtlijn is minder dan ${limiet} bij ${meerdereKleuren ? 'meerdere kleurcodes' : '1 kleurcode'}.`,
        { detail: langste.map((x) => `${x.kop} (${x.woorden} woorden)`),
          notitie: 'De tool wijst de langste blokken aan maar schrapt niet zelf: wat weg kan is een inhoudelijke keuze.' }));
    }

    // ---------- kleurcodes ----------
    // De matrix laat meerdere manieren toe om de kleur aan te duiden (kolom NB), maar de
    // handelingsinstructie erachter ligt vast. Die twee toetsen we daarom apart.
    for (const kleur of kleurenInTekst) {
      const k = kleurcodes.kleuren[kleur];
      if (!k) continue;

      const aangeduid = (kleurcodes.aanduiding_sjablonen || []).some((sj) =>
        sjabloonRegex(sj.replace(/\{kleur\}/g, kleur), doc.land).test(genorm));
      if (!aangeduid) {
        b.push(bevinding('kleur-aanduiding', ERNST.letop, 'MX, tab Kleurcode-teksten, kolom NB',
          `Kleurcode ${kleur} wordt niet op een van de vaste manieren aangeduid.`,
          { verwacht: `De kleurcode van het reisadvies voor ${doc.land || 'land X'} is ${kleur}.` }));
      }

      const heeftActie = (k.actiezinnen || []).some((z) => genorm.includes(norm(z)));
      if (!heeftActie) {
        b.push(bevinding('kleur-vaste-tekst', ERNST.fout, 'MX, tab Kleurcode-teksten',
          `Bij kleurcode ${kleur} ontbreekt de vaste handelingsinstructie.`,
          { verwacht: k.in_het_kort_volledig.replace('{land}', doc.land || 'land X') }));
      }
    }

    // De volgorde rood-naar-groen geldt voor de opsomming in "In het kort", niet voor elke
    // vermelding van een kleur verderop in het advies.
    const kortTekst = kortBlokTekst(doc);
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
      if (bullets.length > sj.limieten.in_het_kort.max_bullets) {
        b.push(bevinding('kort-max-bullets', ERNST.fout, 'SJ, blok In het kort',
          `"In het kort" heeft ${bullets.length} bullets. Het sjabloon staat er maximaal ${sj.limieten.in_het_kort.max_bullets} toe.`));
      }
      const eersteKleur = bullets.find((i) => /kleurcode/i.test(i));
      if (eersteKleur && !/^de kleurcode van het reisadvies voor /.test(norm(eersteKleur))) {
        b.push(bevinding('kleur-eerste-bullet-voluit', ERNST.letop, 'MX, tab Kleurcode-teksten, kolom NB',
          'De eerste bullet over de kleurcode moet voluit: "De kleurcode van het reisadvies voor ... is ...".',
          { fragment: eersteKleur }));
      }
      const gebiedenMatch = tekst.match(/gebieden\s+((?:[A-Z][\wÀ-ſ-]*(?:,\s*|\s+en\s+)){2,}[A-Z][\wÀ-ſ-]*)/);
      if (gebiedenMatch) {
        const n = gebiedenMatch[1].split(/,|\sen\s/).map((s) => s.trim()).filter(Boolean).length;
        if (n > lim.gebieden.max_noemen) {
          b.push(bevinding('gebieden-max-drie', ERNST.letop, 'MX, tab Koppen, rij In het kort',
            `Er worden ${n} gebieden genoemd. Noem er maximaal ${lim.gebieden.max_noemen} en verwijs daarna.`,
            { fragment: gebiedenMatch[0] }));
        }
      }
    }

    // De losse toets op het woord "informatieservice" is vervangen door de vaste tekst uit het
    // sjabloon (regel informatieservice-vaste-tekst), die de hele standaardoproep controleert.

    // ---------- koppen tegen de matrix ----------
    for (const kop of doc.koppen) {
      if (kop.niveau === 2 && !isVasteH2(kop.tekst, doc.land)) {
        b.push(bevinding('h2-vast', ERNST.letop, 'MX, tab Uitleg',
          `"${kop.tekst}" is geen vaste H2. Vast zijn: ${matrix.h2_vast.map((h) => h.replace('{land}', doc.land || 'land X')).join(' / ')}.`,
          { fragment: kop.tekst }));
      }
      if (kop.niveau === 3) {
        const regel = koppenOpNaam.get(norm(kop.tekst));
        if (regel && regel.richtlijn === 'niet-melden') {
          const bots = conflict.get(norm(kop.tekst));
          b.push(bots
            ? bevinding('h3-niet-melden', ERNST.letop, 'MX, tab Koppen · SJ, eigen blok',
              `"${kop.tekst}": de matrix zegt ${bots.matrix}, het nieuwere sjabloon zegt "${bots.sjabloon}".`,
              { fragment: kop.tekst, notitie: bots.gevolg })
            : bevinding('h3-niet-melden', ERNST.fout, 'MX, tab Koppen, richtlijn Niet melden',
              `"${kop.tekst}" hoort niet in een reisadvies.`, { fragment: kop.tekst, notitie: regel.toelichting }));
        }
      }
    }

    const heeftRegionaal = doc.koppen.some((k) => norm(k.tekst) === norm("Regionale risico's"));
    if (heeftRegionaal && !meerdereKleuren) {
      b.push(bevinding('h3-regionaal-alleen-bij-meerdere', ERNST.letop, 'MX, tab Koppen, rij Regionale risico\'s',
        'Regionale risico\'s hoort er alleen te staan bij meer dan 1 kleurcode.'));
    }

    const actueelBlok = doc.blokken.find((x) => norm(x.kop || '') === 'actueel');
    if (actueelBlok) {
      const n = actueelBlok.alineas.reduce((s, a) => s + a.woorden, 0);
      if (n > lim.actueel.max_woorden) {
        b.push(bevinding('actueel-max-woorden', ERNST.fout, 'MX, tab Koppen, rij In het kort',
          `Actueel telt ${n} woorden. Maximaal ${lim.actueel.max_woorden}.`));
      }
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
        if (gezienKf.has(m[0].toLowerCase())) continue;
        gezienKf.add(m[0].toLowerCase());
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
        { fragment: z.tekst, kop: z.h3 || z.h2, verwacht: `de kleurcode voor … is ${m[2].toLowerCase()}` }));
    }

    // ---------- vaste teksten uit het sjabloon ----------
    // Per rubriek legt het sjabloon letterlijke teksten vast. De tool meldt alleen dát een vaste
    // tekst ontbreekt en toont de verwachte formulering. Invullen blijft aan de redacteur: welke
    // variant klopt, hangt af van het land.
    const alleenRood = kleurenInTekst.length === 1 && kleurenInTekst[0] === 'rood';

    if (doc.introIsVeld0 && doc.intro) {
      const introGenorm = norm(doc.intro);
      // De landnaam in de intro wijkt legitiem af van het location-veld: adviezen schrijven
      // "de Bahama's" en "de VAE". De rest van de zin ligt vast en is specifiek genoeg, dus
      // pinnen we de naam niet vast maar laten we er een jokerteken staan.
      const heeftStandaard = vasteTekstRegex(sj.intro.standaard, null).test(introGenorm);
      const heeftRood = vasteTekstRegex(sj.intro.alleen_rood, null).test(introGenorm);
      const verwachteIntro = (alleenRood ? sj.intro.alleen_rood : sj.intro.standaard)
        .replace(/\{land\}/g, doc.land || 'land X');
      if (!heeftStandaard && !heeftRood) {
        b.push(bevinding('intro-vaste-tekst', ERNST.fout, 'SJ, blok Introductie',
          'De intro wijkt af van de vaste introductietekst.', { fragment: doc.intro, verwacht: verwachteIntro }));
      } else if (alleenRood && !heeftRood) {
        b.push(bevinding('intro-vaste-tekst', ERNST.letop, 'SJ, blok Introductie',
          'Dit advies heeft alleen kleurcode rood; daarvoor geldt de afwijkende intro.',
          { fragment: doc.intro, verwacht: verwachteIntro }));
      } else if (!alleenRood && heeftRood) {
        b.push(bevinding('intro-vaste-tekst', ERNST.letop, 'SJ, blok Introductie',
          'De intro is de uitzonderingsvariant voor volledig rode adviezen, maar dit advies heeft meer dan kleurcode rood.',
          { fragment: doc.intro, verwacht: verwachteIntro }));
      }
    }

    for (const vt of sj.vaste_teksten) {
      const bereik = vt.rubriek ? rubriekTekst(doc, sj.rubriek_patronen[vt.rubriek]) : tekst;
      if (bereik === null) continue;                              // rubriek staat niet in dit advies
      const bereikGenorm = norm(bereik);
      if (vt.alleen_als && !new RegExp(vt.alleen_als, 'i').test(bereikGenorm)) continue;
      if (vt.kleur && !vt.kleur.some((k) => kleurenInTekst.includes(k))) continue;
      if (vt.alleen_rood && !alleenRood) continue;
      if (new RegExp(vt.kern, 'i').test(bereikGenorm)) continue;

      b.push(bevinding(vt.id, vt.ernst, vt.bron, vt.boodschap, {
        verwacht: vt.zin.replace(/\{land\}/g, doc.land || 'land X').replace(/\{kleur\}|\{gebieden\}/g, '…'),
      }));
    }

    // ---------- aantal en volgorde van de rubrieken ----------
    for (const [sleutel, label] of [['veiligheidsrisicos', "Welke veiligheidsrisico's zijn er"],
      ['reisvoorbereiding', 'Hoe bereid ik mijn reis voor']]) {
      const re = new RegExp(sj.rubriek_patronen[sleutel], 'i');
      // Actueel en Regionale risico's hebben in het sjabloon een eigen blok en tellen niet mee
      // als risicorubriek; de richtlijn van 6 gaat over de risico's zelf.
      const rubrieken = doc.koppen.filter((k) => k.niveau === 3 && re.test(k.h2 || '')
        && !(sj.geen_rubriek || []).some((g) => norm(g) === norm(k.tekst)));
      if (rubrieken.length > sj.limieten.rubrieken.max_per_h2) {
        b.push(bevinding('rubrieken-max', ERNST.letop, 'SJ, richtlijn boven de rubrieken',
          `Onder "${label}" staan ${rubrieken.length} rubrieken. De richtlijn is maximaal ${sj.limieten.rubrieken.max_per_h2}.`,
          { notitie: 'De rubrieken: ' + rubrieken.map((k) => k.tekst).join(', ') }));
      }
    }

    // De rubrieken onder veiligheidsrisico's staan in volgorde van relevantie. Koppen die het
    // sjabloon niet noemt (een ziekte bijvoorbeeld, die heet naar het virus) laten we staan waar
    // ze staan; die hebben geen vaste plek.
    const volgordeRe = new RegExp(sj.rubriek_patronen.veiligheidsrisicos, 'i');
    const gewenst = sj.rubriek_volgorde.map(norm);
    const opVolgorde = doc.koppen
      .filter((k) => k.niveau === 3 && volgordeRe.test(k.h2 || ''))
      .map((k) => ({ tekst: k.tekst, plek: gewenst.indexOf(norm(k.tekst)) }))
      .filter((x) => x.plek >= 0);
    for (let i = 1; i < opVolgorde.length; i++) {
      if (opVolgorde[i].plek < opVolgorde[i - 1].plek) {
        b.push(bevinding('rubrieken-volgorde', ERNST.letop, 'SJ, blok Risico dat van toepassing is',
          `"${opVolgorde[i].tekst}" staat na "${opVolgorde[i - 1].tekst}".`,
          { fragment: opVolgorde[i].tekst,
            notitie: 'De volgorde van relevantie is: ' + sj.rubriek_volgorde.join(' > ') + '.' }));
        break;
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
      const leestekens = [...doc.titel].filter((c) => /[.,;:!"'()]/.test(c));
      if (leestekens.length) {
        b.push(bevinding('titel-leestekens', ERNST.letop, 'SW, Gebruiksvriendelijkheid > Titel',
          'De titel bevat leestekens. Dat mag alleen bij de vraagvorm.', { fragment: doc.titel }));
      }
    }
    const titelIsVraag = !!doc.titel && doc.titel.trim().endsWith('?');
    if (doc.intro) {
      const n = telWoorden(doc.intro);
      if (n > lim.intro.max_woorden) {
        b.push(bevinding('intro-max-woorden', ERNST.letop, 'SW, Gebruiksvriendelijkheid > Intro',
          `De intro telt ${n} woorden. Richtlijn is maximaal ${lim.intro.max_woorden}.`, { fragment: doc.intro }));
      }
      if (titelIsVraag && doc.intro.trim().split(/(?<=[.?!])\s/)[0].endsWith('?')) {
        b.push(bevinding('intro-geen-vraag-na-vraagtitel', ERNST.letop, 'SW, Gebruiksvriendelijkheid > Intro',
          'De titel is al een vraag, begin de intro dan niet met een vraag.', { fragment: doc.intro }));
      }
    }

    // ---------- tussenkoppen ----------
    // Alleen H3: de H2's zijn door de matrix voorgeschreven vraagvormen en mogen langer zijn.
    // Koppen die de matrix letterlijk voorschrijft ("Paspoort, ID-kaart, rijbewijs") toetsen we
    // niet op woordenaantal of leestekens — de richtlijn is daar de matrix zelf.
    for (const kop of doc.koppen.filter((k) => k.niveau === 3 && !isVasteKop(k.tekst, doc.land))) {
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
    const isVasteZin = (z) => {
      const n = norm(z);
      for (const v of vasteZinnen) {
        const kern = v.replace(/^de kleurcode van het reisadvies voor\s*/, '').trim();
        if (kern.length > 12 && n.includes(kern)) return true;
      }
      return false;
    };

    for (const z of doc.zinnen) {
      if (isVasteZin(z.tekst)) continue;
      if (z.woorden > lim.zin.max_woorden) {
        b.push(bevinding('zin-max-woorden', ERNST.fout, 'SW, Begrijpelijkheid > B1',
          `Deze zin telt ${z.woorden} woorden. Maximaal ${lim.zin.max_woorden}.`, { fragment: z.tekst, kop: z.h3 || z.h2 }));
      }
      for (const w of wl.twijfeltaal.woorden) {
        if (new RegExp('\\b' + esc(w) + '\\b', 'i').test(z.tekst)) {
          b.push(bevinding('zin-twijfeltaal', ERNST.letop, 'SW, Begrijpelijkheid > B1',
            `Twijfeltaal: "${w}".`, { fragment: z.tekst, kop: z.h3 || z.h2 }));
        }
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
          { notitie: 'Vaste kleurcode-formuleringen tellen niet mee.' }));
      }
    }

    // ---------- links ----------
    for (const l of doc.links) {
      if (l.tekst.length > lim.link.max_tekens_linktekst) {
        b.push(bevinding('link-tekstlengte', ERNST.letop, 'SW, Gebruiksvriendelijkheid > Lengte linkteksten',
          `Linktekst is ${l.tekst.length} tekens. Maximaal ${lim.link.max_tekens_linktekst}.`, { fragment: l.tekst }));
      }
      const host = (l.href || '').replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
      const verboden = wl.niet_linken_naar.domeinen.find((d) => host === d || host.endsWith('.' + d));
      if (verboden) {
        b.push(bevinding('link-verboden-partij', ERNST.fout, 'SW, Relevantie > Naar wie linken we niet?',
          `Link naar ${host}. We linken niet naar commerciële partijen, politieke partijen, belangenbehartigers of media.`,
          { fragment: l.tekst }));
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
        gezien.add(m[0]);
        b.push(bevinding(id, ernst, bron, maakBoodschap(m[0]), { fragment: contextVan(tekst, m.index) }));
      }
    }

    // Duizendtallen apart: telefoonnummers en jaartallen zijn geen "grote getallen".
    const zonderTelefoon = tekst.replace(/(\+|00)\d[\d\s().-]{6,}/g, (m) => ' '.repeat(m.length));
    const gezienGetal = new Set();
    for (const m of zonderTelefoon.matchAll(/(?<![\d.,+])[1-9]\d{3,}(?![\d.,])/g)) {
      const n = Number(m[0]);
      if (n >= 1900 && n <= 2100 && m[0].length === 4) continue;   // jaartal
      if (gezienGetal.has(m[0])) continue;
      gezienGetal.add(m[0]);
      b.push(bevinding('getallen-cijfers', ERNST.info, 'SW, Schrijfregels > Getallen / Cijfers',
        `"${m[0]}" scheiden met een punt per 3 cijfers: ${n.toLocaleString('nl-NL')}.`,
        { fragment: contextVan(tekst, m.index) }));
    }

    for (const [fout, goed] of Object.entries(wl.afkortingen.vervang)) {
      const re = new RegExp('(^|[\\s(])' + esc(fout).replace(/\\\./g, '\\.') + '(?=[\\s,)]|$)', 'gi');
      const m = tekst.match(re);
      if (m) {
        b.push(bevinding('afkortingen-uitschrijven', ERNST.letop, 'SW, Schrijfregels > Afkortingen',
          `"${fout}" uitschrijven als "${goed}" (${m.length}×).`));
      }
    }
    for (const [fout, goed] of Object.entries(wl.eenheden_voluit.vervang)) {
      const re = new RegExp('\\b\\d+\\s?' + esc(fout) + '\\b', 'g');
      const m = tekst.match(re);
      if (m) {
        b.push(bevinding('eenheden-voluit', ERNST.info, 'SW, Schrijfregels > Afstanden/Gewicht/Hoeveelheden',
          `"${m[0]}" voluit schrijven als ${goed}.`, { fragment: contextVan(tekst, tekst.indexOf(m[0])) }));
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
          `"${w}" is niet genderneutraal.`, { fragment: contextVan(tekst, tekst.search(re)) }));
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
        info: b.filter((x) => x.ernst === ERNST.info).length,
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
function kortBlokTekst(doc) {
  const blok = doc.blokken.find((x) => (x.kop || '').trim().toLowerCase() === 'in het kort');
  if (!blok) return null;
  return [...blok.alineas.map((a) => a.tekst), ...blok.opsommingen.flatMap((o) => o.items)].join(' ');
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

  let start = 0;
  for (const m of venster.slice(0, positie).matchAll(/[.!?\n]\s+/g)) start = m.index + m[0].length;
  let eind = venster.length;
  const staart = venster.slice(positie).match(/[.!?\n]/);
  if (staart) eind = positie + staart.index + 1;

  const zin = venster.slice(start, eind).replace(/\s+/g, ' ').trim();
  return zin || venster.replace(/\s+/g, ' ').trim();
}

export { ERNST };
export default { maakToetser, norm, ERNST };
