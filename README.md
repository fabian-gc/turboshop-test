# 🚗 Turboshop Marketplace – Prueba Técnica  
Marketplace de repuestos en tiempo real con backend unificado y frontend en Next.js.

## ✨ Descripción General

Este proyecto implementa un **marketplace de repuestos automotrices** que unifica el catálogo de tres proveedores externos:

- **AutoPartsPlus**  
- **RepuestosMax**  
- **GlobalParts**

Cada proveedor expone APIs con esquemas distintos, latencias variables y fallos intermitentes.  
El objetivo fue construir una arquitectura robusta que:

- Unifique todos los formatos en un **contrato propio estable**.  
- Exponga un backend interno accesible desde el frontend.  
- Entregue al usuario **búsqueda, filtros, paginación** y **actualización automática en tiempo real**.  
- Soporte fallos parciales sin interrumpir la consulta del catálogo.

---

## 🧱 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, TailwindCSS |
| **Backend interno** | Next.js API Routes |
| **Normalización de datos** | TypeScript + adaptadores por proveedor |
| **Actualización en tiempo real** | Polling inteligente (15s) |
| **Despliegue recomendado** | Railway / Vercel |

---

## 🗂️ Estructura del proyecto

```bash
/src
 ├── app
 │   ├── api
 │   │   └── products
 │   │        ├── route.ts          ← catálogo unificado + filtros
 │   │        └── [sku]/route.ts    ← detalle de producto unificado
 │   ├── product/[sku]/page.tsx     ← vista de detalle
 │   └── page.tsx                   ← catálogo con filtros + polling
 │
 ├── lib
 │   ├── types.ts                   ← contrato unificado: ProductSummary
 │   └── providers
 │        ├── index.ts              ← merge + filtros + normalización
 │        ├── autopartsplus.ts
 │        ├── repuestosmax.ts
 │        └── globalparts.ts
 │
 └── styles / components...
