import { client } from './sanity';

export async function sanityFetch(query: string, params?: any) {
  try {
    return await client.fetch(query, params);
  } catch (error) {
    console.error('Sanity fetch error:', error);
    return null;
  }
}