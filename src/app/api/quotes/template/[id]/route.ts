import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import QuoteTemplate from "@/models/QuoteTemplate";
import Company from "@/models/Company";
import { PDFDocument, rgb } from "pdf-lib";

interface TemplateVariable {
  name: string;
  description: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const [template, company] = await Promise.all([
      QuoteTemplate.findById(params.id),
      Company.findOne(),
    ]);

    if (!template || !company) {
      return NextResponse.json(
        { error: "Template or company not found" },
        { status: 404 }
      );
    }

    // Get variables from query parameters
    const searchParams = request.nextUrl.searchParams;
    const variables: Record<string, string> = {};
    template.variables.forEach((variable: TemplateVariable) => {
      const value = searchParams.get(variable.name);
      if (value) {
        variables[variable.name] = value;
      }
    });

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    // Load Hebrew font
    const fontBytes = await fetch(
      new URL("/fonts/Heebo-Regular.ttf", request.url)
    ).then((res) => res.arrayBuffer());
    const hebrewFont = await pdfDoc.embedFont(fontBytes);

    // Add company logo
    const logoBytes = await fetch(company.logo).then((res) =>
      res.arrayBuffer()
    );
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoDims = logoImage.scale(0.2);
    page.drawImage(logoImage, {
      x: width - logoDims.width - 50,
      y: height - logoDims.height - 50,
      width: logoDims.width,
      height: logoDims.height,
    });

    // Add company details
    page.drawText(company.name, {
      x: 50,
      y: height - 100,
      font: hebrewFont,
      size: 20,
      color: rgb(0, 0, 0),
    });

    // Add quote content
    let content = template.content;
    template.variables.forEach((variable: TemplateVariable) => {
      content = content.replace(
        new RegExp(`{{${variable.name}}}`, "g"),
        variables[variable.name] || ""
      );
    });

    page.drawText(content, {
      x: 50,
      y: height - 200,
      font: hebrewFont,
      size: 12,
      color: rgb(0, 0, 0),
      maxWidth: width - 100,
    });

    // Add company signature
    const signatureBytes = await fetch(company.signature).then((res) =>
      res.arrayBuffer()
    );
    const signatureImage = await pdfDoc.embedPng(signatureBytes);
    const signatureDims = signatureImage.scale(0.3);
    page.drawImage(signatureImage, {
      x: width - signatureDims.width - 50,
      y: 100,
      width: signatureDims.width,
      height: signatureDims.height,
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    // Return the PDF as a response
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${template.title}.pdf"`,
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
