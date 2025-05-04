import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-yuvai-purple">
              <Image 
                src="/images/yuval-profile.jpg" 
                alt="Yuval Avidani" 
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="outfit outfit-medium">
                Built by{' '}
                <a 
                  href="https://linktr.ee/yuvai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-yuvai-purple transition-colors outfit-semibold"
                >
                  Yuval Avidani
                </a> 
                {' '}- AI Builder & Speaker
              </p>
              <p className="mt-1 outfit outfit-bold text-yuvai-purple">
                Fly High With YUV.AI
              </p>
              <div className="flex space-x-3 mt-2 justify-center md:justify-start">
                <SocialLink href="https://linktr.ee/yuvai" label="Linktree" />
                <SocialLink href="https://twitter.com/yuvai" label="Twitter" />
                <SocialLink href="https://instagram.com/yuv.ai" label="Instagram" />
                <SocialLink href="https://yuv.ai/blog" label="Blog" />
              </div>
            </div>
          </div>
          <Link 
            href="https://yuv.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-24 mt-4 animate-phoenix-fly"
          >
            <Image 
              src="/images/phoenix-logo.png" 
              alt="YUV.AI Phoenix Logo" 
              width={96}
              height={96}
              className="w-full"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-gray-400 hover:text-yuvai-purple transition-colors"
      aria-label={label}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    </a>
  );
} 