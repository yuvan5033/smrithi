import { useState } from 'react';
import { Asset, EditorSpread, EditorText, EditorSlot } from './types';
import { getInitialBlueprint, readAsset } from './engine';

export function useAtelier() {
  const [library, setLibrary] = useState<Asset[]>([]);
  const [spreads, setSpreads] = useState<EditorSpread[]>(getInitialBlueprint());
  const [history, setHistory] = useState<EditorSpread[][]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [masterBorderRadius, setMasterBorderRadius] = useState<number>(8);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [globalBgColor, setGlobalBgColor] = useState<string>('#111111');
  const [orderMetadata, setOrderMetadata] = useState<any>(null);

  const [adjustingId, setAdjustingId] = useState<string | null>(null);

  const pushHistory = (newSpreads: EditorSpread[]) => {
    setHistory(prev => [...prev, spreads].slice(-20));
    setSpreads(newSpreads);
  };

  const undo = () => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setSpreads(last);
      return prev.slice(0, -1);
    });
  };

  const handleSetSelectedId = (id: string | null) => {
    setSelectedId(id);
    if (!id) setAdjustingId(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const assets = await Promise.all(files.map(readAsset));
    setLibrary((prev) => [...prev, ...assets]);
    e.target.value = "";
  };

  const loadOrderAssets = async (orderId: string) => {
    try {
      const res = await fetch(`http://localhost:3002/api/orders/${orderId}/assets`);
      const data = await res.json();
      if (data.assets && Array.isArray(data.assets)) {
        const newAssets: Asset[] = await Promise.all(data.assets.map(async (a: any) => {
          return new Promise<Asset>((resolve) => {
            const step = a.path ? a.path.split('/')[2] : undefined;
            const img = new Image();
            img.onload = () => {
              resolve({
                id: Math.random().toString(36).slice(2, 9),
                src: a.url,
                name: a.name,
                width: img.width,
                height: img.height,
                aspect: img.width / img.height,
                ts: Date.now(),
                step
              });
            };
            img.onerror = () => {
              resolve({
                id: Math.random().toString(36).slice(2, 9),
                src: a.url,
                name: a.name,
                width: 800,
                height: 800,
                aspect: 1,
                ts: Date.now(),
                step
              });
            };
            img.src = a.url;
          });
        }));
        
        setLibrary(prev => [...prev, ...newAssets]);

        // Auto-place into spreads based on step mapping
        const stepMapping: Record<string, number[]> = {
          'step_3': [1, 2],
          'step_4': [3, 4],
          'step_5': [5],
          'step_6': [6, 7],
          'step_7': [8, 9],
          'step_8': [10],
          'step_9': [11],
          'step_10': [12, 13, 14, 15, 16, 17]
        };

        setSpreads(prevSpreads => {
          const nextSpreads = [...prevSpreads];
          
          const assetsByStep: Record<string, Asset[]> = {};
          newAssets.forEach(a => {
            if (a.step) {
              if (!assetsByStep[a.step]) assetsByStep[a.step] = [];
              assetsByStep[a.step].push(a);
            }
          });

          Object.keys(assetsByStep).forEach(step => {
            const spreadIndices = stepMapping[step];
            if (!spreadIndices) return;

            const stepAssets = assetsByStep[step];
            let assetIdx = 0;

            for (const spreadIdx of spreadIndices) {
              if (!nextSpreads[spreadIdx]) continue;
              
              const spread = { ...nextSpreads[spreadIdx] };
              const left = { ...spread.left, slots: [...spread.left.slots] };
              const right = { ...spread.right, slots: [...spread.right.slots] };

              for (let i = 0; i < left.slots.length; i++) {
                if (assetIdx < stepAssets.length) {
                  left.slots[i] = { ...left.slots[i], assetId: stepAssets[assetIdx].id };
                  assetIdx++;
                }
              }
              for (let i = 0; i < right.slots.length; i++) {
                if (assetIdx < stepAssets.length) {
                  right.slots[i] = { ...right.slots[i], assetId: stepAssets[assetIdx].id };
                  assetIdx++;
                }
              }

              spread.left = left;
              spread.right = right;
              nextSpreads[spreadIdx] = spread;
            }
          });

          return nextSpreads;
        });

        // Load Metadata and populate text slots
        try {
          const metaRes = await fetch(`http://localhost:3002/api/orders/${orderId}/metadata`);
          const meta = await metaRes.json();
          setOrderMetadata(meta);
          
          if (meta && Object.keys(meta).length > 0) {
            setSpreads(prev => {
              const next = [...prev];
              
              // Spread 1 (Index 0): Right page text
              if (meta.dest || meta.dates) {
                const s1 = { ...next[0] };
                s1.right = {
                  ...s1.right,
                  texts: s1.right.texts.map(t => {
                    if (t.content.includes('195?')) {
                      return { ...t, content: `${meta.dest || ''}\n${meta.dates || ''}`.trim() };
                    }
                    return t;
                  })
                };
                next[0] = s1;
              }

              // Spread 19 (Index 18): Left page note
              if (meta.remember) {
                const s19 = { ...next[18] };
                s19.left = {
                  ...s19.left,
                  texts: s19.left.texts.map(t => {
                    if (t.content.includes('future self')) {
                      return { ...t, content: meta.remember };
                    }
                    return t;
                  })
                };
                next[18] = s19;
              }

              // Spread 20 (Index 19): Right page song
              if (meta.song) {
                const s20 = { ...next[19] };
                s20.right = {
                  ...s20.right,
                  texts: s20.right.texts.map(t => {
                    if (t.content.includes('Song of')) {
                      return { ...t, content: meta.song };
                    }
                    return t;
                  })
                };
                next[19] = s20;
              }

              return next;
            });
          }
        } catch (err) {
          console.warn('Metadata not found or failed to load');
        }
      }
    } catch (err) {
      console.error('Failed to load order assets:', err);
      alert('Failed to load order assets');
    }
  };

  const runAutoCompose = () => {
    if (library.length === 0) return;
    const sorted = [...library].sort((a, b) => a.ts - b.ts || a.name.localeCompare(b.name));
    
    let imgIndex = 0;
    const nextSpreads = [...spreads];

    for (let s = 0; s < nextSpreads.length; s++) {
      const spread = { ...nextSpreads[s] };
      const left = { ...spread.left, slots: [...spread.left.slots] };
      const right = { ...spread.right, slots: [...spread.right.slots] };

      for (let i = 0; i < left.slots.length; i++) {
        if (imgIndex < sorted.length) {
          left.slots[i] = { ...left.slots[i], assetId: sorted[imgIndex].id };
          imgIndex++;
        }
      }
      for (let i = 0; i < right.slots.length; i++) {
        if (imgIndex < sorted.length) {
          right.slots[i] = { ...right.slots[i], assetId: sorted[imgIndex].id };
          imgIndex++;
        }
      }

      spread.left = left;
      spread.right = right;
      nextSpreads[s] = spread;
    }
    
    pushHistory(nextSpreads);
  };

  const updateActiveSpread = (updater: (prev: EditorSpread) => EditorSpread) => {
    const nextSpreads = [...spreads];
    nextSpreads[activeIndex] = updater(nextSpreads[activeIndex]);
    pushHistory(nextSpreads);
  };

  const getNextZ = (spread: EditorSpread) => {
    return Math.max(
      0,
      ...spread.left.slots.map(s => s.zIndex || 0),
      ...spread.right.slots.map(s => s.zIndex || 0),
      ...spread.left.texts.map(t => t.zIndex || 0),
      ...spread.right.texts.map(t => t.zIndex || 0)
    ) + 1;
  };

  const addText = (side: 'left' | 'right') => {
    updateActiveSpread(spread => {
      const page = spread[side];
      const newText: EditorText = {
        id: Math.random().toString(36).slice(2, 9),
        content: 'New Text',
        x: 50,
        y: 50,
        className: 'text-center',
        color: '#1A1918',
        fontSize: 32,
        fontFamily: '"Cormorant Garamond", serif',
        fontWeight: 300,
        zIndex: getNextZ(spread)
      };
      return { ...spread, [side]: { ...page, texts: [...page.texts, newText] } };
    });
  };

  const addSlot = (side: 'left' | 'right') => {
    updateActiveSpread(spread => {
      const page = spread[side];
      const newSlot: EditorSlot = {
        id: Math.random().toString(36).slice(2, 9),
        x: 25,
        y: 25,
        w: 50,
        h: 50,
        assetId: null,
        zIndex: getNextZ(spread)
      };
      return { ...spread, [side]: { ...page, slots: [...page.slots, newSlot] } };
    });
  };

  const addSlotWithAsset = (side: 'left' | 'right', assetId: string, x: number, y: number, w: number = 40, h: number = 40) => {
    updateActiveSpread(spread => {
      const page = spread[side];
      const newSlot: EditorSlot = {
        id: Math.random().toString(36).slice(2, 9),
        x: x - (w/2),
        y: y - (h/2),
        w,
        h,
        assetId,
        zIndex: getNextZ(spread)
      };
      return { ...spread, [side]: { ...page, slots: [...page.slots, newSlot] } };
    });
  };

  const updateText = (side: 'left' | 'right', textId: string, updates: Partial<EditorText>) => {
    updateActiveSpread(spread => {
      const page = spread[side];
      return { ...spread, [side]: { ...page, texts: page.texts.map(t => t.id === textId ? { ...t, ...updates } : t) } };
    });
  };

  const updateSlot = (side: 'left' | 'right', slotId: string, updates: Partial<EditorSlot>) => {
    updateActiveSpread(spread => {
      const page = spread[side];
      return { ...spread, [side]: { ...page, slots: page.slots.map(s => s.id === slotId ? { ...s, ...updates } : s) } };
    });
  };

  const updateSpread = (updates: Partial<EditorSpread>) => {
    updateActiveSpread(spread => ({ ...spread, ...updates }));
  };

  const setAllSpreadsBgColor = (bgColor: string) => {
    pushHistory(spreads.map(spread => ({ ...spread, bgColor })));
  };

  const deleteSlot = (slotId: string) => {
    updateActiveSpread(spread => {
      return {
        ...spread,
        left: { ...spread.left, slots: spread.left.slots.filter(s => s.id !== slotId) },
        right: { ...spread.right, slots: spread.right.slots.filter(s => s.id !== slotId) }
      };
    });
    handleSetSelectedId(null);
  };

  const deleteText = (textId: string) => {
    updateActiveSpread(spread => {
      return {
        ...spread,
        left: { ...spread.left, texts: spread.left.texts.filter(t => t.id !== textId) },
        right: { ...spread.right, texts: spread.right.texts.filter(t => t.id !== textId) }
      };
    });
    handleSetSelectedId(null);
  };

  const transferSlot = (slotId: string, toSide: 'left' | 'right', newX: number, newY: number) => {
    updateActiveSpread(spread => {
      const fromSide = toSide === 'left' ? 'right' : 'left';
      const slotIndex = spread[fromSide].slots.findIndex(s => s.id === slotId);
      if (slotIndex < 0) return spread; // Already on this side or doesn't exist
      
      const slotToMove = { ...spread[fromSide].slots[slotIndex], x: newX, y: newY };
      const newFromSlots = [...spread[fromSide].slots];
      newFromSlots.splice(slotIndex, 1);
      
      return {
        ...spread,
        [fromSide]: { ...spread[fromSide], slots: newFromSlots },
        [toSide]: { ...spread[toSide], slots: [...spread[toSide].slots, slotToMove] }
      };
    });
  };

  const reorderSlot = (side: 'left' | 'right', slotId: string, direction: 'forward' | 'backward') => {
    updateActiveSpread(spread => {
      const items = [
        ...spread.left.slots.map(s => ({ ...s, _side: 'left' as const, _type: 'slot' as const })),
        ...spread.right.slots.map(s => ({ ...s, _side: 'right' as const, _type: 'slot' as const })),
        ...spread.left.texts.map(t => ({ ...t, _side: 'left' as const, _type: 'text' as const })),
        ...spread.right.texts.map(t => ({ ...t, _side: 'right' as const, _type: 'text' as const }))
      ];

      // Assign initial zIndex based on array order if missing
      items.forEach((item, index) => {
        if (item.zIndex === undefined) {
          // If the item doesn't have a zIndex, we give it one based on index.
          // Since left slots < right slots < left texts < right texts, it's already generally ordered visually.
          item.zIndex = index;
        }
      });

      items.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      const idx = items.findIndex(i => i.id === slotId);
      if (idx < 0) return spread;

      if (direction === 'forward' && idx < items.length - 1) {
        const temp = items[idx].zIndex || 0;
        items[idx].zIndex = items[idx + 1].zIndex || 0;
        items[idx + 1].zIndex = temp;
      } else if (direction === 'backward' && idx > 0) {
        const temp = items[idx].zIndex || 0;
        items[idx].zIndex = items[idx - 1].zIndex || 0;
        items[idx - 1].zIndex = temp;
      } else {
        return spread;
      }

      // Reconstruct
      const newSpread: EditorSpread = { 
        ...spread, 
        left: { slots: [], texts: [] }, 
        right: { slots: [], texts: [] } 
      };

      // Ensure stable sorting after modification
      items.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      items.forEach(item => {
        const { _side, _type, ...rest } = item;
        if (_type === 'slot') {
          newSpread[_side].slots.push(rest as EditorSlot);
        } else {
          newSpread[_side].texts.push(rest as EditorText);
        }
      });

      return newSpread;
    });
  };

  const clearAsset = (side: 'left' | 'right', slotId: string) => {
    updateActiveSpread(spread => {
      const page = spread[side];
      return {
        ...spread,
        [side]: { ...page, slots: page.slots.map(s => s.id === slotId ? { ...s, assetId: null } : s) }
      };
    });
  };

  const nudgeSelected = (dx: number, dy: number) => {
    if (!selectedId) return;
    updateActiveSpread(spread => {
      const isSlotLeft = spread.left.slots.find(s => s.id === selectedId);
      const isSlotRight = spread.right.slots.find(s => s.id === selectedId);
      const isTextLeft = spread.left.texts.find(t => t.id === selectedId);
      const isTextRight = spread.right.texts.find(t => t.id === selectedId);

      const newSpread = { ...spread };

      // Nudge the inner image if currently in crop & adjust mode
      if (adjustingId === selectedId && (isSlotLeft || isSlotRight)) {
        if (isSlotLeft) {
          newSpread.left = { ...newSpread.left, slots: newSpread.left.slots.map(s => s.id === selectedId ? { ...s, imageX: (s.imageX ?? 50) + dx, imageY: (s.imageY ?? 50) + dy } : s) };
        } else if (isSlotRight) {
          newSpread.right = { ...newSpread.right, slots: newSpread.right.slots.map(s => s.id === selectedId ? { ...s, imageX: (s.imageX ?? 50) + dx, imageY: (s.imageY ?? 50) + dy } : s) };
        }
        return newSpread;
      }

      // Otherwise nudge the physical frame/text
      if (isSlotLeft) {
        newSpread.left = { ...newSpread.left, slots: newSpread.left.slots.map(s => s.id === selectedId ? { ...s, x: s.x + dx, y: s.y + dy } : s) };
      } else if (isSlotRight) {
        newSpread.right = { ...newSpread.right, slots: newSpread.right.slots.map(s => s.id === selectedId ? { ...s, x: s.x + dx, y: s.y + dy } : s) };
      } else if (isTextLeft) {
        newSpread.left = { ...newSpread.left, texts: newSpread.left.texts.map(t => t.id === selectedId ? { ...t, x: t.x + dx, y: t.y + dy } : t) };
      } else if (isTextRight) {
        newSpread.right = { ...newSpread.right, texts: newSpread.right.texts.map(t => t.id === selectedId ? { ...t, x: t.x + dx, y: t.y + dy } : t) };
      }

      return newSpread;
    });
  };

  const activeSpread = spreads[activeIndex] || spreads[0];

  return {
    state: { library, spreads, activeIndex, activeSpread, selectedId, masterBorderRadius, zoom, pan, adjustingId, globalBgColor, orderMetadata },
    actions: { handleUpload, loadOrderAssets, runAutoCompose, setActiveIndex, addText, addSlot, addSlotWithAsset, updateText, updateSlot, updateSpread, setAllSpreadsBgColor, reorderSlot, clearAsset, setSelectedId: handleSetSelectedId, setMasterBorderRadius, deleteSlot, deleteText, transferSlot, undo, setZoom, setPan, setAdjustingId, nudgeSelected, setGlobalBgColor }
  };
}