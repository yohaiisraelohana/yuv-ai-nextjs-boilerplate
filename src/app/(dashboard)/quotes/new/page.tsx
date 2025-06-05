"use client";

import { QuoteForm } from "../components/QuoteForm";
import { useRouter } from "next/navigation";
import { createQuote } from "../actions";
import { toast } from "sonner";

export default function NewQuotePage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const result = await createQuote(data);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success("ההצעה נוצרה בהצלחה");
      router.push("/quotes");
    } catch (error) {
      toast.error("אירעה שגיאה ביצירת ההצעה");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">הצעת מחיר חדשה</h1>
      <QuoteForm onSubmit={handleSubmit} />
    </div>
  );
}
