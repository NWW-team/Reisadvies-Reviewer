/**
 * Zet een respons van de open data v2 API om naar de velden die de toetser nodig heeft.
 *
 * De API levert XML (content-type application/xml), niet JSON. Vorm, vastgesteld op een
 * echte respons (data/voorbeeld/CZE.xml):
 *
 *   <document>
 *     <id>CZE</id> <type>reisadvies</type>
 *     <canonical>…</canonical> <location>Tsjechië</location> <isocode>CZE</isocode>
 *     <title><![CDATA[Reisadvies Tsjechië | Ministerie van Buitenlandse Zaken]]></title>
 *     <introduction><![CDATA[<h2>In het kort</h2><p>…</p>]]></introduction>
 *     <content>
 *       <category>
 *         <name>Welke veiligheidsrisico's zijn er in Tsjechië?</name>   ← H2, in vraagvorm
 *         <contentblock>
 *           <paragraphtitle>Criminaliteit</paragraphtitle>              ← H3
 *           <paragraph><![CDATA[<p>…</p>]]></paragraph>                 ← HTML
 *         </contentblock>
 *       </category>
 *     </content>
 *     <additionalinformation><![CDATA[<h2>Ook nuttig</h2>…]]></additionalinformation>
 *     <modificationdate>…</modificationdate> <lastmodified>…</lastmodified>
 *   </document>
 *
 * De categorieën en contentblocks worden teruggevouwen tot één HTML-stroom met h2/h3, zodat
 * src/parse.js er hetzelfde mee kan als met geplakte tekst uit het cms.
 */

const KLEUREN = ['groen', 'geel', 'oranje', 'rood'];

function decodeer(s) {
  return (s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Inhoud van het eerste element met deze naam, CDATA uitgepakt. */
function veld(xml, naam) {
  const m = xml.match(new RegExp(`<${naam}(?:\\s[^>]*)?>([\\s\\S]*?)</${naam}>`));
  return m ? decodeer(m[1]).trim() : null;
}

function* alleElementen(xml, naam) {
  const re = new RegExp(`<${naam}(?:\\s[^>]*)?>([\\s\\S]*?)</${naam}>`, 'g');
  for (const m of xml.matchAll(re)) yield m[1];
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * @param {string} xml  de ruwe respons
 * @returns {{land, titel, url, html, kleurcodes, gewijzigd, herkomst}}
 */
export function uitApiRespons(xml) {
  if (typeof xml !== 'string') throw new TypeError('uitApiRespons verwacht de ruwe XML als string');

  const titelRuw = veld(xml, 'title');
  // "Reisadvies Tsjechië | Ministerie van Buitenlandse Zaken" -> het deel voor de pijp is de titel
  const titel = titelRuw ? titelRuw.split('|')[0].trim() : null;

  const introductie = veld(xml, 'introduction') || '';
  const extra = veld(xml, 'additionalinformation') || '';

  const contentXml = (xml.match(/<content>([\s\S]*)<\/content>/) || [])[1] || '';
  const stukken = [introductie];

  for (const categorie of alleElementen(contentXml, 'category')) {
    const naam = veld(categorie, 'name');
    if (naam) stukken.push(`<h2>${escapeHtml(naam)}</h2>`);
    for (const blok of alleElementen(categorie, 'contentblock')) {
      const kop = veld(blok, 'paragraphtitle');
      if (kop) stukken.push(`<h3>${escapeHtml(kop)}</h3>`);
      for (const alinea of alleElementen(blok, 'paragraph')) stukken.push(decodeer(alinea));
    }
  }
  stukken.push(extra);

  const html = stukken.filter((s) => s && s.trim()).join('\n');
  const kleurcodes = KLEUREN.filter((k) => new RegExp('kleurcode[^.]{0,80}\\b' + k + '\\b', 'i').test(html));

  return {
    land: veld(xml, 'location'),
    isocode: veld(xml, 'isocode') || veld(xml, 'id'),
    locationKey: veld(xml, 'locationkey'),
    titel,
    url: veld(xml, 'canonical'),
    html,
    kleurcodes,
    gewijzigd: veld(xml, 'modificationdate'),
    laatstGewijzigd: veld(xml, 'lastmodified'),
    herkomst: {
      titel: 'title (deel voor de pijp)',
      land: 'location',
      url: 'canonical',
      html: 'introduction + content/category/contentblock/paragraph + additionalinformation',
      kleurcodes: 'afgeleid uit de tekst',
    },
  };
}

export default { uitApiRespons };
