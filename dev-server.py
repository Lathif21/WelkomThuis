#!/usr/bin/env python3
"""Lokale ontwikkelserver voor WelkomThuis.

Serveert de site en vangt het contactformulier op, zodat het end-to-end
getest kan worden zonder eerst te deployen. Net als Netlify accepteert hij
een POST op elk pad dat het formulier gebruikt ("/" met JavaScript,
"/bedankt" zonder).

    python3 dev-server.py          # http://127.0.0.1:8000

Dit verstuurt GEEN e-mail. Inzendingen komen als tekstbestand in
dev-inzendingen/ terecht en worden ook in de terminal getoond. Zo zie je
precies wat een echt endpoint zou ontvangen.

De controles hieronder (honeypot, verplichte velden, toegestane waarden,
lengtes) zijn wat de
echte server ook moet doen — een POST kan het formulier volledig overslaan
en elke waarde meesturen. Zie SECURITY.md par. 3. Gebruik dit bestand als
naslag bij het schrijven van de functie bij de host; het is verder geen
onderdeel van de site en hoort niet mee gedeployed te worden.
"""

import html
import io
import json
import os
import re
import sys
import urllib.parse
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
INBOX = os.path.join(HERE, "dev-inzendingen")

# Precies de waarden die in de <option>-lijsten staan. Alles daarbuiten is
# niet door het formulier verstuurd en wordt geweigerd.
TOEGESTAAN = {
    "voor-wie": {"mezelf", "ouders", "familielid", "anders"},
    "naar-type": {"appartement", "serviceflat", "assistentiewoning", "andere"},
    "oppervlakte": {"tot-50", "50-70", "70-75", "75-80", "80-85", "85-90",
                    "90-95", "95-100", "meer-dan-100", "onbekend"},
    "slaapkamers": {"studio", "1", "2", "3-of-meer"},
    "vanwaar": {"huis", "appartement", "serviceflat-assistentiewoning", "andere"},
    "timing": {"binnen-1-maand", "1-3-maanden", "3-6-maanden", "later", "onbekend"},
    "dagdeel": {"voormiddag", "namiddag", "vroege-avond"},
}

# Vrije tekst: alleen een lengtegrens, gelijk aan de maxlength in de HTML.
MAX = {"naam": 100, "tel": 30, "mail": 254, "datum": 10, "richtprijs": 500,
       "voor-wie-anders": 100, "bericht": 2000}

# Velden die ook een vórm moeten hebben, niet alleen een lengte. Het
# telefoonnummer haalt hetzelfde patroon als het pattern-attribuut in de HTML:
# cijfers en de tekens die in een nummer voorkomen, met minstens zes cijfers.
# Wijzigt het daar, wijzig het hier mee -- de browser is niet de plek waar dit
# vastligt. Zie SECURITY.md par. 3.
FORMAAT = {
    "tel": re.compile(r"^(?=(?:\D*\d){6,})[0-9\s+().\/-]{6,30}$"),
}

LABEL = {
    "voor-wie": "1. Voor wie is de verhuis",
    "voor-wie-anders": "1. Anders, namelijk",
    "naar-type": "2. Naar welk type woning",
    "oppervlakte": "3. Oppervlakte nieuwe woning",
    "slaapkamers": "4. Aantal slaapkamers",
    "vanwaar": "5. Vanwaar wordt verhuisd",
    "timing": "6. Wanneer gepland",
    "bericht": "7. Bericht",
    "naam": "Naam",
    "tel": "Telefoonnummer",
    "mail": "E-mailadres",
    "datum": "Voorkeursdag",
    "dagdeel": "Voorkeursmoment",
    "richtprijs": "Richtprijs uit de calculator",
}

# Wat ingevuld moet zijn. De browser houdt dit al tegen via required in de
# HTML, maar een POST kan het formulier volledig overslaan -- dan is dit de
# enige controle die er nog is. Sinds de intake verplicht werd staan de zeven
# vragen hier ook bij, en de voorkeursdag. E-mail en dagdeel blijven vrij:
# "Maakt niet uit" is bij het dagdeel een antwoord op zichzelf.
VERPLICHT = ["naam", "tel", "datum", "voor-wie", "naar-type", "oppervlakte",
             "slaapkamers", "vanwaar", "timing", "bericht"]


