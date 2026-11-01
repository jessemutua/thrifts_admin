// src/ui/components/pirpleSignature.tsx
// "Made by Pirple AI" with the Pirple flower mark: seven overlapping circles (the logo's "seed of life"), drawn inline
// so nothing is loaded from elsewhere. Its purples come from portalTheme.css (--pirple-*), lighter in dark mode.
const RADIUS = 23.5;
const CENTRES: [number, number][] = [
  [50, 50], [50, 26.5], [70.35, 38.25], [70.35, 61.75], [50, 73.5], [29.65, 61.75], [29.65, 38.25],
];

export function PirpleMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ flex: 'none' }}>
      <defs>
        <radialGradient id="pirpleGlow" cx="50" cy="50" r="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: 'var(--pirple-glow)' }} />
          <stop offset="0.4" style={{ stopColor: 'var(--pirple-mid)' }} />
          <stop offset="1" style={{ stopColor: 'var(--pirple-deep)' }} />
        </radialGradient>
      </defs>
      <g fill="none" stroke="url(#pirpleGlow)" strokeWidth={size < 32 ? 4.5 : 3}>
        {CENTRES.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={RADIUS} />)}
      </g>
    </svg>
  );
}

export function PirpleSignature({ label }: { label: string }) {
  return (
    <div className="row pirple-signature" style={{ justifyContent: 'center' }}>
      <PirpleMark />
      <span>{label}</span>
    </div>
  );
}
