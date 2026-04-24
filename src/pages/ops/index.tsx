import React, { useState, useEffect } from 'react';
import alouraFont from '../../Aloura.otf';
import { useAtelier } from './useAtelier';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { SpreadBar } from './components/SpreadBar';
import { ContextMenu } from './components/ContextMenu';
import { RightDrawer } from './components/RightDrawer';
import * as S from './styles';
import { Side } from './types';

export default function SmrithiDefinitiveAtelier() {
  const { state, actions } = useAtelier();
  const [ctxMenu, setCtxMenu] = useState<{ x: number, y: number, slotId: string, side: Side } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        actions.undo();
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedId) {
        // Prevent deleting if they are typing in an input field
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.getAttribute('contenteditable') === 'true') {
          return;
        }
        actions.deleteSlot(state.selectedId);
        actions.deleteText(state.selectedId);
        return;
      }

      if (e.key.startsWith('Arrow') && state.selectedId) {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.getAttribute('contenteditable') === 'true') {
          return;
        }
        e.preventDefault();
        const delta = e.shiftKey ? 2 : 0.5;
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -delta;
        if (e.key === 'ArrowDown') dy = delta;
        if (e.key === 'ArrowLeft') dx = -delta;
        if (e.key === 'ArrowRight') dx = delta;
        actions.nudgeSelected(dx, dy);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedId, actions]);

  const handleContextAction = (action: string) => {
    if (!ctxMenu) return;
    const { slotId, side } = ctxMenu;
    if (action === 'full-bleed') {
      actions.updateSlot(side, slotId, { x: 0, y: 0, w: 100, h: 100, borderRadius: 0 });
    } else if (action === 'adjust') {
      actions.setAdjustingId(slotId);
    } else if (action === 'landscape-full-spread') {
      // Moves it to the left page and spans across 200% width
      if (side === 'right') {
        actions.transferSlot(slotId, 'left', 0, 0);
      }
      actions.updateSlot('left', slotId, { x: 0, y: 0, w: 200, h: 100, borderRadius: 0 });
    } else if (action === 'reset-frame') {
      actions.updateSlot(side, slotId, { x: 25, y: 25, w: 50, h: 50, borderRadius: undefined });
    } else if (action === 'bring-forward') {
      actions.reorderSlot(side, slotId, 'forward');
    } else if (action === 'send-backward') {
      actions.reorderSlot(side, slotId, 'backward');
    } else if (action === 'move-left' && side === 'right') {
      actions.transferSlot(slotId, 'left', 50, 50);
    } else if (action === 'move-right' && side === 'left') {
      actions.transferSlot(slotId, 'right', 50, 50);
    } else if (action === 'delete') {
      actions.deleteSlot(slotId);
    }
  };

  let selectedElementInfo: { element: EditorSlot | EditorText, type: 'slot' | 'text', side: 'left' | 'right' } | null = null;
  if (state.selectedId && state.activeSpread) {
    const sLeft = state.activeSpread.left.slots.find(s => s.id === state.selectedId);
    const sRight = state.activeSpread.right.slots.find(s => s.id === state.selectedId);
    const tLeft = state.activeSpread.left.texts.find(t => t.id === state.selectedId);
    const tRight = state.activeSpread.right.texts.find(t => t.id === state.selectedId);

    if (sLeft) selectedElementInfo = { element: sLeft, type: 'slot', side: 'left' };
    else if (sRight) selectedElementInfo = { element: sRight, type: 'slot', side: 'right' };
    else if (tLeft) selectedElementInfo = { element: tLeft, type: 'text', side: 'left' };
    else if (tRight) selectedElementInfo = { element: tRight, type: 'text', side: 'right' };
  }
  const handleExportSpreads = async () => {
    try {
      const JSZip = (await import('jszip')).default;
      const { toJpeg } = await import('html-to-image');
      const { saveAs } = await import('file-saver');
      const zip = new JSZip();

      const originalIndex = state.activeIndex;
      
      for (let i = 0; i < state.spreads.length; i++) {
        actions.setActiveIndex(i);
        // Wait for React to render the new spread
        await new Promise(r => setTimeout(r, 400));
        
        const node = document.getElementById('print-spread');
        if (!node) continue;
        
        const dataUrl = await toJpeg(node, {
          canvasWidth: 4960,
          canvasHeight: 3508,
          quality: 1.0,
          pixelRatio: 1,
          style: {
            boxShadow: 'none',
            borderRadius: '0'
          },
          filter: (domNode) => {
            if (domNode instanceof HTMLElement) {
              if (domNode.getAttribute('data-empty-frame') === 'true') {
                return false;
              }
            }
            return true;
          }
        });
        
        const base64Data = dataUrl.split(',')[1];
        zip.file(`spread_${i + 1}_CMYK_READY_300DPI.jpg`, base64Data, { base64: true });
      }

      actions.setActiveIndex(originalIndex);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'smrithi-print-ready.zip');
    } catch (e) {
      console.error('Export failed', e);
      alert('Export failed. Check console.');
    }
  };

  return (
    <div style={{ ...S.appLayout, background: state.globalBgColor }} onContextMenu={(e) => e.preventDefault()}>
      <style>
        {`::-webkit-scrollbar { display: none; }
          @font-face {
            font-family: 'Allura';
            src: url('${alouraFont}') format('opentype');
          }
        `}
      </style>
      {ctxMenu && <ContextMenu x={ctxMenu.x} y={ctxMenu.y} onClose={() => setCtxMenu(null)} onAction={handleContextAction} />}
      
      <div style={S.workspaceRow}>
        <Sidebar 
          library={state.library}
          spreads={state.spreads}
          activeSpread={state.activeSpread}
          selectedId={state.selectedId}
          onUpload={actions.handleUpload}
          onAutoCompose={actions.runAutoCompose}
          onUpdateSlot={actions.updateSlot}
          onReorderSlot={actions.reorderSlot}
          onLoadOrder={actions.loadOrderAssets}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {state.activeSpread && (
            <div style={{ padding: '8px 24px', background: '#5A463E', color: '#F3EFE6', borderBottom: '1px solid #4A362E', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4AF37', fontWeight: 600, marginBottom: '2px' }}>
                  {state.activeSpread.phase} Phase
                </div>
                <h2 style={{ fontSize: '1rem', fontWeight: 500, margin: '0 0 2px 0' }}>{state.activeSpread.category}</h2>
                <p style={{ color: '#E0E0E0', fontSize: '0.75rem', margin: 0 }}>{state.activeSpread.purpose}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#E0E0E0' }}>Radius:</span>
                <input 
                  type="number" 
                  value={state.masterBorderRadius}
                  onChange={(e) => actions.setMasterBorderRadius(Number(e.target.value))}
                  style={{ width: '45px', padding: '4px', borderRadius: '4px', border: '1px solid #7A665E', background: '#4A362E', color: '#FFF', fontSize: '0.75rem' }}
                  min={0}
                  max={40}
                />
              </div>
            </div>
          )}
          <Canvas 
            activeSpread={state.activeSpread}
            library={state.library}
            selectedId={state.selectedId}
            masterBorderRadius={state.masterBorderRadius}
            zoom={state.zoom}
            pan={state.pan}
            adjustingId={state.adjustingId}
            onClearAsset={actions.clearAsset}
            onAddText={actions.addText}
            onAddSlot={actions.addSlot}
            onAddSlotWithAsset={actions.addSlotWithAsset}
            onUpdateText={actions.updateText}
            onUpdateSlot={actions.updateSlot}
            onSetSelectedId={actions.setSelectedId}
            onContextMenu={(x, y, slotId, side) => setCtxMenu({ x, y, slotId, side })}
            setZoom={actions.setZoom}
            setPan={actions.setPan}
            setAdjustingId={actions.setAdjustingId}
          />
        </div>

        <RightDrawer 
          activeSpread={state.activeSpread || null}
          selectedElementInfo={selectedElementInfo}
          globalBgColor={state.globalBgColor}
          onUpdateSlot={actions.updateSlot}
          onUpdateText={actions.updateText}
          onUpdateSpread={actions.updateSpread}
          onSetAllSpreadsBgColor={actions.setAllSpreadsBgColor}
          onSetGlobalBgColor={actions.setGlobalBgColor}
          onAddText={actions.addText}
          onExportSpreads={handleExportSpreads}
          orderMetadata={state.orderMetadata}
        />
      </div>

      <SpreadBar 
        spreads={state.spreads}
        activeIndex={state.activeIndex}
        onSetActive={actions.setActiveIndex}
      />
    </div>
  );
}