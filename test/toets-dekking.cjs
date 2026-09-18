const laad = require('./harnas.cjs');
const { Parse, Regels, REGELDATA, VOORBEELDEN } = laad(process.argv[2] || require('path').join(__dirname, '..', 'dist', 'app.html'));
const toetser = Regels.maakToetser(REGELDATA);
const sj = REGELDATA.sjabloon;

// 1) Status van elke vaste tekst per voorbeeld: raakt geen enkele regel stilletjes buiten beeld?
console.log('=== dekking van de vaste teksten op de drie voorbeelden ===');
const status = {};
for (const v of VOORBEELDEN) {
  const doc = Parse.parseAdvies(v.html, { land: v.land });
  const gemeld = new Set(toetser(doc).bevindingen.map((x) => x.regel));
  for (const vt of sj.vaste_teksten) {
    const re = vt.rubriek ? new RegExp(sj.rubriek_patronen[vt.rubriek], 'i') : null;
    const heeftRubriek = !re || doc.blokken.some((x) => re.test(x.kop || '') || re.test(x.h2 || ''));
    const s = !heeftRubriek ? 'n.v.t.' : gemeld.has(vt.id) ? 'GEMELD' : 'ok';
    (status[vt.id] = status[vt.id] || []).push(v.land.slice(0, 3) + ':' + s);
  }
}
for (const [id, rijen] of Object.entries(status)) console.log('  ' + id.padEnd(32) + rijen.join('  '));

// 2) Een testadvies dat elke nieuwe regel overtreedt.
const slecht = `
<p>Dit reisadvies gaat over Testland en is bedoeld voor reizigers.</p>
<h2>In het kort</h2>
<ul>
<li>Er is onrust in de hoofdstad.</li>
<li>De kleurcode van het reisadvies voor Testland is oranje. Reis alleen hierheen als het noodzakelijk is.</li>
<li>Voor de gele gebieden in het noorden geldt een ander advies.</li>
<li>De hoofdstad is oranje en het zuiden is groen.</li>
<li>Een vijfde bullet die er niet hoort te staan.</li>
</ul>
<h2>Welke veiligheidsrisico's zijn er in Testland?</h2>
<h3>Actueel</h3><p>Er is onrust.</p>
<h3>Regionale risico's</h3>
<p>Rode gebieden liggen in het noorden.</p>
<h3>Demonstraties</h3><p>Er zijn demonstraties.</p>
<h3>Terrorisme</h3><p>Er is dreiging.</p>
<h3>Criminaliteit</h3><p>Er zijn zakkenrollers in de grote steden.</p>
<h3>Natuurgeweld</h3><p>Er zijn overstromingen.</p>
<h3>Landmijnen</h3><p>Er liggen landmijnen.</p>
<h2>Wat kan ik doen in een noodsituatie?</h2>
<h3>In geval van nood</h3>
<p>Bel de ambassade op +31 70 348 6486 als u hulp nodig heeft.</p>
<h2>Hoe bereid ik mijn reis naar Testland voor?</h2>
<h3>Reisverzekering</h3><p>Denk aan een verzekering.</p>
<h3>Medicijnen</h3><p>Neem uw pillen mee.</p>
<h3>Bagageregels</h3><p>Let op de regels.</p>
`;
const doc = Parse.parseAdvies(slecht, { land: 'Testland' });
const r = toetser(doc);
console.log('\n=== testadvies: welke nieuwe regels vuren ===');
const nieuw = new Set(['intro-vaste-tekst', 'kleur-formulering-verboden', 'kort-max-bullets',
  'rubrieken-max', 'rubrieken-volgorde', 'nood-contactnummer', ...sj.vaste_teksten.map((v) => v.id)]);
for (const x of r.bevindingen.filter((y) => nieuw.has(y.regel))) {
  console.log(' [' + x.ernst + '] ' + x.regel + ' — ' + x.boodschap
    + (x.fragment ? '\n     fragment: ' + String(x.fragment).slice(0, 110) : '')
    + (x.verwacht ? '\n     verwacht: ' + String(x.verwacht).slice(0, 110) : ''));
}
