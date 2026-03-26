import { redirect } from "next/navigation";
import { Building2, Layers3 } from "lucide-react";
import { PropertiesManager } from "@/components/properties-manager";
import { SectionCard } from "@/components/section-card";
import { WorkspaceHeader } from "@/components/workspace-header";
import { getAuthSession } from "@/lib/auth";
import {
  getBookings,
  getExpenses,
  getLatestImport,
  getPropertyDefinitions,
  getUserSettings,
} from "@/lib/db";
import { formatNumber } from "@/lib/format";

export const runtime = "nodejs";

export default async function PropertiesPage() {
  const session = await getAuthSession();
  const ownerEmail = session?.user?.email?.toLowerCase();

  if (!session?.user?.email || !ownerEmail) {
    redirect("/login");
  }

  const userName = session.user.name ?? session.user.email ?? "Host";
  const [bookings, expenses, latestImport, userSettings, propertyDefinitions] = await Promise.all([
    getBookings(ownerEmail),
    getExpenses(ownerEmail),
    getLatestImport(ownerEmail),
    getUserSettings(ownerEmail, userName),
    getPropertyDefinitions(ownerEmail),
  ]);

  const propertyMap = new Map<
    string,
    {
      units: Set<string>;
      bookings: number;
      expenses: number;
      revenue: number;
      payout: number;
    }
  >();

  for (const booking of bookings) {
    const current = propertyMap.get(booking.propertyName) ?? {
      units: new Set<string>(),
      bookings: 0,
      expenses: 0,
      revenue: 0,
      payout: 0,
    };

    if (booking.unitName) {
      current.units.add(booking.unitName);
    }

    current.bookings += 1;
    current.revenue += booking.totalRevenue;
    current.payout += booking.payout;
    propertyMap.set(booking.propertyName, current);
  }

  for (const expense of expenses) {
    const current = propertyMap.get(expense.propertyName) ?? {
      units: new Set<string>(),
      bookings: 0,
      expenses: 0,
      revenue: 0,
      payout: 0,
    };

    if (expense.unitName) {
      current.units.add(expense.unitName);
    }

    current.expenses += expense.amount;
    propertyMap.set(expense.propertyName, current);
  }

  const properties = Array.from(propertyMap.entries()).map(([name, value]) => ({
    name,
    units: Array.from(value.units).sort((left, right) => left.localeCompare(right)),
    bookings: value.bookings,
    revenue: value.revenue,
    payout: value.payout,
    expenses: value.expenses,
    profit: value.payout - value.expenses,
  }));

  for (const propertyDefinition of propertyDefinitions) {
    if (!propertyMap.has(propertyDefinition.name)) {
      properties.push({
        name: propertyDefinition.name,
        units: propertyDefinition.units.map((unit) => unit.name),
        bookings: 0,
        revenue: 0,
        payout: 0,
        expenses: 0,
        profit: 0,
      });
    }
  }

  properties.sort((left, right) => left.name.localeCompare(right.name));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-6 px-4 py-5 sm:px-6 sm:py-8 xl:px-8">
      <WorkspaceHeader
        activePage="properties"
        businessName={userSettings.businessName}
        userName={userName}
        userEmail={ownerEmail}
        currencyCode={userSettings.currencyCode}
        latestImport={latestImport}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Properties">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-[var(--accent-text)]" />
            <p className="text-2xl font-semibold text-white">{formatNumber(properties.length)}</p>
          </div>
        </SectionCard>
        <SectionCard title="Units">
          <div className="flex items-center gap-3">
            <Layers3 className="h-5 w-5 text-[var(--accent-text)]" />
            <p className="text-2xl font-semibold text-white">
              {formatNumber(properties.reduce((sum, property) => sum + property.units.length, 0))}
            </p>
          </div>
        </SectionCard>
        <SectionCard title="How to use it">
          <p className="text-sm leading-6 text-slate-400">
            Imported files default to `Default Property`. Use the Bookings and Expenses pages to reassign rows to the right property and unit.
          </p>
        </SectionCard>
      </div>

      <SectionCard
        title="Property Setup"
        subtitle="Create the portfolio structure first, then assign bookings and expenses to the right property and unit."
      >
        <PropertiesManager
          properties={propertyDefinitions}
          summaries={properties}
          currencyCode={userSettings.currencyCode}
        />
      </SectionCard>
    </main>
  );
}
