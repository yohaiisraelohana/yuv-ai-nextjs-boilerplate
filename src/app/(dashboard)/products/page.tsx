import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProducts } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductsTable } from "./components/ProductsTable";

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discount: number;
}

export default async function ProductsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { products, error } = await getProducts();

  if (error) {
    return <div className="py-10">Error: {error}</div>;
  }

  const typedProducts = products as Product[];

  return (
    <div className="py-10">
      <Card>
        <CardHeader>
          <CardTitle>קטלוג מוצרים</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductsTable initialProducts={typedProducts} />
        </CardContent>
      </Card>
    </div>
  );
}
