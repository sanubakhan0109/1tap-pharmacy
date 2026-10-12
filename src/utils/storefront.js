// Public customer storefront URL used by the standalone admin frontend's
// "Back to Store" links. This is a public https URL, not a secret.
// Override locally with VITE_STOREFRONT_URL if needed.
export const STOREFRONT_URL =
  import.meta.env.VITE_STOREFRONT_URL || 'https://onetap-pharmacy-1.onrender.com';
