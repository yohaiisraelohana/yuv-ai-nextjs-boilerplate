import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { email } = await request.json();
    await connectToDatabase();
    const { id } = await params;
    const quote = await Quote.findById(id).populate("customer");

    if (!quote) {
      console.error("Quote not found:", id);
      return new NextResponse("Quote not found", { status: 404 });
    }

    console.log("Comparing emails:", {
      provided: email,
      customer: quote.customer.email,
      match: quote.customer.email === email,
    });

    if (quote.customer.email !== email) {
      console.error("Email mismatch:", {
        provided: email,
        customer: quote.customer.email,
      });
      return new NextResponse("Invalid email", { status: 400 });
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex");
    quote.emailVerificationToken = verificationToken;
    await quote.save();

    // Set cookie to mark email as verified
    const cookieStore = await cookies();
    cookieStore.set(`quote_${id}_verified`, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying email:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
