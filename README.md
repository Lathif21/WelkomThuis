# WelkomThuis

Marketing site for **WelkomThuis** — begeleiding bij de verhuis van een grote
woning naar een kleinere woning of serviceflat, van inventaris tot inrichting.

> *Niet alleen verhuizen, maar opnieuw thuiskomen.*

Client: Kato Vermeulen · Locale: `nl-BE` (Vlaanderen) · Static site, no build step.

---

## Launch blockers

**Right now there is no working way for a visitor to reach Kato.** Fix 1 and 2
before anything else.

1. **The contact form sends nothing.** `site.js` calls `preventDefault()` and
   then shows *"Bericht verstuurd — ik neem binnen twee werkdagen contact op."*
   Nobody does. Wire a real endpoint or replace the form with a phone number —
   a silent failure aimed at people who may not try twice is worse than no form.
2. **No phone number on the site**, though the main call to action is
   *"Plan een vrijblijvend telefoongesprek."* Only `welkomthuis@outlook.be` exists.
3. **No privacy notice**, and the form collects name, phone and email. Required
   under GDPR before launch.
4. **No company identification** in the footer — Belgian law requires the
   registered name, `ondernemingsnummer` and contact address to be reachable.
   Footer currently says "Demo-website".
5. **Google Fonts is hotlinked**, sending every visitor's IP to Google before
   consent. Self-host from <https://gwfh.mranftl.com/fonts> (both families are
   OFL, so this is allowed), drop the `<link>` tags for `@font-face` in
   `site.css`, then remove the two Google hosts from the CSP in `_headers`.
6. **The portrait is a phone selfie taken in a car.** Works at 230px, but the
   brand needs a real photo — and there are no project photos at all.

## Structure

```
index.html            single page, semantic sections
assets/css/site.css   all styling; design tokens on :root
assets/js/site.js     progressive enhancement only
assets/img/           web-ready images, descriptive filenames
_headers              security headers (Netlify / Cloudflare Pages)
SECURITY.md           injection prevention, CSP, form and GDPR notes
```

No framework and no bundler, on purpose: Kato has to be able to get this changed
years from now, possibly by a different developer. Plain HTML is the most
portable thing that exists, there are no dependencies to patch, and the whole
page is 67 KB.

Revisit that when there's a real reason — a second page, a second language, or
Kato editing content herself. Not before. (If content ever becomes editable,
re-read `SECURITY.md` first: content stops being trusted at that moment.)

## Running locally

```bash
python3 -m http.server 8000
```

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

Plattegrond copy lives in the `messages` object in `site.js` as plain text —
no HTML tags in those strings. See `SECURITY.md`.

## Deploying

Any static host over HTTPS. `_headers` is picked up automatically by Netlify and
Cloudflare Pages; translate the same directives for nginx or Apache. Verify at
<https://securityheaders.com>.

Before launch: blockers above resolved, form tested end-to-end from a real phone,
favicon, Open Graph tags, `sitemap.xml`, Lighthouse 100 on Accessibility, and
tested on a real iPhone and a real Android — not devtools.
