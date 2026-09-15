import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import { toetsVan } from './helpers.mjs';

/**
 * De pagina draait de regels als één ingevouwen bundel, niet als ES-modules. Die omzetting kan
 * stilletjes misgaan — een import die niet wordt omgezet valt in Node niet op, want daar draaien
 * het echte modules. Deze test bouwt de pagina en draait de bundel, zodat zo'n verschil hier
 * opvalt en niet pas in de browser van de redacteur.
 */

const wortel = join(dirname(fileURLToPath(import.meta.url)), '..');

function bundelContext() {
  execFileSync('node', [join(wortel, 'scripts', 'bouw-pagina.mjs')], { cwd: wortel, stdio: 'pipe' });
  const html = readFileSync(join(wortel, 'dist', 'app.html'), 'utf8');
  const blokken = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const ctx = vm.createContext({ console, window: {} });
  for (const blok of blokken.slice(0, 3)) vm.runInContext(blok, ctx);   // Parse, Regels, data
  return ctx;
}

test('de gebouwde pagina draait zonder ontbrekende verwijzingen', () => {
  const ctx = bundelContext();
  const uit = vm.runInContext(`JSON.stringify((() => {
    const toets = Regels.maakToetser(REGELDATA);
    const v = VOORBEELDEN[0];
    const r = toets(Parse.parseAdvies(v.html, { land: v.land }));
    return { land: v.land, fout: r.samenvatting.fout, letop: r.samenvatting.letop,
      woorden: r.samenvatting.woorden, regels: Object.keys(r.samenvatting.perRegel).sort() };
  })())`, ctx);
  const bundel = JSON.parse(uit);

  const voorbeeldHtml = vm.runInContext('VOORBEELDEN[0].html', ctx);
  const voorbeeldLand = vm.runInContext('VOORBEELDEN[0].land', ctx);
  const module = toetsVan(voorbeeldHtml, { land: voorbeeldLand });

  assert.deepEqual(bundel.regels, Object.keys(module.samenvatting.perRegel).sort(),
    'de bundel vindt andere regels dan de moduleversie');
  assert.equal(bundel.fout, module.samenvatting.fout);
  assert.equal(bundel.letop, module.samenvatting.letop);
  assert.equal(bundel.woorden, module.samenvatting.woorden);
});

test('alle regeldata zit in de pagina', () => {
  const ctx = bundelContext();
  const sleutels = JSON.parse(vm.runInContext('JSON.stringify(Object.keys(REGELDATA).sort())', ctx));
  assert.deepEqual(sleutels, ['kleurcodes', 'limieten', 'matrix', 'sjabloon', 'woordenlijsten']);
  assert.ok(JSON.parse(vm.runInContext('JSON.stringify(VOORBEELDEN.length)', ctx)) >= 1);
});
