"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Globe2, Settings2 } from "lucide-react";
import { marketDefinitions } from "@/lib/markets";
import type { CountryCode } from "@/lib/types";

function inputClassName() {
  return "input-surface w-full rounded-2xl px-4 py-3 text-sm";
}

export function BusinessSettingsPanel({
  initialBusinessName,
  initialPrimaryCountryCode,
}: {
  initialBusinessName: string;
  initialPrimaryCountryCode: CountryCode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [primaryCountryCode, setPrimaryCountryCode] = useState<CountryCode>(initialPrimaryCountryCode);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(() => {
      void (async () => {
        try {
          const formData = new FormData();
          formData.set("businessName", businessName);
          formData.set("primaryCountryCode", primaryCountryCode);

          const response = await fetch("/api/settings", {
            method: "POST",
            body: formData,
          });

          const payload = (await response.json()) as {
            error?: string;
            message?: string;
          };

          if (!response.ok) {
            setError(payload.error ?? "The business settings could not be saved.");
            return;
          }

          setMessage(payload.message ?? "Business settings saved.");
          router.refresh();
        } catch {
          setError("The business settings could not be saved.");
        }
      })();
    });
  }

  return (
    <div className="workspace-card rounded-[30px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--workspace-muted)]">
            Business Settings
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--workspace-muted)]">
            Each account keeps its own business identity, reporting market, imports, and manual entries.
          </p>
        </div>
        <div className="workspace-icon-chip rounded-3xl p-3">
          <Settings2 className="h-6 w-6" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Business name
          </span>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className={`${inputClassName()} pl-11`}
              type="text"
              name="businessName"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              placeholder="PinarSabroso, Hostlyx Demo, Beach Loft..."
              required
            />
          </div>
        </label>

        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Primary reporting market
          </span>
          <div className="grid gap-3 sm:grid-cols-3">
            {marketDefinitions.map((market) => {
              const isSelected = primaryCountryCode === market.countryCode;

              return (
                <button
                  key={market.countryCode}
                  type="button"
                  onClick={() => setPrimaryCountryCode(market.countryCode)}
                  className={`rounded-[24px] border px-4 py-4 text-left transition ${
                    isSelected
                      ? "border-[var(--workspace-accent)] bg-[var(--workspace-accent-soft)] text-[var(--workspace-text)] shadow-[0_0_0_1px_rgba(88,196,182,0.16)]"
                      : "border-[var(--workspace-border)] bg-[var(--workspace-panel-soft)] text-[var(--workspace-muted)] hover:border-[var(--workspace-accent)]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="workspace-icon-chip rounded-2xl p-2.5">
                      <Globe2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{market.shortLabel}</p>
                      <p className="text-xs text-inherit/80">{market.regionLabel}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-medium">{market.countryName}</p>
                  <p className="mt-1 text-xs text-inherit/80">
                    {market.currencyCode} • {market.currencyLabel}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="text-xs leading-5 text-[var(--workspace-muted)]">
            This becomes the default market Hostlyx uses when your dashboard is showing all countries at once.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="workspace-button-primary inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving settings..." : "Save settings"}
        </button>
      </form>

      <div className="mt-4 min-h-6">
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      </div>
    </div>
  );
}
