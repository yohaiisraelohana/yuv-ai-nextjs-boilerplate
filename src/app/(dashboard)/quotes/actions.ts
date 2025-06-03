"use server";

import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import { revalidatePath } from "next/cache";
import { getProducts } from "../products/actions";

export async function getQuotes() {
  try {
    await connectToDatabase();
    const quotes = await Quote.find()
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .lean();
    return { quotes: JSON.parse(JSON.stringify(quotes)) };
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return { error: "Failed to fetch quotes" };
  }
}

async function generateQuoteNumber() {
  const count = await Quote.countDocuments();
  return `Q${count + 1}`;
}

export async function createQuote(data: {
  type: "שירותים" | "סדנאות" | "מוצרים";
  customer: { _id: string; name: string };
  template: { _id: string; title: string };
  validUntil: Date;
  items: Array<{
    product: { _id: string; name: string; price: number };
    quantity: number;
    price: number;
    discount: number;
  }>;
  notes?: string;
  totalAmount: number;
}) {
  try {
    await connectToDatabase();
    const quoteNumber = await generateQuoteNumber();
    const quote = await Quote.create({
      ...data,
      quoteNumber,
      status: "טיוטה",
    });
    return { quote: JSON.parse(JSON.stringify(quote)) };
  } catch (error) {
    console.error("Error creating quote:", error);
    return { error: "Failed to create quote" };
  }
}

export async function updateQuote(
  id: string,
  data: {
    type: "שירותים" | "סדנאות" | "מוצרים";
    customer: { _id: string; name: string };
    template: { _id: string; title: string };
    validUntil: Date;
    items: Array<{
      product: { _id: string; name: string; price: number };
      quantity: number;
      price: number;
      discount: number;
    }>;
    notes?: string;
    totalAmount: number;
  }
) {
  try {
    await connectToDatabase();
    const quote = await Quote.findByIdAndUpdate(id, data, {
      new: true,
    });
    return { quote: JSON.parse(JSON.stringify(quote)) };
  } catch (error) {
    console.error("Error updating quote:", error);
    return { error: "Failed to update quote" };
  }
}

export async function deleteQuote(id: string) {
  try {
    await connectToDatabase();
    await Quote.findByIdAndDelete(id);
    revalidatePath("/quotes");
    return { success: true };
  } catch (error) {
    console.error("Error deleting quote:", error);
    return { error: "Failed to delete quote" };
  }
}

export async function getQuote(id: string) {
  await connectToDatabase();
  const quote = await Quote.findById(id)
    .populate("customer", "name email")
    .populate("template", "title")
    .populate("items.product", "name price")
    .lean();

  if (!quote) {
    throw new Error("Quote not found");
  }

  return {
    ...quote,
    _id: quote._id.toString(),
    customer: {
      _id: quote.customer._id.toString(),
      name: quote.customer.name,
    },
    template: {
      _id: quote.template._id.toString(),
      title: quote.template.title,
    },
    items: quote.items.map((item: any) => ({
      ...item,
      product: {
        _id: item.product._id.toString(),
        name: item.product.name,
        price: item.product.price,
      },
    })),
  };
}
