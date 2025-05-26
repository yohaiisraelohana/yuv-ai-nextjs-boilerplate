import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useState } from "react";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(1, "שם המוצר הוא שדה חובה"),
  description: z.string().min(1, "תיאור המוצר הוא שדה חובה"),
  price: z.number().min(0, "המחיר לא יכול להיות שלילי"),
  category: z.string().min(1, "קטגוריה היא שדה חובה"),
  discount: z.number().min(0).max(100, "ההנחה לא יכולה להיות גדולה מ-100%"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    discount: number;
  };
  onSubmit: (data: ProductFormValues) => Promise<void>;
  trigger?: React.ReactNode;
}

export function ProductForm({ product, onSubmit, trigger }: ProductFormProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      category: product?.category || "",
      discount: product?.discount || 0,
    },
  });

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      await onSubmit(data);
      setOpen(false);
      form.reset();
      toast.success(product ? "המוצר עודכן בהצלחה" : "המוצר נוסף בהצלחה");
    } catch (error) {
      toast.error("אירעה שגיאה");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>הוסף מוצר</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "ערוך מוצר" : "הוסף מוצר חדש"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שם המוצר</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תיאור</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>מחיר</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>קטגוריה</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>הנחה (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {product ? "עדכן" : "הוסף"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
