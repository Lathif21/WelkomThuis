# Antwoord op de feedback — ronde 2

Datum: 9 september 2026
Betreft: kleurenpalet, "Ons verschil", de plek naast "Voor wie",
prijscalculator

**Alle vier de punten zijn verwerkt.** Twee ervan bleken een echte fout te zijn
in plaats van een kwestie van smaak: de kleur van de lopende tekst haalde het
contrast niet, en de witruimte naast "Voor wie" was een kolom die leeg was
blijven staan. Onderaan staat één vraag terug, plus iets wat ik onderweg nog
tegenkwam.

---

## 1. Het kleurenpalet

Je schreef dat je hier zelf nog niet uit was en vroeg om een voorstel. Hieronder
staat wat ik heb gedaan, waarom, en welke twee alternatieven ik heb overwogen.

### Wat het probleem was

Het groen was niet het probleem. De **neutrale kleuren eromheen** wel. Die hadden
een koele grijsgroene inslag: de achtergrond `#F2F4F0`, de tekstkleur van bijna
elke alinea `#5A6960`, de lijntjes `#CBD4C9`. Alle drie iets naar blauwgroen
toe. Samen geeft dat de indruk van een wachtzaal of een verzekeringskantoor —
correct, maar koel. Voor iemand die zijn huis van veertig jaar achterlaat is dat
de verkeerde toon.

En er zat een echte fout in, geen kwestie van smaak: **de kleur van de gewone
alinea's haalde het contrast niet.** Onze eigen afspraak voor deze doelgroep is
7:1. `#5A6960` haalde 5,24:1. Dat is de kleur van vrijwel elke lopende tekst op
de site.

### Wat ik heb gekozen

**Hetzelfde donkergroen, warme neutralen eromheen.** Het merkgroen en het
messing blijven; de grijzen en de achtergrond gaan van koel naar warm.

