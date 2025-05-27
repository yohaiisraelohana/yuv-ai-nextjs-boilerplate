import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { signature } = await request.json();
    await connectToDatabase();
    const { id } = await params;

    // Force a new connection to get the latest model
    const quote = await Quote.findById(id).exec();

    if (!quote) {
      return new NextResponse("Quote not found", { status: 404 });
    }

    // Log the schema to check enum values
    console.log("Status enum values:", quote.schema.path("status").enumValues);

    // Update quote with signature
    quote.signature = signature;
    quote.signedAt = new Date().toISOString();
    quote.status = "ממתין לאישור";

    // Use validateSync to check for validation errors before saving
    const validationError = quote.validateSync();
    if (validationError) {
      console.error("Validation error:", validationError);
      return new NextResponse("Validation error", { status: 400 });
    }

    await quote.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error signing quote:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
