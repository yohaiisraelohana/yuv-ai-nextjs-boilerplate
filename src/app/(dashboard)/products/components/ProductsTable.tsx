"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFilters } from "./ProductFilters";

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discount: number;
}

interface ProductsTableProps {
  initialProducts: Product[];
}

export function ProductsTable({ initialProducts }: ProductsTableProps) {
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);

  return (
    <>
      <ProductFilters
        products={initialProducts}
        onFilteredProducts={setFilteredProducts}
      />
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
          {filteredProducts?.map((product) => (
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
    </>
  );
}
