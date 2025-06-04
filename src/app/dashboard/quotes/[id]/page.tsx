import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Company from "@/models/Company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CopyLinkButton } from "./CopyLinkButton";
import mongoose from "mongoose";

interface CompanyData {
  _id: string;
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
}

async function getQuote(id: string) {
  try {
    await connectToDatabase();
    const quote = await Quote.findById(id)
      .populate("customer", "name email phone company address")
      .populate("template", "title content")
      .populate("items.product", "name price")
      .lean();

    // Get company details from the company collection
    const companyDoc = await Company.findOne();
    const company = companyDoc ? companyDoc.toObject() : null;

    if (!quote) {
      return null;
    }

    return {
      _id: (quote as any)._id.toString(),
      quoteNumber: (quote as any).quoteNumber,
      type: (quote as any).type,
      customer: {
        _id: (quote as any).customer._id.toString(),
        name: (quote as any).customer.name,
        email: (quote as any).customer.email,
        phone: (quote as any).customer.phone,
        company: (quote as any).customer.company,
        address: (quote as any).customer.address || {
          street: "",
          city: "",
          zipCode: "",
        },
      },
      template: {
        _id: (quote as any).template._id.toString(),
        title: (quote as any).template.title,
        content: (quote as any).template.content,
      },
      items: (quote as any).items.map((item: any) => ({
        _id: item._id.toString(),
        product: {
          _id: item.product._id.toString(),
          name: item.product.name,
          price: item.product.price,
        },
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
      })),
      status: (quote as any).status,
      validUntil: new Date((quote as any).validUntil),
      totalAmount: (quote as any).totalAmount,
      notes: (quote as any).notes,
      publicToken: (quote as any).publicToken,
      signature: (quote as any).signature,
      signedAt: (quote as any).signedAt,
      company: company
        ? {
            _id: company._id.toString(),
            name: company.name,
            logo: company.logo,
            address: company.address || {
              street: "",
              city: "",
              zipCode: "",
            },
            contactInfo: company.contactInfo || {
              phone: "",
              email: "",
              website: "",
            },
            signature: company.signature,
            taxId: company.taxId,
            bankDetails: company.bankDetails || {
              bankName: "",
              branchNumber: "",
              accountNumber: "",
            },
          }
        : null,
    };
  } catch (error) {
    console.error("Error fetching quote:", error);
    return null;
  }
}

const replaceTemplateVariables = (content: string, quote: any) => {
  const productsTable = quote.items
    .map(
      (item: any) => `
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
    companyAddress: quote.company?.address
      ? `${quote.company.address.street}, ${quote.company.address.city} ${quote.company.address.zipCode}`
      : "",
    companyPhone: quote.company?.contactInfo?.phone || "",
    companyEmail: quote.company?.contactInfo?.email || "",
    companySignature: quote.company?.signature
      ? `<img src="${quote.company.signature}" alt="חתימת החברה" class="h-16" />`
      : "",
    quoteNumber: quote.quoteNumber,
    quoteDate: format(new Date(), "dd/MM/yyyy", { locale: he }),
    quoteValidUntil: format(new Date(quote.validUntil), "dd/MM/yyyy", {
      locale: he,
    }),
    quoteTotal: `₪${quote.totalAmount.toLocaleString()}`,
    quoteDiscount: "0%", // Replace with actual discount if available
    quoteFinalTotal: `₪${quote.totalAmount.toLocaleString()}`,
    clientName: quote.customer.name,
    clientAddress: quote.customer.address
      ? `${quote.customer.address.street}, ${quote.customer.address.city} ${quote.customer.address.zipCode}`
      : "",
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

export default async function QuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const quote = await getQuote(id);

  if (!quote) {
    return (
      <div className="py-10">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">הצעה לא נמצאה</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>הצעת מחיר #{quote.quoteNumber}</CardTitle>
          <CopyLinkButton quoteId={quote._id} publicToken={quote.publicToken} />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">פרטי לקוח</h3>
                <p>{quote.customer.name}</p>
                <p>{quote.customer.company}</p>
                <p>{quote.customer.email}</p>
                <p>{quote.customer.phone}</p>
              </div>
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

            {quote.notes && (
              <div>
                <h3 className="font-semibold mb-2">הערות</h3>
                <p className="whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}

            {quote.signature && (
              <div>
                <h3 className="font-semibold mb-2">חתימת לקוח</h3>
                <p>חתום על ידי: {quote.customer.name}</p>
                {quote.signedAt && (
                  <p>
                    תאריך:{" "}
                    {format(new Date(quote.signedAt), "dd/MM/yyyy HH:mm", {
                      locale: he,
                    })}
                  </p>
                )}
                <div className="mt-2">
                  <img
                    src={quote.signature}
                    alt="חתימת לקוח"
                    className="max-w-xs border rounded"
                  />
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">תבנית</h3>
              <p className="font-medium">{quote.template.title}</p>
              <div
                className="prose max-w-none mt-2"
                dangerouslySetInnerHTML={{
                  __html: replaceTemplateVariables(
                    quote.template.content,
                    quote
                  ),
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
