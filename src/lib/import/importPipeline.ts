import type { BookingRecord, ExpenseRecord, ImportedFileSource } from "@/lib/types";
import { detectSource } from "./detectSource";
import { normalizeAirbnb } from "./normalizeAirbnb";
import { normalizeGeneric } from "./normalizeGeneric";
import { parseWorkbook } from "./parseWorkbook";
import {
  getDetectedSourceLabel,
  type ImportDetectedSource,
  type ImportPreview,
} from "./types";

export function buildImportPreview(buffer: ArrayBuffer, fileName: string): ImportPreview {
  const workbook = parseWorkbook(buffer, fileName);
  const source = detectSource(workbook);

  if (source === "unknown") {
    return {
      source,
      sourceLabel: getDetectedSourceLabel(source),
      fileName,
      totalRowsRead: workbook.sheets.reduce((sum, sheet) => sum + Math.max(0, sheet.rows.length - 1), 0),
      validRows: 0,
      warningRows: 0,
      skippedRows: 0,
      expensesDetected: 0,
      bookings: [],
      expenses: [],
      previewRows: [],
      warnings: [
        {
          rowType: "file",
          rowIndex: 0,
          code: "unknown_source",
          message:
            "Hostlyx could not recognize this file yet. Use an Airbnb export or the generic Hostlyx workbook with Bookings and Expenses sheets.",
          severity: "fatal",
        },
      ],
      canImport: false,
    };
  }

  const normalized = source === "airbnb" ? normalizeAirbnb(workbook) : normalizeGeneric(workbook);

  return {
    source,
    sourceLabel: getDetectedSourceLabel(source),
    fileName,
    totalRowsRead: normalized.totalRowsRead,
    validRows: normalized.bookings.length + normalized.expenses.length,
    warningRows: normalized.warningRows,
    skippedRows: normalized.skippedRows,
    expensesDetected: normalized.expenses.length,
    bookings: normalized.bookings,
    expenses: normalized.expenses,
    previewRows: normalized.bookings.slice(0, 5).map((booking) => ({
      guestName: booking.guestName,
      channel: booking.channel,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      grossRevenue: booking.grossRevenue,
      payout: booking.payout,
    })),
    warnings: normalized.warnings,
    canImport: normalized.bookings.length > 0 || normalized.expenses.length > 0,
  };
}

export function mapDetectedSourceToStoredSource(source: ImportDetectedSource): ImportedFileSource {
  return source === "airbnb" ? "airbnb" : "generic_excel";
}

export function mapPreviewToHostlyxRecords(
  preview: ImportPreview,
  propertyName: string,
): {
  importedSource: ImportedFileSource;
  bookings: BookingRecord[];
  expenses: ExpenseRecord[];
} {
  return {
    importedSource: mapDetectedSourceToStoredSource(preview.source),
    bookings: preview.bookings.map((booking) => ({
      propertyName,
      unitName: booking.propertyName,
      importedSource: mapDetectedSourceToStoredSource(preview.source),
      checkIn: booking.checkIn,
      checkout: booking.checkOut,
      guestName: booking.guestName || "Guest",
      guestCount: booking.guests,
      channel: booking.channel,
      rentalPeriod: `${booking.nights} nights`,
      pricePerNight: booking.nights > 0 ? booking.grossRevenue / booking.nights : booking.grossRevenue,
      extraFee: 0,
      discount: 0,
      rentalRevenue: booking.grossRevenue,
      cleaningFee: booking.cleaningFee,
      totalRevenue: booking.grossRevenue,
      hostFee: booking.platformFee,
      payout: booking.payout,
      nights: booking.nights,
      bookingNumber: booking.bookingReference,
      overbookingStatus: booking.status,
    })),
    expenses: preview.expenses.map((expense) => ({
      propertyName,
      unitName: expense.propertyName,
      date: expense.date,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      note: expense.note,
    })),
  };
}
