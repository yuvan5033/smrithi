import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  noIndex?: boolean;
}

/**
 * Sets per-page SEO meta tags dynamically for SPA routing.
 * Updates document title, meta description, canonical URL, and Open Graph tags.
 */
export function useSEO({ title, description, canonical, ogTitle, ogDescription, noIndex = false }: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (metaDesc) {
      metaDesc.content = description;
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      metaDesc.content = description;
      document.head.appendChild(metaDesc);
    }

    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (link) {
        link.href = canonical;
      } else {
        link = document.createElement('link');
        link.rel = 'canonical';
        link.href = canonical;
        document.head.appendChild(link);
      }
    }

    // OG Title
    const ogTitleContent = ogTitle || title;
    let metaOgTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (metaOgTitle) {
      metaOgTitle.content = ogTitleContent;
    }

    // OG Description
    const ogDescContent = ogDescription || description;
    let metaOgDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
    if (metaOgDesc) {
      metaOgDesc.content = ogDescContent;
    }

    // OG URL
    if (canonical) {
      let metaOgUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
      if (metaOgUrl) {
        metaOgUrl.content = canonical;
      }
    }

    // Twitter title & description
    let twitterTitle = document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement;
    if (twitterTitle) {
      twitterTitle.content = ogTitleContent;
    }
    let twitterDesc = document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement;
    if (twitterDesc) {
      twitterDesc.content = ogDescContent;
    }

    // Robots
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (robotsMeta) {
      robotsMeta.content = noIndex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    }
  }, [title, description, canonical, ogTitle, ogDescription, noIndex]);
}
