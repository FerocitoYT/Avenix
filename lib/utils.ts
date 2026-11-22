import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amountCents: number,
  currency: string = "EUR"
): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

export function formatDate(
  date: Date | string | number | null | undefined
): string {
  if (!date) return "-";
  const d = new Date(date);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(
  date: Date | string | number | null | undefined
): string {
  if (!date) return "-";
  const d = new Date(date);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function calculateVat(
  baseAmountCents: number,
  vatRatePercent: number = 21.0
) {
  const vatAmountCents = Math.round((baseAmountCents * vatRatePercent) / 100);
  const totalAmountCents = baseAmountCents + vatAmountCents;
  return {
    baseAmountCents,
    vatRatePercent,
    vatAmountCents,
    totalAmountCents,
  };
}

export function calculateBaseFromTotal(
  totalAmountCents: number,
  vatRatePercent: number = 21.0
) {
  const baseAmountCents = Math.round(
    totalAmountCents / (1 + vatRatePercent / 100)
  );
  const vatAmountCents = totalAmountCents - baseAmountCents;
  return {
    baseAmountCents,
    vatRatePercent,
    vatAmountCents,
    totalAmountCents,
  };
}
