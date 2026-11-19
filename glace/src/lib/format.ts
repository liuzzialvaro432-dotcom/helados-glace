import { BUSINESS } from "@/lib/config";

/** 69000 → "69.000" */
export function formatAmount(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** 69000 → "Gs. 69.000" */
export function formatPrice(value: number): string {
  return `${BUSINESS.currency} ${formatAmount(value)}`;
}

/** "100.000", "Gs 100000" → 100000; texto sin dígitos → null */
export function parseAmount(input: string): number | null {
  const digits = input.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}
