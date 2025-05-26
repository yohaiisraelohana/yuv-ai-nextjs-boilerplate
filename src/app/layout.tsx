import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/Navbar";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { AccessibilityControls } from "@/components/layout/AccessibilityControls";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "quotes manager",
  description: "A quotes manager app",
  keywords: ["quotes", "quotes manager", "quotes app", "quotes manager app"],
  creator: "Yohai",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="light" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="outfit-app min-h-screen bg-background antialiased transition-colors">
          <AccessibilityProvider>
            <Navbar />
            <main className="min-h-[calc(100vh-4rem)] container mx-auto px-4">
              {children}
            </main>

            <AccessibilityControls />
            <Toaster />
          </AccessibilityProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
