import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/dashboard/',
          '/profile/',
          '/cv-builder/',
          '/job-openings/',
          '/gamification/',
          '/test-',
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://job-quest-bice.vercel.app'}/sitemap.xml`,
  };
}


