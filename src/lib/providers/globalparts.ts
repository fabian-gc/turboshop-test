// src/lib/providers/globalparts.ts
import { providerFetch } from './httpClient';
import {
  ProductSummary,
  ProductDetail,
  ProviderOffer,
} from '@/lib/types';

const PROVIDER_ID = 'globalparts' as const;

function extractYearRangeFromGlobalParts(item: any): {
  yearFrom?: number;
  yearTo?: number;
} {
  const vehicles =
    item.VehicleCompatibility?.CompatibleVehicles;
  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return {};
  }

  const yr = vehicles[0]?.YearRange;
  if (!yr) return {};

  const yearFrom = Number(yr.StartYear);
  const yearTo = Number(yr.EndYear);

  return {
    yearFrom: Number.isFinite(yearFrom) ? yearFrom : undefined,
    yearTo: Number.isFinite(yearTo) ? yearTo : undefined,
  };
}

function mapGlobalPartsItemToProduct(item: any): ProductSummary {
  const header = item.ItemHeader ?? {};
  const skuRef = header.ExternalReferences?.SKU;

  const pricing = item.PricingInfo?.ListPrice;
  const availability = item.AvailabilityInfo?.QuantityInfo;

  const offer: ProviderOffer = {
    provider: PROVIDER_ID,
    price: pricing?.Amount,
    currency: pricing?.CurrencyCode ?? 'CLP',
    stock: availability?.AvailableQuantity ?? 0,
    lastUpdated: new Date().toISOString(),
  };

  const { yearFrom, yearTo } = extractYearRangeFromGlobalParts(
    item,
  );

  const productDetails = item.ProductDetails ?? {};
  const nameInfo = productDetails.NameInfo ?? {};
  const brandInfo = productDetails.BrandInfo ?? {};

  const images = item.MediaAssets?.Images;
  const thumbnailUrl = Array.isArray(images)
    ? images[0]?.ImageUrl
    : undefined;

  return {
    sku: skuRef?.Value,
    name: nameInfo.DisplayName ?? nameInfo.ShortName,
    brand: brandInfo.BrandName,
    model:
      productDetails.CategoryInfo?.PrimaryCategory?.Name ??
      undefined,
    yearFrom,
    yearTo,
    thumbnailUrl,
    offers: [offer],
  };
}

export async function getGlobalPartsCatalog(
  page: number,
  limit: number,
): Promise<ProductSummary[]> {
  const json = await providerFetch(
    `/api/globalparts/inventory/catalog?page=${page}&itemsPerPage=${limit}`,
  );

  const items =
    json?.ResponseEnvelope?.Body?.CatalogListing?.Items;
  if (!Array.isArray(items)) return [];

  return items.map(mapGlobalPartsItemToProduct);
}

export async function getGlobalPartsBySku(
  partNumber: string,
): Promise<ProductDetail | null> {
  const json = await providerFetch(
    `/api/globalparts/inventory/search?partNumber=${encodeURIComponent(
      partNumber,
    )}`,
  );

  const items =
    json?.ResponseEnvelope?.Body?.SearchResults?.Items;
  if (!Array.isArray(items) || items.length === 0) return null;

  const summary = mapGlobalPartsItemToProduct(items[0]);

  return {
    ...summary,
    description:
      items[0].ProductDetails?.Description?.FullText,
  };
}
