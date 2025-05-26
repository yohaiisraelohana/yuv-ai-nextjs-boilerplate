"use server";

import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function getProducts() {
  try {
    await connectToDatabase();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return { products: JSON.parse(JSON.stringify(products)) };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { error: "Failed to fetch products" };
  }
}
