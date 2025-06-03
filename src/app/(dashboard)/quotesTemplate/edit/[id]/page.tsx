import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getQuoteTemplateById } from "../../actions";
import { QuoteTemplateForm } from "../../components/QuoteTemplateForm";

interface EditQuoteTemplatePageProps {
  params: {
    id: string;
  };
}

export default async function EditQuoteTemplatePage({
  params,
}: EditQuoteTemplatePageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const template = await getQuoteTemplateById(params.id);

  if (!template) {
    redirect("/quotesTemplate");
  }

  return (
    <div className="py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">ערוך תבנית</h1>
        <QuoteTemplateForm mode="edit" template={template} />
      </div>
    </div>
  );
}
