import { NextResponse } from "next/server";
import { requireUserEmail } from "@/lib/auth";
import { appendImportData, getPropertyDefinitions } from "@/lib/db";
import { parseWorkbook } from "@/lib/workbook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ownerEmail = await requireUserEmail();

    if (!ownerEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const propertyDefinitions = await getPropertyDefinitions(ownerEmail);

    if (propertyDefinitions.length === 0) {
      return NextResponse.json(
        { error: "Create your first property before importing a workbook." },
        { status: 400 },
      );
    }

    const file = formData.get("file");
    const requestedPropertyName = String(formData.get("propertyName") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Attach a valid .xlsx file to import." },
        { status: 400 },
      );
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return NextResponse.json(
        { error: "Only .xlsx workbooks are supported." },
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const { bookings, expenses } = parseWorkbook(buffer);
    const targetPropertyName = requestedPropertyName || propertyDefinitions[0]?.name || "";

    if (
      !targetPropertyName ||
      !propertyDefinitions.some(
        (property) => property.name.toLowerCase() === targetPropertyName.toLowerCase(),
      )
    ) {
      return NextResponse.json(
        { error: "Choose a valid property for this import." },
        { status: 400 },
      );
    }

    const result = await appendImportData({
      ownerEmail,
      fileName: file.name,
      source: "upload",
      bookings: bookings.map((booking) => ({
        ...booking,
        propertyName: targetPropertyName,
        unitName: "",
      })),
      expenses: expenses.map((expense) => ({
        ...expense,
        propertyName: targetPropertyName,
        unitName: "",
      })),
    });

    const duplicateNotice =
      result.skippedBookingsCount > 0 || result.skippedExpensesCount > 0
        ? ` Skipped ${result.skippedBookingsCount} duplicate bookings and ${result.skippedExpensesCount} duplicate expenses already saved in Hostlyx.`
        : "";

    return NextResponse.json({
      message: `Added ${result.bookingsCount} bookings and ${result.expensesCount} expenses from ${file.name} into ${targetPropertyName}.${duplicateNotice}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The workbook could not be imported.",
      },
      { status: 400 },
    );
  }
}
