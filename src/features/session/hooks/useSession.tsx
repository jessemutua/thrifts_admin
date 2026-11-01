// src/features/session/hooks/useSession.tsx
// Whether Chief is signed in, for the whole portal. On opening, it quietly asks the server for a fresh pass from the
// kept session (cookie), so a refresh or a new tab does not need the password again (for up to the cookie's life).
// Screens read it with useSession(); only SignInScreen calls signIn().
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { refreshToken, setToken, whenSignedOut } from '../../../core/services/portalApi';
import { signInRequest, signOutRequest } from '../../../core/services/portalRequests';

type State = 'checking' | 'signedOut' | 'signedIn';
type Session = {
  state: State;
  who: string | null; // the email or name inside the pass, when it carries one
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

// Reads the email (or name) inside the pass. Display only: the server checks the pass on every call.
function whoFromToken(token: string): string | null {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const p = JSON.parse(atob(part)) as { email?: unknown; name?: unknown };
    if (typeof p.email === 'string') return p.email;
    if (typeof p.name === 'string') return p.name;
  } catch {
    // not readable: show nothing
  }
  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>('checking');
  const [who, setWho] = useState<string | null>(null);

  useEffect(() => {
    whenSignedOut(() => { setToken(null); setState('signedOut'); });
    refreshToken().then((ok) => setState(ok ? 'signedIn' : 'signedOut'));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token } = await signInRequest(email, password);
    setToken(token);
    setWho(whoFromToken(token) ?? email);
    setState('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    try { await signOutRequest(); } catch { /* the pass is dropped either way */ }
    setToken(null);
    setWho(null);
    setState('signedOut');
  }, []);

  return <SessionContext.Provider value={{ state, who, signIn, signOut }}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const s = useContext(SessionContext);
  if (!s) throw new Error('useSession must be used inside SessionProvider');
  return s;
}
