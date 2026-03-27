"use client";

import { Globe2, Percent } from "lucide-react";
import { WorkspaceSelect } from "@/components/workspace-select";
import { getMarketDefinition } from "@/lib/markets";
import { getDefaultTaxRateByCountry } from "@/lib/tax";
import type { CountryCode } from "@/lib/types";

const countryOptions: Array<{ value: CountryCode; label: string; description: string }> = [
  {
    value: "US",
    label: "United States",
    description: "Suggested rate 25%",
  },
  {
    value: "ES",
    label: "Spain",
    description: "Suggested rate 24%",
  },
  {
    value: "GB",
    label: "United Kingdom",
    description: "Suggested rate 22%",
  },
];

function inputClassName() {
  return "input-surface w-full rounded-2xl px-4 py-3 text-sm";
}

export function TaxSettingsForm({
  countryCode,
  taxRate,
  onCountryChange,
  onTaxRateChange,
  onSave,
  isPending,
  isDirty,
}: {
  countryCode: CountryCode;
  taxRate: string;
  onCountryChange: (value: CountryCode) => void;
  onTaxRateChange: (value: string) => void;
  onSave: () => void;
  isPending: boolean;
  isDirty: boolean;
}) {
  const market = getMarketDefinition(countryCode);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr_auto] lg:items-end">
      <div className="workspace-soft-card rounded-[22px] p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--workspace-muted)]">
          <Globe2 className="h-4 w-4 text-[var(--workspace-accent)]" />
          Country
        </div>
        <WorkspaceSelect
          value={countryCode}
          onChange={(value) => onCountryChange(value as CountryCode)}
          options={countryOptions}
          helper={`Used for context and a suggested default rate. ${market.countryName} suggests ${getDefaultTaxRateByCountry(countryCode)}%, but you can always override it.`}
        />
      </div>

      <div className="workspace-soft-card rounded-[22px] p-4">
        <label className="space-y-2">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--workspace-muted)]">
            <Percent className="h-4 w-4 text-[var(--workspace-accent)]" />
            Tax rate
          </span>
          <div className="relative">
            <input
              className={`${inputClassName()} pr-12`}
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="0.1"
              value={taxRate}
              onChange={(event) => onTaxRateChange(event.target.value)}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--workspace-muted)]">
              %
            </span>
          </div>
        </label>
        <p className="mt-2 text-xs text-[var(--workspace-muted)]">
          Use your own estimated effective tax rate.
        </p>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={isPending || !isDirty}
        className="workspace-button-secondary inline-flex h-[52px] items-center justify-center rounded-2xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : isDirty ? "Save tax settings" : "Tax settings saved"}
      </button>
    </div>
  );
}
