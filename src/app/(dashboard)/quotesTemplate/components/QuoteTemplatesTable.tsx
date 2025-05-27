"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { QuoteTemplateForm } from "./QuoteTemplateForm";
import { QuoteTemplatePreview } from "./QuoteTemplatePreview";
import { deleteQuoteTemplate } from "../actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface QuoteTemplate {
  _id: string;
  type: "שירותים" | "סדנאות" | "מוצרים";
  title: string;
  content: string;
  variables: Array<{ name: string; description: string }>;
  isActive: boolean;
}

interface QuoteTemplatesTableProps {
  initialTemplates: QuoteTemplate[];
}

export function QuoteTemplatesTable({
  initialTemplates,
}: QuoteTemplatesTableProps) {
  const [filteredTemplates, setFilteredTemplates] = useState(initialTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    let filtered = initialTemplates;

    if (searchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((template) => template.type === typeFilter);
    }

    setFilteredTemplates(filtered);
  }, [initialTemplates, searchTerm, typeFilter]);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteQuoteTemplate(id);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success("התבנית נמחקה בהצלחה");
      router.refresh();
    } catch (error) {
      toast.error("אירעה שגיאה במחיקת התבנית");
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-4">
        <Input
          placeholder="חיפוש לפי כותרת או תוכן..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="סוג תבנית" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="שירותים">שירותים</SelectItem>
            <SelectItem value="סדנאות">סדנאות</SelectItem>
            <SelectItem value="מוצרים">מוצרים</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>סוג</TableHead>
            <TableHead>כותרת</TableHead>
            <TableHead>משתנים</TableHead>
            <TableHead>סטטוס</TableHead>
            <TableHead className="text-left">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTemplates.map((template) => (
            <TableRow key={template._id}>
              <TableCell>{template.type}</TableCell>
              <TableCell>{template.title}</TableCell>
              <TableCell>{template.variables.length}</TableCell>
              <TableCell>
                <Badge
                  variant={template.isActive ? "default" : "secondary"}
                  className="whitespace-nowrap"
                >
                  {template.isActive ? "פעיל" : "לא פעיל"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <QuoteTemplatePreview template={template} />
                  <QuoteTemplateForm
                    template={template}
                    mode="edit"
                    trigger={
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          האם למחוק את התבנית?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          פעולה זו לא ניתנת לביטול.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ביטול</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(template._id)}
                        >
                          מחק
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
