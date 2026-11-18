#!/usr/bin/env python3
"""Build the agency model catalog as print HTML, then a PDF."""

from __future__ import annotations

import html
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HTML_PATH = ROOT / "katalog.html"
PDF_PATH = ROOT / "Modellkatalog.pdf"

CATS = ["Frontier", "Stark", "Alltag", "Volumen", "Spezial"]

CAT_LEAD = {
    "Frontier": "Höchste Stufe. Schwierigste Planung, tiefste Analyse, anspruchsvollstes Programmieren.",
    "Stark": "Komplexes Denken, schweres Coding, lange Agentenläufe.",
    "Alltag": "Die meisten Kundenaufgaben. Programmierung und normale Arbeit bei brauchbarem Verhältnis aus Qualität, Tempo und Preis.",
    "Volumen": "Schnell und günstig. Hohe Stückzahl: Klassifizieren, Extraktion, einfache Chats, Chatbots.",
    "Spezial": "Sehen, visuelle Aufgaben, Computersteuerung. Die Kategorie beschreibt die Art der Aufgabe.",
}

MODELS: list[dict] = [
    {
        "name": "GPT-6.2 Astra",
        "cat": "Frontier",
        "line": "Astra",
        "generation": "6.2",
        "family": "GPT",
        "vendor": "OpenAI",
        "slug": None,
        "callable": False,
        "effort": [],
        "fast": False,
        "source": "Angabe",
        "quote": "am stärksten für komplexe Aufgaben, Analysen und anspruchsvolle Programmierung",
        "role": "Obergrenze der GPT-Reihe in dieser Ordnung. Komplexe Aufgaben, Analysen und anspruchsvolle Programmierung laufen hier, wenn Astra verfügbar ist.",
        "note": "Neueste Astra-Version. Steht innerhalb von Frontier vor GPT-6 Astra.",
    },
    {
        "name": "GPT-6 Astra",
        "cat": "Frontier",
        "line": "Astra",
        "generation": "6",
        "family": "GPT",
        "vendor": "OpenAI",
        "slug": None,
        "callable": False,
        "effort": [],
        "fast": False,
        "source": "Linie",
        "quote": None,
        "role": "Dieselbe Frontier-Rolle wie GPT-6.2 Astra, eine Generation älter. Wenn beide verfügbar sind, kommt 6.2 zuerst.",
        "note": "In der Ausgangsliste ohne eigenen Stärketext. Die Kategorie folgt der Astra-Linie.",
    },
    {
        "name": "Claude Fable 5.2",
        "cat": "Frontier",
        "line": "Fable",
        "generation": "5.2",
        "family": "Claude",
        "vendor": "Anthropic",
        "slug": "claude-fable-5-2",
        "callable": True,
        "effort": ["low", "medium", "high", "xhigh", "max"],
        "fast": False,
        "source": "Angabe",
        "quote": "Höchste Stufe (Mythos-Klasse), mit zusätzlichen Sicherheitsmaßnahmen für Biologie und Cybersecurity. Für die schwierigsten Aufgaben.",
        "role": "Obergrenze der Claude-Reihe und das Frontier-Modell, das diese Sitzung starten kann. Die zusätzlichen Sicherheitsmaßnahmen für Biologie und Cybersecurity gehören zum Modell.",
        "note": "Mythos-Klasse. Claude Mythos 5.2 liegt auf derselben Stufe, hat in dieser Sitzung aber keinen eigenen Aufrufnamen.",
    },
    {
        "name": "Claude Mythos 5.2",
        "cat": "Frontier",
        "line": "Mythos",
        "generation": "5.2",
        "family": "Claude",
        "vendor": "Anthropic",
        "slug": None,
        "callable": False,
        "effort": [],
        "fast": False,
        "source": "Angabe",
        "quote": "Claude Mythos 5.2 gehört zur selben Stufe wie Fable 5.2.",
        "role": "Frontier, gleiche Stufe wie Fable 5.2. Für diese Sitzung ist der startbare Name der Mythos-Klasse claude-fable-5-2.",
        "note": "Kein separater Slug in der Aufrufliste.",
    },
    {
        "name": "Claude Mythos Preview",
        "cat": "Frontier",
        "line": "Mythos",
        "generation": "Preview",
        "family": "Claude",
        "vendor": "Anthropic",
        "slug": None,
        "callable": False,
        "effort": [],
        "fast": False,
        "source": "Angabe",
        "quote": "Claude Mythos Preview ist nicht öffentlich und wird nur von wenigen ausgewählten Organisationen genutzt.",
        "role": "Frontier mit eingeschränktem Zugang. Dieselbe Stufe wie Fable 5.2 und Mythos 5.2. Die Preview ändert die Kategorie nicht, sie ändert nur, wer das Modell bekommt.",
        "note": "Nicht öffentlich. In dieser Sitzung nicht startbar.",
    },
    {
        "name": "Claude Opus 5.5",
        "cat": "Stark",
        "line": "Opus",
        "generation": "5.5",
        "family": "Claude",
        "vendor": "Anthropic",
        "slug": "claude-opus-5-5",
        "callable": True,
        "effort": ["low", "medium", "high", "xhigh", "max"],
        "fast": False,
        "source": "Angabe",
        "quote": "Sehr stark bei komplexem Denken, Coding und langen Agenten-Aufgaben.",
        "role": "Schwierige Planung, Code und Analyse, solange die Aufgabe die Obergrenze von Fable nicht braucht. In der Agentur-Zuteilung steht Opus neben Fable für die schwere Arbeit. Opus bleibt Stark, Fable bleibt Frontier, damit die beiden Stufen auseinanderzuhalten sind.",
        "note": "Vollständiger Effort-Bereich bis max. Keine Fast-Variante in der Aufrufliste.",
    },
    {
        "name": "Grok 4.7",
        "cat": "Stark",
        "line": "Grok",
        "generation": "4.7",
        "family": "Grok",
        "vendor": "diese Sitzung",
        "slug": "grok-4.7",
        "callable": True,
        "effort": ["low", "medium", "high", "xhigh"],
        "fast": True,
        "source": "Einschätzung",
        "quote": None,
        "role": "Modell dieser Sitzung. Arbeitskategorie Stark für Agentenarbeit, Code und Analyse. Die Einordnung setzt es auf die Höhe von Opus, nicht auf die Höhe von Astra oder Fable. Dafür liegt kein Vergleichstext vor.",
        "note": "Fast-Variante: grok-4.7-fast. Dieselbe Kategorie. Effort endet bei xhigh, ein max-Suffix gibt es hier nicht.",
    },
    {
        "name": "Composer 2.5",
        "cat": "Stark",
        "line": "Composer",
        "generation": "2.5",
        "family": "Cursor",
        "vendor": "Cursor",
        "slug": "composer-2.5",
        "callable": True,
        "effort": [],
        "fast": True,
        "source": "Einschätzung",
        "quote": None,
        "role": "Cursor-Modell mit Schwerpunkt Programmieren. Stark, weil es für Coding-Arbeit gebaut ist. Ohne Herstellertext aus der Ausgangsliste bleibt das eine Arbeitsordnung.",
        "note": "Fast-Variante: composer-2.5-fast. In der Aufrufliste gibt es keine Effort-Suffixe, nur die Fast-Variante.",
    },
    {
        "name": "Gemini 4 Neon",
        "cat": "Stark",
        "line": "Gemini",
        "generation": "4 Neon",
        "family": "Gemini",
        "vendor": "Google",
        "slug": "gemini-4-neon",
        "callable": True,
        "effort": ["low", "medium", "high", "xhigh"],
        "fast": False,
        "source": "Einschätzung",
        "quote": None,
        "role": "Vorläufig Stark. Der Effort-Deckel reicht bis xhigh und liegt damit eine Stufe über Gemini 4 Carbon, das bei high endet. Das ist der Grund für die höhere Kategorie, kein Benchmark.",
        "note": "Keine Fast-Variante in der Aufrufliste. Anbieter ist Google. Ein Stärketext aus der Ausgangsliste fehlt.",
    },
    {
        "name": "GPT-6.2 Sol",
        "cat": "Alltag",
        "line": "Sol",
        "generation": "6.2",
        "family": "GPT",
        "vendor": "OpenAI",
        "slug": None,
        "callable": False,
        "effort": [],
        "fast": False,
        "source": "Angabe",
        "quote": "schnell und sehr gut für Programmierung und Alltagsaufgaben",
        "role": "Aktuelle Sol-Wahl für Programmierung und normale Kundenaufgaben, sobald GPT-6.2 Sol verfügbar ist. Die Sol-Linie bleibt Alltag, auch wenn der Text „sehr gut für Programmierung“ sagt. Schwere, lange Agentenarbeit geht an Stark. Die Obergrenze geht an Frontier.",
        "note": "Neueste Sol-Version. In dieser Sitzung nicht startbar. Hier übernimmt GPT-5.6 Sol die Sol-Rolle.",
    },
    {
        "name": "GPT-6.1 Sol",
        "cat": "Alltag",
        "line": "Sol",
        "generation": "6.1",
        "family": "GPT",
        "vendor": "OpenAI",
        "slug": None,
        "callable": False,
        "effort": [],
        "fast": False,
        "source": "Linie",
        "quote": None,
        "role": "Sol-Linie, Alltag. Steht hinter GPT-6.2 Sol und vor GPT-6 Sol.",
        "note": "In der Ausgangsliste ohne eigenen Stärketext.",
    },
    {
        "name": "GPT-6 Sol",
        "cat": "Alltag",
        "line": "Sol",
        "generation": "6",
        "family": "GPT",
        "vendor": "OpenAI",
        "slug": None,
        "callable": False,
        "effort": [],
        "fast": False,
        "source": "Linie",
        "quote": None,
        "role": "Sol-Linie, Alltag. Steht hinter GPT-6.1 Sol und vor GPT-5.6 Sol.",
        "note": "In der Ausgangsliste ohne eigenen Stärketext.",
    },
    {
        "name": "GPT-5.6 Sol",
        "cat": "Alltag",
        "line": "Sol",
        "generation": "5.6",
        "family": "GPT",
        "vendor": "OpenAI",
        "slug": "gpt-5.6-sol",
        "callable": True,
        "effort": ["none", "low", "medium", "high", "xhigh", "max"],
        "fast": True,
        "source": "Linie",
        "quote": None,
        "role": "Einziges GPT, das diese Sitzung direkt starten kann. Es übernimmt die Sol-Rolle (Alltag, Programmierung und normale Aufgaben), weil GPT-6.2 Sol, GPT-6.1 Sol und GPT-6 Sol hier keinen Slug haben.",
        "note": "Fast-Variante: gpt-5.6-sol-fast. Effort von none bis max. none ist die sparsamste Stufe und kommt nur bei diesem Modell und bei Muse (dort als minimal) vor.",
    },
    {
        "name": "GPT-5.5",
        "cat": "Alltag",
        "line": "Chat",
        "generation": "5.5",
        "family": "GPT",
        "vendor": "OpenAI",
        "slug": None,
        "callable": False,
        "effort": [],
        "fast": False,
        "source": "Angabe",
        "quote": "GPT-5.5 (chat gpt)",
        "role": "Allgemeines Chat-Modell ohne Astra-, Sol-, Terra- oder Luna-Linie. Solche Modelle landen fest in Alltag. Ein Stärketext über den Hinweis „ChatGPT“ hinaus liegt nicht vor.",
        "note": "Älter als die 5.6-Linien Sol, Terra und Luna. Die fehlende Linie ist der Grund für Alltag, nicht das Alter.",
    },
    {
        "name": "Claude Sonnet 5.5",
        "cat": "Alltag",
        "line": "Sonnet",
        "generation": "5.5",
        "family": "Claude",
        "vendor": "Anthropic",
        "slug": "claude-sonnet-5-5",
        "callable": True,
        "effort": ["low", "medium", "high", "xhigh", "max"],
        "fast": False,
        "source": "Angabe",
        "quote": "Gutes Verhältnis aus Qualität, Tempo und Preis. Ein guter Standard für den Alltag.",
        "role": "Standard für die meisten Kundenaufgaben. In der Agentur-Zuteilung ist Sonnet die Alltagswahl auf der Claude-Seite. GPT-seitig entspricht das der aktuellen Sol-Version.",
        "note": "Effort bis max. Keine Fast-Variante in der Aufrufliste.",
    },
    {
        "name": "Grok 4.6",
        "cat": "Alltag",
        "line": "Grok",
        "generation": "4.6",
        "family": "Grok",
        "vendor": "diese Sitzung",
        "slug": "cursor-grok-4.6",
        "callable": True,
        "effort": ["low", "medium", "high", "xhigh"],
        "fast": True,
        "source": "Einschätzung",
        "quote": None,
        "role": "Vorherige Grok-Generation in der Aufrufliste. Alltag, eine Arbeitsstufe unter Grok 4.7. Das ist die Ausnahme von der Versionsregel und gilt nur für Einschätzungen: bei Astra, Sol, Terra, Luna und Claude ändert die Version die Kategorie nie.",
        "note": "Der Slug trägt das Präfix cursor-. Fast-Variante: cursor-grok-4.6-fast. Effort bis xhigh.",
    },
    {
        "name": "Gemini 4 Carbon",
        "cat": "Alltag",
        "line": "Gemini",
        "generation": "4 Carbon",
        "family": "Gemini",
        "vendor": "Google",
        "slug": "gemini-4-carbon",
        "callable": True,
        "effort": ["low", "medium", "high"],
        "fast": False,
        "source": "Einschätzung",
        "quote": None,
        "role": "Vorläufig Alltag. Effort endet bei high. Gemini 4 Neon geht bis xhigh und liegt deshalb eine Arbeitsstufe höher. Auch das ist eine Einschätzung, kein gemessener Abstand.",
        "note": "Keine Fast-Variante. Kein max- und kein xhigh-Suffix.",
    },
    {
        "name": "Muse Wonder 1.0",
        "cat": "Alltag",
        "line": "Muse",
        "generation": "1.0",
        "family": "Muse",
        "vendor": "nicht genannt",
        "slug": "muse-wonder-1.0",
        "callable": True,
        "effort": ["minimal", "low", "medium", "high", "xhigh", "max"],
        "fast": False,
        "source": "Einschätzung",
        "quote": None,
        "role": "Alltag, bis ein Stärketext die Linie festlegt. Der Effort-Bereich ist der breiteste in der Aufrufliste und reicht von minimal bis max. Die Breite allein hebt das Modell nicht nach Stark oder Frontier.",
        "note": "Keine Fast-Variante. Anbieter steht in der Aufrufliste nicht dabei.",
    },
    {
        "name": "GPT-6 Luna",
        "cat": "Volumen",
        "line": "Luna",
        "generation": "6",
        "family": "GPT",
        "vendor": "OpenAI",
        "slug": None,
        "callable": False,
        "effort": [],
        "fast": False,
        "source": "Angabe",
        "quote": "schnell und günstig für einfachere Aufgaben",
        "role": "Volumen auf der GPT-Seite. Einfache Aufgaben, bei denen Tempo und Preis vor der Tiefe kommen. Neuere Luna-Version gegenüber GPT-5.6 Luna.",
        "note": "In dieser Sitzung nicht startbar. Haiku ist die Claude-Entsprechung und hier ebenfalls nicht startbar.",
    },
    {
        "name": "GPT-5.6 Luna",
        "cat": "Volumen",
        "line": "Luna",
        "generation": "5.6",
        "family": "GPT",
        "vendor": "OpenAI",
        "slug": None,
        "callable": False,
        "effort": [],
        "fast": False,
        "source": "Linie",
        "quote": None,
        "role": "Luna-Linie, Volumen. Steht hinter GPT-6 Luna.",
        "note": "In der Ausgangsliste ohne eigenen Stärketext. Nicht startbar in dieser Sitzung.",
    },
    {
        "name": "Claude Haiku 5.5",
        "cat": "Volumen",
        "line": "Haiku",
        "generation": "5.5",
        "family": "Claude",
        "vendor": "Anthropic",
        "slug": "claude-haiku-5-5",
        "callable": False,
        "effort": [],
        "fast": False,
        "source": "Angabe",
        "quote": "Am schnellsten und günstigsten, gut für einfache, massenhafte Aufgaben (Klassifizieren, Chatbots, Extraktion).",
        "role": "Erste Volumen-Wahl der Agentur, sobald der API-Zugang besteht. Klassifizieren, Chatbots, Extraktion, hohe Stückzahl. Der API-Name steht fest. Diese Sitzung kann Haiku trotzdem nicht als Subagenten starten.",
        "note": "Slug ist der API-Name aus der Claude-Tabelle, kein Eintrag der Aufrufliste. Deshalb Aufruf hier: nein.",
    },
    {
        "name": "GPT-6.1 Terra",
        "cat": "Spezial",
        "line": "Terra",
        "generation": "6.1",
        "family": "GPT",
        "vendor": "OpenAI",
        "slug": None,
        "callable": False,
        "effort": [],
        "fast": False,
        "source": "Angabe",
        "quote": "besonders gut für visuelle Aufgaben und Computersteuerung",
        "role": "Spezial, sobald die Aufgabe Bilder, Oberflächen oder die Steuerung eines Rechners braucht. Die Kategorie sagt nichts über eine geringere Denkleistung. Sie sagt, wofür die Linie gewählt wird. Der restliche Denkanteil kann trotzdem schwer sein.",
        "note": "Neuere Terra-Version. In dieser Sitzung nicht startbar. Ein visuelles Modell aus der Aufrufliste gibt es hier nicht.",
    },
    {
        "name": "GPT-5.6 Terra",
        "cat": "Spezial",
        "line": "Terra",
        "generation": "5.6",
        "family": "GPT",
        "vendor": "OpenAI",
        "slug": None,
        "callable": False,
        "effort": [],
        "fast": False,
        "source": "Linie",
        "quote": None,
        "role": "Terra-Linie, Spezial. Steht hinter GPT-6.1 Terra.",
        "note": "In der Ausgangsliste ohne eigenen Stärketext. Nicht startbar in dieser Sitzung.",
    },
]


