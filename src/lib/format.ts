import { format, parseISO } from "date-fns";
import type { CurrencyCode } from "./types";

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("en-US");

function getCurrencyFormatter(currencyCode: CurrencyCode, precise: boolean) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: precise ? 0 : 0,
    maximumFractionDigits: precise ? 2 : 0,
  });
}

export function formatCurrency(
  value: number,
  precise = false,
  currencyCode: CurrencyCode = "USD",
) {
  return getCurrencyFormatter(currencyCode, precise).format(
    Number.isFinite(value) ? value : 0,
  );
}

export function formatPercent(value: number) {
  return percentFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number) {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatMetricValue(
  value: number,
  type: "currency" | "percent" | "number",
  currencyCode: CurrencyCode = "USD",
) {
  if (type === "percent") {
    return formatPercent(value);
  }

  if (type === "number") {
    return formatNumber(value);
  }

  return formatCurrency(value, false, currencyCode);
}

export function formatDateLabel(value: string) {
  return format(parseISO(value), "MMM d, yyyy");
}
