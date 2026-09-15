/**
 * Inloggen en de oordelen, voor de versie die op GitHub Pages draait.
 *
 * Lees dit eerst, want het bepaalt wat deze code wel en niet doet:
 *
 *   Dit bestand schermt de PAGINA NIET af. index.html, de regelset en alles wat
 *   erin gevouwen zit zijn publiek. Wie de URL heeft, kan de pagina opslaan en
 *   lezen, ook zonder account. Een inlogscherm verandert daar niets aan.
 *
 *   Wat wel is afgeschermd, zijn de OORDELEN. Die staan in Supabase, achter row
 *   level security. De pagina stuurt een verzoek; de database beslist. Er is geen
 *   sleutel in deze code waarmee je die beslissing kunt omzeilen, en een
 *   rechtstreeks verzoek aan de API buiten deze pagina om loopt tegen dezelfde
 *   policies aan.
 *
 * De harde regels draaien volledig in de browser en werken ook uitgelogd gewoon.
 */
(function () {
  'use strict';

  var cfg = window.SUPABASE_CONFIG || {};

  // De pagina doet `await window.claude.use('db')`. We geven haar een belofte die
  // pas wordt ingelost als we weten wie er is ingelogd.
  var losOp;
  var dbKlaar = new Promise(function (res) { losOp = res; });

  window.claude = {
    use: function (naam) {
      // 'sample' bestond alleen in de Artifact-omgeving. Hier niet; de pagina
      // vangt dat zelf op en laat de harde regels gewoon draaien.
      return naam === 'db' ? dbKlaar : Promise.resolve(undefined);
    }
  };

  var sb = null;
  var gebruiker = null;
  var toegestaan = false;
  var rol = null;

  /** Dezelfde sanitering als de pagina gebruikt voor haar document-id. */
  function sleutelVan(regel, fragment) {
    return (regel + '::' + (fragment || '')).replace(/[^A-Za-z0-9_.~:@+-]/g, '_').slice(0, 180);
  }

  // Paginasleutel -> de velden die we nodig hebben om de rij terug te vinden.
  // De sleutel is lossy, dus we onthouden het origineel bij lezen en schrijven.
  var idKaart = Object.create(null);

  function meld(tekst, soort) {
    var el = document.getElementById('toegang-melding');
    if (!el) return;
    el.textContent = tekst || '';
    el.className = 'toegang-melding' + (soort ? ' is-' + soort : '');
    el.hidden = !tekst;
  }

  // ---------------------------------------------------------------- de opslag
  // Een dunne laag in de vorm die de pagina al kent, met Supabase eronder.

  function maakOpslag() {
    return {
      collection: function (naam) {
        return {
          get: async function () {
            if (naam !== 'oordelen') return [];
            var r = await sb.from('oordelen').select('regel,fragment,oordeel,land,tijd');
            if (r.error) { meld('Oordelen ophalen lukte niet: ' + r.error.message, 'fout'); return []; }
            return (r.data || []).map(function (rij) {
              idKaart[sleutelVan(rij.regel, rij.fragment)] = { regel: rij.regel, fragment: rij.fragment || '', land: rij.land };
              return { data: function () { return rij; } };
            });
          }
        };
      },
      doc: function (pad) {
        var id = String(pad).split('/').slice(1).join('/');
        return {
          set: async function (waarde) {
            var rij = {
              gebruiker_id: gebruiker.id,
              land: waarde.land || '(onbekend)',
              regel: waarde.regel,
              fragment: waarde.fragment || '',
              oordeel: waarde.oordeel,
              tijd: waarde.tijd || new Date().toISOString()
            };
            idKaart[id] = { regel: rij.regel, fragment: rij.fragment, land: rij.land };
            var r = await sb.from('oordelen').upsert(rij, { onConflict: 'gebruiker_id,land,regel,fragment_hash' });
            if (r.error) {
              meld('Dit oordeel is niet bewaard. De database weigerde het: ' + r.error.message, 'fout');
            } else {
              meld('Oordeel bewaard.', 'goed');
              setTimeout(function () { meld(''); }, 2500);
            }
          },
          delete: async function () {
            var k = idKaart[id];
            if (!k) return;
            var r = await sb.from('oordelen').delete()
              .eq('gebruiker_id', gebruiker.id)
              .eq('land', k.land || '(onbekend)')
              .eq('regel', k.regel)
              .eq('fragment', k.fragment);
            if (r.error) meld('Intrekken lukte niet: ' + r.error.message, 'fout');
          }
        };
      }
    };
  }

  // ------------------------------------------------------------------- de balk

  function stijl() {
    var s = document.createElement('style');
    s.textContent = [
      '.toegang{position:sticky;top:0;z-index:999;background:#154273;color:#fff;',
      '  font:14px/1.5 "Fira Sans",system-ui,sans-serif;padding:10px 16px;',
      '  display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center}',
      '.toegang b{font-weight:600}',
      '.toegang form{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0}',
      '.toegang input{font:inherit;padding:6px 9px;border:1px solid #4b6d98;border-radius:6px;',
      '  background:#fff;color:#154273;min-width:0;width:min(210px,42vw)}',
      '.toegang button{font:inherit;font-weight:600;padding:6px 14px;border:0;border-radius:6px;',
      '  background:#fff;color:#154273;cursor:pointer}',
      '.toegang button.uit{background:transparent;color:#fff;border:1px solid #6d8cb5}',
      '.toegang .uitleg{opacity:.85;font-size:12.5px;flex-basis:100%;margin:0}',
      '.toegang-melding{flex-basis:100%;margin:0;font-size:13px;padding:7px 10px;border-radius:6px}',
      '.toegang-melding.is-fout{background:#8f1d2e;color:#fff}',
      '.toegang-melding.is-goed{background:#15602f;color:#fff}',
      '.toegang-melding.is-waarschuwing{background:#7a5a06;color:#fff}'
    ].join('');
    document.head.appendChild(s);
  }

  function teken() {
    var balk = document.getElementById('toegang-balk');
    if (!balk) {
      balk = document.createElement('div');
      balk.id = 'toegang-balk';
      balk.className = 'toegang';
      document.body.insertBefore(balk, document.body.firstChild);
    }
    var melding = '<p class="toegang-melding" id="toegang-melding" hidden></p>';

    // Geen verbinding met Supabase: zeg dat, in plaats van een inlogveld tonen dat
    // niets doet.
    if (!sb) {
      balk.innerHTML = '<span>Inloggen is nu niet beschikbaar.</span>'
        + '<p class="uitleg">De harde regels draaien in de pagina zelf en werken gewoon. '
        + 'Oordelen bewaren kan pas als de verbinding met Supabase er weer is.</p>' + melding;
      return;
    }

    if (!gebruiker) {
      balk.innerHTML =
        '<form id="toegang-form" autocomplete="on">' +
          '<input id="toegang-email" type="email" name="email" placeholder="e-mailadres" aria-label="e-mailadres" autocomplete="username" required>' +
          '<input id="toegang-ww" type="password" name="password" placeholder="wachtwoord" aria-label="wachtwoord" autocomplete="current-password" required>' +
          '<button type="submit">Inloggen</button>' +
        '</form>' +
        '<p class="uitleg">De harde regels werken ook zonder inloggen. Inloggen is nodig om oordelen te bewaren en terug te zien.</p>' +
        melding;
      document.getElementById('toegang-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        meld('Bezig\u2026');
        var r = await sb.auth.signInWithPassword({
          email: document.getElementById('toegang-email').value.trim(),
          password: document.getElementById('toegang-ww').value
        });
        if (r.error) { meld('Inloggen mislukt: ' + r.error.message, 'fout'); return; }
        location.reload();
      });
      return;
    }

    balk.innerHTML =
      '<span>Ingelogd als <b>' + (gebruiker.email || '') + '</b>' +
        (toegestaan ? ' &middot; ' + (rol || 'reviewer') : '') + '</span>' +
      '<button type="button" class="uit" id="toegang-uit">Uitloggen</button>' + melding;
    document.getElementById('toegang-uit').addEventListener('click', async function () {
      await sb.auth.signOut();
      location.reload();
    });

    if (!toegestaan) {
      meld('Dit account staat niet op de lijst met toegestane gebruikers. Je kunt de toets gewoon draaien, '
         + 'maar oordelen worden niet bewaard en eerdere oordelen zijn niet zichtbaar. Dat wordt door de '
         + 'database afgedwongen, niet door deze pagina.', 'waarschuwing');
    }
  }

  // ------------------------------------------------------------------- opstart

  async function toon() {
    if (document.readyState === 'loading') {
      await new Promise(function (r) { document.addEventListener('DOMContentLoaded', r); });
    }
    stijl();
    teken();
  }

  async function start() {
    if (!cfg.url || !cfg.publishableKey) {
      await toon();
      meld('config.js is niet geladen of leeg, dus er is geen project om mee te verbinden.', 'fout');
      losOp(undefined);
      return;
    }

    try {
      var mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0/+esm');
      sb = mod.createClient(cfg.url, cfg.publishableKey);
    } catch (e) {
      await toon();
      meld('De Supabase-bibliotheek kon niet geladen worden (' + (e && e.message ? e.message : e) + ').', 'fout');
      losOp(undefined);
      return;
    }

    try {
      var sessie = await sb.auth.getSession();
      gebruiker = sessie.data && sessie.data.session ? sessie.data.session.user : null;

      if (gebruiker) {
        // Een verzoek dat de database beantwoordt. Staat de rij er niet, dan is het
        // antwoord leeg - en daar kan de pagina niets aan veranderen.
        var t = await sb.from('toegestane_gebruikers').select('rol').limit(1);
        toegestaan = !t.error && !!(t.data && t.data.length);
        rol = toegestaan ? t.data[0].rol : null;
      }
    } catch (e) {
      await toon();
      meld('De verbinding met Supabase mislukte: ' + (e && e.message ? e.message : e), 'fout');
      losOp(undefined);
      return;
    }

    await toon();

    // Alleen wie op de lijst staat krijgt een opslag mee. Wie er niet op staat krijgt
    // undefined, precies zoals de pagina dat al aankan.
    losOp(toegestaan ? maakOpslag() : undefined);
  }

  start();
})();
