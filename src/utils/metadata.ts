import { Metadata } from 'next';

type MetadataProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  author?: string;
  twitterHandle?: string;
};

export function constructMetadata({
  title = 'Next.js Boilerplate by YUV.AI',
  description = 'A modern Next.js boilerplate with MongoDB, Clerk, Tailwind CSS, and shadcn/ui',
  keywords = ['Next.js', 'React', 'Tailwind CSS', 'MongoDB', 'Clerk', 'YUV.AI'],
  image = '/og-image.png',
  author = 'Yuval Avidani',
  twitterHandle = '@yuvlav',
}: MetadataProps = {}): Metadata {
  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: author, url: 'https://linktr.ee/yuvai' }],
    creator: 'YUV.AI',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://your-website.com',
      title,
      description,
      siteName: 'Next.js Boilerplate by YUV.AI',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    metadataBase: new URL('https://your-website.com'),
  };
} 