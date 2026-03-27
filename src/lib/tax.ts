import type { CountryCode } from "./types";

const defaultTaxRates: Record<CountryCode, number> = {
  US: 25,
  ES: 24,
  GB: 22,
};

export function getDefaultTaxRateByCountry(countryCode: CountryCode) {
  return defaultTaxRates[countryCode] ?? 25;
}

export function normalizeTaxRate(value: number | string | null | undefined) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.min(100, Math.max(0, parsed));
}

export function calculateEstimatedTaxes(netProfit: number, taxRate: number) {
  if (!Number.isFinite(netProfit) || netProfit <= 0) {
    return 0;
  }

  return netProfit * (normalizeTaxRate(taxRate) / 100);
}

export function calculateProfitAfterTax(netProfit: number, taxRate: number) {
  if (!Number.isFinite(netProfit)) {
    return 0;
  }

  return netProfit - calculateEstimatedTaxes(netProfit, taxRate);
}
