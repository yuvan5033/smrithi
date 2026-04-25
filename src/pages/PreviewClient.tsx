import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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

  // State
  const [accessCode, setAccessCode] = useState('');
  const [viewState, setViewState] = useState<'gate' | 'loading' | 'preview'>('gate');
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Trigger payment bar after 4 seconds of preview
  useEffect(() => {
    if (viewState !== 'preview') return;
    const t = setTimeout(() => setShowPayment(true), 4000);
    return () => clearTimeout(t);
  }, [viewState]);

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

  // ─── Animation Variants ────────────────────────────────────────────────────

  const spreadVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 60 : -60,
      filter: 'blur(4px)',
    }),
    center: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.65, ease: EASE },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -60 : 60,
      filter: 'blur(4px)',
      transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
    }),
  };

  // ─── Render: Gate ──────────────────────────────────────────────────────────

  if (viewState === 'gate' || viewState === 'loading') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-8 bg-[#fdfaf5]">
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
          <div className="text-[0.65rem] tracking-[0.2em] font-light uppercase font-jost text-[var(--ink-80)] mb-12">
            — smrithi atelier
          </div>

          <h1 className="font-cormorant text-[clamp(2.2rem,5vw,3.5rem)] font-light text-[var(--ink)] leading-[1.1] mb-4">
            Your edition<br />
            <em className="italic text-[var(--sienna)]">awaits.</em>
          </h1>
          <p className="font-jost text-[0.85rem] text-[var(--ink-60)] leading-relaxed mb-12 max-w-[320px]">
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
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                padding: '12px 0',
                fontSize: '1.6rem',
                letterSpacing: '0.4em',
                color: 'var(--ink)',
                textAlign: 'center',
                outline: 'none',
                fontFamily: '"Cormorant Garamond", serif',
                width: '100%',
              }}
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
              style={{
                marginTop: 8,
                padding: '14px 32px',
                background: '#4E3420',
                color: '#fdfaf5',
                border: 'none',
                borderRadius: 2,
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontFamily: '"Jost", sans-serif',
                cursor: viewState === 'loading' ? 'wait' : 'pointer',
                opacity: viewState === 'loading' ? 0.6 : 1,
                transition: 'all 0.3s ease',
              }}
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

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#111',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingBottom: showPayment ? 100 : 0,
        transition: 'padding-bottom 0.5s ease',
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
        }}
      >
        <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(253,250,245,0.6)', fontFamily: '"Jost", sans-serif' }}>
          Smrithi Atelier
        </div>
        <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(253,250,245,0.4)', fontFamily: '"Jost", sans-serif' }}>
          {orderData!.metadata.dest || 'Your Edition'}{orderData!.metadata.dates ? ` · ${orderData!.metadata.dates}` : ''}
        </div>
        <div style={{ fontSize: '0.65rem', color: 'rgba(253,250,245,0.4)', fontFamily: '"Jost", sans-serif', letterSpacing: '0.1em' }}>
          {currentSpread + 1} / {total}
        </div>
      </div>

      {/* ── Book spread ── */}
      <div style={{ width: '100%', maxWidth: '90vw', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>

        {/* Prev button */}
        <button
          onClick={goPrev}
          disabled={currentSpread === 0}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(253,250,245,0.08)',
            border: '1px solid rgba(253,250,245,0.15)',
            color: currentSpread === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: currentSpread === 0 ? 'not-allowed' : 'pointer',
            backdropFilter: 'blur(8px)',
            flexShrink: 0,
            transition: 'all 0.3s ease',
          }}
        >
          <ArrowLeft size={18} />
        </button>

        {/* Spread image with book effect */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '80vw' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSpread}
              custom={direction}
              variants={spreadVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ position: 'relative' }}
            >
              {/* Book shadow wrapper */}
              <div
                style={{
                  position: 'relative',
                  boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5)',
                  borderRadius: 2,
                }}
              >
                <img
                  src={spread.url}
                  alt={`Spread ${currentSpread + 1}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: 2,
                  }}
                  draggable={false}
                />

                {/* Spine gutter crease overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: `
                      linear-gradient(
                        to right,
                        rgba(0,0,0,0.12) 0%,
                        transparent 8%,
                        transparent 43%,
                        rgba(0,0,0,0.32) 48.5%,
                        rgba(0,0,0,0.42) 50%,
                        rgba(0,0,0,0.32) 51.5%,
                        transparent 57%,
                        transparent 92%,
                        rgba(0,0,0,0.12) 100%
                      )
                    `,
                    borderRadius: 2,
                  }}
                />

                {/* Page-curl edge highlight on left page */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '2px',
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                    borderRadius: '2px 0 0 2px',
                    pointerEvents: 'none',
                  }}
                />

                {/* Page-curl edge on right page */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '2px',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.2), rgba(0,0,0,0.08))',
                    borderRadius: '0 2px 2px 0',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Spread counter dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
            {orderData!.spreads.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > currentSpread ? 1 : -1); setCurrentSpread(i); }}
                style={{
                  width: i === currentSpread ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === currentSpread ? '#fdfaf5' : 'rgba(253,250,245,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={goNext}
          disabled={currentSpread === total - 1}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(253,250,245,0.08)',
            border: '1px solid rgba(253,250,245,0.15)',
            color: currentSpread === total - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: currentSpread === total - 1 ? 'not-allowed' : 'pointer',
            backdropFilter: 'blur(8px)',
            flexShrink: 0,
            transition: 'all 0.3s ease',
          }}
        >
          <ArrowRight size={18} />
        </button>
      </div>

      {/* ── Floating Payment Bar ── */}
      <AnimatePresence>
        {showPayment && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              padding: '16px 24px',
              borderRadius: 8,
              background: 'rgba(253, 250, 245, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(78,52,32,0.12)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
              minWidth: 'min(90vw, 480px)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9A8A7A', fontFamily: '"Jost", sans-serif', marginBottom: 2 }}>
                Archival Edition
              </div>
              <div style={{ fontSize: '1.15rem', fontFamily: '"Cormorant Garamond", serif', color: '#4E3420', fontWeight: 400, letterSpacing: '0.03em' }}>
                ₹4,999
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessingPayment}
              style={{
                padding: '12px 28px',
                background: isProcessingPayment ? '#8A6A5A' : '#4E3420',
                color: '#fdfaf5',
                border: 'none',
                borderRadius: 4,
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontFamily: '"Jost", sans-serif',
                cursor: isProcessingPayment ? 'wait' : 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              {isProcessingPayment ? 'Processing…' : 'Secure Commission'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
