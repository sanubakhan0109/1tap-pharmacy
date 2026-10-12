import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleChatRequest, isGeminiConfigured, isValidGeminiKeyFormat } from './server/chatHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for human-readable env file source paths
function shortSourceLabel(filePath) {
  return path.basename(path.dirname(filePath)) + '/' + path.basename(filePath);
}

// Load environment variables robustly.
// Priority: system env > .env.local > .env
// A VALID key always wins over a placeholder regardless of file ordering.
const envFilesHighestFirst = [
  path.join(__dirname, '.env.local'),
  path.join(__dirname, '.env'),
];

const loadedEnvFiles = [];
let geminiSource = process.env.GEMINI_API_KEY && isValidGeminiKeyFormat(process.env.GEMINI_API_KEY)
  ? 'system env'
  : (process.env.GEMINI_API_KEY ? 'system env (invalid)' : 'none');

for (const filePath of envFilesHighestFirst) {
  if (!fs.existsSync(filePath)) continue;
  try {
    const parsed = dotenv.parse(fs.readFileSync(filePath, 'utf8'));
    for (const [k, v] of Object.entries(parsed)) {
      if (k === 'GEMINI_API_KEY') {
        const current = process.env.GEMINI_API_KEY;
        if (current === undefined || current === '') {
          process.env.GEMINI_API_KEY = v;
          geminiSource = shortSourceLabel(filePath);
        } else if (!isValidGeminiKeyFormat(current) && isValidGeminiKeyFormat(v)) {
          process.env.GEMINI_API_KEY = v; // Upgrade placeholder -> real valid key
          geminiSource = shortSourceLabel(filePath);
        } else if (geminiSource === 'none') {
          geminiSource = shortSourceLabel(filePath);
        }
      } else if (process.env[k] === undefined) {
        process.env[k] = v;
      }
    }
    loadedEnvFiles.push(shortSourceLabel(filePath));
  } catch {
    loadedEnvFiles.push(path.basename(filePath) + ' (error)');
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '1mb' }));

// Minimal CORS for API routes (no extra dependency).
// The deployed static frontend calls this backend cross-origin, so browsers
// send an OPTIONS preflight for POST /api/chat. Without these headers the
// browser blocks the response even though the backend itself would succeed.
// Allowed origins are configurable via FRONTEND_ORIGINS (comma-separated).
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS ||
  'https://onetap-pharmacy-1.onrender.com,http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use('/api', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && FRONTEND_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const geminiStatus = isGeminiConfigured();
  res.json({
    status: 'ok',
    service: '1TAP Pharmacy AI Assistant',
    geminiConfigured: geminiStatus.configured,
    geminiReason: geminiStatus.reason,
    geminiSource,
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    timestamp: new Date().toISOString()
  });
});

// Dynamic sitemap.xml: public routes + live Active product URLs only.
// Private pages (admin, login, account, cart, checkout) are never listed.
// Host is derived from the request so no domain is hard-coded.
app.get('/sitemap.xml', async (req, res) => {
  try {
    const host = `${req.protocol}://${req.get('host')}`;
    const today = new Date().toISOString().slice(0, 10);
    const staticRoutes = [
      { path: '/', changefreq: 'daily', priority: '1.0' },
      { path: '/products', changefreq: 'daily', priority: '0.9' },
      { path: '/contact', changefreq: 'monthly', priority: '0.6' },
      { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
      { path: '/terms', changefreq: 'yearly', priority: '0.3' },
      { path: '/shipping', changefreq: 'yearly', priority: '0.4' },
    ];

    // Best-effort live product URLs (Active only); falls back to static list.
    let productPaths = [];
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
      const supabaseKey =
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';
      if (supabaseUrl.startsWith('http') && supabaseKey && !supabaseUrl.includes('your-project-id')) {
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
        const { data } = await sb.from('products').select('slug,id').eq('status', 'Active').limit(500);
        productPaths = (data || [])
          .map((p) => `/products/${p.slug || p.id}`)
          .filter(Boolean);
      }
    } catch {
      productPaths = [];
    }

    const urls = [...staticRoutes, ...productPaths.map((path) => ({ path, changefreq: 'weekly', priority: '0.7' }))]
      .map(
        (u) =>
          `  <url><loc>${host}${u.path}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
      )
      .join('\n');
    res.header('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
  } catch {
    res.status(500).send('Could not generate sitemap.');
  }
});

// AI Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  try {
    const result = await handleChatRequest(req.body, { clientIp });
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[1TAP Server Error]', err);
    res.status(500).json({
      success: false,
      error: 'An unexpected internal error occurred. Please try again later.'
    });
  }
});

// Serve frontend build if dist exists
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(404).send('1TAP Pharmacy Server running. Frontend not built.');
  });
});

// JSON body-parse error handler (must be last, after all routes).
// Without this, a malformed JSON body (e.g. from a manual curl probe with bad
// quoting, or a non-app client) falls through to Express's default HTML
// "Bad Request" page, which API clients cannot parse. This returns a clean
// JSON 400 instead. Safe: logs status/type only — never the raw body.
app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.parse.failed' || err.statusCode === 400) && req.path.startsWith('/api')) {
    console.warn('[1TAP Server] Rejected malformed JSON body:', {
      path: req.path,
      statusCode: 400,
      type: err.type || 'parse.failed',
    });
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON request body. Send valid JSON with Content-Type: application/json.',
    });
  }
  return next(err);
});

app.listen(PORT, () => {
  // Safe diagnostic logging: presence, reason, and source file only — never secrets.
  const geminiStatus = isGeminiConfigured();
  console.log(`💙 [1TAP Pharmacy Server] Running on http://localhost:${PORT}`);
  console.log(`📂 [Env files loaded] ${loadedEnvFiles.length > 0 ? loadedEnvFiles.join(', ') : '(none found)'}`);
  console.log(`🤖 [AI Model] Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'}`);
  console.log(`🔑 [Gemini API Key] ${geminiStatus.configured ? `Configured (source: ${geminiSource})` : `Not configured (${geminiStatus.reason}, source: ${geminiSource})`}`);
});
