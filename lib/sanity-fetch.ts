export async function sanityFetch(query: string, params?: any) {
  try {
    // Use direct Sanity client instead of API route during build
    if (typeof window === 'undefined') {
      const { createClient } = await import('@sanity/client');
      const client = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
        token: process.env.SANITY_API_TOKEN,
        useCdn: false,
        apiVersion: '2023-05-03'
      });
      return await client.fetch(query, params);
    }
    
    // Use API route in browser
    const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/sanity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, params })
    });
    
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (error) {
    console.error('Sanity fetch error:', error);
    return null;
  }
}