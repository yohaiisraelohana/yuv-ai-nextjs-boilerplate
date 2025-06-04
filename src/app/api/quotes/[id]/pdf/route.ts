import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Company from "@/models/Company";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import puppeteer from "puppeteer";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const quote = await Quote.findById(params.id)
      .populate("customer", "name email phone company address")
      .populate("template", "title content")
      .populate("items.product", "name price")
      .lean();

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Get company details
    const company = await Company.findOne().lean();

    if (!company) {
      return NextResponse.json(
        { error: "Company information not found" },
        { status: 404 }
      );
    }

    // Create HTML content with the same structure as the website
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Heebo', sans-serif;
              padding: 20px;
              direction: rtl;
            }
            .prose {
              max-width: none;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 1rem 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: right;
            }
            th {
              background-color: #f5f5f5;
            }
            .company-logo {
              max-height: 64px;
            }
            .signature {
              max-height: 64px;
            }
          </style>
        </head>
        <body>
          <div class="prose">
            ${replaceTemplateVariables(quote.template.content, {
              ...quote,
              company,
            })}
          </div>
        </body>
      </html>
    `;

    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
    });
    const page = await browser.newPage();

    // Set content and wait for network idle
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    await browser.close();

    // Return the PDF
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="quote-${quote.quoteNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

// Helper function to replace template variables (same as in the page component)
function replaceTemplateVariables(content: string, quote: any) {
  const productsTable = quote.items
    .map(
      (item: any) => `
        <tr>
          <td>${item.product.name}</td>
          <td>${item.quantity}</td>
          <td>₪${item.price.toLocaleString()}</td>
          <td>${item.discount}%</td>
          <td>₪${(item.quantity * item.price * (1 - item.discount / 100)).toLocaleString()}</td>
        </tr>
      `
    )
    .join("");

  const variables = {
    companyName: quote.company?.name || "",
    companyLogo: quote.company?.logo
      ? `<img src="${quote.company.logo}" alt="לוגו החברה" class="company-logo" />`
      : "",
    companyAddress: quote.company?.address
      ? `${quote.company.address.street}, ${quote.company.address.city} ${quote.company.address.zipCode}`
      : "",
    companyPhone: quote.company?.contactInfo?.phone || "",
    companyEmail: quote.company?.contactInfo?.email || "",
    companyWebsite: quote.company?.contactInfo?.website || "",
    companySignature: quote.company?.signature
      ? `<img src="${quote.company.signature}" alt="חתימת החברה" class="signature" />`
      : "",
    quoteNumber: quote.quoteNumber,
    quoteDate: new Date().toLocaleDateString("he-IL"),
    quoteValidUntil: new Date(quote.validUntil).toLocaleDateString("he-IL"),
    quoteTotal: `₪${quote.totalAmount.toLocaleString()}`,
    quoteDiscount: "0%",
    quoteFinalTotal: `₪${quote.totalAmount.toLocaleString()}`,
    signatureDate: quote.signedAt
      ? new Date(quote.signedAt).toLocaleDateString("he-IL")
      : "",
    clientName: quote.customer.name,
    clientCompany: quote.customer.company || "",
    clientAddress: quote.customer.address
      ? `${quote.customer.address.street}, ${quote.customer.address.city} ${quote.customer.address.zipCode}`
      : "",
    clientPhone: quote.customer.phone,
    clientEmail: quote.customer.email,
    clientSignature: quote.signature
      ? `<img src="${quote.signature}" alt="חתימת הלקוח" class="signature" />`
      : "",
    productsTable: `
      <table>
        <thead>
          <tr>
            <th>מוצר</th>
            <th>כמות</th>
            <th>מחיר ליחידה</th>
            <th>הנחה</th>
            <th>סה"כ</th>
          </tr>
        </thead>
        <tbody>
          ${productsTable}
          <tr style="font-weight: bold;">
            <td colspan="4">סה"כ לתשלום:</td>
            <td>₪${quote.totalAmount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    `,
  };

  return content.replace(
    /\{\{(\w+)\}\}/g,
    (match, key) => variables[key as keyof typeof variables] || match
  );
}
