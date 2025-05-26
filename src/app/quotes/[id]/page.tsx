import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import QuoteTemplate from "@/models/QuoteTemplate";
import Company from "@/models/Company";

interface TemplateVariable {
  name: string;
  description: string;
}

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function SharedQuotePage({
  params,
  searchParams,
}: PageProps) {
  try {
    await connectToDatabase();
    const [template, company] = await Promise.all([
      QuoteTemplate.findById(params.id),
      Company.findOne(),
    ]);

    if (!template || !company) {
      notFound();
    }

    // Get variables from query parameters
    const variables: Record<string, string> = {};
    template.variables.forEach((variable: TemplateVariable) => {
      const value = searchParams[variable.name];
      if (value && typeof value === "string") {
        variables[variable.name] = value;
      }
    });

    // Replace variables in content
    let content = template.content;
    template.variables.forEach((variable: TemplateVariable) => {
      content = content.replace(
        new RegExp(`{{${variable.name}}}`, "g"),
        variables[variable.name] || ""
      );
    });

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {template.title}
                  </h1>
                  <p className="text-gray-600">{company.name}</p>
                </div>
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-16 w-auto"
                />
              </div>

              <div className="prose max-w-none">
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>

              <div className="mt-12 flex justify-end">
                <img
                  src={company.signature}
                  alt="חתימה"
                  className="h-24 w-auto"
                />
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      פרטי התקשרות
                    </h3>
                    <p className="text-gray-600">{company.contactInfo.phone}</p>
                    <p className="text-gray-600">{company.contactInfo.email}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      כתובת
                    </h3>
                    <p className="text-gray-600">
                      {company.address.street}
                      <br />
                      {company.address.city} {company.address.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering shared quote:", error);
    notFound();
  }
}
