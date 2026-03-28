import { addDays, differenceInCalendarDays, formatISO, isValid, parse } from "date-fns";
import * as XLSX from "xlsx";
import type { ImportCellValue } from "./types";

export type ParsedImportDate = {
  value: string;
  ambiguous: boolean;
  malformed: boolean;
};

function normalizeParsedDate(value: Date) {
  return formatISO(value, { representation: "date" });
}

function parseDateUsingPatterns(raw: string, patterns: string[]) {
  for (const pattern of patterns) {
    const parsed = parse(raw, pattern, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }

  return null;
}

export function parseImportDateDetailed(value: ImportCellValue): ParsedImportDate {
  if (!value && value !== 0) {
    return {
      value: "",
      ambiguous: false,
      malformed: false,
    };
  }

  if (value instanceof Date && isValid(value)) {
    return {
      value: normalizeParsedDate(value),
      ambiguous: false,
      malformed: false,
    };
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const normalized = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d ?? 1));
      return {
        value: normalizeParsedDate(normalized),
        ambiguous: false,
        malformed: false,
      };
    }
  }

  const raw = String(value ?? "").trim();

  if (!raw) {
    return {
      value: "",
      ambiguous: false,
      malformed: false,
    };
  }

  const ambiguousMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  const ambiguous =
    !!ambiguousMatch &&
    Number(ambiguousMatch[1]) <= 12 &&
    Number(ambiguousMatch[2]) <= 12 &&
    ambiguousMatch[1] !== ambiguousMatch[2];

  const prioritizedPatterns = ambiguous
    ? ["d/M/yyyy", "dd/MM/yyyy", "d/M/yy", "M/d/yyyy", "MM/dd/yyyy", "M/d/yy"]
    : [
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

  const parsed = parseDateUsingPatterns(raw, prioritizedPatterns);
  if (parsed) {
    return {
      value: normalizeParsedDate(parsed),
      ambiguous,
      malformed: false,
    };
  }

  const fallback = new Date(raw);
  if (isValid(fallback)) {
    return {
      value: normalizeParsedDate(fallback),
      ambiguous: false,
      malformed: false,
    };
  }

  return {
    value: "",
    ambiguous: false,
    malformed: true,
  };
}

export function parseImportDate(value: ImportCellValue) {
  return parseImportDateDetailed(value).value;
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
