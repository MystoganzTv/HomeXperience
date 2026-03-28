import type { ImportCellValue, ImportSheetRow, RawImportRow } from "./types";

export const genericBookingColumns = {
  checkIn: ["checkin"],
  checkOut: ["checkout"],
  guestName: ["guestname"],
  guests: ["ofguests", "guests", "guestcount"],
  channel: ["channel"],
  rentalPeriod: ["rentalperiod"],
  totalRevenue: ["totalrevenue"],
  hostFee: ["hostfee"],
  cleaningFee: ["cleaningfee"],
  payout: ["payout"],
  bookingReference: ["bookingnumber"],
  propertyName: ["propertyname", "property", "listing", "listingname", "unitname"],
  status: ["overbookingstatus", "status"],
} as const;

export const genericExpenseColumns = {
  date: ["date"],
  category: ["category"],
  amount: ["amount"],
  description: ["description"],
  note: ["note"],
  propertyName: ["propertyname", "property", "listing", "listingname", "unitname"],
} as const;

export const airbnbBookingColumns = {
  bookingReference: [
    "confirmationcode",
    "confirmationnumber",
    "confirmation",
    "bookingreference",
    "reservationcode",
    "reservationid",
  ],
  guestName: ["guest", "guestname", "bookedby", "primaryguest", "name"],
  propertyName: ["listing", "listingname", "listingtitle", "property", "propertyname"],
  checkIn: ["checkin", "checkindate", "arrival", "arrivaldate"],
  checkOut: ["checkout", "checkoutdate", "departure", "departuredate"],
  nights: ["nights", "nightcount", "lengthofstay"],
  payout: ["payout", "netpayout", "yourearnings", "hostpayout", "expectedpayout"],
  grossRevenue: [
    "grossrevenue",
    "grossbookingvalue",
    "bookingvalue",
    "subtotal",
    "paidbyguest",
    "guestpaid",
    "reservationvalue",
  ],
  platformFee: ["hostfee", "servicefee", "hostservicefee", "airbnbservicefee"],
  cleaningFee: ["cleaningfee", "cleaning"],
  guests: ["guests", "guestcount", "numberofguests"],
  status: ["status", "reservationstatus"],
  currency: ["currency", "currencycode"],
} as const;

export function normalizeHeader(value: ImportCellValue) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function rowIsEmpty(row: ImportSheetRow) {
  return row.every((cell) => String(cell ?? "").trim() === "");
}

export function mapOptionalColumns<T extends string>(
  headers: ImportSheetRow,
  columns: Record<T, readonly string[]>,
) {
  const normalizedHeaders = headers.map((header) => normalizeHeader(header));
  const indexes: Partial<Record<T, number>> = {};

  for (const [key, aliases] of Object.entries(columns) as Array<[T, readonly string[]]>) {
    const index = normalizedHeaders.findIndex((header) => aliases.includes(header));
    if (index >= 0) {
      indexes[key] = index;
    }
  }

  return indexes;
}

export function mapRequiredColumns<T extends string>(
  headers: ImportSheetRow,
  columns: Record<T, readonly string[]>,
) {
  const normalizedHeaders = headers.map((header) => normalizeHeader(header));

  return Object.fromEntries(
    (Object.entries(columns) as Array<[T, readonly string[]]>).map(([key, aliases]) => {
      const index = normalizedHeaders.findIndex((header) => aliases.includes(header));
      if (index < 0) {
        throw new Error(`Missing required column: ${key}`);
      }

      return [key, index];
    }),
  ) as Record<T, number>;
}

export function findHeaderRowIndex<T extends string>(
  rows: ImportSheetRow[],
  columns: Record<T, readonly string[]>,
) {
  for (let index = 0; index < Math.min(rows.length, 12); index += 1) {
    try {
      mapRequiredColumns(rows[index], columns);
      return index;
    } catch {
      continue;
    }
  }

  return -1;
}

export function getCell(row: ImportSheetRow, index: number | undefined) {
  return typeof index === "number" ? row[index] : "";
}

export function toRawRow(headers: ImportSheetRow, row: ImportSheetRow): RawImportRow {
  return Object.fromEntries(
    headers.map((header, index) => {
      const key = String(header ?? "").trim() || `column_${index + 1}`;
      const value = row[index];

      if (typeof value === "number") {
        return [key, value];
      }

      const normalized = String(value ?? "").trim();
      return [key, normalized || null];
    }),
  );
}
