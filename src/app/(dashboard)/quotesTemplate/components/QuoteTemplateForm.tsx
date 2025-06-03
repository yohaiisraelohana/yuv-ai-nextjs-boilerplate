"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "./RichTextEditor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { createQuoteTemplate, updateQuoteTemplate } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  type: z.enum(["שירותים", "סדנאות", "מוצרים"]),
  title: z.string().min(1, "כותרת היא שדה חובה"),
  content: z.string().min(1, "תוכן הוא שדה חובה"),
});

interface QuoteTemplateFormProps {
  mode: "create" | "edit";
  template?: {
    _id: string;
    type: "שירותים" | "סדנאות" | "מוצרים";
    title: string;
    content: string;
  };
}

export function QuoteTemplateForm({ mode, template }: QuoteTemplateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: template?.type || "שירותים",
      title: template?.title || "",
      content: template?.content || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      if (mode === "create") {
        const result = await createQuoteTemplate(values);
        if (result.error) {
          throw new Error(result.error);
        }
        toast.success("התבנית נוצרה בהצלחה");
        router.push("/quotesTemplate");
      } else {
        if (!template?._id) {
          throw new Error("מזהה תבנית חסר");
        }
        const result = await updateQuoteTemplate(template._id, values);
        if (result.error) {
          throw new Error(result.error);
        }
        toast.success("התבנית עודכנה בהצלחה");
        router.push("/quotesTemplate");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error instanceof Error ? error.message : "אירעה שגיאה");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>סוג</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סוג" />
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
              <FormLabel>כותרת</FormLabel>
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
              <FormLabel>תוכן</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/quotesTemplate")}
          >
            ביטול
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "שומר..." : "שמור"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
