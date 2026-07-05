'use client';

import { useEffect, useRef, useState } from 'react';

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface Props {
  items: ActionMenuItem[];
}

export default function PostActionMenu({ items }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="더보기"
        style={{
          background: 'none',
          border: 'none',
          fontSize: 22,
          cursor: 'pointer',
          padding: '4px 10px',
          borderRadius: 8,
          color: 'var(--color-on-surface-variant)',
          lineHeight: 1,
        }}
      >
        ···
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '110%',
            background: 'var(--color-surface-container-lowest)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-card)',
            minWidth: 140,
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 14,
                color: item.danger ? 'var(--color-error)' : 'var(--color-on-surface)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
