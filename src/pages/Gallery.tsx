import { useInView } from '../hooks/useInView';
import { useSEO } from '../hooks/useSEO';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { GalleryPlaceholder } from '../components/GalleryPlaceholder';
import { useNavigate } from 'react-router-dom';

const GALLERY_ITEMS = [
  { dest: 'Kyoto, Japan', year: 'Spring 2023', photos: '127 photographs', color: '#7A6848' },
  { dest: 'Patagonia', year: 'Winter 2022', photos: '94 photographs', color: '#3E5E52' },
  { dest: 'Santorini', year: 'Summer 2023', photos: '108 photographs', color: '#4A6880' },
  { dest: 'Rajasthan', year: 'Autumn 2022', photos: '143 photographs', color: '#7A4A32' },
  { dest: 'Scottish Highlands', year: 'Spring 2022', photos: '89 photographs', color: '#4A5C3C' },
  { dest: 'Marrakech', year: 'Winter 2023', photos: '112 photographs', color: '#8A6A30' },
];

export function Gallery() {
  const navigate = useNavigate();
  const [ref, isVisible] = useInView();

  useSEO({
    title: 'Gallery — Past Editions | Smrithi Atelier',
    description: 'Browse archival travel photo book editions crafted by Smrithi Atelier. Kyoto, Patagonia, Santorini, Rajasthan — each journey bound into a permanent volume.',
    canonical: 'https://smrithi.online/gallery',
  });

  return (
    <div ref={ref} className="py-28 px-[max(40px,5vw)] pt-[120px]">
      <SectionHeader
        label="Past Editions"
        title={
          <>
            Journeys we've <em className="italic text-[var(--sienna)]">bound.</em>
          </>
        }
        subtitle="Each album below is a real edition — a single trip, bound permanently. Your shelf could look like this."
        visible={isVisible}
      />

      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-[1.5px] mt-16">
        {GALLERY_ITEMS.map((item, i) => {
          const isTall = i === 0 || i === 3;
          return (
            <div
              key={i}
              className={`relative overflow-hidden cursor-pointer group ${isTall ? 'md:row-span-2' : ''}`}
              style={{ aspectRatio: isTall ? 'auto' : '3/4' }}
              onClick={() => navigate('/preview')}
            >
              <div className="w-full h-full transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                <GalleryPlaceholder
                  color={item.color}
                  dest={item.dest}
                  year={item.year}
                  tall={isTall}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(24,21,15,0.72)] to-transparent to-55% opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div>
                  <div className="text-[var(--cream)] font-cormorant text-xl font-light italic">
                    {item.dest}
                  </div>
                  <div className="text-[0.6rem] tracking-[0.2em] uppercase text-[rgba(243,237,227,0.55)] mt-1">
                    {item.year} · {item.photos}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-16">
        <Button onClick={() => navigate('/upload')}>Begin Your Edition</Button>
      </div>
    </div>
  );
}
