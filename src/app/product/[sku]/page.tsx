// src/app/product/[sku]/page.tsx
import Link from 'next/link';
import { fetchUnifiedCatalog } from '@/lib/providers';

type PageProps = {
  params: Promise<{
    sku: string;
  }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { sku: rawSku } = await params;
  const sku = decodeURIComponent(rawSku ?? '');

  if (!sku) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <Link
            href="/"
            className="text-sm text-sky-400 hover:underline"
          >
            ← Volver al catálogo
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">
            SKU inválido
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            La ruta no incluye un SKU válido.
          </p>
        </div>
      </main>
    );
  }

  const catalog = await fetchUnifiedCatalog(1, 200);
  const product = catalog.find((p) => p.sku === sku);

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <Link
            href="/"
            className="text-sm text-sky-400 hover:underline"
          >
            ← Volver al catálogo
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">
            Producto no encontrado
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            No se encontró información para el SKU{' '}
            <span className="font-mono">{sku}</span>.
          </p>
        </div>
      </main>
    );
  }

  const minPrice = product.offers.reduce<number | null>(
    (acc, o) =>
      typeof o.price === 'number'
        ? acc === null
          ? o.price
          : Math.min(acc, o.price)
        : acc,
    null
  );

  const totalStock = product.offers.reduce(
    (acc, o) => acc + (o.stock ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link
          href="/"
          className="text-sm text-sky-400 hover:underline"
        >
          ← Volver al catálogo
        </Link>

        <section className="mt-4 flex flex-col gap-6 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex gap-4">
            {product.thumbnailUrl && (
              <img
                src={product.thumbnailUrl}
                alt={product.name}
                className="h-24 w-24 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-semibold">
                {product.name}
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                <span className="font-mono">{product.sku}</span>
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {product.brand && (
                  <>
                    <span className="font-semibold">Marca:</span>{' '}
                    {product.brand}
                    {' · '}
                  </>
                )}
                {product.model && (
                  <>
                    <span className="font-semibold">
                      Categoría:
                    </span>{' '}
                    {product.model}
                    {' · '}
                  </>
                )}
                {product.yearFrom && product.yearTo && (
                  <>
                    <span className="font-semibold">
                      Años:
                    </span>{' '}
                    {product.yearFrom}-{product.yearTo}
                  </>
                )}
              </p>
              {minPrice !== null && (
                <p className="mt-2 text-lg font-semibold text-sky-300">
                  Desde{' '}
                  {minPrice.toLocaleString('es-CL', {
                    style: 'currency',
                    currency:
                      product.offers[0]?.currency ?? 'CLP',
                  })}{' '}
                  · Stock total: {totalStock}
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold">
              Ofertas por proveedor
            </h2>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900/70">
                  <tr>
                    <th className="px-4 py-2 text-left text-slate-300">
                      Proveedor
                    </th>
                    <th className="px-4 py-2 text-left text-slate-300">
                      Precio
                    </th>
                    <th className="px-4 py-2 text-left text-slate-300">
                      Stock
                    </th>
                    <th className="px-4 py-2 text-left text-slate-300">
                      Moneda
                    </th>
                    <th className="px-4 py-2 text-left text-slate-300">
                      Última actualización
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.offers.map((o, idx) => (
                    <tr
                      key={`${o.provider}-${idx}`}
                      className="border-t border-slate-800"
                    >
                      <td className="px-4 py-2 font-mono text-xs">
                        {o.provider}
                      </td>
                      <td className="px-4 py-2">
                        {typeof o.price === 'number'
                          ? o.price.toLocaleString('es-CL', {
                              style: 'currency',
                              currency:
                                o.currency ?? 'CLP',
                            })
                          : '-'}
                      </td>
                      <td className="px-4 py-2">
                        {o.stock ?? 0}
                      </td>
                      <td className="px-4 py-2">
                        {o.currency ?? 'CLP'}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-400">
                        {new Date(
                          o.lastUpdated
                        ).toLocaleString('es-CL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
