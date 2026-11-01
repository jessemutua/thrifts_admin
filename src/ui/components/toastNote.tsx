// src/ui/components/toastNote.tsx
// A short confirmation at the bottom of the screen ("Payment recorded") that fades after a few seconds.
// Any screen calls useToast()("text").
import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext<(text: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [text, setText] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = useCallback((value: string) => {
    setText(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setText(null), 3200);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {text ? <div className="toast" role="status">{text}</div> : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
