import { connectToDatabase } from "@/lib/mongodb";
import Customer from "@/models/Customer";

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
