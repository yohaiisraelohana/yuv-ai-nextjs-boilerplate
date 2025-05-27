import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { cookies } from "next/headers";
import { SignQuoteForm } from "./SignQuoteForm";

async function getQuote(token: string) {
  try {
    await connectToDatabase();
    const quote = await Quote.findOne({ publicToken: token })
      .populate("customer", "name email phone company")
      .populate("template", "title content")
      .populate("items.product", "name price")
      .lean();

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
      emailVerified: (quote as any).emailVerified,
      signature: (quote as any).signature,
      signedAt: (quote as any).signedAt,
    };
  } catch (error) {
    console.error("Error fetching quote:", error);
    return null;
  }
}

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const quote = await getQuote(token);

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

  const cookieStore = await cookies();
  const verifiedEmail = cookieStore.get(`quote_${token}_verified`)?.value;

  if (!quote.emailVerified && !verifiedEmail) {
    return (
      <div className="py-10">
        <Card>
          <CardHeader>
            <CardTitle>אימות אימייל</CardTitle>
          </CardHeader>
          <CardContent>
            <SignQuoteForm
              quoteId={quote._id}
              customerEmail={quote.customer.email}
              quote={quote}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-10">
      <Card>
        <CardHeader>
          <CardTitle>הצעת מחיר #{quote.quoteNumber}</CardTitle>
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
                    {quote.items.map((item: any) => (
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

            {quote.signature && (
              <div>
                <h3 className="font-semibold mb-2">חתימה</h3>
                <p>חתום על ידי: {quote.customer.name}</p>
                <p>
                  תאריך:{" "}
                  {format(new Date(quote.signedAt), "dd/MM/yyyy HH:mm", {
                    locale: he,
                  })}
                </p>
                <div className="mt-2">
                  <img
                    src={quote.signature}
                    alt="חתימה"
                    className="max-w-xs border rounded"
                  />
                </div>
              </div>
            )}

            {!quote.signature && (
              <div>
                <h3 className="font-semibold mb-2">אישור הצעה</h3>
                <p className="mb-4">
                  אנא חתום על ההצעה כדי לאשר אותה. לאחר החתימה, ההצעה תועבר
                  לאישור סופי.
                </p>
                <SignQuoteForm
                  quoteId={quote._id}
                  customerEmail={quote.customer.email}
                  quote={quote}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
