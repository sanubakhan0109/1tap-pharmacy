import { useEffect } from 'react';

const SITE_NAME = '1TAP Pharmacy';
const DEFAULT_DESCRIPTION =
  'Shop genuine healthcare, skincare and personal-care products from trusted brands at 1TAP Pharmacy. Free doorstep delivery and Cash on Delivery across India.';

function upsertMeta(selector, create) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

function setMetaName(name, content) {
  const el = upsertMeta(`meta[name="${name}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute('name', name);
    return m;
  });
  el.setAttribute('content', content);
}

function setMetaProperty(property, content) {
  const el = upsertMeta(`meta[property="${property}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute('property', property);
    return m;
  });
  el.setAttribute('content', content);
}

/**
 * Per-page SEO: title, description, canonical + OG/Twitter refresh.
 * Uses the runtime origin so no deployment domain is hard-coded.
 * Pass `noindex: true` for private pages (cart, checkout, account, admin).
 */
export function usePageMeta({ title, description, path, image, noindex = false }) {
  useEffect(() => {
    const desc = description || DEFAULT_DESCRIPTION;
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Genuine Healthcare & Skincare Online in India`;
    const origin = window.location.origin;
    const url = origin + (path || window.location.pathname);
    const img = image && image.startsWith('http') ? image : origin + (image || '/1tap-pharmacy-logo.png');

    document.title = fullTitle;
    setMetaName('description', desc);
    if (noindex) {
      setMetaName('robots', 'noindex, nofollow');
    } else {
      document.head.querySelector('meta[name="robots"]')?.remove();
    }

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    setMetaProperty('og:title', fullTitle);
    setMetaProperty('og:description', desc);
    setMetaProperty('og:url', url);
    setMetaProperty('og:image', img);
    setMetaName('twitter:title', fullTitle);
    setMetaName('twitter:description', desc);
    setMetaName('twitter:image', img);
  }, [title, description, path, image, noindex]);
}

export const SEO_DEFAULTS = { SITE_NAME, DEFAULT_DESCRIPTION };
