import React from 'react';
import { Asset, EditorSpread, EditorSlot } from '../types';
import * as S from '../styles';

type SidebarProps = {
  library: Asset[];
  spreads: EditorSpread[];
  activeSpread?: EditorSpread;
  selectedId: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAutoCompose: () => void;
  onUpdateSlot: (side: 'left' | 'right', slotId: string, updates: Partial<EditorSlot>) => void;
  onReorderSlot: (side: 'left' | 'right', slotId: string, direction: 'forward' | 'backward') => void;
  onLoadOrder: (orderId: string) => Promise<void>;
};

export function Sidebar({ library, spreads, activeSpread, selectedId, onUpload, onAutoCompose, onUpdateSlot, onReorderSlot, onLoadOrder }: SidebarProps) {
  const [orderIdStr, setOrderIdStr] = React.useState('');
  const [isLoadingOrder, setIsLoadingOrder] = React.useState(false);
  
  let selectedSlot: { slot: EditorSlot, side: 'left' | 'right' } | null = null;
  if (selectedId && activeSpread) {
    const leftSlot = activeSpread.left.slots.find(s => s.id === selectedId);
    if (leftSlot) selectedSlot = { slot: leftSlot, side: 'left' };
    else {
      const rightSlot = activeSpread.right.slots.find(s => s.id === selectedId);
      if (rightSlot) selectedSlot = { slot: rightSlot, side: 'right' };
    }
  }

  if (selectedSlot) {
    const s = selectedSlot.slot;
    const side = selectedSlot.side;
    const InputStyle = { background: '#1A1A1A', border: '1px solid #333', color: '#DDD', padding: '6px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' as const };
    const LabelStyle = { fontSize: '10px', color: '#8A8A8A', textTransform: 'uppercase' as const, letterSpacing: '1px' };

    return (
      <aside style={S.sidebarStyle}>
        <header style={{ marginBottom: 28 }}>
          <h1 style={S.brandStyle}>PROPERTIES</h1>
          <p style={{ color: '#777', fontSize: 11, textTransform: 'uppercase' }}>Edit Image Slot</p>
        </header>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={LabelStyle}>X (%)</label>
              <input type="number" value={Math.round(s.x)} onChange={(e) => onUpdateSlot(side, s.id, { x: Number(e.target.value) })} style={InputStyle} />
            </div>
            <div>
              <label style={LabelStyle}>Y (%)</label>
              <input type="number" value={Math.round(s.y)} onChange={(e) => onUpdateSlot(side, s.id, { y: Number(e.target.value) })} style={InputStyle} />
            </div>
            <div>
              <label style={LabelStyle}>Width (%)</label>
              <input type="number" value={Math.round(s.w)} onChange={(e) => onUpdateSlot(side, s.id, { w: Number(e.target.value) })} style={InputStyle} />
            </div>
            <div>
              <label style={LabelStyle}>Height (%)</label>
              <input type="number" value={Math.round(s.h)} onChange={(e) => onUpdateSlot(side, s.id, { h: Number(e.target.value) })} style={InputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={LabelStyle}>Fit Mode</label>
            <select value={s.fitMode || 'cover'} onChange={(e) => onUpdateSlot(side, s.id, { fitMode: e.target.value as any })} style={InputStyle}>
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={LabelStyle}>Object Position</label>
            <input type="text" value={s.objectPosition || 'center'} onChange={(e) => onUpdateSlot(side, s.id, { objectPosition: e.target.value })} style={InputStyle} placeholder="e.g. center, top, 50% 50%" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={LabelStyle}>Corner Radius</label>
              <input type="number" value={s.borderRadius !== undefined ? s.borderRadius : ''} onChange={(e) => onUpdateSlot(side, s.id, { borderRadius: e.target.value === '' ? undefined : Number(e.target.value) })} style={{ ...InputStyle, width: '40px', padding: '2px', fontSize: '10px' }} placeholder="Auto" />
            </div>
            <input type="range" min="0" max="100" value={s.borderRadius !== undefined ? s.borderRadius : 0} onChange={(e) => onUpdateSlot(side, s.id, { borderRadius: Number(e.target.value) })} style={{ width: '100%', accentColor: '#5A463E' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button onClick={() => onReorderSlot(side, s.id, 'backward')} style={{ flex: 1, ...S.btnSecondary, padding: '8px' }}>Move Backward</button>
            <button onClick={() => onReorderSlot(side, s.id, 'forward')} style={{ flex: 1, ...S.btnSecondary, padding: '8px' }}>Bring Forward</button>
          </div>

          <div style={{ fontSize: '11px', color: '#666', marginTop: '12px' }}>
            Click outside the slot to return to Library.
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside style={S.sidebarStyle}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={S.brandStyle}>SMRITHI</h1>
        <p style={S.versionStyle}>Ops Editorial Engine</p>
      </header>

      <div style={S.statsRow}>
        <div style={S.statBox}>
          <div style={S.statValue}>{library.length}</div>
          <div style={S.statLabel}>Assets</div>
        </div>
        <div style={S.statBox}>
          <div style={S.statValue}>{spreads.length}</div>
          <div style={S.statLabel}>Spreads</div>
        </div>
      </div>

      <div style={S.controlGroup}>
        <button onClick={onAutoCompose} style={S.btnPrimary}>Auto Compose All</button>
        <label style={S.btnSecondary}>
          Upload Assets
          <input type="file" multiple accept="image/*" onChange={onUpload} style={{ display: "none" }} />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <input 
          type="text" 
          placeholder="Enter Order ID" 
          value={orderIdStr} 
          onChange={(e) => setOrderIdStr(e.target.value)}
          style={{ flex: 1, background: '#1A1A1A', border: '1px solid #333', color: '#DDD', padding: '8px', borderRadius: '4px', fontSize: '11px', outline: 'none' }}
        />
        <button 
          onClick={async () => { 
            if (orderIdStr && !isLoadingOrder) {
              setIsLoadingOrder(true);
              try {
                await onLoadOrder(orderIdStr.trim());
              } finally {
                setIsLoadingOrder(false);
              }
            } 
          }} 
          style={{ ...S.btnSecondary, padding: '8px 12px', whiteSpace: 'nowrap', opacity: isLoadingOrder ? 0.6 : 1 }}
          disabled={isLoadingOrder}
        >
          {isLoadingOrder ? 'Loading...' : 'Load Order'}
        </button>
      </div>

      <div style={S.hintBox}>
        Drag an image from the library onto the canvas to add it instantly.
      </div>

      <div style={S.assetGrid}>
        {library.map((img) => {
          const inLeft = activeSpread?.left?.slots?.some(s => s.assetId === img.id) || false;
          const inRight = activeSpread?.right?.slots?.some(s => s.assetId === img.id) || false;

          return (
            <div 
              key={img.id} 
              style={{ ...S.assetCard, opacity: (inLeft || inRight) ? 0.5 : 1, cursor: 'grab' }}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', img.id)}
            >
              <img src={img.src} style={S.assetThumb} alt={img.name} draggable={false} />
              <div style={S.assetMeta}>
                <span style={S.assetName}>{img.name}</span>
                <span style={S.assetDim}>{Math.round(img.aspect * 100) / 100}</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}