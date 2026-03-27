import {
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  format,
  parseISO,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { getCurrencyForCountry, normalizeCountryCode } from "./markets";
import type {
  BookingRecord,
  CountryCode,
  DashboardFilters,
  DashboardView,
  ExpenseRecord,
  MonthlyPoint,
  PropertyDefinition,
} from "./types";

type SearchParams = Record<string, string | string[] | undefined>;

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function matchesDateFilter(dateValue: string, year: number | "all", month: number | "all") {
  const date = parseISO(dateValue);
  const yearMatches = year === "all" || date.getFullYear() === year;
  const monthMatches = month === "all" || date.getMonth() + 1 === month;
  return yearMatches && monthMatches;
}

function createPropertyCountryMap(
  properties: PropertyDefinition[],
  fallbackCountryCode: CountryCode,
) {
  return new Map(
    properties.map((property) => [
      property.name.trim().toLowerCase(),
      normalizeCountryCode(property.countryCode ?? fallbackCountryCode),
    ]),
  );
}

function resolveRecordCountryCode(
  propertyName: string,
  propertyCountryMap: Map<string, CountryCode>,
  fallbackCountryCode: CountryCode,
) {
  return propertyCountryMap.get(propertyName.trim().toLowerCase()) ?? fallbackCountryCode;
}

function getRangeFromFilters(
  filters: DashboardFilters,
  bookings: BookingRecord[],
  expenses: ExpenseRecord[],
) {
  const allDates = [
    ...bookings.map((booking) => parseISO(booking.checkIn)),
    ...expenses.map((expense) => parseISO(expense.date)),
  ].filter((date) => !Number.isNaN(date.getTime()));

  const latestDate =
    allDates.length > 0
      ? new Date(Math.max(...allDates.map((date) => date.getTime())))
      : new Date();

  if (filters.year === "all") {
    const earliestDate =
      allDates.length > 0
        ? new Date(Math.min(...allDates.map((date) => date.getTime())))
        : startOfYear(latestDate);

    return {
      start: startOfMonth(earliestDate),
      end: endOfMonth(latestDate),
      label: "All imported months",
    };
  }

  if (filters.month === "all") {
    const anchor = new Date(filters.year, 0, 1);
    return {
      start: startOfYear(anchor),
      end: endOfYear(anchor),
      label: String(filters.year),
    };
  }

  const anchor = new Date(filters.year, filters.month - 1, 1);
  return {
    start: startOfMonth(anchor),
    end: endOfMonth(anchor),
    label: format(anchor, "MMMM yyyy"),
  };
}

function buildMonthlyBuckets(
  filters: DashboardFilters,
  bookings: BookingRecord[],
  expenses: ExpenseRecord[],
) {
  const { start, end } = getRangeFromFilters(filters, bookings, expenses);
  const months = eachMonthOfInterval({ start, end });

  return months.map<MonthlyPoint>((month) => ({
    label: format(month, filters.year === "all" ? "MMM yyyy" : "MMM"),
    revenue: 0,
    payout: 0,
    expenses: 0,
    profit: 0,
    bookings: 0,
    guests: 0,
    nights: 0,
  }));
}

function getMonthIndex(dateValue: string, buckets: MonthlyPoint[], filters: DashboardFilters) {
  const label = format(parseISO(dateValue), filters.year === "all" ? "MMM yyyy" : "MMM");
  return buckets.findIndex((bucket) => bucket.label === label);
}

function clampRatio(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.min(value, 1);
}

export function getDashboardFilters(
  searchParams: SearchParams,
  bookings: BookingRecord[],
  expenses: ExpenseRecord[],
  properties: PropertyDefinition[],
  fallbackCountryCode: CountryCode,
): DashboardFilters {
  const years = Array.from(
    new Set(
      [
        ...bookings.map((booking) => parseISO(booking.checkIn).getFullYear()),
        ...expenses.map((expense) => parseISO(expense.date).getFullYear()),
      ].filter((year) => !Number.isNaN(year)),
    ),
  ).sort((a, b) => b - a);

  const defaultYear = years[0] ?? new Date().getFullYear();

  const yearParam = Array.isArray(searchParams.year) ? searchParams.year[0] : searchParams.year;
  const monthParam = Array.isArray(searchParams.month) ? searchParams.month[0] : searchParams.month;
  const channelParam = Array.isArray(searchParams.channel) ? searchParams.channel[0] : searchParams.channel;
  const countryParam = Array.isArray(searchParams.country) ? searchParams.country[0] : searchParams.country;

  const year =
    yearParam === "all"
      ? "all"
      : Number.isFinite(Number(yearParam))
        ? Number(yearParam)
        : defaultYear;
  const month =
    monthParam === "all"
      ? "all"
      : Number.isFinite(Number(monthParam))
        ? Number(monthParam)
        : "all";

  const availableCountries = Array.from(
    new Set(properties.map((property) => normalizeCountryCode(property.countryCode ?? fallbackCountryCode))),
  );
  const defaultCountry = availableCountries[0] ?? fallbackCountryCode;
  const normalizedCountryCode =
    countryParam === "all" ? "all" : normalizeCountryCode(countryParam ?? defaultCountry);

  return {
    year,
    month: month !== "all" && (month < 1 || month > 12) ? "all" : month,
    channel: channelParam?.trim() ? channelParam : "all",
    countryCode: normalizedCountryCode,
  };
}

export function filterBookingsForFilters({
  bookings,
  filters,
  properties,
  fallbackCountryCode,
}: {
  bookings: BookingRecord[];
  filters: DashboardFilters;
  properties: PropertyDefinition[];
  fallbackCountryCode: CountryCode;
}) {
  const propertyCountryMap = createPropertyCountryMap(properties, fallbackCountryCode);

  return bookings
    .filter((booking) => {
      const countryCode = resolveRecordCountryCode(
        booking.propertyName,
        propertyCountryMap,
        fallbackCountryCode,
      );

      return filters.countryCode === "all" || countryCode === filters.countryCode;
    })
    .filter((booking) => matchesDateFilter(booking.checkIn, filters.year, filters.month))
    .filter((booking) => filters.channel === "all" || booking.channel === filters.channel);
}

export function filterExpensesForFilters({
  expenses,
  filters,
  properties,
  fallbackCountryCode,
}: {
  expenses: ExpenseRecord[];
  filters: DashboardFilters;
  properties: PropertyDefinition[];
  fallbackCountryCode: CountryCode;
}) {
  const propertyCountryMap = createPropertyCountryMap(properties, fallbackCountryCode);

  return expenses
    .filter((expense) => {
      const countryCode = resolveRecordCountryCode(
        expense.propertyName,
        propertyCountryMap,
        fallbackCountryCode,
      );

      return filters.countryCode === "all" || countryCode === filters.countryCode;
    })
    .filter((expense) => matchesDateFilter(expense.date, filters.year, filters.month));
}

export function buildDashboardView({
  bookings,
  expenses,
  filters,
  properties,
  fallbackCountryCode,
}: {
  bookings: BookingRecord[];
  expenses: ExpenseRecord[];
  filters: DashboardFilters;
  properties: PropertyDefinition[];
  fallbackCountryCode: CountryCode;
}): DashboardView {
  const propertyCountryMap = createPropertyCountryMap(properties, fallbackCountryCode);
  const availableYears = Array.from(
    new Set(
      [
        ...bookings.map((booking) => parseISO(booking.checkIn).getFullYear()),
        ...expenses.map((expense) => parseISO(expense.date).getFullYear()),
      ].filter((year) => !Number.isNaN(year)),
    ),
  ).sort((a, b) => b - a);

  const availableChannels = Array.from(new Set(bookings.map((booking) => booking.channel))).sort((a, b) =>
    a.localeCompare(b),
  );
  const availableCountries = Array.from(
    new Set(
      properties.map((property) =>
        normalizeCountryCode(property.countryCode ?? fallbackCountryCode),
      ),
    ),
  );

  const countryFilteredBookings = bookings.filter((booking) => {
    const countryCode = resolveRecordCountryCode(
      booking.propertyName,
      propertyCountryMap,
      fallbackCountryCode,
    );

    return filters.countryCode === "all" || countryCode === filters.countryCode;
  });

  const countryFilteredExpenses = expenses.filter((expense) => {
    const countryCode = resolveRecordCountryCode(
      expense.propertyName,
      propertyCountryMap,
      fallbackCountryCode,
    );

    return filters.countryCode === "all" || countryCode === filters.countryCode;
  });

  const dateFilteredBookings = countryFilteredBookings.filter((booking) =>
    matchesDateFilter(booking.checkIn, filters.year, filters.month),
  );

  const filteredBookings = dateFilteredBookings.filter(
    (booking) => filters.channel === "all" || booking.channel === filters.channel,
  );

  const filteredExpenses = countryFilteredExpenses.filter((expense) =>
    matchesDateFilter(expense.date, filters.year, filters.month),
  );

  const grossRevenue = sum(filteredBookings.map((booking) => booking.totalRevenue));
  const netPayout = sum(filteredBookings.map((booking) => booking.payout));
  const totalExpenses = sum(filteredExpenses.map((expense) => expense.amount));
  const netProfit = netPayout - totalExpenses;
  const nightsBooked = sum(filteredBookings.map((booking) => booking.nights));
  const bookingsCount = filteredBookings.length;
  const guestsCount = sum(filteredBookings.map((booking) => booking.guestCount));
  const rentalRevenue = sum(filteredBookings.map((booking) => booking.rentalRevenue));

  const { start, end } = getRangeFromFilters(filters, countryFilteredBookings, countryFilteredExpenses);
  const availableNights = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  const buckets = buildMonthlyBuckets(filters, countryFilteredBookings, countryFilteredExpenses);

  for (const booking of filteredBookings) {
    const bucketIndex = getMonthIndex(booking.checkIn, buckets, filters);
    if (bucketIndex >= 0) {
      buckets[bucketIndex].revenue += booking.totalRevenue;
      buckets[bucketIndex].payout += booking.payout;
      buckets[bucketIndex].bookings += 1;
      buckets[bucketIndex].guests += booking.guestCount;
      buckets[bucketIndex].nights += booking.nights;
    }
  }

  for (const expense of filteredExpenses) {
    const bucketIndex = getMonthIndex(expense.date, buckets, filters);
    if (bucketIndex >= 0) {
      buckets[bucketIndex].expenses += expense.amount;
    }
  }

  for (const bucket of buckets) {
    bucket.profit = bucket.payout - bucket.expenses;
  }

  const expensesByCategoryMap = new Map<string, number>();
  for (const expense of filteredExpenses) {
    expensesByCategoryMap.set(
      expense.category,
      (expensesByCategoryMap.get(expense.category) ?? 0) + expense.amount,
    );
  }

  const revenueByChannelMap = new Map<string, { revenue: number; bookings: number }>();
  for (const booking of filteredBookings) {
    const current = revenueByChannelMap.get(booking.channel) ?? {
      revenue: 0,
      bookings: 0,
    };

    revenueByChannelMap.set(booking.channel, {
      revenue: current.revenue + booking.totalRevenue,
      bookings: current.bookings + 1,
    });
  }

  const marketBreakdownMap = new Map<
    CountryCode,
    {
      revenue: number;
      payout: number;
      expenses: number;
      profit: number;
      bookings: number;
      guests: number;
      nights: number;
    }
  >();

  for (const booking of filteredBookings) {
    const countryCode = resolveRecordCountryCode(
      booking.propertyName,
      propertyCountryMap,
      fallbackCountryCode,
    );
    const current = marketBreakdownMap.get(countryCode) ?? {
      revenue: 0,
      payout: 0,
      expenses: 0,
      profit: 0,
      bookings: 0,
      guests: 0,
      nights: 0,
    };

    current.revenue += booking.totalRevenue;
    current.payout += booking.payout;
    current.bookings += 1;
    current.guests += booking.guestCount;
    current.nights += booking.nights;
    marketBreakdownMap.set(countryCode, current);
  }

  for (const expense of filteredExpenses) {
    const countryCode = resolveRecordCountryCode(
      expense.propertyName,
      propertyCountryMap,
      fallbackCountryCode,
    );
    const current = marketBreakdownMap.get(countryCode) ?? {
      revenue: 0,
      payout: 0,
      expenses: 0,
      profit: 0,
      bookings: 0,
      guests: 0,
      nights: 0,
    };

    current.expenses += expense.amount;
    marketBreakdownMap.set(countryCode, current);
  }

  const marketBreakdown = Array.from(marketBreakdownMap.entries())
    .map(([countryCode, value]) => ({
      countryCode,
      currencyCode: getCurrencyForCountry(countryCode),
      revenue: value.revenue,
      payout: value.payout,
      expenses: value.expenses,
      profit: value.payout - value.expenses,
      bookings: value.bookings,
      guests: value.guests,
      nights: value.nights,
    }))
    .sort((left, right) => right.revenue - left.revenue);

  const displayCountryCode =
    filters.countryCode === "all" ? fallbackCountryCode : filters.countryCode;

  return {
    availableYears,
    availableChannels,
    availableCountries,
    filters,
    displayCurrencyCode: getCurrencyForCountry(displayCountryCode),
    mixedCurrencyMode: filters.countryCode === "all" && availableCountries.length > 1,
    marketBreakdown,
    metrics: {
      grossRevenue,
      netPayout,
      totalExpenses,
      netProfit,
      profitMargin: grossRevenue > 0 ? netProfit / grossRevenue : 0,
      bookingsCount,
      guestsCount,
      nightsBooked,
      adr: nightsBooked > 0 ? rentalRevenue / nightsBooked : 0,
      occupancyRate: clampRatio(nightsBooked / availableNights),
      revPar: availableNights > 0 ? rentalRevenue / availableNights : 0,
    },
    revenueByMonth: buckets.map((bucket) => ({ ...bucket })),
    profitByMonth: buckets.map((bucket) => ({ ...bucket })),
    expensesByCategory: Array.from(expensesByCategoryMap.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value),
    revenueByChannel: Array.from(revenueByChannelMap.entries())
      .map(([label, value]) => ({
        label,
        revenue: value.revenue,
        bookings: value.bookings,
      }))
      .sort((left, right) => right.revenue - left.revenue),
    recentBookings: [...filteredBookings]
      .sort((left, right) => right.checkIn.localeCompare(left.checkIn))
      .slice(0, 6),
    recentExpenses: [...filteredExpenses]
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, 6),
    monthlySummary: buckets.map((bucket) => ({ ...bucket })),
  };
}
