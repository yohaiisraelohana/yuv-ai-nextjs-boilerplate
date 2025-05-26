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
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { createQuoteTemplate, updateQuoteTemplate } from "../actions";

const quoteTemplateSchema = z.object({
  type: z.enum(["שירותים", "סדנאות", "מוצרים"], {
    required_error: "סוג התבנית הוא שדה חובה",
  }),
  title: z.string().min(1, "כותרת התבנית היא שדה חובה"),
  content: z.string().min(1, "תוכן התבנית הוא שדה חובה"),
  variables: z
    .array(
      z.object({
        name: z.string().min(1, "שם המשתנה הוא שדה חובה"),
        description: z.string().min(1, "תיאור המשתנה הוא שדה חובה"),
      })
    )
    .min(1, "חובה להוסיף לפחות משתנה אחד"),
});

type QuoteTemplateFormValues = z.infer<typeof quoteTemplateSchema>;

interface QuoteTemplateFormProps {
  template?: {
    _id: string;
    type: "שירותים" | "סדנאות" | "מוצרים";
    title: string;
    content: string;
    variables: Array<{ name: string; description: string }>;
  };
  mode: "create" | "edit";
  trigger?: React.ReactNode;
}

export function QuoteTemplateForm({
  template,
  mode,
  trigger,
}: QuoteTemplateFormProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<QuoteTemplateFormValues>({
    resolver: zodResolver(quoteTemplateSchema),
    defaultValues: {
      type: template?.type || "שירותים",
      title: template?.title || "",
      content: template?.content || "",
      variables: template?.variables || [{ name: "", description: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variables",
  });

  const handleSubmit = async (data: QuoteTemplateFormValues) => {
    try {
      if (mode === "create") {
        await createQuoteTemplate(data);
        toast.success("התבנית נוצרה בהצלחה");
      } else if (template) {
        await updateQuoteTemplate(template._id, data);
        toast.success("התבנית עודכנה בהצלחה");
      }
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("אירעה שגיאה");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>תבנית חדשה</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "תבנית חדשה" : "ערוך תבנית"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סוג התבנית</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר סוג תבנית" />
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כותרת התבנית</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תוכן התבנית</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[200px]"
                      placeholder="השתמש ב-{{שם_משתנה}} כדי להוסיף משתנים"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">משתנים</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", description: "" })}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף משתנה
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start">
                  <FormField
                    control={form.control}
                    name={`variables.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>שם המשתנה</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variables.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>תיאור המשתנה</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-8"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                ביטול
              </Button>
              <Button type="submit">
                {mode === "create" ? "צור תבנית" : "שמור שינויים"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
