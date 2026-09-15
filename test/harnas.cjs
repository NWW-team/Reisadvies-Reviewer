// Draait de modules uit de Artifact-pagina in Node, zodat we de regels kunnen testen
// zonder te publiceren. `const` in een vm-script landt niet op het globale object,
// dus voegen we de scripts samen en geven we de bindings als expressie terug.
const fs = require('fs');
const vm = require('vm');
module.exports = function laad(pad) {
  const html = fs.readFileSync(pad, 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map((m) => m[1])
    .filter((s) => !/getElementById/.test(s));          // de UI slaan we over
  const bron = scripts.join('\n;\n') + '\n;({ Parse, Regels, REGELDATA, VOORBEELDEN })';
  const ctx = vm.createContext({ console });
  return vm.runInContext(bron, ctx);
};
