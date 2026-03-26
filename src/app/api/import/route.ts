import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUserEmail } from "@/lib/auth";
import {
  appendImportData,
  getImportedWorkbookMatches,
  getPropertyDefinitions,
} from "@/lib/db";
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

    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File && value.size > 0);
    const fallbackFile = formData.get("file");
    const requestedPropertyName = String(formData.get("propertyName") ?? "").trim();
    const workbookFiles =
      files.length > 0
        ? files
        : fallbackFile instanceof File && fallbackFile.size > 0
          ? [fallbackFile]
          : [];

    if (workbookFiles.length === 0) {
      return NextResponse.json(
        { error: "Attach a valid .xlsx file to import." },
        { status: 400 },
      );
    }

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

    let totalBookings = 0;
    let totalExpenses = 0;
    let totalClosures = 0;
    let totalSkippedBookings = 0;
    let totalSkippedExpenses = 0;
    let totalSkippedClosures = 0;
    let totalSkippedWorkbooks = 0;
    const importedFiles: string[] = [];
    const seenWorkbookHashes = new Set<string>();

    for (const file of workbookFiles) {
      if (!file.name.toLowerCase().endsWith(".xlsx")) {
        return NextResponse.json(
          { error: `Only .xlsx workbooks are supported. "${file.name}" is not valid.` },
          { status: 400 },
        );
      }

      const buffer = await file.arrayBuffer();
      const workbookHash = createHash("sha256")
        .update(Buffer.from(buffer))
        .digest("hex");

      if (seenWorkbookHashes.has(workbookHash)) {
        totalSkippedWorkbooks += 1;
        continue;
      }

      seenWorkbookHashes.add(workbookHash);
      const existingMatches = await getImportedWorkbookMatches(ownerEmail, [workbookHash]);

      if (existingMatches.length > 0) {
        totalSkippedWorkbooks += 1;
        continue;
      }

      const { bookings, expenses, closures } = parseWorkbook(buffer);

      const result = await appendImportData({
        ownerEmail,
        fileName: file.name,
        workbookHash,
        propertyName: targetPropertyName,
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
        closures: closures.map((closure) => ({
          ...closure,
          propertyName: targetPropertyName,
          unitName: "",
        })),
      });

      totalBookings += result.bookingsCount;
      totalExpenses += result.expensesCount;
      totalClosures += result.closuresCount;
      totalSkippedBookings += result.skippedBookingsCount;
      totalSkippedExpenses += result.skippedExpensesCount;
      totalSkippedClosures += result.skippedClosuresCount;
      importedFiles.push(file.name);
    }

    const duplicateNotice =
      totalSkippedBookings > 0 ||
      totalSkippedExpenses > 0 ||
      totalSkippedClosures > 0 ||
      totalSkippedWorkbooks > 0
        ? ` Skipped ${totalSkippedWorkbooks} duplicate workbooks, ${totalSkippedBookings} duplicate bookings, ${totalSkippedExpenses} duplicate expenses, and ${totalSkippedClosures} duplicate closed-day records already saved in Hostlyx.`
        : "";
    const fileLabel =
      importedFiles.length === 1
        ? importedFiles[0]
        : `${importedFiles.length} workbooks`;

    if (importedFiles.length === 0 && totalSkippedWorkbooks > 0) {
      return NextResponse.json({
        message: `No new workbooks were imported. Hostlyx recognized ${totalSkippedWorkbooks} selected file${totalSkippedWorkbooks === 1 ? "" : "s"} as already saved by content, so nothing new was added.`,
      });
    }

    return NextResponse.json({
      message: `Added ${totalBookings} bookings, ${totalExpenses} expenses, and ${totalClosures} closed-day records from ${fileLabel} into ${targetPropertyName}. The records now live inside Hostlyx and the upload stays in Import History.${duplicateNotice}`,
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
