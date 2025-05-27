import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import { randomBytes } from "crypto";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const quote = await Quote.findById(id);

    if (!quote) {
      return new NextResponse("Quote not found", { status: 404 });
    }

    // Generate a secure random token
    const publicToken = randomBytes(32).toString("hex");

    // Update quote with public token
    quote.publicToken = publicToken;
    await quote.save();

    // Generate the public URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const publicUrl = `${baseUrl}/public/quotes/${publicToken}`;

    return NextResponse.json({ publicUrl });
  } catch (error) {
    console.error("Error generating public link:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
