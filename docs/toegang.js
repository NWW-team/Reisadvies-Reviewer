/**
 * Inloggen en de oordelen, voor de versie die op GitHub Pages draait.
 *
 * Lees dit eerst, want het bepaalt wat deze code wel en niet doet:
 *
 *   Dit bestand schermt de PAGINA NIET af. index.html, de regelset en alles wat
 *   erin gevouwen zit zijn openbaar. Wie de URL heeft, kan de pagina opslaan en
 *   lezen, ook zonder account. Het inlogscherm hieronder is een voordeur, geen
 *   slot op het bestand.
 *
 *   Wat wel is afgeschermd, zijn de OORDELEN. Die staan in Supabase, achter row
 *   level security. De pagina stuurt een verzoek; de database beslist. Er is geen
 *   sleutel in deze code waarmee je die beslissing kunt omzeilen, en een
 *   rechtstreeks verzoek aan de API buiten deze pagina om loopt tegen dezelfde
 *   policies aan.
 *
 * De harde regels draaien volledig in de browser en werken ook uitgelogd gewoon.
 * Daarom staat er op het inlogscherm een knop om zonder account verder te gaan.
 */
(function () {
  'use strict';

  var cfg = window.SUPABASE_CONFIG || {};

  // De pagina doet `await window.claude.use('db')`. We geven haar een belofte die
  // pas wordt ingelost als we weten wie er is ingelogd.
  var losOp;
  var dbKlaar = new Promise(function (res) { losOp = res; });
  var ingelost = false;
  function los(waarde) { if (!ingelost) { ingelost = true; losOp(waarde); } }

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

  /** Alles wat van buiten komt en in innerHTML belandt, moet hier langs. */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function meld(tekst, soort) {
    ['toegang-melding', 'poort-melding'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.textContent = tekst || '';
      el.className = (id === 'poort-melding' ? 'poort-melding' : 'toegang-melding')
                   + (soort ? ' is-' + soort : '');
      el.hidden = !tekst;
    });
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
              idKaart[sleutelVan(rij.regel, rij.fragment)] =
                { regel: rij.regel, fragment: rij.fragment || '', land: rij.land };
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
            var r = await sb.from('oordelen')
              .upsert(rij, { onConflict: 'gebruiker_id,land,regel,fragment_hash' });
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

  // -------------------------------------------------------------------- stijl
  // Kleuren uit de Rijkshuisstijl, met terugval voor het geval de pagina zelf
  // ooit andere variabelen gebruikt.

  function stijl() {
    if (document.getElementById('toegang-stijl')) return;
    var s = document.createElement('style');
    s.id = 'toegang-stijl';
    s.textContent = [
      ':root{--t-blauw:var(--blauw,#007bc7);--t-donker:var(--donkerblauw,#154273)}',

      /* het inlogscherm */
      '.poort{position:fixed;inset:0;z-index:2000;background:var(--t-donker);',
      '  display:flex;align-items:center;justify-content:center;padding:24px 16px;overflow:auto;',
      '  font-family:"Fira Sans",system-ui,-apple-system,sans-serif}',
      '.poort-kaart{background:#fff;border-radius:4px;width:100%;max-width:420px;',
      '  box-shadow:0 12px 40px rgba(0,0,0,.28);overflow:hidden;margin:auto}',
      '.poort-lint{height:6px;background:var(--t-blauw)}',
      '.poort-binnen{padding:30px 30px 26px}',
      '.poort-merk{margin:0 0 18px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;',
      '  font-weight:700;color:var(--t-blauw)}',
      '.poort h1{margin:0 0 8px;font-size:25px;line-height:1.2;color:var(--t-donker);font-weight:700}',
      '.poort-sub{margin:0 0 22px;font-size:14px;line-height:1.55;color:#4b4b47}',
      '.poort label{display:block;font-size:13px;font-weight:600;color:var(--t-donker);margin:0 0 5px}',
      '.poort input{width:100%;font:15px/1.4 inherit;padding:10px 12px;margin:0 0 16px;',
      '  border:1px solid #8c8c85;border-radius:3px;background:#fff;color:#1b1b19}',
      '.poort input:focus{outline:3px solid #f4b942;outline-offset:1px;border-color:var(--t-donker)}',
      '.poort .knop{width:100%;font:600 15px/1 inherit;padding:13px;border:0;border-radius:3px;',
      '  background:var(--t-blauw);color:#fff;cursor:pointer}',
      '.poort .knop:hover{background:#0069ab}',
      '.poort .knop[disabled]{opacity:.6;cursor:progress}',
      '.poort .door{display:block;width:100%;margin:14px 0 0;background:none;border:0;padding:8px;',
      '  font:15px/1.4 inherit;color:var(--t-donker);text-decoration:underline;cursor:pointer}',
      '.poort-scheiding{margin:22px 0 0;border:0;border-top:1px solid #e2e2dc}',
      '.poort-klein{margin:16px 0 0;font-size:12.5px;line-height:1.5;color:#63635d}',
      '.poort-klein b{color:#1b1b19;font-weight:600}',
      '.poort-melding{margin:0 0 16px;font-size:13.5px;line-height:1.45;padding:10px 12px;border-radius:3px}',
      '.poort-laden{padding:34px 30px;text-align:center;color:#63635d;font-size:14px}',

      /* de balk voor wie is ingelogd */
      '.toegang{position:sticky;top:0;z-index:999;background:var(--t-donker);color:#fff;',
      '  font:14px/1.5 "Fira Sans",system-ui,sans-serif;padding:9px 16px;',
      '  display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center}',
      '.toegang b{font-weight:600}',
      '.toegang .rol{opacity:.8}',
      '.toegang button{font:inherit;font-weight:600;padding:5px 13px;border:1px solid #6d8cb5;',
      '  border-radius:3px;background:transparent;color:#fff;cursor:pointer}',
      '.toegang button:hover{background:#1d5087}',
      '.toegang .duw{margin-left:auto}',
      '.toegang-melding{flex-basis:100%;margin:0;font-size:13px;line-height:1.45;padding:9px 11px;border-radius:3px}',

      '.is-fout{background:#8f1d2e;color:#fff}',
      '.is-goed{background:#15602f;color:#fff}',
      '.is-waarschuwing{background:#7a5a06;color:#fff}',
      '.poort-melding.is-fout{background:#fbe3e6;color:#8f1d2e;border-left:4px solid #8f1d2e}',
      '.poort-melding.is-waarschuwing{background:#fdf3d9;color:#7a5a06;border-left:4px solid #b08900}',

      '@media (max-width:480px){.poort-binnen{padding:24px 20px 22px}.poort h1{font-size:22px}}'
    ].join('');
    document.head.appendChild(s);
  }

  // ------------------------------------------------------------- de voordeur

  function poort() {
    var el = document.getElementById('toegang-poort');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toegang-poort';
      el.className = 'poort';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-labelledby', 'poort-titel');
      document.body.appendChild(el);
    }
    return el;
  }

  function poortLaden() {
    poort().innerHTML = '<div class="poort-kaart"><div class="poort-lint"></div>'
      + '<p class="poort-laden">Moment&hellip;</p></div>';
  }

  function poortSluiten() {
    var el = document.getElementById('toegang-poort');
    if (el) el.remove();
  }

  function poortInloggen() {
    var el = poort();
    el.innerHTML =
      '<div class="poort-kaart">' +
        '<div class="poort-lint"></div>' +
        '<div class="poort-binnen">' +
          '<p class="poort-merk">Nederland Wereldwijd</p>' +
          '<h1 id="poort-titel">Reisadvies-Reviewer</h1>' +
          '<p class="poort-sub">Toetst een reisadvies op de schrijfwijzer, de onderwerpen-matrix ' +
            'en de vaste formuleringen uit het sjabloon.</p>' +
          '<p class="poort-melding" id="poort-melding" hidden></p>' +
          '<form id="poort-form" autocomplete="on" novalidate>' +
            '<label for="poort-email">E-mailadres</label>' +
            '<input id="poort-email" type="email" name="email" autocomplete="username" required>' +
            '<label for="poort-ww">Wachtwoord</label>' +
            '<input id="poort-ww" type="password" name="password" autocomplete="current-password" required>' +
            '<button type="submit" class="knop" id="poort-knop">Inloggen</button>' +
          '</form>' +
          '<button type="button" class="door" id="poort-door">Verder zonder inloggen</button>' +
          '<hr class="poort-scheiding">' +
          '<p class="poort-klein">Inloggen is alleen nodig om <b>oordelen te bewaren</b> en terug te zien. ' +
            'De toets zelf draait in je browser en werkt ook zonder account.</p>' +
          '<p class="poort-klein">Accounts worden vooraf toegevoegd; je kunt je hier niet registreren. ' +
            'Let op: deze pagina en de regelset zijn openbaar &mdash; inloggen beschermt de oordelen, niet de pagina.</p>' +
        '</div>' +
      '</div>';

    var form = document.getElementById('poort-form');
    var knop = document.getElementById('poort-knop');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var email = document.getElementById('poort-email').value.trim();
      var ww = document.getElementById('poort-ww').value;
      if (!email || !ww) { meld('Vul een e-mailadres en een wachtwoord in.', 'fout'); return; }
      knop.disabled = true;
      knop.textContent = 'Bezig…';
      meld('');
      var r = await sb.auth.signInWithPassword({ email: email, password: ww });
      if (r.error) {
        knop.disabled = false;
        knop.textContent = 'Inloggen';
        meld('Inloggen mislukt: ' + r.error.message, 'fout');
        document.getElementById('poort-ww').value = '';
        document.getElementById('poort-ww').focus();
        return;
      }
      location.reload();
    });

    document.getElementById('poort-door').addEventListener('click', function () {
      poortSluiten();
      balk();
      los(undefined);
    });

    el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') document.getElementById('poort-door').click();
    });

    document.getElementById('poort-email').focus();
  }

  // ---------------------------------------------------- de balk na het inloggen

  function balk() {
    var b = document.getElementById('toegang-balk');
    if (!b) {
      b = document.createElement('div');
      b.id = 'toegang-balk';
      b.className = 'toegang';
      document.body.insertBefore(b, document.body.firstChild);
    }
    var melding = '<p class="toegang-melding" id="toegang-melding" hidden></p>';

    if (!gebruiker) {
      b.innerHTML = '<span>Niet ingelogd &middot; alleen de harde regels</span>'
        + (sb ? '<button type="button" class="duw" id="toegang-in">Inloggen</button>' : '')
        + melding;
      var i = document.getElementById('toegang-in');
      if (i) i.addEventListener('click', function () { stijl(); poortInloggen(); });
      return;
    }

    b.innerHTML =
      '<span>Ingelogd als <b>' + esc(gebruiker.email) + '</b>' +
        (toegestaan ? ' <span class="rol">&middot; ' + esc(rol || 'reviewer') + '</span>' : '') + '</span>' +
      '<button type="button" class="duw" id="toegang-uit">Uitloggen</button>' + melding;

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

  function domKlaar() {
    return document.readyState === 'loading'
      ? new Promise(function (r) { document.addEventListener('DOMContentLoaded', r); })
      : Promise.resolve();
  }

  async function start() {
    await domKlaar();
    stijl();
    poortLaden();

    if (!cfg.url || !cfg.publishableKey) {
      poortSluiten(); balk();
      meld('config.js is niet geladen of leeg, dus er is geen project om mee te verbinden.', 'fout');
      los(undefined);
      return;
    }

    try {
      var mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0/+esm');
      sb = mod.createClient(cfg.url, cfg.publishableKey);
    } catch (e) {
      poortSluiten(); balk();
      meld('De Supabase-bibliotheek kon niet geladen worden, dus inloggen kan nu niet. '
         + 'De harde regels werken wel. (' + (e && e.message ? e.message : e) + ')', 'fout');
      los(undefined);
      return;
    }

    var sessie;
    try {
      sessie = await sb.auth.getSession();
    } catch (e) {
      poortSluiten(); balk();
      meld('De verbinding met Supabase mislukte: ' + (e && e.message ? e.message : e), 'fout');
      los(undefined);
      return;
    }

    gebruiker = sessie.data && sessie.data.session ? sessie.data.session.user : null;

    if (!gebruiker) {
      poortInloggen();          // de voordeur; de belofte wordt pas ingelost bij een keuze
      return;
    }

    // Wel een sessie: meteen door naar de app, en daarna pas kijken of dit account
    // op de lijst staat. Dat is een verzoek dat de database beantwoordt.
    poortSluiten();
    balk();
    var t = await sb.from('toegestane_gebruikers').select('rol').limit(1);
    toegestaan = !t.error && !!(t.data && t.data.length);
    rol = toegestaan ? t.data[0].rol : null;
    balk();

    // Alleen wie op de lijst staat krijgt een opslag mee. Wie er niet op staat krijgt
    // undefined, precies zoals de pagina dat al aankon.
    los(toegestaan ? maakOpslag() : undefined);
  }

  start();
})();
