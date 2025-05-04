'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X, Sparkles } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export function Navbar() {
  const { isSignedIn, user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <>
      {/* Animated Banner */}
      <div className="animated-banner w-full text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-white font-medium">
          <Sparkles className="h-4 w-4" />
          <p className="text-sm">
            {isSignedIn ? `Welcome ${user?.firstName || 'back'}! Fly High With YUV.AI` : 'Welcome to YUV.AI Boilerplate - Fly High With YUV.AI'}
          </p>
          <Sparkles className="h-4 w-4" />
        </div>
      </div>
      
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b glass-blur-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold glass-headline">YUV.AI</span>
              </Link>
              <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                <Link
                  href="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium glass-shimmer ${
                    pathname === '/'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium glass-shimmer ${
                    pathname === '/dashboard'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                {isSignedIn ? (
                  <div className="flex items-center space-x-4">
                    {/* ThemeToggle on desktop */}
                    <div className="hidden lg:block mr-4">
                      <CustomErrorBoundary>
                        <ThemeToggle />
                      </CustomErrorBoundary>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    {/* ThemeToggle on desktop */}
                    <div className="hidden lg:block mr-4">
                      <CustomErrorBoundary>
                        <ThemeToggle />
                      </CustomErrorBoundary>
                    </div>
                    <Link
                      href="/sign-in"
                      className="text-sm font-medium text-primary hover:text-primary/80 glass-shimmer"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/sign-up"
                      className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 glass-shimmer"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
                {/* Mobile menu button */}
                <div className="flex items-center lg:hidden">
                  <CustomErrorBoundary>
                    <ThemeToggle />
                  </CustomErrorBoundary>
                  <button
                    type="button"
                    className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    aria-expanded="false"
                    aria-label="toggle menu"
                    onClick={toggleMobileMenu}
                  >
                    {isMobileMenuOpen ? (
                      <X className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Menu className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname === '/'
                    ? 'bg-indigo-50 border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname === '/dashboard'
                    ? 'bg-indigo-50 border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

class CustomErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Theme toggle error:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      console.error("Theme toggle failed:", this.state.error);
      // Return fallback UI
      return (
        <div className="w-10 h-10 flex items-center justify-center">
          <span className="text-red-500">⚠️</span>
        </div>
      );
    }

    return this.props.children;
  }
} 