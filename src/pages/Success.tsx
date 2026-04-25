import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function Success() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfbf7] px-[max(40px,5vw)]">
            <div className="max-w-md text-center flex flex-col items-center mt-[-10vh]">

                {/* Elegant vertical line accent */}
                <div className="w-px h-16 bg-[var(--sienna)] mb-8 opacity-60"></div>

                <h1 className="text-4xl md:text-5xl font-cormorant text-[var(--sienna)] mb-4 italic">
                    Commission Confirmed.
                </h1>

                <p className="font-jost font-light text-[var(--ink-60)] text-[0.95rem] mb-10 leading-relaxed">
                    Your payment has been secured and your archival edition is now in our queue.
                    The Atelier will begin the curation and layout process shortly. You will receive
                    an email notification once your craft is ready for final review.
                </p>

                <Button
                    onClick={() => navigate('/')}
                    className="px-10 py-3 bg-[var(--sienna)] text-[var(--cream)] border-none hover:bg-[#3A2414] transition-colors text-[0.7rem] tracking-[0.2em] uppercase"
                >
                    Return Home
                </Button>

            </div>
        </div>
    );
}