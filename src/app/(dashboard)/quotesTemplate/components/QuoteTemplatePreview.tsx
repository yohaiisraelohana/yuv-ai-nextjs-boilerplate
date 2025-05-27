"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Download } from "lucide-react";
import { generateQuotePDF } from "../actions";
import { toast } from "sonner";

interface QuoteTemplatePreviewProps {
  template: {
    _id: string;
    title: string;
    content: string;
    variables: Array<{ name: string; description: string }>;
  };
}

export function QuoteTemplatePreview({ template }: QuoteTemplatePreviewProps) {
  const [open, setOpen] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState("");

  const handleVariableChange = (name: string, value: string) => {
    const newVariables = { ...variables, [name]: value };
    setVariables(newVariables);

    let content = template.content;
    template.variables.forEach((variable) => {
      content = content.replace(
        new RegExp(`{{${variable.name}}}`, "g"),
        newVariables[variable.name] || ""
      );
    });
    setPreviewContent(content);
  };

  const handleGeneratePDF = async () => {
    try {
      const { pdfBytes, error } = await generateQuotePDF(
        template._id,
        variables
      );
      if (error || !pdfBytes) {
        throw new Error(error || "Failed to generate PDF");
      }

      // Create a blob from the PDF bytes
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Create a temporary link and trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${template.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("הקובץ נוצר בהצלחה");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(
        error instanceof Error ? error.message : "אירעה שגיאה ביצירת הקובץ"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>תצוגה מקדימה: {template.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">משתנים</h3>
            <div className="grid grid-cols-2 gap-4">
              {template.variables.map((variable) => (
                <div key={variable.name} className="space-y-2">
                  <Label htmlFor={variable.name}>{variable.description}</Label>
                  <Input
                    id={variable.name}
                    value={variables[variable.name] || ""}
                    onChange={(e) =>
                      handleVariableChange(variable.name, e.target.value)
                    }
                    placeholder={`הכנס ${variable.description}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">תצוגה מקדימה</h3>
            <div className="p-4 border rounded-lg min-h-[200px] whitespace-pre-wrap">
              {previewContent || template.content}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              סגור
            </Button>
            <Button onClick={handleGeneratePDF}>
              <Download className="h-4 w-4 ml-2" />
              הורד PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
