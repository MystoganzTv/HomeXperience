import {
  airbnbBookingColumns,
  bookingComBookingColumns,
  findHeaderRowIndex,
  genericBookingColumns,
  genericExpenseColumns,
  mapOptionalColumns,
  normalizeHeader,
} from "./columnMatchers";
import type { ImportDetectedSource, ParsedImportWorkbook } from "./types";

export function detectSource(workbook: ParsedImportWorkbook): ImportDetectedSource {
  const hasGenericSheet = workbook.sheets.some(
    (sheet) =>
      sheet.normalizedName === "bookings" ||
      sheet.normalizedName === "expenses" ||
      findHeaderRowIndex(sheet.rows, genericBookingColumns) >= 0 ||
      findHeaderRowIndex(sheet.rows, genericExpenseColumns) >= 0,
  );

  if (hasGenericSheet) {
    return "generic";
  }

  for (const sheet of workbook.sheets) {
    for (let rowIndex = 0; rowIndex < Math.min(sheet.rows.length, 8); rowIndex += 1) {
      const row = sheet.rows[rowIndex];
      const indexes = mapOptionalColumns(row, airbnbBookingColumns);
      const matches = Object.keys(indexes).length;
      const normalizedHeaders = row.map((cell) => normalizeHeader(cell));
      const hasAirbnbSpecificHeader = normalizedHeaders.some((header) =>
        ["confirmationcode", "yourearnings", "hostservicefee", "listing"].includes(header),
      );

      if (
        matches >= 4 &&
        typeof indexes.checkIn === "number" &&
        (typeof indexes.checkOut === "number" || typeof indexes.nights === "number") &&
        (hasAirbnbSpecificHeader ||
          typeof indexes.bookingReference === "number" ||
          typeof indexes.payout === "number")
      ) {
        return "airbnb";
      }

      const bookingIndexes = mapOptionalColumns(row, bookingComBookingColumns);
      const bookingMatches = Object.keys(bookingIndexes).length;
      const hasBookingSpecificHeader = normalizedHeaders.some((header) =>
        ["reservationnumber", "commission", "accommodation", "arrival", "departure"].includes(header),
      );

      if (
        bookingMatches >= 4 &&
        typeof bookingIndexes.checkIn === "number" &&
        typeof bookingIndexes.checkOut === "number" &&
        (typeof bookingIndexes.bookingReference === "number" ||
          typeof bookingIndexes.guestName === "number") &&
        (typeof bookingIndexes.payout === "number" ||
          typeof bookingIndexes.grossRevenue === "number" ||
          typeof bookingIndexes.platformFee === "number") &&
        hasBookingSpecificHeader
      ) {
        return "booking";
      }
    }
  }

  return "unknown";
}
