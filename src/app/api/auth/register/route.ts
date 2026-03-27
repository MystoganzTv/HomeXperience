import { NextResponse } from "next/server";
import { createAuthUser, getAuthUserByEmail } from "@/lib/db";
import { isEmailAllowed } from "@/lib/auth";
import { hashPassword, isValidPassword, normalizeAuthEmail } from "@/lib/password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = normalizeAuthEmail(String(formData.get("email") ?? ""));
    const password = String(formData.get("password") ?? "");

    if (!fullName) {
      return NextResponse.json(
        { error: "Enter your full name to create the account." },
        { status: 400 },
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "Use a password with at least 8 characters." },
        { status: 400 },
      );
    }

    if (!isEmailAllowed(email)) {
      return NextResponse.json(
        { error: "This email is not approved for this Hostlyx workspace." },
        { status: 403 },
      );
    }

    const existingUser = await getAuthUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    await createAuthUser({
      email,
      fullName,
      passwordHash: hashPassword(password),
    });

    return NextResponse.json({
      message: "Account created. Signing you in now.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The account could not be created.",
      },
      { status: 400 },
    );
  }
}