def e(value: object) -> str:
    return html.escape(str(value), quote=True)


def effort_label(levels: list[str], fast: bool) -> str:
    parts = []
    if levels:
        parts.append(" · ".join(levels))
    else:
        parts.append("keine Effort-Suffixe")
    if fast:
        parts.append("Fast-Variante")
    return ", ".join(parts)


def sheet(model: dict) -> str:
    facts = [
        ("Kategorie", model["cat"]),
        ("Linie", model["line"]),
        ("Generation", model["generation"]),
        ("Reihe", model["family"]),
        ("Anbieter", model["vendor"]),
        ("Herkunft", model["source"]),
        ("Slug", model["slug"] or "—"),
        ("Aufruf hier", "ja" if model["callable"] else "nein"),
        ("Effort und Modus", effort_label(model["effort"], model["fast"])),
    ]
    fact_html = "".join(
        f"<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>" for k, v in facts
    )
    quote = ""
    if model["quote"]:
        quote = f"<p class=\"quote\"><span>Wortlaut</span> „{e(model['quote'])}“</p>"
    return f"""
<article class="sheet">
  <header>
    <p class="kicker">{e(model["cat"])} · {e(model["source"])}</p>
    <h3>{e(model["name"])}</h3>
  </header>
  <dl class="facts">{fact_html}</dl>
  {quote}
  <p><strong>Einsatz.</strong> {e(model["role"])}</p>
  <p class="note">{e(model["note"])}</p>
</article>
"""


