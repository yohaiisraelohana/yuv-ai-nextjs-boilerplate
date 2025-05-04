import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronsUp, Mail, Github, MessagesSquare, ShieldCheck, Sparkles } from 'lucide-react';

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="py-10 animate-fadeIn glass-blur-gradient">
      {/* Dashboard Banner */}
      <div className="animated-banner mb-8 rounded-md shadow-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
            <h2 className="text-lg font-semibold text-white">Welcome to Your Dashboard</h2>
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <span className="text-xs text-white opacity-80">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 glass-headline">Welcome, {user.firstName || 'User'}!</h1>
        <p className="text-gray-500 dark:text-gray-400">Your personal dashboard at YUV.AI Boilerplate</p>
      </div>
      
      {/* Welcome Alert */}
      <Alert className="mb-8 border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/50 glass-shimmer">
        <ChevronsUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        <AlertTitle className="glass-headline">Fly High With YUV.AI</AlertTitle>
        <AlertDescription>
          This is a protected page that only authenticated users can access. Start building your amazing project now!
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="transform transition-all duration-300 hover:shadow-lg animate-slideInUp glass-shimmer" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" /> <span className="glass-headline">Features</span>
            </CardTitle>
            <CardDescription>What's included in this boilerplate</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Next.js 14 with App Router</li>
              <li>Tailwind CSS + shadcn/ui</li>
              <li>MongoDB Atlas integration</li>
              <li>Clerk Authentication</li>
              <li>Responsive Design</li>
              <li>Accessibility Features</li>
              <li>OWASP Security Standards</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="transform transition-all duration-300 hover:shadow-lg animate-slideInUp glass-shimmer" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-purple-600" /> <span className="glass-headline">Security</span>
            </CardTitle>
            <CardDescription>Built-in security features</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>CSRF Protection</li>
              <li>XSS Prevention</li>
              <li>Secure HTTP Headers</li>
              <li>Rate Limiting</li>
              <li>Input Validation</li>
              <li>Secure Authentication</li>
              <li>Content Security Policy</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="transform transition-all duration-300 hover:shadow-lg animate-slideInUp glass-shimmer" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MessagesSquare className="h-5 w-5 text-purple-600" /> <span className="glass-headline">Getting Started</span>
            </CardTitle>
            <CardDescription>Next steps for your project</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Customize this boilerplate</li>
              <li>Create new pages and components</li>
              <li>Set up your MongoDB database</li>
              <li>Configure Clerk webhooks</li>
              <li>Add custom data models</li>
              <li>Implement business logic</li>
              <li>Deploy to production</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      {/* Resources */}
      <h2 className="text-2xl font-bold mb-4 glass-headline">Helpful Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="transform transition-all duration-300 hover:shadow-lg animate-slideInUp glass-shimmer" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" /> <span className="glass-headline">GitHub Resources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/shadcn/ui" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center gap-1"
                >
                  shadcn/ui Components 
                  <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/tailwindlabs/tailwindcss" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center gap-1"
                >
                  Tailwind CSS 
                  <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/vercel/next.js" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center gap-1"
                >
                  Next.js 
                  <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="transform transition-all duration-300 hover:shadow-lg animate-slideInUp glass-shimmer" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> <span className="glass-headline">Contact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Have questions or need custom development?</p>
            <p className="glass-headline font-semibold">
              Yuval Avidani - AI Builder & Speaker
            </p>
            <div className="flex gap-4 mt-4">
              <a 
                href="https://twitter.com/yuvlav" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-500 transition-colors"
                aria-label="Twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com/yuval_770" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://linktr.ee/yuvai" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:text-green-600 transition-colors"
                aria-label="Linktree"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.953 15.066c-.08.163-.08.324-.08.486 0 1.683 1.004 2.978 2.893 2.978 1.737 0 3.103-1.135 3.103-3.346V3.207h2.352v11.977c0 3.346-2.163 5.431-5.431 5.431-2.812 0-4.605-1.79-5.139-3.644l2.352-1.061v.156zm6.484-13.915h-2.351v.981h2.351v-.981zm-7.816.981v-.981H4.269v15.066c0 2.001 1.302 3.346 3.103 3.346v-1.818c-.684 0-1.171-.516-1.171-1.324V2.132h1.42z" />
                </svg>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 