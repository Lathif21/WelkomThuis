# Security

Static site, so the surface is small. Four things actually apply.

## 1. No `innerHTML`. Ever.

Never assign a string to `innerHTML`, `outerHTML`, `document.write()` or
`insertAdjacentHTML()`. Build nodes instead. Absolute rule — not "sanitise
carefully", because the moment one exception exists the next person copies it.

The original code was **not** a vulnerability, but was shaped like one:

```js
// BEFORE
var messages = { '1': 'De <strong>fauteuil</strong> krijgt weer een plek bij het raam.' };
note.innerHTML = messages[current];
```

Every string is a literal we wrote; `current` comes from a `data-obj` we control.
Safe today. It becomes real XSS the day the copy moves into a CMS so Kato can
edit it, or a message is built from `?meubel=`, or testimonials arrive from an
API. All plausible here. The fix cost eight lines and removes the category.

```js
// AFTER — structure in code, content in data, never joined into a string
var messages = { '1': { lead: 'De fauteuil', rest: ' krijgt weer een plek bij het raam.' } };

function render(id) {
  var msg = messages[id];
  clear(note);
  if (!msg) return;
  var strong = document.createElement('strong');
  strong.appendChild(document.createTextNode(msg.lead));
  note.appendChild(strong);
  note.appendChild(document.createTextNode(msg.rest));
}
```

| Instead of | Use |
|---|---|
| `el.innerHTML = str` | `el.textContent = str` |
| `el.innerHTML = '<b>' + x + '</b>'` | `createElement` + `createTextNode` |
| `el.innerHTML = ''` | `while (el.firstChild) el.removeChild(el.firstChild)` |
| `eval`, `new Function`, `setTimeout('...')` | never |
| `el.setAttribute('onclick', ...)` | `addEventListener` |

If a link target ever becomes dynamic, allow-list the scheme (`https:`,
`mailto:`, `tel:`) — never block-list. `javascript:` is a valid URL.

Check before pushing; expect no output:

```bash
grep -rnE "innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function|\son[a-z]+=\"" \
  *.html assets/js/ | grep -vE "^\S+:[0-9]+: *(\*|//|/\*)"
```

## 2. CSP

Set in `_headers`. Target policy once fonts are self-hosted:

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
font-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none';
object-src 'none'; upgrade-insecure-requests
```

`base-uri 'none'` stops an injected `<base>` redirecting every relative URL.
`form-action 'self'` stops an injected form posting the visitor's details
elsewhere — widen it to the real endpoint host if you use a form service.

**No `'unsafe-inline'`.** That's why CSS and JS were pulled out of `index.html`;
inline blocks would force it and switch most of CSP off. `_headers` currently
allows the two Google Fonts hosts — remove both once fonts are local.

Third-party scripts: don't. Every one runs with full access to the page,
including whatever is typed into the contact form. If one is unavoidable, pin
the version, add Subresource Integrity, and add the host to CSP explicitly. For
analytics use a cookieless EU option (Plausible, Simple Analytics), not GA.

## 3. The form

Once a real endpoint exists:

- **POST over HTTPS.** Never GET — contact details would land in logs and history.
- **Validate server-side.** Anything can POST to the endpoint directly.
- **Treat submitted text as hostile where it lands.** The usual failure isn't the
  website, it's the notification email — unescaped HTML mail is injection into
  Kato's inbox. Send plain text.
- **Never reflect submitted values back onto the page.** Keep the success panel
  static.
- **Honeypot field, not CAPTCHA.** Costs nothing, blocks most bots, and an
  84-year-old should never be asked to identify traffic lights to ask for help.
- Rate-limit, and cap message length.

## 4. GDPR

Name, phone and email from Belgian residents is personal data.

- Publish a privacy notice: controller, what's collected, why, retention, lawful
  basis, how to request deletion. Link from the footer and beside the form.
- Company identification in the footer.
- **Self-host the fonts.** Hotlinking `fonts.gstatic.com` sends the visitor's IP
  to Google before any consent; a Munich court found that unlawful in 2022.
- Keep submissions somewhere Kato controls and delete them when closed.

Data minimisation is already good — email is optional, nothing extra is asked.
Keep that; don't add fields "in case they're useful".

I'm a designer, not a lawyer. Have the privacy notice checked by someone qualified.

## Reporting

Email the maintainer rather than opening a public issue.
