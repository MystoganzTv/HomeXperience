"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { TaxSettingsForm } from "@/components/dashboard/TaxSettingsForm";
import { TaxSummaryMetrics } from "@/components/dashboard/TaxSummaryMetrics";
import { getDefaultTaxRateByCountry, normalizeTaxRate } from "@/lib/tax";
import type { CountryCode, CurrencyCode } from "@/lib/types";

export function TaxEstimationCard({
  initialCountryCode,
  initialTaxRate,
  netProfit,
  estimatedTaxes,
  profitAfterTax,
  currencyCode,
  mixedCurrencyMode,
}: {
  initialCountryCode: CountryCode;
  initialTaxRate: number;
  netProfit: number;
  estimatedTaxes: number;
  profitAfterTax: number;
  currencyCode: CurrencyCode;
  mixedCurrencyMode: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [countryCode, setCountryCode] = useState<CountryCode>(initialCountryCode);
  const [taxRate, setTaxRate] = useState(String(initialTaxRate));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizedTaxRate = normalizeTaxRate(taxRate);
  const previewEstimatedTaxes = netProfit > 0 ? netProfit * (normalizedTaxRate / 100) : 0;
  const previewProfitAfterTax = netProfit - previewEstimatedTaxes;
  const isDirty =
    countryCode !== initialCountryCode ||
    normalizeTaxRate(taxRate) !== normalizeTaxRate(initialTaxRate);

  function handleCountryChange(value: CountryCode) {
    setCountryCode(value);
    setTaxRate(String(getDefaultTaxRateByCountry(value)));
    setMessage(null);
    setError(null);
  }

  function handleSave() {
    setMessage(null);
    setError(null);

    startTransition(() => {
      void (async () => {
        try {
          const formData = new FormData();
          formData.set("taxCountryCode", countryCode);
          formData.set("taxRate", String(normalizedTaxRate));

          const response = await fetch("/api/tax-settings", {
            method: "POST",
            body: formData,
          });
          const payload = (await response.json()) as {
            message?: string;
            error?: string;
          };

          if (!response.ok) {
            setError(payload.error ?? "The tax estimation settings could not be saved.");
            return;
          }

          setMessage(payload.message ?? "Tax estimation settings saved.");
          router.refresh();
        } catch {
          setError("The tax estimation settings could not be saved.");
        }
      })();
    });
  }

  const displayEstimatedTaxes = isDirty ? previewEstimatedTaxes : estimatedTaxes;
  const displayProfitAfterTax = isDirty ? previewProfitAfterTax : profitAfterTax;

  return (
    <SectionCard
      title="Tax Estimation"
      subtitle="Estimate what to set aside and what you actually keep."
      action={
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--workspace-muted)]">
          <ShieldAlert className="h-4 w-4 text-[var(--workspace-accent)]" />
          Estimate only
        </div>
      }
    >
      <div className="space-y-5">
        <TaxSettingsForm
          countryCode={countryCode}
          taxRate={taxRate}
          onCountryChange={handleCountryChange}
          onTaxRateChange={(value) => {
            setTaxRate(value);
            setMessage(null);
            setError(null);
          }}
          onSave={handleSave}
          isPending={isPending}
          isDirty={isDirty}
        />

        {mixedCurrencyMode ? (
          <div className="workspace-soft-card rounded-[24px] p-5">
            <p className="text-sm font-semibold text-[var(--workspace-text)]">
              Choose a single market to estimate taxes
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--workspace-muted)]">
              Hostlyx will not estimate after-tax profit across mixed currencies. Pick one country in the dashboard filters to see tax set-aside and take-home profit clearly.
            </p>
          </div>
        ) : (
          <TaxSummaryMetrics
            estimatedTaxes={displayEstimatedTaxes}
            profitAfterTax={displayProfitAfterTax}
            currencyCode={currencyCode}
          />
        )}

        <div className="flex flex-col gap-3 border-t border-white/8 pt-4 text-xs leading-6 text-[var(--workspace-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>Tax values are estimates only and may not reflect your actual tax obligation.</p>
          <div className="min-h-5 text-right">
            {message ? <p className="text-emerald-300">{message}</p> : null}
            {error ? <p className="text-rose-200">{error}</p> : null}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
