import { createClient } from '@sanity/client';
import { cache } from './performance';

// Server-side client for API routes
const serverClient = createClient({
  projectId: 'jon2drzn',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  stega: {
    enabled: false,
  },
});

// Client-side fetch using API proxy
async function fetchFromProxy(query: string, params: any = {}) {
  const queryString = new URLSearchParams({
    query,
    ...(Object.keys(params).length > 0 && { params: JSON.stringify(params) })
  }).toString();
  
  const response = await fetch(`/api/sanity-proxy?${queryString}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Optimized fetch with caching
export async function fetchSanityData(query: string, params: any = {}, ttl: number = 300000) {
  const cacheKey = `sanity:${query}:${JSON.stringify(params)}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Use proxy for client-side requests, direct client for server-side
    const data = typeof window !== 'undefined' 
      ? await fetchFromProxy(query, params)
      : await serverClient.fetch(query, params);
    
    cache.set(cacheKey, data, ttl);
    return data;
  } catch (error) {
    console.error('Sanity fetch error:', error);
    throw error;
  }
}

// Batch fetch multiple queries
export async function batchFetchSanityData(queries: Array<{ query: string; params?: any; key: string }>) {
  const promises = queries.map(async ({ query, params, key }) => {
    try {
      const data = await fetchSanityData(query, params);
      return { key, data, error: null };
    } catch (error) {
      return { key, data: null, error };
    }
  });

  const results = await Promise.allSettled(promises);
  return results.reduce((acc, result, index) => {
    const { key } = queries[index];
    if (result.status === 'fulfilled') {
      acc[key] = result.value.data;
    } else {
      acc[key] = null;
      console.error(`Failed to fetch ${key}:`, result.reason);
    }
    return acc;
  }, {} as Record<string, any>);
}

export { serverClient as client };