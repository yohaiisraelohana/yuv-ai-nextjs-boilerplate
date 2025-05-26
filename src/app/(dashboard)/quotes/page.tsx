import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Quote from "@/models/Quote";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Types } from "mongoose";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuotesTable } from "./components/QuotesTable";
import { connectToDatabase } from "@/lib/mongodb";

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
};

async function getQuotes() {
  try {
    await connectToDatabase();
    const quotes = await Quote.find()
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .lean();

    const serializedQuotes = quotes.map((quote: any) => ({
      ...quote,
      _id: quote._id.toString(),
      customer: {
        _id: quote.customer._id.toString(),
        name: quote.customer.name,
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
