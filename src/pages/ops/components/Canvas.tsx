import React, { useRef, useEffect, useState } from 'react';
import { PageMatte } from './PageMatte';
import { EditorSpread, Asset, EditorText, EditorSlot, Side } from '../types';
import * as S from '../styles';

type CanvasProps = {
  activeSpread: EditorSpread;
  library: Asset[];
  selectedId: string | null;
  masterBorderRadius: number;
  zoom: number;
  pan: { x: number, y: number };
  adjustingId: string | null;
  onClearAsset: (side: 'left' | 'right', slotId: string) => void;
  onAddText: (side: 'left' | 'right') => void;
  onAddSlot: (side: 'left' | 'right') => void;
  onAddSlotWithAsset: (side: 'left' | 'right', assetId: string, x: number, y: number, w?: number, h?: number) => void;
  onUpdateText: (side: 'left' | 'right', textId: string, updates: Partial<EditorText>) => void;
  onUpdateSlot: (side: 'left' | 'right', slotId: string, updates: Partial<EditorSlot>) => void;
  onSetSelectedId: (id: string | null) => void;
  onContextMenu: (x: number, y: number, slotId: string, side: Side) => void;
  setZoom: (z: number) => void;
  setPan: (p: { x: number, y: number }) => void;
  setAdjustingId: (id: string | null) => void;
};

function FloatingToolbar({ side, onAddSlot, onAddText }: { side: Side, onAddSlot: () => void, onAddText: () => void }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div style={{ position: 'absolute', [side === 'left' ? 'left' : 'right']: -60, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8, background: '#1A1918', padding: 8, borderRadius: 8, border: '1px solid #2A2A2A', zIndex: 100 }}>
      <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} style={{ background: 'none', border: 'none', color: '#F3EFE6', cursor: 'pointer', fontSize: 24, lineHeight: 1, padding: 0 }}>
        +
      </button>
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          <button onClick={(e) => { e.stopPropagation(); onAddSlot(); setExpanded(false); }} style={{ background: '#5A463E', border: 'none', color: '#F3EFE6', cursor: 'pointer', fontSize: 10, padding: '6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 1 }} title="Add Image Frame">
            IMG
          </button>
          <button onClick={(e) => { e.stopPropagation(); onAddText(); setExpanded(false); }} style={{ background: '#5A463E', border: 'none', color: '#F3EFE6', cursor: 'pointer', fontSize: 10, padding: '6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 1 }} title="Add Text">
            TXT
          </button>
        </div>
      )}
    </div>
  );
}

export function Canvas({ activeSpread, library, selectedId, masterBorderRadius, zoom, pan, adjustingId, onClearAsset, onAddText, onAddSlot, onAddSlotWithAsset, onUpdateText, onUpdateSlot, onSetSelectedId, onContextMenu, setZoom, setPan, setAdjustingId }: CanvasProps) {
  const canvasRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const zoomSpeed = 0.01;
        const delta = -e.deltaY * zoomSpeed;
        const newZoom = Math.min(Math.max(0.1, zoom + delta), 5);
        setZoom(newZoom);
      } else {
        setPan({ x: pan.x - e.deltaX, y: pan.y - e.deltaY });
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [zoom, pan, setZoom, setPan]);

  if (!activeSpread) return <main style={S.canvasStyle}><div>Loading blueprint...</div></main>;

  return (
    <main 
      ref={canvasRef}
      style={{ ...S.canvasStyle }}
      onPointerDown={() => onSetSelectedId(null)}
    >
      <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center' }}>
        <div id="print-spread" style={{ display: 'flex', width: 'min(66vw, 840px)', background: activeSpread.bgColor || '#FAFAFA', boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
          
          <FloatingToolbar side="left" onAddSlot={() => onAddSlot("left")} onAddText={() => onAddText("left")} />
          <FloatingToolbar side="right" onAddSlot={() => onAddSlot("right")} onAddText={() => onAddText("right")} />

          {/* Spine shadow bridging the two pages */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 3, background: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)', zIndex: 0, pointerEvents: 'none' }} />
          
          <PageMatte
            side="left"
            page={activeSpread.left}
            library={library}
            selectedId={selectedId}
            adjustingId={adjustingId}
            masterBorderRadius={masterBorderRadius}
            onClearAsset={(slotId) => onClearAsset("left", slotId)}
            onAddText={() => onAddText("left")}
            onAddSlot={() => onAddSlot("left")}
            onAddSlotWithAsset={(assetId, x, y, w, h) => onAddSlotWithAsset("left", assetId, x, y, w, h)}
            onUpdateText={(textId, updates) => onUpdateText("left", textId, updates)}
            onUpdateSlot={(slotId, updates) => onUpdateSlot("left", slotId, updates)}
            onSetSelectedId={onSetSelectedId}
            onContextMenu={onContextMenu}
            setAdjustingId={setAdjustingId}
          />
          <PageMatte
            side="right"
            page={activeSpread.right}
            library={library}
            selectedId={selectedId}
            adjustingId={adjustingId}
            masterBorderRadius={masterBorderRadius}
            onClearAsset={(slotId) => onClearAsset("right", slotId)}
            onAddText={() => onAddText("right")}
            onAddSlot={() => onAddSlot("right")}
            onAddSlotWithAsset={(assetId, x, y, w, h) => onAddSlotWithAsset("right", assetId, x, y, w, h)}
            onUpdateText={(textId, updates) => onUpdateText("right", textId, updates)}
            onUpdateSlot={(slotId, updates) => onUpdateSlot("right", slotId, updates)}
            onSetSelectedId={onSetSelectedId}
            onContextMenu={onContextMenu}
            setAdjustingId={setAdjustingId}
          />
        </div>
      </div>
    </main>
  );
}