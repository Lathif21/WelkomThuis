/* WelkomThuis — site.js
 *
 * Progressive enhancement only. Every part of this file may fail to load and
 * the page must still work: the nav is a plain anchor list, the plattegrond is
 * static SVG, the form is a real <form>.
 *
 * House rule: no innerHTML anywhere in this file. See SECURITY.md.
 */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
   * Contactformulier
   *
   * LAUNCH BLOCKER — this handler swallows the submit and shows a
   * "Bericht verstuurd" confirmation without sending anything.
   * Do not deploy. Either wire up a real endpoint (see
   * README.md § Launch blockers) or delete this block and let the
   * form POST normally.
   * ------------------------------------------------------------- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Honeypot: alleen een bot vult dit veld in. Stil laten mislukken —
       * geen foutmelding, want die vertelt de bot wat er misging.
       * De server moet dezelfde controle doen; deze is maar een eerste zeef,
       * want een POST kan het formulier volledig overslaan.
       * Zie SECURITY.md par. 3. */
      var hp = this.elements.namedItem('voorkeur');
      if (hp && hp.value !== '') return;

      /* Het bevestigingspaneel staat vast in de HTML: nooit iets uit deze
       * velden terugzetten op de pagina. Zie SECURITY.md par. 3. */
      this.classList.add('is-sent');
    });
  }

  /* ---------------------------------------------------------------
   * Mobiel menu
   * ------------------------------------------------------------- */
  (function () {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('hoofdmenu');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    }
    function isOpen() {
      return toggle.getAttribute('aria-expanded') === 'true';
    }

    toggle.addEventListener('click', function () { setOpen(!isOpen()); });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    var wide = window.matchMedia('(min-width:481px)');
    var reset = function (e) { if (e.matches) setOpen(false); };
    if (wide.addEventListener) wide.addEventListener('change', reset);
    else if (wide.addListener) wide.addListener(reset);
  })();

  /* ---------------------------------------------------------------
   * Plattegrond: kies een meubelstuk, zie waar het terechtkomt
   * ------------------------------------------------------------- */
  (function () {
    var plans = document.querySelector('.plans');
    if (!plans) return;

    var note = document.getElementById('planNote');
    var arrow = plans.querySelector('.plans__arrow');
    var chips = Array.prototype.slice.call(plans.querySelectorAll('.chip'));
    var marks = Array.prototype.slice.call(plans.querySelectorAll('.mark'));
    if (!note) return;

    /* Copy lives as data, never as markup. `lead` is rendered bold,
     * `rest` as plain text — both via createTextNode, so a stray "<"
     * in the Dutch copy is a "<" and nothing else. */
    var messages = {
      '1': { lead: 'De fauteuil', rest: ' krijgt weer een plek bij het raam, nu in de woon- en eetkamer.' },
      '2': { lead: 'Het dressoir', rest: ' past langs de lange wand van de woon- en eetkamer.' },
      '3': { lead: 'De staande klok', rest: ' komt naast de doorgang te staan, zichtbaar vanuit je stoel.' },
      '4': { lead: 'De eettafel', rest: ' staat straks midden in de woon- en eetkamer, met het licht van opzij.' },
      '5': { lead: 'Het schilderij', rest: ' hangt weer op ooghoogte, links van het raam.' },
      '6': { lead: 'De boekenkast', rest: ' past niet in de nieuwe woning. Samen zoeken we er een nieuwe bestemming voor: familie, kringloop of opslag.' }
    };

    /* Snapshot the intro as real nodes so we can restore it without
     * round-tripping through an HTML string. */
    var intro = document.createDocumentFragment();
    while (note.firstChild) intro.appendChild(note.firstChild);
    var introSource = intro.cloneNode(true);

    function restoreIntro() {
      clear(note);
      note.appendChild(introSource.cloneNode(true));
    }

    function clear(el) {
      while (el.firstChild) el.removeChild(el.firstChild);
    }

    function render(id) {
      var msg = messages[id];
      clear(note);
      if (!msg) return;
      var strong = document.createElement('strong');
      strong.appendChild(document.createTextNode(msg.lead));
      note.appendChild(strong);
      note.appendChild(document.createTextNode(msg.rest));
    }

    restoreIntro();

    var names = {};
    chips.forEach(function (chip) {
      names[chip.dataset.obj] = chip.textContent.replace(/^\s*\d+\s*/, '').trim();
    });

    var current = null;

    function each(id, fn) {
      marks.forEach(function (m) { if (m.dataset.obj === id) fn(m); });
    }
    function hint(id, on) {
      if (current) return;
      each(id, function (m) { m.classList.toggle('is-hint', on); });
    }

    function select(id) {
      current = (current === id) ? null : id;

      chips.forEach(function (c) {
        c.setAttribute('aria-pressed', String(c.dataset.obj === current));
      });
      marks.forEach(function (m) {
        m.classList.remove('is-hint');
        m.classList.toggle('is-on', m.dataset.obj === current);
      });

      plans.classList.toggle('is-active', current !== null);

      if (current) render(current);
      else restoreIntro();

      if (current && arrow) {
        arrow.classList.remove('is-nudging');
        void arrow.offsetWidth; /* herstart de animatie */
        arrow.classList.add('is-nudging');
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () { select(chip.dataset.obj); });
      chip.addEventListener('mouseenter', function () { hint(chip.dataset.obj, true); });
      chip.addEventListener('mouseleave', function () { hint(chip.dataset.obj, false); });
      chip.addEventListener('focus', function () { hint(chip.dataset.obj, true); });
      chip.addEventListener('blur', function () { hint(chip.dataset.obj, false); });
    });

    marks.forEach(function (m) {
      var id = m.dataset.obj;
      m.setAttribute('role', 'button');
      m.setAttribute('tabindex', '0');
      m.setAttribute('aria-label', names[id] || ('Meubelstuk ' + id));
      m.addEventListener('click', function () { select(id); });
      m.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(id); }
      });
      m.addEventListener('mouseenter', function () { hint(id, true); });
      m.addEventListener('mouseleave', function () { hint(id, false); });
    });

    if (arrow) {
      arrow.addEventListener('animationend', function () {
        arrow.classList.remove('is-nudging');
      });
    }
  })();
})();
