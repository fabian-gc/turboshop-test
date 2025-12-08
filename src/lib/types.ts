// src/lib/types.ts

export type ProviderId = 'autopartsplus' | 'repuestosmax' | 'globalparts';

export type ProviderOffer = {
  provider: ProviderId;
  price: number;
  currency: string;
  stock: number;
  lastUpdated: string; // ISO string
};

export type ProductSummary = {
  sku: string;
  name: string;
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  thumbnailUrl?: string;
  offers: ProviderOffer[];
};

export type ProductDetail = ProductSummary & {
  description?: string;
  specs?: Record<string, string>;
};
