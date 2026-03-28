import { addDays, differenceInCalendarDays, formatISO, isValid, parse } from "date-fns";
import * as XLSX from "xlsx";
import type { ImportCellValue } from "./types";

export function parseImportDate(value: ImportCellValue) {
  if (!value && value !== 0) {
    return "";
  }

  if (value instanceof Date && isValid(value)) {
    return formatISO(value, { representation: "date" });
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const normalized = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d ?? 1));
      return formatISO(normalized, { representation: "date" });
    }
  }

  const raw = String(value ?? "").trim();

  if (!raw) {
    return "";
  }

  const patterns = [
    "M/d/yyyy",
    "MM/dd/yyyy",
    "d/M/yyyy",
    "dd/MM/yyyy",
    "M/d/yy",
    "d/M/yy",
    "yyyy-MM-dd",
    "dd-MM-yyyy",
    "MMM d, yyyy",
    "d MMM yyyy",
  ];

  for (const pattern of patterns) {
    const parsed = parse(raw, pattern, new Date());
    if (isValid(parsed)) {
      return formatISO(parsed, { representation: "date" });
    }
  }

  const fallback = new Date(raw);
  if (isValid(fallback)) {
    return formatISO(fallback, { representation: "date" });
  }

  return "";
}

export function parseNights(value: ImportCellValue) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }

  const raw = String(value ?? "");
  const match = raw.match(/(\d+)/);
  return match ? Math.max(0, Number(match[1])) : 0;
}

export function calculateNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  return differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
}

export function deriveCheckOut(checkIn: string, nights: number) {
  if (!checkIn || nights <= 0) {
    return "";
  }

  return formatISO(addDays(new Date(checkIn), nights), { representation: "date" });
}
