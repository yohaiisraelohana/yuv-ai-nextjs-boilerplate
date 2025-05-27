"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SignaturePad } from "./SignaturePad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface SignQuoteFormProps {
  quoteId: string;
  customerEmail: string;
  quote: {
    quoteNumber: string;
    type: string;
    status: string;
    validUntil: Date;
    totalAmount: number;
    notes?: string;
    template: {
      title: string;
      content: string;
    };
    items: Array<{
      _id: string;
      product: {
        name: string;
        price: number;
      };
      quantity: number;
      price: number;
      discount: number;
    }>;
  };
}

export function SignQuoteForm({
  quoteId,
  customerEmail,
  quote,
}: SignQuoteFormProps) {
  const [email, setEmail] = useState("");
  const [signature, setSignature] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Verifying email:", { email, customerEmail });
      const response = await fetch(`/api/quotes/${quoteId}/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Email verification failed:", error);
        throw new Error(error);
      }

      setIsVerified(true);
      toast.success("אימייל אומת בהצלחה");
    } catch (error) {
      console.error("Error verifying email:", error);
      toast.error("שגיאה באימות האימייל");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/quotes/${quoteId}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ signature }),
      });

      if (!response.ok) {
        throw new Error("Failed to sign quote");
      }

      toast.success("הצעה נחתמה בהצלחה");
      window.location.reload();
    } catch (error) {
      console.error("Error signing quote:", error);
      toast.error("שגיאה בחתימת ההצעה");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVerified) {
    return (
      <form onSubmit={handleEmailVerification} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            אימייל לאימות
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="הכנס את כתובת האימייל שלך"
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "מאמת..." : "אמת אימייל"}
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>הצעת מחיר #{quote.quoteNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">פרטי הצעה</h3>
                <p>סוג: {quote.type}</p>
                <p>סטטוס: {quote.status}</p>
                <p>
                  תוקף עד:{" "}
                  {format(new Date(quote.validUntil), "dd/MM/yyyy", {
                    locale: he,
                  })}
                </p>
                <p>סכום כולל: ₪{quote.totalAmount.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">פריטים</h3>
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-right">מוצר</th>
                      <th className="p-2 text-right">כמות</th>
                      <th className="p-2 text-right">מחיר</th>
                      <th className="p-2 text-right">הנחה</th>
                      <th className="p-2 text-right">סה"כ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item) => (
                      <tr key={item._id} className="border-b">
                        <td className="p-2">{item.product.name}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">₪{item.price.toLocaleString()}</td>
                        <td className="p-2">{item.discount}%</td>
                        <td className="p-2">
                          ₪
                          {(
                            item.price *
                            item.quantity *
                            (1 - item.discount / 100)
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {quote.notes && (
              <div>
                <h3 className="font-semibold mb-2">הערות</h3>
                <p className="whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">תבנית</h3>
              <p className="font-medium">{quote.template.title}</p>
              <p className="whitespace-pre-wrap mt-2">
                {quote.template.content}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSignature} className="space-y-4">
        <div>
          <label htmlFor="signature" className="block text-sm font-medium mb-2">
            חתימה
          </label>
          <SignaturePad
            onSignatureChange={setSignature}
            className="border rounded-lg"
          />
        </div>
        <Button type="submit" disabled={isLoading || !signature}>
          {isLoading ? "חותם..." : "חתום על ההצעה"}
        </Button>
      </form>
    </div>
  );
}
