import React, { useEffect } from 'react';

type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
};

export function ContextMenu({ x, y, onClose, onAction }: ContextMenuProps) {
  useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener('pointerdown', handleClick);
    return () => window.removeEventListener('pointerdown', handleClick);
  }, [onClose]);

  return (
    <div 
      style={{ 
        position: 'fixed', 
        left: x, 
        top: y, 
        background: '#1F1F1F', 
        border: '1px solid #333', 
        borderRadius: 8, 
        padding: '6px 0', 
        zIndex: 9999, 
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        minWidth: 160
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div 
        style={{ padding: '8px 16px', color: '#DDD', fontSize: 12, cursor: 'pointer' }}
        onClick={() => { onAction('full-bleed'); onClose(); }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        Make Full Bleed
      </div>
      <div 
        style={{ padding: '8px 16px', color: '#DDD', fontSize: 12, cursor: 'pointer' }}
        onClick={() => { onAction('adjust'); onClose(); }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        Crop & Adjust
      </div>
      <div 
        style={{ padding: '8px 16px', color: '#DDD', fontSize: 12, cursor: 'pointer' }}
        onClick={() => { onAction('landscape-full-spread'); onClose(); }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        Landscape Full Spread
      </div>
      <div 
        style={{ padding: '8px 16px', color: '#DDD', fontSize: 12, cursor: 'pointer' }}
        onClick={() => { onAction('move-left'); onClose(); }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        Move to Left Page
      </div>
      <div 
        style={{ padding: '8px 16px', color: '#DDD', fontSize: 12, cursor: 'pointer' }}
        onClick={() => { onAction('move-right'); onClose(); }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        Move to Right Page
      </div>
      <div 
        style={{ padding: '8px 16px', color: '#DDD', fontSize: 12, cursor: 'pointer', borderTop: '1px solid #333' }}
        onClick={() => { onAction('reset-frame'); onClose(); }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        Reset Frame Size
      </div>
      <div 
        style={{ padding: '8px 16px', color: '#DDD', fontSize: 12, cursor: 'pointer', borderTop: '1px solid #333' }}
        onClick={() => { onAction('bring-forward'); onClose(); }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        Bring Forward
      </div>
      <div 
        style={{ padding: '8px 16px', color: '#DDD', fontSize: 12, cursor: 'pointer' }}
        onClick={() => { onAction('send-backward'); onClose(); }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        Send Backward
      </div>
      <div style={{ height: 1, background: '#333', margin: '4px 0' }} />
      <div 
        style={{ padding: '8px 16px', color: '#E55', fontSize: 12, cursor: 'pointer' }}
        onClick={() => { onAction('delete'); onClose(); }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        Delete Frame (Del)
      </div>
    </div>
  );
}
