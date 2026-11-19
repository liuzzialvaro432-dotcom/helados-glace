import { PRICE_PROMOS } from "@/data/promotions";
import { formatPrice } from "@/lib/format";

export type EventKind = "partido" | "patria" | "especial" | "feriado" | "promo";

type EventRule =
  | { type: "annual"; month: number; day: number }
  | { type: "date"; date: string }
  /** nth = 1 → primer `weekday` del mes (0 = domingo). */
  | { type: "nthWeekday"; month: number; weekday: number; nth: number }
  | { type: "weekly"; weekday: number };

export type CalendarEvent = {
  id: string;
  title: string;
  kind: EventKind;
  rule: EventRule;
  description: string;
};

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  partido: "Partidos de Paraguay",
  patria: "Fechas patrias",
  especial: "Días especiales",
  feriado: "Feriados",
  promo: "Promos Glacé",
};

const annual = (
  id: string,
  month: number,
  day: number,
  kind: EventKind,
  title: string,
  description: string,
): CalendarEvent => ({ id, title, kind, description, rule: { type: "annual", month, day } });

/**
 * Para sumar un partido de la Albirroja u otra fecha puntual:
 * { id, title, kind: "partido", rule: { type: "date", date: "AAAA-MM-DD" }, description }
 */
export const EVENTS: CalendarEvent[] = [
  {
    id: "par-sgp-2026",
    title: "Singapur vs. Paraguay",
    kind: "partido",
    rule: { type: "date", date: "2026-11-13" },
    description: "Amistoso de fecha FIFA en Singapur, 09:00. Ganó la Albirroja 4-1.",
  },
  {
    id: "par-jpn-2026",
    title: "Japón vs. Paraguay",
    kind: "partido",
    rule: { type: "date", date: "2026-11-17" },
    description: "Amistoso de fecha FIFA en Singapur, 10:10. Ganó la Albirroja 2-1.",
  },

  annual("ano-nuevo", 1, 1, "feriado", "Año Nuevo", "Empezá el año con algo dulce."),
  annual("reyes", 1, 6, "especial", "Día de Reyes", "Un regalo que se comparte: helado para toda la familia."),
  annual("enamorados", 2, 14, "especial", "Día de los Enamorados", "Sorprendé con una torta de helado para dos."),
  annual("heroes", 3, 1, "feriado", "Día de los Héroes", "Feriado nacional."),
  annual("maestro", 4, 30, "especial", "Día del Maestro", "Un detalle dulce para la profe."),
  annual("trabajador", 5, 1, "feriado", "Día del Trabajador", "Feriado nacional."),
  annual("independencia-14", 5, 14, "patria", "Independencia Nacional", "Fiestas patrias: 14 y 15 de mayo."),
  annual("independencia-15", 5, 15, "patria", "Independencia Nacional", "Fiestas patrias: 14 y 15 de mayo."),
  annual("madre", 5, 15, "especial", "Día de la Madre", "Reservá con tiempo la torta de helado para mamá."),
  annual("paz-del-chaco", 6, 12, "feriado", "Paz del Chaco", "Feriado nacional."),
  {
    id: "padre",
    title: "Día del Padre",
    kind: "especial",
    rule: { type: "nthWeekday", month: 6, weekday: 0, nth: 3 },
    description: "Tercer domingo de junio: el postre corre por cuenta nuestra.",
  },
  annual("san-juan", 6, 24, "especial", "San Juan", "Después del pastel mandi'o, un buen helado."),
  annual("amistad", 7, 30, "especial", "Día de la Amistad", "Compartí un kilo con tus amigos."),
  annual("bandera", 8, 14, "patria", "Día de la Bandera", "Rojo, blanco y azul: celebramos nuestros colores."),
  annual("asuncion", 8, 15, "feriado", "Fundación de Asunción", "Feriado nacional."),
  annual("nino", 8, 16, "especial", "Día del Niño", "El día más dulce del año para los más chicos."),
  annual("primavera", 9, 21, "especial", "Día de la Primavera y de la Juventud", "Llegó la temporada del helado."),
  annual("boqueron", 9, 29, "feriado", "Victoria de Boquerón", "Feriado nacional."),
  annual("caacupe", 12, 8, "feriado", "Virgen de Caacupé", "Feriado nacional."),
  annual("nochebuena", 12, 24, "especial", "Nochebuena", "Pedí con tiempo el postre para la mesa navideña."),
  annual("navidad", 12, 25, "feriado", "Navidad", "Feriado nacional."),
  annual("fin-de-ano", 12, 31, "especial", "Fin de Año", "Brindá y cerrá el año con helado."),

  ...PRICE_PROMOS.map(
    (promo): CalendarEvent => ({
      id: promo.id,
      title: promo.name,
      kind: "promo",
      rule: { type: "weekly", weekday: promo.weekday },
      description: `1 kg de helado, hasta 4 sabores, por ${formatPrice(promo.price)}.`,
    }),
  ),
];
