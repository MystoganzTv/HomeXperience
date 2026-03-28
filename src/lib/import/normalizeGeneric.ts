import { normalizeExpenseFields } from "@/lib/expense-normalization";
import {
  findHeaderRowIndex,
  genericBookingColumns,
  genericExpenseColumns,
  getCell,
  mapOptionalColumns,
  mapRequiredColumns,
  rowIsEmpty,
  toRawRow,
} from "./columnMatchers";
import { calculateNights, parseImportDate, parseNights } from "./dates";
import { inferCurrency, parseMoney } from "./money";
import { hasFatalWarnings, validateBookingRow, validateExpenseRow } from "./validators";
import type {
  ImportValidationWarning,
  NormalizedImportBooking,
  NormalizedImportExpense,
  ParsedImportWorkbook,
} from "./types";

export function normalizeGeneric(workbook: ParsedImportWorkbook) {
  const bookingsSheet = workbook.sheets.find((sheet) => sheet.normalizedName === "bookings");
  const expensesSheet = workbook.sheets.find((sheet) => sheet.normalizedName === "expenses");

  if (!bookingsSheet || !expensesSheet) {
    throw new Error("Generic imports require both Bookings and Expenses sheets.");
  }

  const bookingHeaderRowIndex = findHeaderRowIndex(bookingsSheet.rows, genericBookingColumns);
  const expenseHeaderRowIndex = findHeaderRowIndex(expensesSheet.rows, genericExpenseColumns);

  if (bookingHeaderRowIndex < 0) {
    throw new Error("Hostlyx could not find the Bookings header row.");
  }

  if (expenseHeaderRowIndex < 0) {
    throw new Error("Hostlyx could not find the Expenses header row.");
  }

  const bookingHeaders = bookingsSheet.rows[bookingHeaderRowIndex];
  const expenseHeaders = expensesSheet.rows[expenseHeaderRowIndex];
  const bookingIndexes = mapRequiredColumns(bookingHeaders, {
    checkIn: genericBookingColumns.checkIn,
    checkOut: genericBookingColumns.checkOut,
    guestName: genericBookingColumns.guestName,
    totalRevenue: genericBookingColumns.totalRevenue,
    payout: genericBookingColumns.payout,
  });
  const bookingOptional = mapOptionalColumns(bookingHeaders, genericBookingColumns);
  const expenseIndexes = mapRequiredColumns(expenseHeaders, {
    date: genericExpenseColumns.date,
    category: genericExpenseColumns.category,
    amount: genericExpenseColumns.amount,
    description: genericExpenseColumns.description,
    note: genericExpenseColumns.note,
  });
  const expenseOptional = mapOptionalColumns(expenseHeaders, genericExpenseColumns);

  const warnings: ImportValidationWarning[] = [];
  const bookings: NormalizedImportBooking[] = [];
  const expenses: NormalizedImportExpense[] = [];
  let skippedRows = 0;
  let warningRows = 0;

  bookingsSheet.rows
    .slice(bookingHeaderRowIndex + 1)
    .filter((row) => !rowIsEmpty(row))
    .forEach((row, index) => {
      const rowIndex = bookingHeaderRowIndex + index + 2;
      const grossMoney = parseMoney(getCell(row, bookingOptional.totalRevenue));
      const payoutMoney = parseMoney(getCell(row, bookingOptional.payout));
      const feeMoney = parseMoney(getCell(row, bookingOptional.hostFee));
      const cleaningMoney = parseMoney(getCell(row, bookingOptional.cleaningFee));
      const checkIn = parseImportDate(getCell(row, bookingIndexes.checkIn));
      const checkOut = parseImportDate(getCell(row, bookingIndexes.checkOut));
      const derivedNights =
        parseNights(getCell(row, bookingOptional.rentalPeriod)) ||
        calculateNights(checkIn, checkOut);
      const booking: NormalizedImportBooking = {
        source: "generic",
        propertyName: String(getCell(row, bookingOptional.propertyName) ?? "").trim(),
        bookingReference: String(getCell(row, bookingOptional.bookingReference) ?? "").trim(),
        guestName: String(getCell(row, bookingIndexes.guestName) ?? "").trim(),
        channel: String(getCell(row, bookingOptional.channel) ?? "").trim() || "Direct",
        checkIn,
        checkOut,
        nights: derivedNights,
        guests: Number(String(getCell(row, bookingOptional.guests) ?? "").replace(/[^\d]/g, "")) || 0,
        grossRevenue: grossMoney.value,
        platformFee: feeMoney.value,
        cleaningFee: cleaningMoney.value,
        payout: payoutMoney.value,
        currency: inferCurrency(
          grossMoney.currency,
          payoutMoney.currency,
          feeMoney.currency,
          cleaningMoney.currency,
        ),
        status: String(getCell(row, bookingOptional.status) ?? "").trim() || "Booked",
        rawRow: toRawRow(bookingHeaders, row),
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

  expensesSheet.rows
    .slice(expenseHeaderRowIndex + 1)
    .filter((row) => !rowIsEmpty(row))
    .forEach((row, index) => {
      const rowIndex = expenseHeaderRowIndex + index + 2;
      const normalizedExpenseFields = normalizeExpenseFields({
        amountValue: getCell(row, expenseIndexes.amount),
        descriptionValue: getCell(row, expenseIndexes.description),
        noteValue: getCell(row, expenseIndexes.note),
      });
      const expense: NormalizedImportExpense = {
        source: "generic",
        propertyName: String(getCell(row, expenseOptional.propertyName) ?? "").trim(),
        date: parseImportDate(getCell(row, expenseIndexes.date)),
        category: String(getCell(row, expenseIndexes.category) ?? "").trim() || "Other",
        description: normalizedExpenseFields.description,
        note: normalizedExpenseFields.note,
        amount: normalizedExpenseFields.amount,
        rawRow: toRawRow(expenseHeaders, row),
      };

      const rowWarnings = validateExpenseRow({ expense, rowIndex });
      warnings.push(...rowWarnings);

      if (hasFatalWarnings(rowWarnings)) {
        skippedRows += 1;
        return;
      }

      expenses.push(expense);
    });

  return {
    bookings,
    expenses,
    warnings,
    warningRows,
    skippedRows,
    totalRowsRead:
      bookingsSheet.rows.slice(bookingHeaderRowIndex + 1).filter((row) => !rowIsEmpty(row)).length +
      expensesSheet.rows.slice(expenseHeaderRowIndex + 1).filter((row) => !rowIsEmpty(row)).length,
  };
}
