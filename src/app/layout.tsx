import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Analytics from "@/components/Analytics";
import SkipToContent from "@/components/SkipToContent";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAServiceWorker from "@/components/PWAServiceWorker";

const inter = Inter({ 
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://job-quest-bice.vercel.app';

export const metadata: Metadata = {
  title: {
    default: "JobQuest - Tu Búsqueda de Empleo Gamificada",
    template: "%s | JobQuest",
  },
  description: "Convierte tu búsqueda de empleo en una aventura épica. Organiza tus postulaciones, gana puntos por cada entrevista y sube de nivel hasta conseguir el trabajo de tus sueños.",
  keywords: ["búsqueda de empleo", "CV", "curriculum vitae", "gamificación", "job search", "career", "trabajo"],
  authors: [{ name: "JobQuest" }],
  creator: "JobQuest",
  publisher: "JobQuest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: baseUrl,
    title: "JobQuest - Tu Búsqueda de Empleo Gamificada",
    description: "Convierte tu búsqueda de empleo en una aventura épica. Organiza tus postulaciones, gana puntos y sube de nivel.",
    siteName: "JobQuest",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "JobQuest - Tu Búsqueda de Empleo Gamificada",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JobQuest - Tu Búsqueda de Empleo Gamificada",
    description: "Convierte tu búsqueda de empleo en una aventura épica",
    images: [`${baseUrl}/og-image.png`],
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
  verification: {
    // Add Google Search Console verification when available
    // google: 'your-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ec4899" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="JobQuest" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "JobQuest",
              description: "Plataforma de gestión de carrera profesional con gamificación",
              url: baseUrl,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} font-display`}>
        <ErrorBoundary>
          <SkipToContent />
          <Analytics />
          {children}
          <CookieConsent />
          <PWAServiceWorker />
          {/* Google Tag Manager noscript fallback */}
          {process.env.NEXT_PUBLIC_GTM_ID && (
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
          )}
        </ErrorBoundary>
      </body>
    </html>
  );
}

