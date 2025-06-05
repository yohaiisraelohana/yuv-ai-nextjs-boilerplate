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
import { Badge } from "@/components/ui/badge";
import { getProducts } from "../../products/actions";
import { getCustomers } from "../../customers/actions";
import { getQuoteTemplates } from "../../quotesTemplate/actions";

const quoteSchema = z.object({
  type: z.enum(["שירותים", "סדנאות", "מוצרים"], {
    required_error: "סוג ההצעה הוא שדה חובה",
  }),
  template: z.object(
    {
      _id: z.string().min(1, "תבנית היא שדה חובה"),
      title: z.string(),
    },
    {
      required_error: "תבנית היא שדה חובה",
    }
  ),
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
    template: { _id: string; title: string };
  };
  onSubmit: (data: QuoteFormValues & { totalAmount: number }) => Promise<void>;
}

export function QuoteForm({ quote, onSubmit }: QuoteFormProps) {
  const [customers, setCustomers] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [products, setProducts] = useState<
    Array<{ _id: string; name: string; price: number }>
  >([]);
  const [templates, setTemplates] = useState<
    Array<{ _id: string; title: string; type: string }>
  >([]);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      type: quote?.type || "מוצרים",
      template: quote?.template || { _id: "", title: "" },
      customer: quote?.customer || { _id: "", name: "" },
      validUntil: quote?.validUntil
        ? new Date(quote.validUntil)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items:
        quote?.items.map((item) => ({
          product: {
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
          },
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
        })) || [],
      notes: quote?.notes || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watch the items array to make calculations reactive
  const watchedItems = form.watch("items");

  // Fetch customers, products and templates
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, customersData, templatesData] = await Promise.all([
          getProducts(),
          getCustomers(),
          getQuoteTemplates(),
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

        if (templatesData) {
          console.log("Loaded templates:", templatesData);
          setTemplates(
            templatesData.map((t: any) => ({
              _id: t._id,
              title: t.title,
              type: t.type,
            }))
          );
        }

        // If editing an existing quote, ensure customer and template are set
        if (quote?.customer) {
          const customer = customersData.find(
            (c: any) => c._id === quote.customer._id
          );
          if (customer) {
            form.setValue("customer", {
              _id: customer._id,
              name: customer.name,
            });
          }
        }

        if (quote?.template && templatesData) {
          const template = templatesData.find(
            (t: any) => t._id === quote.template._id
          );
          if (template) {
            form.setValue("template", {
              _id: template._id,
              title: template.title,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("שגיאה בטעינת הנתונים");
      }
    };

    fetchData();
  }, [quote, form]);

  const handleSubmit = async (data: QuoteFormValues) => {
    try {
      const totalAmount = calculateGrandTotal();
      await onSubmit({ ...data, totalAmount });
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
    return watchedItems.reduce(
      (sum, item) => sum + calculateItemTotal(item),
      0
    );
  };

  const calculateVAT = () => {
    return calculateTotal() * 0.17; // 17% VAT
  };

  const calculateGrandTotal = () => {
    return calculateTotal() + calculateVAT();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>סוג הצעה</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Filter templates based on selected type
                    const filteredTemplates = templates.filter(
                      (t) => t.type === value
                    );
                    if (filteredTemplates.length > 0) {
                      form.setValue("template", {
                        _id: filteredTemplates[0]._id,
                        title: filteredTemplates[0].title,
                      });
                    }
                  }}
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
            name="template"
            render={({ field }) => {
              const selectedType = form.getValues("type");
              const filteredTemplates = templates.filter(
                (t) => t.type === selectedType
              );
              console.log("Selected type:", selectedType);
              console.log("Filtered templates:", filteredTemplates);

              return (
                <FormItem>
                  <FormLabel>תבנית</FormLabel>
                  <Select
                    value={field.value._id || ""}
                    onValueChange={(templateId) => {
                      const selectedTemplate = templates.find(
                        (t) => t._id === templateId
                      );
                      if (selectedTemplate) {
                        form.setValue("template", {
                          _id: selectedTemplate._id,
                          title: selectedTemplate.title,
                        });
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר תבנית" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredTemplates.map((template) => (
                        <SelectItem key={template._id} value={template._id}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
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
                            <SelectItem key={product._id} value={product._id}>
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
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            form.setValue(
                              `items.${index}`,
                              form.getValues(`items.${index}`),
                              { shouldValidate: true, shouldDirty: true }
                            );
                          }}
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
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            form.setValue(
                              `items.${index}`,
                              form.getValues(`items.${index}`),
                              { shouldValidate: true, shouldDirty: true }
                            );
                          }}
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
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            form.setValue(
                              `items.${index}`,
                              form.getValues(`items.${index}`),
                              { shouldValidate: true, shouldDirty: true }
                            );
                          }}
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
                      watchedItems[index] || form.getValues(`items.${index}`)
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
          <Button type="submit">{quote ? "עדכן" : "שמור כטיוטה"}</Button>
        </div>
      </form>
    </Form>
  );
}
