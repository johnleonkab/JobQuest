/**
 * Logo Extraction Service
 * 
 * Uses Logo.dev API to extract company logos
 * Documentation: https://docs.logo.dev
 */

export interface LogoExtractionResult {
  logoUrl: string | null;
  source: string;
  error?: string;
}

/**
 * Extracts company logo using Logo.dev API
 * Uses Logo.dev's name search API: https://img.logo.dev/name/{name}?token={api_key}
 * Or domain API: https://img.logo.dev/{domain}?token={api_key}
 * Documentation: https://docs.logo.dev/logo-images/name
 * Requires LOGO_DEV_API_KEY environment variable (publishable key pk_)
 */
export async function extractCompanyLogo(
  companyName: string,
  companyWebsite?: string
): Promise<LogoExtractionResult> {
  if (!companyName || companyName.trim().length === 0) {
    return {
      logoUrl: null,
      source: "logodev",
      error: "Company name is required",
    };
  }

  // Get API key from environment (should be publishable key pk_)
  const apiKey = process.env.LOGO_DEV_API_KEY;
  if (!apiKey) {
    return {
      logoUrl: null,
      source: "logodev",
      error: "LOGO_DEV_API_KEY environment variable is not set",
    };
  }

  // Clean company name
  const cleanName = cleanCompanyName(companyName);

  // Try multiple approaches in order:
  // 1. If website is provided, try domain first (more accurate)
  // 2. Try name search
  // 3. If website is provided but domain failed, try extracting domain from website
  
  try {
    // Approach 1: If website is provided, try using the domain directly
    if (companyWebsite) {
      const domain = extractDomainFromWebsite(companyWebsite);
      if (domain) {
        const domainLogoUrl = `https://img.logo.dev/${domain}?token=${apiKey}`;
        try {
          new URL(domainLogoUrl); // Validate URL
          // Return domain-based URL (more accurate than name search)
          return { logoUrl: domainLogoUrl, source: "logodev-domain" };
        } catch (urlError) {
          // Continue to name search
        }
      }
    }

    // Approach 2: Try name search API: https://img.logo.dev/name/{name}?token={api_key}
    // This is the correct way to search by company name according to logo.dev docs
    // Documentation: https://docs.logo.dev/logo-images/name
    const encodedName = encodeURIComponent(cleanName);
    const logoUrl = `https://img.logo.dev/name/${encodedName}?token=${apiKey}`;
    
    // Validate that the URL is properly formed
    try {
      new URL(logoUrl); // This will throw if URL is invalid
    } catch (urlError) {
      return {
        logoUrl: null,
        source: "logodev",
        error: "Invalid URL generated",
      };
    }
    
    // Always return the URL - Logo.dev will return a fallback monogram if logo not found
    // The browser will handle loading the image, and we don't need to verify beforehand
    // This avoids CORS issues and is more efficient
    return { logoUrl, source: "logodev-name" };
  } catch (error) {
    return {
      logoUrl: null,
      source: "logodev",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cleans company name for better logo matching
 */
function cleanCompanyName(name: string): string {
  return name
    .trim()
    // Remove common suffixes
    .replace(/\s+(Inc\.?|LLC|Ltd\.?|Corp\.?|Corporation|Company|Co\.?|S\.?A\.?|S\.?L\.?)$/i, "")
    // Remove special characters that might interfere
    .replace(/[^\w\s-]/g, "")
    .trim();
}

/**
 * Extracts domain from website URL
 * Examples:
 * - "https://www.google.com" -> "google.com"
 * - "http://google.com" -> "google.com"
 * - "google.com" -> "google.com"
 * - "www.google.com" -> "google.com"
 */
function extractDomainFromWebsite(website: string): string | null {
  if (!website || typeof website !== 'string') {
    return null;
  }

  let domain = website.trim();

  // Remove protocol (http://, https://)
  domain = domain.replace(/^https?:\/\//i, '');

  // Remove www. prefix
  domain = domain.replace(/^www\./i, '');

  // Remove path and query parameters
  domain = domain.split('/')[0];
  domain = domain.split('?')[0];
  domain = domain.split('#')[0];

  // Remove port if present
  domain = domain.split(':')[0];

  // Validate it looks like a domain
  if (domain && domain.includes('.') && domain.length > 0) {
    return domain.toLowerCase();
  }

  return null;
}



/**
 * Verifies if a logo URL is valid by checking if it returns an image
 * Note: Logo.dev may return a fallback monogram if logo not found, which is still valid
 */
async function verifyLogoUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JobQuest/1.0)",
        "Accept": "image/*",
      },
    });

    // Logo.dev returns 200 even with fallback monograms, so we check content-type
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      return contentType?.startsWith("image/") ?? false;
    }
    
    return false;
  } catch (error) {
    // If fetch fails, we still return the URL as Logo.dev CDN should work
    // The browser will handle the image loading
    console.warn("Could not verify logo URL, but will try to use it:", url);
    return true; // Return true to allow the URL to be used
  }
}

/**
 * Batch extract logos for multiple companies
 */
export async function extractLogosBatch(
  companyNames: string[]
): Promise<Record<string, LogoExtractionResult>> {
  const results: Record<string, LogoExtractionResult> = {};

  // Process in parallel with a limit to avoid overwhelming the APIs
  const batchSize = 5;
  for (let i = 0; i < companyNames.length; i += batchSize) {
    const batch = companyNames.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (name) => {
        const result = await extractCompanyLogo(name);
        return { name, result };
      })
    );

    batchResults.forEach(({ name, result }) => {
      results[name] = result;
    });

    // Small delay between batches to be respectful to APIs
    if (i + batchSize < companyNames.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}

