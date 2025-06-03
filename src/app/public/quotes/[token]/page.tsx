import { Suspense } from "react";
import QuoteClient from "./quote-client";

interface PublicQuotePageProps {
  params: Promise<{
    token: string;
  }>;
}

async function getQuote(token: string) {
  // Get the base URL from the environment or use a default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/quotes/public/${token}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch quote");
  }

  return response.json();
}

export default async function PublicQuotePage({
  params,
}: PublicQuotePageProps) {
  const resolvedParams = await params;
  const quote = await getQuote(resolvedParams.token);

  return (
    <Suspense fallback={<div>טוען...</div>}>
      <QuoteClient initialQuote={quote} />
    </Suspense>
  );
}
