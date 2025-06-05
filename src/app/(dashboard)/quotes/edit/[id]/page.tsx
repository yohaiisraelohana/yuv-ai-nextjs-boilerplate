"use client";

import { QuoteForm } from "../../components/QuoteForm";
import { useRouter } from "next/navigation";
import { updateQuote, getQuote } from "../../actions";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quoteId, setQuoteId] = useState<string>("");

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setQuoteId(resolvedParams.id);
    };

    initializeParams();
  }, [params]);

  useEffect(() => {
    if (!quoteId) return;

    const fetchQuote = async () => {
      try {
        const data = await getQuote(quoteId);
        setQuote(data);
      } catch (error) {
        toast.error("שגיאה בטעינת ההצעה");
        router.push("/quotes");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId, router]);

  const handleSubmit = async (data: any) => {
    try {
      const result = await updateQuote(quoteId, data);
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
