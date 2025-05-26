import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCustomers } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CustomersPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const customers = await getCustomers();

  return (
    <div className="py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">לקוחות</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>שם</TableHead>
              <TableHead>חברה</TableHead>
              <TableHead>אימייל</TableHead>
              <TableHead>טלפון</TableHead>
              <TableHead>כתובת</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer: any) => (
              <TableRow key={customer._id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.company}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  {`${customer.address.street}, ${customer.address.city} ${customer.address.zipCode}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
