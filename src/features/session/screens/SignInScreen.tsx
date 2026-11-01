// src/features/session/screens/SignInScreen.tsx
// The only screen shown when signed out. Email and password go to our own server (/admin-session), never to Neon
// from the browser, and only accounts listed as admins get in.
import { t } from '../../../text/portalText';
import { useSignInForm } from '../hooks/useSignInForm';
import { PirpleSignature } from '../../../ui/components/pirpleSignature';

export function SignInScreen() {
  const f = useSignInForm();
  return (
    <div className="signin">
      <form className="card signin-card stack" onSubmit={(e) => { e.preventDefault(); void f.submit(); }}>
        <div className="brand" style={{ padding: 0 }}><span className="brand-word">thrifts</span><span className="brand-tag">{t('brand.tag')}</span></div>
        <div>
          <h1 style={{ fontSize: 'var(--f-heading)' }}>{t('signIn.title')}</h1>
          <p className="caption" style={{ margin: '4px 0 0' }}>{t('signIn.sub')}</p>
        </div>
        <label className="field">
          <span className="field-label">{t('signIn.email')}</span>
          <input className="input" type="email" autoComplete="username" value={f.email} onChange={(e) => f.setEmail(e.target.value)} autoFocus />
        </label>
        <label className="field">
          <span className="field-label">{t('signIn.password')}</span>
          <input className="input" type="password" autoComplete="current-password" value={f.password} onChange={(e) => f.setPassword(e.target.value)} />
        </label>
        {f.error ? <div className="note-box error" role="alert">{f.error}</div> : null}
        <button className="btn primary full" type="submit" disabled={!f.canSend}>{f.busy ? t('signIn.busy') : t('signIn.button')}</button>
        <p className="caption" style={{ margin: 0 }}>{t('signIn.limit')}</p>
        <PirpleSignature label={t('brand.madeBy')} />
      </form>
    </div>
  );
}
