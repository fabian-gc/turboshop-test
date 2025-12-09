import { NextRequest, NextResponse } from 'next/server';
import { fetchUnifiedCatalog } from '@/lib/providers';
import type { ProductSummary } from '@/lib/types';

// Para evitar caché agresiva si fuera necesario
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ sku: string }> }
) {
  // En Next 16, el validador está esperando que "params" sea un Promise<{ sku }>
  const { sku } = await context.params;
  const decodedSku = decodeURIComponent(sku);

  // Traes un catálogo razonablemente grande y buscas el SKU
  const catalog = await fetchUnifiedCatalog(1, 500);
  const product = catalog.find(
    (item: ProductSummary) => item.sku === decodedSku,
  );

  if (!product) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(product);
}
