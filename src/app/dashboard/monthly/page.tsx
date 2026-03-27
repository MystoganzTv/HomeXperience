import { redirect } from "next/navigation";
import { buildDashboardView, getDashboardFilters } from "@/lib/dashboard";
import { getAuthSession } from "@/lib/auth";
import {
  getBookings,
  getExpenses,
  getLatestImport,
  getPropertyDefinitions,
  getUserSettings,
} from "@/lib/db";
import { FilterBar } from "@/components/filter-bar";
import { MonthlySummaryPanel } from "@/components/monthly-summary-panel";
import { WorkspaceShell } from "@/components/workspace-shell";

export const runtime = "nodejs";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function MonthlyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getAuthSession();
  const ownerEmail = session?.user?.email?.toLowerCase();

  if (!session?.user?.email || !ownerEmail) {
    redirect("/login");
  }

  const userName = session.user.name ?? session.user.email ?? "Host";
  const properties = await getPropertyDefinitions(ownerEmail);

  if (properties.length === 0) {
    redirect("/dashboard/properties?setup=1");
  }

  const [bookings, expenses, latestImport, userSettings, resolvedSearchParams] = await Promise.all([
    getBookings(ownerEmail),
    getExpenses(ownerEmail),
    getLatestImport(ownerEmail),
    getUserSettings(ownerEmail, userName),
    searchParams,
  ]);

  const filters = getDashboardFilters(
    resolvedSearchParams,
    bookings,
    expenses,
    properties,
    userSettings.primaryCountryCode,
  );
  const monthlyFilters = {
    ...filters,
    month: "all" as const,
  };
  const view = buildDashboardView({
    bookings,
    expenses,
    filters: monthlyFilters,
    properties,
    fallbackCountryCode: userSettings.primaryCountryCode,
    taxCountryCode: userSettings.taxCountryCode,
    taxRate: userSettings.taxRate,
  });
  const rangeLabel =
    monthlyFilters.year === "all" ? "All imported months" : String(monthlyFilters.year);

  return (
    <WorkspaceShell
      activePage="monthly"
      pageTitle="Monthly Performance"
      pageSubtitle="Compare month-by-month results across the selected reporting window."
      businessName={userSettings.businessName}
      userName={userName}
      userEmail={ownerEmail}
      currencyCode={view.displayCurrencyCode}
      latestImport={latestImport}
      actions={
        <FilterBar
          years={view.availableYears}
          channels={view.availableChannels}
          countries={view.availableCountries}
          selectedYear={view.filters.year}
          selectedMonth="all"
          selectedChannel={view.filters.channel}
          selectedCountryCode={view.filters.countryCode}
          showMonthSelect={false}
        />
      }
    >
      <MonthlySummaryPanel
        view={view}
        currencyCode={view.displayCurrencyCode}
        rangeLabel={rangeLabel}
      />
    </WorkspaceShell>
  );
}
