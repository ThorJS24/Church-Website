export async function sanityFetch(query: string, params?: any) {
  try {
    // Use direct Sanity client during build or server-side
    if (typeof window === 'undefined') {
      const { sanityClient } = await import('./sanity');
      return await sanityClient.fetch(query, params || {});
    }
    
    // Use API route in browser
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_CDN_URL || 'http://localhost:3000';
      
    const response = await fetch(`${baseUrl}/api/sanity`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ query, params: params || {} })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`API request failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Sanity fetch error:', error);
    
    // Return fallback data for critical queries
    if (query.includes('siteSettings')) {
      return {
        churchName: 'Salem Primitive Baptist Church',
        tagline: 'A place where faith meets community',
        address: '223/838, Near north post office, Kannangurichi main road, Chinnathirupathi, Salem TN, PIN- 636008',
        phoneNumber: '+91 94871 62485',
        email: 'contact@salemprimitivebaptist.org'
      };
    }
    
    if (query.includes('announcement')) {
      return [];
    }
    
    return null;
  }
}