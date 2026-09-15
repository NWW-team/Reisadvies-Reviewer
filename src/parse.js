/**
 * Zet een reisadvies om naar een genormaliseerd document waar de regels op toetsen.
 *
 * Draait ongewijzigd in Node (tests, bulkslag) en in de browser (de Artifact-pagina),
 * daarom geen DOM en geen dependencies. De HTML die het cms levert is beperkt
 * (koppen, alinea's, lijsten, links, opmaak), dus een kleine tokenizer volstaat.
 */

const BLOKTAGS = new Set(['h1', 'h2', 'h3', 'h4', 'p', 'li', 'ul', 'ol', 'div', 'section', 'br', 'table', 'tr', 'td', 'th']);
const OPMAAKTAGS = { b: 'vet', strong: 'vet', i: 'cursief', em: 'cursief', u: 'onderstreept' };

/** Afkortingen waarna een punt géén zinseinde is. */
const AFKORTINGEN = ['bijv', 'etc', 'e.d', 'o.a', 'm.b.t', 'i.v.m', 'd.w.z', 'n.a.v', 'z.s.m', 'evt', 'incl',
  'excl', 'max', 'min', 'ca', 't.o.v', 'i.p.v', 'a.u.b', 'nr', 'dhr', 'mw', 'drs', 'ir', 'mr'];

function decodeEntities(s) {
  const map = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', euro: '\u20ac',
    eacute: '\u00e9', egrave: '\u00e8', euml: '\u00eb', iuml: '\u00ef', ouml: '\u00f6',
    uuml: '\u00fc', auml: '\u00e4', ccedil: '\u00e7', rsquo: '\u2019', lsquo: '\u2018',
    ldquo: '\u201c', rdquo: '\u201d', ndash: '\u2013', mdash: '\u2014', hellip: '\u2026' };
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in map ? map[n.toLowerCase()] : m));
}

function schoon(s) {
  return decodeEntities(s).replace(/\s+/g, ' ').trim();
}

function isHtml(invoer) {
  return /<(h[1-4]|p|ul|ol|li|div|br|a|strong|em)\b/i.test(invoer);
}

/**
 * Splitst een string in tokens: {type:'tag'|'tekst', ...}.
 */
function tokeniseer(html) {
  const zonderRuis = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
  const tokens = [];
  const re = /<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi;
  let laatste = 0;
  let m;
  while ((m = re.exec(zonderRuis)) !== null) {
    if (m.index > laatste) tokens.push({ type: 'tekst', waarde: zonderRuis.slice(laatste, m.index) });
    tokens.push({
      type: 'tag',
      naam: m[1].toLowerCase(),
      sluit: m[0].startsWith('</'),
      attrs: m[2] || '',
    });
    laatste = m.index + m[0].length;
  }
  if (laatste < zonderRuis.length) tokens.push({ type: 'tekst', waarde: zonderRuis.slice(laatste) });
  return tokens;
}

function attr(attrs, naam) {
  const m = attrs.match(new RegExp(naam + '\\s*=\\s*("([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'));
  return m ? decodeEntities(m[2] ?? m[3] ?? m[4] ?? '') : null;
}

/**
 * Splitst een alinea in zinnen. Houdt rekening met afkortingen, getallen (1.500),
 * tijden (8.00 uur) en het feit dat een vraagteken wél een zinseinde is.
 */
