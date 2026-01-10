/**
 * Error tracking utility
 * Supports Sentry and custom error logging
 */

interface ErrorContext {
  [key: string]: any;
}

class ErrorTracker {
  private initialized = false;
  private sentry: any = null;

  init() {
    if (this.initialized) return;

    // Initialize Sentry if DSN is provided
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (sentryDsn && typeof window !== "undefined") {
      try {
        // Dynamic import to avoid bundling Sentry in development
        if (process.env.NODE_ENV === "production") {
          // Sentry will be loaded via script tag in production
          this.initialized = true;
        }
      } catch (error) {
        console.error("Failed to initialize Sentry:", error);
      }
    }

    this.initialized = true;
  }

  captureException(error: Error, context?: ErrorContext) {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[Error Tracking]", error, context);
    }

    // Send to Sentry in production
    if (typeof window !== "undefined" && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          custom: context || {},
        },
      });
    }

    // Also send to analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "exception", {
        description: error.message,
        fatal: false,
        ...context,
      });
    }
  }

  captureMessage(message: string, level: "info" | "warning" | "error" = "info", context?: ErrorContext) {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      const logMethod = level === "error" ? console.error : level === "warning" ? console.warn : console.log;
      logMethod(`[Error Tracking ${level.toUpperCase()}]`, message, context);
    }

    // Send to Sentry in production
    if (typeof window !== "undefined" && (window as any).Sentry) {
      (window as any).Sentry.captureMessage(message, {
        level: level === "error" ? "error" : level === "warning" ? "warning" : "info",
        contexts: {
          custom: context || {},
        },
      });
    }
  }

  setUser(userId: string, email?: string, username?: string) {
    if (typeof window !== "undefined" && (window as any).Sentry) {
      (window as any).Sentry.setUser({
        id: userId,
        email,
        username,
      });
    }
  }

  clearUser() {
    if (typeof window !== "undefined" && (window as any).Sentry) {
      (window as any).Sentry.setUser(null);
    }
  }
}

export const errorTracker = new ErrorTracker();

// Initialize on module load (client-side only)
if (typeof window !== "undefined") {
  errorTracker.init();
}


