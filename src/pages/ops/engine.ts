import { Asset, EditorSpread, EditorSlot, EditorText } from './types';

export const PAGE_H_UNITS = 141.4;
export const vy = (units: number) => Number(((units / PAGE_H_UNITS) * 100).toFixed(2));

const uid = () => Math.random().toString(36).slice(2, 9);

// Slot Builders
const FULL = (): EditorSlot => ({ id: uid(), x: 6, y: vy(6), w: 88, h: vy(129.4), assetId: null });
const TOP_HALF = (): EditorSlot => ({ id: uid(), x: 6, y: vy(6), w: 88, h: vy(61), assetId: null });
const BOTTOM_HALF = (): EditorSlot => ({ id: uid(), x: 6, y: vy(74.4), w: 88, h: vy(61), assetId: null });
const TOP_LEFT = (): EditorSlot => ({ id: uid(), x: 6, y: vy(6), w: 41, h: vy(61), assetId: null });
const TOP_RIGHT = (): EditorSlot => ({ id: uid(), x: 53, y: vy(6), w: 41, h: vy(61), assetId: null });
const BOTTOM_LEFT = (): EditorSlot => ({ id: uid(), x: 6, y: vy(74.4), w: 41, h: vy(61), assetId: null });
const BOTTOM_RIGHT = (): EditorSlot => ({ id: uid(), x: 53, y: vy(74.4), w: 41, h: vy(61), assetId: null });
const TEXT = (content: string, x: number, y: number, className?: string): EditorText => ({
  id: uid(), content, x, y, className
});

