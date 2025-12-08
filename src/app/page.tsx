// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ProductSummary } from '@/lib/types';

const LIMIT = 12;
const REFRESH_MS = 15000; // 15 segundos de polling

export default function HomePage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  const [loading, setLoading] = useState(false);

  // Carga + polling
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      });

      if (search.trim()) params.set('search', search.trim());
      if (brand.trim()) params.set('brand', brand.trim());
      if (model.trim()) params.set('model', model.trim());
      if (yearFrom.trim()) params.set('yearFrom', yearFrom.trim());
      if (yearTo.trim()) params.set('yearTo', yearTo.trim());

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();

      if (!active) return;

      setProducts(json.data ?? []);
      setLoading(false);
    }

    load();
    const id = setInterval(load, REFRESH_MS);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [page, search, brand, model, yearFrom, yearTo]);

  const hasPrev = page > 1;
  const hasNext = products.length === LIMIT; // heurística simple

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">
            Marketplace de Repuestos
          </h1>
          <p className="text-sm text-slate-300">
            Catálogo unificado desde AutoPartsPlus, RepuestosMax
            y GlobalParts. Actualizado en tiempo real.
          </p>
        </header>

        {/* Filtros */}
        <section className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1); // reset de página al aplicar filtros
            }}
          >
            <div className="flex flex-col">
              <label className="text-xs text-slate-400">
                Búsqueda
              </label>
              <input
                className="h-9 rounded-md border border-slate-700 bg-slate-900 px-2 text-sm outline-none focus:border-sky-500"
                placeholder="SKU, producto, marca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-slate-400">
                Marca
              </label>
              <input
                className="h-9 rounded-md border border-slate-700 bg-slate-900 px-2 text-sm outline-none focus:border-sky-500"
                placeholder="Ej: K&N, Bosch..."
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-slate-400">
                Categoría
              </label>
              <input
                className="h-9 rounded-md border border-slate-700 bg-slate-900 px-2 text-sm outline-none focus:border-sky-500"
                placeholder="Motor, Escape..."
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-slate-400">
                Año desde
              </label>
              <input
                type="number"
                className="h-9 w-24 rounded-md border border-slate-700 bg-slate-900 px-2 text-sm outline-none focus:border-sky-500"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-slate-400">
                Año hasta
              </label>
              <input
                type="number"
                className="h-9 w-24 rounded-md border border-slate-700 bg-slate-900 px-2 text-sm outline-none focus:border-sky-500"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="h-9 rounded-md bg-sky-600 px-4 text-sm font-medium hover:bg-sky-500"
            >
              Aplicar filtros
            </button>
          </form>

          {loading && (
            <p className="mt-2 text-xs text-slate-400">
              Actualizando catálogo...
            </p>
          )}
        </section>

        {/* Tabla catálogo */}
        <section className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  SKU
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Producto
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Marca
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Precio mínimo
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Stock total
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Proveedores
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const prices = p.offers
                  .map((o) => o.price)
                  .filter((v) => typeof v === 'number') as number[];

                const minPrice =
                  prices.length > 0
                    ? Math.min(...prices)
                    : undefined;

                const totalStock = p.offers.reduce(
                  (acc, o) => acc + (o.stock ?? 0),
                  0
                );

                const providers = Array.from(
                  new Set(p.offers.map((o) => o.provider))
                ).join(', ');

                return (
                  <tr
                    key={p.sku}
                    className="border-t border-slate-800 hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link
                        href={`/product/${p.sku}`}
                        className="hover:underline"
                      >
                        {p.sku}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/product/${p.sku}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        {p.thumbnailUrl && (
                          <img
                            src={p.thumbnailUrl}
                            alt={p.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">
                            {p.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {p.model}
                            {p.yearFrom &&
                              p.yearTo &&
                              ` · ${p.yearFrom}-${p.yearTo}`}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">{p.brand}</td>
                    <td className="px-4 py-3">
                      {minPrice !== undefined
                        ? minPrice.toLocaleString('es-CL', {
                            style: 'currency',
                            currency:
                              p.offers[0]?.currency ?? 'CLP',
                          })
                        : '-'}
                    </td>
                    <td className="px-4 py-3">{totalStock}</td>
                    <td className="px-4 py-3 text-xs">
                      {providers}
                    </td>
                  </tr>
                );
              })}

              {!loading && products.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-400"
                  >
                    No se encontraron productos con los filtros
                    actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Paginación */}
        <footer className="mt-4 flex items-center justify-between text-sm text-slate-300">
          <div>
            Página <span className="font-semibold">{page}</span>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-md border border-slate-700 px-3 py-1 text-xs disabled:opacity-40"
              onClick={() =>
                setPage((p) => Math.max(1, p - 1))
              }
              disabled={!hasPrev}
            >
              ← Anterior
            </button>
            <button
              className="rounded-md border border-slate-700 px-3 py-1 text-xs disabled:opacity-40"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
            >
              Siguiente →
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
