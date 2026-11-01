// src/core/services/portalRequests.ts
// One function per API route the portal uses, with the shape it returns. Screens never build addresses themselves.
import { adminCall, sessionCall } from './portalApi';
import type {
  AppSettings, AppVersions, FeedbackPage, Metrics, OnlineStores, Overview, Person, PlanChange, ShopDetail, ShopListPage, ShopNote,
} from '../types/adminTypes';

const enc = encodeURIComponent;

// ---- session ----
export const signInRequest = (email: string, password: string) => sessionCall<{ token: string }>('/admin-session', { email, password });
export const signOutRequest = () => sessionCall<{ ok: boolean }>('/admin-session/sign-out');

// ---- home ----
export const getOverview = () => adminCall<Overview>('GET', '/admin/overview');

export const getOnline = () => adminCall<OnlineStores>('GET', '/admin/online');
export const getMetrics = () => adminCall<Metrics>('GET', '/admin/metrics');

// ---- shops ----
export type ShopQuery = { q?: string; bucket?: string; sort?: string; page?: number; testOnly?: boolean };
export function getShops(query: ShopQuery) {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.bucket) params.set('bucket', query.bucket);
  if (query.sort) params.set('sort', query.sort);
  if (query.testOnly) params.set('test', 'only');
  if (query.page && query.page > 1) params.set('page', String(query.page));
  const qs = params.toString();
  return adminCall<ShopListPage>('GET', `/admin/shops${qs ? `?${qs}` : ''}`);
}
export const getShop = (id: string) => adminCall<ShopDetail>('GET', `/admin/shops/${enc(id)}`);
export const getShopHistory = (id: string) =>
  adminCall<{ history: PlanChange[] }>('GET', `/admin/shops/${enc(id)}/subscription-history?limit=50`);
export const setPilotRequest = (id: string, body: { endsOn: string; note?: string }) =>
  adminCall<unknown>('POST', `/admin/shops/${enc(id)}/pilot`, body);
export const markPaidRequest = (id: string, body: { months: number; reference: string; amountKes?: number; note?: string }) =>
  adminCall<{ applied: boolean; duplicate: boolean }>('POST', `/admin/shops/${enc(id)}/mark-paid`, body);
export const suspendRequest = (id: string, reason?: string) =>
  adminCall<unknown>('POST', `/admin/shops/${enc(id)}/suspend`, { reason });
export const liftRequest = (id: string, reason?: string) =>
  adminCall<unknown>('POST', `/admin/shops/${enc(id)}/lift-suspension`, { reason });
export const setTestShopRequest = (id: string, isTest: boolean) =>
  adminCall<{ isTest: boolean; shopsChanged: number }>('POST', `/admin/shops/${enc(id)}/test`, { isTest });
export const deleteShopRequest = (id: string, confirmName: string) =>
  adminCall<{ deleted: boolean; files: { removed: number; failed: number } }>('POST', `/admin/shops/${enc(id)}/delete`, { confirmName });

// ---- notes ----
export const getNotes = (id: string) => adminCall<{ notes: ShopNote[] }>('GET', `/admin/shops/${enc(id)}/notes`);
export const addNoteRequest = (id: string, body: string) => adminCall<{ note: ShopNote }>('POST', `/admin/shops/${enc(id)}/notes`, { body });
export const deleteNoteRequest = (noteId: string) => adminCall<unknown>('DELETE', `/admin/notes/${enc(noteId)}`);

// ---- people, feedback, app ----
export const getPeople = (q: string) => adminCall<{ people: Person[]; error?: string }>('GET', `/admin/people?q=${enc(q)}`);
export const getFeedback = (days: number) => adminCall<FeedbackPage>('GET', `/admin/feedback?days=${days}`);
export const getAppSettings = () => adminCall<AppSettings>('GET', '/admin/app-settings');
export const saveAppSettings = (v: AppVersions) => adminCall<AppSettings>('PUT', '/admin/app-settings', v);
