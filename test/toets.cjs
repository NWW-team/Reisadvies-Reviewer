const laad = require('./harnas.cjs');
const { Parse, Regels, REGELDATA, VOORBEELDEN } = laad(process.argv[2] || require('path').join(__dirname, '..', 'reisadvies-reviewer.html'));
const toetser = Regels.maakToetser(REGELDATA);
const filter = process.argv[3];
for (const v of VOORBEELDEN) {
  const doc = Parse.parseAdvies(v.html, { land: v.land });
  const r = toetser(doc);
  console.log('\n===== ' + v.land + ' (' + v.kenmerk + ') — ' + doc.woorden + ' woorden, kleuren: ' + r.samenvatting.kleurcodes.join('/'));
  const per = {};
  for (const b of r.bevindingen) per[b.regel] = (per[b.regel] || 0) + 1;
  console.log('fout=' + r.samenvatting.fout, 'letop=' + r.samenvatting.letop, 'info=' + r.samenvatting.info);
  console.log(Object.entries(per).sort((a, b) => b[1] - a[1]).map(([k, n]) => k + '×' + n).join(', '));
  if (filter) {
    for (const b of r.bevindingen.filter((x) => x.regel.includes(filter))) {
      console.log('   [' + b.ernst + '] ' + b.regel + ': ' + b.boodschap
        + (b.verwacht ? '\n       verwacht: ' + b.verwacht : '')
        + (b.fragment ? '\n       fragment: ' + String(b.fragment).slice(0, 150) : ''));
    }
  }
}
