import React from 'react';
import { EditorSpread } from '../types';
import * as S from '../styles';

type SpreadBarProps = {
  spreads: EditorSpread[];
  activeIndex: number;
  onSetActive: (index: number) => void;
};

export function SpreadBar({ spreads, activeIndex, onSetActive }: SpreadBarProps) {
  const grouped: Record<string, { spreads: EditorSpread[], startIndex: number }> = {};
  
  spreads.forEach((spread, i) => {
    if (!grouped[spread.phase]) {
      grouped[spread.phase] = { spreads: [], startIndex: i };
    }
    grouped[spread.phase].spreads.push(spread);
  });

  return (
    <footer style={{ ...S.spreadBar, display: 'flex', overflowX: 'auto', padding: '16px 24px', gap: '40px' }}>
      {Object.entries(grouped).map(([phaseName, group]) => (
        <div key={phaseName} style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666', fontWeight: 600, paddingBottom: '4px', borderBottom: '1px solid #eee', marginBottom: '4px' }}>
            {phaseName}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {group.spreads.map((spread, localIdx) => {
              const globalIdx = group.startIndex + localIdx;
              const isSelected = globalIdx === activeIndex;

              return (
                <div 
                  key={spread.id} 
                  style={{ ...S.thumbContainer, cursor: 'pointer', transition: 'all 0.2s' }} 
                  onClick={() => onSetActive(globalIdx)}
                >
                  <div style={{...S.spreadThumb, borderColor: isSelected ? "#D4AF37" : "transparent"}}>
                    <div style={S.miniPageWrapper}>
                      {spread.left.slots.some(s => s.assetId) && <div style={S.miniImageIndicator} />}
                    </div>
                    <div style={S.miniPageWrapper}>
                      {spread.right.slots.some(s => s.assetId) && <div style={S.miniImageIndicator} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </footer>
  );
}