def rows_for(cat: str) -> str:
    body = []
    for model in MODELS:
        if model["cat"] != cat:
            continue
        body.append(
            "<tr>"
            f"<td>{e(model['name'])}</td>"
            f"<td>{e(model['slug'] or '—')}</td>"
            f"<td>{'ja' if model['callable'] else 'nein'}</td>"
            f"<td>{e(model['source'])}</td>"
            f"<td>{e(model['generation'])}</td>"
            "</tr>"
        )
    return "\n".join(body)


def category_section(cat: str) -> str:
    members = [m for m in MODELS if m["cat"] == cat]
    sheets = "\n".join(sheet(m) for m in members)
    return f"""
<section class="chapter">
  <p class="kicker">Kategorie</p>
  <h2>{e(cat)}</h2>
  <p class="lead">{e(CAT_LEAD[cat])}</p>
  <p class="count">{len(members)} Modelle, in der Reihenfolge, in der sie innerhalb der Kategorie gewählt werden.</p>
  {sheets}
</section>
"""


def matrix() -> str:
    groups = []
    for cat in CATS:
        groups.append(
            f"""
<h3>{e(cat)}</h3>
<table>
  <thead>
    <tr><th>Modell</th><th>Slug</th><th>Aufruf hier</th><th>Herkunft</th><th>Generation</th></tr>
  </thead>
  <tbody>
    {rows_for(cat)}
  </tbody>
</table>
"""
        )
    return "\n".join(groups)


