"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Link } from "lucide-react";

interface CopyLinkButtonProps {
  quoteId: string;
  publicToken: string | null;
}

export function CopyLinkButton({ quoteId, publicToken }: CopyLinkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const generateAndCopyLink = async () => {
    try {
      setIsLoading(true);

      let token = publicToken;
      if (!token) {
        // Generate new token if doesn't exist
        const response = await fetch(
          `/api/quotes/${quoteId}/generate-public-link`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to generate link");
        }

        const data = await response.json();
        token = data.publicToken;
      }

      // Create the full public URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const publicUrl = `${baseUrl}/public/quotes/${token}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(publicUrl);
      toast.success("הקישור הועתק ללוח");
    } catch (error) {
      toast.error("אירעה שגיאה ביצירת הקישור");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={generateAndCopyLink}
      disabled={isLoading}
      variant="outline"
      className="gap-2"
    >
      {isLoading ? (
        <span className="animate-spin">⟳</span>
      ) : publicToken ? (
        <Copy className="h-4 w-4" />
      ) : (
        <Link className="h-4 w-4" />
      )}
      {publicToken ? "העתק קישור" : "צור קישור"}
    </Button>
  );
}
