"use server";

import { connectToDatabase } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  try {
    await connectToDatabase();
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(customers));
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
  }
}

export async function createCustomer(formData: FormData) {
  try {
    await connectToDatabase();
    const customerData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      company: formData.get("company"),
      address: {
        street: formData.get("street"),
        city: formData.get("city"),
        zipCode: formData.get("zipCode"),
      },
    };

    await Customer.create(customerData);
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error("Error creating customer:", error);
    return { success: false, error: "Failed to create customer" };
  }
}

export async function updateCustomer(formData: FormData) {
  try {
    await connectToDatabase();
    const id = formData.get("id");
    const customerData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      company: formData.get("company"),
      address: {
        street: formData.get("street"),
        city: formData.get("city"),
        zipCode: formData.get("zipCode"),
      },
    };

    await Customer.findByIdAndUpdate(id, customerData);
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error("Error updating customer:", error);
    return { success: false, error: "Failed to update customer" };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await connectToDatabase();
    await Customer.findByIdAndDelete(id);
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return { success: false, error: "Failed to delete customer" };
  }
}