def ontbreekt(schoon):
    """Verplichte velden die leeg zijn of in verwerk() sneuvelden."""
    leeg = [n for n in VERPLICHT if not schoon.get(n)]
    # Vraag 1 heeft een vervolgveld; dat telt alleen mee bij "anders",
    # precies zoals het formulier het toont.
    if schoon.get("voor-wie") == "anders" and not schoon.get("voor-wie-anders"):
        leeg.append("voor-wie-anders")
    return leeg



def verwerk(velden):
    """Geeft (schoon, geweigerd) terug. Weigert stil wat niet klopt."""
    schoon, geweigerd = {}, []
    for naam, waarden in velden.items():
        waarde = (waarden[0] if waarden else "").strip()
        if naam in ("voorkeur", "form-name"):   # honeypot en Netlify-plumbing
            continue
        if not waarde:
            continue
        if naam in TOEGESTAAN:
            if waarde in TOEGESTAAN[naam]:
                schoon[naam] = waarde
            else:
                geweigerd.append("%s=%r (niet in de optielijst)" % (naam, waarde[:40]))
        elif naam in MAX:
            if len(waarde) > MAX[naam]:
                geweigerd.append("%s (%d tekens, max %d)" % (naam, len(waarde), MAX[naam]))
            elif naam in FORMAAT and not FORMAAT[naam].match(waarde):
                # Niet opnemen: een afgekeurd verplicht veld valt hierna door
                # de mand bij ontbreekt(), en de inzending wordt geweigerd.
                geweigerd.append("%s=%r (verkeerde vorm)" % (naam, waarde[:40]))
            else:
                schoon[naam] = waarde
        else:
            geweigerd.append("%s (onbekend veld)" % naam)
    return schoon, geweigerd


