// src/core/rules/verticalFormRules.ts
// The Verticals editor's pure rules: turning a saved vertical into the form and back, and the small helpers that let
// an admin type choices as plain lines ("Very good" or "very_good = Very good"). The server checks everything again
// (reja src/services/verticalDefinitionRules.js); these only make the form easy and catch the obvious slips early.
import type { AdminVertical, VerticalField, VerticalSettings, VerticalType } from '../types/adminTypes';

export const FIELD_TYPES = ['text', 'select', 'isbn'] as const;
export const ICONS = ['shirt', 'shoe', 'bag', 'perfume', 'jewel', 'book', 'grid'] as const;
export const MAX_CARD_FIELDS = 3;

// One field as the form holds it: choices and suggestions as text, one per line or comma-separated
export type FieldForm = {
  key: string;
  label: string;
  type: string;
  choices: string; // select: one per line, "value = Label" or just "Label"
  suggestions: string; // text: comma-separated
  hint: string;
  maxLength: string;
  more: boolean;
  hidden: boolean;
  saved: boolean; // already saved once: key and type are locked, it cannot be removed
};
export type TypeForm = { key: string; label: string; fields: string[]; legacy: string };
export type VerticalForm = {
  key: string;
  label: string;
  showAtSignup: boolean;
  fields: FieldForm[];
  questions: FieldForm[];
  types: TypeForm[];
  variants: boolean;
  cardFields: string[];
  apparel: boolean;
  category: string;
  gtinField: string;
  brandFields: string[];
  icon: string;
};

// "Very good!" -> "very_good". Used for keys made from a label.
export function slugKey(label: string): string {
  const s = label.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30);
  return /^[a-z]/.test(s) ? s : s ? `f_${s}`.slice(0, 30) : '';
}

export function choicesToText(options: { value: string; label: string }[] | undefined): string {
  return (options ?? []).map((o) => (slugKey(o.label) === o.value ? o.label : `${o.value} = ${o.label}`)).join('\n');
}

export function textToChoices(text: string): { value: string; label: string }[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map((line) => {
      const at = line.indexOf('=');
      if (at > 0) return { value: line.slice(0, at).trim().toLowerCase(), label: line.slice(at + 1).trim() };
      return { value: slugKey(line), label: line };
    });
}

export const listToText = (list: string[] | undefined) => (list ?? []).join(', ');
export const textToList = (text: string) => text.split(',').map((w) => w.trim()).filter((w) => w !== '');

export function fieldToForm(f: VerticalField, saved: boolean): FieldForm {
  return {
    key: f.key,
    label: f.label,
    type: f.type,
    choices: choicesToText(f.options),
    suggestions: listToText(f.suggestions),
    hint: f.hint ?? '',
    maxLength: f.maxLength ? String(f.maxLength) : '',
    more: f.more === true,
    hidden: f.hidden === true,
    saved,
  };
}

export function formToField(f: FieldForm): VerticalField {
  const out: VerticalField = { key: f.key.trim(), label: f.label.trim(), type: f.type };
  if (f.type === 'select') out.options = textToChoices(f.choices);
  if (f.type === 'text') {
    const words = textToList(f.suggestions);
    if (words.length) out.suggestions = words;
    if (f.maxLength.trim() !== '') out.maxLength = Number(f.maxLength);
  }
  if (f.hint.trim()) out.hint = f.hint.trim();
  if (f.more) out.more = true;
  if (f.hidden) out.hidden = true;
  return out;
}

export const emptyField = (): FieldForm => ({ key: '', label: '', type: 'text', choices: '', suggestions: '', hint: '', maxLength: '', more: false, hidden: false, saved: false });
export const emptyType = (): TypeForm => ({ key: '', label: '', fields: [], legacy: '' });

// A saved vertical (or a template, saved = false) as the form
export function toForm(v: Pick<AdminVertical, 'key' | 'label' | 'showAtSignup' | 'registrationFields' | 'productTypes' | 'productAttributes' | 'settings'>, saved: boolean): VerticalForm {
  const s: VerticalSettings = v.settings;
  return {
    key: v.key,
    label: v.label,
    showAtSignup: v.showAtSignup,
    fields: v.productAttributes.map((f) => fieldToForm(f, saved)),
    questions: v.registrationFields.map((f) => fieldToForm(f, saved)),
    types: v.productTypes.map((x: VerticalType) => ({ key: x.key, label: x.label, fields: x.fields.filter((k) => k !== 'category'), legacy: listToText(x.legacy) })),
    variants: s.variants.enabled,
    cardFields: s.cardFields,
    apparel: s.feed.apparel,
    category: s.feed.category,
    gtinField: s.feed.gtinField,
    brandFields: s.feed.brandFields,
    icon: s.icon,
  };
}

export function blankForm(): VerticalForm {
  return {
    key: '', label: '', showAtSignup: false, fields: [emptyField()], questions: [], types: [],
    variants: false, cardFields: [], apparel: false, category: '', gtinField: '', brandFields: [], icon: 'grid',
  };
}

// What POST / PUT /admin/verticals takes
export function toPayload(form: VerticalForm) {
  return {
    key: form.key.trim(),
    label: form.label.trim(),
    showAtSignup: form.showAtSignup,
    registrationFields: form.questions.map(formToField),
    productAttributes: form.fields.map(formToField),
    productTypes: form.types.map((x) => ({ key: x.key.trim(), label: x.label.trim(), fields: x.fields, legacy: textToList(x.legacy), sizeSuggestions: [] })),
    settings: {
      variants: { enabled: form.variants },
      cardFields: form.cardFields,
      feed: { apparel: form.apparel, category: form.category.trim(), gtinField: form.gtinField, brandFields: form.brandFields },
      icon: form.icon,
    },
  };
}

// Slips the form can see before sending. The server's list is the final word.
export function formProblems(form: VerticalForm): string[] {
  const out: string[] = [];
  if (form.label.trim().length < 2) out.push('Give the vertical a name.');
  if (!/^[a-z][a-z0-9_]{2,39}$/.test(form.key.trim())) out.push('The key must be 3 to 40 small letters, digits or _ (for example books).');
  const keys = form.fields.map((f) => f.key.trim());
  if (form.fields.length === 0) out.push('Add at least one product field.');
  form.fields.forEach((f, i) => {
    if (!f.label.trim()) out.push(`Product field ${i + 1} needs a label.`);
    if (!/^[a-z][a-z0-9_]{1,29}$/.test(f.key.trim())) out.push(`Product field "${f.label || i + 1}" needs a key (small letters, digits and _).`);
    if (f.type === 'select' && textToChoices(f.choices).length < 2) out.push(`"${f.label || f.key}" needs at least two choices.`);
  });
  const dupes = keys.filter((k, i) => k && keys.indexOf(k) !== i);
  if (dupes.length) out.push(`The key "${dupes[0]}" is used twice.`);
  if (form.cardFields.length > MAX_CARD_FIELDS) out.push(`A store card shows at most ${MAX_CARD_FIELDS} fields.`);
  if (form.category.trim() && !/^\d{1,7}$/.test(form.category.trim())) out.push('The Meta category must be a number (for books, 543543).');
  return out;
}

// Toggles a key in a list (field chips), keeping at most max
export function toggleIn(list: string[], key: string, max = 99): string[] {
  if (list.includes(key)) return list.filter((k) => k !== key);
  return list.length >= max ? list : [...list, key];
}
