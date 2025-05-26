import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProducts } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם המוצר</TableHead>
                <TableHead>תיאור</TableHead>
                <TableHead>קטגוריה</TableHead>
                <TableHead>מחיר</TableHead>
                <TableHead>הנחה</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typedProducts?.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>₪{product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.discount}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
