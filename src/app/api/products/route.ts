// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchUnifiedCatalog } from '@/lib/providers';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const rawPage = Number(searchParams.get('page') ?? '1') || 1;
  const page = Math.max(1, rawPage); // nunca menor a 1
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
    // 1) Traemos catálogo unificado filtrado (sin paginar)
    //    Usa un límite razonable (500 está bien para la demo).
    const unifiedCatalog = await fetchUnifiedCatalog(1, 500, {
      search,
      brand,
      model,
      yearFrom,
      yearTo,
    });

    const total = unifiedCatalog.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // 2) Ajustamos la página pedida al rango [1, totalPages]
    const safePage = Math.min(page, totalPages);

    // 3) Hacemos slice según safePage
    const start = (safePage - 1) * limit;
    const end = start + limit;
    const pageItems = unifiedCatalog.slice(start, end);

    return NextResponse.json({
      data: pageItems,
      page: safePage,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error('Error en GET /api/products:', error);
    return NextResponse.json(
      { error: 'Error fetching catalog' },
      { status: 500 },
    );
  }
}
