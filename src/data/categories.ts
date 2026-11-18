import type { CategoryMeta } from "../types/catalog";

/** Canonical category definitions used by popup, options, and tests. */
export const CATEGORIES: readonly CategoryMeta[] = [
  {
    id: "Frontier",
    lines: "Astra, Fable, Mythos",
    agencyUse: "Schwierigste Planung, Analyse, anspruchsvolles Programmieren",
    description:
      "Höchste Stufe. Schwierigste Planung, tiefste Analyse, anspruchsvollstes Programmieren.",
  },
  {
    id: "Stark",
    lines: "Opus, aktuelles Grok, Composer",
    agencyUse: "Komplexes Coding und lange Agentenläufe",
    description: "Komplexes Denken, schweres Coding, lange Agentenläufe.",
  },
  {
    id: "Alltag",
    lines: "Sol, Sonnet, allgemeines Chat",
    agencyUse: "Die meisten Kundenaufgaben",
    description:
      "Die meisten Kundenaufgaben. Programmierung und normale Arbeit bei brauchbarem Verhältnis aus Qualität, Tempo und Preis.",
  },
  {
    id: "Volumen",
    lines: "Luna, Haiku",
    agencyUse: "Klassifizieren, Extraktion, einfache Chats, hohe Stückzahl",
    description:
      "Schnell und günstig. Hohe Stückzahl: Klassifizieren, Extraktion, einfache Chats, Chatbots.",
  },
  {
    id: "Spezial",
    lines: "Terra",
    agencyUse: "Sehen, visuelle Aufgaben, Computersteuerung",
    description:
      "Sehen, visuelle Aufgaben, Computersteuerung. Die Kategorie beschreibt die Art der Aufgabe.",
  },
] as const;

export const CATEGORY_ORDER = CATEGORIES.map((entry) => entry.id);
