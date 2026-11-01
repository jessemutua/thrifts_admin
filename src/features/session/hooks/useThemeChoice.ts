// src/features/session/hooks/useThemeChoice.ts
// Light or dark. Follows the computer until Chief taps the moon/sun, then remembers his choice on this browser.
import { useEffect, useState } from 'react';

type Choice = 'light' | 'dark';
const KEY = 'thrifts-admin-theme';

function systemChoice(): Choice {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function savedChoice(): Choice | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

export function useThemeChoice() {
  const [choice, setChoice] = useState<Choice>(() => savedChoice() ?? systemChoice());
  useEffect(() => {
    if (savedChoice()) document.documentElement.dataset.theme = choice;
  }, [choice]);
  const toggle = () => {
    const next: Choice = choice === 'dark' ? 'light' : 'dark';
    try { window.localStorage.setItem(KEY, next); } catch { /* still switches for this visit */ }
    document.documentElement.dataset.theme = next;
    setChoice(next);
  };
  return { choice, toggle };
}