def slug_catalog() -> str:
    lines = [
        ("claude-fable-5-2", "Frontier", "low, medium, high, xhigh, max", "nein"),
        ("claude-opus-5-5", "Stark", "low, medium, high, xhigh, max", "nein"),
        ("claude-sonnet-5-5", "Alltag", "low, medium, high, xhigh, max", "nein"),
        ("grok-4.7", "Stark", "low, medium, high, xhigh", "ja, grok-4.7-fast"),
        ("composer-2.5", "Stark", "keine", "ja, composer-2.5-fast"),
        ("gemini-4-neon", "Stark", "low, medium, high, xhigh", "nein"),
        ("gpt-5.6-sol", "Alltag", "none, low, medium, high, xhigh, max", "ja, gpt-5.6-sol-fast"),
        ("cursor-grok-4.6", "Alltag", "low, medium, high, xhigh", "ja, cursor-grok-4.6-fast"),
        ("gemini-4-carbon", "Alltag", "low, medium, high", "nein"),
        ("muse-wonder-1.0", "Alltag", "minimal, low, medium, high, xhigh, max", "nein"),
    ]
    rows = "\n".join(
        "<tr>" + "".join(f"<td>{e(cell)}</td>" for cell in line) + "</tr>" for line in lines
    )
    return f"""
<table>
  <thead>
    <tr><th>Basis-Slug</th><th>Kategorie</th><th>Effort-Suffixe</th><th>Fast</th></tr>
  </thead>
  <tbody>
    {rows}
  </tbody>
</table>
"""


