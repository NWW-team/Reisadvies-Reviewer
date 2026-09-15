/**
 * Bouwt docs/index.html: de versie van de tool die op GitHub Pages draait.
 *
 * reisadvies-reviewer.html is geschreven als Artifact-fragment: het begint met een
 * <title> en een <style> en heeft geen <html>, <head> of <body>. Voor Pages moet er
 * een compleet document omheen, met daarin config.js en toegang.js vóór de scripts
 * van de pagina zelf — die vragen namelijk om window.claude.
 *
 * De pagina zelf wordt niet aangepast. Dat is met opzet: er is al een variant te
 * veel in deze repo, en er moet er niet nog een bij.
 *
 *   node scripts/bouw-site.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');
const bron = readFileSync(join(wortel, 'reisadvies-reviewer.html'), 'utf8');

const eindeStijl = bron.indexOf('</style>');
if (eindeStijl === -1) throw new Error('Geen </style> gevonden; klopt de vorm van de bronpagina nog?');

const kop = bron.slice(0, eindeStijl + '</style>'.length);
const romp = bron.slice(eindeStijl + '</style>'.length);

const uit = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
${kop}
</head>
<body>
<!-- Gegenereerd door scripts/bouw-site.mjs uit reisadvies-reviewer.html. Niet met de hand bijwerken. -->
<script src="config.js"></script>
<script src="toegang.js"></script>
${romp}
</body>
</html>
`;

writeFileSync(join(wortel, 'docs', 'index.html'), uit);
console.log('docs/index.html geschreven (' + uit.length + ' tekens)');
