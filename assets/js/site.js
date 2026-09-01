/* WelkomThuis — site.js
 *
 * Progressive enhancement only. Every part of this file may fail to load and
 * the page must still work: the nav is a plain anchor list and the form is a
 * real <form> that posts on its own.
 *
 * House rule: no innerHTML anywhere in this file. See SECURITY.md.
 */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
   * Contactformulier
   *
   * Het formulier heeft een echte action en post ook zonder JavaScript;
   * de server antwoordt dan met een bedankpagina. Draait deze code wel,
   * dan sturen we hetzelfde verzoek met fetch() en blijft de bezoeker op
   * de pagina.
   *
   * Nooit doen alsof het gelukt is. Mislukt het versturen, dan verschijnt
   * de foutmelding met het telefoonnummer — wie hier strandt, probeert het
   * meestal geen tweede keer.
   * ------------------------------------------------------------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var knop = form.querySelector('button[type="submit"]');
    var knopTekst = knop ? knop.textContent : '';

    form.addEventListener('submit', function (e) {
      /* Honeypot: alleen een bot vult dit veld in. Stil laten mislukken —
       * geen foutmelding, want die vertelt de bot wat er misging.
       * De server doet dezelfde controle; deze is maar een eerste zeef,
       * want een POST kan het formulier volledig overslaan.
       * Zie SECURITY.md par. 3. */
      var hp = this.elements.namedItem('voorkeur');
      if (hp && hp.value !== '') {
        e.preventDefault();
        return;
      }

      /* Geen fetch of FormData? Dan laten we de browser gewoon posten. */
      if (!window.fetch || !window.FormData) return;

      e.preventDefault();
      var self = this;
      self.classList.remove('is-failed');
      if (knop) {
        knop.disabled = true;
        knop.textContent = 'Bezig met versturen…';
      }

      function faal() {
        self.classList.add('is-failed');
        if (knop) {
          knop.disabled = false;
          knop.textContent = knopTekst;
        }
      }

      /* Netlify verwacht bij AJAX een urlencoded body op het pad van de
       * pagina zelf ("/"), niet op de action — die is er voor bezoekers
       * zonder JavaScript. URLSearchParams neemt het verborgen form-name
       * veld mee en laat uitgeschakelde velden weg, precies zoals de
       * browser dat bij een gewone POST zou doen. */
      fetch('/', {
        method: 'POST',
        body: new URLSearchParams(new FormData(self)).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }).then(function (res) {
        if (!res.ok) { faal(); return; }
        /* Het bevestigingspaneel staat vast in de HTML: nooit iets uit deze
         * velden terugzetten op de pagina. Zie SECURITY.md par. 3. */
        self.classList.add('is-sent');
      }).catch(faal);
    });
  }

  /* ---------------------------------------------------------------
   * Vervolgvelden bij een keuzelijst
   *
   * Een veld met data-show-for="<id van de select>" en
   * data-show-value="<waarde>" hoort bij één antwoord en is verder niet
   * van belang. Het staat zichtbaar in de HTML, dus zonder deze code
   * blijft het gewoon staan; hier verbergen we het tot het aan de beurt is.
   * ------------------------------------------------------------- */
  (function () {
    var velden = Array.prototype.slice.call(
      document.querySelectorAll('[data-show-for][data-show-value]')
    );
    if (!velden.length) return;

    velden.forEach(function (veld) {
      var select = document.getElementById(veld.getAttribute('data-show-for'));
      if (!select) return;

      var waarde = veld.getAttribute('data-show-value');
      var invoer = Array.prototype.slice.call(
        veld.querySelectorAll('input, select, textarea')
      );

      function sync() {
        var toon = select.value === waarde;
        veld.hidden = !toon;
        /* Een verborgen veld mag niet meeverstuurd worden, anders staat er
         * een antwoord in de mail dat de bezoeker niet meer op het scherm
         * zag. Wissen doen we niet: wie zich bedenkt en terugkomt, vindt
         * zijn tekst nog terug. */
        invoer.forEach(function (i) { i.disabled = !toon; });
      }

      sync();
      select.addEventListener('change', sync);
    });
  })();

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

})();