def als_tekst(schoon):
    """Platte tekst, nooit HTML. Een bericht van een bezoeker in een
    HTML-mail is injectie in de inbox van de ontvanger. Zie SECURITY.md."""
    regels = ["Nieuwe aanvraag via welkomthuis",
              datetime.now().strftime("%d-%m-%Y %H:%M"), ""]
    for sleutel in LABEL:
        if sleutel in schoon:
            regels.append("%-30s %s" % (LABEL[sleutel] + ":", schoon[sleutel]))
    return "\n".join(regels) + "\n"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=HERE, **kw)

    # Tijdens ontwikkelen nooit cachen. SimpleHTTPRequestHandler stuurt
    # Last-Modified en antwoordt op een herhaald verzoek met "304 Not
    # Modified", waarna de browser zijn eigen oude kopie gebruikt. Bij een
    # aanpassing in site.css zie je dan de vorige versie en lijkt de wijziging
    # niet aangekomen -- dat kost makkelijk een half uur zoeken naar een fout
    # die er niet is.
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def send_head(self):
        # De voorwaardelijke verzoeken eruit halen, anders komt het 304-pad
        # alsnog in actie voordat Cache-Control er iets aan kan doen. Dit hoort
        # in send_head en niet in do_GET: send_head doet die controle, en zowel
        # GET als HEAD komen er langs.
        for kop in ("If-Modified-Since", "If-None-Match"):
            if kop in self.headers:
                del self.headers[kop]
        return super().send_head()

    # Netlify onderschept een POST op elk pad van de site. Lokaal bootsen we
    # dat na voor de adressen die het formulier gebruikt: "/" met JavaScript,
    # "/bedankt" zonder.
    POST_PADEN = {"/", "/bedankt", "/bedankt.html", "/api/contact"}

    def do_POST(self):
        if self.path.split("?")[0] not in self.POST_PADEN:
            self.send_error(404)
            return

        lengte = int(self.headers.get("Content-Length") or 0)
        if lengte > 64 * 1024:                       # ruim boven een echte inzending
            self.send_error(413)
            return
        ruw = self.rfile.read(lengte).decode("utf-8", "replace")
        ctype = self.headers.get("Content-Type", "")

        if ctype.startswith("multipart/form-data"):  # fetch() met FormData
            grens = re.search(r"boundary=([^;]+)", ctype)
            velden = {}
            if grens:
                for deel in ruw.split("--" + grens.group(1).strip('"')):
                    m = re.search(r'name="([^"]+)"\r?\n\r?\n(.*?)\r?\n?$', deel, re.S)
                    if m:
                        velden.setdefault(m.group(1), []).append(m.group(2))
        else:                                        # gewone POST zonder JavaScript
            velden = urllib.parse.parse_qs(ruw, keep_blank_values=True)

        # Honeypot: ingevuld betekent bot. Stil accepteren, niets bewaren.
        if (velden.get("voorkeur", [""])[0] or "").strip():
            print("  honeypot ingevuld -> genegeerd", flush=True)
            self._klaar(velden, bot=True)
            return

        schoon, geweigerd = verwerk(velden)

        # Een halve aanvraag is geen aanvraag: niets bewaren, wel zeggen wat
        # er ontbreekt. De pagina toont bij een mislukte POST zijn eigen
        # foutregel met het telefoonnummer.
        leeg = ontbreekt(schoon)
        if leeg:
            print("\n  ONVOLLEDIG -> geweigerd: " + ", ".join(leeg), flush=True)
            if geweigerd:
                print("  GEWEIGERD: " + "; ".join(geweigerd), flush=True)
            self._fout(leeg)
            return

        tekst = als_tekst(schoon)

        os.makedirs(INBOX, exist_ok=True)
        # Tot op de microseconde. Op de seconde af kregen twee inzendingen
        # die kort na elkaar binnenkwamen dezelfde naam, en overschreef de
        # tweede de eerste. Een zoekgeraakte aanvraag is hier het ergste
        # wat er kan gebeuren, dus "x": liever een foutmelding dan stil verlies.
        naam = datetime.now().strftime("%Y%m%d-%H%M%S-%f") + ".txt"
        with io.open(os.path.join(INBOX, naam), "x", encoding="utf-8") as fh:
            fh.write(tekst)

        print("\n" + "=" * 62)
        print("INZENDING ONTVANGEN  ->  dev-inzendingen/" + naam)
        print("=" * 62)
        print(tekst, end="")
        if geweigerd:
            print("GEWEIGERD: " + "; ".join(geweigerd))
        print("=" * 62 + "\n")
        self._klaar(velden)

    def _fout(self, leeg):
        """422 met de namen van de lege velden, voor wie rechtstreeks post."""
        wil_json = "application/json" in (self.headers.get("Accept") or "")
        if wil_json:
            body = json.dumps({"ok": False, "leeg": leeg}).encode()
            ctype = "application/json"
        else:
            # Platte tekst, nooit de ingestuurde waarden terug op het scherm.
            body = ("Deze velden zijn verplicht en nog leeg:\n\n"
                    + "\n".join("- " + LABEL.get(n, n) for n in leeg)
                    + "\n\nGa terug in de browser en vul ze aan.\n"
                    ).encode("utf-8")
            ctype = "text/plain; charset=utf-8"
        self.send_response(422)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _klaar(self, velden, bot=False):
        wil_json = "application/json" in (self.headers.get("Accept") or "")
        if wil_json:
            body = json.dumps({"ok": True}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
        else:
            # Netlify stuurt de bezoeker zonder JavaScript door naar de
            # action van het formulier; dat doen we hier ook.
            body = b""
            self.send_response(303)
            self.send_header("Location", "/bedankt.html")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        # Stille GET-log; de inzendingen hierboven printen zichzelf al.
        regel = fmt % args
        if not regel.startswith('"GET'):
            sys.stderr.write("  %s\n" % regel)


if __name__ == "__main__":
    poort = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print("WelkomThuis dev-server op http://127.0.0.1:%d" % poort)
    print("Inzendingen komen in dev-inzendingen/ . Er wordt geen e-mail verstuurd.\n")
    ThreadingHTTPServer(("127.0.0.1", poort), Handler).serve_forever()
