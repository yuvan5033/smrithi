import { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
const FAQS = [
  {
    q: 'How many photos should I submit?',
    a: 'We work best with 80-200 photographs per trip. More gives us better selection for sequencing; we will curate down to the most meaningful frames. You can submit up to 500 photos.',
  },
  {
    q: 'How long does it take to receive my album?',
    a: 'You will receive a digital preview within a few hours of submitting. After our call and your approval, the physical edition ships within 10-14 business days.',
  },
  {
    q: 'What size are the albums?',
    a: 'Our standard edition is 30x24cm (landscape). We also offer a portrait 24x30cm edition. Both use the same archival materials and binding methods.',
  },
  {
    q: 'Can I add captions or written notes?',
    a: 'Yes - and we encourage it. The intake form includes a field for trip notes, date ranges, and specific memories. These can be incorporated as captions or a brief introduction page.',
  },
  {
    q: 'What does the preview call involve?',
    a: 'It is a 15-20 minute conversation where we walk through the digital layout together. We discuss what the trip meant, any sequencing adjustments, and cover customisations before going to print.',
  },
  {
    q: 'How durable are the albums?',
    a: 'Each edition is Smyth-sewn with archival PVA adhesive. The 320gsm stock is acid-free and UV-resistant. Kept away from direct sunlight, your album should remain pristine for over a century.',
  },
  {
    q: 'Can I order multiple copies?',
    a: 'Yes. Additional copies of the same edition are available at a reduced cost. Many customers order one to keep and one to gift.',
  },
  {
    q: 'What is your pricing?',
    a: 'Editions start from Rs 4,800 for a standard 40-page album. Pricing scales with page count. Final pricing is confirmed after the preview call once we know the scope of your edition.',
  },
];

export function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [ref, isVisible] = useInView();

  return (
    <div ref={ref} className="py-28 px-[max(40px,5vw)] pt-[120px]">
      <SectionHeader
        label="Questions"
        title={
          <>
            Everything you <em className="italic text-[var(--sienna)]">need to know.</em>
          </>
        }
        visible={isVisible}
      />

      <div className="max-w-[760px] mx-auto mt-16">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="border-b border-[var(--border)] first:border-t"
          >
            <button
              className="w-full text-left py-7 flex justify-between items-center bg-none border-none cursor-pointer font-cormorant text-xl font-normal text-[var(--ink)]"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {faq.q}
              <span className="w-[18px] h-[18px] flex-shrink-0 relative">
                <span
                  className="absolute top-1/2 left-1/2 w-3 h-px bg-[var(--sienna)] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300"
                />
                <span
                  className={`absolute top-1/2 left-1/2 w-px h-3 bg-[var(--sienna)] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-90' : ''
                  }`}
                />
              </span>
            </button>
            <div
              className={`overflow-hidden transition-[max-height] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]`}
              style={{ maxHeight: openIndex === i ? '400px' : '0' }}
            >
              <div className="pb-7 text-[0.92rem] leading-[1.95] text-[var(--ink-60)]">
                {faq.a}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-16">
        <p className="text-[0.88rem] text-[var(--ink-60)] mb-6">
          Still have questions? We'd love to talk.
        </p>
        <Button onClick={() => navigate('/upload')}>Begin Your Edition</Button>
      </div>
    </div>
  );
}
