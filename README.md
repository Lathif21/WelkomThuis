# WelkomThuis

Marketing site for **WelkomThuis** — begeleiding bij de verhuis van een grote
woning naar een kleinere woning of serviceflat, van inventaris tot inrichting.

> *Niet alleen verhuizen, maar opnieuw thuiskomen.*

Client: Kato Vermeulen · Locale: `nl-BE` (Vlaanderen) · Static site, no build step.

---

## Launch blockers

**None on our side.** The contact form is wired, registered and verified end to
end — a submission reaches the inbox. What is left sits with the client or with
a lawyer.

Before handover:

- **A real photograph.** The portrait is now the original from `Website
  draft.docx` (477x358, 40 KB) instead of an 867x648 upscale of it — Kato
  spotted that the upscale looked AI-processed, and it was. It is still a phone
  selfie taken in a car, so a proper photo would still be an improvement, and
  there are no project photos at all. The source caps at 477px wide, so do not
  enlarge it again; replace it.
- **Have `privacy.html` read by someone qualified.** It describes what the site
  actually does, but a developer wrote it, not a lawyer. Point them at the
  transfer question in particular: Netlify and Postmark are both US companies,
  so form data leaves the EEA, and the notice says so without naming a transfer
  mechanism.
- **Add the rechtsvorm** to the footer identification if WelkomThuis is a company
  rather than an eenmanszaak (BV, VOF, …). Name, address, ondernemingsnummer,
  phone and email are all in place.
- **Confirm the retention periods** now stated in `privacy.html` — twelve months
  for enquiries that go nowhere, seven years for completed assignments. Those are
  a recommendation, not a decision anyone has signed off.

Note the deploy order that caught us out: enabling Netlify form detection does
not scan the build that is already live. Detection runs **during a deploy**, so
any change to the form needs a redeploy before it takes effect.

## Structure

```
index.html            single page; contact is split in two steps —
                      #prijs (the estimator) and #contact (scheduling a call)
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

Conventions worth knowing before you edit:

- **Form control `id`s carry a `q-` prefix** (`q-voor-wie`, `q-timing`) so they
  cannot collide with the section anchors the nav links to. A duplicate `id`
  makes `getElementById` silently return the wrong element, with no error.
  The `name` attributes have no prefix — those are the contract with the endpoint.
- **Calculator tariffs live in `index.html`**, as `data-prijs` on each checkbox
  with the same amount in the visible label next to it — change both. Phase 1 is
  the exception: those rates sit in the `BASIS` table in `site.js`, keyed on the
  room count. The list now stops at "3 (slaap)kamers of meer", on Kato's
  instruction, so there is no open-ended top tier any more. A studio is still
  not in her price list and is charged as one room — the one rate that needs
  her sign-off.
- **The room question is asked once, in two places.** The estimator needs it
  to calculate; intake question 4 asks the same thing. They are kept in sync
  both ways (`site.js`), so whichever a visitor fills in, the other follows and
  the answer is still submitted. Only question 4 carries a `name`.
- **Colour lives only in the `:root` tokens** in `site.css`, and every token is
  there because a measured pair needs it. Two splits are load-bearing:
  `--brass` (dark gold, for light grounds and the focus ring) versus
  `--brass-licht` (for text and icons *on* `--pine`), and `--line` (decorative
  hairline) versus `--rand` (the outline of an input or button, which WCAG
  1.4.11 wants at 3:1). Collapsing either pair back into one value drops a
  requirement — one value cannot be both 3:1 on paper and 4.5:1 on dark green.
- **`--muted` is body text, not decoration.** It colours `.card p`,
  `.audience p`, `.prose p`, `.band-head p` and most other paragraphs, so it is
  held to the 7:1 rule below and has to clear it against `--paper`, `--white`
  *and* `--haze`. It sat at 5.24:1 until September 2026.
- **The `#voor-wie` illustration is an inline SVG, drawn deliberately rather
  than photographed.** A synthetic photo of a living room would read as a
  WelkomThuis project; a line drawing makes no such claim. It is styled through
  the `.ill-*` classes so it follows the palette, and carries no `style=`
  attributes because the CSP has no `unsafe-inline`. It is `aria-hidden` — it
  says nothing the adjacent paragraphs do not. Replace it when a real photo
  exists; `.audience` is already a two-column grid that collapses when the
  second child is absent.
- **Headings hyphenate (`hyphens:auto`), and that is load-bearing, not
  cosmetic.** Dutch compounds get long: "binnenhuisarchitect" measures 331px in
  a 265px column at 320px wide, and a single unbreakable word widens the whole
  document, not just its own box — the page scrolled sideways by 46px. The
  document is `lang="nl-BE"`, so the browser hyphenates on real syllable
  boundaries; `overflow-wrap:break-word` is the fallback.
- **`--pine` and `--pine-deep` are the brand mark and are frozen.** The logo is
  hard-coded as `#2F4A3C` / `#B08A3E` in `index.html`, `privacy.html`,
  `bedankt.html` and `assets/img/favicon.svg`, and `apple-touch-icon.png` is a
  raster. Changing the green means editing four files and regenerating a PNG.
- **Grid tracks use `minmax(min(Xrem,100%),1fr)`, never `minmax(Xrem,1fr)`.**
  A track cannot be narrower than its minimum, so the plain form overflows its
  container on a 320px screen instead of wrapping. The `min()` lets it shrink.

No framework and no bundler, on purpose: Kato has to be able to get this changed
years from now, possibly by a different developer. Plain HTML is the most
portable thing that exists, there are no dependencies to patch, and the page is
about 70 KB of markup, CSS and script plus 119 KB of fonts and a 40 KB portrait.

Revisit that when there's a real reason — a second page, a second language, or
Kato editing content herself. Not before. (If content ever becomes editable,
re-read `SECURITY.md` first: content stops being trusted at that moment.)

## Running locally

```bash
python3 dev-server.py          # http://127.0.0.1:8000
```

Serves the site and catches the form's POST on every path Netlify accepts it
on (`/`, `/bedankt`), so the form can be filled in and submitted for real
without deploying. Submissions are written to
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
- **7:1 contrast for body text** (AAA), 4.5:1 floor for everything, 3:1 for the
  boundary of any control. Highest-value single change for ageing eyes. The
  brass accent is decorative on light grounds — never small text; on `--pine`
  use `--brass-licht`, which is held to 4.5:1 because `.card__tag` is text.
  All 25 pairs the site actually renders are measured and pass; re-measure
  before changing a token, not after.
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
- **"u", never "je"** — changed on Kato's instruction in September 2026, after
  she supplied new copy written in the formal form. It changed everywhere at
  once: index, privacy and bedankt. Watch the verbs when editing — Dutch drops
  the -t in inversion with "je" ("lees je") but keeps it with "u" ("leest u"),
  and first person never takes it ("ik bel u", not "ik belt u").
- **"wij" for the service, "ik" for the person.** *"Wij begeleiden het volledige
  traject"* / *"Ik ben Kato Vermeulen."*
- **Flemish, not NL Dutch:** serviceflat (not aanleunwoning), de verhuis (not de
  verhuizing), opvolgen (not volgen), ondernemingsnummer (not KvK). Spellcheck
  set to Nederlands (België).
- No euphemisms for ageing, no exclamation marks, no design jargon. Be concrete —
  *"de fauteuil bij het raam"*, not *"uw dierbare bezittingen"*.
- **Say plainly what will not work.** Naming the limits — what will not fit, what
  we do not do — is what makes the rest credible.

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
