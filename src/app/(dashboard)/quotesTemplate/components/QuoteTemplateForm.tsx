"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const formSchema = z.object({
  type: z.enum(["שירותים", "סדנאות", "מוצרים"]),
  title: z.string().min(1, "כותרת היא שדה חובה"),
  content: z.string().min(1, "תוכן הוא שדה חובה"),
  variables: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    })
  ),
});

interface QuoteTemplateFormProps {
  mode: "create" | "edit";
  template?: {
    id: string;
    type: "שירותים" | "סדנאות" | "מוצרים";
    title: string;
    content: string;
    variables: Array<{ name: string; description: string }>;
  };
}

export function QuoteTemplateForm({ mode, template }: QuoteTemplateFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: template?.type || "שירותים",
      title: template?.title || "",
      content: template?.content || "",
      variables: template?.variables || [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      if (mode === "create") {
        await createQuoteTemplate(values);
        toast.success("התבנית נוצרה בהצלחה");
      } else {
        if (!template?.id) return;
        await updateQuoteTemplate(template.id, values);
        toast.success("התבנית עודכנה בהצלחה");
      }
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("אירעה שגיאה");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{mode === "create" ? "תבנית חדשה" : "ערוך תבנית"}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "תבנית חדשה" : "ערוך תבנית"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סוג</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                      variables={form.getValues("variables")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "שומר..." : "שמור"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
