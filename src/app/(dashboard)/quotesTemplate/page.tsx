import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getQuoteTemplates } from "./actions";
import { QuoteTemplateForm } from "./components/QuoteTemplateForm";
import { QuoteTemplatesTable } from "./components/QuoteTemplatesTable";

export default async function QuotesTemplatePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { templates } = await getQuoteTemplates();

  return (
    <div className="py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">תבניות הצעות מחיר</h1>
        <QuoteTemplateForm mode="create" />
      </div>
      <div className="rounded-md border">
        <QuoteTemplatesTable initialTemplates={templates} />
      </div>
    </div>
  );
}
