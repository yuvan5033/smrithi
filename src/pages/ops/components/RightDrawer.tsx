import React, { useState } from 'react';
import { EditorSlot, EditorText, EditorSpread } from '../types';

type RightDrawerProps = {
  activeSpread: EditorSpread | null;
  selectedElementInfo: { element: EditorSlot | EditorText, type: 'slot' | 'text', side: 'left' | 'right' } | null;
  globalBgColor: string;
  onUpdateSlot: (side: 'left' | 'right', slotId: string, updates: Partial<EditorSlot>) => void;
  onUpdateText: (side: 'left' | 'right', textId: string, updates: Partial<EditorText>) => void;
  onUpdateSpread: (updates: Partial<EditorSpread>) => void;
  onSetAllSpreadsBgColor: (color: string) => void;
  onSetGlobalBgColor: (color: string) => void;
  onAddText: (side: 'left' | 'right') => void;
  onExportSpreads: () => void;
  orderMetadata?: any;
};

function FilterSlider({ label, min, max, value, onChange }: { label: string, min: number, max: number, value: number, onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <label style={{ fontSize: 10, color: '#8A8A8A', textTransform: 'uppercase' }}>{label}</label>
        <span style={{ fontSize: 10, color: '#DDD' }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} style={{ accentColor: '#5A463E' }} />
    </div>
  );
}

