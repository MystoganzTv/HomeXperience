import {
  airbnbBookingColumns,
  getCell,
  mapOptionalColumns,
  rowIsEmpty,
  toRawRow,
} from "./columnMatchers";
import { calculateNights, deriveCheckOut, parseImportDate, parseNights } from "./dates";
import { inferCurrency, parseMoney } from "./money";
import { hasFatalWarnings, validateBookingRow } from "./validators";
import type {
  ImportValidationWarning,
  NormalizedImportBooking,
  ParsedImportWorkbook,
} from "./types";

type AirbnbColumnKey = keyof typeof airbnbBookingColumns;

export function normalizeAirbnb(workbook: ParsedImportWorkbook) {
  let selectedSheet = workbook.sheets[0];
  let selectedHeaderRowIndex = -1;
  let selectedIndexes: Partial<Record<AirbnbColumnKey, number>> | null = null;

  for (const sheet of workbook.sheets) {
    for (let rowIndex = 0; rowIndex < Math.min(sheet.rows.length, 10); rowIndex += 1) {
      const row = sheet.rows[rowIndex];
      const indexes = mapOptionalColumns(row, airbnbBookingColumns);

      if (
        typeof indexes.checkIn === "number" &&
        (typeof indexes.checkOut === "number" || typeof indexes.nights === "number") &&
        (typeof indexes.bookingReference === "number" ||
          typeof indexes.guestName === "number" ||
          typeof indexes.payout === "number")
      ) {
        selectedSheet = sheet;
        selectedHeaderRowIndex = rowIndex;
        selectedIndexes = indexes;
        break;
      }
    }

    if (selectedHeaderRowIndex >= 0) {
      break;
    }
  }

  if (selectedHeaderRowIndex < 0 || !selectedIndexes) {
    throw new Error("Hostlyx could not find recognizable Airbnb columns in this file.");
  }

  const headers = selectedSheet.rows[selectedHeaderRowIndex];
  const warnings: ImportValidationWarning[] = [];
  const bookings: NormalizedImportBooking[] = [];
  let skippedRows = 0;
  let warningRows = 0;

  selectedSheet.rows
    .slice(selectedHeaderRowIndex + 1)
    .filter((row) => !rowIsEmpty(row))
    .forEach((row, index) => {
      const rowIndex = selectedHeaderRowIndex + index + 2;
      const grossMoney = parseMoney(getCell(row, selectedIndexes.grossRevenue));
      const payoutMoney = parseMoney(getCell(row, selectedIndexes.payout));
      const feeMoney = parseMoney(getCell(row, selectedIndexes.platformFee));
      const cleaningMoney = parseMoney(getCell(row, selectedIndexes.cleaningFee));
      const explicitNights = parseNights(getCell(row, selectedIndexes.nights));
      const checkIn = parseImportDate(getCell(row, selectedIndexes.checkIn));
      let checkOut = parseImportDate(getCell(row, selectedIndexes.checkOut));

      if (!checkOut && checkIn && explicitNights > 0) {
        checkOut = deriveCheckOut(checkIn, explicitNights);
      }

      const nights = explicitNights || calculateNights(checkIn, checkOut);
      const booking: NormalizedImportBooking = {
        source: "airbnb",
        propertyName: String(getCell(row, selectedIndexes.propertyName) ?? "").trim(),
        bookingReference: String(getCell(row, selectedIndexes.bookingReference) ?? "").trim(),
        guestName: String(getCell(row, selectedIndexes.guestName) ?? "").trim(),
        channel: "Airbnb",
        checkIn,
        checkOut,
        nights,
        guests: Number(String(getCell(row, selectedIndexes.guests) ?? "").replace(/[^\d]/g, "")) || 0,
        grossRevenue:
          grossMoney.value > 0
            ? grossMoney.value
            : Math.max(0, payoutMoney.value + Math.max(0, feeMoney.value)),
        platformFee: Math.max(0, feeMoney.value),
        cleaningFee: Math.max(0, cleaningMoney.value),
        payout: payoutMoney.value,
        currency: inferCurrency(
          String(getCell(row, selectedIndexes.currency) ?? "").trim(),
          grossMoney.currency,
          payoutMoney.currency,
          feeMoney.currency,
          cleaningMoney.currency,
        ),
        status: String(getCell(row, selectedIndexes.status) ?? "").trim() || "Booked",
        rawRow: toRawRow(headers, row),
      };

      const rowWarnings = validateBookingRow({
        booking,
        rowIndex,
        malformedFields: [
          grossMoney.malformed ? "gross revenue" : "",
          payoutMoney.malformed ? "payout" : "",
          feeMoney.malformed ? "platform fee" : "",
          cleaningMoney.malformed ? "cleaning fee" : "",
        ].filter(Boolean),
      });

      warnings.push(...rowWarnings);

      if (hasFatalWarnings(rowWarnings)) {
        skippedRows += 1;
        return;
      }

      if (rowWarnings.length > 0) {
        warningRows += 1;
      }

      bookings.push(booking);
    });

  return {
    bookings,
    expenses: [],
    warnings,
    warningRows,
    skippedRows,
    totalRowsRead: selectedSheet.rows
      .slice(selectedHeaderRowIndex + 1)
      .filter((row) => !rowIsEmpty(row)).length,
  };
}
