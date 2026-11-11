// src/ui/components/portalShell.tsx
// The frame around every signed-in page: the side menu (Home, Shops, People, Feedback, App), who is signed in,
// the dark-mode switch and Sign out. On a narrow screen the menu folds away behind a button in a top bar.
// New sections are added to NAV below and to the routes in App.tsx.
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { t } from '../../text/portalText';
import { useSession } from '../../features/session/hooks/useSession';
import { useThemeChoice } from '../../features/session/hooks/useThemeChoice';
import { PirpleSignature } from './pirpleSignature';
import { ChartIcon, ChatIcon, GlobeIcon, GridIcon, HomeIcon, MenuIcon, MoonIcon, PeopleIcon, PhoneIcon, ShopIcon, SunIcon } from './portalIcons';

const NAV = [
  { to: '/', label: t('nav.home'), Icon: HomeIcon, end: true },
  { to: '/metrics', label: t('nav.metrics'), Icon: ChartIcon, end: false },
  { to: '/online', label: t('nav.online'), Icon: GlobeIcon, end: false },
  { to: '/shops', label: t('nav.shops'), Icon: ShopIcon, end: false },
  { to: '/people', label: t('nav.people'), Icon: PeopleIcon, end: false },
  { to: '/feedback', label: t('nav.feedback'), Icon: ChatIcon, end: false },
  { to: '/verticals', label: t('nav.verticals'), Icon: GridIcon, end: false },
  { to: '/app', label: t('nav.app'), Icon: PhoneIcon, end: false },
];

function Brand() {
  return (<div className="brand"><span className="brand-word">thrifts</span><span className="brand-tag">{t('brand.tag')}</span></div>);
}

export function PortalShell() {
  const { who, signOut } = useSession();
  const { choice, toggle } = useThemeChoice();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  const themeButton = (
    <button className="btn ghost icon-btn" onClick={toggle} aria-label={t('shell.theme')} title={t('shell.theme')}>
      {choice === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );

  return (
    <div className="shell">
      <header className="topbar">
        <button className="btn ghost icon-btn" onClick={() => setOpen(true)} aria-label={t('shell.menu')}><MenuIcon /></button>
        <Brand />
        {themeButton}
      </header>
      <aside className={`side${open ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
        <Brand />
        <nav className="nav">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon />{label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <div className="who">
            <div className="muted">{t('shell.signedInAs')}</div>
            <div className="ellipsis" style={{ fontWeight: 600 }}>{who ?? t('shell.admin')}</div>
          </div>
          <div className="row">
            <button className="btn" style={{ flex: 1 }} onClick={() => void signOut()}>{t('shell.signOut')}</button>
            {themeButton}
          </div>
          <PirpleSignature label={t('brand.madeBy')} />
        </div>
      </aside>
      <main className="page"><Outlet /></main>
    </div>
  );
}

// The title row at the top of each page, with optional buttons on the right
export function PageHead({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="page-head">
      <div className="stack-s" style={{ gap: 2 }}>
        <h1 className="page-title">{title}</h1>
        {sub ? <div className="caption">{sub}</div> : null}
      </div>
      {children ? <div className="row wrap">{children}</div> : null}
    </div>
  );
}
