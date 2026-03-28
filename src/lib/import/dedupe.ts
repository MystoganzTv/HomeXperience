import type { BookingRecord } from "@/lib/types";
import type {
  ImportBookingCandidate,
  ImportDetectedSource,
  ImportDuplicateFlag,
} from "./types";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function normalizeAmount(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

function mapStoredSource(source: BookingRecord["importedSource"]): ImportDetectedSource {
  switch (source) {
    case "airbnb":
      return "airbnb";
    case "booking_com":
      return "booking";
    case "generic_excel":
    case "hostlyx_excel":
      return "generic";
    default:
      return "unknown";
  }
}

function buildPreferredKey(source: ImportDetectedSource, bookingReference: string, checkIn: string) {
  if (!source || !bookingReference || !checkIn) {
    return "";
  }

  return `${source}|${normalizeText(bookingReference)}|${checkIn}`;
}

function buildFallbackKey(
  source: ImportDetectedSource,
  guestName: string,
  checkIn: string,
  checkOut: string,
  payout: number,
) {
  if (!source || !guestName || !checkIn || !checkOut || !Number.isFinite(payout)) {
    return "";
  }

  return [
    source,
    normalizeText(guestName),
    checkIn,
    checkOut,
    normalizeAmount(payout),
  ].join("|");
}

export function detectDuplicateBookings(
  rows: ImportBookingCandidate[],
  existingBookings: BookingRecord[],
): ImportDuplicateFlag[] {
  const duplicates: ImportDuplicateFlag[] = [];
  const filePreferred = new Map<string, number>();
  const fileFallback = new Map<string, number>();
  const existingPreferred = new Set<string>();
  const existingFallback = new Set<string>();

  for (const existingBooking of existingBookings) {
    const source = mapStoredSource(existingBooking.importedSource);
    const preferredKey = buildPreferredKey(source, existingBooking.bookingNumber, existingBooking.checkIn);
    const fallbackKey = buildFallbackKey(
      source,
      existingBooking.guestName,
      existingBooking.checkIn,
      existingBooking.checkout,
      existingBooking.payout,
    );

    if (preferredKey) {
      existingPreferred.add(preferredKey);
    }

    if (fallbackKey) {
      existingFallback.add(fallbackKey);
    }
  }

  for (const row of rows) {
    const preferredKey = buildPreferredKey(
      row.booking.source,
      row.booking.bookingReference,
      row.booking.checkIn,
    );
    const fallbackKey = buildFallbackKey(
      row.booking.source,
      row.booking.guestName,
      row.booking.checkIn,
      row.booking.checkOut,
      row.booking.payout,
    );

    if (preferredKey && existingPreferred.has(preferredKey)) {
      duplicates.push({
        rowType: "booking",
        rowIndex: row.rowIndex,
        code: "duplicate_existing_reference",
        message: "This booking already exists in your workspace.",
        severity: "warning",
        matchType: "reference",
        matchScope: "existing",
      });
      continue;
    }

    if (preferredKey && filePreferred.has(preferredKey)) {
      duplicates.push({
        rowType: "booking",
        rowIndex: row.rowIndex,
        code: "duplicate_file_reference",
        message: "This booking appears more than once in the uploaded file.",
        severity: "warning",
        matchType: "reference",
        matchScope: "file",
      });
      continue;
    }

    if (fallbackKey && existingFallback.has(fallbackKey)) {
      duplicates.push({
        rowType: "booking",
        rowIndex: row.rowIndex,
        code: "duplicate_existing_fallback",
        message: "This booking looks like an existing reservation with the same guest, stay, and payout.",
        severity: "warning",
        matchType: "fallback",
        matchScope: "existing",
      });
      continue;
    }

    if (fallbackKey && fileFallback.has(fallbackKey)) {
      duplicates.push({
        rowType: "booking",
        rowIndex: row.rowIndex,
        code: "duplicate_file_fallback",
        message: "This booking looks duplicated inside the uploaded file.",
        severity: "warning",
        matchType: "fallback",
        matchScope: "file",
      });
      continue;
    }

    if (preferredKey) {
      filePreferred.set(preferredKey, row.rowIndex);
    }

    if (fallbackKey) {
      fileFallback.set(fallbackKey, row.rowIndex);
    }
  }

  return duplicates;
}
