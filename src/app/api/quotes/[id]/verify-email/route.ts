import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import { cookies } from "next/headers";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();
    const resolvedParams = await params;
    const quote = await Quote.findById(resolvedParams.id).populate(
      "customer",
      "email"
    );

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Check if the email matches the customer's email
    if (quote.customer.email !== email) {
      return NextResponse.json(
        { error: "Email does not match" },
        { status: 400 }
      );
    }

    // Set a cookie to remember the verified email
    const cookieStore = await cookies();
    cookieStore.set(`quote_${quote.publicToken}_verified`, email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Update the quote to mark the email as verified
    quote.emailVerified = true;
    await quote.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
