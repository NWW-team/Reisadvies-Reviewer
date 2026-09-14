/**
 * Haalt uit een ruwe API-respons de velden die de toetser nodig heeft.
 *
 * VOORLOPIG: de responsvorm van de open data v2 API is bij het schrijven hiervan niet
 * waargenomen — de ontwikkelomgeving kan de host niet bereiken. Deze adapter raadt daarom
 * niet één vaste vorm, maar zoekt de velden op en rapporteert per veld waar hij ze vond,
 * zodat een mens kan controleren of dat klopt. Zodra één echte respons bekend is, kan dit
 * vervangen worden door een directe mapping.
 */

const HTML_KENMERK = /<(p|h2|h3|ul|li|div|br)\b/i;
const KLEUREN = ['groen', 'geel', 'oranje', 'rood'];

const TITELVELDEN = ['title', 'titel', 'name', 'naam', 'heading', 'kop'];
const URLVELDEN = ['url', 'link', 'canonical', 'canonicalurl', 'permalink'];
const LANDVELDEN = ['country', 'land', 'countryname', 'landnaam', 'location', 'locationkey'];
const INHOUDVELDEN = ['content', 'inhoud', 'body', 'text', 'tekst', 'description', 'html', 'value'];

/** Loopt de hele boom af en levert [pad, waarde] voor elke string. */
function* strings(node, pad = []) {
  if (node == null) return;
  if (typeof node === 'string') { yield [pad.join('.'), node]; return; }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) yield* strings(node[i], [...pad, i]);
    return;
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) yield* strings(v, [...pad, k]);
  }
}

const laatsteSleutel = (pad) => String(pad).split('.').filter((s) => !/^\d+$/.test(s)).pop() || '';

function kiesOpSleutel(alle, kandidaten, { minLengte = 1, maxLengte = Infinity } = {}) {
  for (const veld of kandidaten) {
    const treffer = alle.find(([pad, waarde]) => laatsteSleutel(pad).toLowerCase() === veld
      && waarde.trim().length >= minLengte && waarde.trim().length <= maxLengte);
    if (treffer) return { waarde: treffer[1].trim(), pad: treffer[0] };
  }
  return null;
}

/**
 * @param {object} ruw   de opgeslagen respons ({iso, locationKey, data} of de body zelf)
 * @returns {{land, titel, url, html, kleurcodes, herkomst}}
 */
export function uitApiRespons(ruw) {
  const body = ruw && ruw.data !== undefined ? ruw.data : ruw;
  const alle = [...strings(body)];
  const herkomst = {};

  // Inhoud: alle HTML-achtige stukken, in documentvolgorde aan elkaar. Zo blijven adviezen
  // die per kop een eigen veld hebben ook compleet.
  const htmlStukken = alle.filter(([, v]) => HTML_KENMERK.test(v));
  let html;
  if (htmlStukken.length) {
    html = htmlStukken.map(([, v]) => v).join('\n');
    herkomst.html = htmlStukken.map(([p]) => p);
  } else {
    const inhoud = kiesOpSleutel(alle, INHOUDVELDEN, { minLengte: 200 });
    const langste = alle.slice().sort((a, b) => b[1].length - a[1].length)[0];
    html = inhoud ? inhoud.waarde : (langste ? langste[1] : '');
    herkomst.html = [inhoud ? inhoud.pad : (langste ? langste[0] : '(niets gevonden)')];
    herkomst.html_waarschuwing = 'Geen HTML herkend; op lengte gekozen. Controleer dit veld.';
  }

  const titel = kiesOpSleutel(alle, TITELVELDEN, { maxLengte: 200 });
  const url = kiesOpSleutel(alle, URLVELDEN);
  const land = kiesOpSleutel(alle, LANDVELDEN, { maxLengte: 100 });
  if (titel) herkomst.titel = titel.pad;
  if (url) herkomst.url = url.pad;
  if (land) herkomst.land = land.pad;

  // Kleurcodes: expliciete velden gaan voor op wat er in de lopende tekst staat.
  const kleurVelden = alle.filter(([pad, v]) => /colou?r|kleur|code|level|niveau|status/i.test(laatsteSleutel(pad))
    && KLEUREN.includes(v.trim().toLowerCase()));
  let kleurcodes = [...new Set(kleurVelden.map(([, v]) => v.trim().toLowerCase()))];
  if (kleurcodes.length) herkomst.kleurcodes = [...new Set(kleurVelden.map(([p]) => p))];
  else {
    kleurcodes = KLEUREN.filter((k) => new RegExp('kleurcode[^.]{0,80}\\b' + k + '\\b', 'i').test(html));
    herkomst.kleurcodes = ['(afgeleid uit de lopende tekst)'];
  }

  return {
    land: land ? land.waarde : (ruw && ruw.locationKey) || null,
    titel: titel ? titel.waarde : null,
    url: url ? url.waarde : (ruw && ruw.bron) || null,
    html,
    kleurcodes,
    herkomst,
  };
}

export default { uitApiRespons };
