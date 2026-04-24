import React, { useRef } from 'react';
import { SpreadSlot } from './SpreadSlot';
import { EditorPage, Asset, Side, EditorText, EditorSlot } from '../types';
import * as S from '../styles';

type PageMatteProps = {
  page: EditorPage;
  library: Asset[];
  side: Side;
  selectedId: string | null;
  adjustingId: string | null;
  masterBorderRadius: number;
  onClearAsset: (slotId: string) => void;
  onAddText: () => void;
  onAddSlot: () => void;
  onAddSlotWithAsset: (assetId: string, x: number, y: number, w?: number, h?: number) => void;
  onUpdateText: (textId: string, updates: Partial<EditorText>) => void;
  onUpdateSlot: (slotId: string, updates: Partial<EditorSlot>) => void;
  onSetSelectedId: (id: string | null) => void;
  onContextMenu: (x: number, y: number, slotId: string, side: Side) => void;
  setAdjustingId: (id: string | null) => void;
};

function DraggableText({ text, isSelected, onSelect, onUpdate }: { text: EditorText, isSelected: boolean, onSelect: () => void, onUpdate: (updates: Partial<EditorText>) => void }) {
  const textRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect();
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).getAttribute('data-handle')) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startTextX = text.x;
    const startTextY = text.y;
    
    const parent = textRef.current?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    
    const onPointerMove = (ev: PointerEvent) => {
      const deltaX = ((ev.clientX - startX) / rect.width) * 100;
      const deltaY = ((ev.clientY - startY) / rect.height) * 100;
      
      let newX = startTextX + deltaX;
      let newY = startTextY + deltaY;

      const snapX = Math.round(newX / 2) * 2;
      const snapY = Math.round(newY / 2) * 2;

      onUpdate({ x: Math.max(0, Math.min(100, snapX)), y: Math.max(0, Math.min(100, snapY)) });
    };
    
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startFontSize = text.fontSize || 32;

    const rect = textRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startDist = Math.hypot(startX - centerX, startY - centerY);

    const onPointerMove = (ev: PointerEvent) => {
      const dist = Math.hypot(ev.clientX - centerX, ev.clientY - centerY);
      const ratio = dist / startDist;
      let newFontSize = Math.round(startFontSize * ratio);
      newFontSize = Math.max(8, Math.min(144, newFontSize));
      onUpdate({ fontSize: newFontSize });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    const rect = textRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const onPointerMove = (ev: PointerEvent) => {
      const angleRad = Math.atan2(ev.clientY - centerY, ev.clientX - centerX);
      let angleDeg = (angleRad * 180 / Math.PI) + 90;
      onUpdate({ rotation: Math.round(angleDeg) });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleStyle: React.CSSProperties = {
    width: 10, height: 10, background: '#FFF', border: '1px solid #D4AF37', 
    borderRadius: '50%', position: 'absolute', zIndex: 10
  };

  return (
    <div 
      ref={textRef}
      onPointerDown={handlePointerDown}
      style={{ 
        position: 'absolute', 
        left: `${text.x}%`, 
        top: `${text.y}%`, 
        transform: `translate(-50%, -50%) rotate(${text.rotation || 0}deg)`,
        cursor: 'grab',
        minWidth: '50px',
        padding: '4px',
        border: isSelected ? '1px dashed #D4AF37' : '1px dashed transparent',
        zIndex: isSelected ? (text.zIndex || 0) + 500 : (text.zIndex || 0),
        color: text.color || '#1A1918',
        backgroundColor: text.bgColor || 'transparent',
        fontFamily: text.fontFamily || '"Cormorant Garamond", serif',
        fontWeight: text.fontWeight || 300,
        fontSize: text.fontSize ? `${text.fontSize}px` : '32px'
      }}
      className={text.className || 'text-center'}
    >
      <div 
        contentEditable 
        suppressContentEditableWarning
        onBlur={(e) => onUpdate({ content: e.currentTarget.innerText })}
        style={{ outline: 'none', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}
      >
        {text.content}
      </div>

      {isSelected && (
        <>
          {/* Resize Handles */}
          <div data-handle onPointerDown={handleResize} style={{ ...handleStyle, top: -5, left: -5, cursor: 'nwse-resize' }} />
          <div data-handle onPointerDown={handleResize} style={{ ...handleStyle, top: -5, right: -5, cursor: 'nesw-resize' }} />
          <div data-handle onPointerDown={handleResize} style={{ ...handleStyle, bottom: -5, left: -5, cursor: 'nesw-resize' }} />
          <div data-handle onPointerDown={handleResize} style={{ ...handleStyle, bottom: -5, right: -5, cursor: 'nwse-resize' }} />
          
          {/* Rotate Handle */}
          <div data-handle onPointerDown={handleRotate} style={{ ...handleStyle, top: -24, left: '50%', transform: 'translateX(-50%)', cursor: 'grab' }} />
          {/* Rotate stem */}
          <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', width: 1, height: 10, background: '#D4AF37' }} />
        </>
      )}
    </div>
  );
}

export function PageMatte({ page, library, side, selectedId, adjustingId, masterBorderRadius, onClearAsset, onAddText, onAddSlot, onAddSlotWithAsset, onUpdateText, onUpdateSlot, onSetSelectedId, onContextMenu, setAdjustingId }: PageMatteProps) {
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const assetId = e.dataTransfer.getData('text/plain');
    if (!assetId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const snapX = Math.round(x / 2) * 2;
    const snapY = Math.round(y / 2) * 2;

    const asset = library.find(a => a.id === assetId);
    let h = 40;
    if (asset) {
      // physical height matches aspect ratio based on physical width
      h = 40 / (asset.aspect * 1.414);
    }

    onAddSlotWithAsset(assetId, snapX, snapY, 40, h);
  };

  return (
    <div style={S.pageWrapper}>
      <div style={S.paperStyle}>
        <div style={S.paperInterior}>
          <div 
            style={S.stageStyle}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {page.slots.map((slot) => {
              const image = slot.assetId ? library.find(a => a.id === slot.assetId) || null : null;
              return (
                <SpreadSlot 
                  key={slot.id} 
                  slot={slot} 
                  image={image} 
                  side={side} 
                  isSelected={selectedId === slot.id}
                  isAdjusting={adjustingId === slot.id}
                  masterBorderRadius={masterBorderRadius}
                  onClear={() => onClearAsset(slot.id)}
                  onSelect={() => onSetSelectedId(slot.id)}
                  onUpdate={(updates) => onUpdateSlot(slot.id, updates)}
                  onContextMenu={onContextMenu}
                  setAdjustingId={setAdjustingId}
                />
              );
            })}
            {page.texts?.map((text) => (
              <DraggableText 
                key={text.id} 
                text={text} 
                isSelected={selectedId === text.id}
                onSelect={() => onSetSelectedId(text.id)}
                onUpdate={(updates) => onUpdateText(text.id, updates)} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}