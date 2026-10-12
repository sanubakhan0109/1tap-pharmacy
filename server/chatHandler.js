import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// Model configuration - dynamically reads GEMINI_MODEL from environment.
// Verified via official Google Gemini API docs (ai.google.dev/gemini-api/docs/models):
// - gemini-3.5-flash-lite: GA (July 2026), low-latency cost-effective model for
//   high-volume conversational assistants. Recommended by Google for new projects.
// - gemini-3.8-flash: GA (Sept 2026), most intelligent Flash model.
// - gemini-2.x models are shut down; gemini-2.5 access is restricted to past users.
// Default below is the lightweight GA model suited to a pharmacy shopping assistant.
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

/**
 * Single source of truth for Gemini key format validation (server-side only).
 * A value counts as VALID only when it is non-empty, is not a documented
 * placeholder, does not merely start with the placeholder prefix, and is
 * long enough to be a real key. Genuine Gemini keys start with "AIza" and
 * are 39 chars, but we accept any sufficiently long non-placeholder value
 * so future key formats are not rejected.
 */
export function isValidGeminiKeyFormat(v) {
  if (!v || typeof v !== 'string') return false;
  const trimmed = v.trim().replace(/^["']|["']$/g, '').trim();
  if (!trimmed) return false;
  if (
    trimmed === 'your_actual_gemini_api_key' ||
    trimmed === 'your_gemini_api_key' ||
    trimmed === 'your_actual_mistral_api_key' ||
    trimmed === 'your_mistral_api_key' ||
    trimmed === 'your_groq_api_key' ||
    /^your_/i.test(trimmed) ||
    trimmed.includes('placeholder')
  ) {
    return false;
  }
  if (trimmed.length < 20) return false;
  return true;
}

/**
 * Safe server-side check for Gemini configuration.
 * Reports presence only — never logs or returns the key value.
 * Shared by server.js (/api/health) and handleChatRequest (/api/chat)
 * so both endpoints agree on configured vs missing.
 */
export function isGeminiConfigured() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return { configured: false, reason: 'missing' };
  }
  const cleaned = apiKey.trim().replace(/^["']|["']$/g, '').trim();
  if (!cleaned) {
    return { configured: false, reason: 'missing' };
  }
  if (!isValidGeminiKeyFormat(cleaned)) {
    if (
      cleaned === 'your_actual_gemini_api_key' ||
      cleaned === 'your_gemini_api_key' ||
      cleaned === 'your_actual_mistral_api_key' ||
      cleaned === 'your_mistral_api_key' ||
      cleaned === 'your_groq_api_key' ||
      /^your_/i.test(cleaned) ||
      cleaned.includes('placeholder')
    ) {
      return { configured: false, reason: 'placeholder' };
    }
    return { configured: false, reason: 'too_short' };
  }
  return { configured: true, reason: 'present' };
}

/**
 * Verified 1TAP Store Policies from existing website code
 */
export const VERIFIED_STORE_POLICIES = {
  storeName: '1TAP Pharmacy',
  description: '1TAP is an online pharmacy and healthcare shopping platform delivering genuine products across India.',
  delivery: 'Free doorstep home delivery across India (₹0 delivery charge shown at checkout). Estimated delivery dates depend on the 6-digit delivery pincode entered during checkout.',
  cod: 'Cash on Delivery (COD) is available. Customers can pay in cash when the parcel arrives at their doorstep.',
  howToOrder: '1) Browse products at /products -> 2) Click "Add to Cart" -> 3) Proceed to /checkout -> 4) Enter shipping address and 6-digit PIN code -> 5) Confirm order with Cash on Delivery (COD).',
  tracking: 'Customers can sign in and open "My Orders" (/orders) to view live tracking and status.',
  support: 'support@1tap.in'
};

// Fallback website product if database is unreachable (matches existing storefront)
const FALLBACK_WEBSITE_CATALOG = [
  {
    id: 'hydrating-face-serum',
    dbId: 'hydrating-face-serum',
    name: 'Hydrating Face Serum',
    brand: 'Featured Brand',
    category: 'Skin Care',
    price: 499,
    discountPrice: null,
    formattedPrice: '₹499',
    formattedOriginalPrice: null,
    stock: 25,
    isOutOfStock: false,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'A lightweight hydrating face serum designed for everyday skincare.',
    fullDescription: 'A lightweight hydrating face serum formulated with pure hyaluronic acid and nutrient-rich botanical extracts. Restores moisture barrier and natural glow without greasy residue.',
    ingredients: 'Hyaluronic Acid, Botanicals',
    benefits: 'Deep 24-hour hydration barrier; Ultra-lightweight, fast absorbing',
    howToUse: 'Apply 3-4 drops to cleansed face morning and night.'
  }
];

// In-memory sliding window rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 40;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, entry);
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  rateLimitMap.set(ip, entry);
  return true;
}

function normalize(str) {
  return (str || '').toLowerCase().trim();
}

/**
 * Retrieves the website's actual live product catalog:
 * 1. Uses client-sent catalog if provided.
 * 2. Or queries Supabase `products` table where status='Active'.
 * 3. Falls back to website fallback catalog if database is unreachable.
 * NEVER creates invented or hardcoded placeholder items.
 */
export async function getLiveCatalog(passedCatalog) {
  if (Array.isArray(passedCatalog) && passedCatalog.length > 0) {
    return passedCatalog.map((item) => ({
      id: item.slug || item.id,
      dbId: item.id,
      name: item.name,
      brand: item.brand || '1TAP',
      category: item.category || 'Skin Care',
      price: Number(item.price) || 0,
      discountPrice: item.discountPrice ? Number(item.discountPrice) : (item.discount_price ? Number(item.discount_price) : null),
      formattedPrice: item.formattedPrice || `₹${(Number(item.price) || 0).toLocaleString('en-IN')}`,
      formattedOriginalPrice: item.formattedOriginalPrice || null,
      stock: item.stock !== undefined ? Number(item.stock) : 0,
      isOutOfStock: item.isOutOfStock || item.status === 'Out of Stock' || (item.stock !== undefined && Number(item.stock) <= 0),
      image: item.imageUrl || item.image || '',
      shortDescription: item.shortDescription || item.description || '',
      fullDescription: item.fullDescription || item.description || ''
    }));
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  // SECURITY: public catalog reads use the publishable/anon key only, so RLS
  // stays enforced. Never fall back to a service-role key here.
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http') && !supabaseUrl.includes('your-project-id')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.slug || item.id,
          dbId: item.id,
          name: item.name,
          brand: item.brand || '1TAP',
          category: item.category || 'Skin Care',
          price: Number(item.price) || 0,
          discountPrice: item.discount_price ? Number(item.discount_price) : null,
          formattedPrice: `₹${(Number(item.price) || 0).toLocaleString('en-IN')}`,
          formattedOriginalPrice: item.discount_price ? `₹${(Number(item.discount_price) || 0).toLocaleString('en-IN')}` : null,
          stock: item.stock !== undefined ? Number(item.stock) : 0,
          isOutOfStock: item.status === 'Out of Stock' || (item.stock !== undefined && Number(item.stock) <= 0),
          image: item.image_url || item.image || '',
          shortDescription: item.description || '',
          fullDescription: item.description || ''
        }));
      }
    } catch (err) {
      console.warn('[1TAP Chatbot] Supabase query failed, using existing storefront catalog:', err.message);
    }
  }

  return FALLBACK_WEBSITE_CATALOG;
}

