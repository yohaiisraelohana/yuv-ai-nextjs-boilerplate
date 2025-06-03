"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface PublicQuotePageProps {
  params: {
    token: string;
  };
}

interface Quote {
  _id: string;
  quoteNumber: string;
  type: string;
  customer: {
    name: string;
    email: string;
  };
  template: {
    title: string;
  };
  validUntil: string;
  totalAmount: number;
  status: string;
  items: Array<{
    product: {
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
    discount: number;
  }>;
  notes?: string;
}

export default function PublicQuotePage({ params }: PublicQuotePageProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch(`/api/quotes/public/${params.token}`);
        if (!response.ok) {
          throw new Error("Failed to fetch quote");
        }
        const data = await response.json();
        setQuote(data);
        setEmail(data.customer.email || "");
      } catch (error) {
        setError("ההצעה לא נמצאה או פג תוקפה");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [params.token]);

  const handleVerifyEmail = async () => {
    try {
      const response = await fetch(`/api/quotes/${quote?._id}/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify email");
      }

      setIsVerified(true);
      toast.success("האימייל אומת בהצלחה");
    } catch (error) {
      toast.error("אירעה שגיאה באימות האימייל");
    }
  };

  const handleSign = async () => {
    try {
      const response = await fetch(`/api/quotes/${quote?._id}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ signature }),
      });

      if (!response.ok) {
        throw new Error("Failed to sign quote");
      }

      toast.success("ההצעה נחתמה בהצלחה");
    } catch (error) {
      toast.error("אירעה שגיאה בחתימה על ההצעה");
    }
  };

  if (loading) {
    return <div>טוען...</div>;
  }

  if (error || !quote) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>הצעת מחיר #{quote.quoteNumber}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  {quote.template.title}
                </p>
              </div>
              <Badge
                variant={
                  quote.status === "מאושרת"
                    ? "default"
                    : quote.status === "נדחתה"
                      ? "destructive"
                      : quote.status === "פג תוקף"
                        ? "secondary"
                        : "outline"
                }
              >
                {quote.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-1">לקוח</h3>
                <p>{quote.customer.name}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">תוקף עד</h3>
                <p>
                  {format(new Date(quote.validUntil), "dd/MM/yyyy", {
                    locale: he,
                  })}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">פריטים</h3>
              <div className="space-y-2">
                {quote.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-muted rounded"
                  >
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} יח' x ₪{item.price.toLocaleString()}
                        {item.discount > 0 && ` (-${item.discount}%)`}
                      </p>
                    </div>
                    <p className="font-medium">
                      ₪
                      {(
                        item.quantity *
                        item.price *
                        (1 - item.discount / 100)
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">סה״כ לתשלום</h3>
                <p className="text-2xl font-bold">
                  ₪{quote.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {quote.notes && (
              <div>
                <h3 className="font-medium mb-2">הערות</h3>
                <p className="text-muted-foreground">{quote.notes}</p>
              </div>
            )}

            {!isVerified ? (
              <div className="space-y-4">
                <h3 className="font-medium">אימות אימייל</h3>
                <p className="text-muted-foreground">
                  אנא הזן את כתובת האימייל שלך כדי לצפות בהצעה
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="הזן כתובת אימייל"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button onClick={handleVerifyEmail}>אמת אימייל</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium">חתימה על ההצעה</h3>
                <Textarea
                  placeholder="הזן את חתימתך כאן..."
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                />
                <Button onClick={handleSign}>חתום על ההצעה</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
