import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import QuoteTemplate from "@/models/QuoteTemplate";
import Company from "@/models/Company";

interface RouteParams {
  params: Promise<{
    token: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;

    const quote = await Quote.findOne({ publicToken: resolvedParams.token })
      .populate("customer", "name email phone company address")
      .populate("template", "title content")
      .populate("items.product", "name price");

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Check if the quote has expired
    if (new Date(quote.validUntil) < new Date()) {
      return NextResponse.json({ error: "Quote has expired" }, { status: 400 });
    }

    // Get company details
    const company = await Company.findOne();

    return NextResponse.json({
      _id: quote._id.toString(),
      quoteNumber: quote.quoteNumber,
      type: quote.type,
      customer: {
        name: quote.customer.name,
        email: quote.customer.email,
        phone: quote.customer.phone,
        company: quote.customer.company,
        address: quote.customer.address,
      },
      template: {
        title: quote.template.title,
        content: quote.template.content,
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
      signature: quote.signature || null,
      signatureDate: quote.signatureDate || null,
      company: company
        ? {
            name: company.name,
            logo: company.logo,
            address: company.address,
            contactInfo: company.contactInfo,
            signature: company.signature,
            taxId: company.taxId,
            bankDetails: company.bankDetails,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching public quote:", error);
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}
