/**
 * 1TAP Pharmacy — Chatbot Client Service
 * ---------------------------------------
 * Routes all user conversations directly through the Gemini AI backend endpoint (/api/chat).
 * Preserves multi-turn conversation memory and grounds product recommendations in the real catalog.
 */

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
 * Sends a message to the secure backend Gemini AI endpoint (/api/chat).
 * Passes multi-turn conversation history for contextual memory.
 */
export async function sendMessageToChatbot(text, history = [], fallbackCatalog = []) {
  try {
    const formattedHistory = (Array.isArray(history) ? history : [])
      .slice(-10)
      .filter((h) => h && h.text && typeof h.text === 'string')
      .map((h) => ({
        role: h.from === 'bot' ? 'assistant' : 'user',
        content: h.text
      }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: text,
        history: formattedHistory,
        catalog: fallbackCatalog
      })
    });

    const data = await response.json().catch(() => ({}));

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

    // Backend returned an error (e.g. unconfigured key, rate limit, API error)
    const errorMsg =
      data.reply ||
      data.error ||
      `⚠️ Gemini AI service error (${response.status}). Please check your server GEMINI_API_KEY configuration.`;

    return {
      text: errorMsg,
      products: [],
      error: true,
      suggestions: ['What is 1TAP?', 'Home Delivery & COD', 'How do I order?']
    };
  } catch (err) {
    console.error('[1TAP Chatbot] Network request to /api/chat failed:', err);
    return {
      text: '⚠️ Unable to connect to the 1TAP AI server. Please make sure the local dev server is running and try again.',
      products: [],
      error: true,
      suggestions: ['Home Delivery & COD', 'How do I order?']
    };
  }
}
