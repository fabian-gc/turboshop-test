// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchUnifiedCatalog } from '@/lib/providers';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const page = Number(searchParams.get('page') ?? '1') || 1;
  const limit = Number(searchParams.get('limit') ?? '12') || 12;

  const search = searchParams.get('search') ?? undefined;
  const brand = searchParams.get('brand') ?? undefined;
  const model = searchParams.get('model') ?? undefined;

  const yearFromParam = searchParams.get('yearFrom');
  const yearToParam = searchParams.get('yearTo');

  const yearFrom =
    yearFromParam && !Number.isNaN(Number(yearFromParam))
      ? Number(yearFromParam)
      : undefined;

  const yearTo =
    yearToParam && !Number.isNaN(Number(yearToParam))
      ? Number(yearToParam)
      : undefined;

  try {
    const data = await fetchUnifiedCatalog(page, limit, {
      search,
      brand,
      model,
      yearFrom,
      yearTo,
    });

    return NextResponse.json({
      data,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error en GET /api/products:', error);
    return NextResponse.json(
      { error: 'Error fetching catalog' },
      { status: 500 }
    );
  }
}
