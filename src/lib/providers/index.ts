// src/lib/providers/index.ts
import { ProductSummary } from '../types';
import { getAutoPartsPlusCatalog } from './autopartsplus';
import { getRepuestosMaxCatalog } from './repuestosmax';
import { getGlobalPartsCatalog } from './globalparts';

export type CatalogFilters = {
  search?: string;
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
};

/**
 * Obtiene y normaliza el catálogo desde los 3 proveedores.
 * - Merge por SKU
 * - Junta las offers
 * - Aplica filtros en memoria
 */
export async function fetchUnifiedCatalog(
  page: number,
  limit: number,
  filters?: CatalogFilters
): Promise<ProductSummary[]> {
  const [apRes, rmRes, gpRes] = await Promise.allSettled([
    getAutoPartsPlusCatalog(page, limit),
    getRepuestosMaxCatalog(page, limit),
    getGlobalPartsCatalog(page, limit),
  ]);

  const all: ProductSummary[] = [];

  if (apRes.status === 'fulfilled') all.push(...apRes.value);
  if (rmRes.status === 'fulfilled') all.push(...rmRes.value);
  if (gpRes.status === 'fulfilled') all.push(...gpRes.value);

  // Merge por SKU
  const mergedBySku = new Map<string, ProductSummary>();

  for (const p of all) {
    const existing = mergedBySku.get(p.sku);

    if (!existing) {
      mergedBySku.set(p.sku, p);
    } else {
      const merged: ProductSummary = {
        ...existing,
        offers: [...existing.offers, ...p.offers],
      };
      mergedBySku.set(p.sku, merged);
    }
  }

  let products = Array.from(mergedBySku.values());

  // === Filtros ===
  if (filters) {
    const search = filters.search?.toLowerCase().trim();
    const brand = filters.brand?.toLowerCase().trim();
    const model = filters.model?.toLowerCase().trim();
    const { yearFrom, yearTo } = filters;

    products = products.filter((p) => {
      const matchesSearch =
        !search ||
        [p.sku, p.name, p.brand, p.model]
          .filter(Boolean)
          .some((field) =>
            (field as string).toLowerCase().includes(search)
          );

      const matchesBrand =
        !brand || (p.brand ?? '').toLowerCase().includes(brand);

      const matchesModel =
        !model || (p.model ?? '').toLowerCase().includes(model);

      const matchesYearFrom =
        !yearFrom || (p.yearTo ?? p.yearFrom ?? 0) >= yearFrom;

      const matchesYearTo =
        !yearTo || (p.yearFrom ?? p.yearTo ?? 9999) <= yearTo;

      return (
        matchesSearch &&
        matchesBrand &&
        matchesModel &&
        matchesYearFrom &&
        matchesYearTo
      );
    });
  }

  return products;
}
