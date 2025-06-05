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
import { useState } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Eye, Pencil, Trash2, Copy } from "lucide-react";
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
import { deleteQuote, updateQuoteStatus, duplicateQuote } from "../actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Quote {
  _id: string;
  quoteNumber: string;
  type: "שירותים" | "סדנאות" | "מוצרים";
  customer: { _id: string; name: string };
  template: { _id: string; title: string };
  validUntil: Date;
  totalAmount: number;
  status: "טיוטה" | "נשלחה" | "ממתין לאישור" | "מאושרת" | "נדחתה" | "חתומה";
  items: Array<{
    product: { _id: string; name: string; price: number };
    quantity: number;
    price: number;
    discount: number;
  }>;
  notes?: string;
}

interface QuotesTableProps {
  initialQuotes: Quote[];
}

export function QuotesTable({ initialQuotes }: QuotesTableProps) {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleDelete = async (id: string) => {
    try {
      await deleteQuote(id);
      setQuotes(quotes.filter((quote) => quote._id !== id));
      toast.success("ההצעה נמחקה בהצלחה");
    } catch (error) {
      toast.error("אירעה שגיאה במחיקת ההצעה");
    }
  };

  const handleStatusChange = async (id: string, newStatus: Quote["status"]) => {
    try {
      const result = await updateQuoteStatus(id, newStatus);
      if (result.error) {
        throw new Error(result.error);
      }
      setQuotes(
        quotes.map((quote) =>
          quote._id === id ? { ...quote, status: newStatus } : quote
        )
      );
      toast.success("סטטוס ההצעה עודכן בהצלחה");
    } catch (error) {
      toast.error("אירעה שגיאה בעדכון סטטוס ההצעה");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const result = await duplicateQuote(id);
      if (result.error) {
        throw new Error(result.error);
      }
      // Refresh the page to show the new quote
      window.location.reload();
      toast.success("ההצעה שוכפלה בהצלחה");
    } catch (error) {
      toast.error("אירעה שגיאה בשכפול ההצעה");
    }
  };

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Input
            placeholder="חיפוש לפי מספר הצעה או שם לקוח..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="טיוטה">טיוטה</SelectItem>
              <SelectItem value="נשלחה">נשלחה</SelectItem>
              <SelectItem value="ממתין לאישור">ממתין לאישור</SelectItem>
              <SelectItem value="מאושרת">מאושרת</SelectItem>
              <SelectItem value="נדחתה">נדחתה</SelectItem>
              <SelectItem value="חתומה">חתומה</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/quotes/new">
          <Button>הצעה חדשה</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>מספר הצעה</TableHead>
            <TableHead>לקוח</TableHead>
            <TableHead>סוג</TableHead>
            <TableHead>תוקף</TableHead>
            <TableHead>סכום</TableHead>
            <TableHead>סטטוס</TableHead>
            <TableHead className="text-left">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredQuotes.map((quote) => (
            <TableRow key={quote._id}>
              <TableCell>{quote.quoteNumber}</TableCell>
              <TableCell>{quote.customer.name}</TableCell>
              <TableCell>{quote.type}</TableCell>
              <TableCell>
                {format(new Date(quote.validUntil), "dd/MM/yyyy", {
                  locale: he,
                })}
              </TableCell>
              <TableCell>₪{quote.totalAmount.toLocaleString()}</TableCell>
              <TableCell>
                <Select
                  value={quote.status}
                  onValueChange={(value: Quote["status"]) =>
                    handleStatusChange(quote._id, value)
                  }
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue>
                      <Badge
                        variant={
                          quote.status === "מאושרת"
                            ? "default"
                            : quote.status === "נדחתה"
                              ? "destructive"
                              : quote.status === "חתומה"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {quote.status}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="טיוטה">טיוטה</SelectItem>
                    <SelectItem value="נשלחה">נשלחה</SelectItem>
                    <SelectItem value="ממתין לאישור">ממתין לאישור</SelectItem>
                    <SelectItem value="מאושרת">מאושרת</SelectItem>
                    <SelectItem value="נדחתה">נדחתה</SelectItem>
                    <SelectItem value="חתומה">חתומה</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-left">
                <div className="flex gap-2">
                  <Link href={`/dashboard/quotes/${quote._id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {quote.status !== "חתומה" && (
                    <Link href={`/quotes/edit/${quote._id}`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDuplicate(quote._id)}
                    title="שכפול הצעה"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>האם למחוק את ההצעה?</AlertDialogTitle>
                        <AlertDialogDescription>
                          פעולה זו אינה ניתנת לביטול.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ביטול</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(quote._id)}
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
