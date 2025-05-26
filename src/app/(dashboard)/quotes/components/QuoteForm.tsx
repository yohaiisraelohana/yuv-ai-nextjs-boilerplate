"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "../../products/actions";
import { createQuote, updateQuote } from "../actions";
import { getCustomers } from "../../customers/actions";

const quoteSchema = z.object({
  type: z.enum(["שירותים", "סדנאות", "מוצרים"], {
    required_error: "סוג ההצעה הוא שדה חובה",
  }),
  customer: z.object(
    {
      _id: z.string().min(1, "לקוח הוא שדה חובה"),
      name: z.string(),
    },
    {
      required_error: "לקוח הוא שדה חובה",
    }
  ),
  validUntil: z.date({
    required_error: "תוקף ההצעה הוא שדה חובה",
  }),
  items: z
    .array(
      z.object({
        product: z.object({
          _id: z.string(),
          name: z.string(),
          price: z.number(),
        }),
        quantity: z.number().min(1, "כמות חייבת להיות לפחות 1"),
        price: z.number().min(0, "מחיר לא יכול להיות שלילי"),
        discount: z
          .number()
          .min(0)
          .max(100, "הנחה לא יכולה להיות גדולה מ-100%"),
      })
    )
    .min(1, "חובה להוסיף לפריט אחד"),
  notes: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
  quote?: {
    _id: string;
    type: "שירותים" | "סדנאות" | "מוצרים";
    customer: { _id: string; name: string };
    validUntil: Date;
    items: Array<{
      product: { _id: string; name: string; price: number };
      quantity: number;
      price: number;
      discount: number;
    }>;
    notes?: string;
  };
  onSubmit: (data: QuoteFormValues & { totalAmount: number }) => Promise<void>;
  trigger?: React.ReactNode;
}

export function QuoteForm({ quote, onSubmit, trigger }: QuoteFormProps) {
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [products, setProducts] = useState<
    Array<{ _id: string; name: string; price: number }>
  >([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchProduct, setSearchProduct] = useState("");

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      type: quote?.type || "מוצרים",
      customer: quote?.customer || { _id: "", name: "" },
      validUntil:
        quote?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      items: quote?.items || [],
      notes: quote?.notes || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch customers and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, customersData] = await Promise.all([
          getProducts(),
          getCustomers(),
        ]);

        if (productsData.products) {
          setProducts(
            productsData.products.map((p: any) => ({
              _id: p._id,
              name: p.name,
              price: p.price,
            }))
          );
        }

        if (customersData) {
          setCustomers(
            customersData.map((c: any) => ({
              _id: c._id,
              name: c.name,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("שגיאה בטעינת הנתונים");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (data: QuoteFormValues) => {
    try {
      const totalAmount = calculateGrandTotal();
      if (quote) {
        await onSubmit({ ...data, totalAmount });
      } else {
        await onSubmit({ ...data, totalAmount });
      }
      setOpen(false);
      form.reset();
      toast.success(quote ? "ההצעה עודכנה בהצלחה" : "ההצעה נוצרה בהצלחה");
    } catch (error) {
      toast.error("אירעה שגיאה");
    }
  };

  const calculateItemTotal = (item: QuoteFormValues["items"][0]) => {
    const subtotal = item.quantity * item.price;
    const discountAmount = (subtotal * item.discount) / 100;
    return subtotal - discountAmount;
  };

  const calculateTotal = () => {
    return form
      .getValues("items")
      .reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateVAT = () => {
    return calculateTotal() * 0.17; // 17% VAT
  };

  const calculateGrandTotal = () => {
    return calculateTotal() + calculateVAT();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>הצעה חדשה</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {quote ? "ערוך הצעת מחיר" : "הצעת מחיר חדשה"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>סוג הצעה</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר סוג הצעה" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="שירותים">שירותים</SelectItem>
                        <SelectItem value="סדנאות">סדנאות</SelectItem>
                        <SelectItem value="מוצרים">מוצרים</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>לקוח</FormLabel>
                    <Select
                      value={field.value._id || ""}
                      onValueChange={(customerId) => {
                        const selectedCustomer = customers.find(
                          (c) => c._id === customerId
                        );
                        if (selectedCustomer) {
                          form.setValue("customer", selectedCustomer);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר לקוח" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer._id} value={customer._id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>תוקף עד</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-right font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: he })
                            ) : (
                              <span>בחר תאריך</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date: Date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">פריטים</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      product: { _id: "", name: "", price: 0 },
                      quantity: 1,
                      price: 0,
                      discount: 0,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  הוסף פריט
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-4 p-4 border rounded-lg"
                >
                  <div>
                    <FormField
                      control={form.control}
                      name={`items.${index}.product`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>מוצר</FormLabel>
                          <Select
                            value={field.value._id || ""}
                            onValueChange={(productId) => {
                              const selectedProduct = products.find(
                                (p) => p._id === productId
                              );
                              if (selectedProduct) {
                                form.setValue(
                                  `items.${index}.product`,
                                  selectedProduct
                                );
                                form.setValue(
                                  `items.${index}.price`,
                                  selectedProduct.price
                                );
                                form.setValue(`items.${index}.quantity`, 1);
                                form.setValue(`items.${index}.discount`, 0);
                              }
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="בחר מוצר" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem
                                  key={product._id}
                                  value={product._id}
                                >
                                  <div className="flex justify-between w-full">
                                    <span>{product.name}</span>
                                    <span className="text-gray-500">
                                      ₪{product.price}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>כמות</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>מחיר</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name={`items.${index}.discount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>הנחה (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end items-center gap-4">
                    <div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <Badge variant="secondary">
                        ₪
                        {calculateItemTotal(
                          form.getValues(`items.${index}`)
                        ).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>הערות</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>סכום ביניים:</span>
                <span>₪{calculateTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>מע״מ (17%):</span>
                <span>₪{calculateVAT().toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>סה״כ לתשלום:</span>
                <span>₪{calculateGrandTotal().toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                ביטול
              </Button>
              <Button type="submit">{quote ? "עדכן" : "שמור כטיוטה"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
