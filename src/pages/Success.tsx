import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';

export function Success() {
    const navigate = useNavigate();

    useSEO({
        title: 'Commission Confirmed | Smrithi Atelier',
        description: 'Your archival edition has been commissioned. The Smrithi Atelier team will begin curation shortly.',
        noIndex: true,
    });

    return (
        <div className="min-h-[100dvh] relative flex flex-col items-center justify-center px-8 md:px-12 z-10 overflow-hidden">
            {/* Background overlapping circles for depth */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden flex items-center justify-center">
                <motion.svg
                    initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                    animate={{ opacity: 0.3, scale: 1, rotate: 0 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute w-[140%] md:w-[90%] h-auto stroke-[var(--border)] origin-center"
                    viewBox="0 0 100 100" fill="none"
                >
                    <circle cx="50" cy="50" r="40" strokeWidth="0.15" />
                    <circle cx="60" cy="40" r="30" strokeWidth="0.15" />
                    <circle cx="45" cy="55" r="45" strokeWidth="0.15" />
                    <circle cx="70" cy="60" r="25" strokeWidth="0.15" />
                </motion.svg>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-xl text-center flex flex-col items-center mt-[-5vh]"
            >
                {/* Top label mirroring the craft engine */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-[0.65rem] tracking-[0.2em] font-light uppercase font-jost text-[var(--ink-80)] mb-10"
                >
                    - smrithi atelier
                </motion.div>

                {/* Gold Checkmark Icon from Upload step 12 */}
                <div className="w-16 h-16 border border-[var(--gold)] rounded-full flex items-center justify-center mb-8 relative">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                    >
                        <svg className="w-[24px] h-[24px] stroke-[var(--gold)]" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.div>
                    {/* Subtle glow behind icon */}
                    <div className="absolute inset-0 bg-[var(--gold)] opacity-5 rounded-full blur-md"></div>
                </div>

                <h1 className="font-cormorant text-[clamp(2.5rem,5vw,4rem)] font-light text-[var(--ink)] mb-6 leading-[1.1]">
                    Commission <span className="relative inline-block">
                        <em className="italic text-[var(--sienna)] relative z-10 pr-2">Confirmed.</em>
                        {/* Signature tilted underline */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "104%" }}
                            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                            className="absolute bottom-[0.1em] left-[-2%] h-[1px] bg-[var(--sienna)] rotate-[-1.5deg] rounded-full z-0 opacity-50"
                        />
                    </span>
                </h1>

                <p className="font-jost font-light text-[var(--ink-60)] text-[0.95rem] leading-[1.95] mb-12 max-w-[480px]">
                    Your payment has been secured and your archival edition is now in our queue.
                    The Atelier will begin the curation and layout process shortly. You will receive
                    an email notification once your craft is ready for final review.
                </p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <Button
                        onClick={() => navigate('/')}
                        className="px-10 py-3.5 bg-[var(--sienna)] text-[var(--cream)] border-none hover:bg-[#3A2414] transition-all duration-300 text-[0.7rem] tracking-[0.2em] uppercase font-jost shadow-[0_4px_20px_rgba(78,52,32,0.15)] hover:shadow-[0_6px_25px_rgba(78,52,32,0.25)] hover:-translate-y-0.5"
                    >
                        Return Home
                    </Button>
                </motion.div>

            </motion.div>
        </div>
    );
}