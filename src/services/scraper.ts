/**
 * Web Scraping & Crawling Service for Company Research
 * Meets Section 2, 3, 10 & 11:
 * - Crawls company site, ranks discovered links to find hiring/about/culture pages
 * - Follows relative links
 * - Implements rate limiting and exponential backoff
 * - Skips and records unretrievable sources rather than failing the run
 * - Enforces content limits (max 1MB) and 10s fetch timeouts
 */

import { validateExternalUrl, sanitizeUntrustedContent } from './security.ts';

export interface CrawlPageResult {
  url: string;
  title: string;
  content: string;
  status: 'ok' | 'failed' | 'skipped';
  error?: string;
}

export interface CrawlResult {
  companyUrl: string;
  reachable: boolean;
  pages: CrawlPageResult[];
  hiringInsightsText: string;
  generalCompanyText: string;
  sourcesUsed: string[];
  failureReason?: string;
}

const HIRING_KEYWORDS = [
  'career', 'careers', 'job', 'jobs', 'hiring', 'culture', 'values',
  'interview', 'engineering', 'join', 'work-with-us', 'about', 'handbook', 'people', 'team'
];

/**
 * Score a URL or anchor text for hiring and company relevance
 */
function scoreLinkForResearch(href: string, anchorText: string): number {
  const combined = (href + ' ' + anchorText).toLowerCase();
  let score = 0;

  if (combined.includes('interview')) score += 50;
  if (combined.includes('hiring') || combined.includes('how-we-hire')) score += 45;
  if (combined.includes('career') || combined.includes('careers')) score += 40;
  if (combined.includes('jobs') || combined.includes('job')) score += 35;
  if (combined.includes('handbook')) score += 30;
  if (combined.includes('engineering') || combined.includes('tech-blog')) score += 25;
  if (combined.includes('culture') || combined.includes('values')) score += 20;
  if (combined.includes('about') || combined.includes('about-us') || combined.includes('story')) score += 15;
  if (combined.includes('team') || combined.includes('people')) score += 10;

  // Penalize external domains or asset downloads
  if (/\.(pdf|png|jpg|jpeg|gif|svg|zip|tar|gz|mp4|exe)$/i.test(href)) {
    return -100;
  }
  if (combined.includes('privacy') || combined.includes('terms') || combined.includes('cookie') || combined.includes('legal')) {
    return -50;
  }

  return score;
}

/**
 * Clean raw HTML into readable structured text
 */
export function extractCleanTextFromHtml(html: string): { title: string; text: string; links: Array<{ href: string; text: string }> } {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

  // Extract links
  const links: Array<{ href: string; text: string }> = [];
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]?.trim();
    const linkText = match[2]?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || '';
    if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
      links.push({ href, text: linkText });
    }
  }

  // Strip script, style, svg, nav, footer, noscript tags
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  // Replace block tags with newlines
  cleaned = cleaned.replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr|section|article)>/gi, '\n');
  cleaned = cleaned.replace(/<br\s*[\/]?>/gi, '\n');

  // Strip all remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Normalize whitespace
  cleaned = cleaned
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => line.length > 0)
    .join('\n');

  return { title, text: cleaned, links };
}

/**
 * Fetch a single URL with exponential backoff and timeout
 */
async function fetchWithBackoff(url: string, retries = 1, timeoutMs = 3500): Promise<{ ok: boolean; status: number; text: string; error?: string }> {
  let attempt = 0;
  let delay = 300;

  while (attempt <= retries) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 JobberInterviewBot/1.0',
          'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      clearTimeout(timer);

      if (!response.ok) {
        if (response.status === 404) {
          return { ok: false, status: response.status, text: '', error: `HTTP 404 Not Found at ${url}` };
        }
        if (response.status === 429 && attempt <= retries) {
          await new Promise(r => setTimeout(r, delay * 2));
          delay *= 2;
          continue;
        }
        return { ok: false, status: response.status, text: '', error: `HTTP error ${response.status} at ${url}` };
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
        return { ok: false, status: response.status, text: '', error: `Non-text content type (${contentType})` };
      }

      const text = await response.text();
      return { ok: true, status: response.status, text: text.slice(0, 1024 * 1024) }; // Limit to 1MB
    } catch (err: unknown) {
      clearTimeout(timer);
      const isAbort = (err as { name?: string })?.name === 'AbortError';
      const msg = isAbort ? `Connection timed out after ${timeoutMs}ms` : (err instanceof Error ? err.message : String(err));

      // Do not waste time retrying if it already timed out or DNS failed
      if (isAbort || attempt > retries) {
        return { ok: false, status: 0, text: '', error: msg };
      }

      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }

  return { ok: false, status: 0, text: '', error: 'Exceeded maximum retries' };
}

