"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCustomer, updateCustomer } from "./actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "שומר..." : "שמור"}
    </Button>
  );
}

interface CustomerFormProps {
  customer?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    address: {
      street: string;
      city: string;
      zipCode: string;
    };
  };
  mode: "create" | "edit";
}

export function CustomerForm({ customer, mode }: CustomerFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleAction(formData: FormData) {
    const action = mode === "create" ? createCustomer : updateCustomer;
    const result = await action(formData);

    if (result.success) {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === "create" ? "default" : "outline"}>
          {mode === "create" ? "הוסף לקוח חדש" : "ערוך"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "הוסף לקוח חדש" : "ערוך לקוח"}
          </DialogTitle>
        </DialogHeader>
        <form action={handleAction} className="space-y-4">
          {mode === "edit" && (
            <input type="hidden" name="id" value={customer?._id} />
          )}
          <div className="space-y-2">
            <Label htmlFor="name">שם</Label>
            <Input
              id="name"
              name="name"
              defaultValue={customer?.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={customer?.email}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">טלפון</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={customer?.phone}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">חברה</Label>
            <Input
              id="company"
              name="company"
              defaultValue={customer?.company}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="street">רחוב</Label>
            <Input
              id="street"
              name="street"
              defaultValue={customer?.address.street}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">עיר</Label>
            <Input
              id="city"
              name="city"
              defaultValue={customer?.address.city}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">מיקוד</Label>
            <Input
              id="zipCode"
              name="zipCode"
              defaultValue={customer?.address.zipCode}
              required
            />
          </div>
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
