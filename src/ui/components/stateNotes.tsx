// src/ui/components/stateNotes.tsx
// The three states every screen can be in besides "showing data": loading, failed (with a retry), and empty.
import { t } from '../../text/portalText';

export function LoadingNote() {
  return (<div className="loading" role="status" aria-label={t('common.loading')}><div className="spinner" /></div>);
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="note-box error row-between" role="alert">
      <span>{message}</span>
      {onRetry ? <button className="btn small" onClick={onRetry}>{t('common.retry')}</button> : null}
    </div>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <div className="empty">{children}</div>;
}
