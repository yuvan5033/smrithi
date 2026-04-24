import React, { useRef } from 'react';
import { Asset, EditorSlot, Side } from '../types';
import * as S from '../styles';

type SpreadSlotProps = {
  slot: EditorSlot;
  image: Asset | null;
  side: Side;
  isSelected: boolean;
  isAdjusting?: boolean;
  masterBorderRadius: number;
  onClear: () => void;
  onSelect: () => void;
  onUpdate: (updates: Partial<EditorSlot>) => void;
  onContextMenu: (x: number, y: number, slotId: string, side: Side) => void;
  setAdjustingId?: (id: string | null) => void;
};

export function SpreadSlot({ slot, image, side, isSelected, isAdjusting, masterBorderRadius, onClear, onSelect, onUpdate, onContextMenu, setAdjustingId }: SpreadSlotProps) {
  const isImpactSlot = slot.w >= 90 && slot.h >= 90;
  const fitMode = slot.fitMode || "cover"; 
  const currentRadius = slot.borderRadius !== undefined ? slot.borderRadius : masterBorderRadius;
  
  const slotRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect();
    
    // Only drag with left click
    if (e.button !== 0) return;

    const startX = e.clientX;
    const startY = e.clientY;
    
    const parent = slotRef.current?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    
    if (isAdjusting) {
      const startImgX = slot.imageX ?? 50;
      const startImgY = slot.imageY ?? 50;

      const onPointerMove = (ev: PointerEvent) => {
        const deltaX = ((ev.clientX - startX) / rect.width) * 100;
        const deltaY = ((ev.clientY - startY) / rect.height) * 100;
        onUpdate({ imageX: startImgX + deltaX, imageY: startImgY + deltaY });
      };
      
      const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };
      
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      return;
    }

    const startSlotX = slot.x;
    const startSlotY = slot.y;

    const onPointerMove = (ev: PointerEvent) => {
      const deltaX = ((ev.clientX - startX) / rect.width) * 100;
      const deltaY = ((ev.clientY - startY) / rect.height) * 100;
      
      let newX = startSlotX + deltaX;
      let newY = startSlotY + deltaY;
      
      // Snap to 2% grid
      newX = Math.round(newX / 2) * 2;
      newY = Math.round(newY / 2) * 2;

      onUpdate({ x: newX, y: newY });
    };
    
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleResizeDown = (corner: 'nw' | 'ne' | 'sw' | 'se') => (e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.button !== 0 || isAdjusting) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startSlotX = slot.x;
    const startSlotY = slot.y;
    const startSlotW = slot.w;
    const startSlotH = slot.h;

    const parent = slotRef.current?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();

    const onPointerMove = (ev: PointerEvent) => {
      const deltaX = ((ev.clientX - startX) / rect.width) * 100;
      const deltaY = ((ev.clientY - startY) / rect.height) * 100;

      let newX = startSlotX;
      let newY = startSlotY;
      let newW = startSlotW;
      let newH = startSlotH;

      if (corner.includes('w')) {
        newX = startSlotX + deltaX;
        newW = startSlotW - deltaX;
      }
      if (corner.includes('e')) {
        newW = startSlotW + deltaX;
      }
      if (corner.includes('n')) {
        newY = startSlotY + deltaY;
        newH = startSlotH - deltaY;
      }
      if (corner.includes('s')) {
        newH = startSlotH + deltaY;
      }

      // Snap to 2% grid
      newX = Math.round(newX / 2) * 2;
      newY = Math.round(newY / 2) * 2;
      newW = Math.round(newW / 2) * 2;
      newH = Math.round(newH / 2) * 2;

      // Minimum size enforcement
      if (newW >= 5 && newH >= 5) {
        onUpdate({ x: newX, y: newY, w: newW, h: newH });
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleCropResizeDown = (corner: 'nw' | 'ne' | 'sw' | 'se') => (e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.button !== 0 || !isAdjusting) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startZoom = slot.imageZoom ?? 1;

    const parent = slotRef.current?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();

    const onPointerMove = (ev: PointerEvent) => {
      // Calculate how far mouse moved relative to the slot width
      const deltaX = (ev.clientX - startX) / rect.width;
      const deltaY = (ev.clientY - startY) / rect.height;

      // Distance moved outward -> increase zoom
      // nw: moving left/up increases size (-deltaX, -deltaY)
      // ne: moving right/up increases size (+deltaX, -deltaY)
      // sw: moving left/down increases size (-deltaX, +deltaY)
      // se: moving right/down increases size (+deltaX, +deltaY)
      
      let scaleChange = 0;
      if (corner === 'nw') scaleChange = -deltaX - deltaY;
      else if (corner === 'ne') scaleChange = deltaX - deltaY;
      else if (corner === 'sw') scaleChange = -deltaX + deltaY;
      else if (corner === 'se') scaleChange = deltaX + deltaY;

      // Adjust sensitivity 
      const newZoom = Math.max(0.5, Math.min(5, startZoom + scaleChange));
      onUpdate({ imageZoom: newZoom });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const CropResizeHandle = ({ corner, style }: { corner: 'nw' | 'ne' | 'sw' | 'se', style: React.CSSProperties }) => (
    <div 
      onPointerDown={handleCropResizeDown(corner)}
      style={{
        position: 'absolute',
        width: 14,
        height: 14,
        background: '#5A463E',
        border: '2px solid white',
        borderRadius: '50%',
        cursor: `${corner}-resize`,
        zIndex: 60,
        ...style
      }}
    />
  );

  const ResizeHandle = ({ corner, style }: { corner: 'nw' | 'ne' | 'sw' | 'se', style: React.CSSProperties }) => (
    <div 
      onPointerDown={handleResizeDown(corner)}
      style={{
        position: 'absolute',
        width: 12,
        height: 12,
        background: '#D4AF37',
        border: '2px solid white',
        borderRadius: '50%',
        cursor: `${corner}-resize`,
        zIndex: 30,
        ...style
      }}
    />
  );

  return (
    <div
      ref={slotRef}
      data-empty-frame={!image ? "true" : undefined}
      onPointerDown={handlePointerDown}
      onContextMenu={(e) => {
        e.preventDefault();
        onSelect();
        onContextMenu(e.clientX, e.clientY, slot.id, side);
      }}
      style={{
        ...S.slotBase,
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        width: `${slot.w}%`,
        height: `${slot.h}%`,
        background: image ? "transparent" : "#E8E8E8", 
        border: (isSelected && !isAdjusting) ? '2px solid #D4AF37' : (isAdjusting ? '2px dashed #5A463E' : 'none'),
        boxShadow: (isSelected && !isAdjusting) ? '0 0 0 2px rgba(212,175,55,0.4)' : 'none',
        cursor: isAdjusting ? 'move' : 'grab',
        zIndex: isAdjusting ? 1000 : (isSelected ? (slot.zIndex || 0) + 500 : (slot.zIndex || 0))
      }}
    >
      {image ? (
        <div style={{ 
          width: '100%', height: '100%', position: 'relative', display: 'flex', overflow: 'hidden',
          borderRadius: isImpactSlot ? 0 : currentRadius,
          boxShadow: isImpactSlot ? "none" : "0 8px 24px rgba(0,0,0,0.12)",
          border: isImpactSlot ? "none" : "1px solid rgba(0,0,0,0.04)"
        }}>
          <img 
            src={image.src} 
            alt={image.name} 
            style={{ 
              position: 'absolute',
              left: `${slot.imageX ?? 50}%`,
              top: `${slot.imageY ?? 50}%`,
              transform: `translate(-50%, -50%) scale(${slot.imageZoom ?? 1})`,
              width: '100%',
              height: '100%',
              objectFit: fitMode,
              pointerEvents: 'none',
              opacity: isAdjusting ? 0.8 : 1,
              filter: `brightness(${slot.brightness ?? 100}%) contrast(${slot.contrast ?? 100}%) saturate(${slot.saturation ?? 100}%) blur(${slot.blur ?? 0}px)`
            }} 
            draggable={false}
          />
          {isAdjusting && (
             <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(255,255,255,0.2)', pointerEvents: 'none', zIndex: 10 }} />
          )}
          {isSelected && !isAdjusting && (
            <button 
              onPointerDown={(e) => { e.stopPropagation(); onClear(); }}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 24,
                height: 24,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                zIndex: 40
              }}
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <div style={S.placeholderBox}>
          <div style={S.placeholderPlus}>+</div>
        </div>
      )}

      {isSelected && !isAdjusting && (
        <>
          <ResizeHandle corner="nw" style={{ top: -6, left: -6 }} />
          <ResizeHandle corner="ne" style={{ top: -6, right: -6 }} />
          <ResizeHandle corner="sw" style={{ bottom: -6, left: -6 }} />
          <ResizeHandle corner="se" style={{ bottom: -6, right: -6 }} />
        </>
      )}

      {isAdjusting && (
        <>
          <CropResizeHandle corner="nw" style={{ top: -7, left: -7 }} />
          <CropResizeHandle corner="ne" style={{ top: -7, right: -7 }} />
          <CropResizeHandle corner="sw" style={{ bottom: -7, left: -7 }} />
          <CropResizeHandle corner="se" style={{ bottom: -7, right: -7 }} />
          
          <div 
            style={{ position: 'absolute', bottom: -50, left: '50%', transform: 'translateX(-50%)', background: '#1A1918', padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid #2A2A2A' }} 
            onPointerDown={e => e.stopPropagation()}
          >
            <span style={{ color: '#F3EFE6', fontSize: 10, letterSpacing: 1 }}>ZOOM</span>
            <input type="range" min="0.5" max="5" step="0.05" value={slot.imageZoom ?? 1} onChange={e => onUpdate({ imageZoom: Number(e.target.value) })} style={{ width: 100, accentColor: '#5A463E' }} />
            <button onClick={() => onUpdate({ imageX: 50, imageY: 50, imageZoom: 1 })} style={{ background: '#333', color: '#F3EFE6', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 10, cursor: 'pointer', letterSpacing: 1 }}>RESET</button>
            <button onClick={() => setAdjustingId?.(null)} style={{ background: '#5A463E', color: '#F3EFE6', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 10, cursor: 'pointer', letterSpacing: 1 }}>DONE</button>
          </div>
        </>
      )}
    </div>
  );
}