"use server";

import { connectToDatabase } from "@/lib/mongodb";
import QuoteTemplate from "@/models/QuoteTemplate";
import Company from "@/models/Company";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { Document } from "mongoose";

type QuoteTemplateType = "שירותים" | "סדנאות" | "מוצרים";

interface IQuoteTemplate {
  _id: Types.ObjectId;
  type: QuoteTemplateType;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  variables: Array<{ name: string; description: string }>;
}

interface SerializedQuoteTemplate {
  _id: string;
  type: QuoteTemplateType;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variables: Array<{ name: string; description: string }>;
}

interface TemplateVariable {
  name: string;
  description: string;
}

export async function createQuoteTemplate(data: {
  type: QuoteTemplateType;
  title: string;
  content: string;
}) {
  try {
    await connectToDatabase();
    await QuoteTemplate.create({
      ...data,
      isActive: true,
    });

    revalidatePath("/quotesTemplate");
    return { success: true };
  } catch (error) {
    console.error("Error creating quote template:", error);
    return { error: "שגיאה ביצירת התבנית" };
  }
}

export async function updateQuoteTemplate(
  id: string,
  data: {
    type: QuoteTemplateType;
    title: string;
    content: string;
    isActive?: boolean;
  }
) {
  try {
    await connectToDatabase();
    const template = (await QuoteTemplate.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    ).lean()) as IQuoteTemplate | null;

    if (!template) {
      return { error: "שגיאה בעדכון התבנית" };
    }

    revalidatePath("/quotesTemplate");
    return { success: true };
  } catch (error) {
    console.error("Error updating quote template:", error);
    return { error: "שגיאה בעדכון התבנית" };
  }
}

export async function deleteQuoteTemplate(id: string) {
  try {
    await connectToDatabase();
    const template = await QuoteTemplate.findByIdAndDelete(id);
    if (!template) {
      return { error: "שגיאה במחיקת התבנית" };
    }
    revalidatePath("/quotesTemplate");
    return { success: true };
  } catch (error) {
    console.error("Error deleting quote template:", error);
    return { error: "שגיאה במחיקת התבנית" };
  }
}

export async function getQuoteTemplates(): Promise<SerializedQuoteTemplate[]> {
  try {
    await connectToDatabase();
    const templates = (await QuoteTemplate.find()
      .sort({ createdAt: -1 })
      .lean()) as unknown as IQuoteTemplate[];
    return templates.map((template) => ({
      _id: template._id.toString(),
      type: template.type,
      title: template.title,
      content: template.content,
      isActive: template.isActive,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      variables: (template.variables || []).map((variable) => ({
        name: variable.name,
        description: variable.description,
      })),
    }));
  } catch (error) {
    console.error("Error fetching quote templates:", error);
    return [];
  }
}

export async function getQuoteTemplateById(
  id: string
): Promise<SerializedQuoteTemplate | null> {
  try {
    await connectToDatabase();
    const template = (await QuoteTemplate.findById(
      id
    ).lean()) as unknown as IQuoteTemplate | null;
    if (!template) return null;
    return {
      _id: template._id.toString(),
      type: template.type,
      title: template.title,
      content: template.content,
      isActive: template.isActive,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      variables: (template.variables || []).map((variable) => ({
        name: variable.name,
        description: variable.description,
      })),
    };
  } catch (error) {
    console.error("Error fetching quote template:", error);
    return null;
  }
}

export async function generateQuotePDF(templateId: string, data: any) {
  try {
    await connectToDatabase();
    const [template, company] = await Promise.all([
      QuoteTemplate.findById(templateId),
      Company.findOne(),
    ]);

    if (!template) {
      throw new Error("Template not found");
    }

    if (!company) {
      throw new Error(
        "Company information not found. Please set up company details first."
      );
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    // Load Hebrew font with fallback
    let hebrewFont;
    try {
      // Try to load from public directory first
      const fontUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/fonts/Heebo-Regular.ttf`;
      console.log("Loading font from:", fontUrl);
      const fontResponse = await fetch(fontUrl);
      if (!fontResponse.ok) {
        throw new Error("Failed to load font from public directory");
      }
      const fontBytes = await fontResponse.arrayBuffer();
      hebrewFont = await pdfDoc.embedFont(fontBytes);
    } catch (error) {
      console.warn("Failed to load custom font:", error);
      throw new Error("Hebrew font is required for PDF generation");
    }

    // Add company logo if available
    if (company.logo) {
      try {
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
      } catch (error) {
        console.warn("Failed to load company logo:", error);
      }
    }

    // Add company details
    page.drawText(company.name || "Company Name", {
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

    // Add company signature if available
    if (company.signature) {
      try {
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
      } catch (error) {
        console.warn("Failed to load company signature:", error);
      }
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return { pdfBytes };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to generate PDF",
    };
  }
}
