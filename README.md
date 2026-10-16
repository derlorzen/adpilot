# AdPilot

Klickbarer Prototyp einer Amazon-Ads- und Multichannel-Suite für johtomarket.de (Shopify + Billbee, Amazon, eBay). Alle Zahlen sind Demo-Daten.

## Inhalt

- `prototype.dc.html` – der Prototyp als Design-Component-Datei (Claude Design Canvas). Logik und Markup in einer Datei; benötigt die Canvas-Runtime (`support.js`) zum Rendern.
- `canvas.json` – Artboard-Index des Canvas.

## Bereiche im Prototyp

Übersicht, Heute erledigen (Freigaben + Autopilot), Alle Artikel (Suche, Filter, Mehrfachauswahl für 800+ SKUs), Werbekampagnen (Liste + Detail mit Budget, Strategie, Keywords, Was-wäre-wenn), Buy Box & Preise (inkl. Preisregeln für Fremdmarken), eBay (Angebots-Check, Preisvergleich), Saison & Termine, Suchbegriffe, Gewinn pro Produkt (je Kanal), Lagerbestand, Berichte, Benachrichtigungen. Hell- und Dunkelmodus.

## Geplante Architektur (Kurzfassung)

- Amazon Ads API (Kuudo-MCP selbst gehostet), Amazon SP-API (Buy Box, FBA), Billbee-API (EK-Preise, Bestand), eBay Browse API (Konkurrenzpreise)
- Deterministische Regel-Engine mit Leitplanken für tägliche Optimierung; LLM für Analyse, Vorschläge und Erklärungen
- Billbee bleibt führend für Bestände; AdPilot überwacht nur
