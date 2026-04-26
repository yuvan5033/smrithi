import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

// ─── Types ───────────────────────────────────────────────────────────────────

type Spread = { name: string; url: string };

type OrderData = {
  orderId: string;
  metadata: {
    dest?: string;
    dates?: string;
    email?: string;
    mobile?: string;
    meaning?: string;
    [key: string]: any;
  };
  spreads: Spread[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract the leading integer from a spread filename, e.g. "spread_1_CMYK_READY_300DPI" → 1 */
function spreadIndex(name: string): number {
  const m = name.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

/** Sort spreads numerically by the number embedded in their name */
function sortSpreads(spreads: Spread[]): Spread[] {
  return [...spreads].sort((a, b) => spreadIndex(a.name) - spreadIndex(b.name));
}

// ─── Razorpay Loader ─────────────────────────────────────────────────────────

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';
const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function PreviewClient() {
  const navigate = useNavigate();

  useSEO({
    title: 'Preview Your Edition | Smrithi Atelier',
    description: 'View your curated archival travel photo book preview. Enter your access code to see the digital layout of your bound edition before printing.',
    canonical: 'https://smrithi.online/preview',
  });

  const [accessCode, setAccessCode] = useState('');
  const [viewState, setViewState] = useState<'gate' | 'loading' | 'preview'>('gate');
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Touch/swipe refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  useEffect(() => {
    if (viewState !== 'preview') return;
    const t = setTimeout(() => setShowPayment(true), 4000);
    return () => clearTimeout(t);
  }, [viewState]);

  // Reset image loaded state when spread changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentSpread]);

  // ─── Fetch ─────────────────────────────────────────────────────────────────

  const handleFetch = async () => {
    const code = accessCode.trim().toUpperCase();
    if (!code || code.length < 6) {
      setError('Please enter your 6-character access code.');
      return;
    }
    setError(null);
    setViewState('loading');

    try {
      const res = await fetch(`${API_BASE}/api/preview/${code}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Invalid access code.');
      }
      const data: OrderData = await res.json();

      // Sort spreads by number in filename so spread_1 always comes first
      data.spreads = sortSpreads(data.spreads);

      setOrderData(data);
      setCurrentSpread(0);
      setViewState('preview');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setViewState('gate');
    }
  };

  // ─── Navigation ────────────────────────────────────────────────────────────

  const goNext = useCallback(() => {
    if (!orderData || currentSpread >= orderData.spreads.length - 1) return;
    setDirection(1);
    setCurrentSpread((s) => s + 1);
  }, [currentSpread, orderData]);

  const goPrev = useCallback(() => {
    if (currentSpread <= 0) return;
    setDirection(-1);
    setCurrentSpread((s) => s - 1);
  }, [currentSpread]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (viewState !== 'preview') return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [viewState, goNext, goPrev]);

  // Touch/swipe handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;

    // Only trigger if horizontal swipe is dominant and significant enough
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev]);

  // ─── Payment ───────────────────────────────────────────────────────────────

  const handlePayment = async () => {
    if (!orderData) return;
    setIsProcessingPayment(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Failed to load payment gateway. Please check your connection.');
      setIsProcessingPayment(false);
      return;
    }

    try {
      const orderRes = await fetch(`${API_BASE}/api/create-order`, { method: 'POST' });
      const razorpayOrder = await orderRes.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Smrithi Atelier',
        description: `Archival Edition — ${orderData.metadata.dest || 'Your Journey'}`,
        order_id: razorpayOrder.id,
        prefill: {
          email: orderData.metadata.email || '',
          contact: orderData.metadata.mobile || '',
        },
        theme: { color: '#4E3420' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.orderId,
                customer_email: orderData.metadata.email,
              }),
            });
            const result = await verifyRes.json();
            if (result.success) {
              navigate('/success');
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch {
            alert('Verification error. Please contact support.');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessingPayment(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      alert('Could not initiate payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  // ─── Render: Gate / Loading ─────────────────────────────────────────────────

  if (viewState === 'gate' || viewState === 'loading') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 sm:px-8 bg-[#fdfaf5]">
        {/* Decorative background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-25">
          <svg className="absolute right-[-20%] top-[-10%] w-[80%] h-auto stroke-[var(--border)]" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" strokeWidth="0.15" />
            <circle cx="60" cy="40" r="30" strokeWidth="0.15" />
            <circle cx="45" cy="55" r="45" strokeWidth="0.15" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: EASE }}
          className="w-full max-w-[420px] flex flex-col items-center text-center"
        >
          <div className="text-[0.65rem] tracking-[0.2em] font-light uppercase font-jost text-[var(--ink-80)] mb-10 sm:mb-12">
            — smrithi atelier
          </div>

          <h1 className="font-cormorant text-[clamp(2rem,5vw,3.5rem)] font-light text-[var(--ink)] leading-[1.1] mb-4">
            Your edition<br />
            <em className="italic text-[var(--sienna)]">awaits.</em>
          </h1>
          <p className="font-jost text-[0.85rem] text-[var(--ink-60)] leading-relaxed mb-10 sm:mb-12 max-w-[320px]">
            Enter the access code we sent you to view your curated book preview.
          </p>

          <div className="w-full flex flex-col gap-4">
            <input
              type="text"
              maxLength={8}
              placeholder="Access Code"
              autoFocus
              autoCapitalize="characters"
              value={accessCode}
              onChange={(e) => {
                setAccessCode(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              className="bg-transparent border-0 border-b border-[var(--border)] py-3 text-[1.6rem] tracking-[0.4em] text-[var(--ink)] text-center outline-none font-cormorant w-full focus:border-[var(--sienna)] transition-colors"
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[0.78rem] text-red-500 font-jost"
              >
                {error}
              </motion.p>
            )}

            <button
              onClick={handleFetch}
              disabled={viewState === 'loading'}
              className="mt-2 py-3.5 px-8 bg-[#4E3420] text-[#fdfaf5] border-none rounded-sm text-[0.7rem] tracking-[0.2em] uppercase font-jost transition-all duration-300 hover:bg-[#3A2414] disabled:opacity-60 disabled:cursor-wait active:scale-[0.98]"
            >
              {viewState === 'loading' ? 'Opening your edition…' : 'View My Edition'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Render: Preview ───────────────────────────────────────────────────────

  const spread = orderData!.spreads[currentSpread];
  const total = orderData!.spreads.length;
  const isFirst = currentSpread === 0;
  const isLast = currentSpread === total - 1;

  return (
    <div
      className="min-h-[100dvh] bg-[#fdfaf5] flex flex-col relative overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Main content — image pushed ~20% higher ── */}
      <div
        className="flex-1 flex flex-col items-center px-0 sm:px-6 md:px-12 relative"
        style={{
          /* Push content upward: more top padding, less bottom */
          paddingTop: 'max(24px, 5vh)',
          paddingBottom: showPayment ? 'max(100px, 14vh)' : 'max(24px, 4vh)',
          justifyContent: 'flex-start',
        }}
      >
        {/* Spacer — pushes the book ~20% from top instead of dead center */}
        <div style={{ flex: '0.25' }} />

        {/* Desktop nav + Book row */}
        <div className="flex items-center justify-center w-full max-w-[1100px] mx-auto">

          {/* Desktop: Prev button */}
          <button
            onClick={goPrev}
            disabled={isFirst}
            className="hidden md:flex items-center justify-center w-11 h-11 rounded-full flex-shrink-0 transition-all duration-300 mx-4"
            style={{
              background: isFirst ? 'transparent' : 'rgba(78,52,32,0.05)',
              border: `1px solid ${isFirst ? 'rgba(78,52,32,0.08)' : 'rgba(78,52,32,0.15)'}`,
              color: isFirst ? 'rgba(78,52,32,0.15)' : 'rgba(78,52,32,0.6)',
              cursor: isFirst ? 'default' : 'pointer',
            }}
          >
            <ArrowLeft size={17} />
          </button>

          {/* The spread image with page-turn animation */}
          <div
            className="relative flex-1"
            style={{
              maxWidth: 'min(92vw, 1000px)',
              perspective: '2000px',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentSpread}
                initial={{
                  x: direction > 0 ? '6%' : '-6%',
                  opacity: 0,
                  rotateY: direction > 0 ? 4 : -4,
                  scale: 0.97,
                }}
                animate={{
                  x: '0%',
                  opacity: 1,
                  rotateY: 0,
                  scale: 1,
                }}
                exit={{
                  x: direction > 0 ? '-6%' : '6%',
                  opacity: 0,
                  rotateY: direction > 0 ? -4 : 4,
                  scale: 0.97,
                }}
                transition={{
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  transformOrigin: direction > 0 ? 'left center' : 'right center',
                }}
              >
                {/* Book shadow + image wrapper */}
                <div
                  className="relative rounded-sm overflow-hidden"
                  style={{
                    boxShadow: `
                      0 2px 8px rgba(78,52,32,0.08),
                      0 8px 24px rgba(78,52,32,0.12),
                      0 24px 60px rgba(78,52,32,0.16)
                    `,
                  }}
                >
                  {/* Loading shimmer */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 z-10 bg-[#f0ebe2] animate-pulse" />
                  )}

                  <img
                    src={spread.url}
                    alt={`Spread ${currentSpread + 1} — ${orderData!.metadata.dest || 'Edition'}`}
                    className="w-full h-auto block"
                    style={{ borderRadius: 2 }}
                    draggable={false}
                    onLoad={() => setImageLoaded(true)}
                  />

                  {/* Spine gutter crease */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `
                        linear-gradient(
                          to right,
                          rgba(78,52,32,0.04) 0%,
                          transparent 6%,
                          transparent 44%,
                          rgba(0,0,0,0.12) 48.5%,
                          rgba(0,0,0,0.20) 50%,
                          rgba(0,0,0,0.12) 51.5%,
                          transparent 56%,
                          transparent 94%,
                          rgba(78,52,32,0.04) 100%
                        )
                      `,
                    }}
                  />

                  {/* Left page edge highlight */}
                  <div
                    className="absolute top-0 left-0 bottom-0 w-[2px] pointer-events-none rounded-l-sm"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.4), rgba(255,255,255,0.2))',
                    }}
                  />

                  {/* Right page edge shadow */}
                  <div
                    className="absolute top-0 right-0 bottom-0 w-[2px] pointer-events-none rounded-r-sm"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(78,52,32,0.04), rgba(78,52,32,0.10), rgba(78,52,32,0.04))',
                    }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Mobile: Tap zones — left and right halves */}
            <div className="absolute inset-0 md:hidden flex z-10">
              <button
                className="flex-1 h-full bg-transparent border-none outline-none cursor-pointer"
                onClick={goPrev}
                disabled={isFirst}
                aria-label="Previous spread"
              />
              <button
                className="flex-1 h-full bg-transparent border-none outline-none cursor-pointer"
                onClick={goNext}
                disabled={isLast}
                aria-label="Next spread"
              />
            </div>
          </div>

          {/* Desktop: Next button */}
          <button
            onClick={goNext}
            disabled={isLast}
            className="hidden md:flex items-center justify-center w-11 h-11 rounded-full flex-shrink-0 transition-all duration-300 mx-4"
            style={{
              background: isLast ? 'transparent' : 'rgba(78,52,32,0.05)',
              border: `1px solid ${isLast ? 'rgba(78,52,32,0.08)' : 'rgba(78,52,32,0.15)'}`,
              color: isLast ? 'rgba(78,52,32,0.15)' : 'rgba(78,52,32,0.6)',
              cursor: isLast ? 'default' : 'pointer',
            }}
          >
            <ArrowRight size={17} />
          </button>
        </div>

        {/* ── Below the book: dots, then info text ── */}
        <div className="flex flex-col items-center mt-5 sm:mt-6 gap-3 sm:gap-4">

          {/* Progress dots with mobile chevrons */}
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={goPrev}
              disabled={isFirst}
              className="md:hidden p-1 transition-opacity"
              style={{ opacity: isFirst ? 0.2 : 0.5 }}
              aria-label="Previous"
            >
              <ChevronLeft size={14} color="#4E3420" />
            </button>

            <div className="flex gap-1.5 sm:gap-2">
              {orderData!.spreads.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentSpread ? 1 : -1);
                    setCurrentSpread(i);
                  }}
                  className="border-none p-0 transition-all duration-300"
                  style={{
                    width: i === currentSpread ? 18 : 5,
                    height: 5,
                    borderRadius: 3,
                    background: i === currentSpread ? '#4E3420' : 'rgba(78,52,32,0.18)',
                    cursor: 'pointer',
                  }}
                  aria-label={`Go to spread ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={isLast}
              className="md:hidden p-1 transition-opacity"
              style={{ opacity: isLast ? 0.2 : 0.5 }}
              aria-label="Next"
            >
              <ChevronRight size={14} color="#4E3420" />
            </button>
          </div>

          {/* Trip info — below dots */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-[0.7rem] sm:text-[0.75rem] text-[var(--sienna)] font-cormorant italic tracking-[0.05em]">
              {orderData!.metadata.dest || 'Your Edition'}
              {orderData!.metadata.dates ? ` · ${orderData!.metadata.dates}` : ''}
            </div>
            <div className="text-[0.5rem] sm:text-[0.55rem] text-[rgba(78,52,32,0.35)] font-jost tracking-[0.15em] uppercase">
              Spread {currentSpread + 1} of {total}
            </div>
          </div>

          {/* Mobile swipe hint — only shows for first 3 seconds */}
          <MobileSwipeHint />
        </div>

        {/* Bottom spacer */}
        <div style={{ flex: '0.6' }} />
      </div>

      {/* ── Floating Payment Bar ── */}
      {/* Centering wrapper — static div with flexbox centering (no transform) */}
      <div
        className="fixed z-[100] left-0 right-0 flex justify-center pointer-events-none"
        style={{
          bottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
        }}
      >
        <AnimatePresence>
          {showPayment && (
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="pointer-events-auto flex items-center justify-between rounded-xl sm:rounded-lg"
              style={{
                width: 'calc(100vw - 32px)',
                maxWidth: 480,
                padding: '14px 18px',
                gap: 16,
                background: 'rgba(253, 250, 245, 0.94)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(78,52,32,0.10)',
                boxShadow: '0 8px 40px rgba(78,52,32,0.14), 0 2px 8px rgba(78,52,32,0.08)',
              }}
            >
              <div className="flex-shrink-0 min-w-0">
                <div className="text-[0.55rem] sm:text-[0.6rem] tracking-[0.15em] uppercase text-[#9A8A7A] font-jost mb-0.5">
                  Archival Edition
                </div>
                <div className="text-[1rem] sm:text-[1.15rem] font-cormorant text-[#4E3420] font-normal tracking-[0.03em]">
                  ₹4,999
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className="flex-shrink-0 py-3 px-5 sm:px-7 rounded transition-all duration-300 font-jost font-medium whitespace-nowrap active:scale-[0.97]"
                style={{
                  background: isProcessingPayment ? '#8A6A5A' : '#4E3420',
                  color: '#fdfaf5',
                  border: 'none',
                  fontSize: '0.6rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  cursor: isProcessingPayment ? 'wait' : 'pointer',
                }}
              >
                {isProcessingPayment ? 'Processing…' : 'Secure Commission'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Mobile Swipe Hint ───────────────────────────────────────────────────────
// Shows a subtle "swipe to turn" hint that auto-dismisses after 3s

function MobileSwipeHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.5 }}
          className="md:hidden text-center mt-4 text-[0.6rem] tracking-[0.15em] uppercase text-[rgba(78,52,32,0.3)] font-jost"
        >
          Swipe or tap to turn pages
        </motion.div>
      )}
    </AnimatePresence>
  );
}