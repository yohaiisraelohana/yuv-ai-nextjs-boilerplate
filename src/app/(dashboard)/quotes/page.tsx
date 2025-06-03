import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Types } from "mongoose";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuotesTable } from "./components/QuotesTable";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Customer from "@/models/Customer";
import QuoteTemplate from "@/models/QuoteTemplate";
import mongoose from "mongoose";

// Ensure models are registered
const models = {
  Quote,
  Customer,
  QuoteTemplate,
};

type QuoteType = {
  _id: string;
  quoteNumber: string;
  type: "שירותים" | "סדנאות" | "מוצרים";
  customer: { _id: string; name: string };
  validUntil: Date;
  totalAmount: number;
  status: "טיוטה" | "נשלחה" | "מאושרת" | "נדחתה" | "פג תוקף";
  items: Array<{
    product: { _id: string; name: string; price: number };
    quantity: number;
    price: number;
    discount: number;
  }>;
  notes?: string;
  template: { _id: string; title: string };
};

type MongoQuote = {
  _id: Types.ObjectId;
  quoteNumber: string;
  type: "שירותים" | "סדנאות" | "מוצרים";
  customer: { _id: Types.ObjectId; name: string };
  validUntil: Date;
  totalAmount: number;
  status: "טיוטה" | "נשלחה" | "מאושרת" | "נדחתה" | "פג תוקף";
  items: Array<{
    _id: Types.ObjectId;
    product: { _id: Types.ObjectId; name: string; price: number };
    quantity: number;
    price: number;
    discount: number;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  template: Types.ObjectId;
};

async function getQuotes() {
  try {
    const connection = await connectToDatabase();

    // Debug: Log registered models
    console.log("Registered models:", Object.keys(mongoose.models));

    // Ensure models are explicitly registered
    if (!mongoose.models.Quote) {
      console.log("Registering Quote model");
      mongoose.model("Quote", Quote.schema);
    }
    if (!mongoose.models.QuoteTemplate) {
      console.log("Registering QuoteTemplate model");
      mongoose.model("QuoteTemplate", QuoteTemplate.schema);
    }
    if (!mongoose.models.Customer) {
      console.log("Registering Customer model");
      mongoose.model("Customer", Customer.schema);
    }

    console.log("Models after registration:", Object.keys(mongoose.models));

    // Debug: Check quote count and structure
    const quoteCount = await Quote.countDocuments();
    console.log("Total quotes in database:", quoteCount);

    if (quoteCount > 0) {
      // Check a sample quote structure
      const sampleQuote = await Quote.findOne().lean();
      console.log("Sample quote structure:", sampleQuote);
      if (
        sampleQuote &&
        typeof sampleQuote === "object" &&
        "template" in sampleQuote
      ) {
        console.log("Sample quote template field:", sampleQuote.template);
        console.log("Sample quote template type:", typeof sampleQuote.template);
      }
    }

    // Try basic query first without populate
    console.log("Attempting basic quote query without populate...");
    const basicQuotes = await Quote.find().sort({ createdAt: -1 }).lean();
    console.log("Basic query successful, found", basicQuotes.length, "quotes");

    // Now try with populate
    console.log("Attempting query with populate...");
    const quotes = await Quote.find()
      .populate("customer", "name")
      .populate({
        path: "template",
        select: "title",
        model: "QuoteTemplate",
      })
      .sort({ createdAt: -1 })
      .lean();

    const serializedQuotes = quotes.map((quote: any) => ({
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
        _id: item._id.toString(),
        product: {
          _id: item.product._id.toString(),
          name: item.product.name,
          price: item.product.price,
        },
      })),
      validUntil: new Date(quote.validUntil),
      createdAt: new Date(quote.createdAt),
      updatedAt: new Date(quote.updatedAt),
    }));

    return serializedQuotes as unknown as QuoteType[];
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return [];
  }
}

export default async function QuotesPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const quotes = await getQuotes();

  return (
    <div className="py-10">
      <Card>
        <CardHeader>
          <CardTitle>רשימת הצעות מחיר</CardTitle>
        </CardHeader>
        <CardContent>
          <QuotesTable initialQuotes={quotes} />
        </CardContent>
      </Card>
    </div>
  );
}
