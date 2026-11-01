// src/core/rules/versionRules.ts
// App version numbers like "1.10.0", compared number by number (1.10.0 is newer than 1.9.2).
// Same rules as reja src/services/appSettingsRules.js. Pure: imports nothing.

const VERSION = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

export function isVersion(v: string): boolean {
  return VERSION.test(v);
}

// 1 = a is newer, -1 = older, 0 = same. Unreadable versions count as the same (0), so they never block anything.
export function compareVersions(a: string, b: string): number {
  const x = VERSION.exec(a);
  const y = VERSION.exec(b);
  if (!x || !y) return 0;
  for (let i = 1; i <= 3; i += 1) {
    const d = Number(x[i]) - Number(y[i]);
    if (d !== 0) return d > 0 ? 1 : -1;
  }
  return 0;
}
