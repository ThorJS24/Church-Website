import { sanityFetch } from './sanity-fetch';

export async function fetchSanityData(query: string, params?: any) {
  return await sanityFetch(query, params);
}

export async function batchFetchSanityData(queries: Array<{ key: string; query: string; params?: any }>) {
  try {
    const results = await Promise.allSettled(
      queries.map(({ query, params }) => sanityFetch(query, params))
    );
    
    const data: Record<string, any> = {};
    queries.forEach(({ key }, index) => {
      const result = results[index];
      data[key] = result.status === 'fulfilled' ? result.value : null;
    });
    
    return data;
  } catch (error) {
    console.error('Batch fetch error:', error);
    // Return fallback data structure
    const fallbackData: Record<string, any> = {};
    queries.forEach(({ key }) => {
      fallbackData[key] = null;
    });
    return fallbackData;
  }
}

// Helper function to get site settings with fallback
export async function getSiteSettings() {
  const query = `*[_type == "siteSettings"][0] {
    churchName,
    tagline,
    statistics,
    address,
    phoneNumber,
    email,
    youtubeChannelUrl,
    facebookUrl,
    instagramUrl,
    googleMapsUrl,
    whatsappGroupUrl
  }`;
  
  const settings = await sanityFetch(query);
  
  // Return fallback if no settings found
  if (!settings) {
    return {
      churchName: 'Salem Primitive Baptist Church',
      tagline: 'A place where faith meets community, and hope comes alive',
      address: '223/838, Near north post office, Kannangurichi main road, Chinnathirupathi, Salem TN, PIN- 636008',
      phoneNumber: '+91 94871 62485',
      email: 'contact@salemprimitivebaptist.org',
      statistics: {
        members: '500+',
        yearsServing: '25+',
        weeklyServices: '3',
        ministries: '15+'
      }
    };
  }
  
  return settings;
}

// Helper function to get announcements with fallback
export async function getAnnouncements(limit = 3) {
  const query = `*[_type == "announcement"] | order(_createdAt desc)[0...${limit}]`;
  const announcements = await sanityFetch(query);
  return announcements || [];
}