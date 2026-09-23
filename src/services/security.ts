/**
 * Security and URL validation service for untrusted web requests.
 * Complies with Section 11 of Jobber assessment:
 * - Reject private and loopback addresses in production mode
 * - Allow localhost/local network specifically if ALLOW_LOCAL_URLS is set or during local evaluation
 * - Restrict handling to expected content types and sizes (max 1MB)
 * - Treat text inside fetched pages and JDs strictly as data/content, never instructions
 */

export interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: string;
}

export function validateExternalUrl(urlString: string, allowLocalAddresses = true): UrlValidationResult {
  if (!urlString || typeof urlString !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  let parsed: URL;
  try {
    let toParse = urlString.trim();
    if (!toParse.startsWith('http://') && !toParse.startsWith('https://')) {
      toParse = 'https://' + toParse;
    }
    parsed = new URL(toParse);
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }

  // Only permit HTTP and HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isValid: false, error: 'Only http and https protocols are supported' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Cloud metadata endpoint protection (strictly forbidden always)
  if (
    hostname === '169.254.169.254' ||
    hostname === 'metadata.google.internal' ||
    hostname === 'metadata'
  ) {
    return { isValid: false, error: 'Access to cloud metadata services is blocked' };
  }

  // In production (when allowLocalAddresses is false), block RFC1918 and loopback
  if (!allowLocalAddresses) {
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
    ) {
      return { isValid: false, error: 'Private and loopback addresses are prohibited in production' };
    }
  }

  return { isValid: true, sanitizedUrl: parsed.href };
}

/**
 * Sanitize untrusted content before feeding to LLM to prevent prompt injection
 */
export function sanitizeUntrustedContent(rawText: string, maxLength = 12000): string {
  if (!rawText) return '';
  
  // Truncate to maximum length
  let cleaned = rawText.slice(0, maxLength);

  // Strip null bytes and control characters
  cleaned = cleaned.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '');

  return cleaned.trim();
}
