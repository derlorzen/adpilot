# AdPilot

Klickbarer Prototyp einer Amazon-Ads- und Multichannel-Suite für johtomarket.de (Shopify + Billbee, Amazon, eBay). Alle Zahlen sind Demo-Daten.

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

Übersicht, Heute erledigen (Freigaben und Autopilot), Chancenfinder (wo sich Werbung lohnt: Produkte, Suchbegriffe, Konkurrenz-Seiten, Saison und Neuheiten; dazu Chancen ohne Werbebudget wie eBay-Lücken, Titel, Buy Box und Ladenhüter; Testbudget, Stopp-Regeln und Liste, wo keine Werbung sinnvoll ist), Alle Artikel (Suche, Filter, Mehrfachauswahl für 800+ SKUs), Werbekampagnen (Liste und Detail mit Budget, Strategie, Keywords, Was-wäre-wenn), Buy Box & Preise (inkl. Preisregeln für Fremdmarken), eBay (Angebots-Check, Preisvergleich), Saison & Termine, Suchbegriffe, Gewinn pro Produkt (je Kanal), Lagerbestand, Berichte, Benachrichtigungen. Hell- und Dunkelmodus.

## Geplante Architektur (Kurzfassung)

- Amazon Ads API (Kuudo-MCP, selbst gehostet), Amazon SP-API (Buy Box, FBA), Billbee-API (Einkaufspreise, Bestand), eBay Browse API (Konkurrenzpreise)
- Deterministische Regel-Engine mit Leitplanken für die tägliche Optimierung, LLM für Analyse, Vorschläge und Erklärungen
- Billbee bleibt führend für Bestände, AdPilot überwacht nur
