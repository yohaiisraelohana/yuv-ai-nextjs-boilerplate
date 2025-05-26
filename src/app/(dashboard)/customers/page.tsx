import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCustomers, deleteCustomer } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerForm } from "./customer-form";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default async function CustomersPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const customers = await getCustomers();

  return (
    <div className="py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">לקוחות</h1>
        <CustomerForm mode="create" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>שם</TableHead>
              <TableHead>חברה</TableHead>
              <TableHead>אימייל</TableHead>
              <TableHead>טלפון</TableHead>
              <TableHead>כתובת</TableHead>
              <TableHead className="text-left">פעולות</TableHead>
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
                <TableCell>
                  <div className="flex gap-2">
                    <CustomerForm mode="edit" customer={customer} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">מחק</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                          <AlertDialogDescription>
                            פעולה זו לא ניתנת לביטול. זה ימחק את הלקוח לצמיתות.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ביטול</AlertDialogCancel>
                          <form
                            action={async () => {
                              "use server";
                              await deleteCustomer(customer._id);
                            }}
                          >
                            <AlertDialogAction type="submit">
                              מחק
                            </AlertDialogAction>
                          </form>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
