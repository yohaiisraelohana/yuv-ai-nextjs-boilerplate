import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CompanyForm } from "./components/CompanyForm";

export default function Home() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          ניהול פרטי החברה
        </h1>
        <CompanyForm />
      </div>
    </div>
  );
}
