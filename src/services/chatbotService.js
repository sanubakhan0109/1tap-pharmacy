/**
 * 1TAP Pharmacy — Chatbot Client Service
 * ---------------------------------------
 * Routes all user conversations through the Gemini AI backend endpoint
 * (POST {backend}/api/chat). The backend base URL is resolved as:
 *   1. VITE_BACKEND_URL env var (e.g. local or staging backend), or
 *   2. relative "/api/chat" in local dev (Vite proxies /api to localhost:5000), or
 *   3. the deployed production backend by default.
 * No API keys ever live in frontend code — the browser only needs the URL.
 */
const PROD_BACKEND_URL = 'https://onetap-pharmacy.onrender.com';

function resolveChatEndpoint() {
  const configured = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');
  if (configured) return `${configured}/api/chat`;
  // import.meta.env.DEV is true for `vite dev` (proxy handles /api); false in builds.
  if (import.meta.env.DEV) return '/api/chat';
  return `${PROD_BACKEND_URL}/api/chat`;
}

const CHAT_ENDPOINT = resolveChatEndpoint();

// Safe diagnostic helper: logs only non-sensitive metadata (host, HTTP status,
// content type). Never logs request/response bodies or credentials.
function endpointHost() {
  try {
    return new URL(CHAT_ENDPOINT, window.location.href).host;
  } catch {
    return '(unparseable endpoint)';
  }
}

export const STORE_FACTS = {
  name: '1TAP Pharmacy',
  whatWeSell: 'Genuine healthcare products, skincare essentials, personal care, and medicines.',
  delivery: 'Free doorstep home delivery across India (₹0 delivery charge shown at checkout).',
  cod: 'Cash on Delivery (COD) is available. Customers pay in cash when the parcel arrives.',
  supportEmail: 'support@1tap.in'
};

export const QUICK_SUGGESTIONS = [
  'What is 1TAP?',
  'What products do you sell?',
  'Home Delivery & COD',
  'How do I order?'
];

/**
 * Sends a message to the secure backend Gemini AI endpoint (POST {backend}/api/chat).
 * Passes multi-turn conversation history for contextual memory.
 */
export async function sendMessageToChatbot(text, history = [], fallbackCatalog = []) {
  // Validate before touching the network: only a non-empty string is ever
  // serialised. JSON.stringify of this payload is always syntactically valid
  // JSON, so the backend body-parser can never reject it as malformed.
  if (typeof text !== 'string' || !text.trim()) {
    return {
      text: '⚠️ Please type a message before sending.',
      products: [],
      error: true,
      suggestions: ['What is 1TAP?', 'Home Delivery & COD', 'How do I order?']
    };
  }

  let requestBody;
  try {
    const formattedHistory = (Array.isArray(history) ? history : [])
      .slice(-10)
      .filter((h) => h && h.text && typeof h.text === 'string')
      .map((h) => ({
        role: h.from === 'bot' ? 'assistant' : 'user',
        content: h.text
      }));

    requestBody = JSON.stringify({
      message: text,
      history: formattedHistory,
      catalog: fallbackCatalog
    });
  } catch (err) {
    console.error('[1TAP Chatbot] Could not serialise chat payload:', err);
    return {
      text: '⚠️ Unable to prepare your message. Please try again shortly.',
      products: [],
      error: true,
      suggestions: ['Home Delivery & COD', 'How do I order?']
    };
  }

  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestBody
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json().catch(() => ({})) : {};

    // Safe diagnostics: HTTP metadata only, never bodies or credentials.
    console.debug('[1TAP Chatbot] chat endpoint answered:', {
      host: endpointHost(),
      status: response.status,
      ok: response.ok,
      contentType: contentType.split(';')[0] || '(none)',
      hasSuccessFlag: Boolean(data && data.success),
    });

    if (response.ok && data.success) {
      return {
        text: data.reply,
        products: data.products || [],
        links: data.links || [],
        suggestions: data.suggestions || QUICK_SUGGESTIONS,
        provider: data.provider || 'gemini',
        model: data.model
      };
    }

    // Backend returned an error (e.g. unconfigured key, rate limit, API error).
    // Report exactly what the backend said; only fall back to a generic message
    // when the backend gave no usable JSON (e.g. a static host serving a
    // non-API response) — never blame the API key without evidence.
    const errorMsg =
      data.reply ||
      data.error ||
      (isJson
        ? `⚠️ Gemini AI service error (${response.status}). Please try again shortly or contact support@1tap.in.`
        : `⚠️ Unexpected response from the 1TAP AI server (HTTP ${response.status}). The chatbot backend may be unreachable — please try again shortly.`);

    // Safe diagnostics: metadata only, never response bodies.
    console.warn('[1TAP Chatbot] chat request did not succeed:', {
      host: endpointHost(),
      status: response.status,
      ok: response.ok,
      contentType: contentType.split(';')[0] || '(none)',
      backendSaid: Boolean(data.reply || data.error),
    });

    return {
      text: errorMsg,
      products: [],
      error: true,
      suggestions: ['What is 1TAP?', 'Home Delivery & COD', 'How do I order?']
    };
  } catch (err) {
    console.error('[1TAP Chatbot] Network request to chatbot backend failed:', CHAT_ENDPOINT, err);
    return {
      text: import.meta.env.DEV
        ? '⚠️ Unable to connect to the 1TAP AI server. Please make sure the local dev server is running and try again.'
        : '⚠️ Unable to reach the 1TAP AI server. Please check your connection and try again shortly.',
      products: [],
      error: true,
      suggestions: ['Home Delivery & COD', 'How do I order?']
    };
  }
}
