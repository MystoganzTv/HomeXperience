import { NextResponse } from "next/server";
import { requireUserEmail } from "@/lib/auth";
import { upsertUserSettings } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ownerEmail = await requireUserEmail();

    if (!ownerEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const businessName = String(formData.get("businessName") ?? "").trim();
    const currencyCode = String(formData.get("currencyCode") ?? "USD").trim();

    if (!businessName) {
      return NextResponse.json(
        { error: "Add a business name before saving settings." },
        { status: 400 },
      );
    }

    if (currencyCode !== "USD" && currencyCode !== "EUR") {
      return NextResponse.json(
        { error: "Currency must be USD or EUR." },
        { status: 400 },
      );
    }

    await upsertUserSettings({
      ownerEmail,
      businessName,
      currencyCode,
    });

    return NextResponse.json({
      message: `Saved settings for ${businessName}.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The business settings could not be saved.",
      },
      { status: 400 },
    );
  }
}
