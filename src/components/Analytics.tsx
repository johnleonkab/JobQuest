"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view on route change
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  // Load Google Tag Manager if configured
  useEffect(() => {
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
    if (gtmId && typeof window !== "undefined") {
      // Google Tag Manager script
      const script1 = document.createElement("script");
      script1.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `;
      document.head.appendChild(script1);

      // GTM noscript fallback (for body)
      const noscript = document.createElement("noscript");
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(noscript, document.body.firstChild);
    }
  }, []);

  // Load Plausible if configured
  useEffect(() => {
    const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    if (plausibleDomain && typeof window !== "undefined") {
      const script = document.createElement("script");
      script.defer = true;
      script.setAttribute("data-domain", plausibleDomain);
      script.src = "https://plausible.io/js/script.js";
      document.head.appendChild(script);
    }
  }, []);

  // Load Sentry if configured
  useEffect(() => {
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (sentryDsn && typeof window !== "undefined" && process.env.NODE_ENV === "production") {
      // Load Sentry browser SDK
      const script = document.createElement("script");
      script.src = "https://browser.sentry-cdn.com/7.91.0/bundle.min.js";
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if ((window as any).Sentry) {
          (window as any).Sentry.init({
            dsn: sentryDsn,
            environment: process.env.NODE_ENV,
            tracesSampleRate: 0.1,
            beforeSend(event: any) {
              // Filter out development errors
              if (event.environment === "development") {
                return null;
              }
              return event;
            },
          });
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  return null;
}

