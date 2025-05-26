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

async function getQuotes() {
  try {
    await connectToDatabase();
    const quotes = await Quote.find()
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .lean();
    return quotes as unknown as QuoteType[];
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