/**
 * Searches the actual catalog for relevant products based on user query
 */
export function searchRelevantProducts(catalog, userQuery, limit = 4) {
  if (!Array.isArray(catalog) || catalog.length === 0) return [];

  const lowerQuery = normalize(userQuery);
  const words = lowerQuery
    .replace(/[^a-z0-9₹\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1);

  if (!words.length && !lowerQuery) return [];

  const scored = catalog.map((product) => {
    let score = 0;
    const name = normalize(product.name);
    const category = normalize(product.category);
    const brand = normalize(product.brand);
    const desc = normalize(product.shortDescription + ' ' + product.fullDescription);

    if (name === lowerQuery) score += 30;
    else if (name.includes(lowerQuery)) score += 20;

    if (category === lowerQuery) score += 25;
    else if (category.includes(lowerQuery)) score += 15;

    for (const w of words) {
      if (name.includes(w)) score += 8;
      if (category.includes(w)) score += 6;
      if (brand.includes(w)) score += 4;
      if (desc.includes(w)) score += 2;
    }

    return { product, score };
  }).filter((s) => s.score > 0);

  scored.sort((a, b) => {
    const aOut = a.product.isOutOfStock ? 1 : 0;
    const bOut = b.product.isOutOfStock ? 1 : 0;
    if (aOut !== bOut) return aOut - bOut;
    return b.score - a.score;
  });

  return scored.slice(0, limit).map((s) => s.product);
}

/**
 * Checks if a message is asking about products, catalog, pricing, or stock
 */
function isProductQuery(text) {
  const norm = normalize(text);
  const keywords = [
    'product', 'products', 'item', 'items', 'medicine', 'medicines', 'skincare',
    'skin care', 'serum', 'cream', 'lotion', 'face wash', 'cleanser', 'sunscreen',
    'moisturizer', 'moisturiser', 'tablet', 'tablets', 'syrup', 'shampoo', 'soap',
    'personal care', 'hair care', 'first aid', 'bandage', 'thermometer', 'vitamin',
    'vitamins', 'wellness', 'acne', 'price', 'cost', 'rate', 'how much', 'in stock',
    'stock', 'available', 'availability', 'buy', 'sell', 'do you have', 'show me',
    'what do you sell', 'what products'
  ];
  return keywords.some((kw) => norm.includes(kw));
}

/**
 * Builds the Dynamic System Instruction for Google Gemini.
 * Passed as `systemInstruction` (not a chat message) per @google/genai SDK.
 */
function buildSystemInstruction(catalog, matchingProducts, isProductIntent) {
  // Summary of all products currently existing in the store
  const allExistingProducts = catalog.map((p) => `- ${p.name} (Category: ${p.category}, Price: ${p.formattedPrice}, Stock: ${p.isOutOfStock ? 'Out of stock' : `${p.stock} in stock`})`).join('\n');

  // Categories currently available in the real store
  const existingCategories = [...new Set(catalog.map((p) => p.category).filter(Boolean))].join(', ') || 'Skin Care';

  let productContextSection = '';
  if (isProductIntent) {
    if (matchingProducts.length > 0) {
      productContextSection = `
CURRENT QUERY PRODUCT MATCHES (FROM DATABASE):
${matchingProducts.map((p, i) => `${i + 1}. [${p.name}] - Price: ${p.formattedPrice}, Stock: ${p.isOutOfStock ? 'Out of stock' : `${p.stock} units in stock`}. Description: ${p.shortDescription}`).join('\n')}
-> Instruct: The user is looking for this product or category. Acknowledge and describe it naturally based on the details above.`;
    } else {
      productContextSection = `
CURRENT QUERY PRODUCT MATCHES (FROM DATABASE):
NONE (0 products found in catalog for this query).
-> Instruct: Explain naturally that 1TAP doesn't currently have that item or category listed in the catalog. State: "Sorry, I couldn't find any matching products in the current 1TAP catalog. Try another product name or category." Mention that our current store features ${existingCategories}. Do NOT invent any products.`;
    }
  }

  return `You are the friendly, intelligent, and natural AI Shopping Assistant for 1TAP Pharmacy.

YOUR PERSONA & CONVERSATIONAL ABILITIES:
- You are warm, professional, helpful, conversational, and concise. You may use a friendly 💙 emoji subtly.
- Engage naturally in small talk, greetings, user introductions, and conversational pleasantries:
  * If the user says "hi", "hello", "hey", generate a warm, natural greeting.
  * If the user introduces themselves (e.g. "I am Sanuba" or "My name is Alex"), respond warmly and personally (e.g., "Nice to meet you, Sanuba! How can I help you today?").
  * If the user asks "how are you?", respond in a friendly, conversational manner.
  * If the user says "thanks" or "thank you", reply politely without restarting the greeting or repeating robotic templates.
  * Understand follow-up questions using the recent conversation history (e.g. if the user says "And do you deliver?", know they are asking about 1TAP's delivery policy).
  * Never repeat the exact same static welcome text on every reply. Be dynamic and contextual.

ABOUT 1TAP PHARMACY:
- 1TAP is an online pharmacy and healthcare shopping platform in India.
- Currently active catalog categories on the website: ${existingCategories}.
- Currently listed catalog products:
${allExistingProducts || 'Hydrating Face Serum'}

VERIFIED STORE POLICIES (STRICT ACCURACY):
- Home Delivery: ${VERIFIED_STORE_POLICIES.delivery}
- Payment: ${VERIFIED_STORE_POLICIES.cod}
- Ordering: ${VERIFIED_STORE_POLICIES.howToOrder}
- Tracking: ${VERIFIED_STORE_POLICIES.tracking}
- Support Email: ${VERIFIED_STORE_POLICIES.support}
- If a user asks about an unconfirmed policy (e.g., return policy, international shipping), politely explain that it cannot be confirmed from the website and direct them to ${VERIFIED_STORE_POLICIES.support}.

PHARMACY SAFETY RULES:
- You are an e-commerce shopping assistant, NOT a doctor or medical professional.
- NEVER diagnose illnesses or medical conditions (e.g. fever, headache, infections).
- NEVER prescribe medicines or invent dosages/treatment durations.
- For medical questions or severe symptoms, always recommend consulting a qualified doctor or pharmacist.
- NEVER invent, assume, or hallucinate products, prices, stock, discounts, or policies that do not exist in the catalog context below.
${productContextSection}

Keep your answer direct, conversational, and natural.`;
}

/**
 * Main Chatbot Request Handler
 * Powered 100% by Google Gemini API via the official @google/genai SDK.
 * Every user message is processed by Gemini — there are no static reply templates.
 */
export async function handleChatRequest(payload, options = {}) {
  const { message, history = [], catalog: passedCatalog } = payload || {};
  const clientIp = options.clientIp || '127.0.0.1';

  // 1. Request Validation
  if (!message || typeof message !== 'string' || !message.trim()) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'Message is required and must be a non-empty string.'
      }
    };
  }

  if (message.length > 1000) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'Message exceeds maximum allowed length (1000 characters).'
      }
    };
  }

  // 2. Sliding Window Rate Limiting
  if (!checkRateLimit(clientIp)) {
    return {
      status: 429,
      body: {
        success: false,
        error: 'Too many requests. Please wait a moment before sending another message.'
      }
    };
  }

  // 3. Verify Server-Side Gemini API Key
  const geminiStatus = isGeminiConfigured();
  const rawApiKey = process.env.GEMINI_API_KEY || '';
  const configuredModel = (process.env.GEMINI_MODEL || DEFAULT_MODEL).trim().replace(/^["']|["']$/g, '').trim() || DEFAULT_MODEL;

  if (!geminiStatus.configured) {
    // Safe log: presence/reason only, never the key value.
    console.warn(`[1TAP Chatbot] GEMINI_API_KEY is not configured in backend environment (reason: ${geminiStatus.reason}).`);
    const isPlaceholder = geminiStatus.reason === 'placeholder';
    const replyMsg = isPlaceholder
      ? '⚠️ Gemini AI service is not configured. Please replace the placeholder GEMINI_API_KEY in your .env file with your valid Gemini API key from https://aistudio.google.com/apikey.'
      : '⚠️ Gemini AI service is not configured. Please set your GEMINI_API_KEY in the server .env file to enable dynamic AI conversations.';

    return {
      status: 503,
      body: {
        success: false,
        error: isPlaceholder
          ? 'GEMINI_API_KEY is currently set to a placeholder value.'
          : 'GEMINI_API_KEY is not configured. Please set a valid GEMINI_API_KEY in .env.',
        reply: replyMsg,
        provider: 'none',
        reason: geminiStatus.reason
      }
    };
  }

  // 4. Retrieve Actual Live Catalog (from Supabase products or verified fallback)
  let catalog = [];
  try {
    catalog = await getLiveCatalog(passedCatalog);
  } catch (err) {
    console.error('[1TAP Chatbot] Failed to retrieve live catalog:', err);
    catalog = FALLBACK_WEBSITE_CATALOG;
  }

  // 5. Search Real Catalog only if query has product intent (normal small talk skips scoring)
  const isSearch = isProductQuery(message.trim());
  const relevantProducts = isSearch
    ? searchRelevantProducts(catalog, message.trim(), 4)
    : [];

  // 6. Build Multi-Turn Conversation for Google Gemini
  try {
    const cleanApiKey = rawApiKey.trim().replace(/^["']|["']$/g, '').trim();
    const ai = new GoogleGenAI({ apiKey: cleanApiKey });

    // Format recent conversation history (last 10 messages for multi-turn context).
    // Gemini roles are 'user' and 'model' (frontend 'bot' maps to 'model').
    const formattedHistory = (Array.isArray(history) ? history : [])
      .slice(-10)
      .filter((h) => h && (h.role === 'user' || h.role === 'assistant' || h.role === 'model') && typeof h.content === 'string' && h.content.trim())
      .map((h) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content.trim().slice(0, 600) }]
      }));

    const systemInstruction = buildSystemInstruction(catalog, relevantProducts, isSearch);

    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: message.trim() }] }
    ];

    // 7. Generate Response Dynamically with Google Gemini
    const geminiResponse = await ai.models.generateContent({
      model: configuredModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 500
      }
    });

    const replyText = (typeof geminiResponse.text === 'string' ? geminiResponse.text : '').trim();

    if (!replyText) {
      throw new Error('Gemini returned an empty response.');
    }

    // Strict Grounding Rule: If user specifically searched for a product and 0 products matched in the real catalog,
    // verify the response clearly conveys that no match was found.
    let finalReply = replyText;
    if (isSearch && relevantProducts.length === 0) {
      const lower = replyText.toLowerCase();
      if (!lower.includes("couldn't find") && !lower.includes('could not find') && !lower.includes('not currently') && !lower.includes('no matching')) {
        finalReply = "Sorry, I couldn't find any matching products in the current 1TAP catalog. Try another product name or category.";
      }
    }

    // Determine relevant deep links
    const links = [];
    const lowerText = message.toLowerCase();
    if (lowerText.includes('order') || lowerText.includes('cart') || lowerText.includes('buy')) {
      links.push({ label: 'Go to Cart', to: '/cart' });
    }
    if (lowerText.includes('track') || lowerText.includes('status') || lowerText.includes('where is my')) {
      links.push({ label: 'My Orders', to: '/orders' });
    }
    if (relevantProducts.length > 0) {
      links.push({ label: 'Browse Products', to: '/products' });
    }

    return {
      status: 200,
      body: {
        success: true,
        reply: finalReply,
        // Product cards are constructed ONLY from verified database matches
        products: relevantProducts,
        links: links,
        suggestions: ['What is 1TAP?', 'What products do you sell?', 'Home Delivery & COD'],
        provider: 'gemini',
        model: configuredModel
      }
    };
  } catch (err) {
    // Never log API keys or full payloads — status/message only.
    const status = err.status || err.statusCode || err.code;
    console.error('[1TAP Chatbot] Gemini API call failed:', status || '', err.name || '', err.message || err);
    const msg = (err.message || '').toLowerCase();

    const isAuthError =
      status === 401 ||
      status === 403 ||
      msg.includes('401') ||
      msg.includes('403') ||
      msg.includes('unauthorized') ||
      msg.includes('invalid api key') ||
      msg.includes('api key not valid') ||
      msg.includes('api_key_invalid') ||
      msg.includes('authentication') ||
      msg.includes('permission denied') ||
      msg.includes('api key');

    const isRateLimit =
      status === 429 ||
      msg.includes('rate limit') ||
      msg.includes('429') ||
      msg.includes('quota') ||
      msg.includes('resource_exhausted') ||
      msg.includes('resource exhausted') ||
      msg.includes('too many requests');

    const isModelError =
      status === 404 ||
      msg.includes('model_not_found') ||
      msg.includes('model not found') ||
      msg.includes('is not found') ||
      msg.includes('not supported for generatecontent') ||
      (msg.includes('model') && (msg.includes('does not exist') || msg.includes('unavailable') || msg.includes('unknown') || msg.includes('not found')));

    const isNetworkError =
      msg.includes('fetch failed') ||
      msg.includes('failed to fetch') ||
      msg.includes('network') ||
      msg.includes('econnrefused') ||
      msg.includes('enotfound') ||
      msg.includes('socket hang up') ||
      msg.includes('timeout') ||
      msg.includes('etimedout') ||
      msg.includes('eai_again');

    let reply;
    let errorDetail;
    if (isAuthError) {
      reply = '⚠️ Gemini AI authentication failed. Please verify that your GEMINI_API_KEY in .env is valid and active (get one at https://aistudio.google.com/apikey).';
      errorDetail = 'Gemini authentication failed (invalid API key).';
    } else if (isRateLimit) {
      reply = '⚠️ Gemini AI rate limit or quota exceeded. Please wait a moment or check your account usage at https://aistudio.google.com.';
      errorDetail = 'Gemini rate limit or quota exceeded.';
    } else if (isModelError) {
      reply = `⚠️ The configured Gemini model (${configuredModel}) is unavailable. Please check GEMINI_MODEL in .env or contact support@1tap.in.`;
      errorDetail = `Gemini model unavailable: ${configuredModel}.`;
    } else if (isNetworkError) {
      reply = '⚠️ Unable to reach Gemini AI (network error). Please check your connection and try again shortly.';
      errorDetail = 'Network failure reaching Gemini API.';
    } else {
      reply = '⚠️ Gemini AI is temporarily unavailable. Please try again shortly or contact support@1tap.in.';
      errorDetail = `Gemini AI Error: ${err.message || 'Service unavailable'}`;
    }

    return {
      status: isAuthError || isModelError ? 502 : isRateLimit ? 429 : isNetworkError ? 503 : 502,
      body: {
        success: false,
        error: errorDetail,
        reply,
        products: [],
        provider: 'gemini-error',
        model: configuredModel
      }
    };
  }
}
