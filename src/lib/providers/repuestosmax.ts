// src/lib/providers/repuestosmax.ts
import { providerFetch } from './httpClient';
import {
  ProductSummary,
  ProductDetail,
  ProviderOffer,
} from '@/lib/types';

const PROVIDER_ID = 'repuestosmax' as const;

interface RepuestosMaxAnios {
  desde?: string | number;
  hasta?: string | number;
}

interface RepuestosMaxVehiculo {
  anios?: RepuestosMaxAnios;
}

interface RepuestosMaxCompatibilidad {
  vehiculos?: RepuestosMaxVehiculo[];
}

interface RepuestosMaxPrecio {
  valor?: number;
  moneda?: string;
}

interface RepuestosMaxInventario {
  cantidad?: number;
}

interface RepuestosMaxMarca {
  nombre?: string;
}

interface RepuestosMaxCategoria {
  nombre?: string;
}

interface RepuestosMaxInformacionBasica {
  nombre?: string;
  marca?: RepuestosMaxMarca;
  categoria?: RepuestosMaxCategoria;
  descripcion?: string;
}

interface RepuestosMaxImagen {
  url?: string;
}

interface RepuestosMaxMultimedia {
  imagenes?: RepuestosMaxImagen[];
}

interface RepuestosMaxIdentificacion {
  sku?: string;
}

interface RepuestosMaxItem {
  compatibilidad?: RepuestosMaxCompatibilidad;
  precio?: RepuestosMaxPrecio;
  inventario?: RepuestosMaxInventario;
  identificacion?: RepuestosMaxIdentificacion;
  informacionBasica?: RepuestosMaxInformacionBasica;
  multimedia?: RepuestosMaxMultimedia;
}

function extractYearRangeFromRepuestosMax(
  item: RepuestosMaxItem,
): {
  yearFrom?: number;
  yearTo?: number;
} {
  const vehiculos = item.compatibilidad?.vehiculos;
  if (!Array.isArray(vehiculos) || vehiculos.length === 0) {
    return {};
  }

  const anios = vehiculos[0]?.anios;
  if (!anios) return {};

  const yearFrom = Number(anios.desde);
  const yearTo = Number(anios.hasta);

  return {
    yearFrom: Number.isFinite(yearFrom) ? yearFrom : undefined,
    yearTo: Number.isFinite(yearTo) ? yearTo : undefined,
  };
}

function mapRepuestosMaxItemToProduct(
  item: RepuestosMaxItem,
): ProductSummary {
  const offer: ProviderOffer = {
    provider: PROVIDER_ID,
    price: item.precio?.valor ?? 0,
    currency: item.precio?.moneda ?? 'CLP',
    stock: item.inventario?.cantidad ?? 0,
    lastUpdated: new Date().toISOString(),
  };

  const { yearFrom, yearTo } = extractYearRangeFromRepuestosMax(
    item,
  );

  const imagenes = item.multimedia?.imagenes;

  return {
    sku: item.identificacion?.sku ?? '',
    name: item.informacionBasica?.nombre ?? '',
    brand: item.informacionBasica?.marca?.nombre ?? '',
    model: item.informacionBasica?.categoria?.nombre,
    yearFrom,
    yearTo,
    thumbnailUrl: Array.isArray(imagenes)
      ? imagenes[0]?.url
      : undefined,
    offers: [offer],
  };
}

export async function getRepuestosMaxCatalog(
  page: number,
  limit: number,
): Promise<ProductSummary[]> {
  const json = await providerFetch(
    `/api/repuestosmax/catalogo?pagina=${page}&limite=${limit}`,
  );

  const productos = Array.isArray(json.productos)
    ? (json.productos as RepuestosMaxItem[])
    : [];

  return productos.map(mapRepuestosMaxItemToProduct);
}

export async function getRepuestosMaxBySku(
  skuOrCode: string,
): Promise<ProductDetail | null> {
  // asunción: la API acepta tanto OEM como SKU en "codigo"
  const json = await providerFetch(
    `/api/repuestosmax/productos?codigo=${encodeURIComponent(
      skuOrCode,
    )}`,
  );

  const productos =
    json?.resultado?.productos &&
    Array.isArray(json.resultado.productos)
      ? (json.resultado.productos as RepuestosMaxItem[])
      : [];

  if (productos.length === 0) return null;

  const summary = mapRepuestosMaxItemToProduct(productos[0]);

  return {
    ...summary,
    description:
      productos[0].informacionBasica?.descripcion,
  };
}
