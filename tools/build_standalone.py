#!/usr/bin/env python3
"""Baut aus prototype.dc.html eine eigenständig lauffähige index.html.

Die .dc.html-Datei enthält Markup mit {{Platzhaltern}}, <sc-for>/<sc-if> und eine
Component-Klasse. Dieses Skript bettet Vorlage und Logik zusammen mit einer kleinen
Render-Laufzeit (runtime.js) in eine einzige HTML-Datei ein.

Aufruf: python3 tools/build_standalone.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / 'prototype.dc.html').read_text(encoding='utf-8')
runtime = (ROOT / 'tools' / 'runtime.js').read_text(encoding='utf-8')

xdc = re.search(r'<x-dc>[\s\S]*</x-dc>', src).group(0)
helmet = re.search(r'<helmet>([\s\S]*?)</helmet>', xdc).group(1)
links = '\n'.join(re.findall(r'<link[^>]*>', helmet))
styles = '\n'.join(re.findall(r'<style>[\s\S]*?</style>', helmet))
script_tag = re.search(r'<script type="text/x-dc" data-dc-script([^>]*)>([\s\S]*?)</script>', src)
component = script_tag.group(2)
title = re.search(r'<title>(.*?)</title>', src).group(1)

if '</script' in xdc:
    raise SystemExit('Vorlage enthält </script> – kann nicht eingebettet werden')

html = f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
{links}
{styles}
</head>
<body>
<div id="app"></div>
<script type="text/x-template" id="dc-template">
{xdc}
</script>
<script>
{runtime}
{component}
mountDC(Component, document.getElementById('dc-template').textContent, document.getElementById('app'));
</script>
</body>
</html>
'''
(ROOT / 'index.html').write_text(html, encoding='utf-8')
print('index.html geschrieben:', len(html), 'Zeichen')
