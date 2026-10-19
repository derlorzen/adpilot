# Marktschreier

Klickbarer Prototyp für johtomarket.de: Produktdaten an einem Ort pflegen, Angebote auf Shopify, Amazon, eBay und TikTok Shop anlegen und aktuell halten, dazu Werbung und Chancenfinder. Bestände und Bestellungen bleiben bei Billbee. Arbeitstitel, alle Zahlen sind Demo-Daten.

## Ansehen

`index.html` im Browser öffnen. Es wird nichts installiert und kein Server gebraucht, die Datei läuft auch direkt vom Desktop oder über GitHub Pages (Settings > Pages > Branch `main`, Ordner `/`).

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Eigenständig lauffähige Version (wird gebaut, nicht von Hand bearbeiten) |
| `prototype.dc.html` | Quelle: Vorlage und Logik als Design-Component-Datei |
| `canvas.json` | Artboard-Index für den Claude-Design-Canvas |
| `tools/runtime.js` | Kleine Render-Laufzeit für `{{…}}`, `<sc-for>` und `<sc-if>` |
| `tools/build_standalone.py` | Baut `index.html` aus `prototype.dc.html` |

Nach Änderungen an `prototype.dc.html`:

```bash
python3 tools/build_standalone.py
```

## Bereiche im Prototyp

Übersicht mit Kanal-Kacheln, Kanäle & Angebote (Status je Kanal, Sammelaktionen mit KI, Meldungen, Abdeckung je Kategorie), Produkte (GTIN, Kanalstatus, Datenqualität) mit Produktansicht (Stammdaten, Reiter je Kanal mit Pflichtfeldern, Titel-Vererbung, KI-Texten und Veröffentlichen), Heute erledigen (Freigaben und Autopilot), Chancenfinder (wo sich Werbung lohnt: Produkte, Suchbegriffe, Konkurrenz-Seiten, Saison und Neuheiten; dazu Chancen ohne Werbebudget wie eBay-Lücken, Titel, Buy Box und Ladenhüter; Testbudget, Stopp-Regeln und Liste, wo keine Werbung sinnvoll ist), Suche, Filter und Mehrfachauswahl für 800+ SKUs, Werbekampagnen (Liste und Detail mit Budget, Strategie, Keywords, Was-wäre-wenn), Buy Box & Preise (inkl. Preisregeln für Fremdmarken), eBay (Angebots-Check, Preisvergleich), Saison & Termine, Suchbegriffe, Gewinn pro Produkt (je Kanal), Lagerbestand, Berichte, Benachrichtigungen. Navigation als Seitenleiste ab 1100 px Breite, darunter Menü-Knopf mit kompakter Liste. Hell- und Dunkelmodus.

## Geplante Architektur (Kurzfassung)

- Marktschreier führt Produktdaten (Texte, Bilder, Merkmale, Preise) und legt Angebote an, Billbee führt Bestände und Bestellungen. Pro Feld schreibt genau ein System.
- Kanäle: Shopify Admin API, Amazon SP-API (Listings), eBay Inventory API, TikTok Shop Partner API

- Amazon Ads API (Kuudo-MCP, selbst gehostet), Amazon SP-API (Buy Box, FBA), Billbee-API (Einkaufspreise, Bestand), eBay Browse API (Konkurrenzpreise)
- Deterministische Regel-Engine mit Leitplanken für die tägliche Optimierung, LLM für Analyse, Vorschläge und Erklärungen
- Billbee bleibt führend für Bestände, AdPilot überwacht nur
