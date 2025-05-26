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
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Eye, Pencil, Trash2 } from "lucide-react";
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
import { QuoteForm } from "./QuoteForm";
import { createQuote, deleteQuote, updateQuote } from "../actions"; // Assuming updateQuote and deleteQuote are also in actions file

interface Quote {
  _id: string;
  quoteNumber: string;
  type: "שירותים" | "סדנאות" | "מוצרים";
  customer: { _id: string; name: string };
  validUntil: Date;
  totalAmount: number;
  status: "טיוטה" | "נשלחה" | "מאושרת" | "נדחתה" | "פג תוקף";
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
  const [filteredQuotes, setFilteredQuotes] = useState(initialQuotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [quotes, setQuotes] = useState(initialQuotes); // Add state to manage quotes locally

  // Update quotes state when initialQuotes prop changes
  useEffect(() => {
    setQuotes(initialQuotes);
  }, [initialQuotes]);

  useEffect(() => {
    const filtered = quotes.filter((quote) => {
      const matchesSearch = quote.quoteNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "all" || quote.type === selectedType;
      const matchesStatus =
        selectedStatus === "all" || quote.status === selectedStatus;
      const matchesMinAmount =
        !minAmount || quote.totalAmount >= Number(minAmount);
      const matchesMaxAmount =
        !maxAmount || quote.totalAmount <= Number(maxAmount);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesMinAmount &&
        matchesMaxAmount
      );
    });

    setFilteredQuotes(filtered);
  }, [searchTerm, selectedType, selectedStatus, minAmount, maxAmount, quotes]);

  const types = ["שירותים", "סדנאות", "מוצרים"];
  const statuses = ["טיוטה", "נשלחה", "מאושרת", "נדחתה", "פג תוקף"];

  const handleCreate = async (data: any) => {
    try {
      const result = await createQuote(data);
      if (result.quote) {
        // Add the new quote to the local state and initialQuotes for filtering
        setQuotes((prevQuotes) => [result.quote, ...prevQuotes]);
      } else if (result.error) {
        console.error("Error creating quote:", result.error);
        // Handle error, maybe show a toast
      }
    } catch (error) {
      console.error("Error creating quote:", error);
      // Handle error
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    // TODO: Implement update quote action
    console.log("Update quote:", id, data);
  };

  const handleDelete = async (id: string) => {
    // TODO: Implement delete quote action
    console.log("Delete quote:", id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Input
            placeholder="חיפוש לפי מספר הצעה..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="בחר סוג" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="בחר סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="סכום מינימום"
              className="w-[120px]"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="סכום מקסימום"
              className="w-[120px]"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>
        </div>
        <QuoteForm onSubmit={handleCreate} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>מספר הצעה</TableHead>
            <TableHead>סוג</TableHead>
            <TableHead>לקוח</TableHead>
            <TableHead>תוקף עד</TableHead>
            <TableHead>סכום</TableHead>
            <TableHead>סטטוס</TableHead>
            <TableHead>פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredQuotes.map((quote) => (
            <TableRow key={quote._id}>
              <TableCell>{quote.quoteNumber}</TableCell>
              <TableCell>{quote.type}</TableCell>
              <TableCell>{quote.customer?.name || "לא ידוע"}</TableCell>
              <TableCell>
                {format(new Date(quote.validUntil), "dd/MM/yyyy", {
                  locale: he,
                })}
              </TableCell>
              <TableCell>₪{quote.totalAmount.toLocaleString()}</TableCell>
              <TableCell>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    quote.status === "מאושרת"
                      ? "bg-green-100 text-green-800"
                      : quote.status === "נדחתה"
                        ? "bg-red-100 text-red-800"
                        : quote.status === "נשלחה"
                          ? "bg-blue-100 text-blue-800"
                          : quote.status === "פג תוקף"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {quote.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <QuoteForm
                    quote={quote}
                    onSubmit={(data) => handleUpdate(quote._id, data)}
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
                        <AlertDialogTitle>האם למחוק את ההצעה?</AlertDialogTitle>
                        <AlertDialogDescription>
                          פעולה זו לא ניתנת לביטול.
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
