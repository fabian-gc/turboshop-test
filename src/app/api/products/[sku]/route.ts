import { NextRequest, NextResponse } from 'next/server';
import { fetchUnifiedCatalog } from '@/lib/providers';
import type { ProductSummary } from '@/lib/types';

// Opcional, pero suele ser útil para APIs que consultan datos externos
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ sku: string }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { sku } = await context.params;
  const decodedSku = decodeURIComponent(sku);

  const catalog = await fetchUnifiedCatalog(1, 500);
  const product: ProductSummary | undefined = catalog.find(
    (item) => item.sku === decodedSku,
  );

  if (!product) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(product);
}
