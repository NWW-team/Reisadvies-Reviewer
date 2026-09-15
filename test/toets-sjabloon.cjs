const laad = require('./harnas.cjs');
const { Parse, Regels, REGELDATA, VOORBEELDEN } = laad(process.argv[2] || require('path').join(__dirname, '..', 'reisadvies-reviewer.html'));
const toetser = Regels.maakToetser(REGELDATA);
const sj = REGELDATA.sjabloon;
const NIEUW = new Set(['intro-vaste-tekst', 'kleur-formulering-verboden', 'kort-max-bullets',
  'rubrieken-max', 'rubrieken-volgorde', 'nood-contactnummer',
  ...sj.vaste_teksten.map((v) => v.id)]);

for (const v of VOORBEELDEN) {
  const doc = Parse.parseAdvies(v.html, { land: v.land });
  const r = toetser(doc);
  console.log('\n########## ' + v.land);
  const aanwezig = Object.entries(sj.rubriek_patronen)
    .filter(([, p]) => doc.blokken.some((x) => new RegExp(p, 'i').test(x.kop || '') || new RegExp(p, 'i').test(x.h2 || '')))
    .map(([k]) => k);
  console.log('rubrieken gevonden: ' + aanwezig.join(', '));
  console.log('koppen: ' + doc.koppen.map((k) => 'h' + k.niveau + ':' + k.tekst).join(' | '));
  const nieuw = r.bevindingen.filter((x) => NIEUW.has(x.regel));
  console.log('--- ' + nieuw.length + ' sjabloonbevindingen');
  for (const x of nieuw) {
    console.log(' [' + x.ernst + '] ' + x.regel + ' — ' + x.boodschap);
    if (x.verwacht) console.log('     verwacht: ' + x.verwacht);
    if (x.fragment) console.log('     fragment: ' + String(x.fragment).slice(0, 130));
    if (x.notitie) console.log('     notitie:  ' + x.notitie);
  }
}
