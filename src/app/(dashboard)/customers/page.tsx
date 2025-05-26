import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CustomersPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <div className="py-10  "> Customers</div>;
}