export function splitsZinnen(tekst) {
  const zinnen = [];
  let huidig = '';
  for (let i = 0; i < tekst.length; i++) {
    const c = tekst[i];
    huidig += c;
    if (c !== '.' && c !== '!' && c !== '?') continue;

    const rest = tekst.slice(i + 1);
    if (!/^\s/.test(rest) && rest !== '') continue;          // geen spatie erna: geen zinseinde
    if (c === '.') {
      const voor = huidig.slice(0, -1);
      const laatsteWoord = (voor.match(/([\w.\u00c0-\u017f]+)$/) || [])[1] || '';
      if (AFKORTINGEN.includes(laatsteWoord.toLowerCase())) continue;
      if (/\d$/.test(voor) && /^\s*\d/.test(rest)) continue;  // 1.500 of 8.00
    }
    if (rest !== '' && !/^\s+["'(\u2018\u201c]?[A-Z\u00c0-\u00dd\d]/.test(rest)) continue;
    zinnen.push(huidig.trim());
    huidig = '';
  }
  if (huidig.trim()) zinnen.push(huidig.trim());
  return zinnen.filter(Boolean);
}

export function telWoorden(tekst) {
  if (!tekst) return 0;
  return (tekst.match(/[\p{L}\p{N}]+(?:[-'\u2019][\p{L}\p{N}]+)*/gu) || []).length;
}

/**
 * @param {string} invoer      HTML of platte tekst van het reisadvies
 * @param {object} [meta]      {titel, land, metadescription, url, kleurcodes:[...]}
 * @returns genormaliseerd document
 */
export function parseAdvies(invoer, meta = {}) {
  const doc = {
    land: meta.land || null,
    titel: meta.titel || null,
    metadescription: meta.metadescription || null,
    url: meta.url || null,
    kleurcodes: meta.kleurcodes || null,
    intro: null,
    introIsVeld0: false,
    blokken: [],
    links: [],
    opmaak: { vet: [], cursief: [], onderstreept: [] },
    bron: isHtml(invoer) ? 'html' : 'tekst',
  };

  const blokken = doc.blokken;
  let huidigH2 = null;
  let huidigH3 = null;

  function blokVoorInhoud() {
    if (blokken.length === 0) {
      blokken.push({ niveau: 0, kop: null, h2: null, h3: null, alineas: [], opsommingen: [], onderdelen: [] });
    }
    return blokken[blokken.length - 1];
  }

  function nieuwBlok(niveau, kop) {
    if (niveau === 2) { huidigH2 = kop; huidigH3 = null; }
    if (niveau === 3) huidigH3 = kop;
    blokken.push({ niveau, kop, h2: niveau === 2 ? kop : huidigH2, h3: niveau === 3 ? kop : null,
      alineas: [], opsommingen: [], onderdelen: [] });
  }

  // alineas en opsommingen staan apart omdat de meeste regels maar een van de twee nodig hebben.
  // onderdelen houdt daarnaast de documentvolgorde vast: nodig zodra een regel wil weten wat
  // ónder wat staat (de Informatieservice hoort onderaan "In het kort"), en om het advies in
  // dezelfde volgorde te tonen als waarin het geschreven is.
  function voegAlinea(blok, alinea) {
    blok.alineas.push(alinea);
    blok.onderdelen.push({ soort: 'alinea', alinea });
    return alinea;
  }

  function voegOpsomming(blok, opsomming) {
    blok.opsommingen.push(opsomming);
    blok.onderdelen.push({ soort: 'opsomming', opsomming });
    return opsomming;
  }

  if (doc.bron === 'tekst') {
    // Platte tekst: lege regel scheidt alinea's, een regel die eindigt zonder leesteken
    // en kort is behandelen we niet automatisch als kop — dat zou raden zijn.
    for (const stuk of invoer.split(/\n\s*\n/)) {
      const t = schoon(stuk);
      if (!t) continue;
      const bullets = stuk.split('\n').filter((r) => /^\s*[-*\u2022]/.test(r));
      if (bullets.length > 1) {
        voegOpsomming(blokVoorInhoud(), { items: bullets.map((b) => schoon(b.replace(/^\s*[-*\u2022]\s*/, ''))) });
      } else {
        voegAlinea(blokVoorInhoud(), { tekst: t, zinnen: splitsZinnen(t), woorden: telWoorden(t) });
      }
    }
  } else {
    const tokens = tokeniseer(invoer);
    let buffer = '';
    let context = null;              // 'h1'|'h2'|'h3'|'p'|'li'
    let linkOpen = null;
    const opmaakStack = [];
    let lijst = null;

    const spoel = () => {
      const t = schoon(buffer);
      buffer = '';
      if (!t) return;
      if (context === 'h1') { if (!doc.titel) doc.titel = t; return; }
      if (context === 'h2') { nieuwBlok(2, t); return; }
      if (context === 'h3') { nieuwBlok(3, t); return; }
      if (context === 'li') { if (lijst) lijst.items.push(t); return; }
      voegAlinea(blokVoorInhoud(), { tekst: t, zinnen: splitsZinnen(t), woorden: telWoorden(t) });
    };

    for (const tok of tokens) {
      if (tok.type === 'tekst') {
        buffer += tok.waarde;
        if (linkOpen) linkOpen.tekst += tok.waarde;
        for (const soort of opmaakStack) doc.opmaak[soort].push(schoon(tok.waarde));
        continue;
      }
      const { naam, sluit, attrs } = tok;

      if (naam === 'a') {
        if (!sluit) linkOpen = { tekst: '', href: attr(attrs, 'href'), h2: huidigH2, h3: huidigH3 };
        else if (linkOpen) {
          linkOpen.tekst = schoon(linkOpen.tekst);
          if (linkOpen.tekst) doc.links.push(linkOpen);
          linkOpen = null;
        }
        continue;
      }
      if (naam in OPMAAKTAGS) {
        if (!sluit) opmaakStack.push(OPMAAKTAGS[naam]);
        else opmaakStack.pop();
        continue;
      }
      if (naam === 'ul' || naam === 'ol') {
        if (!sluit) { spoel(); lijst = { items: [], geordend: naam === 'ol', h2: huidigH2, h3: huidigH3 }; }
        else if (lijst) { spoel(); voegOpsomming(blokVoorInhoud(), lijst); lijst = null; }
        continue;
      }
      if (!BLOKTAGS.has(naam)) continue;

      spoel();
      if (sluit) { context = null; continue; }
      if (naam === 'h1' || naam === 'h2' || naam === 'h3') context = naam;
      else if (naam === 'li') context = 'li';
      else if (naam === 'p' || naam === 'div') context = 'p';
      else context = null;
    }
    spoel();
    if (lijst) voegOpsomming(blokVoorInhoud(), lijst);
  }

  // De intro is de eerste alinea vóór de eerste H2. Begint het advies meteen met een H2, dan
  // levert het cms het introveld niet mee en is de eerste alinea de tekst ónder die kop.
  // introIsVeld0 houdt dat verschil vast, zodat de toets op de vaste introtekst uit het sjabloon
  // niet losgaat op de eerste bullet van "In het kort".
  const eerste = blokken[0];
  if (eerste && eerste.niveau === 0 && eerste.alineas.length) {
    doc.intro = eerste.alineas[0].tekst;
    doc.introIsVeld0 = true;
  } else if (eerste && eerste.niveau === 2 && blokken[0].alineas.length) {
    doc.intro = blokken[0].alineas[0].tekst;
  }

  doc.alineas = blokken.flatMap((b) => b.alineas.map((a) => ({ ...a, h2: b.h2, h3: b.h3, kop: b.kop })));
  doc.zinnen = doc.alineas.flatMap((a) => a.zinnen.map((z) => ({ tekst: z, woorden: telWoorden(z), h2: a.h2, h3: a.h3 })));
  doc.opsommingen = blokken.flatMap((b) => b.opsommingen.map((o) => ({ ...o, h2: b.h2, h3: b.h3 })));
  doc.koppen = blokken.filter((b) => b.niveau > 0).map((b) => ({ niveau: b.niveau, tekst: b.kop, h2: b.h2 }));
  doc.woorden = doc.alineas.reduce((n, a) => n + a.woorden, 0)
    + doc.opsommingen.reduce((n, o) => n + o.items.reduce((m, i) => m + telWoorden(i), 0), 0)
    + doc.koppen.reduce((n, k) => n + telWoorden(k.tekst), 0);
  doc.volledigeTekst = [
    doc.titel || '',
    ...blokken.flatMap((b) => [b.kop || '', ...b.alineas.map((a) => a.tekst), ...b.opsommingen.flatMap((o) => o.items)]),
  ].filter(Boolean).join('\n');

  return doc;
}

export default { parseAdvies, splitsZinnen, telWoorden };
