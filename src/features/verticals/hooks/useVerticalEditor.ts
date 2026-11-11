// src/features/verticals/hooks/useVerticalEditor.ts
// One vertical in the editor. /verticals/new starts blank or from a template (?from=books); /verticals/:key loads a
// saved one. Fashion & apparel is built in: it opens read only. Saving sends the whole vertical; the server's list of
// problems (plain sentences) is shown as it comes back.
import { useEffect, useState } from 'react';
import { createVerticalRequest, getVertical, getVerticalTemplate, updateVerticalRequest } from '../../../core/services/portalRequests';
import { errorText } from '../../shared/hooks/useLoad';
import { ApiError } from '../../../core/services/portalApi';
import {
  blankForm, emptyField, emptyType, formProblems, slugKey, toForm, toggleIn, toPayload, MAX_CARD_FIELDS,
  type FieldForm, type TypeForm, type VerticalForm,
} from '../../../core/rules/verticalFormRules';

type List = 'fields' | 'questions';

export function useVerticalEditor(keyParam: string | undefined, fromTemplate: string | null, onSaved: (key: string, created: boolean) => void) {
  const isNew = !keyParam || keyParam === 'new';
  const [form, setForm] = useState<VerticalForm | null>(isNew && !fromTemplate ? blankForm() : null);
  const [builtIn, setBuiltIn] = useState(false);
  const [shopCount, setShopCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    setLoadError(null);
    const load = isNew
      ? fromTemplate
        ? getVerticalTemplate(fromTemplate).then((r) => toForm({ ...r.template, showAtSignup: false }, false))
        : Promise.resolve(null)
      : getVertical(keyParam!).then((r) => {
          if (live) {
            setBuiltIn(r.vertical.builtIn);
            setShopCount(r.vertical.shopCount);
          }
          return toForm(r.vertical, true);
        });
    load.then((f) => { if (live && f) setForm(f); }, (err) => { if (live) setLoadError(errorText(err)); });
    return () => { live = false; };
  }, [isNew, keyParam, fromTemplate, tick]);

  const update = (change: (f: VerticalForm) => VerticalForm) => setForm((f) => (f ? change(f) : f));
  const readOnly = builtIn;

  // A field row. A new field gets its key from its label until the key is typed by hand.
  const setField = (list: List, i: number, patch: Partial<FieldForm>) => update((f) => {
    const rows = [...f[list]];
    const row = { ...rows[i], ...patch };
    if (patch.label !== undefined && !row.saved && (rows[i].key === '' || rows[i].key === slugKey(rows[i].label))) row.key = slugKey(patch.label);
    rows[i] = row;
    return { ...f, [list]: rows };
  });
  const addField = (list: List) => update((f) => ({ ...f, [list]: [...f[list], emptyField()] }));
  const removeField = (list: List, i: number) => update((f) => {
    const gone = f[list][i];
    if (gone.saved) return f; // saved fields are hidden, never removed
    const key = gone.key;
    return {
      ...f,
      [list]: f[list].filter((_, j) => j !== i),
      types: list === 'fields' ? f.types.map((x) => ({ ...x, fields: x.fields.filter((k) => k !== key) })) : f.types,
      cardFields: list === 'fields' ? f.cardFields.filter((k) => k !== key) : f.cardFields,
      brandFields: list === 'fields' ? f.brandFields.filter((k) => k !== key) : f.brandFields,
    };
  });
  const moveField = (list: List, i: number, by: -1 | 1) => update((f) => {
    const rows = [...f[list]];
    const j = i + by;
    if (j < 0 || j >= rows.length) return f;
    [rows[i], rows[j]] = [rows[j], rows[i]];
    return { ...f, [list]: rows };
  });

  const setType = (i: number, patch: Partial<TypeForm>) => update((f) => {
    const rows = [...f.types];
    const row = { ...rows[i], ...patch };
    if (patch.label !== undefined && (rows[i].key === '' || rows[i].key === slugKey(rows[i].label))) row.key = slugKey(patch.label);
    rows[i] = row;
    return { ...f, types: rows };
  });
  const addType = () => update((f) => ({ ...f, types: [...f.types, { ...emptyType(), fields: f.fields.map((x) => x.key).filter((k) => k && k !== 'category') }] }));
  const removeType = (i: number) => update((f) => ({ ...f, types: f.types.filter((_, j) => j !== i) }));
  const toggleTypeField = (i: number, key: string) => setType(i, { fields: form ? toggleIn(form.types[i].fields, key) : [] });

  const set = <K extends keyof VerticalForm>(k: K, v: VerticalForm[K]) => update((f) => ({ ...f, [k]: v }));
  const toggleCard = (key: string) => update((f) => ({ ...f, cardFields: toggleIn(f.cardFields, key, MAX_CARD_FIELDS) }));
  const toggleBrand = (key: string) => update((f) => ({ ...f, brandFields: toggleIn(f.brandFields, key, 3) }));

  async function save() {
    if (!form || readOnly) return;
    const local = formProblems(form);
    if (local.length) {
      setProblems(local);
      return;
    }
    setBusy(true);
    setProblems([]);
    try {
      const payload = toPayload(form);
      const r = isNew ? await createVerticalRequest(payload) : await updateVerticalRequest(form.key, payload);
      setForm(toForm(r.vertical, true));
      setShopCount(r.vertical.shopCount);
      onSaved(r.vertical.key, isNew);
    } catch (err) {
      setProblems(err instanceof ApiError && err.details.length ? err.details : [errorText(err)]);
    } finally {
      setBusy(false);
    }
  }

  const fieldKeys = form ? form.fields.map((f) => f.key).filter((k) => k !== '') : [];
  return {
    isNew, form, readOnly, shopCount, loadError, problems, busy, fieldKeys,
    retry: () => setTick((n) => n + 1),
    set, setField, addField, removeField, moveField, setType, addType, removeType, toggleTypeField, toggleCard, toggleBrand, save,
  };
}
