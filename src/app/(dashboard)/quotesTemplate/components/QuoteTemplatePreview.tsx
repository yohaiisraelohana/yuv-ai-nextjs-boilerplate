"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

interface QuoteTemplate {
  _id: string;
  type: "שירותים" | "סדנאות" | "מוצרים";
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variables: Array<{ name: string; description: string }>;
}

interface QuoteTemplatePreviewProps {
  template: QuoteTemplate;
}

export function QuoteTemplatePreview({ template }: QuoteTemplatePreviewProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{template.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: template.content }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
