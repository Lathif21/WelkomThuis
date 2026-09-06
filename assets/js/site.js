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
   * Verplichte velden
   *
   * Het formulier heeft geen novalidate meer, dus zonder JavaScript
   * controleert de browser zelf en komt er geen lege inzending door.
   * Draait deze code wel, dan vervangen we de zwevende browserballon door
   * een regel tekst onder het veld zelf — die blijft staan, is groot genoeg
   * om te lezen en wordt door een schermlezer voorgelezen.
   * Zie README par. Accessibility: "errors as text beside the field".
   * ------------------------------------------------------------- */
  (function () {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var velden = Array.prototype.slice.call(form.querySelectorAll('[required]'));
    if (!velden.length) return;

    function melding(veld) {
      var id = veld.id + '-fout';
      var el = document.getElementById(id);
      if (!el) {
        el = document.createElement('span');
        el.id = id;
        el.className = 'veldfout';
        el.setAttribute('role', 'alert');
        veld.parentNode.appendChild(el);
      }
      return el;
    }

    function toonFout(veld, tekst) {
      var el = melding(veld);
      while (el.firstChild) el.removeChild(el.firstChild);
      el.appendChild(document.createTextNode(tekst));
      veld.classList.add('is-gemeld');
      veld.setAttribute('aria-describedby', el.id);
      veld.setAttribute('aria-invalid', 'true');
    }

    function wisFout(veld) {
      var el = document.getElementById(veld.id + '-fout');
      if (el && el.parentNode) el.parentNode.removeChild(el);
      veld.classList.remove('is-gemeld');
      veld.removeAttribute('aria-describedby');
      veld.removeAttribute('aria-invalid');
    }

    var TEKST = {
      naam: 'Vul uw naam in, dan weten we hoe we u mogen aanspreken.',
      tel: 'Vul uw telefoonnummer in, zodat we u kunnen terugbellen.'
    };

    velden.forEach(function (veld) {
      /* invalid vuurt vlak voor de browserballon; die onderdrukken we */
      veld.addEventListener('invalid', function (e) {
        e.preventDefault();
        toonFout(veld, TEKST[veld.id] || 'Dit veld is nog leeg.');
      });
      veld.addEventListener('input', function () {
        if (veld.checkValidity()) wisFout(veld);
      });
    });

    /* de eerste fout krijgt de cursor, anders zoekt iemand waar het misging */
    form.addEventListener('submit', function () {
      var eerste = form.querySelector('[aria-invalid="true"]');
      if (eerste) eerste.focus();
    });
  })();

  /* ---------------------------------------------------------------
   * Vervolgvelden bij een keuzelijst
   *
   * Een veld met data-show-for="<id van de select>" en
   * data-show-value="<waarde>" hoort bij één antwoord. Het staat zichtbaar
   * in de HTML, dus zonder deze code blijft het gewoon staan; hier
   * verbergen we het tot het aan de beurt is.
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
   * Eén vraag, twee plekken
   *
   * De calculator heeft het aantal slaapkamers nodig om te rekenen, en
   * vraag 4 van de intake stelt precies dezelfde vraag. Wie er één invult,
   * vult de andere mee in — zo hoeft niemand hetzelfde twee keer te
   * beantwoorden en mist Kato het antwoord ook niet als iemand de
   * calculator overslaat.
   *
   * Alleen vraag 4 heeft een name en wordt dus verstuurd; de keuzelijst in
   * de calculator staat buiten het formulier.
   * ------------------------------------------------------------- */
  (function () {
    var inCalc = document.getElementById('calc-slaapkamers');
    var inForm = document.getElementById('q-slaapkamers');
    var hint = document.getElementById('slaapkamersHint');
    if (!inCalc || !inForm) return;

    function vuur(el) {
      var ev;
      if (typeof window.Event === 'function') {
        ev = new window.Event('change', { bubbles: true });
      } else {
        ev = document.createEvent('Event');
        ev.initEvent('change', true, true);
      }
      el.dispatchEvent(ev);
    }

    function koppel(van, naar, meldHint) {
      van.addEventListener('change', function () {
        /* gelijke waardes: stoppen, anders sturen de twee elkaar in een kring */
        if (naar.value === van.value) return;
        naar.value = van.value;
        if (hint) hint.hidden = !meldHint;
        vuur(naar);
      });
    }

    koppel(inCalc, inForm, true);   /* uit de calculator overgenomen */
    koppel(inForm, inCalc, false);
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

  /* ---------------------------------------------------------------
   * Prijscalculator
   *
   * Staat in een eigen sectie, los van het formulier. De uitkomst schrijft
   * zichzelf in een verborgen veld binnen het formulier, zodat Kato ziet
   * welke richtprijs iemand voor ogen had zonder dat de bezoeker het moet
   * overtypen.
   *
   * Tarieven staan in data-prijs in de HTML, niet hier — één plek om te
   * wijzigen. Zonder deze code blijft het blok een leesbare prijslijst.
   * ------------------------------------------------------------- */
  (function () {
    var calc = document.querySelector('.calc');
    if (!calc) return;

    var slaapkamers = document.getElementById('calc-slaapkamers');
    var basisTekst = document.getElementById('calcBasis');
    var totaalEl = document.getElementById('calcTotaal');
    var wijLijst = document.getElementById('calcWij');
    var uitkomst = calc.querySelector('.calc__uitkomst');
    var samenvatting = document.getElementById('calcSamenvatting');
    var aantalVeld = document.getElementById('calcAantalVeld');
    var aantalKeuze = document.getElementById('calc-aantal');
    var aanwezigRij = document.getElementById('calcAanwezig');
    var meubels = document.getElementById('calc-meubels');
    /* fase 3 is een radiogroep: de duurste optie omvat de goedkoopste */
    var coord = Array.prototype.slice.call(
      calc.querySelectorAll('input[name="calc-coordinatie"]')
    );
    var nuts = document.getElementById('calc-nuts');
    if (!slaapkamers || !totaalEl || !basisTekst) return;

    /* De prijslijst kent 1, 2 en 3 slaapkamers. Een studio rekenen we als
     * één slaapkamer. Vanaf vier is het maatwerk, dus daar is het bedrag
     * een ondergrens en geen vaste prijs. */
    var BASIS = {
      'studio': { prijs: 1200, tekst: 'studio, gerekend als \u00e9\u00e9n kamer' },
      '1': { prijs: 1200, tekst: '1 (slaap)kamer' },
      '2': { prijs: 1500, tekst: '2 (slaap)kamers' },
      '3-of-meer': { prijs: 2000, tekst: '3 (slaap)kamers of meer' }
    };

    var opties = Array.prototype.slice.call(
      calc.querySelectorAll('.calc__optie input[type="checkbox"]')
    );

    function euro(n) {
      return '\u20ac\u00a0' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    /* Een bereik in plaats van één bedrag: de tarieven liggen vast, maar de
     * omvang van het werk niet. De ondergrens is wat de lijst optelt. */
    function bereik(totaal) {
      var onder = Math.floor(totaal / 50) * 50;
      var boven = Math.ceil(totaal * 1.1 / 50) * 50;
      if (boven - onder < 100) boven = onder + 100;
      return [onder, boven];
    }

    function leeg(el) {
      while (el.firstChild) el.removeChild(el.firstChild);
    }

    function regel(lijst, tekst, klasse) {
      var li = document.createElement('li');
      if (klasse) li.className = klasse;
      li.appendChild(document.createTextNode(tekst));
      lijst.appendChild(li);
    }

    function naamVan(inp) {
      var el = inp.parentNode.querySelector('.calc__naam');
      return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
    }

    function toon(el, zichtbaar) {
      el.hidden = !zichtbaar;
      var inp = el.querySelector('input') || el.querySelector('select');
      if (inp) inp.disabled = !zichtbaar;
    }

    function reken() {
      if (meubels && aantalVeld) toon(aantalVeld, meubels.checked);
      if (nuts && aanwezigRij) {
        if (!nuts.checked) {
          var a = aanwezigRij.querySelector('input');
          if (a) a.checked = false;
        }
        toon(aanwezigRij, nuts.checked);
      }

      var basis = BASIS[slaapkamers.value] || null;
      var totaal = 0;
      var open = false;
      var delen = [];

      leeg(wijLijst);
      leeg(basisTekst);

      if (basis) {
        totaal += basis.prijs;
        if (basis.open) open = true;
        var sterk = document.createElement('strong');
        sterk.appendChild(document.createTextNode(euro(basis.prijs)));
        basisTekst.appendChild(sterk);
        basisTekst.appendChild(document.createTextNode(' voor een ' + basis.tekst + '.'));
        regel(wijLijst, 'Basispakket: plaatsbezoek, advies en 3D-voorstel');
        delen.push('Basispakket (' + basis.tekst + '): ' + euro(basis.prijs));
      } else {
        basisTekst.appendChild(document.createTextNode(
          'Kies hierboven het aantal slaapkamers, dan rekenen we verder.'));
      }

      opties.forEach(function (inp) {
        var rij = inp.parentNode;
        if (rij.hidden) return;
        if (!inp.checked) return;
        var naam = naamVan(inp);

        if (inp.getAttribute('data-op-maat')) {
          open = true;
          regel(wijLijst, naam + ' (prijs op maat)');
          delen.push(naam + ': op maat');
          return;
        }

        var stuk = parseInt(inp.getAttribute('data-prijs'), 10) || 0;
        var aantal = 1;
        if (inp === meubels && aantalKeuze) {
          if (aantalKeuze.value === 'meer') { aantal = 10; open = true; }
          else aantal = parseInt(aantalKeuze.value, 10) || 1;
        }
        var bedrag = stuk * aantal;
        totaal += bedrag;
        regel(wijLijst, aantal > 1 ? naam + ' (' + aantal + ' meubels)' : naam);
        delen.push(naam + (aantal > 1 ? ' x' + aantal : '') + ': ' + euro(bedrag));
      });

      coord.forEach(function (r) {
        if (!r.checked || !r.getAttribute('data-prijs')) return;
        var naam = naamVan(r);
        var bedrag = parseInt(r.getAttribute('data-prijs'), 10) || 0;
        totaal += bedrag;
        regel(wijLijst, naam);
        delen.push(naam + ': ' + euro(bedrag));
      });

      if (!wijLijst.children.length) regel(wijLijst, 'Nog niets gekozen', 'is-leeg');

      leeg(totaalEl);
      if (!basis) {
        /* Geen kaal streepje: dat leest als een kapotte calculator. */
        totaalEl.appendChild(document.createTextNode('Nog te berekenen'));
        totaalEl.classList.add('is-leeg');
        if (uitkomst) uitkomst.classList.remove('is-berekend');
        if (samenvatting) samenvatting.value = '';
        return;
      }
      totaalEl.classList.remove('is-leeg');
      if (uitkomst) uitkomst.classList.add('is-berekend');

      /* Elk bedrag in een eigen span: een bedrag mag nooit middenin
       * afbreken, tussen de twee bedragen mag dat wel. Op 320px past het
       * bereik anders niet op \u00e9\u00e9n regel. */
      var r = bereik(totaal);
      [r[0], r[1]].forEach(function (bedrag, i) {
        if (i) totaalEl.appendChild(document.createTextNode(' \u2013 '));
        var sp = document.createElement('span');
        sp.className = 'calc__bedrag';
        sp.appendChild(document.createTextNode(euro(bedrag)));
        totaalEl.appendChild(sp);
      });
      if (open) {
        var staart = document.createElement('span');
        staart.className = 'calc__open';
        staart.appendChild(document.createTextNode('plus wat we samen bespreken'));
        totaalEl.appendChild(staart);
      }

      if (samenvatting) {
        delen.push('Richtprijs: ' + euro(r[0]) + ' - ' + euro(r[1])
                   + (open ? ' (plus onderdelen op maat)' : ''));
        samenvatting.value = delen.join(' | ');
      }
    }

    slaapkamers.addEventListener('change', reken);
    if (aantalKeuze) aantalKeuze.addEventListener('change', reken);
    opties.forEach(function (inp) { inp.addEventListener('change', reken); });
    coord.forEach(function (r) { r.addEventListener('change', reken); });
    reken();
  })();

  /* ---------------------------------------------------------------
   * Datumveld: geen gesprek in het verleden inplannen
   * ------------------------------------------------------------- */
  (function () {
    var datum = document.getElementById('datum');
    if (!datum) return;
    var d = new Date();
    var maand = String(d.getMonth() + 1);
    var dag = String(d.getDate());
    datum.min = d.getFullYear() + '-'
      + (maand.length < 2 ? '0' + maand : maand) + '-'
      + (dag.length < 2 ? '0' + dag : dag);
  })();

})();