function FigmaColorPicker({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  const hex = (value || '#FFFFFF').toUpperCase().replace('#', '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#E0E0E0', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', background: '#222', borderRadius: 4, padding: '4px 8px', gap: 12, border: '1px solid #333' }}>
        <div style={{ position: 'relative', width: 16, height: 16, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0, background: value || '#FFFFFF' }}>
          <input 
            type="color" 
            value={value || '#ffffff'} 
            onChange={e => onChange(e.target.value)} 
            style={{ position: 'absolute', top: -10, left: -10, width: 40, height: 40, cursor: 'pointer', opacity: 0 }} 
          />
        </div>
        <div style={{ fontSize: 11, color: '#FFF', fontFamily: 'monospace', flex: 1, letterSpacing: 0.5 }}>
          {hex}
        </div>
        <div style={{ fontSize: 11, color: '#A0A0A0' }}>
          100%
        </div>
        <div style={{ display: 'flex', color: '#A0A0A0', cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </div>
      </div>
    </div>
  );
}

function FigmaSelect({ label, value, options, onChange }: { label: string, value: string, options: { label: string, value: string }[], onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#E0E0E0', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <select 
          value={value} 
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', appearance: 'none', background: '#222', border: '1px solid #333', borderRadius: 4, padding: '6px 24px 6px 8px', color: '#FFF', fontSize: 11, cursor: 'pointer', outline: 'none' }}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <svg style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
    </div>
  );
}

export function RightDrawer({ activeSpread, selectedElementInfo, globalBgColor, onUpdateSlot, onUpdateText, onUpdateSpread, onSetAllSpreadsBgColor, onSetGlobalBgColor, onAddText, onExportSpreads, orderMetadata }: RightDrawerProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'text' | 'page' | 'info' | null>(null);
  const [renderedTab, setRenderedTab] = useState<'edit' | 'text' | 'page' | 'info'>('edit');

  const toggleTab = (tab: 'edit' | 'text' | 'page' | 'info') => {
    if (activeTab === tab) {
      setActiveTab(null);
    } else {
      setRenderedTab(tab);
      setActiveTab(tab);
    }
  };

  const IconStyle: React.CSSProperties = {
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', border: 'none', color: '#DDD', cursor: 'pointer', borderRadius: 4,
    marginBottom: 8
  };

  const el = selectedElementInfo?.element;
  const type = selectedElementInfo?.type;
  const side = selectedElementInfo?.side;

  const isDrawerOpen = activeTab !== null;

  return (
    <div style={{ 
      display: 'flex', 
      position: 'absolute', 
      right: 24, 
      top: '50%', 
      transform: 'translateY(-50%)', 
      zIndex: 1000,
      filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.6))',
      height: 'auto',
      maxHeight: '80vh'
    }}>
      
      {/* CHEVRON TOGGLE */}
      <div 
        onClick={() => {
          if (isDrawerOpen) setActiveTab(null);
          else {
            setActiveTab(renderedTab);
          }
        }}
        style={{
          position: 'absolute',
          left: -16,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 16,
          height: 48,
          background: '#1A1918',
          border: '1px solid #333',
          borderRight: 'none',
          borderRadius: '4px 0 0 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#888',
          zIndex: 10
        }}
        title={isDrawerOpen ? "Collapse" : "Expand"}
      >
        {isDrawerOpen ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        )}
      </div>

      {/* DRAWER PANEL */}
      <div style={{ 
        width: isDrawerOpen ? 260 : 0, 
        overflow: 'hidden', 
        transition: isDrawerOpen ? 'width 0.3s ease-out' : 'width 0.12s ease-in',
        background: '#1A1918',
        borderRadius: '16px 0 0 16px',
        borderStyle: isDrawerOpen ? 'solid' : 'none',
        borderWidth: '1px 0 1px 1px',
        borderColor: '#333'
      }}>
        <div style={{ width: 260, padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#F3EFE6', margin: 0, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
              {renderedTab === 'edit' ? 'Edit Image' : renderedTab === 'text' ? 'Text Styles' : renderedTab === 'page' ? 'Page Styles' : 'Order Reference'}
            </h3>
            <button onClick={() => setActiveTab(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
          </div>

          {renderedTab === 'edit' && type === 'slot' && el && side ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <FilterSlider label="Brightness" min={0} max={200} value={(el as EditorSlot).brightness ?? 100} onChange={v => onUpdateSlot(side, el.id, { brightness: v })} />
              <FilterSlider label="Contrast" min={0} max={200} value={(el as EditorSlot).contrast ?? 100} onChange={v => onUpdateSlot(side, el.id, { contrast: v })} />
              <FilterSlider label="Saturation" min={0} max={200} value={(el as EditorSlot).saturation ?? 100} onChange={v => onUpdateSlot(side, el.id, { saturation: v })} />
              <FilterSlider label="Blur" min={0} max={20} value={(el as EditorSlot).blur ?? 0} onChange={v => onUpdateSlot(side, el.id, { blur: v })} />
            </div>
          ) : renderedTab === 'edit' ? (
            <p style={{ color: '#888', fontSize: 12 }}>Select an image frame to edit its properties.</p>
          ) : null}

          {renderedTab === 'text' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {type === 'text' && el && side ? (
                <>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <FigmaSelect 
                        label="Font" 
                        value={(el as EditorText).fontFamily || '"Cormorant Garamond", serif'} 
                        options={[
                          { label: 'Cormorant Garamond', value: '"Cormorant Garamond", serif' },
                          { label: 'Allura', value: 'Allura, cursive' },
                          { label: 'Gemola', value: 'Gemola, sans-serif' },
                          { label: 'Didact Gothic', value: '"Didact Gothic", sans-serif' }
                        ]} 
                        onChange={v => onUpdateText(side, el.id, { fontFamily: v })} 
                      />
                    </div>
                    <div style={{ width: 100 }}>
                      <FigmaSelect 
                        label="Weight" 
                        value={String((el as EditorText).fontWeight || '400')} 
                        options={[
                          { label: 'Light', value: '300' },
                          { label: 'Regular', value: '400' },
                          { label: 'Bold', value: '700' }
                        ]} 
                        onChange={v => onUpdateText(side, el.id, { fontWeight: v })} 
                      />
                    </div>
                  </div>
                  <FilterSlider 
                    label="Font Size" 
                    min={8} 
                    max={144} 
                    value={(el as EditorText).fontSize || 32} 
                    onChange={v => onUpdateText(side, el.id, { fontSize: v })} 
                  />
                  <FigmaColorPicker label="Text Color" value={(el as EditorText).color || '#000000'} onChange={v => onUpdateText(side, el.id, { color: v })} />
                  <FigmaColorPicker label="Background Fill" value={(el as EditorText).bgColor || 'transparent'} onChange={v => onUpdateText(side, el.id, { bgColor: v })} />
                </>
              ) : (
                <p style={{ color: '#888', fontSize: 12 }}>Select a text block to change its styles, or add a new one.</p>
              )}
              <button onClick={() => { onAddText('right'); setActiveTab(null); }} style={{ background: '#5A463E', color: '#F3EFE6', border: 'none', padding: 8, borderRadius: 4, cursor: 'pointer', marginTop: 8 }}>Add New Text Block</button>
            </div>
          ) : null}

          {renderedTab === 'page' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeSpread ? (
                <FigmaColorPicker label="Current Spread Fill" value={activeSpread.bgColor || '#FAFAFA'} onChange={v => onUpdateSpread({ bgColor: v })} />
              ) : null}
              <FigmaColorPicker label="Global Spread Fill" value={activeSpread?.bgColor || '#FAFAFA'} onChange={v => onSetAllSpreadsBgColor(v)} />
              <FigmaColorPicker label="Workspace Background" value={globalBgColor} onChange={v => onSetGlobalBgColor(v)} />
              
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #333' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#E0E0E0', letterSpacing: 0.5, marginBottom: 12 }}>Export Options</div>
                <button 
                  onClick={() => onExportSpreads()} 
                  style={{ width: '100%', background: '#D4AF37', color: '#1A1918', border: 'none', padding: '10px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  EXPORT 300 DPI (CMYK-READY)
                </button>
                <p style={{ fontSize: 10, color: '#888', marginTop: 8, lineHeight: 1.4 }}>Generates a ZIP file containing high-res 4960x3508 spreads suitable for CMYK printing.</p>
              </div>
            </div>
          ) : null}
          
          {renderedTab === 'info' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {orderMetadata ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Destination</label>
                    <div style={{ color: '#F3EFE6', fontSize: 13 }}>{orderMetadata.dest || 'N/A'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Dates</label>
                    <div style={{ color: '#F3EFE6', fontSize: 13 }}>{orderMetadata.dates || 'N/A'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Mobile</label>
                    <div style={{ color: '#F3EFE6', fontSize: 13 }}>{orderMetadata.mobile || 'N/A'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Core Meaning</label>
                    <div style={{ color: '#F3EFE6', fontSize: 13, lineHeight: 1.5 }}>{orderMetadata.meaning || 'N/A'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Note to Future Self</label>
                    <div style={{ color: '#F3EFE6', fontSize: 13, lineHeight: 1.5 }}>{orderMetadata.remember || 'N/A'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Soundtrack</label>
                    <div style={{ color: '#F3EFE6', fontSize: 13 }}>{orderMetadata.song || 'N/A'}</div>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#888', fontSize: 12 }}>Load an order to see its reference metadata here.</p>
              )}
            </div>
          ) : null}

        </div>
      </div>

      {/* ICON BAR */}
      <div style={{ 
        width: 50, 
        background: '#1A1918', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        paddingTop: 16,
        paddingBottom: 16,
        borderRadius: isDrawerOpen ? '0 16px 16px 0' : '16px',
        border: '1px solid #333',
        borderLeft: isDrawerOpen ? 'none' : '1px solid #333'
      }}>
        <button 
          onClick={() => toggleTab('edit')} 
          style={{ ...IconStyle, background: activeTab === 'edit' ? '#333' : 'transparent' }}
          title="Edit Image"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
        </button>

        <button 
          onClick={() => toggleTab('text')} 
          style={{ ...IconStyle, background: activeTab === 'text' ? '#333' : 'transparent' }}
          title="Add/Edit Text"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
        </button>

        <button 
          onClick={() => toggleTab('page')} 
          style={{ ...IconStyle, background: activeTab === 'page' ? '#333' : 'transparent' }}
          title="Page Style"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </button>

        <button 
          onClick={() => toggleTab('info')} 
          style={{ ...IconStyle, background: activeTab === 'info' ? '#333' : 'transparent', marginBottom: 0 }}
          title="Order Reference"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </button>
      </div>

    </div>
  );
}
