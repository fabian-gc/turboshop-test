// src/lib/providers/httpClient.ts

const BASE_URL =
  process.env.PROVIDERS_BASE_URL ??
  'https://web-production-84144.up.railway.app';

export async function providerFetch(path: string) {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    // Queremos info fresca, no cacheada
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Provider error on ${url}: ${res.status}`);
  }

  return res.json();
}