export function getInitialBlueprint(): EditorSpread[] {
  return [
    {
      id: 's1', phase: 'Opening', category: 'Orientation', purpose: 'Establish destination, date, emotional premise',
      left: { slots: [], texts: [] },
      right: {
        slots: [],
        texts: [
          TEXT('The thought I was in\n195?', 50, 50, 'text-[1.2rem] font-cormorant text-center transform -translate-x-1/2 -translate-y-1/2 leading-tight'),
          TEXT('SMRITHI', 50, 85, 'text-[0.6rem] tracking-[0.4em] uppercase text-center transform -translate-x-1/2 -translate-y-1/2')
        ]
      }
    },
    {
      id: 's2', phase: 'Opening', category: 'Arrival Anchor', purpose: 'Create first visual immersion; opening breath',
      left: { slots: [], texts: [] },
      right: { slots: [FULL()], texts: [] }
    },
    {
      id: 's3', phase: 'Opening', category: 'Entry', purpose: 'Show movement into the trip; transition from beginning into experience',
      left: { slots: [{ id: uid(), x: 0, y: 0, w: 100, h: 100, assetId: null }], texts: [] },
      right: { slots: [TOP_HALF(), BOTTOM_RIGHT()], texts: [] }
    },
    {
      id: 's4', phase: 'Ascent', category: 'Human Presence', purpose: 'Introduce people, relationships, social energy',
      left: { 
        slots: [{ id: uid(), x: 6, y: vy(12), w: 60, h: vy(70), assetId: null }, BOTTOM_RIGHT()], 
        texts: [TEXT('SMR', 6, vy(6), 'text-[0.6rem] tracking-[0.2em] uppercase')] 
      },
      right: { slots: [FULL()], texts: [] }
    },
    {
      id: 's5', phase: 'Ascent', category: 'Momentum Lift', purpose: 'First increase in energy and visual pull',
      left: { slots: [FULL()], texts: [] },
      right: { slots: [TOP_HALF(), BOTTOM_HALF()], texts: [] }
    },
    {
      id: 's6', phase: 'Ascent', category: 'Peak I', purpose: 'First major emotional or scenic climax',
      left: { slots: [TOP_HALF(), BOTTOM_LEFT(), BOTTOM_RIGHT()], texts: [] },
      right: { slots: [TOP_HALF(), BOTTOM_LEFT(), BOTTOM_RIGHT()], texts: [] }
    },
    {
      id: 's7', phase: 'Transition', category: 'Continuation', purpose: 'Extend narrative after peak without dropping abruptly',
      left: { slots: [FULL()], texts: [] },
      right: { slots: [TOP_HALF(), BOTTOM_RIGHT()], texts: [] }
    },
    {
      id: 's8', phase: 'Transition', category: 'Reflection Seed', purpose: 'Introduce quieter emotional shift or subtle realization',
      left: { slots: [FULL()], texts: [] },
      right: { slots: [TOP_LEFT(), BOTTOM_LEFT(), TOP_RIGHT()], texts: [] }
    },
    {
      id: 's9', phase: 'Core Journey', category: 'Mid Chaos I', purpose: 'Dense, layered memory cluster; spontaneity',
      left: { slots: [TOP_LEFT(), TOP_RIGHT(), BOTTOM_HALF()], texts: [] },
      right: { slots: [FULL()], texts: [] }
    },
    {
      id: 's10', phase: 'Core Journey', category: 'Mid Chaos II', purpose: 'Sustain motion and variety; controlled disorder',
      left: { slots: [TOP_LEFT(), BOTTOM_LEFT()], texts: [TEXT('The Group', 6, vy(132), 'text-[0.6rem] tracking-[0.2em] uppercase')] },
      right: { slots: [FULL()], texts: [] }
    },
    {
      id: 's11', phase: 'Core Journey', category: 'Realisation', purpose: 'Emotional pivot point; meaning surfaces',
      left: { slots: [TOP_HALF(), BOTTOM_HALF()], texts: [] },
      right: { slots: [FULL()], texts: [] }
    },
    {
      id: 's12', phase: 'Core Journey', category: 'Group Monument', purpose: 'Collective memory anchor; the “we were here” spread',
      left: { 
        slots: [{ id: uid(), x: 6, y: vy(25), w: 88, h: vy(110.4), assetId: null }],
        texts: [TEXT('Details', 50, vy(10), 'text-[1.2rem] font-cormorant text-center transform -translate-x-1/2')]
      },
      right: { slots: [TOP_LEFT(), TOP_RIGHT(), BOTTOM_HALF()], texts: [] }
    },
    {
      id: 's13', phase: 'Texture Layer', category: 'Unfiltered I', purpose: 'Raw, incidental, imperfect moments; texture of the trip',
      left: { slots: [TOP_HALF(), BOTTOM_HALF()], texts: [] },
      right: { slots: [FULL()], texts: [] }
    },
    {
      id: 's14', phase: 'Texture Layer', category: 'Detail Layer', purpose: 'Small details, overlooked artifacts, environmental fragments',
      left: { 
        slots: [],
        texts: [TEXT('The unfiltered', 50, 50, 'text-[1.8rem] font-cormorant text-center transform -translate-x-1/2 -translate-y-1/2 -rotate-90 origin-center')]
      },
      right: { 
        slots: [
          { id: uid(), x: 15, y: vy(6), w: 79, h: vy(40), assetId: null },
          { id: uid(), x: 6, y: vy(50.7), w: 60, h: vy(40), assetId: null },
          { id: uid(), x: 40, y: vy(95.4), w: 54, h: vy(40), assetId: null }
        ],
        texts: []
      }
    },
    {
      id: 's15', phase: 'Texture Layer', category: 'Unfiltered II', purpose: 'Continue informal memory texture before decline',
      left: { slots: [{ id: uid(), x: 6, y: vy(6), w: 41, h: vy(129.4), assetId: null }, { id: uid(), x: 53, y: vy(6), w: 41, h: vy(129.4), assetId: null }], texts: [] },
      right: { slots: [{ id: uid(), x: 6, y: vy(6), w: 41, h: vy(129.4), assetId: null }, { id: uid(), x: 53, y: vy(6), w: 41, h: vy(129.4), assetId: null }], texts: [] }
    },
    {
      id: 's16', phase: 'Descent', category: 'Fadeout', purpose: 'Controlled reduction in intensity; begin descent',
      left: { 
        slots: [{ id: uid(), x: 30, y: vy(30), w: 64, h: vy(81.4), assetId: null }],
        texts: [TEXT('FADEOUT', 6, vy(130), 'text-[0.6rem] tracking-[0.2em] uppercase')]
      },
      right: { slots: [{ id: uid(), x: 6, y: vy(30), w: 64, h: vy(81.4), assetId: null }], texts: [] }
    },
    {
      id: 's17', phase: 'Descent', category: 'Pre-Closure', purpose: 'Prepare emotional landing',
      left: { slots: [TOP_HALF(), BOTTOM_LEFT()], texts: [] },
      right: { slots: [FULL()], texts: [] }
    },
    {
      id: 's18', phase: 'Descent', category: 'Closure', purpose: 'Quiet ending; the trip recedes',
      left: { 
        slots: [{ id: uid(), x: 20, y: vy(40), w: 60, h: vy(60), assetId: null }],
        texts: [TEXT('The Unseen', 50, vy(10), 'text-[1.2rem] font-cormorant text-center transform -translate-x-1/2')]
      },
      right: { slots: [FULL()], texts: [] }
    },
    {
      id: 's19', phase: 'Preservation', category: 'Legacy', purpose: 'Note to future self; preservation layer',
      left: { 
        slots: [],
        texts: [TEXT('A note to the future self', 50, 50, 'text-[1.2rem] font-cormorant text-center transform -translate-x-1/2 -translate-y-1/2')]
      },
      right: { 
        slots: [{ id: uid(), x: 6, y: vy(6), w: 88, h: vy(80), assetId: null }],
        texts: []
      }
    },
    {
      id: 's20', phase: 'Preservation', category: 'Soundtrack / Epilogue', purpose: 'Optional song code, final emotional residue',
      left: { slots: [], texts: [] },
      right: { 
        slots: [],
        texts: [TEXT('Song of the trip', 50, 50, 'text-[0.6rem] tracking-[0.2em] uppercase text-center transform -translate-x-1/2')]
      }
    }
  ];
}

export async function readAsset(file: File): Promise<Asset> {
  const src = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11);
      resolve({
        id, src, name: file.name,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        aspect: (img.naturalWidth || img.width) / (img.naturalHeight || img.height),
        ts: file.lastModified || Date.now(),
      });
    };
    img.onerror = () => reject(new Error(`Failed to load ${file.name}`));
    img.src = src;
  });
}