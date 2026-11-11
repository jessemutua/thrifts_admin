// tests/portalRulesCheck.mjs   npm run check   (or: node --experimental-strip-types tests/portalRulesCheck.mjs)
// Checks the portal's pure rules: money and Kenya dates, plan labels, M-Pesa codes, version order, and that every
// text the screens use exists. No network, no browser. Prints PASS or FAIL for each check.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as f from '../src/core/rules/formatRules.ts';
import * as p from '../src/core/rules/planRules.ts';
import * as v from '../src/core/rules/versionRules.ts';
import { t } from '../src/text/portalText.ts';
import { metricsSummary, growthText } from '../src/core/rules/metricsSummary.ts';
import * as vf from '../src/core/rules/verticalFormRules.ts';

let failed = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${!ok && detail ? ` -- ${detail}` : ''}`);
  if (!ok) failed += 1;
}

check('KES with commas', f.formatKes(1234567) === 'KES 1,234,567');
check('KES of nothing is 0', f.formatKes(null) === 'KES 0');
check('count of nothing is a dash', f.formatCount(null) === '–');
check('date in Kenya time (late UTC evening is the next day)', f.formatDate('2026-11-30T22:30:00Z') === '1 Dec 2026');
check('date and time in Kenya', f.formatDateTime('2026-11-01T05:05:00Z') === '1 Nov, 08:05');
check('chart day label', f.formatDayLabel('2026-11-07') === '7 Nov');
const now = new Date('2026-11-01T09:00:00Z');
check('today', f.relativeDay('2026-11-01T20:00:00Z', now) === 'today');
check('tomorrow counts Kenya midnight', f.relativeDay('2026-11-01T21:30:00Z', now) === 'tomorrow');
check('days ago', f.relativeDay('2026-10-27T09:00:00Z', now) === '5 days ago');
check('date input today', f.kenyaDateInput(now) === '2026-11-01');
check('date input in 30 days', f.kenyaDateInput(now, 30) === '2026-12-01');
check('no date gives empty text', f.formatDate(null) === '' && f.relativeDay(undefined) === '');

check('every plan group has a label', p.BUCKET_ORDER.every((b) => p.bucketLabel(b) !== b));
check('overdue is red, paid is green', p.bucketTone('overdue') === 'danger' && p.bucketTone('paid') === 'success');
check('needs a call: pilot ended, grace, overdue only', ['grace', 'pilot_ended', 'overdue'].every(p.needsCall) && !p.needsCall('pilot') && !p.needsCall('paid'));
check('unknown group is not a group', !p.isBucket('weird') && p.isBucket('pilot'));
check('payment history line', p.describeChange({ source: 'manual', newStatus: 'active', oldStatus: 'active', note: 'paid 1 month' }) === 'Payment recorded');
check('pilot history line', p.describeChange({ source: 'trial', newStatus: 'active', oldStatus: null, note: 'pilot until 2026-12-01' }) === 'Pilot set');
check('suspend history line', p.describeChange({ source: 'admin', newStatus: 'suspended', oldStatus: 'active', note: 'suspended' }) === 'Suspended');
check('M-Pesa code shape', p.looksLikeMpesaCode('tk31ab2cde') && !p.looksLikeMpesaCode('CASH'));

check('1.10.0 is newer than 1.9.2', v.compareVersions('1.10.0', '1.9.2') === 1);
check('1.0.1 is older than 1.1.0', v.compareVersions('1.0.1', '1.1.0') === -1);
check('"1.1" is not a version', !v.isVersion('1.1') && v.isVersion('1.1.0'));

const summary = metricsSummary({ generatedAt: '2026-11-01T05:00:00Z', merchants: { stores: 12, mainShops: 10, sellingLast30Days: 6 },
  stock: { valueKes: 1250000, units: 3400, shopsWithStock: 9 }, products: { live: 820 },
  sales: { allTime: { count: 410, totalKes: 980000, avgBasketKes: 2390 }, last30: { count: 120, totalKes: 310000 }, growthPct: 18, mpesaSharePct: 64 } });
check('summary has stock value', summary.includes('KES 1,250,000 at selling price'));
check('summary has growth with a sign', summary.includes('+18% on the 30 days before'));
check('summary is one fact per line', summary.split('\n').length === 6, summary);
check('growth from nothing is said in words', growthText(null) === 'no sales in the 30 days before' && growthText(-5) === '-5% on the 30 days before');
check('text fills its blanks', t('shops.count', { n: 12 }) === '12 shops');
check('a blank with no value stays visible', t('shops.count') === '{n} shops');

// Every t('...') key written in the screens exists in portalText.ts (a typo would show the key itself)
function files(dir) {
  return readdirSync(dir).flatMap((n) => {
    const full = join(dir, n);
    return statSync(full).isDirectory() ? files(full) : /\.tsx?$/.test(n) ? [full] : [];
  });
}
const SRC = fileURLToPath(new URL('../src', import.meta.url)); // works on Windows too
const used = new Set();
for (const file of files(SRC).filter((x) => !x.endsWith('portalText.ts'))) {
  for (const m of readFileSync(file, 'utf8').matchAll(/\bt\('([\w.]+)'/g)) used.add(m[1]);
}
const missing = [...used].filter((k) => t(k) === k);
check(`all ${used.size} texts used by screens exist`, missing.length === 0, missing.join(', '));

// Verticals editor: keys from labels, choices typed as lines, the form and back, early problems
check('vertical: key from a label', vf.slugKey("Learner's book!") === 'learner_s_book' && vf.slugKey('8-4-4') === 'f_8_4_4');
check('vertical: choices from plain lines', JSON.stringify(vf.textToChoices('Very good\n\nnew = Brand new')) === JSON.stringify([{ value: 'very_good', label: 'Very good' }, { value: 'new', label: 'Brand new' }]));
check('vertical: choices back to lines', vf.choicesToText([{ value: 'very_good', label: 'Very good' }, { value: 'eight_four_four', label: '8-4-4' }]) === 'Very good\neight_four_four = 8-4-4');
const sample = {
  key: 'books', label: 'Books', showAtSignup: false,
  registrationFields: [],
  productTypes: [{ key: 'textbook', label: 'School textbook', fields: ['category', 'author', 'grade'], legacy: ['textbook'] }],
  productAttributes: [
    { key: 'category', label: 'Kind of book', type: 'text', maxLength: 60 },
    { key: 'author', label: 'Author', type: 'text', suggestions: ['A', 'B'] },
    { key: 'condition', label: 'Condition', type: 'select', options: [{ value: 'new', label: 'New' }, { value: 'good', label: 'Good' }] },
    { key: 'isbn', label: 'ISBN', type: 'isbn' },
    { key: 'grade', label: 'Grade', type: 'text', hidden: true },
  ],
  settings: { variants: { enabled: false }, cardFields: ['author'], feed: { apparel: false, category: '543543', gtinField: 'isbn', brandFields: ['author'] }, icon: 'book' },
};
const form = vf.toForm(sample, true);
check('vertical: saved fields are locked', form.fields.every((x) => x.saved));
check('vertical: item types hide the always-there field', form.types[0].fields.join() === 'author,grade');
const back = vf.toPayload(form);
check('vertical: form and back keeps the fields', JSON.stringify(back.productAttributes) === JSON.stringify(sample.productAttributes), JSON.stringify(back.productAttributes));
check('vertical: form and back keeps the settings', JSON.stringify(back.settings) === JSON.stringify(sample.settings));
check('vertical: a good form has no problems', vf.formProblems(form).length === 0, vf.formProblems(form).join(' '));
check('vertical: a blank form says what is missing', vf.formProblems(vf.blankForm()).length >= 3);
check('vertical: one choice is not enough', vf.formProblems({ ...form, fields: [{ ...vf.emptyField(), key: 'x1', label: 'X', type: 'select', choices: 'Only' }] }).some((x) => x.includes('two choices')));
check('vertical: at most 3 card fields', vf.toggleIn(['a', 'b', 'c'], 'd', 3).length === 3 && vf.toggleIn(['a', 'b'], 'a').join() === 'b');

// No two files in the portal share a name (Chief's rule)
const names = files(SRC).map((x) => x.split(/[\\/]/).pop().replace(/\.\w+$/, '').toLowerCase());
const dupes = names.filter((n, i) => names.indexOf(n) !== i);
check('no two files share a name', dupes.length === 0, dupes.join(', '));

console.log(failed === 0 ? 'ALL PASS' : `${failed} FAIL`);
process.exit(failed === 0 ? 0 : 1);
