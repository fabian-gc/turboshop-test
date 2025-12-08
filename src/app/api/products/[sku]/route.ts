// src/app/api/products/[sku]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchUnifiedCatalog } from '@/lib/providers';

type RouteParams = {
  params: {
    sku: string;
  };
};

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  const sku = params.sku;

  try {
    const catalog = await fetchUnifiedCatalog(1, 200);
    const product = catalog.find((p) => p.sku === sku);

    if (!product) {
      console.log('SKU no encontrado en catálogo:', sku);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error en GET /api/products/[sku]:', error);
    return NextResponse.json(
      { error: 'Error fetching product detail' },
      { status: 500 }
    );
  }
}
