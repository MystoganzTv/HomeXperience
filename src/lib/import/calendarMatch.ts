import { differenceInCalendarDays, parseISO } from "date-fns";
import type { CalendarEventRecord } from "@/lib/types";
import type {
  ImportBookingCandidate,
  ImportBookingRowStatus,
  ImportCalendarMatch,
} from "./types";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function sameProperty(
  booking: ImportBookingCandidate["booking"],
  event: CalendarEventRecord,
) {
  if (booking.propertyId && event.propertyId) {
    return booking.propertyId === event.propertyId;
  }

  return normalizeText(booking.propertyName) === normalizeText(event.propertyName);
}

function overlaps(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
) {
  return startA < endB && endA > startB;
}

function buildMatch(
  row: ImportBookingCandidate,
  event: CalendarEventRecord,
  matchType: ImportCalendarMatch["matchType"],
): ImportCalendarMatch {
  if (matchType === "blocked_conflict") {
    return {
      rowIndex: row.rowIndex,
      matchType,
      calendarEventId: Number(event.id ?? 0),
      summary: event.summary,
      eventType: event.eventType,
      message: "This booking overlaps a blocked calendar event.",
    };
  }

  return {
    rowIndex: row.rowIndex,
    matchType,
    calendarEventId: Number(event.id ?? 0),
    summary: event.summary,
    eventType: event.eventType,
    message:
      matchType === "exact"
        ? "This booking matches an existing calendar event."
        : "This booking likely matches a nearby calendar event.",
  };
}

export function matchBookingsToCalendar(
  rows: ImportBookingCandidate[],
  calendarEvents: CalendarEventRecord[],
) {
  const calendarMatches: ImportCalendarMatch[] = [];
  const matchedRows = rows.map((row) => {
    const propertyEvents = calendarEvents.filter((event) => sameProperty(row.booking, event));

    const blockedConflict = propertyEvents.find(
      (event) =>
        event.eventType === "blocked" &&
        overlaps(row.booking.checkIn, row.booking.checkOut, event.startDate, event.endDate),
    );

    if (blockedConflict) {
      const calendarMatch = buildMatch(row, blockedConflict, "blocked_conflict");
      calendarMatches.push(calendarMatch);
      return {
        ...row,
        calendarMatch,
        rowStatus: "conflict" as ImportBookingRowStatus,
      };
    }

    const exactMatch = propertyEvents.find(
      (event) =>
        event.eventType !== "blocked" &&
        row.booking.checkIn === event.startDate &&
        row.booking.checkOut === event.endDate,
    );

    if (exactMatch) {
      const calendarMatch = buildMatch(row, exactMatch, "exact");
      calendarMatches.push(calendarMatch);
      return {
        ...row,
        calendarMatch,
        rowStatus: "matched" as ImportBookingRowStatus,
      };
    }

    const probableMatch = propertyEvents.find((event) => {
      if (event.eventType === "blocked") {
        return false;
      }

      if (!overlaps(row.booking.checkIn, row.booking.checkOut, event.startDate, event.endDate)) {
        return false;
      }

      const startDiff = Math.abs(
        differenceInCalendarDays(parseISO(row.booking.checkIn), parseISO(event.startDate)),
      );
      const endDiff = Math.abs(
        differenceInCalendarDays(parseISO(row.booking.checkOut), parseISO(event.endDate)),
      );

      return startDiff <= 1 && endDiff <= 1;
    });

    if (probableMatch) {
      const calendarMatch = buildMatch(row, probableMatch, "probable");
      calendarMatches.push(calendarMatch);
      return {
        ...row,
        calendarMatch,
        rowStatus: "matched" as ImportBookingRowStatus,
      };
    }

    return {
      ...row,
      rowStatus: "new" as ImportBookingRowStatus,
    };
  });

  return {
    bookings: matchedRows,
    calendarMatches,
  };
}
