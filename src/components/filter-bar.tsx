"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect } from "react";
import { Funnel } from "lucide-react";
import { WorkspaceSelect } from "@/components/workspace-select";
import { getMarketDefinition } from "@/lib/markets";
import type { CountryCode } from "@/lib/types";

const monthOptions = [
  { value: "all", label: "All months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const filterStorageKey = "hostlyx:filters";

export function FilterBar({
  years,
  channels,
  countries,
  selectedYear,
  selectedMonth,
  selectedChannel,
  selectedCountryCode,
  showMonthSelect = true,
}: {
  years: number[];
  channels: string[];
  countries: CountryCode[];
  selectedYear: number | "all";
  selectedMonth: number | "all";
  selectedChannel: string | "all";
  selectedCountryCode: CountryCode | "all";
  showMonthSelect?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const hasExplicitFilters =
      searchParams.has("year") ||
      searchParams.has("month") ||
      searchParams.has("channel") ||
      searchParams.has("country");

    if (hasExplicitFilters) {
      return;
    }

    const savedFilters = window.localStorage.getItem(filterStorageKey);

    if (!savedFilters) {
      return;
    }

    try {
      const parsed = JSON.parse(savedFilters) as {
        year?: string;
        month?: string;
        channel?: string;
        country?: string;
      };
      const params = new URLSearchParams(searchParams.toString());

      if (parsed.year) {
        params.set("year", parsed.year);
      }

      if (parsed.month) {
        params.set("month", parsed.month);
      }

      if (parsed.channel) {
        params.set("channel", parsed.channel);
      }

      if (parsed.country) {
        params.set("country", parsed.country);
      }

      if (params.toString()) {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    } catch {
      window.localStorage.removeItem(filterStorageKey);
    }
  }, [pathname, router, searchParams]);

  function updateFilter(key: "year" | "month" | "channel" | "country", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);

    if (key === "year" && value === "all") {
      params.set("month", "all");
    }

    window.localStorage.setItem(
      filterStorageKey,
      JSON.stringify({
        year: params.get("year") ?? "all",
        month: params.get("month") ?? "all",
        channel: params.get("channel") ?? "all",
        country: params.get("country") ?? "all",
      }),
    );

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-[var(--workspace-border)] bg-[var(--workspace-panel)] p-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-2 px-2 text-sm font-semibold text-[var(--workspace-muted)]">
        <Funnel className="h-4 w-4 text-[var(--workspace-accent)]" />
        Filters
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => updateFilter("country", "all")}
          className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            selectedCountryCode === "all"
              ? "workspace-button-primary"
              : "workspace-button-secondary"
          }`}
        >
          All markets
        </button>
        {countries.map((countryCode) => {
          const market = getMarketDefinition(countryCode);

          return (
            <button
              key={countryCode}
              type="button"
              onClick={() => updateFilter("country", countryCode)}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                selectedCountryCode === countryCode
                  ? "workspace-button-primary"
                  : "workspace-button-secondary"
              }`}
            >
              {market.shortLabel}
            </button>
          );
        })}
      </div>
      <WorkspaceSelect
        compact
        className="min-w-[150px]"
        value={String(selectedYear)}
        onChange={(value) => updateFilter("year", value)}
        options={[
          { value: "all", label: "All Years" },
          ...years.map((year) => ({ value: String(year), label: String(year) })),
        ]}
      />
      {showMonthSelect ? (
        <WorkspaceSelect
          compact
          className="min-w-[170px]"
          value={String(selectedMonth)}
          onChange={(value) => updateFilter("month", value)}
          options={monthOptions}
        />
      ) : null}
      <WorkspaceSelect
        compact
        className="min-w-[170px]"
        value={selectedChannel}
        onChange={(value) => updateFilter("channel", value)}
        options={[
          { value: "all", label: "All Channels" },
          ...channels.map((channel) => ({ value: channel, label: channel })),
        ]}
      />
    </div>
  );
}
