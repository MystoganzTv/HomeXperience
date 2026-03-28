import type {
  ImportValidationWarning,
  NormalizedImportBooking,
  NormalizedImportExpense,
} from "./types";

export function validateBookingRow({
  booking,
  rowIndex,
  malformedFields,
}: {
  booking: NormalizedImportBooking;
  rowIndex: number;
  malformedFields?: string[];
}) {
  const warnings: ImportValidationWarning[] = [];

  if (!booking.checkIn) {
    warnings.push({
      rowType: "booking",
      rowIndex,
      code: "missing_check_in",
      message: "Missing check-in date.",
      severity: "fatal",
    });
  }

  if (!booking.checkOut) {
    warnings.push({
      rowType: "booking",
      rowIndex,
      code: "missing_check_out",
      message: "Missing check-out date.",
      severity: "fatal",
    });
  }

  if (booking.nights <= 0) {
    warnings.push({
      rowType: "booking",
      rowIndex,
      code: "invalid_stay_length",
      message: "Stay length looks invalid.",
      severity: "fatal",
    });
  }

  if (booking.payout < 0) {
    warnings.push({
      rowType: "booking",
      rowIndex,
      code: "negative_payout",
      message: "Payout is negative.",
      severity: "warning",
    });
  }

  if (malformedFields && malformedFields.length > 0) {
    warnings.push({
      rowType: "booking",
      rowIndex,
      code: "malformed_money",
      message: `Some financial values could not be read cleanly: ${malformedFields.join(", ")}.`,
      severity: "warning",
    });
  }

  if (
    !booking.bookingReference &&
    !booking.guestName &&
    booking.grossRevenue === 0 &&
    booking.payout === 0
  ) {
    warnings.push({
      rowType: "booking",
      rowIndex,
      code: "suspicious_row",
      message: "This row looks incomplete and may not be a real booking.",
      severity: "warning",
    });
  }

  return warnings;
}

export function validateExpenseRow({
  expense,
  rowIndex,
}: {
  expense: NormalizedImportExpense;
  rowIndex: number;
}) {
  const warnings: ImportValidationWarning[] = [];

  if (!expense.date) {
    warnings.push({
      rowType: "expense",
      rowIndex,
      code: "missing_expense_date",
      message: "Missing expense date.",
      severity: "fatal",
    });
  }

  if (!Number.isFinite(expense.amount)) {
    warnings.push({
      rowType: "expense",
      rowIndex,
      code: "malformed_expense_amount",
      message: "Expense amount could not be read.",
      severity: "fatal",
    });
  }

  return warnings;
}

export function hasFatalWarnings(warnings: ImportValidationWarning[]) {
  return warnings.some((warning) => warning.severity === "fatal");
}
