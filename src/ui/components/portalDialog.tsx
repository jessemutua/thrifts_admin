// src/ui/components/portalDialog.tsx
// A centred box over the page for actions that change something (set pilot, mark paid, suspend). Escape or a click
// outside closes it, unless it is busy saving.
import { useEffect } from 'react';

type Props = { title: string; subtitle?: string; onClose: () => void; busy?: boolean; children: React.ReactNode; footer: React.ReactNode };

export function PortalDialog({ title, subtitle, onClose, busy, children, footer }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, busy]);
  return (
    <div className="dialog-back" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="card dialog" role="dialog" aria-modal="true" aria-label={title}>
        <div className="dialog-head">
          <h2 style={{ fontSize: 'var(--f-heading)' }}>{title}</h2>
          {subtitle ? <p className="caption" style={{ margin: '4px 0 0' }}>{subtitle}</p> : null}
        </div>
        <div className="dialog-body">{children}</div>
        <div className="dialog-foot">{footer}</div>
      </div>
    </div>
  );
}
