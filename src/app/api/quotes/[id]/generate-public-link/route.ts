import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import { nanoid } from "nanoid";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const quote = await Quote.findById(params.id);

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Generate a unique token
    const publicToken = nanoid(32);

    // Update the quote with the public token
    quote.publicToken = publicToken;
    await quote.save();

    // Generate the public URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const publicUrl = `${baseUrl}/public/quotes/${publicToken}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Error generating public link:", error);
    return NextResponse.json(
      { error: "Failed to generate public link" },
      { status: 500 }
    );
  }
}
