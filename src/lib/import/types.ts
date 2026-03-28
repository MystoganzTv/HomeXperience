export type ImportDetectedSource = "airbnb" | "generic" | "unknown";

export type ImportCellValue = string | number | boolean | Date | null | undefined;
export type ImportSheetRow = ImportCellValue[];

export type RawImportRow = Record<string, string | number | null>;

export type ImportValidationWarning = {
  rowType: "booking" | "expense" | "file";
  rowIndex: number;
  code: string;
  message: string;
  severity: "warning" | "fatal";
};

export type NormalizedImportBooking = {
  source: ImportDetectedSource;
  propertyName: string;
  bookingReference: string;
  guestName: string;
  channel: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  grossRevenue: number;
  platformFee: number;
  cleaningFee: number;
  payout: number;
  currency: string;
  status: string;
  rawRow: RawImportRow;
};

export type NormalizedImportExpense = {
  source: ImportDetectedSource;
  propertyName: string;
  date: string;
  category: string;
  description: string;
  note: string;
  amount: number;
  rawRow: RawImportRow;
};

export type ImportPreviewRow = Pick<
  NormalizedImportBooking,
  "guestName" | "channel" | "checkIn" | "checkOut" | "grossRevenue" | "payout"
>;

export type ImportPreview = {
  source: ImportDetectedSource;
  sourceLabel: string;
  fileName: string;
  totalRowsRead: number;
  validRows: number;
  warningRows: number;
  skippedRows: number;
  expensesDetected: number;
  bookings: NormalizedImportBooking[];
  expenses: NormalizedImportExpense[];
  previewRows: ImportPreviewRow[];
  warnings: ImportValidationWarning[];
  canImport: boolean;
};

export type ParsedImportSheet = {
  name: string;
  normalizedName: string;
  rows: ImportSheetRow[];
};

export type ParsedImportWorkbook = {
  fileName: string;
  sheets: ParsedImportSheet[];
};

export function getDetectedSourceLabel(source: ImportDetectedSource) {
  switch (source) {
    case "airbnb":
      return "Airbnb";
    case "generic":
      return "Generic Excel";
    default:
      return "Unknown format";
  }
}
