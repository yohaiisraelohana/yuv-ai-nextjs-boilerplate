import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/Navbar";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { AccessibilityControls } from "@/components/layout/AccessibilityControls";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Next.js Boilerplate by YUV.AI",
  description: "A modern Next.js boilerplate with MongoDB, Clerk, Tailwind CSS, and shadcn/ui",
  authors: [{ name: "Yuval Avidani", url: "https://linktr.ee/yuvai" }],
  keywords: ["Next.js", "React", "Tailwind CSS", "MongoDB", "Clerk", "YUV.AI"],
  creator: "YUV.AI",
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
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
        </head>
        <body className="outfit-app min-h-screen bg-background antialiased transition-colors">
          <AccessibilityProvider>
            <Navbar />
            <main className="min-h-[calc(100vh-4rem)] container mx-auto px-4">
              {children}
            </main>
            <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center space-x-2">
                  <a 
                    href="https://linktr.ee/yuvai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block h-16 w-16 overflow-hidden rounded-full border-2 border-purple-500"
                  >
                    <img 
                      src="/images/yuval-profile.jpg" 
                      alt="Yuval Avidani" 
                      className="h-full w-full object-cover"
                    />
                  </a>
                  <div>
                    <p>
                      Built by{' '}
                      <a 
                        href="https://linktr.ee/yuvai" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-purple-600 transition-colors"
                      >
                        Yuval Avidani
                      </a> 
                      {' '}- AI Builder & Speaker
                    </p>
                    <p className="mt-1">Fly High With YUV.AI</p>
                  </div>
                </div>
                <a 
                  href="https://yuv.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-24"
                >
                  <img 
                    src="/images/phoenix-logo.png" 
                    alt="YUV.AI Phoenix Logo" 
                    className="w-full"
                  />
                </a>
              </div>
            </footer>
            <AccessibilityControls />
            <Toaster />
          </AccessibilityProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
