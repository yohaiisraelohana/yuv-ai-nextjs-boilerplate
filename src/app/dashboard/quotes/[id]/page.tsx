import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { he } from "date-fns/locale";

async function getQuote(id: string) {
  try {
    await connectToDatabase();
    const quote = await Quote.findById(id)
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
      createdAt: new Date((quote as any).createdAt),
      updatedAt: new Date((quote as any).updatedAt),
    };
  } catch (error) {
    console.error("Error fetching quote:", error);
    return null;
  }
}

export default async function QuotePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const quote = await getQuote(params.id);

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
