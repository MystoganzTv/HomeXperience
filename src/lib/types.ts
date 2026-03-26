export type ImportSource = "demo" | "upload" | "manual";
export type CurrencyCode = "USD" | "EUR" | "GBP";
export type CountryCode = "US" | "ES" | "GB";

export type BookingRecord = {
  id?: number;
  importId?: number;
  source?: ImportSource;
  propertyName: string;
  unitName: string;
  checkIn: string;
  checkout: string;
  guestName: string;
  guestCount: number;
  channel: string;
  rentalPeriod: string;
  pricePerNight: number;
  extraFee: number;
  discount: number;
  rentalRevenue: number;
  cleaningFee: number;
  totalRevenue: number;
  hostFee: number;
  payout: number;
  nights: number;
  bookingNumber: string;
  overbookingStatus: string;
};

export type ExpenseRecord = {
  id?: number;
  importId?: number;
  source?: ImportSource;
  propertyName: string;
  unitName: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  note: string;
};

export type CalendarClosureRecord = {
  id?: number;
  importId?: number;
  source?: ImportSource;
  propertyName: string;
  unitName: string;
  date: string;
  reason: string;
  note: string;
};

export type ImportSummary = {
  id: number;
  fileName: string;
  propertyName: string;
  source: ImportSource;
  importedAt: string;
  bookingsCount: number;
  expensesCount: number;
};

export type UserSettings = {
  businessName: string;
  primaryCountryCode: CountryCode;
  currencyCode: CurrencyCode;
};

export type PropertyUnit = {
  id?: number;
  name: string;
};

export type PropertyDefinition = {
  id?: number;
  name: string;
  countryCode: CountryCode;
  units: PropertyUnit[];
};

export type DashboardFilters = {
  year: number | "all";
  month: number | "all";
  channel: string | "all";
  countryCode: CountryCode | "all";
};

export type MetricCard = {
  label: string;
  value: number;
  format: "currency" | "percent" | "number";
  changeLabel?: string;
};

export type MonthlyPoint = {
  label: string;
  revenue: number;
  payout: number;
  expenses: number;
  profit: number;
  bookings: number;
  nights: number;
};

export type CategoryPoint = {
  label: string;
  value: number;
};

export type ChannelPoint = {
  label: string;
  revenue: number;
  bookings: number;
};

export type DashboardView = {
  availableYears: number[];
  availableChannels: string[];
  availableCountries: CountryCode[];
  filters: DashboardFilters;
  displayCurrencyCode: CurrencyCode;
  mixedCurrencyMode: boolean;
  marketBreakdown: Array<{
    countryCode: CountryCode;
    currencyCode: CurrencyCode;
    revenue: number;
    payout: number;
    expenses: number;
    profit: number;
    bookings: number;
    nights: number;
  }>;
  metrics: {
    grossRevenue: number;
    netPayout: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    bookingsCount: number;
    nightsBooked: number;
    adr: number;
    occupancyRate: number;
    revPar: number;
  };
  revenueByMonth: MonthlyPoint[];
  profitByMonth: MonthlyPoint[];
  expensesByCategory: CategoryPoint[];
  revenueByChannel: ChannelPoint[];
  recentBookings: BookingRecord[];
  recentExpenses: ExpenseRecord[];
  monthlySummary: MonthlyPoint[];
};
