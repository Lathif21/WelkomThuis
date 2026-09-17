/* Melding van een nieuwe inzending, via Postmark.
 *
 * Netlify bewaart elke inzending zelf en filtert de spam eruit; deze functie
 * doet alleen het bezorgen van de e-mail. Ze hangt aan de gebeurtenis
 * formSubmitted, die Netlify pas afvuurt nadat een inzending is goedgekeurd.
 * Spam komt hier dus niet langs, en een mislukte e-mail kost nooit een
 * aanvraag: die staat al bij Netlify voordat deze code begint.
 *
 * Waarom niet de ingebouwde e-mailmelding van Netlify: die verstuurt vanaf
 * een netlify.com-adres dat niets met dit domein te maken heeft, en Outlook
 * legt zulke berichten in Ongewenste e-mail. Postmark verstuurt vanaf
 * welkomthuisinterieur.com met DKIM op onze eigen DNS, en dat is precies het
 * verschil waar een spamfilter naar kijkt. De privacyverklaring noemt
 * Postmark al als verwerker. Zie README par. E-mailmelding.
 *
 * Geen npm-afhankelijkheden: fetch zit in de Node-versie die Netlify draait.
 * Een functie zonder package.json kan ook niet verouderen.
 */

/* De namen links zijn de name-attributen uit het formulier, niet de labels.
 * Dat is precies waarom we deze mail zelf opmaken: Netlify leidt zijn eigen
 * veldnamen uit de labeltekst af en maakt er "Uw naam (verplicht)" van. */
const LABEL = {
  naam: 'Naam',
  tel: 'Telefoonnummer',
  mail: 'E-mailadres',
  datum: 'Voorkeursdag',
  dagdeel: 'Voorkeursmoment',
  'voor-wie': '1. Voor wie is de verhuis',
  'voor-wie-anders': '1. Anders, namelijk',
  'naar-type': '2. Naar welk type woning',
  oppervlakte: '3. Oppervlakte nieuwe woning',
  slaapkamers: '4. Aantal (slaap)kamers',
  vanwaar: '5. Vanwaar wordt verhuisd',
  timing: '6. Wanneer gepland',
  bericht: '7. Bericht',
  richtprijs: 'Richtprijs uit de calculator'
};

/* Het honeypotveld en de plumbing van Netlify horen niet in de mail. */
const OVERSLAAN = new Set(['voorkeur', 'form-name']);

/* Alles wat in een kopregel belandt, eerst vlak maken. Een regeleinde in een
 * subject is hoe een injectie in e-mail begint. */
function eenRegel(waarde, max) {
  return String(waarde || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max || 200);
}

/* Twee velden horen niet in de nette kolommenlijst. Het bericht van de
 * bezoeker mag zijn regeleindes houden -- dat is de enige plek waar iemand in
 * eigen woorden schrijft, en daar een regel van maken maakt het slechter
 * leesbaar. De richtprijs komt als een reeks onderdelen achter elkaar; die
 * zet de calculator met " | " aan elkaar en lezen we hier weer uit elkaar. */
const APART = new Set(['bericht', 'richtprijs']);

/* Regeleindes blijven, al het andere onzichtbare gaat eruit. */
function meerdereRegels(waarde, max) {
  return String(waarde || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .split('\n')
    .map((r) => r.trim())
    .join('\n')
    .trim()
    .slice(0, max || 4000);
}

function alsTekst(data) {
  const regels = [];
  /* Vaste volgorde: dezelfde als op de pagina, niet de willekeurige volgorde
   * waarin de velden binnenkomen. */
  for (const sleutel of Object.keys(LABEL)) {
    if (APART.has(sleutel)) continue;
    const waarde = eenRegel(data[sleutel], 500);
    if (waarde) regels.push((LABEL[sleutel] + ':').padEnd(32) + waarde);
  }
  /* Een veld dat later aan het formulier wordt toegevoegd en hier nog niet
   * bekend is, mag niet stil wegvallen. */
  const rest = Object.keys(data)
    .filter((k) => !(k in LABEL) && !OVERSLAAN.has(k))
    .filter((k) => eenRegel(data[k], 500));
  if (rest.length) {
    regels.push('', 'Overige velden:');
    for (const k of rest) regels.push((k + ':').padEnd(32) + eenRegel(data[k], 500));
  }

  const richtprijs = eenRegel(data.richtprijs, 1000);
  if (richtprijs) {
    regels.push('', LABEL.richtprijs, '-'.repeat(LABEL.richtprijs.length));
    for (const deel of richtprijs.split(' | ')) regels.push('  ' + deel.trim());
  }

  const bericht = meerdereRegels(data.bericht, 4000);
  if (bericht) {
    regels.push('', LABEL.bericht, '-'.repeat(LABEL.bericht.length), bericht);
  }

  return 'Nieuwe aanvraag via welkomthuisinterieur.com\n\n'
    + regels.join('\n')
    + '\n\nAntwoorden op deze mail gaat naar de aanvrager als die een '
    + 'e-mailadres heeft achtergelaten.\n';
}

/* Alleen een adres dat er echt als een adres uitziet mag in Reply-To. */
function geldigAdres(waarde) {
  const a = eenRegel(waarde, 254);
  return /^[^\s@]+@[^\s@.]+\.[^\s@]+$/.test(a) ? a : null;
}

export default {
  async formSubmitted(event) {
    const token = process.env.POSTMARK_SERVER_TOKEN;
    const van = process.env.MELDING_VAN;
    const naar = process.env.MELDING_NAAR;

    /* Ontbreekt de configuratie, dan doet deze functie niets en zegt ze dat
     * in het log. Nooit een fout gooien: de inzending staat al veilig bij
     * Netlify en die mag hier niet alsnog op stuklopen. */
    if (!token || !van || !naar) {
      console.log('[melding] overgeslagen: POSTMARK_SERVER_TOKEN, MELDING_VAN '
        + 'of MELDING_NAAR is niet ingesteld. De inzending staat bij Netlify.');
      return;
    }

    const data = event.data || {};
    const naam = eenRegel(data.naam, 80) || 'onbekend';
    const antwoordNaar = geldigAdres(data.mail);

    const bericht = {
      From: van,
      To: naar,
      Subject: 'Nieuwe aanvraag via de website - ' + naam,
      /* Platte tekst, nooit HTML. Een bericht van een bezoeker in een
       * HTML-mail is injectie in de inbox van de ontvanger. Zie SECURITY.md. */
      TextBody: alsTekst(data),
      MessageStream: 'outbound'
    };
    if (antwoordNaar) bericht.ReplyTo = antwoordNaar;

    const res = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Postmark-Server-Token': token
      },
      body: JSON.stringify(bericht)
    });

    if (!res.ok) {
      /* Loggen met de reden erbij: zonder de tekst van Postmark is dit niet
       * te vinden. Het log staat bij Netlify onder Functions. */
      const tekst = await res.text().catch(() => '');
      console.error('[melding] Postmark weigerde de mail: ' + res.status + ' ' + tekst);
      return;
    }
    console.log('[melding] verstuurd naar ' + naar);
  }
};
