import { NextResponse } from "next/server";
import { requireUserEmail } from "@/lib/auth";
import { createPropertyDefinition } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ownerEmail = await requireUserEmail();

    if (!ownerEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const propertyName = String(formData.get("name") ?? "").trim();
    const propertyId = await createPropertyDefinition({
      ownerEmail,
      name: propertyName,
    });

    return NextResponse.json({
      propertyId,
      message: `Property "${propertyName}" created successfully.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "The property could not be created.",
      },
      { status: 400 },
    );
  }
}
