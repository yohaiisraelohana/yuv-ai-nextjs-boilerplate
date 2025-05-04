import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Code, Shield, Users, Database, Palette } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto text-center mb-16 animate-fadeIn">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-yellow-400 to-purple-600 bg-clip-text text-transparent">
          Next.js Boilerplate by YUV.AI
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          A modern starter template with Next.js, MongoDB Atlas, Clerk Authentication, Tailwind CSS, and shadcn/ui
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 animate-slideInUp"
            style={{ animationDelay: '0.1s' }}
          >
            <Link href="/dashboard">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            asChild
            size="lg"
            className="animate-slideInUp"
            style={{ animationDelay: '0.2s' }}
          >
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title} 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 animate-fadeIn"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
                  <feature.icon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full max-w-5xl mx-auto text-center bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-10 text-white mb-16 animate-fadeIn">
        <h2 className="text-3xl font-bold mb-4">Ready to Build Amazing Projects?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Start with this production-ready boilerplate and focus on building your features instead of setting up infrastructure.
        </p>
        <Button 
          asChild
          size="lg" 
          variant="outline" 
          className="bg-white text-purple-600 hover:bg-gray-100"
        >
          <Link href="/dashboard">
            Start Building Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Branding */}
      <section className="w-full max-w-3xl mx-auto text-center mb-8 animate-fadeIn">
        <p className="text-xl font-semibold bg-gradient-to-r from-purple-600 via-yellow-400 to-purple-600 bg-clip-text text-transparent mb-2">
          Fly High With YUV.AI
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Find me on{' '}
          <a href="https://twitter.com/yuvlav" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Twitter</a>,{' '}
          <a href="https://instagram.com/yuval_770" className="text-pink-500 hover:underline" target="_blank" rel="noopener noreferrer">Instagram</a>, or{' '}
          <a href="https://linktr.ee/yuvai" className="text-green-500 hover:underline" target="_blank" rel="noopener noreferrer">Linktree</a>
        </p>
      </section>
    </div>
  );
}

const features = [
  {
    title: 'Next.js App Router',
    description: 'Built on the latest Next.js version with App Router for improved routing and layouts.',
    icon: Code,
  },
  {
    title: 'MongoDB Integration',
    description: 'Seamless MongoDB Atlas integration with Mongoose for efficient data management.',
    icon: Database,
  },
  {
    title: 'Clerk Authentication',
    description: 'Secure authentication with Clerk, including social logins and user management.',
    icon: Users,
  },
  {
    title: 'Beautiful UI',
    description: 'Stylish UI with Tailwind CSS and shadcn/ui components for rapid development.',
    icon: Palette,
  },
  {
    title: 'Security First',
    description: 'OWASP Top 10 security compliance with built-in protection against common vulnerabilities.',
    icon: Shield,
  },
  {
    title: 'Accessibility',
    description: 'Fully accessible design with dark mode, high contrast mode, and font size adjustments.',
    icon: Users,
  },
];
