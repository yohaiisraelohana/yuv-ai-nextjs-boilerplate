import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    await connectToDatabase();
    const quote = (await Quote.findOne({ publicToken: params.token })
      .populate("customer", "name email")
      .populate("template", "title")
      .populate("items.product", "name price")
      .lean()) as any;

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Check if the quote has expired
    if (new Date(quote.validUntil) < new Date()) {
      return NextResponse.json({ error: "Quote has expired" }, { status: 400 });
    }

    return NextResponse.json({
      _id: quote._id.toString(),
      quoteNumber: quote.quoteNumber,
      type: quote.type,
      customer: {
        name: quote.customer.name,
        email: quote.customer.email,
      },
      template: {
        title: quote.template.title,
      },
      validUntil: quote.validUntil,
      totalAmount: quote.totalAmount,
      status: quote.status,
      items: quote.items.map((item: any) => ({
        product: {
          name: item.product.name,
          price: item.product.price,
        },
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
      })),
      notes: quote.notes,
    });
  } catch (error) {
    console.error("Error fetching public quote:", error);
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}