| Rol | Was | Wordt |
|---|---|---|
| Achtergrond | `#F2F4F0` koel grijsgroen | `#F5F2EC` warm linnen |
| Getinte blokken | `#E3E8E1` | `#EBE5D8` warm zand |
| Tekst (koppen) | `#1C2620` | `#211E19` warm bijna-zwart |
| **Tekst (alinea's)** | `#5A6960` — **5,24:1** | `#4B463D` — **8,38:1** |
| Messing op licht | `#B08A3E` — 2,90:1 | `#9A7430` — 3,82:1 |
| Messing op groen | *bestond niet apart* | `#D4AC5C` — 4,55:1 |
| Haarlijntjes | `#CBD4C9` — 1,37:1 | `#C9C0AC` — 1,62:1 |
| **Rand van invulvelden** | `#CBD4C9` — **1,37:1** | `#8E8674` — **3,23:1** |
| Donkergroen | `#2F4A3C` | **onveranderd** |

Drie dingen daaruit zijn het uitleggen waard:

- **Het groen blijft exact hetzelfde.** Je logo staat met die hexcode
  ingebakken in vier bestanden en in het favicon. Het groen veranderen betekent
  een nieuw logo, een nieuw favicon en een nieuwe app-icoon. Dat is een aparte
  beslissing, geen bijzaak van een kleurpalet — en het groen zelf is niet wat de
  site koel maakte.
- **Messing bestaat nu in twee sterktes.** Eén waarde kán niet: donker genoeg om
  op een lichte achtergrond leesbaar te zijn (3:1) én licht genoeg om op het
  donkergroene blok te werken (4,5:1, want dat labeltje is tekst). Vroeger was
  het één waarde en viel het aan één van de twee kanten door de mand.
- **De rand van een invulveld was bijna onzichtbaar.** 1,37:1 op wit. Je zag
  niet waar een veld begon. De richtlijn vraagt daar 3:1 voor, en dat is nu
  gehaald. Dit is de aanpassing die iemand van tachtig het meest zal merken,
  ook al is het de minst zichtbare op een schermafbeelding.

**Alle 25 kleurcombinaties die de site echt gebruikt zijn nagemeten en halen de
eis.** Voor de aanpassing waren dat er vier niet.

### De twee alternatieven

Ik heb ze doorgerekend, niet alleen bedacht. Beide halen de contrasteisen ook.

- **Linnen met diep petrolblauw** (`#1E3A4C`). Blauw wordt breed als
  betrouwbaar gelezen. Maar het is óók de kleur van ziekenhuizen, banken en
  zorgverzekeraars, en dat is precies het register dat WelkomThuis níet moet
  hebben: dit is een emotionele dienst, geen administratieve.
- **Warm grijs met rozenhout** (`#5E2A33`). Mooi, en het doet denken aan een
  oud familiehuis met boeken en donker hout. Onderscheidend ook — bijna niemand
  in deze sector gebruikt het. Maar het leunt naar het traditionele en het
  antiquarische, en het botst met het groen van je logo.

Waarom groen blijft: in de sector waar jij in zit (interieur plus begeleiding)
is warm groen met een houtachtig accent de toon die het dichtst bij "thuis"
komt, en het staat al in je merk. Het enige wat eraan mankeerde was de kou
eromheen, en dat is nu weg.

**Als je liever een van de twee alternatieven ziet: het zijn tien regels in één
bestand.** Zeg het maar, dan zet ik het om en kun je het vergelijken.

## 2. Ons verschil — ingekort

Alle drie de blokken staan nu op de kernfunctie, met jouw woorden:

| Blok | Tekst |
|---|---|
| Een binnenhuisarchitect | Het ontwerp van uw nieuwe woning: indeling, stijl, kleuren en de keuze van meubels. |
| Een verhuisfirma | De praktische uitvoering van de verhuis: transport, tillen, en meubels demonteren en opnieuw monteren. |
| WelkomThuis | De twee hierboven samen: van uitkiezen wat meegaat, over de verhuis zelf, tot het inrichten van uw nieuwe woning. Eén aanspreekpunt voor het hele traject. |

De tweede alinea in het WelkomThuis-blok is geschrapt. Wat daar stond
("u hoeft zelf geen partijen te zoeken", "persoonlijk en overzichtelijk") komt
verderop op de pagina toch al terug.

## 3. De plek naast "Voor wie is WelkomThuis?"

**Er staat nu een tekening. En ik heb gevonden waar die witruimte vandaan
kwam — dat was een fout, geen opmaakkeuze.**

Die plek was een rooster van twee kolommen: tekst links, het kader met vragen
rechts. Vorige ronde vroeg je dat kader weg. De tekst bleef in de linkerkolom
staan en **de rechterkolom bleef gereserveerd, maar leeg** — 45% van de
breedte, gevuld met niets. Dat is precies de leegte die je zag.

Nu verdwijnt die kolom als er niets in staat. Er staat wél iets in: een
lijntekening van een hoekje van de nieuwe woning — een fauteuil bij het raam,
een schemerlamp, een plant, een lijstje aan de muur.

### De tekst is er korter op geworden

Met een tekening ernaast viel op dat de tekst een stuk langer was dan de
tekening hoog is. Bij het nalezen bleek de reden: **twee alinea's zeiden
hetzelfde.** "op een manier die past bij de persoon, de woning én het budget"
en "stemmen we de begeleiding af op uw wensen en uw budget" — dat is tweemaal
dezelfde belofte.

De tekst gaat van **vijf alinea's naar drie**, van 143 naar 94 woorden. Er is
geen enkel idee geschrapt: wie het is voor, dat familie er ook bij hoort, en
dat u zelf bepaalt hoeveel begeleiding u wil. Alleen de herhaling is eruit.
Voor lezers van tachtig is dat sowieso winst — kortere alinea's houden ze
makkelijker vast.

### Waarom een tekening en geen foto

**Ik heb met opzet geen foto gemaakt.** Een verzonnen woonkamerfoto zou lezen
als een interieur dat jij hebt ingericht, en dat is het niet. Wie dat later
merkt, gaat twijfelen aan de rest van de site. Een tekening doet die belofte
niet: iedereen ziet meteen dat het een illustratie is.

De tekening is in dezelfde stijl als de iconen bij "Ons verschil", gebruikt
alleen kleuren uit het nieuwe palet, en is een paar kilobyte groot — hij blijft
scherp op elk scherm en vertraagt niets.

De keuze van wat erop staat is niet toevallig: **de fauteuil bij het raam**.
Dat is geen willekeurig meubel maar het soort concrete ding waar jouw werk over
gaat — welke stoel gaat mee, en waar komt hij te staan.

### Een echte foto blijft beter

De tekening is een goede tussenoplossing, geen eindpunt. Zodra je een foto
hebt, vervangt die dit blok; dat is een kwestie van minuten. Wat het beste
werkt, in volgorde:

1. Een **kamer die je hebt ingericht** — een ingerichte hoek in een
   serviceflat. Dit is veruit de sterkste: het toont het resultaat.
2. Het **werk zelf**: dozen met labels op tafel, een plattegrond met meubels
   erop uitgetekend, kasten waar wordt uitgesorteerd.
3. Jij **aan het werk** bij iemand thuis.

Praktisch: minstens **1.400 pixels breed**, liggend (ongeveer 4:3), daglicht,
geen flits. Gezichten hoeven er niet op — en staat er iemand op die niet jij
bent, dan heb ik daar schriftelijke toestemming voor nodig voor de
privacyverklaring. Een recente telefoon is ruim voldoende.

## 4. De prijscalculator

**Eén fout verklaarde beide klachten.** Het was geen kwestie van opmaak maar een
echte bug, en een verraderlijke.

De vijf fases zijn technisch niet hetzelfde soort element: fase 1 is een
gewoon blok, fase 2 tot 5 zijn invulgroepen. In de opmaak stond een regel die
"de eerste" van de fases anders moest behandelen — geen streep, geen ruimte
erboven — omdat die bovenaan het kader staat. Maar die regel keek naar *het
eerste van elk soort*, en dat waren er dus **twee**: fase 1 én fase 2.

Gevolg: fase 2 verloor zijn streep **en** de ruimte boven zijn titel. Die
ruimte viel weg naar het blok erboven, waardoor de witruimte optisch bij fase 1
hoorde in plaats van bij de titel van fase 2. Dat is exact wat je beschreef:
de scheiding zat na de titel in plaats van ervoor.

Nu heeft **elke fase een streep boven zijn titel** en overal dezelfde ruimte
eronder, zodat de witruimte bij de volgende titel hoort.

Eén uitzondering, met opzet: **fase 1 krijgt geen eigen streep.** De bovenrand
van het kader staat daar al, op vrijwel dezelfde afstand van de titel (2,5 tegen
2,25). Een tweede lijn een centimeter daaronder leest als een vergissing. Wil je
hem er tóch bij, dan is dat één regel — zeg het maar.

---

## Eén vraag terug

**De volgorde van de blokken bij "Ons verschil".** Vorige ronde vroeg je
uitdrukkelijk: *"Blok 1 en 2 omwisselen graag"*, en zo staat het nu — eerst de
binnenhuisarchitect, dan de verhuisfirma, dan WelkomThuis. In je nieuwe lijst
noem je ze in de andere volgorde: eerst de verhuisfirma.

Ik heb de volgorde **gelaten zoals je die vorige keer vroeg**, want dat was een
expliciete instructie en dit leek eerder de volgorde waarin je het opschreef.
Maar zeg het als je het toch omgedraaid wil.

---

## Nog open uit ronde 1

Deze staan er nog steeds, los van deze ronde:

| Wat | Waarom |
|---|---|
| Tarief voor een studio | Staat niet in je prijslijst; nu gerekend als één kamer (€ 1.200). |
| Bevestiging fase 3 | € 600 in plaats van € 750. |
| Verplichte velden | Naam + telefoon, of ook e-mail? |
| Rechtsvorm | Voor de voettekst: eenmanszaak, BV, VOF? |
| Bewaartermijnen | Nu twaalf maanden en zeven jaar. Voorstel, geen beslissing. |
| Nalezing privacyverklaring | Door iemand met juridische achtergrond. |
| Kortere privacyverklaring? | Kan een pak korter zonder iets verplichts te schrappen. Aanbod staat nog. |
| Een professionele foto | Zie punt 3 hierboven. |

---

## Nog iets gevonden tijdens het nakijken

Niet gevraagd, wel gerepareerd. **Op een smalle telefoon (320px) kon je de hele
pagina zijwaarts schuiven.**

De oorzaak is typisch Nederlands: het woord **"binnenhuisarchitect"** in de
titel van "Ons verschil". Dat woord is op zo'n scherm 331 pixels breed in een
kolom van 265 pixels. Eén woord dat niet past duwt niet alleen zichzelf naar
buiten, maar de héle pagina — die werd 46 pixels breder dan het scherm, en dan
kun je overal zijwaarts schuiven.

Lange titels breken nu netjes af op lettergrepen. Nagemeten op 320, 360 en
414 pixels breed: de pagina past nu overal precies.
