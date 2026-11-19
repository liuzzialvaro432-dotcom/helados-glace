# Claude anbinden (privates GitHub-Repo)

So erreicht **Claude** den Code in `liuzzialvaro432-dotcom/helados-glace`.

## 1. Claude GitHub App installieren (einmalig)

Das Repo ist **privat**. Claude braucht die offizielle App auf **deinem** GitHub-Konto `liuzzialvaro432-dotcom`:

1. In [claude.ai](https://claude.ai) → **Settings** → **Connectors** → **GitHub** verbinden,  
   **oder** direkt: [github.com/settings/installations](https://github.com/settings/installations)
2. App **Claude** installieren bzw. **Configure** öffnen.
3. Unter **Repository access**:
   - **All repositories**, **oder**
   - **Only select repositories** → `helados-glace` ankreuzen → **Save**.

> Wichtig: Die App muss auf dem Konto liegen, das **das Repo besitzt** (`liuzzialvaro432-dotcom`), nicht nur auf einer Organisation.

Offizielle Hilfe: [Claude — GitHub integration](https://claude.com/docs/connectors/github)

## 2. Repo in Claude laden

### Variante A — Projekt (claude.ai)

1. Neues **privates** Projekt anlegen (geteilte Projekte können GitHub oft nicht nutzen).
2. **Project knowledge** → **+** → **GitHub**.
3. URL einfügen:  
   `https://github.com/liuzzialvaro432-dotcom/helados-glace`
4. Branch: **main**
5. Ordner auswählen (empfohlen):
   - `glace/`
   - `docs/brand/` (Marken-PDF)
   - `CLAUDE.md`, `README.md`
6. **Add files** → danach bei größeren Änderungen **Sync now**.

### Variante B — Chat

1. Neuer Chat → **+** → **Add from GitHub**
2. Repo `helados-glace` wählen oder URL einfügen.

### Variante C — Claude Code (lokal oder Web)

- **Lokal:** Repo klonen, im Ordner `claude` starten — liest automatisch `CLAUDE.md`.
- **Web:** [claude.ai/code](https://claude.ai/code) → Repo `liuzzialvaro432-dotcom/helados-glace` (nach App-Installation sichtbar).

```bash
git clone https://github.com/liuzzialvaro432-dotcom/helados-glace.git
cd helados-glace
# Claude Code CLI: claude
```

## 3. Erste Nachricht an Claude (Kopiervorlage)

```
Lies CLAUDE.md und glace/README.md.
Arbeite nur im Ordner glace/, es sei denn ich sage etwas anderes.
Die UI bleibt auf Spanisch (Paraguay). Marke: docs/brand/manual-glace-final.pdf
```

## Fehler: „Claude cannot access that resource“

- Claude GitHub App auf `liuzzialvaro432-dotcom` installiert?
- `helados-glace` unter **Repository access** freigegeben?
- In Claude **GitHub** erneut verbinden und Repo **nochmal** auswählen.

## Was bereits im Repo für Claude vorbereitet ist

| Datei | Zweck |
|---|---|
| `CLAUDE.md` | Projektkontext für Claude Code / als erste Lektüre |
| `glace/README.md` | Technische Doku der App |
| `docs/brand/manual-glace-final.pdf` | Offizielles Markenhandbuch |
| `README.md` | Übersicht und Screenshots |