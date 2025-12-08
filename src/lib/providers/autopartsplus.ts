// src/lib/providers/autopartsplus.ts
import { providerFetch } from './httpClient';
import {
  ProductSummary,
  ProductDetail,
  ProviderOffer,
} from '@/lib/types';

const PROVIDER_ID = 'autopartsplus' as const;

interface AutoPartsPlusItem {
  unit_price: number;
  currency_code: string;
  qty_available: number;
  fits_vehicles?: string[];
  spec_keys?: string[];
  spec_values?: string[];
  sku: string;
  title: string;
  brand_name: string;
  category_name?: string;
  img_urls?: string[];
  desc?: string;
}

function extractYearRangeFromFits(
  fitsVehicles?: string[],
): {
  yearFrom?: number;
  yearTo?: number;
} {
  if (!fitsVehicles || fitsVehicles.length === 0) return {};

  const first = fitsVehicles[0]; // "Kia Telluride 2014-2015 2.4L"
  const match = first.match(/(\d{4})-(\d{4})/);
  if (!match) return {};

  const [, fromStr, toStr] = match;
  const yearFrom = Number(fromStr);
  const yearTo = Number(toStr);

  return {
    yearFrom: Number.isFinite(yearFrom) ? yearFrom : undefined,
    yearTo: Number.isFinite(yearTo) ? yearTo : undefined,
  };
}

function mapAutoPartsPlusItemToProduct(
  item: AutoPartsPlusItem,
): ProductSummary {
  const offer: ProviderOffer = {
    provider: PROVIDER_ID,
    price: item.unit_price,
    currency: item.currency_code,
    stock: item.qty_available,
    lastUpdated: new Date().toISOString(),
  };

  const { yearFrom, yearTo } = extractYearRangeFromFits(
    item.fits_vehicles,
  );

  // specs como diccionario simple (type, etc.)
  const specs: Record<string, string> = {};
  if (
    Array.isArray(item.spec_keys) &&
    Array.isArray(item.spec_values) &&
    item.spec_keys.length === item.spec_values.length
  ) {
    for (let i = 0; i < item.spec_keys.length; i++) {
      const key = item.spec_keys[i];
      const value = item.spec_values[i];
      if (typeof key === 'string' && typeof value === 'string') {
        specs[key] = value;
      }
    }
  }

  return {
    sku: item.sku,
    name: item.title,
    brand: item.brand_name,
    model: item.category_name, // podrías dejar undefined si prefieres
    yearFrom,
    yearTo,
    thumbnailUrl: Array.isArray(item.img_urls)
      ? item.img_urls[0]
      : undefined,
    offers: [offer],
  };
}

export async function getAutoPartsPlusCatalog(
  page: number,
  limit: number,
): Promise<ProductSummary[]> {
  const json = await providerFetch(
    `/api/autopartsplus/catalog?page=${page}&limit=${limit}`,
  );

  const parts = Array.isArray(json.parts)
    ? (json.parts as AutoPartsPlusItem[])
    : [];

  return parts.map(mapAutoPartsPlusItemToProduct);
}

export async function getAutoPartsPlusBySku(
  sku: string,
): Promise<ProductDetail | null> {
  const json = await providerFetch(
    `/api/autopartsplus/parts?sku=${encodeURIComponent(sku)}`,
  );

  const parts = Array.isArray(json.parts)
    ? (json.parts as AutoPartsPlusItem[])
    : [];
  if (parts.length === 0) return null;

  const summary = mapAutoPartsPlusItemToProduct(parts[0]);

  return {
    ...summary,
    description: parts[0].desc,
    // podrías agregar specs aquí también si quisieras
  };
}
