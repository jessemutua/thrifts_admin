// src/ui/components/seeAllLink.tsx
// The small "See all ->" link in a Home card's header, to the page where that section's detail lives.
import { Link } from 'react-router-dom';

export function SeeAllLink({ to, label }: { to: string; label: string }) {
  return <Link to={to} className="small" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{label} →</Link>;
}
