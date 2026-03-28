import { formatCurrency } from "@/lib/format";
import type { CurrencyCode, DashboardView } from "@/lib/types";

type RealityCheckData = NonNullable<DashboardView["realityCheck"]>;

function formatSignedCurrency(value: number, currencyCode: CurrencyCode) {
  const absolute = formatCurrency(Math.abs(value), false, currencyCode);
  if (value > 0) {
    return `+${absolute}`;
  }

  if (value < 0) {
    return `-${absolute}`;
  }

  return absolute;
}

export function getRealityCheckSidebarBadge(
  realityCheck: RealityCheckData | null,
  currencyCode: CurrencyCode,
) {
  if (!realityCheck) {
    return null;
  }

  if (Math.abs(realityCheck.difference) >= 1) {
    return {
      label: formatSignedCurrency(realityCheck.difference, currencyCode),
      tone: realityCheck.difference < 0 ? ("caution" as const) : ("neutral" as const),
    };
  }

  if (realityCheck.alertMessage) {
    return {
      label: "Alert",
      tone: "caution" as const,
    };
  }

  return null;
}
