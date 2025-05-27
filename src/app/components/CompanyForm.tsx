"use client";

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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const companySchema = z.object({
  name: z.string().min(1, "שם החברה הוא שדה חובה"),
  logo: z.string().min(1, "לוגו החברה הוא שדה חובה"),
  address: z.object({
    street: z.string().min(1, "רחוב הוא שדה חובה"),
    city: z.string().min(1, "עיר היא שדה חובה"),
    zipCode: z.string().min(1, "מיקוד הוא שדה חובה"),
  }),
  contactInfo: z.object({
    phone: z.string().min(1, "מספר טלפון הוא שדה חובה"),
    email: z.string().email("אנא הכנס כתובת אימייל תקינה"),
    website: z.string().optional(),
  }),
  signature: z.string().min(1, "חתימה היא שדה חובה"),
  taxId: z.string().min(1, "מספר עוסק/ח.פ. הוא שדה חובה"),
  bankDetails: z.object({
    bankName: z.string().min(1, "שם הבנק הוא שדה חובה"),
    branchNumber: z.string().min(1, "מספר סניף הוא שדה חובה"),
    accountNumber: z.string().min(1, "מספר חשבון הוא שדה חובה"),
  }),
});

type CompanyFormValues = z.infer<typeof companySchema>;

async function getCompany() {
  const res = await fetch("/api/company");
  if (!res.ok) {
    throw new Error("Failed to fetch company");
  }
  return res.json();
}

async function updateCompany(data: CompanyFormValues) {
  const res = await fetch("/api/company", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update company");
  }
  return res.json();
}

export function CompanyForm() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      logo: "",
      address: {
        street: "",
        city: "",
        zipCode: "",
      },
      contactInfo: {
        phone: "",
        email: "",
        website: "",
      },
      signature: "",
      taxId: "",
      bankDetails: {
        bankName: "",
        branchNumber: "",
        accountNumber: "",
      },
    },
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await getCompany();
        if (data.company) {
          form.reset(data.company);
        }
      } catch (error) {
        console.error("Error fetching company:", error);
        toast.error("אירעה שגיאה בטעינת פרטי החברה");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [form]);

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      setIsLoading(true);
      await updateCompany(data);
      toast.success("פרטי החברה נשמרו בהצלחה");
      router.refresh();
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error("אירעה שגיאה בשמירת פרטי החברה");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center">טוען...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>שם החברה</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>מספר עוסק/ח.פ.</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>לוגו החברה (URL)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="signature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>חתימה (URL)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">כתובת</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>רחוב</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>עיר</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>מיקוד</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">פרטי התקשרות</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="contactInfo.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>טלפון</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>אימייל</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo.website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>אתר אינטרנט</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">פרטי בנק</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="bankDetails.bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שם הבנק</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankDetails.branchNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>מספר סניף</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankDetails.accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>מספר חשבון</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "שומר..." : "שמור פרטים"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