def build_html() -> str:
    n = len(MODELS)
    callable_n = sum(1 for m in MODELS if m["callable"])
    sections = "\n".join(category_section(cat) for cat in CATS)
    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8"/>
<title>Modellkatalog — fünf feste Kategorien</title>
<style>
@font-face {{
  font-family: "Inter";
  src: url("file:///usr/share/fonts/truetype/macos/Inter-Regular.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
}}
@font-face {{
  font-family: "Inter";
  src: url("file:///usr/share/fonts/truetype/macos/Inter-Medium.ttf") format("truetype");
  font-weight: 500;
  font-style: normal;
}}
@font-face {{
  font-family: "Inter";
  src: url("file:///usr/share/fonts/truetype/macos/Inter-SemiBold.ttf") format("truetype");
  font-weight: 600;
  font-style: normal;
}}
@font-face {{
  font-family: "Inter";
  src: url("file:///usr/share/fonts/truetype/macos/Inter-Bold.ttf") format("truetype");
  font-weight: 700;
  font-style: normal;
}}
@font-face {{
  font-family: "Inter";
  src: url("file:///usr/share/fonts/truetype/macos/Inter-Italic.ttf") format("truetype");
  font-weight: 400;
  font-style: italic;
}}
@page {{
  size: A4;
  margin: 16mm 15mm 18mm 15mm;
  @bottom-left {{
    content: "Modellkatalog  ·  fünf feste Kategorien";
    font-family: Inter, sans-serif;
    font-size: 8.5pt;
    color: #6e6a64;
  }}
  @bottom-right {{
    content: counter(page);
    font-family: Inter, sans-serif;
    font-size: 8.5pt;
    color: #6e6a64;
  }}
}}
@page :first {{
  margin: 0;
  @bottom-left {{ content: none; }}
  @bottom-right {{ content: none; }}
}}
* {{ box-sizing: border-box; }}
html {{
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}}
body {{
  margin: 0;
  color: #1c1b19;
  font-family: Inter, "Noto Sans", sans-serif;
  font-size: 10.5pt;
  line-height: 1.45;
}}
.cover {{
  page-break-after: always;
  min-height: 297mm;
  padding: 22mm 18mm 16mm;
  background: #f3f1ec;
  display: flex;
  flex-direction: column;
}}
.eyebrow {{
  margin: 0 0 10mm;
  font-size: 9pt;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #3d5c54;
  font-weight: 600;
}}
h1 {{
  margin: 0;
  font-size: 34pt;
  line-height: 1.02;
  letter-spacing: -0.03em;
  font-weight: 600;
  max-width: 150mm;
}}
.deck {{
  margin: 8mm 0 0;
  max-width: 155mm;
  font-size: 13pt;
  line-height: 1.4;
  color: #3a3834;
}}
.meta {{
  margin-top: 8mm;
  color: #5e5a54;
  font-size: 10pt;
}}
.cover-list {{
  margin-top: 14mm;
  border-top: 1px solid #d4cfc6;
}}
.cover-row {{
  display: grid;
  grid-template-columns: 34mm 1fr;
  gap: 6mm;
  padding: 4.2mm 0;
  border-bottom: 1px solid #d4cfc6;
}}
.cover-row strong {{
  font-size: 11pt;
  font-weight: 600;
}}
.cover-row p {{
  margin: 0;
  color: #3a3834;
}}
.foot {{
  margin-top: auto;
  padding-top: 10mm;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8mm;
  border-top: 1px solid #d4cfc6;
}}
.foot b {{
  display: block;
  font-size: 18pt;
  font-weight: 600;
  letter-spacing: -0.03em;
}}
.foot span {{
  color: #5e5a54;
  font-size: 9pt;
}}
.body {{
  padding: 0;
}}
h2 {{
  margin: 0 0 3mm;
  font-size: 18pt;
  letter-spacing: -0.03em;
  font-weight: 600;
  page-break-after: avoid;
}}
h3 {{
  margin: 5mm 0 2mm;
  font-size: 12pt;
  font-weight: 600;
  page-break-after: avoid;
}}
p {{ margin: 0 0 3mm; }}
.lead {{ font-size: 11.5pt; color: #2c2a27; }}
.kicker {{
  margin: 0 0 1.5mm;
  font-size: 8pt;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #3d5c54;
  font-weight: 600;
}}
.chapter, .assign, .read {{
  margin-top: 9mm;
}}
.rule {{
  page-break-before: always;
}}
ol, ul {{ margin: 0 0 4mm; padding-left: 5mm; }}
li {{ margin: 0 0 2mm; }}
.quote {{
  margin: 3mm 0;
  padding: 2.5mm 0 2.5mm 3.5mm;
  border-left: 2px solid #1e3a34;
  color: #2c2a27;
}}
.quote span {{
  display: block;
  font-size: 8pt;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #3d5c54;
  font-weight: 600;
  margin-bottom: 1mm;
}}
.note {{ color: #5e5a54; font-size: 9.5pt; }}
.count {{ color: #5e5a54; font-size: 9.5pt; }}
.sheet {{
  break-inside: avoid;
  page-break-inside: avoid;
  margin: 0 0 6mm;
  padding-top: 3mm;
  border-top: 1px solid #e4dfd6;
}}
.sheet h3 {{ margin-top: 0; font-size: 13pt; }}
.facts {{
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2mm 5mm;
  margin: 0 0 3mm;
}}
.facts div {{ margin: 0; }}
.facts dt {{
  font-size: 7.5pt;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6e6a64;
  font-weight: 600;
}}
.facts dd {{
  margin: 0.3mm 0 0;
  font-size: 10pt;
}}
table {{
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 5mm;
  font-size: 9pt;
  page-break-inside: auto;
}}
th, td {{
  text-align: left;
  vertical-align: top;
  padding: 1.6mm 2mm;
  border-bottom: 1px solid #e4dfd6;
}}
th {{
  font-size: 7.5pt;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6e6a64;
  font-weight: 600;
  border-bottom: 1px solid #1c1b19;
}}
tr {{ break-inside: avoid; page-break-inside: avoid; }}
code, .mono {{
  font-family: "JetBrains Mono", "Liberation Mono", monospace;
  font-size: 0.92em;
}}
.call {{
  margin: 4mm 0 5mm;
  padding: 4mm 4.5mm;
  background: #eef3f1;
  break-inside: avoid;
  page-break-inside: avoid;
}}
.call p:last-child {{ margin-bottom: 0; }}
.small {{ font-size: 9.5pt; color: #3a3834; }}
</style>
</head>
<body>
<section class="cover">
  <p class="eyebrow">Agentur · Arbeitsordnung</p>
  <h1>Fünf Kategorien für jedes Modell.</h1>
  <p class="deck">GPT, Claude und die Modelle, die diese Sitzung starten kann. Jedes Modell hat genau eine Kategorie. Die Linie entscheidet. Die Version entscheidet die Reihenfolge.</p>
  <p class="meta">Stand 18. November 2026 · America/Asuncion · {n} Modelle · davon {callable_n} in dieser Sitzung startbar</p>
  <div class="cover-list">
    <div class="cover-row"><strong>Frontier</strong><p>{e(CAT_LEAD["Frontier"])} Linien: Astra, Fable, Mythos.</p></div>
    <div class="cover-row"><strong>Stark</strong><p>{e(CAT_LEAD["Stark"])} Linie: Opus. Dazu Grok 4.7, Composer 2.5, Gemini 4 Neon.</p></div>
    <div class="cover-row"><strong>Alltag</strong><p>{e(CAT_LEAD["Alltag"])} Linien: Sol, Sonnet, allgemeines Chat.</p></div>
    <div class="cover-row"><strong>Volumen</strong><p>{e(CAT_LEAD["Volumen"])} Linien: Luna, Haiku.</p></div>
    <div class="cover-row"><strong>Spezial</strong><p>{e(CAT_LEAD["Spezial"])} Linie: Terra.</p></div>
  </div>
  <div class="foot">
    <div><b>5</b><span>feste Kategorien</span></div>
    <div><b>{n}</b><span>Modelle im Katalog</span></div>
    <div><b>{callable_n}</b><span>hier als Subagent startbar</span></div>
  </div>
</section>

<div class="body">
<section class="rule">
  <p class="kicker">Grundsatz</p>
  <h2>So bleibt die Ordnung fest</h2>
  <p class="lead">Die Kategorie ist eine Arbeitsordnung für die Agentur. Sie misst keine Benchmarks. Wo ein Wortlaut aus der Ausgangsliste vorliegt, steht er am Eintrag. Wo er fehlt, folgt die Kategorie der Linie. Wo das Modell nur in der Aufrufliste dieser Sitzung steht, ist die Kategorie eine Einschätzung.</p>

  <h3>Linie entscheidet</h3>
  <ul>
    <li>Astra, Fable und Mythos sind Frontier.</li>
    <li>Opus ist Stark.</li>
    <li>Sol, Sonnet und ein allgemeines Chat-Modell ohne Linie sind Alltag. GPT-5.5 fällt darunter, weil es als ChatGPT genannt ist und keine der vier GPT-Linien trägt.</li>
    <li>Luna und Haiku sind Volumen.</li>
    <li>Terra ist Spezial.</li>
  </ul>

  <h3>Version ordnet nur innerhalb der Kategorie</h3>
  <p>Eine neuere Versionsnummer hebt ein Modell nicht in die nächste Kategorie. Sie stellt es in derselben Kategorie nach vorn.</p>
  <ul>
    <li>Astra: 6.2, dann 6.</li>
    <li>Sol: 6.2, dann 6.1, dann 6, dann 5.6.</li>
    <li>Terra: 6.1, dann 5.6.</li>
    <li>Luna: 6, dann 5.6.</li>
    <li>Fable 5.2, Mythos 5.2 und Mythos Preview liegen auf derselben Frontier-Stufe. Der Unterschied ist der Zugang, nicht die Kategorie.</li>
  </ul>

  <h3>Ausnahme, nur bei Einschätzungen</h3>
  <p>Bei den Linien aus der Ausgangsliste ändert die Version die Kategorie nie. Zwei Paare aus der Aufrufliste sind anders eingeordnet, weil kein Stärketext vorliegt und nur der Abstand in der Liste sichtbar ist.</p>
  <ul>
    <li>Grok 4.7 ist Stark, weil es das Modell dieser Sitzung ist. Grok 4.6, die vorherige Generation, liegt auf Alltag.</li>
    <li>Gemini 4 Neon ist Stark, weil der Effort bis xhigh reicht. Gemini 4 Carbon endet bei high und liegt auf Alltag.</li>
  </ul>
  <p>Beides ist eine Arbeitsordnung. Es ist kein gemessener Qualitätsabstand.</p>

  <h3>Effort und Fast sind Modi</h3>
  <p>Ein Suffix erzeugt kein neues Modell und keine neue Kategorie. Dieselbe Basis bleibt in derselben Kategorie.</p>
  <ul>
    <li>sparsam: none, minimal, low</li>
    <li>normal: medium</li>
    <li>gründlich: high</li>
    <li>maximum: xhigh, max</li>
    <li>fast: schnellere Variante derselben Kategorie</li>
  </ul>
  <p>Welche Suffixe ein Modell wirklich hat, steht am Eintrag und noch einmal geschlossen in der Aufrufliste. Ein Modell ohne Suffixe in dieser Liste bekommt hier auch keine erfundenen Stufen.</p>

  <h3>Drei Herkünfte</h3>
  <ul>
    <li><strong>Angabe.</strong> Der Wortlaut stammt aus der Ausgangsliste.</li>
    <li><strong>Linie.</strong> Die Ausgangsliste nennt das Modell ohne Stärketext. Die Kategorie folgt der Linie, die Reihenfolge der Version.</li>
    <li><strong>Einschätzung.</strong> Das Modell steht nur in der Aufrufliste dieser Sitzung. Es kam in der Ausgangsliste nicht vor.</li>
  </ul>

  <h3>Was „Aufruf hier“ bedeutet</h3>
  <p>„Ja“ heißt: der Slug steht in der Subagenten-Liste dieser Sitzung. Ein API-Name aus der Claude-Tabelle ist etwas anderes. Haiku hat den API-Namen claude-haiku-5-5 und ist hier trotzdem nicht startbar. Mythos 5.2 und Mythos Preview haben hier keinen Slug. Der startbare Name der Mythos-Klasse ist claude-fable-5-2.</p>
  <p>„inherit“ kommt in der Aufrufliste vor und ist kein Modell. Es übernimmt das Modell des aufrufenden Laufs. Es hat deshalb keine Kategorie.</p>
</section>

<section class="assign">
  <p class="kicker">Betrieb</p>
  <h2>Zuteilung in der Agentur</h2>
  <p class="lead">Die Dreiteilung aus der Ausgangsliste bleibt die Betriebsregel. Die fünf Kategorien machen sie nur feiner, damit Astra, Terra, Luna und die Modelle dieser Sitzung denselben Platz finden.</p>
  <div class="call">
    <p class="quote"><span>Ausgangsliste</span> Für eine Agentur würde ich so aufteilen: Haiku für einfache, hochvolumige Schritte. Sonnet für die meisten Kundenaufgaben. Opus (oder Fable) für schwierige Planung, Code und Analyse.</p>
  </div>
  <ol>
    <li>Sieht die Aufgabe, oder muss sie einen Rechner bedienen, geht sie an Spezial. Aktuell ist das GPT-6.1 Terra, danach GPT-5.6 Terra. Diese Sitzung kann kein Terra-Modell starten.</li>
    <li>Ist die Aufgabe kurz, einfach und in großer Zahl, geht sie an Volumen. Erste Wahl ist Claude Haiku 5.5, danach GPT-6 Luna, danach GPT-5.6 Luna. Diese Sitzung kann keins davon starten.</li>
    <li>Ist es eine normale Kundenaufgabe, geht sie an Alltag. Auf Claude-Seite Sonnet 5.5. Auf GPT-Seite GPT-6.2 Sol, sobald es verfügbar ist. In dieser Sitzung ist der Sol-Slug gpt-5.6-sol.</li>
    <li>Ist es schweres Coding oder eine lange Analyse, geht sie an Stark. Erste Wahl aus der Ausgangsliste ist Opus 5.5. In dieser Sitzung stehen daneben Grok 4.7, Composer 2.5 und, als Einschätzung, Gemini 4 Neon.</li>
    <li>Liegt die Aufgabe an der Obergrenze, geht sie an Frontier. Auf GPT-Seite GPT-6.2 Astra. Auf Claude-Seite Fable 5.2, auf derselben Stufe Mythos 5.2. Mythos Preview nur dort, wo der Zugang besteht. In dieser Sitzung ist der Frontier-Slug claude-fable-5-2.</li>
  </ol>
  <p>Innerhalb der gewählten Kategorie die neueste Generation nehmen, die der jeweilige Zugang auch starten kann. Eine Fast-Variante bleibt dieselbe Wahl, wenn Latenz vor Tiefe kommt. Eine höhere Effort-Stufe bleibt dieselbe Wahl, wenn die Aufgabe gründlicher gelesen werden soll.</p>

  <h3>Was diese Sitzung je Kategorie starten kann</h3>
  <table>
    <thead>
      <tr><th>Kategorie</th><th>Startbare Basis-Slugs</th><th>In der Ausgangsliste, hier nicht startbar</th></tr>
    </thead>
    <tbody>
      <tr><td>Frontier</td><td>claude-fable-5-2</td><td>GPT-6.2 Astra, GPT-6 Astra, Mythos 5.2, Mythos Preview</td></tr>
      <tr><td>Stark</td><td>claude-opus-5-5, grok-4.7, composer-2.5, gemini-4-neon</td><td>—</td></tr>
      <tr><td>Alltag</td><td>claude-sonnet-5-5, gpt-5.6-sol, cursor-grok-4.6, gemini-4-carbon, muse-wonder-1.0</td><td>GPT-6.2 Sol, GPT-6.1 Sol, GPT-6 Sol, GPT-5.5</td></tr>
      <tr><td>Volumen</td><td>—</td><td>GPT-6 Luna, GPT-5.6 Luna, Claude Haiku 5.5</td></tr>
      <tr><td>Spezial</td><td>—</td><td>GPT-6.1 Terra, GPT-5.6 Terra</td></tr>
    </tbody>
  </table>
  <p class="small">Composer 2.5 ist die Coding-Wahl innerhalb von Stark, wenn die Arbeit vor allem Programmieren ist. Grok 4.7 ist das Modell dieser Sitzung. Opus bleibt die Stark-Wahl, die aus der eigenen Claude-Zuteilung stammt.</p>
</section>

<section class="read">
  <p class="kicker">Lesart</p>
  <h2>Was an jedem Eintrag steht</h2>
  <p>Jedes der {n} Modelle hat unten ein Blatt mit denselben Feldern.</p>
  <ul>
    <li><strong>Kategorie, Linie, Generation, Reihe, Anbieter.</strong> Die Reihe ist GPT, Claude, Grok, Cursor, Gemini oder Muse. Der Anbieter steht daneben. Bei Muse ist er in der Aufrufliste nicht genannt. Bei Grok steht „diese Sitzung“, weil die Liste keinen anderen Anbieternamen führt.</li>
    <li><strong>Herkunft.</strong> Angabe, Linie oder Einschätzung.</li>
    <li><strong>Slug und Aufruf hier.</strong> Der Slug ist der API-Name oder der Aufrufname. Ein API-Name allein macht den Aufruf nicht zu „ja“.</li>
    <li><strong>Effort und Modus.</strong> Nur die Suffixe, die die Aufrufliste für dieses Modell führt.</li>
    <li><strong>Wortlaut.</strong> Nur wenn die Ausgangsliste einen Satz zu diesem Modell enthält.</li>
    <li><strong>Einsatz.</strong> Was die Kategorie für dieses Modell in der Agentur heißt.</li>
  </ul>
  <p>Die Blätter stehen in Wahlreihenfolge: innerhalb einer Kategorie von der neueren zur älteren Generation, bei gleicher Stufe zuerst das Modell, das diese Sitzung starten kann.</p>
</section>

{sections}

<section class="chapter">
  <p class="kicker">Anhang</p>
  <h2>Geschlossene Aufrufliste</h2>
  <p class="lead">Das sind genau die Basis-Slugs, die diese Sitzung als Subagenten starten kann, mit den Effort-Suffixen und der Fast-Variante, die der Slug hergibt. Fast hängt an derselben Basis und bleibt in derselben Kategorie.</p>
  {slug_catalog()}
  <h3>Slug-Muster</h3>
  <ul>
    <li>Claude Fable, Opus und Sonnet: <span class="mono">basis-effort</span> mit low, medium, high, xhigh, max. Kein fast.</li>
    <li>Grok 4.7 und Grok 4.6: <span class="mono">basis-effort</span> und <span class="mono">basis-effort-fast</span> mit low, medium, high, xhigh.</li>
    <li>GPT-5.6 Sol: <span class="mono">gpt-5.6-sol-effort</span> und <span class="mono">gpt-5.6-sol-effort-fast</span> mit none, low, medium, high, xhigh, max.</li>
    <li>Gemini 4 Carbon: low, medium, high. Gemini 4 Neon: low, medium, high, xhigh. Beide ohne fast.</li>
    <li>Muse Wonder 1.0: minimal, low, medium, high, xhigh, max. Ohne fast.</li>
    <li>Composer 2.5: nur <span class="mono">composer-2.5</span> und <span class="mono">composer-2.5-fast</span>.</li>
  </ul>
  <h3>Nur in der Ausgangsliste</h3>
  <p>Diese Modelle haben hier keinen startbaren Subagenten-Slug: GPT-6.2 Astra, GPT-6 Astra, GPT-6.2 Sol, GPT-6.1 Sol, GPT-6 Sol, GPT-5.5, GPT-6 Luna, GPT-5.6 Luna, GPT-6.1 Terra, GPT-5.6 Terra, Claude Haiku 5.5, Claude Mythos 5.2, Claude Mythos Preview.</p>
  <h3>Nur in der Aufrufliste</h3>
  <p>Diese Modelle standen nicht in der Ausgangsliste und sind deshalb Einschätzungen: Grok 4.7, Grok 4.6, Composer 2.5, Gemini 4 Neon, Gemini 4 Carbon, Muse Wonder 1.0.</p>
  <h3>Zählung</h3>
  <p>23 Modelle. 5 Frontier, 4 Stark, 9 Alltag, 3 Volumen, 2 Spezial. 10 davon sind hier startbar: Fable, Opus, Sonnet, GPT-5.6 Sol, Grok 4.7, Grok 4.6, Composer 2.5, Gemini 4 Neon, Gemini 4 Carbon, Muse Wonder 1.0. Volumen und Spezial haben in dieser Sitzung keinen startbaren Slug.</p>
</section>

<section class="chapter">
  <p class="kicker">Anhang</p>
  <h2>Matrix nach Kategorie</h2>
  <p>Dieselbe Reihenfolge wie in den Blättern, auf eine Zeile verdichtet.</p>
  {matrix()}
  <p class="note">Stand der Ordnung: 18. November 2026, America/Asuncion. Die Blätter geben die Ausgangsliste vollständig wieder und ergänzen die Aufrufliste dieser Sitzung. Einträge mit der Herkunft Einschätzung sind eine Arbeitsordnung, keine Leistungsmessung.</p>
</section>
</div>
</body>
</html>
"""


def main() -> None:
    HTML_PATH.write_text(build_html(), encoding="utf-8")
    cmd = [
        "google-chrome",
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-pdf-header-footer",
        f"--print-to-pdf={PDF_PATH}",
        HTML_PATH.as_uri(),
    ]
    try:
        subprocess.run(cmd, check=True, timeout=40)
    except subprocess.TimeoutExpired:
        if not PDF_PATH.exists() or PDF_PATH.stat().st_size < 1000:
            raise
    print(PDF_PATH, PDF_PATH.stat().st_size)


if __name__ == "__main__":
    main()
