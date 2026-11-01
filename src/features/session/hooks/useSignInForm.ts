// src/features/session/hooks/useSignInForm.ts
// The sign-in form's logic: what is typed, whether it is sending, and the server's message when it refuses.
import { useState } from 'react';
import { useSession } from './useSession';
import { errorText } from '../../shared/hooks/useLoad';

export function useSignInForm() {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = email.trim().includes('@') && password.length > 0 && !busy;

  async function submit() {
    if (!canSend) return;
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(errorText(err));
      setPassword(''); // never leave a refused password in the box
    } finally {
      setBusy(false);
    }
  }

  return { email, setEmail, password, setPassword, busy, error, canSend, submit };
}
