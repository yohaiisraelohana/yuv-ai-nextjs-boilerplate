import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { QuoteTemplateForm } from "../components/QuoteTemplateForm";

export default async function NewQuoteTemplatePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">תבנית חדשה</h1>
        <QuoteTemplateForm mode="create" />
      </div>
    </div>
  );
}
