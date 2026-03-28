import * as XLSX from "xlsx";
import { normalizeHeader } from "./columnMatchers";
import type { ImportSheetRow, ParsedImportWorkbook } from "./types";

function getSheetRows(sheet: XLSX.WorkSheet) {
  return XLSX.utils.sheet_to_json<ImportSheetRow>(sheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: false,
  });
}

export function parseWorkbook(buffer: ArrayBuffer, fileName: string): ParsedImportWorkbook {
  const workbook = XLSX.read(buffer, {
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
