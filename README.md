# WelkomThuis

Marketing site for **WelkomThuis** — begeleiding bij de verhuis van een grote
woning naar een kleinere woning of serviceflat, van inventaris tot inrichting.

> *Niet alleen verhuizen, maar opnieuw thuiskomen.*

Client: Kato Vermeulen · Locale: `nl-BE` (Vlaanderen) · Static site, no build step.

---

## Launch blockers

**One thing still stops a visitor from reaching Kato.** Fix 1 before anything else.

1. **Verify the form on the live site, and turn on the email notification.**
   It is wired to Netlify Forms (`data-netlify`, `name="contact"`, the hidden
   `form-name`, honeypot `voorkeur`) and reports a real failure instead of
   faking success. But Netlify only registers a form once it has been deployed,
   and **notifications are off by default**: without them submissions sit in the
   Netlify dashboard and nobody is told. After the first deploy, submit the form
   once yourself, confirm it appears under Forms, then add an email notification
   to Kato. Until that is done a visitor still reaches nobody.
2. **The portrait is a phone selfie taken in a car.** Usable at 340px now that
   there's a higher-resolution copy, but the brand needs a real photo — and there
   are still no project photos at all. It is also a 713 KB PNG; as a JPEG at
   ~800px it would be under 60 KB.

Wanted before launch, but not blocking:

- **Have `privacy.html` read by someone qualified.** It describes what the site
  actually does, but a developer wrote it, not a lawyer.
- **Add the rechtsvorm** to the footer identification if WelkomThuis is a company
  rather than an eenmanszaak (BV, VOF, …). Name, address, ondernemingsnummer,
  phone and email are all in place.
- **Confirm the retention periods** now stated in `privacy.html` — twelve months
  for enquiries that go nowhere, seven years for completed assignments. Those are
  a recommendation, not a decision anyone has signed off.
- **Name the form processor** in `privacy.html` once the endpoint exists.

Resolved since the first pass: the phone number, the privacy notice, company
identification, and Google Fonts (now self-hosted — see Structure).

## Structure

```
index.html            single page, semantic sections
dev-server.py         local dev server; also catches the contact form (not deployed)
bedankt.html          success page for visitors without JavaScript (noindex)
privacy.html          privacy notice; linked from the footer and beside the form
assets/css/site.css   all styling; design tokens on :root
assets/js/site.js     progressive enhancement only
assets/fonts/         self-hosted woff2, latin + latin-ext (OFL, from Google Fonts)
assets/img/           web-ready images, descriptive filenames
_headers              security headers (Netlify / Cloudflare Pages)
SECURITY.md           injection prevention, CSP, form and GDPR notes
```

Two conventions worth knowing before you edit:

- **Form control `id`s carry a `q-` prefix** (`q-voor-wie`, `q-timing`) so they
  cannot collide with the section anchors the nav links to. A duplicate `id`
  makes `getElementById` silently return the wrong element, with no error.
  The `name` attributes have no prefix — those are the contract with the endpoint.
- **The two plattegrond SVGs have different viewBoxes** (320 and 240 wide) but are
  shown at the same width. Room labels in the second must stay at 0.75 of the
  first to look the same size. Change one font-size, change the other.

No framework and no bundler, on purpose: Kato has to be able to get this changed
years from now, possibly by a different developer. Plain HTML is the most
portable thing that exists, there are no dependencies to patch, and the page is
62 KB of markup, CSS and script plus 119 KB of fonts. The portrait is currently
larger than all of that combined.

Revisit that when there's a real reason — a second page, a second language, or
Kato editing content herself. Not before. (If content ever becomes editable,
re-read `SECURITY.md` first: content stops being trusted at that moment.)

## Running locally

```bash
python3 dev-server.py          # http://127.0.0.1:8000
```

Serves the site and catches `POST /api/contact`, so the form can be filled in
and submitted for real without deploying. Submissions are written to
`dev-inzendingen/` (git-ignored) and printed to the terminal; no email is sent.

`python3 -m http.server 8000` still works if you only want the static pages, but
then the form will 404 on submit.

`dev-server.py` is a development tool, not part of the site — don't deploy it.
Its honeypot check, allow-list and length caps are the ones the real endpoint
needs too, so use it as the reference when writing the host's function.

## Accessibility — this is the spec, not a nice-to-have

The primary visitor is 70–90 years old. Several of these are stricter than
WCAG 2.2 AA, deliberately.

- **20px / 1.25rem body text minimum**, line-height 1.7. Not 16px. The default
  has to be comfortable without anyone discovering browser zoom.
- **7:1 contrast for body text** (AAA), 4.5:1 floor for everything. Highest-value
  single change for ageing eyes. The brass accent is decorative — never small text.
- **48 × 48 px touch targets**, 8px apart. WCAG asks 24px; that isn't enough for
  an unsteady hand.
- **Visible focus everywhere.** Defined once on `:focus-visible`. Don't remove an
  outline without replacing it with something as obvious.
- **No CAPTCHA, ever.** Use a honeypot field instead.
- **No carousels or timed content.** Respect `prefers-reduced-motion`.
- **Never colour alone** to convey state.
- Real `<label>` for every input, `autocomplete` set, errors as text beside the
  field with `role="alert"`.

Test: keyboard only, 200% zoom, a screen reader, then watch someone over 75 use
it on their own device and say nothing.

## Copy rules

Derived from the client brief; where they disagree, the brief wins.

- **WelkomThuis** — one word, capital W and T.
- **"je", never "u"** — the brief's own choice, because half the readers are the
  daughter organising this for her mother. If it ever changes, it changes
  everywhere at once.
- **"wij" for the service, "ik" for the person.** *"Wij begeleiden het volledige
  traject"* / *"Ik ben Kato Vermeulen."*
- **Flemish, not NL Dutch:** serviceflat (not aanleunwoning), de verhuis (not de
  verhuizing), opvolgen (not volgen), ondernemingsnummer (not KvK). Spellcheck
  set to Nederlands (België).
- No euphemisms for ageing, no exclamation marks, no design jargon. Be concrete —
  *"de fauteuil bij het raam"*, not *"uw dierbare bezittingen"*.
- **Keep the boekenkast that doesn't fit.** The honesty is what makes the rest
  credible.

Plattegrond copy lives in the `messages` object in `site.js` as `{lead, rest}`
pairs of plain text — no HTML tags in those strings. See `SECURITY.md`.

## Deploying

Netlify, at <https://welkom-thuis-fc9ee6.netlify.app/>. `_headers` is picked up
automatically; translate the same directives for nginx or Apache if the host ever
changes. Verify at <https://securityheaders.com>.

The contact form uses Netlify Forms, so there is no function to maintain. With
JavaScript it posts urlencoded to `/`; without, it posts to `/bedankt` and
Netlify redirects there itself. Both are same-origin, so the CSP rule
`form-action 'self'` stays as it is. Netlify detects the form by parsing the
deployed HTML — if you rename the form, change `name`, the hidden `form-name`
and `data-netlify-honeypot` together or submissions stop being recorded.

Before launch: blockers above resolved, form tested end-to-end from a real phone,
favicon, Open Graph tags, `sitemap.xml`, Lighthouse 100 on Accessibility, and
tested on a real iPhone and a real Android — not devtools.
