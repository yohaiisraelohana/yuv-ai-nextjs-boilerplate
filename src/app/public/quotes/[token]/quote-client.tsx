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
import { SignaturePad } from "./SignaturePad";

interface Quote {
  _id: string;
  quoteNumber: string;
  type: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    company: string;
    address: {
      street: string;
      city: string;
      zipCode: string;
    };
  };
  template: {
    title: string;
    content: string;
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
  company: {
    name: string;
    logo: string;
    address: {
      street: string;
      city: string;
      zipCode: string;
    };
    contactInfo: {
      phone: string;
      email: string;
      website?: string;
    };
    signature: string;
    taxId: string;
    bankDetails: {
      bankName: string;
      branchNumber: string;
      accountNumber: string;
    };
  } | null;
  signature?: string;
  signatureDate?: string;
}

interface QuoteClientProps {
  initialQuote: Quote;
}

export default function QuoteClient({ initialQuote }: QuoteClientProps) {
  const [quote] = useState<Quote>(initialQuote);
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [signature, setSignature] = useState("");

  console.log({ quote });

  const replaceTemplateVariables = (content: string) => {
    const productsTable = quote.items
      .map(
        (item) => `
          <tr>
            <td class="border p-2 text-right">${item.product.name}</td>
            <td class="border p-2 text-center">${item.quantity}</td>
            <td class="border p-2 text-left">₪${item.price.toLocaleString()}</td>
            <td class="border p-2 text-center">${item.discount}%</td>
            <td class="border p-2 text-left">₪${(item.quantity * item.price * (1 - item.discount / 100)).toLocaleString()}</td>
          </tr>
        `
      )
      .join("");

    const variables = {
      companyName: quote.company?.name || "",
      companyLogo: quote.company?.logo
        ? `<img src="${quote.company.logo}" alt="לוגו החברה" class="h-16" />`
        : "",
      companyAddress: quote.company
        ? `${quote.company.address.street}, ${quote.company.address.city} ${quote.company.address.zipCode}`
        : "",
      companyPhone: quote.company?.contactInfo.phone || "",
      companyEmail: quote.company?.contactInfo.email || "",
      companyWebsite: quote.company?.contactInfo.website || "",
      companySignature: quote.company?.signature
        ? `<img src="${quote.company.signature}" alt="חתימת החברה" class="h-16" />`
        : "",
      quoteNumber: quote.quoteNumber,
      quoteDate: format(new Date(), "dd/MM/yyyy", { locale: he }),
      quoteValidUntil: format(new Date(quote.validUntil), "dd/MM/yyyy", {
        locale: he,
      }),
      quoteTotal: `₪${quote.totalAmount.toLocaleString()}`,
      quoteDiscount: "0%",
      quoteFinalTotal: `₪${quote.totalAmount.toLocaleString()}`,
      signatureDate: quote.signatureDate
        ? format(new Date(quote.signatureDate), "dd/MM/yyyy", { locale: he })
        : "",
      clientName: quote.customer.name,
      clientCompany: quote.customer.company || "",
      clientAddress: `${quote.customer.address.street}, ${quote.customer.address.city} ${quote.customer.address.zipCode}`,
      clientPhone: quote.customer.phone,
      clientEmail: quote.customer.email,
      clientSignature: quote.signature
        ? `<img src="${quote.signature}" alt="חתימת הלקוח" class="h-16" />`
        : "",
      productsTable: `
        <table class="w-full border-collapse mt-4">
          <thead>
            <tr>
              <th class="border p-2 text-right bg-gray-50">מוצר</th>
              <th class="border p-2 text-center bg-gray-50">כמות</th>
              <th class="border p-2 text-left bg-gray-50">מחיר ליחידה</th>
              <th class="border p-2 text-center bg-gray-50">הנחה</th>
              <th class="border p-2 text-left bg-gray-50">סה"כ</th>
            </tr>
          </thead>
          <tbody>
            ${productsTable}
            <tr class="font-bold">
              <td colspan="4" class="border p-2 text-right">סה"כ לתשלום:</td>
              <td class="border p-2 text-left">₪${quote.totalAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      `,
    };

    return content.replace(
      /\{\{(\w+)\}\}/g,
      (match, key) => variables[key as keyof typeof variables] || match
    );
  };

  const handleVerifyEmail = async () => {
    try {
      const response = await fetch(`/api/quotes/${quote._id}/verify-email`, {
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
      const response = await fetch(`/api/quotes/${quote._id}/sign`, {
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
      window.location.reload(); // Reload to show the signature
    } catch (error) {
      toast.error("אירעה שגיאה בחתימה על ההצעה");
    }
  };

  if (!isVerified) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>הצעת מחיר #{quote.quoteNumber}</CardTitle>
            </CardHeader>
            <CardContent>
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleVerifyEmail();
                      }
                    }}
                  />
                  <Button onClick={handleVerifyEmail}>אמת אימייל</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
          <CardContent>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: replaceTemplateVariables(quote.template.content),
              }}
            />

            {!quote.signature && (
              <div className="mt-8 space-y-4">
                <h3 className="font-medium">חתימה על ההצעה</h3>
                <SignaturePad
                  onSignatureChange={setSignature}
                  className="border rounded-lg"
                />
                <Button onClick={handleSign} disabled={!signature}>
                  חתום על ההצעה
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
