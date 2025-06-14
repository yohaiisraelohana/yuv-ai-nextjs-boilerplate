import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { signature } = await request.json();

    if (!signature) {
      return NextResponse.json(
        { error: "Signature is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const resolvedParams = await params;
    const quote = await Quote.findById(resolvedParams.id);

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Check if the quote is already signed
    if (quote.signature) {
      return NextResponse.json(
        { error: "Quote is already signed" },
        { status: 400 }
      );
    }

    // Update the quote with the signature
    quote.signature = signature;
    quote.signedAt = new Date();
    quote.status = "חתומה";
    await quote.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error signing quote:", error);
    return NextResponse.json(
      { error: "Failed to sign quote" },
      { status: 500 }
    );
  }
}
