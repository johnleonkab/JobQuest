/**
 * Analytics utility for tracking user events
 * Supports Google Analytics and Plausible
 */

// Google Tag Manager / Analytics
export const trackEvent = (
  eventName: string,
  eventParams?: {
    [key: string]: string | number | boolean;
  }
) => {
  // Google Tag Manager (dataLayer)
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: eventName,
      ...eventParams,
    });
  }

  // Fallback: Google Analytics 4 (gtag) - if GTM is not configured
  if (typeof window !== "undefined" && (window as any).gtag && !(window as any).dataLayer) {
    (window as any).gtag("event", eventName, eventParams);
  }

  // Plausible Analytics
  if (typeof window !== "undefined" && (window as any).plausible) {
    (window as any).plausible(eventName, {
      props: eventParams,
    });
  }

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", eventName, eventParams);
  }
};

// Track page views
export const trackPageView = (url: string) => {
  // Google Tag Manager (dataLayer)
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: "page_view",
      page_path: url,
      page_location: window.location.href,
    });
  }

  // Fallback: Google Analytics 4 (gtag)
  if (typeof window !== "undefined" && (window as any).gtag && !(window as any).dataLayer) {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (gaId) {
      (window as any).gtag("config", gaId, {
        page_path: url,
      });
    }
  }

  // Plausible
  if (typeof window !== "undefined" && (window as any).plausible) {
    (window as any).plausible("pageview");
  }
};

// Common events
export const analytics = {
  // User events
  signUp: () => trackEvent("sign_up"),
  signIn: () => trackEvent("sign_in"),
  signOut: () => trackEvent("sign_out"),

  // CV events
  cvSectionAdded: (sectionType: string) =>
    trackEvent("cv_section_added", { section_type: sectionType }),
  cvSectionUpdated: (sectionType: string) =>
    trackEvent("cv_section_updated", { section_type: sectionType }),
  cvAnalyzed: () => trackEvent("cv_analyzed"),
  cvImproved: (sectionType: string) =>
    trackEvent("cv_improved", { section_type: sectionType }),
  cvExported: () => trackEvent("cv_exported"),

  // Job offer events
  jobOfferCreated: () => trackEvent("job_offer_created"),
  jobOfferUpdated: (status: string) =>
    trackEvent("job_offer_updated", { status }),
  jobOfferDeleted: () => trackEvent("job_offer_deleted"),
  jobOfferViewed: () => trackEvent("job_offer_viewed"),

  // Interview events
  interviewScheduled: () => trackEvent("interview_scheduled"),
  interviewUpdated: () => trackEvent("interview_updated"),

  // Contact events
  contactAdded: () => trackEvent("contact_added"),
  contactUpdated: () => trackEvent("contact_updated"),

  // Gamification events
  levelUp: (level: number) => trackEvent("level_up", { level }),
  badgeEarned: (badgeId: string) =>
    trackEvent("badge_earned", { badge_id: badgeId }),
  xpEarned: (xp: number, eventId: string) =>
    trackEvent("xp_earned", { xp, event_id: eventId }),

  // AI events
  aiInsightsGenerated: () => trackEvent("ai_insights_generated"),
  aiChatMessage: () => trackEvent("ai_chat_message"),
  aiSectionImproved: (sectionType: string) =>
    trackEvent("ai_section_improved", { section_type: sectionType }),

  // Error events
  error: (errorType: string, errorMessage: string) =>
    trackEvent("error", { error_type: errorType, error_message: errorMessage }),
};

