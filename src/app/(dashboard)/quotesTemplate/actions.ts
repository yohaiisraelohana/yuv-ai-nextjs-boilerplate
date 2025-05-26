import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import QuoteTemplate from "@/models/QuoteTemplate";
import Company from "@/models/Company";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface TemplateVariable {
  name: string;
  description: string;
}

export async function createQuoteTemplate(data: {
  type: "שירותים" | "סדנאות" | "מוצרים";
  title: string;
  content: string;
  variables: Array<TemplateVariable>;
}) {
  try {
    await connectToDatabase();
    const template = await QuoteTemplate.create(data);
    revalidatePath("/quotesTemplate");
    return { template: JSON.parse(JSON.stringify(template)) };
  } catch (error) {
    console.error("Error creating quote template:", error);
    return { error: "Failed to create quote template" };
  }
}

export async function updateQuoteTemplate(
  id: string,
  data: {
    type: "שירותים" | "סדנאות" | "מוצרים";
    title: string;
    content: string;
    variables: Array<TemplateVariable>;
    isActive?: boolean;
  }
) {
  try {
    await connectToDatabase();
    const template = await QuoteTemplate.findByIdAndUpdate(id, data, {
      new: true,
    });
    revalidatePath("/quotesTemplate");
    return { template: JSON.parse(JSON.stringify(template)) };
  } catch (error) {
    console.error("Error updating quote template:", error);
    return { error: "Failed to update quote template" };
  }
}

export async function deleteQuoteTemplate(id: string) {
  try {
    await connectToDatabase();
    await QuoteTemplate.findByIdAndDelete(id);
    revalidatePath("/quotesTemplate");
    return { success: true };
  } catch (error) {
    console.error("Error deleting quote template:", error);
    return { error: "Failed to delete quote template" };
  }
}

export async function getQuoteTemplates() {
  try {
    await connectToDatabase();
    const templates = await QuoteTemplate.find().sort({ createdAt: -1 }).lean();
    return { templates: JSON.parse(JSON.stringify(templates)) };
  } catch (error) {
    console.error("Error fetching quote templates:", error);
    return { error: "Failed to fetch quote templates" };
  }
}

export async function generateQuotePDF(templateId: string, data: any) {
  try {
    await connectToDatabase();
    const [template, company] = await Promise.all([
      QuoteTemplate.findById(templateId),
      Company.findOne(),
    ]);

    if (!template || !company) {
      throw new Error("Template or company not found");
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    // Load Hebrew font
    const fontBytes = await fetch("/fonts/Heebo-Regular.ttf").then((res) =>
      res.arrayBuffer()
    );
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
        data[variable.name] || ""
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
    return { pdfBytes };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return { error: "Failed to generate PDF" };
  }
}
