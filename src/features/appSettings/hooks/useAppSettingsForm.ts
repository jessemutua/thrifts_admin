// src/features/appSettings/hooks/useAppSettingsForm.ts
// The app version settings every phone receives in GET /me. Same checks as the server
// (reja src/services/appSettingsRules.js), plus a warning when a change would block phones.
import { useEffect, useState } from 'react';
import { getAppSettings, saveAppSettings } from '../../../core/services/portalRequests';
import { errorText, useLoad } from '../../shared/hooks/useLoad';
import { compareVersions, isVersion } from '../../../core/rules/versionRules';
import type { AppVersions } from '../../../core/types/adminTypes';

export function useAppSettingsForm(onSaved: () => void) {
  const loaded = useLoad(getAppSettings, []);
  const saved = loaded.data?.versions;
  const [form, setForm] = useState<AppVersions>({ minVersion: '', latestVersion: '', downloadUrl: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (saved) setForm(saved); }, [saved]);

  const set = (key: keyof AppVersions) => (value: string) => setForm((f) => ({ ...f, [key]: value.trim() }));
  const minOk = isVersion(form.minVersion);
  const latestOk = isVersion(form.latestVersion);
  const orderOk = !minOk || !latestOk || compareVersions(form.minVersion, form.latestVersion) <= 0;
  const linkOk = form.downloadUrl === '' || /^https:\/\/\S+$/.test(form.downloadUrl);
  const changed = !!saved && (saved.minVersion !== form.minVersion || saved.latestVersion !== form.latestVersion || saved.downloadUrl !== form.downloadUrl);
  const raisesMin = !!saved && minOk && isVersion(saved.minVersion) && compareVersions(form.minVersion, saved.minVersion) > 0;
  const valid = minOk && latestOk && orderOk && linkOk;

  async function save() {
    if (!valid || !changed) return;
    setBusy(true);
    setError(null);
    try {
      await saveAppSettings(form);
      loaded.reload();
      onSaved();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return { ...loaded, form, set, minOk, latestOk, orderOk, linkOk, changed, raisesMin, valid, save, busy, saveError: error, reset: () => saved && setForm(saved) };
}
