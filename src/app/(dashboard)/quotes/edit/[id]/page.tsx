"use client";

import { QuoteForm } from "../../components/QuoteForm";
import { useRouter } from "next/navigation";
import { updateQuote } from "../../actions";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function EditQuotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch(`/api/quotes/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch quote");
        const data = await response.json();
        setQuote(data);
      } catch (error) {
        toast.error("שגיאה בטעינת ההצעה");
        router.push("/quotes");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [params.id, router]);

  const handleSubmit = async (data: any) => {
    try {
      const result = await updateQuote(params.id, data);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success("ההצעה עודכנה בהצלחה");
      router.push("/quotes");
    } catch (error) {
      toast.error("אירעה שגיאה בעדכון ההצעה");
    }
  };

  if (loading) {
    return <div>טוען...</div>;
  }

  if (!quote) {
    return <div>הצעה לא נמצאה</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">עריכת הצעת מחיר</h1>
      <QuoteForm quote={quote} onSubmit={handleSubmit} />
    </div>
  );
}
