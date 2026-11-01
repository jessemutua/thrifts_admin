// src/ui/components/searchBox.tsx
// A search input with a magnifier. It reports what was typed after a short pause (debounce), so the server is
// asked once per word, not once per key.
import { useEffect, useState } from 'react';
import { SearchIcon } from './portalIcons';

type Props = { value: string; onChange: (v: string) => void; placeholder: string; autoFocus?: boolean };

export function SearchBox({ value, onChange, placeholder, autoFocus }: Props) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (draft === value) return;
    const id = window.setTimeout(() => onChange(draft.trim()), 350);
    return () => window.clearTimeout(id);
  }, [draft, value, onChange]);
  return (
    <label className="search">
      <SearchIcon />
      <input className="input" type="search" value={draft} placeholder={placeholder} aria-label={placeholder}
        autoFocus={autoFocus} onChange={(e) => setDraft(e.target.value)} />
    </label>
  );
}
