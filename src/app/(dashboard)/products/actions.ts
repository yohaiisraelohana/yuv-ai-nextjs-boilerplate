"use server";

import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

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

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  category: string;
  discount: number;
}) {
  try {
    await connectToDatabase();
    const product = await Product.create(data);
    revalidatePath("/products");
    return { product: JSON.parse(JSON.stringify(product)) };
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "Failed to create product" };
  }
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    description: string;
    price: number;
    category: string;
    discount: number;
  }
) {
  try {
    await connectToDatabase();
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    revalidatePath("/products");
    return { product: JSON.parse(JSON.stringify(product)) };
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await connectToDatabase();
    await Product.findByIdAndDelete(id);
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { error: "Failed to delete product" };
  }
}