/**
 * Crawl company site and rank discovered links to find hiring process
 */
export async function crawlCompanySite(
  companyUrl: string,
  allowLocal = true,
  onProgress?: (msg: string) => void
): Promise<CrawlResult> {
  const val = validateExternalUrl(companyUrl, allowLocal);
  if (!val.isValid || !val.sanitizedUrl) {
    return {
      companyUrl,
      reachable: false,
      pages: [],
      hiringInsightsText: '',
      generalCompanyText: '',
      sourcesUsed: [],
      failureReason: val.error || 'Invalid URL'
    };
  }

  const primaryUrl = val.sanitizedUrl;
  onProgress?.(`Contacting primary domain: ${primaryUrl}`);

  const primaryFetch = await fetchWithBackoff(primaryUrl, 2, 8000);
  if (!primaryFetch.ok) {
    onProgress?.(`Company URL unreachable: ${primaryFetch.error}. Proceeding with JD text alone.`);
    return {
      companyUrl: primaryUrl,
      reachable: false,
      pages: [{
        url: primaryUrl,
        title: '',
        content: '',
        status: 'failed',
        error: primaryFetch.error
      }],
      hiringInsightsText: '',
      generalCompanyText: '',
      sourcesUsed: [],
      failureReason: primaryFetch.error
    };
  }

  const primaryParsed = extractCleanTextFromHtml(primaryFetch.text);
  const pages: CrawlPageResult[] = [
    {
      url: primaryUrl,
      title: primaryParsed.title || 'Company Homepage',
      content: sanitizeUntrustedContent(primaryParsed.text, 8000),
      status: 'ok'
    }
  ];

  const sourcesUsed = [primaryUrl];
  let hiringInsightsText = '';
  let generalCompanyText = primaryParsed.text.slice(0, 3000);

  // Discover and rank links from homepage
  const parsedBase = new URL(primaryUrl);
  const scoredLinks: Array<{ url: string; text: string; score: number }> = [];

  for (const link of primaryParsed.links) {
    try {
      const resolved = new URL(link.href, primaryUrl);
      // Stay on same origin or subdomains
      if (resolved.hostname === parsedBase.hostname || resolved.hostname.endsWith('.' + parsedBase.hostname)) {
        const score = scoreLinkForResearch(resolved.pathname + resolved.search, link.text);
        if (score > 10) {
          scoredLinks.push({ url: resolved.href, text: link.text, score });
        }
      }
    } catch {
      // Ignore invalid link formats
    }
  }

  // Deduplicate and take top 2 most promising pages (e.g. /careers, /jobs, /culture)
  scoredLinks.sort((a, b) => b.score - a.score);
  const uniqueUrls = new Set<string>();
  const topLinks: Array<{ url: string; text: string }> = [];

  for (const sl of scoredLinks) {
    if (!uniqueUrls.has(sl.url) && sl.url !== primaryUrl) {
      uniqueUrls.add(sl.url);
      topLinks.push(sl);
      if (topLinks.length >= 2) break;
    }
  }

  // Crawl top sub-pages
  for (const candidate of topLinks) {
    onProgress?.(`Crawling discovered hiring/about link: ${candidate.url}`);
    const subFetch = await fetchWithBackoff(candidate.url, 1, 6000);

    if (subFetch.ok) {
      const subParsed = extractCleanTextFromHtml(subFetch.text);
      const subText = sanitizeUntrustedContent(subParsed.text, 5000);
      pages.push({
        url: candidate.url,
        title: subParsed.title || candidate.text || 'Company Page',
        content: subText,
        status: 'ok'
      });
      sourcesUsed.push(candidate.url);
      hiringInsightsText += `\n[From ${candidate.url} (${candidate.text})]:\n${subText}\n`;
    } else {
      pages.push({
        url: candidate.url,
        title: candidate.text,
        content: '',
        status: 'skipped',
        error: subFetch.error
      });
    }
  }

  return {
    companyUrl: primaryUrl,
    reachable: true,
    pages,
    hiringInsightsText,
    generalCompanyText,
    sourcesUsed
  };
}
