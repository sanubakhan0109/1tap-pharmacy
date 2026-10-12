import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User as UserIcon,
  ShoppingBag,
  Eye,
  Loader2,
  Sparkles,
  Pill,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';
import { fetchPublicProducts } from '../../services/productService';
import { sendMessageToChatbot, QUICK_SUGGESTIONS } from '../../services/chatbotService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

function formatTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
}

function ProductMiniCard({ product, onView, onAdd }) {
  const out = product.isOutOfStock || product.status === 'Out of Stock' || Number(product.stock) <= 0;
  const id = product.slug || product.id;
  const img = product.imageUrl || product.image;

  return (
    <div className="flex gap-3 rounded-xl border border-sky-100 bg-white p-2.5 shadow-xs transition hover:border-sky-200 hover:shadow-sm">
      <img
        src={img}
        alt={product.name}
        className={`h-16 w-16 shrink-0 rounded-lg border border-slate-100 object-cover bg-slate-50 ${
          out ? 'opacity-65 grayscale-40' : ''
        }`}
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';
        }}
      />
      <div className="min-w-0 flex-1 flex flex-col justify-between">
        <div>
          <p className="truncate text-xs font-bold text-slate-900 leading-snug" title={product.name}>
            {product.name}
          </p>
          <p className="truncate text-[11px] text-slate-500">
            {product.category}{product.brand ? ` • ${product.brand}` : ''}
          </p>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-black text-[#0b3b6f]">
              {product.formattedPrice || `₹${product.price}`}
            </span>
            {product.discountPrice && (
              <span className="text-[10px] text-slate-400 line-through">
                {product.formattedOriginalPrice || `₹${product.discountPrice}`}
              </span>
            )}
            {out ? (
              <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 border border-rose-200">
                Out of stock
              </span>
            ) : (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                In stock
              </span>
            )}
          </div>
        </div>
        <div className="mt-2 flex gap-1.5">
          <button
            type="button"
            onClick={() => onView(id)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Eye className="h-3 w-3 text-slate-500" /> View
          </button>
          {!out && (
            <button
              type="button"
              onClick={() => onAdd(product)}
              className="inline-flex items-center gap-1 rounded-lg bg-[#0b3b6f] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#07284b] transition cursor-pointer shadow-xs"
            >
              <ShoppingBag className="h-3 w-3" /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

let msgId = 0;
const nid = () => `m${Date.now()}_${msgId++}`;

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [catalogState, setCatalogState] = useState('idle'); // idle | loading | ready
  const [messages, setMessages] = useState([
    {
      id: nid(),
      from: 'bot',
      text: "Hey! Welcome to 1TAP Pharmacy 💙 How can I help you today? You can ask me about medicines, healthcare essentials, skincare, personal care, or home delivery.",
      time: formatTimestamp(),
      suggestions: [
        'What is 1TAP?',
        'What products do you sell?',
        'Home Delivery & COD',
        'How do I order?'
      ]
    }
  ]);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Lazy load live product catalog upon first open
  useEffect(() => {
    if (!open || catalogState !== 'idle') return;
    let mounted = true;
    setCatalogState('loading');
    fetchPublicProducts()
      .then((data) => {
        if (mounted) {
          setCatalog(data || []);
          setCatalogState('ready');
        }
      })
      .catch(() => {
        if (mounted) setCatalogState('ready');
      });
    return () => {
      mounted = false;
    };
  }, [open, catalogState]);

  // Auto-scroll on new messages or typing state
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, open, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const pushBot = (reply) => {
    setMessages((prev) => [
      ...prev,
      {
        id: nid(),
        from: 'bot',
        time: formatTimestamp(),
        ...reply
      }
    ]);
  };

  const handleSend = async (customText) => {
    const text = (customText ?? input).trim();
    if (!text || typing) return;

    const userMsg = {
      id: nid(),
      from: 'user',
      text,
      time: formatTimestamp()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const reply = await sendMessageToChatbot(text, [...messages, userMsg], catalog);
      setTyping(false);
      pushBot(reply);
    } catch (err) {
      setTyping(false);
      pushBot({
        text: "I encountered an issue connecting to the assistant. 1TAP customer care is available at support@1tap.in, or you can explore products directly at /products.",
        suggestions: ['Find Medicines', 'Explore Skincare', 'Home Delivery & COD']
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleView = (id) => {
    setOpen(false);
    navigate(`/products/${id}`);
  };

  const handleAdd = (product) => {
    addToCart(
      {
        ...product,
        image: product.imageUrl || product.image
      },
      1
    );
    showToast(`Added ${product.name} to cart!`, 'success');
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: nid(),
        from: 'bot',
        text: "Hey! Welcome to 1TAP Pharmacy 💙 How can I help you today? You can ask me about medicines, healthcare essentials, skincare, personal care, or home delivery.",
        time: formatTimestamp(),
        suggestions: [
          'What is 1TAP?',
          'What products do you sell?',
          'Home Delivery & COD',
          'How do I order?'
        ]
      }
    ]);
  };

  return (
    <>
      {/* ================= Floating Chatbot Launcher ================= */}
      <button
        type="button"
        id="chatbot-toggle"
        aria-label={open ? 'Close 1TAP assistant' : 'Open 1TAP assistant'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#07284b] via-[#0b3b6f] to-[#14539a] p-3.5 text-white shadow-xl shadow-[#0b3b6f]/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-white"
        style={{ height: 56, width: 56 }}
      >
        {open ? (
          <X className="h-6 w-6 transition-transform duration-150 rotate-0" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white" />
            </span>
          </div>
        )}
      </button>

      {/* ================= Chat Panel ================= */}
      {open && (
        <section
          id="chatbot-panel"
          aria-label="1TAP shopping assistant"
          className="fixed bottom-20 right-3 sm:bottom-24 sm:right-6 z-50 flex w-[calc(100vw-1.5rem)] sm:w-[390px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200"
          style={{ height: 590, maxHeight: '82vh' }}
        >
          {/* Header */}
          <header className="flex items-center gap-2.5 bg-gradient-to-r from-[#07284b] to-[#0b3b6f] px-4 py-3 text-white shrink-0 shadow-xs">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 border border-white/20 shadow-inner">
              <Pill className="h-4.5 w-4.5 text-sky-200" style={{ height: 18, width: 18 }} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold leading-tight">1TAP Assistant</p>
                <span className="rounded-full bg-sky-400/20 px-1.5 py-0.2 text-[9px] font-semibold text-sky-200 border border-sky-300/30">
                  AI
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-[11px] text-sky-100/90 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {catalogState === 'loading'
                  ? 'Connecting live catalog…'
                  : 'Online • Real pharmacy catalog'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Restart conversation"
                aria-label="Restart conversation"
                onClick={handleResetChat}
                className="rounded-lg p-1.5 text-sky-200 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-sky-200 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" style={{ height: 18, width: 18 }} />
              </button>
            </div>
          </header>

          {/* Quick Category Bar Banner */}
          <div className="flex items-center justify-between border-b border-sky-100 bg-[#eef4ff]/70 px-3.5 py-1.5 text-[11px] font-medium text-[#0b3b6f] shrink-0">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              100% Genuine Pharmacy Products
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <Truck className="h-3 w-3 text-sky-700" />
              Free Delivery & COD
            </span>
          </div>

          {/* Messages Feed */}
          <div
            className="flex-1 overflow-y-auto bg-[#fafaf9] px-3.5 py-3 space-y-3"
            role="log"
            aria-live="polite"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.from === 'bot' && (
                  <span className="mt-1 flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-[#0b3b6f] text-white shadow-2xs">
                    <Bot style={{ height: 14, width: 14 }} />
                  </span>
                )}
                <div
                  className={`max-w-[85%] space-y-1.5 ${
                    m.from === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-2xs ${
                      m.from === 'user'
                        ? 'bg-[#0b3b6f] text-white rounded-br-xs'
                        : m.error
                        ? 'border border-amber-300 bg-amber-50/90 text-amber-900 rounded-bl-xs'
                        : 'border border-slate-200/90 bg-white text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Message timestamp */}
                  {m.time && (
                    <p
                      className={`text-[10px] text-slate-400 px-1 ${
                        m.from === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {m.time}
                    </p>
                  )}

                  {/* Product cards with real catalog data */}
                  {m.products && m.products.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-[#0b3b6f]" /> Matching Pharmacy Catalog:
                      </p>
                      {m.products.map((p) => (
                        <ProductMiniCard
                          key={p.id || p.dbId}
                          product={p}
                          onView={handleView}
                          onAdd={handleAdd}
                        />
                      ))}
                    </div>
                  )}

                  {/* Deep links */}
                  {m.links && m.links.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.links.map((l) => (
                        <Link
                          key={l.to}
                          to={l.to}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-[#0b3b6f] hover:bg-sky-100 transition shadow-2xs"
                        >
                          {l.label} →
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Quick suggestion buttons */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleSend(s)}
                          className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#0b3b6f] hover:text-[#0b3b6f] hover:bg-sky-50/50 transition cursor-pointer shadow-2xs"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.from === 'user' && (
                  <span className="mt-1 flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                    <UserIcon style={{ height: 14, width: 14 }} />
                  </span>
                )}
              </div>
            ))}

            {typing && (
              <div className="flex gap-2 items-center">
                <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-[#0b3b6f] text-white">
                  <Bot style={{ height: 14, width: 14 }} />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-xs border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-500 shadow-2xs">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0b3b6f]" /> 1TAP Assistant is thinking…
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Safety Notice & Input Form */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-3 pt-2 pb-2.5">
            <p className="flex items-center gap-1 pb-1.5 text-[10px] text-slate-400 font-medium leading-tight">
              <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
              Shopping assistant only. Not medical advice — consult a doctor or pharmacist.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={textareaRef}
                id="chatbot-input"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about medicines, skincare, COD, or delivery…"
                aria-label="Message 1TAP assistant"
                className="min-w-0 flex-1 resize-none max-h-24 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-[13px] text-slate-900 placeholder-slate-400 outline-none focus:border-[#0b3b6f] focus:bg-white focus:ring-2 focus:ring-[#0b3b6f]/15 transition"
              />
              <button
                type="submit"
                id="chatbot-send"
                aria-label="Send message"
                disabled={!input.trim() || typing}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0b3b6f] text-white transition hover:bg-[#07284b] active:scale-95 disabled:opacity-40 cursor-pointer shadow-xs"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}
