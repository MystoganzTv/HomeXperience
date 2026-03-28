import * as XLSX from "xlsx";
import { normalizeHeader } from "./columnMatchers";
import type { ImportSheetRow, ParsedImportWorkbook } from "./types";

function looksLikeMojibake(text: string) {
  return /Ã.|â.|�/.test(text);
}

function decodeCsvBuffer(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

  if (!looksLikeMojibake(utf8)) {
    return utf8;
  }

  try {
    return new TextDecoder("windows-1252", { fatal: false }).decode(bytes);
  } catch {
    return utf8;
  }
}

function getSheetRows(sheet: XLSX.WorkSheet) {
  return XLSX.utils.sheet_to_json<ImportSheetRow>(sheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: false,
  });
}

export function parseWorkbook(buffer: ArrayBuffer, fileName: string): ParsedImportWorkbook {
  const isCsv = fileName.toLowerCase().endsWith(".csv");
  const workbook = isCsv
    ? XLSX.read(decodeCsvBuffer(buffer), {
        type: "string",
        cellDates: true,
      })
    : XLSX.read(buffer, {
        type: "array",
        cellDates: true,
      });

  return {
    fileName,
    sheets: workbook.SheetNames.map((sheetName) => ({
      name: sheetName,
      normalizedName: normalizeHeader(sheetName),
      rows: getSheetRows(workbook.Sheets[sheetName]),
    })),
  };
}
