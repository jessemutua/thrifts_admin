// src/core/types/adminTypes.ts
// The shapes the API sends back (reja src/routes/admin.js). The only place they are described.

export type Bucket = 'trial' | 'pilot' | 'paid' | 'grace' | 'pilot_ended' | 'overdue' | 'not_started' | 'suspended';

export type OwnerContact = { id: string; name: string | null; email: string | null };

export type ShopRow = {
  id: string;
  name: string;
  parentId: string | null;
  mainShop: { id: string; name: string } | null;
  status: string;
  bucket: Bucket;
  onPilot: boolean;
  expiresAt: string | null;
  createdAt: string;
  salesChannel: string;
  isTest: boolean; // marked as a test shop: left out of Home, hidden from the list unless asked for
  lastSaleAt: string | null;
  owner: OwnerContact | null;
};

export type ShopListPage = { shops: ShopRow[]; total: number; page: number; pages: number };

export type Overview = {
  generatedAt: string;
  shops: {
    total: number;
    branches: number;
    newThisWeek: number;
    newThisMonth: number;
    byBucket: Record<Bucket, number>;
    sellingLast7Days: number;
    quiet: number;
  };
  money: { thisMonthKes: number; payments: number; estimatedPayments: number };
  sales: { last7Days: { count: number; totalKes: number }; daily: { date: string; count: number; total: number }[] };
  people: { accounts: number | null; newThisWeek: number | null; members: number };
  feedbackLast7Days: MoodTotals;
  lists: Record<'endingSoon' | 'overdue' | 'quiet', { total: number; shops: ShopRow[] }>;
};

export type MoodTotals = { happy: number; okay: number; unhappy: number };

export type ShopPerson = { id: string; role: string; name: string | null; email: string | null; joinedAt: string; paused: boolean };

export type ShopDetail = {
  shop: ShopRow & {
    slug: string | null;
    logoUrl: string | null;
    location: string | null;
    openingHours: string | null;
    contactPhone: string | null;
    vertical: string;
    cashMode: string;
    paymentSetUp: boolean;
    deleted: boolean;
  };
  branches: { id: string; name: string; subscriptionStatus: string; createdAt: string }[];
  people: ShopPerson[];
  usage: {
    products: number;
    published: number;
    paidSalesLast30Days: number;
    salesKesLast30Days: number;
    storeVisitsLast30Days: number;
    waitingApprovals: number;
    bulkUploads: number;
  };
  recentFeedback: { userId: string; kenyaDate: string; mood: number; note: string | null; wish: string | null; name: string | null }[];
};

export type PlanChange = {
  changedAt: string;
  source: string;
  actor: string | null;
  reference: string | null;
  note: string | null;
  amountKes: number | null;
  oldStatus: string | null;
  newStatus: string;
  oldExpiresAt: string | null;
  newExpiresAt: string | null;
};

export type ShopNote = { id: string; body: string; createdAt: string; author: OwnerContact };

export type Person = {
  id: string;
  signIn: 'google' | 'password';
  name: string | null;
  email: string | null;
  emailConfirmed: boolean;
  createdAt: string;
  isAdmin: boolean;
  shops: { id: string; name: string; isBranch: boolean; role: string; paused: boolean }[];
};

export type FeedbackEntry = {
  id: string;
  shop: { id: string; name: string };
  person: { id: string; name: string | null };
  date: string;
  mood: number;
  note: string | null;
  wish: string | null;
};

export type FeedbackPage = { days: number; totals: MoodTotals; entries: FeedbackEntry[] };

export type SalesWindow = { count: number; totalKes: number; shops: number };
export type MonthRow = { month: string; label: string; gmvKes: number; sales: number; activeShops: number; newShops: number };
export type Metrics = {
  generatedAt: string;
  merchants: { stores: number; mainShops: number; sellingLast30Days: number; everSold: number };
  stock: {
    valueKes: number; fullValueKes: number; costKes: number; profitKes: number; costCoversAll: boolean;
    itemsWithoutCost: number; units: number; shopsWithStock: number; avgValuePerShopKes: number;
  };
  products: { live: number; inStock: number; outOfStock: number; onStorePages: number };
  sales: {
    allTime: { count: number; totalKes: number; avgBasketKes: number };
    last30: SalesWindow; prev30: SalesWindow; growthPct: number | null; mpesaSharePct: number | null;
    cash: { count: number; totalKes: number }; mpesa: { count: number; totalKes: number };
  };
  storeVisitsLast30Days: number;
  monthly: MonthRow[];
};

export type Share = { key: string; count: number; pct: number | null };
export type OnlineStores = {
  generatedAt: string;
  stores: { total: number; withPage: number; live: number; channel: { shop: number; online: number; both: number } };
  products: { published: number };
  visits: {
    last30: number; storePages: number; productPages: number; prev30: number; growthPct: number | null;
    storesVisited: number; daily: { date: string; count: number }[];
  };
  sources: Share[];
  genders: Share[];
  topStores: { id: string; name: string; slug: string | null; visits: number; published: number }[];
  topProducts: { id: string; name: string; priceKes: number; imageUrl: string | null; visits: number; shop: { id: string; name: string } }[];
};

export type AppVersions = { minVersion: string; latestVersion: string; downloadUrl: string };
export type AppSettings = { versions: AppVersions; from: 'portal' | 'code'; updatedAt: string | null; updatedBy: string | null };
